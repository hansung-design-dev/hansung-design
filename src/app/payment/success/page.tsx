'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentInfo, setPaymentInfo] = useState<{
    paymentId: string;
    orderId: string;
  } | null>(null);

  useEffect(() => {
    const paymentId = searchParams.get('paymentId');
    const orderId = searchParams.get('orderId');

    if (paymentId && orderId) {
      setPaymentInfo({ paymentId, orderId });
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg
              className="h-8 w-8 text-green-600"
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
            결제가 완료되었습니다!
          </h1>

          <p className="text-gray-600 mb-6">
            주문이 성공적으로 처리되었습니다.
          </p>

          {paymentInfo && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600">
                <div className="flex justify-between mb-2">
                  <span>결제 ID:</span>
                  <span className="font-mono">{paymentInfo.paymentId}</span>
                </div>
                <div className="flex justify-between">
                  <span>주문 ID:</span>
                  <span className="font-mono">{paymentInfo.orderId}</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Link
              href="/mypage/orders"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors block"
            >
              주문 내역 확인
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
