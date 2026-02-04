import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/app/api/supabase';

/**
 * 남은 order_details를 기반으로 총 금액을 재계산
 * order_details.price에 저장된 정확한 가격만 사용
 */
async function recalculateOrderAmount(orderId: string): Promise<number> {
  const { data: remainingDetails, error } = await supabase
    .from('order_details')
    .select('id, price')
    .eq('order_id', orderId);

  if (error) {
    console.error('[recalculateOrderAmount] order_details 조회 실패:', error);
    throw new Error('order_details 조회 실패');
  }

  if (!remainingDetails || remainingDetails.length === 0) {
    // 남은 항목이 없으면 0원 (전체 취소)
    return 0;
  }

  let totalAmount = 0;

  for (const detail of remainingDetails) {
    // order_details.price에 저장된 정확한 가격 사용 (fallback 없음)
    const savedPrice = Number(detail.price);
    if (isNaN(savedPrice) || savedPrice <= 0) {
      console.error('[recalculateOrderAmount] order_detail에 유효한 price 없음:', {
        detailId: detail.id,
        price: detail.price,
      });
      throw new Error(`order_detail ${detail.id}에 유효한 가격이 없습니다.`);
    }
    totalAmount += savedPrice;
  }

  return totalAmount;
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ orderDetailId: string }> }
) {
  try {
    const { orderDetailId } = await params;

    if (!orderDetailId) {
      return NextResponse.json(
        { success: false, error: 'orderDetailId가 필요합니다.' },
        { status: 400 }
      );
    }

    const { data: detail, error: detailError } = await supabase
      .from('order_details')
      .select('id, order_id, panel_slot_usage_id, panel_id, display_start_date')
      .eq('id', orderDetailId)
      .single();

    if (detailError || !detail || !detail.order_id) {
      console.error(
        '[order-details DELETE] order_detail 조회 실패:',
        detailError
      );
      return NextResponse.json(
        { success: false, error: '주문 상세 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // panel_slot_usage에서 banner_slot_id 조회 (슬롯 복원용)
    let bannerSlotId: string | null = null;
    if (detail.panel_slot_usage_id) {
      const { data: usageData } = await supabase
        .from('panel_slot_usage')
        .select('banner_slot_id')
        .eq('id', detail.panel_slot_usage_id)
        .single();
      bannerSlotId = usageData?.banner_slot_id || null;
    }

    // 기간별 재고 복원을 위해 region_gu_display_period_id 조회
    let regionGuDisplayPeriodId: string | null = null;
    if (detail.panel_id && detail.display_start_date) {
      // panel에서 region_gu_id 조회
      const { data: panelData } = await supabase
        .from('panels')
        .select('region_gu_id')
        .eq('id', detail.panel_id)
        .single();

      if (panelData?.region_gu_id) {
        // display_start_date에 해당하는 region_gu_display_period 찾기
        const { data: periodData } = await supabase
          .from('region_gu_display_periods')
          .select('id')
          .eq('region_gu_id', panelData.region_gu_id)
          .lte('period_from', detail.display_start_date)
          .gte('period_to', detail.display_start_date)
          .single();

        regionGuDisplayPeriodId = periodData?.id || null;
      }
    }

    // 주문 및 user_profile 정보 조회 (공공기관 여부 확인용)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, created_at')
      .eq('id', detail.order_id)
      .single();

    if (orderError || !order) {
      console.error(
        '[order-details DELETE] 부모 주문 조회 실패:',
        orderError
      );
      return NextResponse.json(
        { success: false, error: '주문을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (order.created_at) {
      const createdAt = new Date(order.created_at);
      const now = new Date();
      const diffMs = now.getTime() - createdAt.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays >= 2) {
        return NextResponse.json(
          {
            success: false,
            error:
              '구매 후 2일이 지난 항목은 온라인에서 취소가 불가합니다. 고객센터로 문의해주세요.',
            code: 'CANCEL_PERIOD_EXPIRED',
          },
          { status: 400 }
        );
      }
    }

    const { error: deleteError } = await supabase
      .from('order_details')
      .delete()
      .eq('id', orderDetailId);

    if (deleteError) {
      console.error('[order-details DELETE] 삭제 실패:', deleteError);
      return NextResponse.json(
        {
          success: false,
          error: '주문 항목 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.',
        },
        { status: 500 }
      );
    }

    console.log(
      '[order-details DELETE] 주문 항목 삭제 완료:',
      order.order_number,
      orderDetailId
    );

    // panel_slot_usage 삭제
    if (detail.panel_slot_usage_id) {
      const { error: usageDeleteError } = await supabase
        .from('panel_slot_usage')
        .delete()
        .eq('id', detail.panel_slot_usage_id);

      if (usageDeleteError) {
        console.error('[order-details DELETE] panel_slot_usage 삭제 실패:', usageDeleteError);
      } else {
        console.log('[order-details DELETE] panel_slot_usage 삭제 완료:', detail.panel_slot_usage_id);
      }
    }

    // banner_slot_inventory 복원 (is_available = true, is_closed = false)
    // 기간별로 특정 재고만 복원 (다른 기간의 예약에 영향 주지 않음)
    if (bannerSlotId) {
      let inventoryUpdateError;

      if (regionGuDisplayPeriodId) {
        // 특정 기간의 재고만 복원
        const result = await supabase
          .from('banner_slot_inventory')
          .update({ is_available: true, is_closed: false })
          .eq('banner_slot_id', bannerSlotId)
          .eq('region_gu_display_period_id', regionGuDisplayPeriodId);
        inventoryUpdateError = result.error;

        if (!inventoryUpdateError) {
          console.log('[order-details DELETE] banner_slot_inventory 복원 완료 (기간별):', {
            bannerSlotId,
            regionGuDisplayPeriodId,
          });
        }
      } else {
        // 기간 정보를 찾지 못한 경우 fallback (모든 기간 복원 - 기존 동작)
        console.warn('[order-details DELETE] 기간 정보 없음, 전체 복원:', bannerSlotId);
        const result = await supabase
          .from('banner_slot_inventory')
          .update({ is_available: true, is_closed: false })
          .eq('banner_slot_id', bannerSlotId);
        inventoryUpdateError = result.error;
      }

      if (inventoryUpdateError) {
        console.error('[order-details DELETE] banner_slot_inventory 복원 실패:', inventoryUpdateError);
      }
    }

    // 결제 금액 재계산 및 업데이트
    let newAmount: number;
    try {
      newAmount = await recalculateOrderAmount(order.id);
    } catch (calcError) {
      console.error('[order-details DELETE] 금액 재계산 실패:', calcError);
      return NextResponse.json(
        { success: false, error: '금액 재계산에 실패했습니다.' },
        { status: 500 }
      );
    }

    // orders.total_price 업데이트
    const { error: orderUpdateError } = await supabase
      .from('orders')
      .update({ total_price: newAmount, updated_at: new Date().toISOString() })
      .eq('id', order.id);

    if (orderUpdateError) {
      console.error(
        '[order-details DELETE] orders.total_price 업데이트 실패:',
        orderUpdateError
      );
    } else {
      console.log(
        '[order-details DELETE] orders.total_price 업데이트 완료:',
        order.order_number,
        newAmount
      );
    }

    // payments 테이블 업데이트
    const { error: paymentUpdateError } = await supabase
      .from('payments')
      .update({ amount: newAmount, updated_at: new Date().toISOString() })
      .eq('order_id', order.id);

    if (paymentUpdateError) {
      console.error(
        '[order-details DELETE] payments.amount 업데이트 실패:',
        paymentUpdateError
      );
      // 삭제는 성공했으므로 경고만 로깅
    } else {
      console.log(
        '[order-details DELETE] payments.amount 업데이트 완료:',
        order.order_number,
        newAmount
      );
    }

    return NextResponse.json({
      success: true,
      message: '주문 항목이 취소되었습니다.',
      newAmount,
    });
  } catch (error) {
    console.error('[order-details DELETE] 내부 오류:', error);
    return NextResponse.json(
      { success: false, error: '주문 항목 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}



