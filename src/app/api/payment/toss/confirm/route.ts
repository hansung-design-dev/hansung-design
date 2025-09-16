import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { paymentKey, orderId, amount } = await request.json();

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const secretKey = process.env.TOSS_PAYMENTS_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { error: '서버 시크릿 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    const basicToken = Buffer.from(`${secretKey}:`).toString('base64');

    const confirmResponse = await fetch(
      'https://api.tosspayments.com/v1/payments/confirm',
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount,
        }),
      }
    );

    const confirmData = await confirmResponse.json();

    if (!confirmResponse.ok) {
      console.error('Toss confirm failed:', confirmData);
      // Update payment status to failed
      await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('order_id', orderId);

      return NextResponse.json(
        { success: false, error: confirmData?.message || '결제 승인 실패' },
        { status: 400 }
      );
    }

    // Save/update payment info
    await supabase.from('payments').upsert(
      {
        order_id: orderId,
        amount: amount,
        status: 'completed',
        payment_method: confirmData.method || 'card',
        payment_provider: 'toss',
        payment_provider_id: confirmData.paymentKey,
      },
      { onConflict: 'order_id' }
    );

    return NextResponse.json({ success: true, data: confirmData });
  } catch (error) {
    console.error('Toss confirm error:', error);
    return NextResponse.json(
      { success: false, error: '결제 승인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
