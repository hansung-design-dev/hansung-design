'use client';

import { useState, useEffect, useCallback } from 'react';
import Nav from '../../../components/layouts/nav';
import MypageContainer from '@/src/components/mypageContainer';
import { useAuth } from '@/src/contexts/authContext';
import OrderItemList from '@/src/components/orderItemList';
import OrderItemCard from '@/src/components/orderItemCard';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<any | null>(
    null
  );
  const { user } = useAuth();

  // 주문 데이터 fetch
  const fetchOrders = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/orders?userId=${user.id}`);
      const data = await response.json();
      if (data.orders) {
        setOrders(data.orders || []);
      } else {
        console.error('주문 조회 실패:', data.error);
      }
    } catch (e) {
      console.error('주문 조회 중 오류:', e);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user, fetchOrders]);

  // 리스트에 표시할 데이터 변환
  const transformOrdersForDisplay = () => {
    let globalIndex = 1;
    return orders.flatMap((order) =>
      (order.order_details || []).map((item: any) => ({
        id: globalIndex++,
        // 게시대명: address (nickname)
        title:
          (item.panel_info?.address || '') +
          (item.panel_info?.nickname ? ` (${item.panel_info.nickname})` : ''),
        // 행정동
        location: item.panel_info?.region_gu?.name || '',
        // 마감여부(주문상태)
        status: getStatusDisplay(order.payment_status),
        orderId: order.order_number,
        totalAmount: (order.payments?.[0]?.amount || 0).toLocaleString() + '원',
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
        if (data.success && data.data) {
          setSelectedOrderDetail(data.data);
        } else {
          setSelectedOrderDetail({}); // 실패해도 빈 객체로 설정해 아코디언이 열리게
        }
      } catch {
        setSelectedOrderDetail({}); // 에러 시에도 빈 객체
      }
    } else {
      setSelectedOrderDetail(null);
    }
  };

  // 아코디언 상세에 사용할 더미 데이터 (모든 필드 '-')
  const dummyOrderDetail = {
    id: '-',
    order_number: '-',
    title: '-',
    location: '-',
    status: '-',
    category: '-',
    customerName: '-',
    phone: '-',
    companyName: '-',
    productName: '-',
    price: 0,
    vat: 0,
    designFee: 0,
    roadUsageFee: 0,
    totalAmount: 0,
    paymentMethod: '-',
    depositorName: '-',
    orderDate: '-',
    canCancel: false,
    daysSinceOrder: 0,
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
            expandedItemId ? (
              <OrderItemCard orderDetail={dummyOrderDetail} />
            ) : null
          }
        />
      </MypageContainer>
    </main>
  );
}
