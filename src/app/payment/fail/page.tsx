'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentFailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorInfo, setErrorInfo] = useState<{
    code: string;
    message: string;
    orderId: string;
  } | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const message = searchParams.get('message');
    const orderId = searchParams.get('orderId');

    if (code && message && orderId) {
      setErrorInfo({ code, message, orderId });
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg
              className="h-8 w-8 text-red-600"
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
            <div className="bg-red-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-red-600">
                <div className="flex justify-between mb-2">
                  <span>오류 코드:</span>
                  <span className="font-mono">{errorInfo.code}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>오류 메시지:</span>
                  <span className="font-mono">{errorInfo.message}</span>
                </div>
                <div className="flex justify-between">
                  <span>주문 ID:</span>
                  <span className="font-mono">{errorInfo.orderId}</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Link
              href="/cart"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors block"
            >
              장바구니로 돌아가기
            </Link>

            <Link
              href="/"
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors block"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
