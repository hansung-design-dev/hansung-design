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

    // 계좌이체 결제 요청 생성
    const bankTransferRequest = {
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
      paymentMethod: 'BANK_TRANSFER',
    };

    // 계좌이체는 입금확인중 상태로 처리
    const bankTransferResponse = {
      success: true,
      paymentId: `bank_${Date.now()}`,
      redirectUrl: `${
        process.env.NEXT_PUBLIC_BASE_URL
      }/payment/success?paymentId=bank_${Date.now()}&orderId=${orderId}&amount=${amount}&status=pending_deposit`,
      // 계좌이체는 입금확인중 상태로 저장
      status: 'pending_deposit',
    };

    // 결제 정보를 데이터베이스에 저장
    const { error: dbError } = await supabase.from('payments').insert({
      order_id: orderId,
      payment_method: 'bank_transfer',
      amount: amount,
      status: bankTransferResponse.status,
      payment_provider: 'bank_transfer',
      payment_provider_id: bankTransferResponse.paymentId,
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

    return NextResponse.json(bankTransferResponse);
  } catch (error) {
    console.error('Bank transfer payment error:', error);
    return NextResponse.json(
      { error: '결제 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
