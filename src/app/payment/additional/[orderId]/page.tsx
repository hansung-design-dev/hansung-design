'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Nav from '@/src/components/layouts/nav';
import { Button } from '@/src/components/button/button';
import type { AdditionalPayment } from '@/src/types/additional-payment';

interface OrderInfo {
  id: string;
  order_number: string;
  order_status: string;
  user_auth?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

function AdditionalPaymentContent({ orderId }: { orderId: string }) {
  const searchParams = useSearchParams();
  const amountParam = searchParams.get('amount');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [additionalPayments, setAdditionalPayments] = useState<AdditionalPayment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<AdditionalPayment | null>(null);

  // 토스페이먼츠 결제 진행 중
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [orderId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. 주문 정보 조회
      const orderResponse = await fetch(`/api/orders/${orderId}`);
      if (!orderResponse.ok) {
        throw new Error('주문 정보를 찾을 수 없습니다.');
      }
      const orderData = await orderResponse.json();
      if (orderData.success && orderData.data) {
        setOrderInfo({
          id: orderData.data.order?.id || orderId,
          order_number: orderData.data.order?.order_number || '-',
          order_status: orderData.data.order?.order_status || '-',
          user_auth: orderData.data.order?.user_auth,
        });
      }

      // 2. 추가 결제 목록 조회
      const summaryResponse = await fetch(`/api/payment-summary/${orderId}`);
      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        if (summaryData.success && summaryData.data) {
          // 대기 중인 추가 결제만 필터링
          const pendingPayments = summaryData.data.additional_payments.filter(
            (p: AdditionalPayment) =>
              p.payment_status === 'pending' || p.payment_status === 'awaiting_payment'
          );
          setAdditionalPayments(pendingPayments);

          // URL의 amount와 일치하는 추가 결제 선택
          if (amountParam) {
            const targetAmount = parseInt(amountParam, 10);
            const matchingPayment = pendingPayments.find(
              (p: AdditionalPayment) => p.additional_amount === targetAmount
            );
            if (matchingPayment) {
              setSelectedPayment(matchingPayment);
            }
          }
        }
      }
    } catch (err) {
      console.error('데이터 조회 오류:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (payment: AdditionalPayment) => {
    try {
      setIsProcessing(true);

      // 토스페이먼츠 결제 요청
      // 실제 구현에서는 토스페이먼츠 SDK를 사용하여 결제를 진행합니다.
      // 여기서는 기본적인 구조만 제공합니다.

      const paymentData = {
        orderId: `ADDPAY_${payment.id}_${Date.now()}`,
        orderName: `추가 결제 - ${orderInfo?.order_number || orderId}`,
        amount: payment.additional_amount,
        customerName: orderInfo?.user_auth?.name || '고객',
        customerEmail: orderInfo?.user_auth?.email || '',
        customerMobilePhone: orderInfo?.user_auth?.phone || '',
        successUrl: `${window.location.origin}/payment/additional/${orderId}/success?additionalPaymentId=${payment.id}`,
        failUrl: `${window.location.origin}/payment/additional/${orderId}/fail?additionalPaymentId=${payment.id}`,
      };

      // 토스페이먼츠 SDK 호출 (실제 구현 필요)
      // 현재는 간단한 안내 메시지 표시
      alert(
        `결제 금액: ${payment.additional_amount.toLocaleString()}원\n\n토스페이먼츠 결제 연동이 필요합니다.\n관리자에게 문의해주세요.`
      );

      console.log('결제 요청 데이터:', paymentData);
    } catch (err) {
      console.error('결제 처리 오류:', err);
      alert('결제 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">결제 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">!</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">오류가 발생했습니다</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button variant="outlinedGray" onClick={() => window.history.back()}>
            돌아가기
          </Button>
        </div>
      </div>
    );
  }

  if (additionalPayments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-green-500 text-4xl mb-4">✓</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">결제할 항목이 없습니다</h2>
          <p className="text-gray-600 mb-4">모든 추가 결제가 완료되었거나 대기 중인 결제가 없습니다.</p>
          <Button variant="outlinedGray" onClick={() => (window.location.href = '/mypage/orders')}>
            주문 내역으로 이동
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">추가 결제</h1>

      {/* 주문 정보 */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h2 className="text-sm font-medium text-gray-600 mb-2">주문 정보</h2>
        <div className="text-lg font-semibold">{orderInfo?.order_number || '-'}</div>
      </div>

      {/* 추가 결제 목록 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">결제 대기 항목</h2>
        {additionalPayments.map((payment) => (
          <div
            key={payment.id}
            className={`border rounded-lg p-4 ${
              selectedPayment?.id === payment.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    payment.payment_status === 'awaiting_payment'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {payment.payment_status === 'awaiting_payment' ? '결제 대기' : '대기'}
                </span>
              </div>
              <div className="text-lg font-bold text-blue-600">
                {payment.additional_amount.toLocaleString()}원
              </div>
            </div>
            {payment.reason && <p className="text-sm text-gray-600 mb-3">{payment.reason}</p>}
            <Button
              variant="filledBlack"
              size="md"
              className="w-full"
              onClick={() => handlePayment(payment)}
              disabled={isProcessing}
            >
              {isProcessing ? '처리 중...' : '결제하기'}
            </Button>
          </div>
        ))}
      </div>

      {/* 안내 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
        <p className="font-medium mb-2">안내사항</p>
        <ul className="list-disc list-inside space-y-1">
          <li>결제 완료 후 주문 내역에서 확인하실 수 있습니다.</li>
          <li>결제 관련 문의는 고객센터로 연락해주세요.</li>
        </ul>
      </div>
    </div>
  );
}

export default function AdditionalPaymentPage({
  params,
}: {
  params: { orderId: string };
}) {
  return (
    <main className="min-h-screen flex flex-col bg-gray-100">
      <Nav variant="default" className="bg-white" />
      <div className="flex-1 py-8">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          }
        >
          <AdditionalPaymentContent orderId={params.orderId} />
        </Suspense>
      </div>
    </main>
  );
}
