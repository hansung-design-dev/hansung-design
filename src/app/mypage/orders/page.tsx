'use client';

import { useState, useEffect, useCallback } from 'react';
import Nav from '../../../components/layouts/nav';
import MypageContainer from '@/src/components/mypageContainer';
import { useAuth } from '@/src/contexts/authContext';
import { useRouter } from 'next/navigation';
import OrderItemList from '@/src/components/orderItemList';
import OrderDetailExpanded from '@/src/components/orderDetailExpanded';

interface OrderItem {
  id: number;
  title: string;
  location: string;
  status: string;
  orderId: string;
  totalAmount: string;
  startDate: string;
  endDate: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<any | null>(
    null
  );
  const { user } = useAuth();
  const router = useRouter();

  // 주문 데이터 fetch
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      if (data.success) {
        setOrders(data.data || []);
      }
    } catch (e) {
      // 에러 처리
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user, fetchOrders]);

  // 리스트에 표시할 데이터 변환
  const transformOrdersForDisplay = () => {
    let globalIndex = 1;
    return orders.flatMap((order) =>
      (order.order_details || []).map((item: any) => ({
        id: globalIndex++,
        title: item.project_name || order.order_number,
        location: item.panel_info?.region_dong || '',
        status: getStatusDisplay(order.payment_status),
        orderId: order.order_number,
        totalAmount: (item.total_price || 0).toLocaleString() + '원',
        startDate: item.display_start_date,
        endDate: item.display_end_date,
      }))
    );
  };

  // 상태 변환
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending':
        return '입금확인 중';
      case 'confirmed':
        return '결제완료';
      case 'completed':
        return '완료';
      case 'cancelled':
        return '취소';
      default:
        return status;
    }
  };

  // 상세 정보 fetch (orderId 기준)
  const handleOrderClick = async (orderId: string, itemId: number) => {
    setExpandedItemId(expandedItemId === itemId ? null : itemId);
    if (expandedItemId !== itemId) {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        const data = await response.json();
        if (data.success) {
          setSelectedOrderDetail(data.orderDetail);
        } else {
          setSelectedOrderDetail(null);
        }
      } catch {
        setSelectedOrderDetail(null);
      }
    } else {
      setSelectedOrderDetail(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8">주문 내역을 불러오는 중...</div>;
  }

  const items = transformOrdersForDisplay();

  return (
    <main className="min-h-screen flex flex-col bg-gray-100 w-full">
      <Nav variant="default" className="bg-white sm:px-0" />
      <MypageContainer activeTab="주문내역">
        <h1 className="text-2xl font-bold mb-8">주문내역</h1>
        <OrderItemList
          items={items}
          expandedItemId={expandedItemId}
          onExpandItem={(itemId) => {
            const item = items.find((i) => i.id === itemId);
            if (item) handleOrderClick(item.orderId, itemId!);
            else setExpandedItemId(null);
          }}
          expandedContent={
            selectedOrderDetail ? (
              <OrderDetailExpanded orderDetail={selectedOrderDetail} />
            ) : null
          }
        />
      </MypageContainer>
    </main>
  );
}
