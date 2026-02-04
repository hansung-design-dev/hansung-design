import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/app/api/supabase';

interface BannerSlotPricePolicy {
  price_usage_type?: string;
  total_price?: number;
}

interface OrderDetailWithPrice {
  id: string;
  price?: number | null;
  slot_order_quantity?: number;
  panel_slot_usage?: {
    unit_price?: number;
    banner_slots?: {
      banner_slot_price_policy?: BannerSlotPricePolicy[];
    };
  };
}

/**
 * 남은 order_details를 기반으로 총 금액을 재계산
 * 우선순위: 저장된 price > banner_slot_price_policy > unit_price
 */
async function recalculateOrderAmount(
  orderId: string,
  isPublicInstitution: boolean
): Promise<number> {
  // 남은 order_details 조회 (저장된 가격 및 가격 정책 포함)
  const { data: remainingDetails, error } = await supabase
    .from('order_details')
    .select(`
      id,
      price,
      slot_order_quantity,
      panel_slot_usage:panel_slot_usage_id (
        unit_price,
        banner_slots:banner_slot_id (
          banner_slot_price_policy (
            price_usage_type,
            total_price
          )
        )
      )
    `)
    .eq('order_id', orderId);

  if (error || !remainingDetails) {
    console.error('[recalculateOrderAmount] order_details 조회 실패:', error);
    return 0;
  }

  let totalAmount = 0;
  const preferredPriceUsageType = isPublicInstitution
    ? 'public_institution'
    : 'default';

  for (const detail of remainingDetails as OrderDetailWithPrice[]) {
    const quantity = detail.slot_order_quantity || 1;

    // 1. 저장된 가격이 있으면 우선 사용 (주문 당시 가격)
    if (detail.price !== null && detail.price !== undefined) {
      totalAmount += Number(detail.price);
      continue;
    }

    // 2. banner_slot_price_policy에서 계산 (레거시 fallback)
    const policies =
      detail.panel_slot_usage?.banner_slots?.banner_slot_price_policy || [];

    let selectedPolicy = policies.find(
      (p) => p.price_usage_type === preferredPriceUsageType
    );

    if (!selectedPolicy) {
      selectedPolicy = policies.find((p) => p.price_usage_type === 'default');
    }

    if (!selectedPolicy && policies.length > 0) {
      selectedPolicy = policies[0];
    }

    if (selectedPolicy) {
      totalAmount += Number(selectedPolicy.total_price || 0) * quantity;
    } else if (detail.panel_slot_usage?.unit_price) {
      totalAmount += Number(detail.panel_slot_usage.unit_price) * quantity;
    }
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
      .select('id, order_id')
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

    // 주문 및 user_profile 정보 조회 (공공기관 여부 확인용)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        created_at,
        user_profiles:user_profile_id (
          is_public_institution
        )
      `)
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

    // 결제 금액 재계산 및 업데이트
    const userProfile = order.user_profiles as { is_public_institution?: boolean } | null;
    const isPublicInstitution = userProfile?.is_public_institution || false;
    const newAmount = await recalculateOrderAmount(order.id, isPublicInstitution);

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



