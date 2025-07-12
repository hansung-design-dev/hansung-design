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
    region_dong?: string;
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
  const [activeTab] = useState('주문내역');
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
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD 형식
  });
  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD 형식
  });
  const [searchLocation, setSearchLocation] = useState('');

  // 실제 검색에 사용할 필터 상태 (버튼을 눌렀을 때만 업데이트)
  const [activeStartDate, setActiveStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [activeEndDate, setActiveEndDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [activeSearchLocation, setActiveSearchLocation] = useState('');

  // 상세 정보 관련 state
  const [selectedOrderDetail, setSelectedOrderDetail] =
    useState<OrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

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
    const item = orders.find((item) => item.id === itemId);
    if (item && item.id) {
      // console.log('아이템 확장:', itemId, '주문번호:', item.order_number);
      await handleOrderClick(item.order_number);
      setExpandedItemId(itemId);
    }
  };

  const handleCloseDetail = () => {
    console.log('상세 정보 닫기');
    setSelectedOrderDetail(null);
    setExpandedItemId(null);
  };

  // 전체보기 함수
  const handleShowAll = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    setStartDate(todayStr);
    setEndDate(todayStr);
    setSearchLocation('');
    // 실제 검색 상태도 업데이트
    setActiveStartDate(todayStr);
    setActiveEndDate(todayStr);
    setActiveSearchLocation('');
  };

  // 기간 검색 함수
  const handlePeriodSearch = () => {
    // 기간 검색만 활성화하고 동 검색은 비활성화
    setSearchLocation('');
    // 실제 검색 상태 업데이트
    setActiveStartDate(startDate);
    setActiveEndDate(endDate);
    setActiveSearchLocation('');

    console.log('🔍 기간 검색 실행:', {
      startDate,
      endDate,
      activeStartDate: startDate,
      activeEndDate: endDate,
    });
  };

  // 동 검색 함수
  const handleLocationSearch = () => {
    // 동 검색만 활성화하고 기간 검색은 비활성화 (시작일과 종료일을 같게)
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    setStartDate(todayStr);
    setEndDate(todayStr);
    // 실제 검색 상태 업데이트
    setActiveStartDate(todayStr);
    setActiveEndDate(todayStr);
    setActiveSearchLocation(searchLocation);
  };

  // 주문 취소 핸들러
  const handleCancelOrder = (item: { id: number; orderId?: string }) => {
    if (!item.orderId) return;

    // 주문 목록에서 해당 아이템 제거 (실제 주문 ID로 필터링)
    setOrders((prevOrders) =>
      prevOrders.filter((order) => order.id !== item.orderId)
    );

    // 상태 요약 업데이트 (pending 상태인 주문이 취소되므로 pending 개수 감소)
    setStatusSummary((prev) => ({
      ...prev,
      pending: Math.max(0, prev.pending - 1),
      total: Math.max(0, prev.total - 1),
    }));
  };

  // 주문 데이터를 OrderItemList 컴포넌트 형식으로 변환
  const transformOrdersForDisplay = () => {
    let globalIndex = 1; // 전역 인덱스로 고유한 숫자 ID 생성
    const transformed = orders.flatMap((order) =>
      order.order_items.map((item) => ({
        id: globalIndex++, // 고유한 숫자 ID 생성
        title: item.panel_info.nickname || item.panel_info.address,
        subtitle: `(${item.slot_info.banner_type})`,
        location: item.panel_info.region_dong || item.panel_info.address, // region_dong 우선 사용
        status: getStatusDisplay(order.status),
        category: item.slot_info.banner_type,
        orderNumber: order.order_number,
        totalAmount:
          item.price_display || order.total_amount.toLocaleString() + '원',
        startDate: item.start_date,
        endDate: item.end_date,
        orderId: order.id, // 실제 주문 ID를 orderId로 설정
      }))
    );

    console.log(
      '🔍 변환된 주문 데이터:',
      transformed.map((item) => ({
        orderNumber: item.orderNumber,
        startDate: item.startDate,
        endDate: item.endDate,
        title: item.title,
      }))
    );

    return transformed;
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

  // 필터링된 주문 목록
  const filteredOrders = transformOrdersForDisplay().filter((item) => {
    // 검색 조건이 없으면 전체보기
    if (!activeSearchLocation && activeStartDate === activeEndDate) {
      return true;
    }

    let isDateInRange = true;
    let isLocationMatch = true;

    // 날짜 필터링 (광고 게시 기간이 선택한 기간과 겹치는지 확인)
    if (activeStartDate !== activeEndDate) {
      console.log('🔍 날짜 필터링 시작:', {
        itemStartDate: item.startDate,
        itemEndDate: item.endDate,
        searchStart: activeStartDate,
        searchEnd: activeEndDate,
        orderNumber: item.orderNumber,
        title: item.title,
      });

      // 날짜 문자열이 유효한지 확인
      if (item.startDate && item.endDate) {
        // 날짜 파싱을 더 안전하게 처리
        const parseDate = (dateStr: string) => {
          try {
            // ISO 형식 (YYYY-MM-DD) 또는 다른 형식 처리
            if (dateStr.includes('T')) {
              return new Date(dateStr);
            } else {
              // YYYY-MM-DD 형식인 경우
              return new Date(dateStr + 'T00:00:00');
            }
          } catch (error) {
            console.error('날짜 파싱 오류:', { dateStr, error });
            return new Date('Invalid Date');
          }
        };

        const itemStartDate = parseDate(item.startDate);
        const itemEndDate = parseDate(item.endDate);
        const searchStart = parseDate(activeStartDate);
        const searchEnd = parseDate(activeEndDate);

        console.log('🔍 날짜 객체 변환 결과:', {
          originalItemStartDate: item.startDate,
          originalItemEndDate: item.endDate,
          originalSearchStart: activeStartDate,
          originalSearchEnd: activeEndDate,
          itemStartDate: itemStartDate.toString(),
          itemEndDate: itemEndDate.toString(),
          searchStart: searchStart.toString(),
          searchEnd: searchEnd.toString(),
          itemStartTime: itemStartDate.getTime(),
          itemEndTime: itemEndDate.getTime(),
          searchStartTime: searchStart.getTime(),
          searchEndTime: searchEnd.getTime(),
        });

        // 날짜가 유효한지 확인
        const isValidDate = (date: Date) => {
          return date instanceof Date && !isNaN(date.getTime());
        };

        if (
          isValidDate(itemStartDate) &&
          isValidDate(itemEndDate) &&
          isValidDate(searchStart) &&
          isValidDate(searchEnd)
        ) {
          // 광고 기간이 검색 기간과 겹치는지 확인 (from-to 사이의 기간)
          isDateInRange =
            itemStartDate <= searchEnd && itemEndDate >= searchStart;
          console.log('🔍 날짜 범위 결과:', {
            isDateInRange,
            condition1: itemStartDate <= searchEnd,
            condition2: itemEndDate >= searchStart,
            orderNumber: item.orderNumber,
          });
        } else {
          console.log('🔍 유효하지 않은 날짜:', {
            itemStartDate: itemStartDate.toString(),
            itemEndDate: itemEndDate.toString(),
            searchStart: searchStart.toString(),
            searchEnd: searchEnd.toString(),
            orderNumber: item.orderNumber,
            itemStartValid: isValidDate(itemStartDate),
            itemEndValid: isValidDate(itemEndDate),
            searchStartValid: isValidDate(searchStart),
            searchEndValid: isValidDate(searchEnd),
          });
          isDateInRange = false;
        }
      } else {
        console.log('🔍 날짜 데이터 없음:', {
          startDate: item.startDate,
          endDate: item.endDate,
          orderNumber: item.orderNumber,
        });
        isDateInRange = false;
      }
    }

    // 위치 필터링 (region_dong으로 검색)
    if (activeSearchLocation) {
      isLocationMatch = item.location
        .toLowerCase()
        .includes(activeSearchLocation.toLowerCase());
      console.log('🔍 위치 검색:', {
        location: item.location,
        searchLocation: activeSearchLocation,
        isLocationMatch,
      });
    }

    // 기간 또는 동으로 검색 (OR 조건)
    // 둘 다 조건이 있으면 OR, 하나만 있으면 해당 조건만 적용
    if (activeStartDate !== activeEndDate && activeSearchLocation) {
      return isDateInRange || isLocationMatch;
    } else if (activeStartDate !== activeEndDate) {
      return isDateInRange;
    } else if (activeSearchLocation) {
      return isLocationMatch;
    }

    return true; // 검색 조건이 없으면 전체보기
  });

  if (authLoading) {
    return <div>로딩 중...</div>;
  }

  if (!user) {
    return null; // 리다이렉트 중
  }

  return (
    <main className="min-h-screen flex flex-col bg-gray-100 w-full">
      <Nav variant="default" className="bg-white sm:px-0" />
      <MypageContainer activeTab={activeTab}>
        <OrderHeaderSection
          statusSummary={statusSummary}
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          searchLocation={searchLocation}
          setSearchLocation={setSearchLocation}
          onShowAll={handleShowAll}
          onPeriodSearch={handlePeriodSearch}
          onLocationSearch={handleLocationSearch}
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
              onCancelOrder={handleCancelOrder}
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
