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
          panels (
            *,
            region_gu (
              name
            )
          ),
          design_draft:design_draft_id (
            id,
            project_name,
            file_name,
            file_url,
            is_approved
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
    } = body;

    console.log('🔍 주문 요청 데이터:', {
      itemsCount: items?.length,
      userAuthId,
      userProfileId,
      isPaid,
      draftDeliveryMethod,
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

    // 1. orders 테이블에 주문 생성
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_auth_id: userAuthId,
        user_profile_id: userProfileId,
        total_amount: totalPrice,
        payment_status: isPaid ? 'paid' : 'pending',
        order_status: 'confirmed',
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

    // 2. order_details 생성
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

    console.log('🔍 주문 상세 정보:', orderDetails);

    // order_details 일괄 생성
    const orderDetailsResult = await supabase
      .from('order_details')
      .insert(orderDetails)
      .select('id, panel_slot_usage_id, panel_id, slot_order_quantity');

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
        .eq('panel_id', item.panel_id);

      console.log(`  - 패널 ${item.panel_id}:`, inventoryData);
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
