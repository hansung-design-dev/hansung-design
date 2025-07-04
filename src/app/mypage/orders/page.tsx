'use client';

import { useState, useEffect, useCallback } from 'react';
import Nav from '../../../components/layouts/nav';
// import CategoryFilter from '@/src/components/ui/categoryFilter';
import OrderHeaderSection from '@/src/components/orderHeaderSection';
import OrderItemList from '@/src/components/orderItemList';
import MypageContainer from '@/src/components/mypageContainer';
import { useAuth } from '@/src/contexts/authContext';
import { useRouter } from 'next/navigation';
import OrderDetailExpanded from '@/src/components/orderDetailExpanded';

interface OrderItem {
  id: string;
  panel_info: {
    address: string;
    nickname?: string;
    panel_status: string;
    max_banner?: number;
    first_half_closure_quantity?: number;
    second_half_closure_quantity?: number;
  };
  slot_info: {
    slot_name: string;
    banner_type: string;
    price_unit: string;
  };
  quantity: number;
  unit_price: number;
  total_price: number;
  start_date: string;
  end_date: string;
  price_display?: string;
}

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  payment_status: string;
  order_date: string;
  year_month?: string;
  order_items: OrderItem[];
}

interface OrdersResponse {
  success: boolean;
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  statusSummary: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
  };
  error?: string;
}

interface OrderDetail {
  id: string;
  order_number: string;
  title: string;
  location: string;
  status: string;
  category: string;
  customerName: string;
  phone: string;
  companyName: string;
  productName: string;
  price: number;
  vat: number;
  designFee: number;
  roadUsageFee: number;
  totalAmount: number;
  paymentMethod: string;
  depositorName: string;
  orderDate: string;
  canCancel: boolean;
  daysSinceOrder: number;
  panel_slot_snapshot?: {
    id: string | null;
    notes: string | null;
    max_width: number | null;
    slot_name: string | null;
    tax_price: number | null;
    created_at: string | null;
    is_premium: boolean | null;
    max_height: number | null;
    price_unit: string | null;
    updated_at: string | null;
    banner_type: string | null;
    slot_number: number | null;
    total_price: number | null;
    panel_info_id: string | null;
    road_usage_fee: number | null;
    advertising_fee: number | null;
    panel_slot_status: string | null;
  };
  panel_slot_usage_id?: string;
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('주문내역');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusSummary, setStatusSummary] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
  });
  // 날짜/위치 필터 state
  const [startDate, setStartDate] = useState('2025.02.06');
  const [endDate, setEndDate] = useState('2025.03.06');
  const [searchLocation, setSearchLocation] = useState('방이동');

  // 상세 정보 관련 state
  const [selectedOrderDetail, setSelectedOrderDetail] =
    useState<OrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const tabs = [
    // { name: '마이페이지', href: '/mypage' },
    { name: '주문내역', href: '/mypage/orders' },
    { name: '1:1상담', href: '/mypage/customer-service' },
    { name: '간편정보관리', href: '/mypage/info' },
    { name: '로그아웃', href: '/' },
  ];

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders?page=${currentPage}&limit=10`);
      const data: OrdersResponse = await response.json();

      if (data.success) {
        setOrders(data.orders);
        setStatusSummary(data.statusSummary);
      } else {
        setError(data.error || '주문 내역을 불러오는데 실패했습니다.');
        console.log(error);
      }
    } catch {
      setError('주문 내역을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, error]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/signin');
      return;
    }

    fetchOrders();
  }, [user, authLoading, fetchOrders, router]);

  const handleOrderClick = async (orderNumber: string) => {
    console.log('주문 클릭됨:', orderNumber);
    try {
      setDetailLoading(true);
      const response = await fetch(`/api/orders/${orderNumber}`);
      const data = await response.json();

      if (data.success) {
        console.log('주문 상세 정보 로드 성공:', data.orderDetail);
        setSelectedOrderDetail(data.orderDetail);
        console.log('selectedOrderDetail 상태 설정됨');
      } else {
        console.error('주문 상세 정보를 불러오는데 실패했습니다:', data.error);
      }
    } catch (error) {
      console.error('주문 상세 정보를 불러오는데 실패했습니다:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleExpandItem = async (itemId: number | null) => {
    if (itemId === null) {
      // 닫기
      setExpandedItemId(null);
      setSelectedOrderDetail(null);
      return;
    }

    // 해당 아이템의 주문 정보 찾기
    const item = filteredOrders.find((item) => item.id === itemId);
    if (item && item.orderId) {
      console.log('아이템 확장:', itemId, '주문번호:', item.orderId);
      await handleOrderClick(item.orderId);
      setExpandedItemId(itemId);
    }
  };

  const handleCloseDetail = () => {
    console.log('상세 정보 닫기');
    setSelectedOrderDetail(null);
    setExpandedItemId(null);
  };

  // 주문 데이터를 OrderItemList 컴포넌트 형식으로 변환
  const transformOrdersForDisplay = () => {
    return orders.flatMap((order) =>
      order.order_items.map((item, index) => ({
        id: index + 1, // number 타입으로 변환
        title: item.panel_info.nickname || item.panel_info.address,
        location: item.panel_info.address,
        status: getStatusDisplay(order.status),
        category: item.slot_info.banner_type,
        orderNumber: order.order_number,
        totalAmount:
          item.price_display || order.total_amount.toLocaleString() + '원',
        startDate: item.start_date,
        endDate: item.end_date,
        orderId: order.order_number, // 주문번호를 orderId로 설정
      }))
    );
  };

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

  // 필터링된 주문 목록 (카테고리 필터 제거)
  const filteredOrders = transformOrdersForDisplay();

  if (authLoading) {
    return <div>로딩 중...</div>;
  }

  if (!user) {
    return null; // 리다이렉트 중
  }

  return (
    <main className="min-h-screen flex flex-col bg-gray-100 w-full">
      <Nav variant="default" className="bg-white sm:px-0" />
      <MypageContainer
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      >
        <OrderHeaderSection
          statusSummary={statusSummary}
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          searchLocation={searchLocation}
          setSearchLocation={setSearchLocation}
        />
        {/* 에러 메시지 */}

        {loading ? (
          <div className="text-center py-8">주문 내역을 불러오는 중...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            주문내역이 없습니다.
          </div>
        ) : (
          <>
            <OrderItemList
              items={filteredOrders}
              expandedItemId={expandedItemId}
              onExpandItem={handleExpandItem}
              expandedContent={
                detailLoading ? (
                  <div className="text-center py-8">
                    주문 상세 정보를 불러오는 중...
                  </div>
                ) : selectedOrderDetail ? (
                  <div>
                    <div className="flex justify-between items-center mb-4 bg-black text-white">
                      <h3 className="text-lg font-semibold pl-5">
                        주문 상세 정보
                      </h3>
                      <button
                        onClick={handleCloseDetail}
                        className="text-gray-1 hover:cursor-pointer pr-5 text-1.25"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="p-3">
                      <OrderDetailExpanded orderDetail={selectedOrderDetail} />
                    </div>
                  </div>
                ) : null
              }
            />

            {/* 페이지네이션 */}
            <div className="flex justify-center items-center mt-6 gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                이전
              </button>
              <span className="px-3 py-1">페이지 {currentPage}</span>
              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-3 py-1 border rounded"
              >
                다음
              </button>
            </div>
          </>
        )}
      </MypageContainer>
    </main>
  );
}
