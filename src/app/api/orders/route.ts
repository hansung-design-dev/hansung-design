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

    // 쿠키에서 사용자 ID 추출 (간단한 방식)
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    // 실제로는 JWT 토큰을 디코드해서 사용자 ID를 가져와야 함
    // 여기서는 임시로 쿠키에서 사용자 ID를 가져오는 방식 사용
    const userId =
      cookies['user_auth_id'] || '6301322c-7813-459e-aedc-791d92bd8fb2';

    console.log('🔍 사용자 ID:', userId);

    // URL 파라미터에서 페이지네이션 정보 가져오기
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    console.log('🔍 주문 목록 조회 시작 - 사용자 ID:', userId);

    // 주문 내역 조회 (새로운 스키마에 맞게 수정)
    // 기존 주문들(00000000-0000-0000-0000-000000000000)과 새로운 주문들(6301322c-7813-459e-aedc-791d92bd8fb2) 모두 조회
    const {
      data: orders,
      error: ordersError,
      count,
    } = await supabase
      .from('orders')
      .select(
        `
        *,
        panel_info:panel_info_id (
          nickname,
          address,
          panel_status,
          panel_type,
          region_gu:region_gu_id (
            name
          )
        ),
        order_details (
          *
        )
      `,
        { count: 'exact' }
      )
      .or(
        `user_auth_id.eq.6301322c-7813-459e-aedc-791d92bd8fb2,user_auth_id.eq.00000000-0000-0000-0000-000000000000,user_profile_id.eq.6301322c-7813-459e-aedc-791d92bd8fb2,user_profile_id.eq.00000000-0000-0000-0000-000000000000`
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    console.log('🔍 주문 목록 조회 결과:', {
      ordersCount: orders?.length || 0,
      ordersError,
      count,
      orderNumbers: orders?.map((o) => o.order_number) || [],
    });

    if (ordersError) {
      console.error('Orders fetch error:', ordersError);
      return NextResponse.json(
        { success: false, error: '주문 내역을 불러오는데 실패했습니다.' },
        { status: 500 }
      );
    }

    // 주문 상태별 개수 계산
    const { data: statusCounts } = await supabase
      .from('orders')
      .select('is_paid, is_checked')
      .or(
        `user_auth_id.eq.6301322c-7813-459e-aedc-791d92bd8fb2,user_auth_id.eq.00000000-0000-0000-0000-000000000000,user_profile_id.eq.6301322c-7813-459e-aedc-791d92bd8fb2,user_profile_id.eq.00000000-0000-0000-0000-000000000000`
      );

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
      orders?.map((order) => ({
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
        order_items:
          order.order_details?.map(
            (detail: {
              id: string;
              slot_order_quantity: number;
              display_start_date: string;
              display_end_date: string;
            }) => ({
              id: detail.id,
              panel_info: {
                address: order.panel_info?.address || '',
                nickname: order.panel_info?.nickname || '',
                panel_status: order.panel_info?.panel_status || '',
              },
              slot_info: {
                slot_name: '기본 슬롯',
                banner_type: 'panel',
                price_unit: '15 days',
              },
              quantity: detail.slot_order_quantity,
              unit_price: order.total_price,
              total_price: order.total_price,
              start_date: detail.display_start_date,
              end_date: detail.display_end_date,
              // 특별한 가격 표시 로직
              price_display: (() => {
                if (order.total_price === 0) {
                  const panelType = order.panel_info?.panel_type;
                  const regionName = order.panel_info?.region_gu?.name;

                  // 마포구 시민게시대 (bulletin-board)
                  if (
                    panelType === 'bulletin-board' &&
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
                return `${order.total_price.toLocaleString()}원`;
              })(),
            })
          ) || [],
      })) || [];

    return NextResponse.json({
      success: true,
      orders: transformedOrders,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
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
  startDate?: string;
  endDate?: string;
  panel_slot_snapshot?: {
    id: string | null;
    notes: string | null;
    max_width: number | null;
    slot_name: string | null;
    tax_price: number | null;
    created_at: string | null;
    is_premium: boolean | null;
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
    }: { items: OrderItem[]; paymentMethod?: string } = await request.json();

    console.log('🔍 받은 데이터:', { items, paymentMethod });

    if (!items || items.length === 0) {
      console.log('🔍 주문할 상품이 없음');
      return NextResponse.json(
        { error: '주문할 상품이 없습니다.' },
        { status: 400 }
      );
    }

    // 실제 사용자 ID 사용 (테스트용 하드코딩)
    const userId = '6301322c-7813-459e-aedc-791d92bd8fb2'; // 테스트용 하드코딩

    console.log('🔍 사용자 ID:', userId);

    // 총 가격 계산
    const totalPrice = items.reduce((sum: number, item: OrderItem) => {
      return sum + item.price * item.quantity;
    }, 0);
    console.log('🔍 총 가격:', totalPrice);

    console.log('🔍 첫 번째 아이템의 panel_info_id:', items[0].panel_info_id);

    // 각 아이템별로 주문 생성 (여러 주문이 있을 수 있음)
    const createdOrders = [];

    for (const item of items) {
      console.log('🔍 주문 생성 중:', item);

      // panel_slot_snapshot 데이터 준비
      const panelSlotSnapshot = item.panel_slot_snapshot || {
        id: null,
        notes: null,
        max_width: null,
        slot_name: null,
        tax_price: null,
        created_at: null,
        is_premium: null,
        max_height: null,
        price_unit: null,
        updated_at: null,
        banner_type: null,
        slot_number: null,
        total_price: null,
        panel_info_id: null,
        road_usage_fee: null,
        advertising_fee: null,
        panel_slot_status: null,
      };

      // 주문 생성
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          panel_info_id: item.panel_info_id,
          user_profile_id: userId, // user_profile_id 추가
          user_auth_id: userId,
          panel_slot_usage_id: item.panel_slot_usage_id || null,
          panel_slot_snapshot: panelSlotSnapshot,
          total_price: item.price * item.quantity,
          is_paid: true, // 테스트용으로 즉시 결제 완료
          is_checked: false,
          payment_method: paymentMethod,
          year_month: new Date().toISOString().slice(0, 7), // YYYY-MM 형식
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

      console.log('🔍 주문 생성 결과:', {
        orderId: order.id,
        orderNumber: orderNumber,
        totalPrice: item.price * item.quantity,
      });

      // 주문 상세 정보 생성
      const orderDetails = [
        {
          order_id: order.id,
          slot_order_quantity: item.quantity,
          display_start_date:
            item.startDate || new Date().toISOString().split('T')[0],
          display_end_date:
            item.endDate ||
            new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
        },
      ];

      console.log('🔍 주문 상세 정보:', orderDetails);

      const orderDetailsResult = await supabase
        .from('order_details')
        .insert(orderDetails);

      console.log('🔍 주문 상세 정보 생성 결과:', orderDetailsResult);

      if (orderDetailsResult.error) {
        console.error('🔍 주문 상세 정보 생성 오류:', orderDetailsResult.error);
        return NextResponse.json(
          { error: '주문 상세 정보 생성에 실패했습니다.' },
          { status: 500 }
        );
      }

      createdOrders.push({
        orderId: order.id,
        orderNumber: orderNumber,
        totalPrice: item.price * item.quantity,
      });
    }

    console.log('🔍 모든 주문 생성 성공:', createdOrders);
    return NextResponse.json({
      success: true,
      orders: createdOrders,
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
