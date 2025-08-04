'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Nav from '@/src/components/layouts/nav';

function PaymentFailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorInfo, setErrorInfo] = useState<{
    errorCode: string;
    errorMessage: string;
    orderId: string;
  } | null>(null);

  useEffect(() => {
    const errorCode = searchParams.get('errorCode');
    const errorMessage = searchParams.get('errorMessage');
    const orderId = searchParams.get('orderId');

    if (errorCode || errorMessage) {
      setErrorInfo({
        errorCode: errorCode || 'UNKNOWN_ERROR',
        errorMessage: errorMessage || '알 수 없는 오류가 발생했습니다.',
        orderId: orderId || '',
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
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              결제에 실패했습니다
            </h1>

            <p className="text-gray-600 mb-6">
              결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.
            </p>

            {errorInfo && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="space-y-2 text-sm">
                  {errorInfo.orderId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">주문번호:</span>
                      <span className="font-medium">{errorInfo.orderId}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">오류코드:</span>
                    <span className="font-medium text-red-600">
                      {errorInfo.errorCode}
                    </span>
                  </div>
                  <div className="text-left">
                    <span className="text-gray-600">오류내용:</span>
                    <p className="text-red-600 mt-1">
                      {errorInfo.errorMessage}
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

export default function PaymentFailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentFailContent />
    </Suspense>
  );
}
