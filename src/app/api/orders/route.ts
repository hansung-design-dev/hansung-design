import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

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

    const { data: orders, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        order_details (
          *,
          panel_info (
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

    return NextResponse.json({ orders });
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
//   panel_info_id: string;
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
//     panel_info_id: string | null;
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

    console.log('🔍 주문 요청 데이터:', {
      itemsCount: items?.length,
      userAuthId,
      userProfileId,
      isPaid,
      draftDeliveryMethod,
      paymentMethodId,
    });

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: '주문 항목이 필요합니다.' },
        { status: 400 }
      );
    }

    if (!userAuthId) {
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
      return NextResponse.json(
        { error: '작업이름(projectName)은 필수입니다.' },
        { status: 400 }
      );
    }

    // 사용자 프로필 조회
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userProfileId)
      .single();

    if (profileError || !userProfile) {
      console.error('🔍 사용자 프로필 조회 오류:', profileError);
      return NextResponse.json(
        { error: '사용자 프로필을 찾을 수 없습니다.' },
        { status: 400 }
      );
    }

    // 주문 번호 생성 (YYYYMMDD-XXXX 형식)
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `${dateStr}-${randomStr}`;

    // 총 가격 계산
    const totalPrice = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // 1. orders 테이블에 주문 생성 (가격 정보 제외)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_auth_id: userAuthId,
        user_profile_id: userProfileId,
        payment_status: isPaid ? 'completed' : 'pending',
        order_status: 'pending',
        draft_delivery_method: draftDeliveryMethod || 'upload',
      })
      .select('id')
      .single();

    if (orderError) {
      console.error('🔍 주문 생성 오류:', orderError);
      return NextResponse.json(
        { error: '주문 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    console.log('🔍 주문 생성 성공:', order.id);

    // 2. payments 테이블에 결제 정보 생성
    if (paymentMethodId) {
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
        .select('id')
        .single();

      if (paymentError) {
        console.error('🔍 결제 정보 생성 오류:', paymentError);
        // 결제 정보 생성 실패는 치명적이지 않으므로 계속 진행
      } else {
        console.log('🔍 결제 정보 생성 성공:', payment.id);
      }
    }

    // 3. order_details 생성
    const orderDetails = [];

    for (const item of items) {
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

    // 3. design_drafts row 생성 (항상)
    let designDraftId: string | null = null;
    if (userProfile.id) {
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
        .select('id')
        .single();
      if (draftError) {
        console.warn('Failed to create draft record:', draftError);
      } else {
        designDraftId = draft.id;
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

    // 4. 결제 완료 시 시안관리 레코드 자동 생성
    // (기존 결제완료 시 design_drafts 생성 로직은 제거)

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
