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

    // 카카오페이 결제 요청 생성
    const kakaoPaymentRequest = {
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
      paymentMethod: 'KAKAOPAY',
    };

    // 카카오페이 API 호출 (실제 구현에서는 카카오페이 SDK 사용)
    // 여기서는 예시로 성공 응답을 반환
    const paymentResponse = {
      success: true,
      paymentId: `kakao_${Date.now()}`,
      redirectUrl:
        successUrl ||
        `${
          process.env.NEXT_PUBLIC_BASE_URL
        }/payment/success?paymentId=kakao_${Date.now()}&orderId=${orderId}`,
    };

    // 결제 정보를 데이터베이스에 저장
    const { error: dbError } = await supabase.from('payments').insert({
      order_id: orderId,
      payment_method: 'kakao',
      amount: amount,
      status: 'pending',
      payment_provider: 'kakao',
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
    console.error('Kakao payment error:', error);
    return NextResponse.json(
      { error: '결제 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
