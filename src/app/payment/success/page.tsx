'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Nav from '@/src/components/layouts/nav';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentInfo, setPaymentInfo] = useState<{
    paymentId: string;
    orderId: string;
    amount: number;
    status?: string;
  } | null>(null);

  useEffect(() => {
    const paymentId = searchParams.get('paymentId');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');
    const status = searchParams.get('status');

    if (paymentId && orderId) {
      setPaymentInfo({
        paymentId,
        orderId,
        amount: amount ? parseInt(amount) : 0,
        status: status || undefined,
      });
    }
  }, [searchParams]);

  const handleGoToOrders = () => {
    router.push('/mypage/orders');
  };

  const handleGoToHome = () => {
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-white pt-[5.5rem] bg-gray-100 lg:px-[10rem]">
      <Nav variant="default" className="bg-white" />

      <div className="container mx-auto px-4 sm:px-1 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {paymentInfo?.status === 'pending_deposit'
                ? '입금 확인 중입니다'
                : '결제가 완료되었습니다!'}
            </h1>

            <p className="text-gray-600 mb-6">
              {paymentInfo?.status === 'pending_deposit'
                ? '계좌이체 주문이 접수되었습니다. 입금 확인 후 주문이 처리됩니다.'
                : '주문이 성공적으로 처리되었습니다.'}
            </p>

            {paymentInfo && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">주문번호:</span>
                    <span className="font-medium">{paymentInfo.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">결제번호:</span>
                    <span className="font-medium">{paymentInfo.paymentId}</span>
                  </div>
                  {paymentInfo.amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">결제금액:</span>
                      <span className="font-medium">
                        {paymentInfo.amount.toLocaleString()}원
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleGoToOrders}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                주문 내역 보기
              </button>

              <button
                onClick={handleGoToHome}
                className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                홈으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
