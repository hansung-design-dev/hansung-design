'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentCancelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cancelInfo, setCancelInfo] = useState<{
    orderId: string;
  } | null>(null);

  useEffect(() => {
    const orderId = searchParams.get('orderId');

    if (orderId) {
      setCancelInfo({ orderId });
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
            <svg
              className="h-8 w-8 text-yellow-600"
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
            결제가 사용자에 의해 취소되었습니다.
          </p>

          {cancelInfo && (
            <div className="bg-yellow-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-yellow-800">
                <div className="flex justify-between">
                  <span>주문 ID:</span>
                  <span className="font-mono">{cancelInfo.orderId}</span>
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
