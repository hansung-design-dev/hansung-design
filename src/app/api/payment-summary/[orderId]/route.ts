import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Refund } from '@/src/types/refund';
import type { AdditionalPayment } from '@/src/types/additional-payment';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface PaymentSummaryResponse {
  success: boolean;
  data?: {
    // 기본 결제 정보
    original_amount: number;
    payment_id: string | null;

    // 환불 정보
    total_refunded: number;
    refund_count: number;
    pending_refund_amount: number;
    refunds: Refund[];

    // 추가 결제 정보
    total_additional_paid: number;
    additional_payment_count: number;
    pending_additional_amount: number;
    additional_payments: AdditionalPayment[];

    // 계산된 금액
    net_amount: number;
  };
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
): Promise<NextResponse<PaymentSummaryResponse>> {
  const { orderId } = await params;

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. 주문의 결제 정보 조회
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('id, amount, total_refunded, total_additional_paid, refund_count, additional_payment_count')
      .eq('order_id', orderId)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json({
        success: false,
        error: 'Payment not found',
      });
    }

    // 2. 환불 목록 조회
    const { data: refunds, error: refundsError } = await supabase
      .from('refunds')
      .select('id, order_id, order_detail_id, refund_amount, refund_method, refund_status, refund_reason, created_at, processed_at')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (refundsError) {
      console.error('Error fetching refunds:', refundsError);
    }

    // 3. 추가 결제 목록 조회
    const { data: additionalPayments, error: additionalError } = await supabase
      .from('additional_payments')
      .select('id, order_id, order_detail_id, additional_amount, payment_method, payment_status, reason, payment_link_url, payment_link_expires_at, created_at, processed_at')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (additionalError) {
      console.error('Error fetching additional payments:', additionalError);
    }

    const refundList: Refund[] = (refunds || []).map((r) => ({
      id: r.id,
      order_id: r.order_id,
      order_detail_id: r.order_detail_id,
      refund_amount: r.refund_amount,
      refund_method: r.refund_method,
      refund_status: r.refund_status,
      refund_reason: r.refund_reason,
      created_at: r.created_at,
      processed_at: r.processed_at,
    }));

    const additionalPaymentList: AdditionalPayment[] = (additionalPayments || []).map((p) => ({
      id: p.id,
      order_id: p.order_id,
      order_detail_id: p.order_detail_id,
      additional_amount: p.additional_amount,
      payment_method: p.payment_method,
      payment_status: p.payment_status,
      reason: p.reason,
      payment_link_url: p.payment_link_url,
      payment_link_expires_at: p.payment_link_expires_at,
      created_at: p.created_at,
      processed_at: p.processed_at,
    }));

    // 대기 중인 환불/추가결제 금액 계산
    const pendingRefundAmount = refundList
      .filter((r) => r.refund_status === 'pending' || r.refund_status === 'processing')
      .reduce((sum, r) => sum + r.refund_amount, 0);

    const pendingAdditionalAmount = additionalPaymentList
      .filter((p) => p.payment_status === 'pending' || p.payment_status === 'awaiting_payment')
      .reduce((sum, p) => sum + p.additional_amount, 0);

    const originalAmount = payment.amount || 0;
    const totalRefunded = payment.total_refunded || 0;
    const totalAdditionalPaid = payment.total_additional_paid || 0;
    const netAmount = originalAmount - totalRefunded + totalAdditionalPaid;

    return NextResponse.json({
      success: true,
      data: {
        original_amount: originalAmount,
        payment_id: payment.id,
        total_refunded: totalRefunded,
        refund_count: payment.refund_count || 0,
        pending_refund_amount: pendingRefundAmount,
        refunds: refundList,
        total_additional_paid: totalAdditionalPaid,
        additional_payment_count: payment.additional_payment_count || 0,
        pending_additional_amount: pendingAdditionalAmount,
        additional_payments: additionalPaymentList,
        net_amount: netAmount,
      },
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    });
  }
}
