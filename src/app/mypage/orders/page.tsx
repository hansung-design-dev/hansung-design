'use client';

import { useState, useEffect } from 'react';
import Nav from '../../../components/layouts/nav';
import CategoryFilter from '@/src/components/ui/categoryFilter';
import DateLocationFilter from '@/src/components/ui/datelocationfilter';
import OrderItemList from '@/src/components/orderItemList';
import Image from 'next/image';
import Link from 'next/link';
import MypageContainer from '@/src/components/mypageContainer';
import { useAuth } from '@/src/contexts/authContext';
import { useRouter } from 'next/navigation';

interface OrderItem {
  id: string;
  panel_info: {
    address: string;
    nickname?: string;
    panel_status: string;
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
    cancelled: number;
  };
  error?: string;
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('주문내역');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusSummary, setStatusSummary] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  });

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const tabs = [
    { name: '마이페이지', href: '/mypage' },
    { name: '주문내역', href: '/mypage/orders' },
    { name: '1:1상담', href: '/mypage/customer-service' },
    { name: '간편정보관리', href: '/mypage/info' },
    { name: '로그아웃', href: '/' },
  ];

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/signin');
      return;
    }

    fetchOrders();
  }, [user, authLoading, currentPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders?page=${currentPage}&limit=10`);
      const data: OrdersResponse = await response.json();

      if (data.success) {
        setOrders(data.orders);
        setStatusSummary(data.statusSummary);
      } else {
        setError(data.error || '주문 내역을 불러오는데 실패했습니다.');
      }
    } catch {
      setError('주문 내역을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
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
      }))
    );
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending':
        return '진행중';
      case 'confirmed':
        return '확정';
      case 'completed':
        return '완료';
      case 'cancelled':
        return '취소';
      default:
        return status;
    }
  };

  // 필터링된 주문 목록
  const filteredOrders =
    selectedCategory === 'all'
      ? transformOrdersForDisplay()
      : transformOrdersForDisplay().filter(
          (order) => order.category === selectedCategory
        );

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
        <div className="sm:flex sm:flex-col sm:gap-2 sm:px-0">
          <Link href="/mypage" className="md:hidden lg:hidden sm:inline">
            <Image
              src="/svg/arrow-left.svg"
              alt="orders"
              width={20}
              height={20}
              className="w-[1.5rem] h-[1.5rem]"
            />
          </Link>
          <h2 className="lg:text-2.25 md:text-1.75 font-500 mb-3 sm:text-2">
            주문내역
          </h2>

          <div className="lg:text-sm md:text-0.75 text-gray-500 mb-6 ">
            *송출이 시작된 주문은 취소/파일 교체가 불가하며,{' '}
            <br className="lg:hidden md:hidden sm:block" /> 신청후 3일 이후
            상태에서는 변경이 불가합니다.
          </div>

          {/* 주문 요약 정보 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg text-center">
              <div className="text-lg font-bold">{statusSummary.total}</div>
              <div className="text-sm text-gray-600">전체</div>
            </div>
            <div className="bg-white p-4 rounded-lg text-center">
              <div className="text-lg font-bold text-blue-600">
                {statusSummary.pending}
              </div>
              <div className="text-sm text-gray-600">진행중</div>
            </div>
            <div className="bg-white p-4 rounded-lg text-center">
              <div className="text-lg font-bold text-green-600">
                {statusSummary.completed}
              </div>
              <div className="text-sm text-gray-600">완료</div>
            </div>
            <div className="bg-white p-4 rounded-lg text-center">
              <div className="text-lg font-bold text-red-600">
                {statusSummary.cancelled}
              </div>
              <div className="text-sm text-gray-600">취소</div>
            </div>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Filter Row */}
        <div className="flex flex-col gap-2 items-center mb-6">
          <DateLocationFilter
            startDate="2025.02.06"
            endDate="2025.03.06"
            setStartDate={() => {}}
            setEndDate={() => {}}
            searchLocation="방이동"
            setSearchLocation={() => {}}
            showStartCalendar={false}
            setShowStartCalendar={() => {}}
            showEndCalendar={false}
            setShowEndCalendar={() => {}}
          />
        </div>
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {loading ? (
          <div className="text-center py-8">주문 내역을 불러오는 중...</div>
        ) : (
          <>
            <OrderItemList items={filteredOrders} />

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
