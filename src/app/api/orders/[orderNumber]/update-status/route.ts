import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    const { payment_status } = await request.json();

    if (!orderNumber || !payment_status) {
      return NextResponse.json(
        { success: false, error: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 주문 상태 업데이트
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        payment_status,
        updated_at: new Date().toISOString(),
      })
      .eq('order_number', orderNumber);

    if (orderError) {
      console.error('Order status update error:', orderError);
      return NextResponse.json(
        { success: false, error: '주문 상태 업데이트에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 결제 정보도 업데이트 (있는 경우)
    const { error: paymentError } = await supabase
      .from('payments')
      .update({
        payment_status,
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', orderId);

    if (paymentError) {
      console.error('Payment status update error:', paymentError);
      // 결제 정보 업데이트 실패는 로그만 남기고 계속 진행
    }

    return NextResponse.json({
      success: true,
      message: '주문 상태가 성공적으로 업데이트되었습니다.',
    });
  } catch (error) {
    console.error('Order status update error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
