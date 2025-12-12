import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/app/api/supabase';

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

    return NextResponse.json({
      success: true,
      message: '주문 항목이 취소되었습니다.',
    });
  } catch (error) {
    console.error('[order-details DELETE] 내부 오류:', error);
    return NextResponse.json(
      { success: false, error: '주문 항목 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}



