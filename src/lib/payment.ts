import { PaymentRequest, PaymentResponse } from '@/src/types/payment';
import { loadTossPayments } from '@tosspayments/payment-sdk';

// 토스페이먼츠 결제 처리
export async function processTossPayment(
  paymentRequest: PaymentRequest
): Promise<PaymentResponse> {
  try {
    if (typeof window === 'undefined') {
      return {
        success: false,
        errorCode: 'NO_WINDOW',
        errorMessage: '클라이언트 환경에서만 결제가 가능합니다.',
      };
    }

    const clientKey = process.env
      .NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY as string;
    if (!clientKey) {
      return {
        success: false,
        errorCode: 'NO_CLIENT_KEY',
        errorMessage: '토스 클라이언트 키가 설정되지 않았습니다.',
      };
    }

    // orderId 검증 및 정리 (토스페이먼츠 요구사항: 영문, 숫자, 언더스코어, 하이픈만 허용)
    const sanitizedOrderId = paymentRequest.orderId.replace(
      /[^a-zA-Z0-9_-]/g,
      ''
    );

    // 전화번호 형식 검증 및 정리 (숫자만 남기고 하이픈 제거)
    const sanitizedPhone = paymentRequest.customerPhone.replace(/\D/g, '');

    // 필수 파라미터 검증
    if (!sanitizedOrderId || sanitizedOrderId.length === 0) {
      return {
        success: false,
        errorCode: 'INVALID_ORDER_ID',
        errorMessage: '주문 ID가 유효하지 않습니다.',
      };
    }

    if (!sanitizedPhone || sanitizedPhone.length < 10) {
      return {
        success: false,
        errorCode: 'INVALID_PHONE',
        errorMessage: '전화번호가 유효하지 않습니다.',
      };
    }

    // Debug: log required payload fields for verification
    // Do NOT log clientKey itself
    // Required by Toss requestPayment('카드', ...) for widget redirect mode
    console.log('[TOSS] requestPayment payload check', {
      method: '카드',
      amount: paymentRequest.amount,
      orderId: sanitizedOrderId,
      orderName: paymentRequest.orderName,
      customerName: paymentRequest.customerName,
      customerEmail: paymentRequest.customerEmail,
      customerMobilePhone: sanitizedPhone,
      successUrl: paymentRequest.successUrl,
      failUrl: paymentRequest.failUrl,
    });

    const tossPayments = await loadTossPayments(clientKey);

    // 토스페이먼츠 payment-sdk의 올바른 형식
    await tossPayments.requestPayment('카드', {
      amount: paymentRequest.amount,
      orderId: sanitizedOrderId,
      orderName: paymentRequest.orderName,
      customerName: paymentRequest.customerName,
      customerEmail: paymentRequest.customerEmail,
      customerMobilePhone: sanitizedPhone,
      successUrl: paymentRequest.successUrl,
      failUrl: paymentRequest.failUrl,
    });

    // requestPayment will redirect; this return is mostly unreachable
    return { success: true } as PaymentResponse;
  } catch (error: unknown) {
    console.error('Toss payment error:', error);
    const errorObj = error as { code?: string; message?: string };
    return {
      success: false,
      errorCode: errorObj?.code || 'PAYMENT_ERROR',
      errorMessage: errorObj?.message || '결제 처리 중 오류가 발생했습니다.',
    };
  }
}

// 카카오페이 결제 처리
export async function processKakaoPayment(
  paymentRequest: PaymentRequest
): Promise<PaymentResponse> {
  try {
    const response = await fetch('/api/payment/kakao', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentRequest),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Kakao payment error:', error);
    return {
      success: false,
      errorCode: 'PAYMENT_ERROR',
      errorMessage: '결제 처리 중 오류가 발생했습니다.',
    };
  }
}

// 네이버페이 결제 처리
export async function processNaverPayment(
  paymentRequest: PaymentRequest
): Promise<PaymentResponse> {
  try {
    const response = await fetch('/api/payment/naver', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentRequest),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Naver payment error:', error);
    return {
      success: false,
      errorCode: 'PAYMENT_ERROR',
      errorMessage: '결제 처리 중 오류가 발생했습니다.',
    };
  }
}

// 계좌이체 결제 처리
export async function processBankTransferPayment(
  paymentRequest: PaymentRequest
): Promise<PaymentResponse> {
  try {
    const response = await fetch('/api/payment/bank-transfer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentRequest),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Bank transfer payment error:', error);
    return {
      success: false,
      errorCode: 'PAYMENT_ERROR',
      errorMessage: '결제 처리 중 오류가 발생했습니다.',
    };
  }
}

// 결제 수단에 따른 결제 처리 함수
export async function processPayment(
  method: string,
  paymentRequest: PaymentRequest
): Promise<PaymentResponse> {
  switch (method) {
    case 'card':
      return processTossPayment(paymentRequest);
    case 'kakao':
      return processKakaoPayment(paymentRequest);
    case 'naver':
      return processNaverPayment(paymentRequest);
    case 'bank_transfer':
      return processBankTransferPayment(paymentRequest);
    default:
      return {
        success: false,
        errorCode: 'INVALID_METHOD',
        errorMessage: '지원하지 않는 결제 수단입니다.',
      };
  }
}

// 결제 금액 포맷팅
export function formatPaymentAmount(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount);
}

// 결제 상태 메시지
export function getPaymentStatusMessage(status: string): string {
  switch (status) {
    case 'success':
      return '결제가 완료되었습니다.';
    case 'failed':
      return '결제에 실패했습니다.';
    case 'cancelled':
      return '결제가 취소되었습니다.';
    case 'pending':
      return '결제 처리 중입니다.';
    default:
      return '알 수 없는 상태입니다.';
  }
}
