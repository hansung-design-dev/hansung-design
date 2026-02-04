'use client';
import { useState, useEffect } from 'react';
import type { Refund, RefundStatus } from '@/src/types/refund';
import type { AdditionalPayment, AdditionalPaymentStatus } from '@/src/types/additional-payment';

interface PaymentSummary {
  original_amount: number;
  payment_id: string | null;
  total_refunded: number;
  refund_count: number;
  pending_refund_amount: number;
  refunds: Refund[];
  total_additional_paid: number;
  additional_payment_count: number;
  pending_additional_amount: number;
  additional_payments: AdditionalPayment[];
  net_amount: number;
}

interface PaymentSummarySectionProps {
  orderId: string;
}

// 환불 상태 라벨
const REFUND_STATUS_LABEL: Record<RefundStatus, string> = {
  pending: '대기',
  processing: '처리 중',
  completed: '완료',
  failed: '실패',
  cancelled: '취소',
};

// 추가 결제 상태 라벨
const ADDITIONAL_PAYMENT_STATUS_LABEL: Record<AdditionalPaymentStatus, string> = {
  pending: '대기',
  awaiting_payment: '결제 대기',
  completed: '완료',
  failed: '실패',
  cancelled: '취소',
};

// 상태별 색상
const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-700';
    case 'pending':
    case 'awaiting_payment':
      return 'bg-yellow-100 text-yellow-700';
    case 'processing':
      return 'bg-blue-100 text-blue-700';
    case 'failed':
    case 'cancelled':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export default function PaymentSummarySection({ orderId }: PaymentSummarySectionProps) {
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentSummary();
  }, [orderId]);

  const fetchPaymentSummary = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/payment-summary/${orderId}`);
      const data = await response.json();

      if (data.success && data.data) {
        setSummary(data.data);
      } else {
        setSummary(null);
      }
    } catch (err) {
      console.error('결제 요약 조회 오류:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      setLoading(false);
    }
  };

  // 데이터가 없거나 환불/추가결제가 없으면 표시하지 않음
  if (loading || !summary) {
    return null;
  }

  // 환불 또는 추가결제가 하나라도 있을 때만 표시
  const hasRefundsOrAdditional =
    summary.refunds.length > 0 || summary.additional_payments.length > 0;

  if (!hasRefundsOrAdditional) {
    return null;
  }

  return (
    <div className="border-t border-gray-200 pt-4 space-y-4">
      <div className="text-sm font-semibold text-gray-900">■ 결제 요약</div>

      {/* 금액 요약 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-sm">
        <div className="bg-gray-50 rounded p-2">
          <div className="text-xs text-gray-500">원 결제금액</div>
          <div className="font-medium">{summary.original_amount.toLocaleString()}원</div>
        </div>
        {summary.total_refunded > 0 && (
          <div className="bg-orange-50 rounded p-2">
            <div className="text-xs text-orange-600">환불</div>
            <div className="font-medium text-orange-700">
              -{summary.total_refunded.toLocaleString()}원
            </div>
          </div>
        )}
        {summary.total_additional_paid > 0 && (
          <div className="bg-blue-50 rounded p-2">
            <div className="text-xs text-blue-600">추가 결제</div>
            <div className="font-medium text-blue-700">
              +{summary.total_additional_paid.toLocaleString()}원
            </div>
          </div>
        )}
        <div className="bg-green-50 rounded p-2">
          <div className="text-xs text-green-600">최종 금액</div>
          <div className="font-medium text-green-700">
            {summary.net_amount.toLocaleString()}원
          </div>
        </div>
      </div>

      {/* 대기 중인 환불/추가결제 알림 */}
      {(summary.pending_refund_amount > 0 || summary.pending_additional_amount > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
          {summary.pending_refund_amount > 0 && (
            <p className="text-yellow-700">
              환불 대기 중: {summary.pending_refund_amount.toLocaleString()}원
            </p>
          )}
          {summary.pending_additional_amount > 0 && (
            <p className="text-yellow-700">
              추가 결제 대기 중: {summary.pending_additional_amount.toLocaleString()}원
              {summary.additional_payments.some(
                (p) => p.payment_status === 'awaiting_payment' && p.payment_link_url
              ) && (
                <span className="block mt-1">
                  아래 결제 링크를 클릭하여 결제를 진행해주세요.
                </span>
              )}
            </p>
          )}
        </div>
      )}

      {/* 환불 내역 */}
      {summary.refunds.length > 0 && (
        <div>
          <div className="text-xs font-medium text-gray-600 mb-1">환불 내역</div>
          <div className="space-y-1">
            {summary.refunds.map((refund) => (
              <div
                key={refund.id}
                className="flex items-center justify-between text-xs bg-gray-50 rounded px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded ${getStatusColor(refund.refund_status)}`}>
                    {REFUND_STATUS_LABEL[refund.refund_status]}
                  </span>
                  <span className="text-gray-600">{refund.refund_reason || '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-orange-600">
                    -{refund.refund_amount.toLocaleString()}원
                  </span>
                  <span className="text-gray-400">
                    {refund.created_at ? new Date(refund.created_at).toLocaleDateString() : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 추가 결제 내역 */}
      {summary.additional_payments.length > 0 && (
        <div>
          <div className="text-xs font-medium text-gray-600 mb-1">추가 결제 내역</div>
          <div className="space-y-1">
            {summary.additional_payments.map((payment) => (
              <div key={payment.id} className="bg-gray-50 rounded px-3 py-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded ${getStatusColor(payment.payment_status)}`}
                    >
                      {ADDITIONAL_PAYMENT_STATUS_LABEL[payment.payment_status]}
                    </span>
                    <span className="text-gray-600">{payment.reason || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-blue-600">
                      +{payment.additional_amount.toLocaleString()}원
                    </span>
                    <span className="text-gray-400">
                      {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : ''}
                    </span>
                  </div>
                </div>
                {/* 결제 링크 (대기 중인 경우) */}
                {payment.payment_status === 'awaiting_payment' && payment.payment_link_url && (
                  <div className="mt-2">
                    <a
                      href={payment.payment_link_url}
                      className="inline-block text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      결제하기
                    </a>
                    {payment.payment_link_expires_at && (
                      <span className="ml-2 text-xs text-gray-500">
                        (만료: {new Date(payment.payment_link_expires_at).toLocaleString()})
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
