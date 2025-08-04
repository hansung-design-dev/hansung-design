import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

// 네이버페이 API 설정
const NAVER_API_URL = process.env.NAVER_API_URL || 'https://apis.naver.com';
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;
const NAVER_CHAIN_ID = process.env.NAVER_CHAIN_ID;

// 멱등성 키 생성 함수
function generateIdempotencyKey(): string {
  return `naver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

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

    // 환경변수 검증
    if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET || !NAVER_CHAIN_ID) {
      console.error('네이버페이 API 키가 설정되지 않았습니다.');
      return NextResponse.json(
        { error: '결제 서비스 설정 오류입니다.' },
        { status: 500 }
      );
    }

    // 네이버페이 결제 예약 API 호출
    const idempotencyKey = generateIdempotencyKey();
    const paymentReservationUrl = `${NAVER_API_URL}/${NAVER_CHAIN_ID}/naverpay/payments/v2/reserve`;

    const reservationPayload = {
      merchantPayKey: orderId,
      productName: orderName,
      totalPayAmount: amount,
      taxScopeAmount: amount,
      taxExScopeAmount: 0,
      returnUrl:
        successUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
      cancelUrl:
        cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancel`,
      failUrl: failUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/payment/fail`,
      productList: [
        {
          categoryType: 'MAIN',
          categoryId: '1',
          uid: orderId,
          name: orderName,
          count: 1,
          payAmount: amount,
        },
      ],
      userInfo: {
        userName: customerName,
        userEmail: customerEmail,
        userPhone: customerPhone,
      },
    };

    try {
      const reservationResponse = await fetch(paymentReservationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Naver-Client-Id': NAVER_CLIENT_ID,
          'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
          'X-NaverPay-Chain-Id': NAVER_CHAIN_ID,
          'X-NaverPay-Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify(reservationPayload),
      });

      if (!reservationResponse.ok) {
        const errorData = await reservationResponse.json();
        console.error('네이버페이 결제 예약 실패:', errorData);
        return NextResponse.json(
          { error: '결제 예약에 실패했습니다.' },
          { status: 400 }
        );
      }

      const reservationData = await reservationResponse.json();

      if (reservationData.code !== 'Success') {
        console.error('네이버페이 결제 예약 오류:', reservationData);
        return NextResponse.json(
          { error: reservationData.message || '결제 예약에 실패했습니다.' },
          { status: 400 }
        );
      }

      const { paymentId, paymentUrl } = reservationData.body;

      // 결제 정보를 데이터베이스에 저장 (pending 상태)
      const { error: dbError } = await supabase.from('payments').insert({
        order_id: orderId,
        payment_method: 'naver',
        amount: amount,
        status: 'pending',
        payment_provider: 'naver',
        payment_provider_id: paymentId,
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

      // 네이버페이 결제 페이지로 리다이렉트
      return NextResponse.json({
        success: true,
        paymentId: paymentId,
        redirectUrl: paymentUrl,
        status: 'pending',
      });
    } catch (apiError) {
      console.error('네이버페이 API 호출 오류:', apiError);
      return NextResponse.json(
        { error: '결제 서비스 연결에 실패했습니다.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Naver payment error:', error);
    return NextResponse.json(
      { error: '결제 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
