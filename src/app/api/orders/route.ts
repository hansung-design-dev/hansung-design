import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// 주문 내역 조회
export async function GET(request: NextRequest) {
  try {
    // 세션에서 사용자 정보 가져오기 (쿠키에서)
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 쿠키에서 사용자 ID 추출
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    // console.log('🔍 쿠키 정보:', cookies);

    const userId = cookies['user_id'];

    console.log('🔍 추출된 userId:', userId);

    if (!userId) {
      console.log('🔍 userId가 없음. 쿠키 헤더:', cookieHeader);
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    console.log('🔍 사용자 ID:', userId);

    // URL 파라미터에서 페이지네이션 정보 가져오기
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    console.log('🔍 주문 목록 조회 시작 - 사용자 ID:', userId);

    // 주문 목록 조회 (design_drafts 포함)
    const { data: orders, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        design_drafts (
          id,
          draft_category,
          file_name,
          created_at,
          is_approved
        ),
        order_details (
          id,
          name,
          price,
          quantity,
          district,
          panel_type,
          panel_info_id,
          panel_slot_snapshot,
          panel_slot_usage_id,
          period,
          selected_year,
          selected_month
        )
      `
      )
      .eq('user_auth_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Orders fetch error:', error);
      return NextResponse.json(
        { success: false, error: '주문 목록을 불러오는데 실패했습니다.' },
        { status: 500 }
      );
    }

    // 주문 상태별 개수 계산
    const { data: statusCounts } = await supabase
      .from('orders')
      .select('is_paid, is_checked')
      .eq('user_auth_id', userId);

    const statusSummary = {
      total: statusCounts?.length || 0,
      pending: statusCounts?.filter((o) => !o.is_paid).length || 0,
      confirmed:
        statusCounts?.filter((o) => o.is_paid && !o.is_checked).length || 0,
      completed:
        statusCounts?.filter((o) => o.is_paid && o.is_checked).length || 0,
    };

    // 주문 데이터를 프론트엔드 형식으로 변환
    const transformedOrders =
      orders?.map((order) => {
        console.log('🔍 주문 데이터 변환:', {
          orderId: order.id,
          orderNumber: order.order_number,
          createdAt: order.created_at,
          totalPrice: order.total_price,
          orderDetails: order.order_details?.map(
            (d: {
              id: string;
              display_start_date: string;
              display_end_date: string;
              panel_info: {
                address: string;
                nickname: string;
                panel_status: string;
                panel_type: string;
                region_gu?: { name: string };
                region_dong?: { name: string };
              };
            }) => ({
              id: d.id,
              displayStartDate: d.display_start_date,
              displayEndDate: d.display_end_date,
              panelInfo: d.panel_info,
            })
          ),
        });

        return {
          id: order.id,
          order_number: order.order_number || order.id.slice(0, 8), // 간단한 주문번호 생성
          total_amount: order.total_price,
          status: order.is_paid
            ? order.is_checked
              ? 'completed'
              : 'confirmed'
            : 'pending',
          payment_status: order.is_paid ? 'paid' : 'pending',
          order_date: order.created_at,
          year_month: order.year_month,
          period: order.period,
          order_items:
            order.order_details?.map(
              (detail: {
                id: string;
                panel_info_id: string;
                panel_slot_usage_id?: string;
                slot_order_quantity: number;
                display_start_date: string;
                display_end_date: string;
                period?: string;
                panel_info?: {
                  address: string;
                  nickname: string;
                  panel_status: string;
                  panel_type: string;
                  region_gu?: {
                    name: string;
                  };
                  region_dong?: {
                    name: string;
                  };
                };
              }) => ({
                id: detail.id,
                panel_info: {
                  address: detail.panel_info?.address || '',
                  nickname: detail.panel_info?.nickname || '',
                  panel_status: detail.panel_info?.panel_status || '',
                  region_dong: detail.panel_info?.region_dong?.name || '',
                },
                slot_info: {
                  slot_name: detail.panel_slot_usage_id
                    ? '선택된 슬롯'
                    : '기본 슬롯',
                  banner_type: (() => {
                    const panelType = detail.panel_info?.panel_type || 'panel';
                    const typeMap: Record<string, string> = {
                      manual: '현수막게시대',
                      semi_auto: '반자동',
                      bulletin_board: '시민게시대',
                      bulletin_boardg: '시민게시대',
                      cultural_board: '시민/문화게시대',
                      lower_panel: '저단형',
                      multi_panel: '연립형',
                      led: 'LED전자게시대',
                      no_lighting: '비조명용',
                      with_lighting: '조명용',
                      panel: '현수막게시대',
                      top_fixed: '상단광고',
                    };
                    return typeMap[panelType] || panelType;
                  })(),
                  price_unit: '15 days',
                },
                quantity: detail.slot_order_quantity,
                unit_price:
                  order.total_price / (order.order_details?.length || 1),
                total_price:
                  order.total_price / (order.order_details?.length || 1),
                start_date: detail.display_start_date,
                end_date: detail.display_end_date,
                // 특별한 가격 표시 로직
                price_display: (() => {
                  if (order.total_price === 0) {
                    const panelType = detail.panel_info?.panel_type;
                    const regionName = detail.panel_info?.region_gu?.name;

                    // 마포구 시민게시대 (bulletin_board)
                    if (
                      panelType === 'bulletin_board' &&
                      regionName === '마포구'
                    ) {
                      return '포스터 지참 후 방문 신청';
                    }

                    // 송파구, 용산구 상담문의
                    if (regionName === '송파구' || regionName === '용산구') {
                      return '상담문의';
                    }

                    return '상담문의';
                  }
                  return `${(
                    order.total_price / (order.order_details?.length || 1)
                  ).toLocaleString()}원`;
                })(),
              })
            ) || [],
        };
      }) || [];

    return NextResponse.json({
      success: true,
      orders: transformedOrders,
      pagination: {
        page,
        limit,
        total: orders?.length || 0, // count 대신 실제 데이터 개수 사용
        totalPages: Math.ceil((orders?.length || 0) / limit),
      },
      statusSummary,
    });
  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  panel_info_id: string;
  halfPeriod?: 'first_half' | 'second_half';
  selectedYear?: number; // 선택한 년도
  selectedMonth?: number; // 선택한 월
  startDate?: string;
  endDate?: string;
  // 기간 데이터 추가 (구별 카드에서 전달받은 데이터)
  periodData?: {
    first_half_from: string;
    first_half_to: string;
    second_half_from: string;
    second_half_to: string;
  };
  // 선택된 기간의 시작/종료 날짜
  selectedPeriodFrom?: string;
  selectedPeriodTo?: string;
  panel_slot_snapshot?: {
    id: string | null;
    notes: string | null;
    max_width: number | null;
    slot_name: string | null;
    tax_price: number | null;
    created_at: string | null;
    max_height: number | null;
    price_unit: string | null;
    updated_at: string | null;
    banner_type: string | null;
    slot_number: number | null;
    total_price: number | null;
    panel_info_id: string | null;
    road_usage_fee: number | null;
    advertising_fee: number | null;
    panel_slot_status: string | null;
  };
  panel_slot_usage_id?: string;
}

// 주문 생성 (결제 처리)
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST /api/orders 시작');

    const {
      items,
      paymentMethod,
      draftDeliveryMethod, // 시안 전송 방식 추가
    }: {
      items: OrderItem[];
      paymentMethod?: string;
      draftDeliveryMethod?: 'email' | 'upload';
    } = await request.json();

    console.log('🔍 받은 데이터:', {
      items,
      paymentMethod,
      draftDeliveryMethod,
    });

    if (!items || items.length === 0) {
      console.log('🔍 주문할 상품이 없음');
      return NextResponse.json(
        { error: '주문할 상품이 없습니다.' },
        { status: 400 }
      );
    }

    // 쿠키에서 사용자 ID 추출
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    const userId = cookies['user_id'];

    if (!userId) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    console.log('🔍 사용자 ID:', userId);

    // 총 가격 계산
    const totalPrice = items.reduce((sum: number, item: OrderItem) => {
      return sum + item.price * item.quantity;
    }, 0);
    console.log('🔍 총 가격:', totalPrice);

    // 첫 번째 아이템 확인
    const firstItem = items[0];
    if (!firstItem) {
      return NextResponse.json(
        { error: '주문할 상품이 없습니다.' },
        { status: 400 }
      );
    }

    // 각 아이템의 기간 정보가 유효한지 확인 (모든 아이템이 같은 기간일 필요는 없음)
    const allItemsHaveValidPeriod = items.every((item) => {
      return item.halfPeriod && item.selectedYear && item.selectedMonth;
    });

    if (!allItemsHaveValidPeriod) {
      return NextResponse.json(
        {
          error: '모든 상품에 유효한 기간 정보가 필요합니다.',
        },
        { status: 400 }
      );
    }

    // 첫 번째 아이템의 기간 정보 추출
    // const halfPeriod = firstItem.halfPeriod; // 사용하지 않으므로 주석 처리
    // const yearMonth = firstItem.selectedYear && firstItem.selectedMonth
    //   ? `${firstItem.selectedYear}년 ${firstItem.selectedMonth}월`
    //   : '기간 미설정';

    // 첫 번째 아이템의 panel_slot_snapshot 추출
    const firstItemSnapshot = firstItem.panel_slot_snapshot;

    // 사용자의 기본 프로필 ID 가져오기
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_auth_id', userId)
      .eq('is_default', true)
      .single();

    if (profileError || !userProfile) {
      console.error('🔍 사용자 프로필 조회 오류:', profileError);
      return NextResponse.json(
        {
          error:
            '사용자 프로필을 찾을 수 없습니다. 마이페이지에서 프로필을 설정해주세요.',
        },
        { status: 400 }
      );
    }

    // 결제 방법에 따른 결제 상태 결정
    const isPaid = paymentMethod === 'bank_transfer' ? false : true;

    // 하나의 주문 생성 (주문 메타데이터만 포함)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_profile_id: userProfile.id, // 기본 프로필 ID 사용
        user_auth_id: userId,
        // total_price: totalPrice, // orders 테이블에 total_price 컬럼이 없으므로 제거
        // is_paid: isPaid, // orders 테이블에 is_paid 컬럼이 없으므로 제거
        // is_checked: false, // orders 테이블에 is_checked 컬럼이 없으므로 제거
        // payment_method: paymentMethod || 'card', // orders 테이블에 payment_method 컬럼이 없으므로 제거
        // year_month: yearMonth, // orders 테이블에 year_month 컬럼이 없으므로 제거
        // half_period: halfPeriod, // orders 테이블에 half_period 컬럼이 없으므로 제거
        panel_slot_snapshot: firstItemSnapshot, // 가격 정보 저장
        // draft_delivery_method는 design_drafts 테이블에 저장
      })
      .select()
      .single();

    if (orderError) {
      console.error('🔍 주문 생성 오류:', orderError);
      throw new Error('주문 생성에 실패했습니다.');
    }

    // 주문번호 생성 (YYYYMMDD + 4자리 순번)
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    // 오늘 날짜의 주문 개수 조회 (order_number가 있는 주문들만)
    const { count: todayOrderCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .not('order_number', 'is', null)
      .gte('created_at', today.toISOString().slice(0, 10))
      .lt(
        'created_at',
        new Date(today.getTime() + 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10)
      );

    const orderNumber = `${dateStr}${String(
      (todayOrderCount || 0) + 1
    ).padStart(4, '0')}`;

    console.log('🔍 생성된 주문번호:', orderNumber);

    // 주문번호 업데이트
    const { error: updateError } = await supabase
      .from('orders')
      .update({ order_number: orderNumber })
      .eq('id', order.id);

    if (updateError) {
      console.error('🔍 주문번호 업데이트 오류:', updateError);
    }

    // 각 아이템별로 panel_slot_usage 생성 및 order_details 생성
    const orderDetails = [];

    for (const item of items) {
      console.log('🔍 주문 상세 생성 중:', item);

      // 기간 데이터 사용 (구별 카드에서 전달받은 데이터)
      let displayStartDate: string;
      let displayEndDate: string;

      if (item.selectedPeriodFrom && item.selectedPeriodTo) {
        // 장바구니에서 전달받은 기간 데이터 사용
        displayStartDate = item.selectedPeriodFrom;
        displayEndDate = item.selectedPeriodTo;

        console.log('🔍 기간 데이터 사용:', {
          itemId: item.id,
          selectedPeriodFrom: item.selectedPeriodFrom,
          selectedPeriodTo: item.selectedPeriodTo,
        });
      } else if (item.selectedYear && item.selectedMonth && item.halfPeriod) {
        // 기존 로직 (fallback)
        const year = item.selectedYear;
        const month = item.selectedMonth;

        // 상하반기 신청 3일전까지 받는 조건으로 수정
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        const currentDay = currentDate.getDate();

        // 현재 월의 상반기(1-15일) 신청 가능 여부 확인
        const isFirstHalfAvailable = currentDay <= 12; // 12일까지 신청 가능

        // 현재 월의 하반기(16-마지막일) 신청 가능 여부 확인
        const lastDayOfMonth = new Date(currentYear, currentMonth, 0).getDate();
        const isSecondHalfAvailable = currentDay <= lastDayOfMonth - 3; // 마지막일 3일전까지 신청 가능

        // 디버깅 로그 추가
        console.log('🔍 기간 검증 디버깅 (fallback):', {
          requestedYear: year,
          requestedMonth: month,
          requestedHalfPeriod: item.halfPeriod,
          currentYear,
          currentMonth,
          currentDay,
          isFirstHalfAvailable,
          isSecondHalfAvailable,
          lastDayOfMonth,
        });

        // 신청 가능한 기간인지 확인
        let isPeriodAvailable = false;

        if (year === currentYear && month === currentMonth) {
          // 현재 월 신청
          if (item.halfPeriod === 'first_half' && isFirstHalfAvailable) {
            isPeriodAvailable = true;
          } else if (
            item.halfPeriod === 'second_half' &&
            isSecondHalfAvailable
          ) {
            isPeriodAvailable = true;
          }
        } else if (year === currentYear && month === currentMonth + 1) {
          // 다음 월 신청 (항상 가능)
          isPeriodAvailable = true;
        } else if (
          currentMonth === 12 &&
          year === currentYear + 1 &&
          month === 1
        ) {
          // 12월에서 다음해 1월 신청 (항상 가능)
          isPeriodAvailable = true;
        }

        console.log('🔍 기간 검증 결과:', {
          isPeriodAvailable,
          year,
          month,
          currentYear,
          currentMonth,
        });

        if (!isPeriodAvailable) {
          if (year === currentYear && month === currentMonth) {
            if (item.halfPeriod === 'first_half') {
              throw new Error(
                `${currentMonth}월 상반기 신청은 ${currentMonth}월 ${
                  Math.floor(lastDayOfMonth / 2) - 3
                }일까지 가능합니다.`
              );
            } else {
              throw new Error(
                `${currentMonth}월 하반기 신청은 ${currentMonth}월 ${
                  lastDayOfMonth - 3
                }일까지 가능합니다.`
              );
            }
          } else {
            throw new Error(`신청 가능한 기간이 아닙니다.`);
          }
        }

        if (item.halfPeriod === 'first_half') {
          // 상반기: 1일-15일
          displayStartDate = `${year}-${String(month).padStart(2, '0')}-01`;
          displayEndDate = `${year}-${String(month).padStart(2, '0')}-15`;
        } else {
          // 하반기: 16일-마지막일
          const lastDay = new Date(year, month, 0).getDate();
          displayStartDate = `${year}-${String(month).padStart(2, '0')}-16`;
          displayEndDate = `${year}-${String(month).padStart(
            2,
            '0'
          )}-${lastDay}`;
        }
      } else {
        // price_unit에 따른 자동 기간 계산 (기본값)
        const priceUnit = item.panel_slot_snapshot?.price_unit || '15 days';
        const startDate = new Date();
        const endDate = new Date(startDate);

        // price_unit에 따라 기간 계산
        if (priceUnit === '15 days') {
          endDate.setDate(startDate.getDate() + 15);
        } else if (priceUnit === '30 days') {
          endDate.setDate(startDate.getDate() + 30);
        } else if (priceUnit === '7 days') {
          endDate.setDate(startDate.getDate() + 7);
        } else {
          // 기본값: 15일
          endDate.setDate(startDate.getDate() + 15);
        }

        displayStartDate = startDate.toISOString().split('T')[0];
        displayEndDate = endDate.toISOString().split('T')[0];
      }

      // 재고 중복 확인은 DB 트리거가 자동으로 처리

      // 2. panel_slot_usage 레코드 생성 (order_details_id는 나중에 업데이트)
      let panelSlotUsageId = item.panel_slot_usage_id;

      if (!panelSlotUsageId && item.panel_slot_snapshot) {
        // panel_slot_snapshot에서 banner_slot_info 찾기
        const { data: bannerSlotInfo, error: bannerError } = await supabase
          .from('banner_slot_info')
          .select('id')
          .eq('panel_info_id', item.panel_info_id)
          .eq('slot_number', item.panel_slot_snapshot.slot_number)
          .single();

        if (bannerError) {
          console.error('🔍 banner_slot_info 조회 오류:', bannerError);
        } else if (bannerSlotInfo) {
          // panel_info에서 display_type_id 가져오기
          const { data: panelInfo, error: panelError } = await supabase
            .from('panel_info')
            .select('display_type_id')
            .eq('id', item.panel_info_id)
            .single();

          if (panelError) {
            console.error('🔍 panel_info 조회 오류:', panelError);
          } else {
            // panel_slot_usage 레코드 생성 (order_details_id는 나중에 설정)
            const { data: newPanelSlotUsage, error: usageError } =
              await supabase
                .from('panel_slot_usage')
                .insert({
                  display_type_id: panelInfo.display_type_id,
                  panel_info_id: item.panel_info_id,
                  slot_number: item.panel_slot_snapshot.slot_number,
                  banner_slot_info_id: bannerSlotInfo.id,
                  usage_type: 'banner_display',
                  attach_date_from: displayStartDate,
                  is_active: true,
                  is_closed: false,
                  banner_type: item.panel_slot_snapshot.banner_type || 'panel',
                })
                .select('id')
                .single();

            if (usageError) {
              console.error('🔍 panel_slot_usage 생성 오류:', usageError);
            } else {
              panelSlotUsageId = newPanelSlotUsage.id;
              console.log('🔍 생성된 panel_slot_usage_id:', panelSlotUsageId);
            }
          }
        }
      }

      // 2. order_details 생성
      const orderDetail = {
        order_id: order.id,
        panel_info_id: item.panel_info_id,
        panel_slot_usage_id: panelSlotUsageId,
        slot_order_quantity: item.quantity,
        display_start_date: displayStartDate,
        display_end_date: displayEndDate,
        // half_period 컬럼이 없으므로 제거
      };

      orderDetails.push(orderDetail);
    }

    console.log('🔍 주문 상세 정보:', orderDetails);

    // order_details 일괄 생성
    const orderDetailsResult = await supabase
      .from('order_details')
      .insert(orderDetails)
      .select('id, panel_slot_usage_id, panel_info_id, slot_order_quantity');

    console.log('🔍 주문 상세 정보 생성 결과:', orderDetailsResult);

    if (orderDetailsResult.error) {
      console.error('🔍 주문 상세 정보 생성 오류:', orderDetailsResult.error);
      return NextResponse.json(
        { error: '주문 상세 정보 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 생성된 order_details의 panel_slot_usage_id 업데이트 (재고는 DB 트리거가 자동 처리)
    if (orderDetailsResult.data) {
      for (const orderDetail of orderDetailsResult.data) {
        if (orderDetail.panel_slot_usage_id) {
          try {
            // panel_slot_usage의 order_details_id 업데이트
            const { error: updateError } = await supabase
              .from('panel_slot_usage')
              .update({ order_details_id: orderDetail.id })
              .eq('id', orderDetail.panel_slot_usage_id);

            if (updateError) {
              console.error(
                '🔍 panel_slot_usage order_details_id 업데이트 오류:',
                updateError
              );
            } else {
              console.log(
                '🔍 panel_slot_usage order_details_id 업데이트 성공:',
                orderDetail.id
              );
            }
          } catch (error) {
            console.error('🔍 panel_slot_usage 업데이트 중 예외 발생:', error);
            // 이 에러는 치명적이지 않으므로 계속 진행
          }
        }
      }
    }

    // 결제 완료 시 시안관리 레코드 자동 생성
    if (isPaid && userProfile.id) {
      const { data: draft, error: draftError } = await supabase
        .from('design_drafts')
        .insert({
          order_id: order.id,
          user_profile_id: userProfile.id,
          draft_category: 'initial',
          notes: `결제 완료 후 초기 시안 업로드 대기 (전송방식: ${
            draftDeliveryMethod || 'upload'
          })`,
        })
        .select()
        .single();

      if (draftError) {
        console.warn('Failed to create draft record:', draftError);
      } else {
        // orders 테이블의 design_drafts_id와 draft_delivery_method 업데이트
        await supabase
          .from('orders')
          .update({
            design_drafts_id: draft.id,
            draft_delivery_method: draftDeliveryMethod || 'upload',
          })
          .eq('id', order.id);
      }
    }

    console.log('🔍 주문 생성 성공:', {
      orderId: order.id,
      orderNumber: orderNumber,
      totalPrice: totalPrice,
      itemCount: items.length,
    });

    // 재고 현황 확인을 위한 로그 추가
    console.log('🔍 재고 현황 확인:');
    for (const item of items) {
      const { data: inventoryData } = await supabase
        .from('banner_slot_inventory')
        .select('*')
        .eq('panel_info_id', item.panel_info_id);

      console.log(`  - 패널 ${item.panel_info_id}:`, inventoryData);
    }

    return NextResponse.json({
      success: true,
      order: {
        orderId: order.id,
        orderNumber: orderNumber,
        totalPrice: totalPrice,
        itemCount: items.length,
      },
      message: '주문이 성공적으로 생성되었습니다.',
    });
  } catch (error) {
    console.error('🔍 주문 생성 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
