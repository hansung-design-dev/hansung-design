'use client';

import { useState } from 'react';
import { useAuth } from '@/src/contexts/authContext';
import { useRouter } from 'next/navigation';

export default function TestOrderPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  const createTestOrder = async () => {
    if (!user) {
      setMessage('로그인이 필요합니다.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          total_price: 500000,
          panel_id: 'test-panel-1',
          order_details: [
            {
              slot_id: 'test-slot-1',
              quantity: 1,
              unit_price: 250000,
              total_price: 250000,
              start_date: '2025-01-01',
              end_date: '2025-01-31',
            },
            {
              slot_id: 'test-slot-2',
              quantity: 1,
              unit_price: 250000,
              total_price: 250000,
              start_date: '2025-02-01',
              end_date: '2025-02-28',
            },
          ],
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('테스트 주문이 생성되었습니다!');
      } else {
        setMessage(data.error || '주문 생성에 실패했습니다.');
      }
    } catch {
      setMessage('주문 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const createTestInquiry = async () => {
    if (!user) {
      setMessage('로그인이 필요합니다.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/customer-service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '테스트 문의입니다',
          content: '이것은 테스트를 위한 1:1 상담 문의입니다.',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('테스트 문의가 생성되었습니다!');
      } else {
        setMessage(data.error || '문의 생성에 실패했습니다.');
      }
    } catch {
      setMessage('문의 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">테스트 페이지</h1>

        <div className="space-y-4">
          <button
            onClick={createTestOrder}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? '생성 중...' : '테스트 주문 생성'}
          </button>

          <button
            onClick={createTestInquiry}
            disabled={loading}
            className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? '생성 중...' : '테스트 문의 생성'}
          </button>

          <button
            onClick={() => router.push('/mypage/orders')}
            className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            주문내역 보기
          </button>

          <button
            onClick={() => router.push('/mypage/customer-service')}
            className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            1:1 상담 보기
          </button>
        </div>

        {message && (
          <div className="mt-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
