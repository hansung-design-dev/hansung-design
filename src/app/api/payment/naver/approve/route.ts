import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

// 네이버페이 API 설정
const NAVER_API_URL = process.env.NAVER_API_URL || 'https://apis.naver.com';
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;
const NAVER_CHAIN_ID = process.env.NAVER_CHAIN_ID;

// 멱등성 키 생성 함수
function generateIdempotencyKey(): string {
  return `naver_approve_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, orderId } = body;

    // 필수 필드 검증
    if (!paymentId || !orderId) {
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

    // 네이버페이 결제 승인 API 호출
    const idempotencyKey = generateIdempotencyKey();
    const paymentApproveUrl = `${NAVER_API_URL}/${NAVER_CHAIN_ID}/naverpay/payments/v2/approve`;

    const approvePayload = {
      paymentId: paymentId,
    };

    try {
      const approveResponse = await fetch(paymentApproveUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Naver-Client-Id': NAVER_CLIENT_ID,
          'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
          'X-NaverPay-Chain-Id': NAVER_CHAIN_ID,
          'X-NaverPay-Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify(approvePayload),
      });

      if (!approveResponse.ok) {
        const errorData = await approveResponse.json();
        console.error('네이버페이 결제 승인 실패:', errorData);
        return NextResponse.json(
          { error: '결제 승인에 실패했습니다.' },
          { status: 400 }
        );
      }

      const approveData = await approveResponse.json();

      if (approveData.code !== 'Success') {
        console.error('네이버페이 결제 승인 오류:', approveData);
        return NextResponse.json(
          { error: approveData.message || '결제 승인에 실패했습니다.' },
          { status: 400 }
        );
      }

      const {
        paymentId: approvedPaymentId,
        totalPayAmount,
        payMethod,
      } = approveData.body;

      // 결제 정보 업데이트 (completed 상태)
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'completed',
          payment_provider_id: approvedPaymentId,
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', orderId)
        .eq('payment_method', 'naver');

      if (updateError) {
        console.error('Payment update error:', updateError);
        return NextResponse.json(
          { error: '결제 정보 업데이트 중 오류가 발생했습니다.' },
          { status: 500 }
        );
      }

      // 주문 상태도 업데이트
      const { error: orderUpdateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (orderUpdateError) {
        console.error('Order update error:', orderUpdateError);
        return NextResponse.json(
          { error: '주문 상태 업데이트 중 오류가 발생했습니다.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        paymentId: approvedPaymentId,
        amount: totalPayAmount,
        payMethod: payMethod,
        status: 'completed',
      });
    } catch (apiError) {
      console.error('네이버페이 API 호출 오류:', apiError);
      return NextResponse.json(
        { error: '결제 서비스 연결에 실패했습니다.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Naver payment approve error:', error);
    return NextResponse.json(
      { error: '결제 승인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
