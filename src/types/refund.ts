// 환불 방식
export type RefundMethod = 'pg_auto' | 'bank_transfer' | 'other';

// 환불 상태
export type RefundStatus = 'pending' | 'processing' | 'completed' | 'failed';

// 환불 상태 라벨
export const RefundStatusLabel: Record<RefundStatus, string> = {
  pending: '환불 대기',
  processing: '환불 처리 중',
  completed: '환불 완료',
  failed: '환불 실패',
};

// 환불 인터페이스 (프론트엔드용 - 간소화)
export interface Refund {
  id: string;
  order_id: string;
  order_detail_id: string | null;

  // 환불 금액
  refund_amount: number;

  // 환불 방식 및 상태
  refund_method: RefundMethod;
  refund_status: RefundStatus;

  // 환불 사유
  refund_reason: string | null;

  // 처리 시간
  processed_at: string | null;

  // 타임스탬프
  created_at: string | null;
}

// 환불 요약 정보 (주문 조회 시 포함)
export interface RefundSummary {
  total_refunded: number;
  refund_count: number;
  pending_refund: number;
  refunds: Refund[];
}
