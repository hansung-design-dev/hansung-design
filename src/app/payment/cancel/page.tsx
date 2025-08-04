'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Nav from '@/src/components/layouts/nav';

function PaymentCancelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cancelInfo, setCancelInfo] = useState<{
    orderId: string;
    cancelReason: string;
  } | null>(null);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const cancelReason = searchParams.get('cancelReason');

    if (orderId) {
      setCancelInfo({
        orderId,
        cancelReason: cancelReason || '사용자에 의해 취소되었습니다.',
      });
    }
  }, [searchParams]);

  const handleRetryPayment = () => {
    router.push('/cart');
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
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              결제가 취소되었습니다
            </h1>

            <p className="text-gray-600 mb-6">
              결제가 취소되었습니다. 언제든지 다시 결제하실 수 있습니다.
            </p>

            {cancelInfo && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">주문번호:</span>
                    <span className="font-medium">{cancelInfo.orderId}</span>
                  </div>
                  <div className="text-left">
                    <span className="text-gray-600">취소사유:</span>
                    <p className="text-yellow-700 mt-1">
                      {cancelInfo.cancelReason}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleRetryPayment}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                다시 결제하기
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

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentCancelContent />
    </Suspense>
  );
}
