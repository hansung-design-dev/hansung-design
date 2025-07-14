import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/app/api/supabase';

export async function POST(request: NextRequest) {
  try {
    const { orderNumber } = await request.json();

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, error: '주문번호가 필요합니다.' },
        { status: 400 }
      );
    }

    // 주문 정보 조회
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, design_drafts_id')
      .eq('order_number', orderNumber)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: '주문을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 순차적으로 관련 데이터 삭제
    try {
      // 1. payments 삭제
      const { error: paymentsError } = await supabase
        .from('payments')
        .delete()
        .eq('order_id', order.id);

      if (paymentsError) {
        console.error('Payments deletion error:', paymentsError);
        return NextResponse.json(
          { success: false, error: '결제 정보 삭제에 실패했습니다.' },
          { status: 500 }
        );
      }

      // 2. order_details 삭제 (재고 복구는 트리거가 자동 처리)
      const { error: detailsError } = await supabase
        .from('order_details')
        .delete()
        .eq('order_id', order.id);

      if (detailsError) {
        console.error('Order details deletion error:', detailsError);
        return NextResponse.json(
          { success: false, error: '주문 상세 정보 삭제에 실패했습니다.' },
          { status: 500 }
        );
      }

      // 3. orders 삭제
      const { error: orderDeleteError } = await supabase
        .from('orders')
        .delete()
        .eq('id', order.id);

      if (orderDeleteError) {
        console.error('Order deletion error:', orderDeleteError);
        return NextResponse.json(
          { success: false, error: '주문 삭제에 실패했습니다.' },
          { status: 500 }
        );
      }

      // 4. design_drafts 삭제 (orders.design_drafts_id를 통해 연결된 것만)
      if (order.design_drafts_id) {
        const { error: draftsError } = await supabase
          .from('design_drafts')
          .delete()
          .eq('id', order.design_drafts_id);

        if (draftsError) {
          console.error('Design drafts deletion error:', draftsError);
          return NextResponse.json(
            { success: false, error: '디자인 드래프트 삭제에 실패했습니다.' },
            { status: 500 }
          );
        }
      }

      return NextResponse.json({
        success: true,
        message: '주문이 성공적으로 취소되었습니다.',
      });
    } catch (error) {
      console.error('Deletion process error:', error);
      return NextResponse.json(
        { success: false, error: '주문 삭제 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Order cancellation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
