'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/contexts/authContext';
import Nav from '@/src/components/layouts/nav';
import { Button } from '@/src/components/button/button';
import { useRouter } from 'next/navigation';

interface OrderDetail {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface DesignDraft {
  id: string;
  draft_category: string;
  file_name?: string;
  created_at: string;
  is_approved: boolean;
  draft_delivery_method?: string;
}

interface Order {
  id: string;
  order_number: string;
  total_price: number;
  payment_status: string;
  admin_approval_status: string;
  created_at: string;
  updated_at: string;
  design_drafts?: DesignDraft[];
  order_details?: OrderDetail[];
}

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }

    fetchOrders();
  }, [user, router]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();

      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // 결제 승인 후 결제하기 버튼 클릭 처리
  const handleApprovedPayment = async (orderId: string) => {
    try {
      // 결제 페이지로 이동 (선택된 주문 ID 전달)
      const selectedItemsParam = encodeURIComponent(JSON.stringify([orderId]));
      router.push(`/payment?items=${selectedItemsParam}&approved=true`);
    } catch (error) {
      console.error('Payment navigation error:', error);
      alert('결제 페이지로 이동 중 오류가 발생했습니다.');
    }
  };

  const getStatusText = (order: Order) => {
    if (order.payment_status === 'completed') {
      return '결제완료';
    } else if (order.payment_status === 'waiting_admin_approval') {
      return '결제대기';
    } else if (order.admin_approval_status === 'approved') {
      return '승인완료';
    } else if (order.payment_status === 'pending') {
      return '결제대기';
    }
    return '처리중';
  };

  const getStatusColor = (order: Order) => {
    if (order.payment_status === 'completed') {
      return 'text-green-600';
    } else if (order.admin_approval_status === 'approved') {
      return 'text-blue-600';
    } else if (order.payment_status === 'waiting_admin_approval') {
      return 'text-orange-600';
    }
    return 'text-gray-600';
  };

  const canProceedToPayment = (order: Order) => {
    // 공공기관/기관용 사용자이고 어드민 승인이 완료된 경우
    return (
      order.admin_approval_status === 'approved' &&
      order.payment_status !== 'completed'
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white pt-[5.5rem]">
        <Nav variant="default" className="bg-white" />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">로딩 중...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pt-[5.5rem]">
      <Nav variant="default" className="bg-white" />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">주문내역</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">주문내역이 없습니다.</p>
            <Button
              onClick={() => router.push('/')}
              className="bg-black text-white px-6 py-2 rounded"
            >
              홈으로 가기
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      주문번호: {order.order_number}
                    </h3>
                    <p className="text-gray-600">
                      주문일: {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${getStatusColor(order)}`}>
                      {getStatusText(order)}
                    </p>
                    <p className="text-lg font-bold">
                      {order.total_price?.toLocaleString()}원
                    </p>
                  </div>
                </div>

                {/* 주문 상세 정보 */}
                {order.order_details && order.order_details.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">주문 상품</h4>
                    <div className="space-y-2">
                      {order.order_details.map((detail, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          {detail.name} - {detail.quantity}개
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 시안 전송 방식 표시 */}
                {order.design_drafts &&
                  order.design_drafts.length > 0 &&
                  order.design_drafts[0].draft_delivery_method && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">
                        시안 전송 방식:{' '}
                        {order.design_drafts[0].draft_delivery_method ===
                        'email'
                          ? '이메일'
                          : '홈페이지 업로드'}
                      </p>
                    </div>
                  )}

                {/* 액션 버튼들 */}
                <div className="flex gap-3">
                  {/* 결제 승인 후 결제하기 버튼 */}
                  {canProceedToPayment(order) && (
                    <Button
                      onClick={() => handleApprovedPayment(order.id)}
                      className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                    >
                      결제하기
                    </Button>
                  )}

                  {/* 시안관리 버튼 (결제 완료된 경우) */}
                  {order.payment_status === 'completed' && (
                    <Button
                      onClick={() => router.push('/mypage/design')}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      시안관리
                    </Button>
                  )}

                  {/* 주문 상세 보기 버튼 */}
                  <Button
                    onClick={() => router.push(`/mypage/orders/${order.id}`)}
                    variant="outlinedBlack"
                    className="px-4 py-2 rounded"
                  >
                    상세보기
                  </Button>
                </div>

                {/* 상태별 안내 메시지 */}
                {order.payment_status === 'waiting_admin_approval' && (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800">
                      어드민 승인 대기 중입니다. 승인 완료 후 결제를 진행할 수
                      있습니다.
                    </p>
                  </div>
                )}

                {order.admin_approval_status === 'approved' &&
                  order.payment_status !== 'completed' && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        어드민 승인이 완료되었습니다. 결제하기 버튼을 클릭하여
                        결제를 진행하세요.
                      </p>
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
