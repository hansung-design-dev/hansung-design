import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

// Type definitions for the orders API
interface Panel {
  id: string;
  name: string;
  location: string;
  description?: string;
  created_at: string;
  updated_at: string;
  region_gu?: {
    name: string;
  };
}

interface OrderDetail {
  id: string;
  order_id: string;
  panel_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  half_period?: 'first_half' | 'second_half';
  selected_year?: number;
  selected_month?: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  panels?: Panel;
}

interface PaymentMethod {
  id: string;
  name: string;
  method_type: string;
  method_code: string;
  is_active: boolean;
  description?: string;
  is_online: boolean;
  requires_admin_approval: boolean;
  created_at: string;
  updated_at: string;
}

interface Payment {
  id: string;
  order_id: string;
  payment_method_id: string;
  payment_provider?: string;
  amount: number;
  payment_status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  transaction_id?: string;
  payment_date?: string;
  admin_approval_status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  depositor_name?: string;
  deposit_date?: string;
  created_at: string;
  updated_at: string;
  payment_method?: PaymentMethod;
}

interface UserProfile {
  id: string;
  user_auth_id: string;
  profile_title: string;
  company_name?: string;
  business_registration_file?: string;
  phone: string;
  email: string;
  contact_person_name: string;
  is_public_institution: boolean;
  is_company: boolean;
  created_at: string;
  updated_at: string;
}

interface DesignDraft {
  id: string;
  project_name?: string;
  draft_category: 'initial' | 'feedback' | 'revision' | 'final';
  file_name?: string;
  file_url?: string;
  file_extension?: string;
  file_size?: number;
  notes?: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

interface Order {
  id: string;
  user_auth_id: string;
  user_profile_id: string;
  order_number: string;
  total_price: number;
  payment_status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  admin_approval_status: 'pending' | 'approved' | 'rejected';
  draft_delivery_method?: 'email' | 'upload';
  design_drafts_id?: string;
  created_at: string;
  updated_at: string;
  order_details?: OrderDetail[];
  payments?: Payment[];
  user_profiles?: UserProfile;
  design_drafts?: DesignDraft[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 1. 주문 정보 조회
    const { data: orders, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        order_details (
          *,
          panels (
            *,
            region_gu (
              name
            )
          )
        ),
        payments (
          *,
          payment_methods (
            *
          )
        ),
        user_profiles (
          *
        )
      `
      )
      .eq('user_auth_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('주문 조회 오류:', error);
      return NextResponse.json(
        { error: '주문 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // 2. 각 주문에 대한 design_drafts 조회 (orders.design_drafts_id를 통해 연결)
    const ordersWithDrafts = await Promise.all(
      (orders || []).map(async (order: Order) => {
        let designDrafts: DesignDraft[] = [];

        if (order.design_drafts_id) {
          const { data: draft, error: draftError } = await supabase
            .from('design_drafts')
            .select('*')
            .eq('id', order.design_drafts_id)
            .order('created_at', { ascending: false });

          if (draftError) {
            console.error(
              `🔍 주문 ${order.id}의 design_drafts 조회 오류:`,
              draftError
            );
          } else if (draft && Array.isArray(draft) && draft.length > 0) {
            designDrafts = draft as DesignDraft[];
          } else if (draft && !Array.isArray(draft)) {
            designDrafts = [draft as DesignDraft];
          }

          console.log(
            `🔍 주문 ${order.id}의 design_drafts:`,
            designDrafts.length
          );
        } else {
          console.log(`🔍 주문 ${order.id}의 design_drafts_id가 없음`);
        }

        return {
          ...order,
          design_drafts: designDrafts,
        };
      })
    );

    return NextResponse.json({ orders: ordersWithDrafts });
  } catch (error) {
    console.error('주문 조회 중 예외 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// interface OrderItem {
//   id: string;
//   name: string;
//   price: number;
//   quantity: number;
//   panel_id: string;
//   halfPeriod?: 'first_half' | 'second_half';
//   selectedYear?: number; // 선택한 년도
//   selectedMonth?: number; // 선택한 월
//   startDate?: string;
//   endDate?: string;
//   // 기간 데이터 추가 (구별 카드에서 전달받은 데이터)
//   periodData?: {
//     first_half_from: string;
//     first_half_to: string;
//     second_half_from: string;
//     second_half_to: string;
//   };
//   // 선택된 기간의 시작/종료 날짜
//   selectedPeriodFrom?: string;
//   selectedPeriodTo?: string;
//   panel_slot_snapshot?: {
//     id: string | null;
//     notes: string | null;
//     max_width: number | null;
//     slot_name: string | null;
//     tax_price: number | null;
//     created_at: string | null;
//     max_height: number | null;
//     price_unit: string | null;
//     updated_at: string | null;
//     banner_type: string | null;
//     slot_number: number | null;
//     total_price: number | null;
//     panel_id: string | null;
//     road_usage_fee: number | null;
//     advertising_fee: number | null;
//     panel_slot_status: string | null;
//   };
//   panel_slot_usage_id?: string;
// }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      items,
      userAuthId,
      userProfileId,
      isPaid = false,
      draftDeliveryMethod,
      paymentMethodId, // 결제수단 ID 추가
      projectName, // 작업이름 필수
    } = body;

    console.log(
      '🔍 [주문 생성 API] 시작 =========================================='
    );
    console.log('🔍 [주문 생성 API] 입력 파라미터:', {
      itemsCount: items?.length,
      userAuthId,
      userProfileId,
      isPaid,
      draftDeliveryMethod,
      paymentMethodId,
      projectName,
    });

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('🔍 [주문 생성 API] ❌ 주문 항목 누락');
      return NextResponse.json(
        { error: '주문 항목이 필요합니다.' },
        { status: 400 }
      );
    }

    if (!userAuthId) {
      console.error('🔍 [주문 생성 API] ❌ 사용자 인증 ID 누락');
      return NextResponse.json(
        { error: '사용자 인증 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    if (
      !projectName ||
      typeof projectName !== 'string' ||
      !projectName.trim()
    ) {
      console.error('🔍 [주문 생성 API] ❌ 작업이름 누락');
      return NextResponse.json(
        { error: '작업이름(projectName)은 필수입니다.' },
        { status: 400 }
      );
    }

    // 사용자 프로필 조회 (선택적)
    console.log('🔍 [주문 생성 API] 사용자 프로필 조회 시작...', {
      userProfileId,
      hasUserProfileId: !!userProfileId,
    });

    let userProfile = null;
    if (userProfileId) {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userProfileId)
        .single();

      console.log('🔍 [주문 생성 API] 사용자 프로필 조회 결과:', {
        found: !!profile,
        profileId: profile?.id,
        error: profileError,
      });

      if (profileError || !profile) {
        console.warn(
          '🔍 [주문 생성 API] ⚠️ 사용자 프로필 조회 실패 (계속 진행):',
          profileError
        );
        // 프로필이 없어도 주문은 생성 가능하도록 변경
        // 하지만 프로필 정보는 사용할 수 없음
      } else {
        userProfile = profile;
      }
    } else {
      console.warn(
        '🔍 [주문 생성 API] ⚠️ userProfileId가 없음 (프로필 없이 주문 생성)'
      );
    }

    // 주문 번호 생성 (YYYYMMDD-XXXX 형식)
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `${dateStr}-${randomStr}`;

    console.log('🔍 [주문 생성 API] 생성된 주문번호:', orderNumber);

    // 총 가격 계산
    const totalPrice = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    console.log('🔍 [주문 생성 API] 총 가격 계산:', {
      totalPrice,
      itemsCount: items.length,
      itemPrices: items.map((item) => ({
        id: item.id,
        price: item.price,
        quantity: item.quantity,
      })),
    });

    // 1. orders 테이블에 주문 생성 (가격 정보 제외)
    console.log('🔍 [주문 생성 API] orders 테이블에 주문 생성 시작...');
    const orderInsertData: {
      order_number: string;
      user_auth_id: string;
      user_profile_id?: string | null;
      payment_status: 'completed' | 'pending';
      order_status: string;
      draft_delivery_method: string;
    } = {
      order_number: orderNumber,
      user_auth_id: userAuthId,
      payment_status: isPaid ? 'completed' : 'pending',
      order_status: 'pending',
      draft_delivery_method: draftDeliveryMethod || 'upload',
    };

    // user_profile_id가 있으면 추가 (없으면 null 또는 undefined)
    if (userProfileId && userProfile) {
      orderInsertData.user_profile_id = userProfileId;
      console.log('🔍 [주문 생성 API] user_profile_id 포함:', userProfileId);
    } else {
      orderInsertData.user_profile_id = null;
      console.warn('🔍 [주문 생성 API] ⚠️ user_profile_id 없이 주문 생성');
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderInsertData)
      .select('id, order_number, payment_status')
      .single();

    console.log('🔍 [주문 생성 API] orders 생성 결과:', {
      success: !orderError,
      orderId: order?.id,
      orderNumber: order?.order_number,
      payment_status: order?.payment_status,
      error: orderError,
    });

    if (orderError) {
      console.error('🔍 [주문 생성 API] ❌ 주문 생성 실패:', orderError);
      return NextResponse.json(
        { error: '주문 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    console.log('🔍 [주문 생성 API] ✅ 주문 생성 성공:', {
      orderId: order.id,
      orderNumber: order.order_number,
    });

    // 2. payments 테이블에 결제 정보 생성
    if (paymentMethodId) {
      console.log(
        '🔍 [주문 생성 API] payments 테이블에 결제 정보 생성 시작...'
      );
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_id: order.id,
          payment_method_id: paymentMethodId,
          amount: totalPrice,
          payment_status: isPaid ? 'completed' : 'pending',
          payment_date: isPaid ? new Date().toISOString() : null,
          admin_approval_status: isPaid ? 'approved' : 'pending',
        })
        .select('id, payment_status, amount')
        .single();

      console.log('🔍 [주문 생성 API] payments 생성 결과:', {
        success: !paymentError,
        paymentId: payment?.id,
        payment_status: payment?.payment_status,
        amount: payment?.amount,
        error: paymentError,
      });

      if (paymentError) {
        console.error(
          '🔍 [주문 생성 API] ⚠️ 결제 정보 생성 실패 (치명적이지 않음):',
          paymentError
        );
        // 결제 정보 생성 실패는 치명적이지 않으므로 계속 진행
      } else {
        console.log('🔍 [주문 생성 API] ✅ 결제 정보 생성 성공:', payment.id);
      }
    } else {
      console.log(
        '🔍 [주문 생성 API] paymentMethodId가 없어서 payments 레코드 생성 건너뜀'
      );
    }

    // 3. order_details 생성
    console.log('🔍 [주문 생성 API] order_details 생성 시작...');
    const orderDetails = [];

    for (const item of items) {
      console.log('🔍 [주문 생성 API] order_detail 처리 중:', {
        itemId: item.id,
        panelId: item.panel_id,
        quantity: item.quantity,
        price: item.price,
      });
      // 기간 설정 - 수정된 부분: selectedPeriodFrom/selectedPeriodTo 우선 사용
      let displayStartDate: string;
      let displayEndDate: string;

      if (item.selectedPeriodFrom && item.selectedPeriodTo) {
        // 선택된 기간이 있으면 그것을 사용
        displayStartDate = item.selectedPeriodFrom;
        displayEndDate = item.selectedPeriodTo;
      } else if (item.halfPeriod && item.selectedYear && item.selectedMonth) {
        // 없으면 halfPeriod로 계산
        const year = item.selectedYear;
        const month = item.selectedMonth;

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
        // panel_slot_snapshot에서 banner_slots 찾기
        const { data: bannerSlotData, error: bannerError } = await supabase
          .from('banner_slots')
          .select('id')
          .eq('panel_id', item.panel_id)
          .eq('slot_number', item.panel_slot_snapshot.slot_number)
          .single();

        if (bannerError) {
          console.error('🔍 banner_slots 조회 오류:', bannerError);
        } else if (bannerSlotData) {
          // panels에서 display_type_id 가져오기
          const { data: panelData, error: panelError } = await supabase
            .from('panels')
            .select('display_type_id')
            .eq('id', item.panel_id)
            .single();

          if (panelError) {
            console.error('🔍 panels 조회 오류:', panelError);
          } else {
            // panel_slot_usage 레코드 생성 (order_details_id는 나중에 설정)
            const { data: newPanelSlotUsage, error: usageError } =
              await supabase
                .from('panel_slot_usage')
                .insert({
                  display_type_id: panelData.display_type_id,
                  panel_id: item.panel_id,
                  slot_number: item.panel_slot_snapshot.slot_number,
                  banner_slot_id: bannerSlotData.id,
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
        panel_id: item.panel_id,
        panel_slot_usage_id: panelSlotUsageId,
        slot_order_quantity: item.quantity,
        display_start_date: displayStartDate,
        display_end_date: displayEndDate,
        // half_period 컬럼이 없으므로 제거
      };

      orderDetails.push(orderDetail);
    }

    console.log('🔍 [주문 생성 API] 생성할 order_details:', {
      count: orderDetails.length,
      details: orderDetails.map((od) => ({
        panel_id: od.panel_id,
        slot_order_quantity: od.slot_order_quantity,
        display_start_date: od.display_start_date,
        display_end_date: od.display_end_date,
      })),
    });

    // order_details 일괄 생성
    const orderDetailsResult = await supabase
      .from('order_details')
      .insert(orderDetails)
      .select('id, panel_slot_usage_id, panel_id, slot_order_quantity');

    console.log('🔍 [주문 생성 API] order_details 생성 결과:', {
      success: !orderDetailsResult.error,
      createdCount: orderDetailsResult.data?.length || 0,
      createdIds: orderDetailsResult.data?.map((od) => od.id) || [],
      error: orderDetailsResult.error,
    });

    if (orderDetailsResult.error) {
      console.error(
        '🔍 [주문 생성 API] ❌ order_details 생성 실패:',
        orderDetailsResult.error
      );
      return NextResponse.json(
        { error: '주문 상세 정보 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    console.log(
      '🔍 [주문 생성 API] ✅ order_details 생성 성공:',
      orderDetailsResult.data?.length,
      '개'
    );

    // 생성된 order_details의 panel_slot_usage_id 업데이트 (재고는 DB 트리거가 자동 처리)
    if (orderDetailsResult.data) {
      console.log('🔍 [주문 생성 API] panel_slot_usage 업데이트 시작...');
      for (const orderDetail of orderDetailsResult.data) {
        if (orderDetail.panel_slot_usage_id) {
          try {
            // panel_slot_usage의 order_details_id 업데이트
            // 주의: 스키마에 order_details_id 컬럼이 없을 수 있음
            const { error: updateError } = await supabase
              .from('panel_slot_usage')
              .update({ order_details_id: orderDetail.id })
              .eq('id', orderDetail.panel_slot_usage_id);

            if (updateError) {
              console.error(
                '🔍 [주문 생성 API] ⚠️ panel_slot_usage 업데이트 실패 (치명적이지 않음):',
                {
                  orderDetailId: orderDetail.id,
                  panelSlotUsageId: orderDetail.panel_slot_usage_id,
                  error: updateError,
                  note: '스키마에 order_details_id 컬럼이 없을 수 있습니다.',
                }
              );
            } else {
              console.log(
                '🔍 [주문 생성 API] ✅ panel_slot_usage 업데이트 성공:',
                orderDetail.id
              );
            }
          } catch (error) {
            console.error(
              '🔍 [주문 생성 API] ⚠️ panel_slot_usage 업데이트 중 예외 발생 (치명적이지 않음):',
              error
            );
            // 이 에러는 치명적이지 않으므로 계속 진행
          }
        } else {
          console.log(
            '🔍 [주문 생성 API] order_detail에 panel_slot_usage_id 없음:',
            orderDetail.id
          );
        }
      }
    }

    // 3. design_drafts row 생성 (항상)
    if (userProfile?.id) {
      console.log('🔍 [주문 생성 API] design_drafts 생성 시작...');
      const { data: draft, error: draftError } = await supabase
        .from('design_drafts')
        .insert({
          user_profile_id: userProfile.id,
          draft_category: 'initial',
          project_name: projectName,
          notes: `주문 생성 시 자동 생성 (전송방식: ${
            draftDeliveryMethod || 'upload'
          })`,
        })
        .select('id, project_name')
        .single();

      console.log('🔍 [주문 생성 API] design_drafts 생성 결과:', {
        success: !draftError,
        draftId: draft?.id,
        project_name: draft?.project_name,
        error: draftError,
      });

      if (draftError) {
        console.error(
          '🔍 [주문 생성 API] ❌ design_drafts 생성 실패:',
          draftError
        );
      } else {
        console.log('🔍 [주문 생성 API] ✅ design_drafts 생성 성공:', draft.id);

        // orders 테이블의 design_drafts_id와 draft_delivery_method 업데이트
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            design_drafts_id: draft.id,
            draft_delivery_method: draftDeliveryMethod || 'upload',
          })
          .eq('id', order.id);

        console.log(
          '🔍 [주문 생성 API] orders.design_drafts_id 업데이트 결과:',
          {
            success: !updateError,
            error: updateError,
          }
        );

        if (updateError) {
          console.error(
            '🔍 [주문 생성 API] ⚠️ orders 업데이트 실패 (치명적이지 않음):',
            updateError
          );
        } else {
          console.log('🔍 [주문 생성 API] ✅ orders 업데이트 성공');
        }
      }
    } else {
      console.error(
        '🔍 [주문 생성 API] ❌ userProfile.id가 없어서 design_drafts 생성 불가'
      );
    }

    // 4. 결제 완료 시 시안관리 레코드 자동 생성
    // (기존 결제완료 시 design_drafts 생성 로직은 제거)

    console.log(
      '🔍 [주문 생성 API] ✅ 모든 처리 완료 =========================================='
    );
    console.log('🔍 [주문 생성 API] 최종 결과:', {
      orderId: order.id,
      orderNumber: orderNumber,
      totalPrice: totalPrice,
      itemCount: items.length,
      orderDetailsCount: orderDetailsResult.data?.length || 0,
    });

    // 재고 현황 확인을 위한 로그 추가
    console.log('🔍 [주문 생성 API] 재고 현황 확인:');
    for (const item of items) {
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('banner_slot_inventory')
        .select('*')
        .eq('panel_id', item.panel_id);

      console.log(`🔍 [주문 생성 API] 패널 ${item.panel_id} 재고:`, {
        found: !!inventoryData,
        count: inventoryData?.length || 0,
        error: inventoryError,
      });
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
    console.error('🔍 [주문 생성 API] ❌ 예외 발생:', error);
    console.error('🔍 [주문 생성 API] 예외 상세:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
