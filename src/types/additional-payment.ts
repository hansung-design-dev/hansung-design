// 추가 결제 방식
export type AdditionalPaymentMethod = 'pg_auto' | 'bank_transfer' | 'other';

// 추가 결제 상태
export type AdditionalPaymentStatus =
  | 'pending'
  | 'awaiting_payment'
  | 'completed'
  | 'failed'
  | 'cancelled';

// 추가 결제 상태 라벨
export const AdditionalPaymentStatusLabel: Record<
  AdditionalPaymentStatus,
  string
> = {
  pending: '대기',
  awaiting_payment: '결제 대기 중',
  completed: '결제 완료',
  failed: '결제 실패',
  cancelled: '취소됨',
};

// 추가 결제 인터페이스 (프론트엔드용 - 간소화)
export interface AdditionalPayment {
  id: string;
  order_id: string;
  order_detail_id: string | null;

  // 추가 결제 금액
  additional_amount: number;

  // 결제 방식 및 상태
  payment_method: AdditionalPaymentMethod;
  payment_status: AdditionalPaymentStatus;

  // 결제 링크
  payment_link_url: string | null;
  payment_link_expires_at: string | null;

  // 사유
  reason: string | null;

  // 처리 시간
  processed_at: string | null;

  // 타임스탬프
  created_at: string | null;
}

// 추가 결제 요약 정보 (주문 조회 시 포함)
export interface AdditionalPaymentSummary {
  total_additional_paid: number;
  additional_payment_count: number;
  pending_additional: number;
  additional_payments: AdditionalPayment[];
}
