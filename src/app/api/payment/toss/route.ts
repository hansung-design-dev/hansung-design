import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId,
      amount,
      orderName,
      customerName,
      customerEmail,
      customerPhone,
      successUrl,
      failUrl,
      cancelUrl,
    } = body;

    // 필수 필드 검증
    if (!orderId || !amount || !orderName || !customerName || !customerEmail) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 토스페이먼츠 결제 요청 생성 (실제 토스페이먼츠 SDK 연동 시 사용)
    const tossPaymentRequest = {
      amount: amount,
      orderId: orderId,
      orderName: orderName,
      customerName: customerName,
      customerEmail: customerEmail,
      customerPhone: customerPhone,
      successUrl:
        successUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
      failUrl: failUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/payment/fail`,
      cancelUrl:
        cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancel`,
      windowTarget: 'iframe',
      useInternationalCardOnly: false,
      flowMode: 'DEFAULT',
      easyPay: 'TOSSPAY',
    };

    // 임시로 콘솔에 출력 (실제 SDK 연동 시 제거)
    console.log('토스페이먼츠 요청 데이터:', tossPaymentRequest);

    // 토스페이먼츠 API 호출 (실제 구현에서는 토스페이먼츠 SDK 사용)
    // 여기서는 예시로 성공 응답을 반환
    const paymentResponse = {
      success: true,
      paymentId: `toss_${Date.now()}`,
      redirectUrl:
        successUrl ||
        `${
          process.env.NEXT_PUBLIC_BASE_URL
        }/payment/success?paymentId=toss_${Date.now()}&orderId=${orderId}`,
    };

    // 결제 정보를 데이터베이스에 저장
    const { error: dbError } = await supabase.from('payments').insert({
      order_id: orderId,
      payment_method: 'card',
      amount: amount,
      status: 'pending',
      payment_provider: 'toss',
      payment_provider_id: paymentResponse.paymentId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
    });

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: '결제 정보 저장 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json(paymentResponse);
  } catch (error) {
    console.error('Toss payment error:', error);
    return NextResponse.json(
      { error: '결제 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
