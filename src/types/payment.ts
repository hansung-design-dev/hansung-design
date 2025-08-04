// 결제 관련 타입 정의

export interface PaymentMethod {
  id: string;
  name: string;
  code: 'card' | 'kakao' | 'naver' | 'bank_transfer';
  icon: string;
  description: string;
}

export interface PaymentRequest {
  orderId: string;
  amount: number;
  orderName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  successUrl: string;
  failUrl: string;
  cancelUrl: string;
}

export interface TossPaymentRequest extends PaymentRequest {
  method: 'card';
  cardCompany?: string;
}

export interface KakaoPaymentRequest extends PaymentRequest {
  method: 'kakao';
}

export interface NaverPaymentRequest extends PaymentRequest {
  method: 'naver';
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  errorCode?: string;
  errorMessage?: string;
  redirectUrl?: string;
}

export interface PaymentCallback {
  paymentId: string;
  orderId: string;
  amount: number;
  status: 'success' | 'failed' | 'cancelled';
  method: string;
  timestamp: string;
}

// 결제 수단 정의
export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'card',
    name: '카드결제',
    code: 'card',
    icon: '/svg/card-pay.svg',
    description: '신용카드, 체크카드로 결제',
  },
  {
    id: 'kakao',
    name: '카카오페이',
    code: 'kakao',
    icon: '/svg/kakao-pay.svg',
    description: '카카오페이로 간편결제',
  },
  {
    id: 'naver',
    name: '네이버페이',
    code: 'naver',
    icon: '/svg/naver-pay.svg',
    description: '네이버페이로 간편결제',
  },
  {
    id: 'bank_transfer',
    name: '계좌이체',
    code: 'bank_transfer',
    icon: '/svg/bank_transfer.svg',
    description: '실시간 계좌이체',
  },
];
