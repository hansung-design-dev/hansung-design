import { PaymentRequest, PaymentResponse } from '@/src/types/payment';

// 토스페이먼츠 결제 처리
export async function processTossPayment(
  paymentRequest: PaymentRequest
): Promise<PaymentResponse> {
  try {
    const response = await fetch('/api/payment/toss', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentRequest),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Toss payment error:', error);
    return {
      success: false,
      errorCode: 'PAYMENT_ERROR',
      errorMessage: '결제 처리 중 오류가 발생했습니다.',
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
