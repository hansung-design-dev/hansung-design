'use client';

import { useState, useEffect, useCallback } from 'react';
import Nav from '../../../components/layouts/nav';
import MypageContainer from '@/src/components/mypageContainer';
import { useAuth } from '@/src/contexts/authContext';
import OrderItemList from '@/src/components/orderItemList';
import OrderItemCard from '@/src/components/orderItemCard';
import { Button } from '@/src/components/button/button';
import TableSkeleton from '@/src/components/skeleton/TableSkeleton';

// 타입 정의
interface PanelInfo {
  id: string;
  nickname?: string;
  address?: string;
  photo_url?: string;
  location_url?: string;
  map_url?: string;
  latitude?: number;
  longitude?: number;
  panel_code?: string;
  panel_type?: string;
  max_banner?: number;
  region_gu?: {
    id: string;
    name: string;
    code?: string;
  };
  region_dong?: {
    id: string;
    name: string;
  };
  display_types?: {
    id: string;
    name: string;
    description?: string;
  };
}

interface PanelSlotUsage {
  id: string;
  slot_number?: number;
  usage_type?: string;
  attach_date_from?: string;
  unit_price?: number;
  is_active?: boolean;
  is_closed?: boolean;
  banner_type?: string;
  banner_slots?: {
    id: string;
    slot_name?: string;
    max_width?: number;
    max_height?: number;
    banner_type?: string;
    price_unit?: string;
    panel_slot_status?: string;
    notes?: string;
  };
}

interface OrderDetail {
  id: string;
  order_id: string;
  panel_id: string;
  panel_slot_usage_id?: string;
  slot_order_quantity: number;
  display_start_date?: string;
  display_end_date?: string;
  panels?: PanelInfo;
  panel_slot_usage?: PanelSlotUsage;
}

interface Payment {
  id: string;
  order_id: string;
  payment_method_id: string;
  amount: number;
  payment_status: string;
  payment_date?: string;
  admin_approval_status?: string;
  depositor_name?: string;
  payment_methods?: {
    id: string;
    name: string;
    method_type?: string;
    method_code?: string;
    description?: string;
  };
}

interface UserProfile {
  id: string;
  profile_title?: string;
  company_name?: string;
  business_registration_file?: string;
  phone?: string;
  email?: string;
  contact_person_name?: string;
  fax_number?: string;
  is_public_institution?: boolean;
  is_company?: boolean;
}

interface Order {
  id: string;
  order_number: string;
  user_auth_id: string;
  user_profile_id: string;
  payment_status: string;
  order_status: string;
  draft_delivery_method?: string;
  design_drafts_id?: string;
  created_at: string;
  updated_at?: string;
  projectName?: string; // 프로젝트 이름 추가
  panel_slot_snapshot?: {
    id?: string;
    notes?: string;
    max_width?: number;
    slot_name?: string;
    tax_price?: number;
    created_at?: string;
    max_height?: number;
    price_unit?: string;
    updated_at?: string;
    banner_type?: string;
    slot_number?: number;
    total_price?: number;
    panel_id?: string;
    road_usage_fee?: number;
    advertising_fee?: number;
    panel_slot_status?: string;
    policy_total_price?: number;
    policy_tax_price?: number;
    policy_advertising_fee?: number;
    policy_road_usage_fee?: number;
  };
  user_auth?: {
    id: string;
    username?: string;
    email?: string;
    name?: string;
    phone?: string;
  };
  user_profiles?: UserProfile;
  payment_methods?: {
    id: string;
    name: string;
    method_type?: string;
    method_code?: string;
    description?: string;
  };
  order_details?: OrderDetail[];
  payments?: Payment[];
}

interface OrderDetailResponse {
  order: Order;
  orderDetails: OrderDetail[];
  payments: Payment[];
  customerInfo: {
    name?: string;
    phone?: string;
    company?: string;
  };
  priceInfo: {
    totalPrice?: number;
    totalTaxPrice?: number;
    totalAdvertisingFee?: number;
    totalRoadUsageFee?: number;
    totalAdministrativeFee?: number;
    finalPrice?: number;
  };
}

interface DisplayItem {
  id: number;
  title: string;
  location: string;
  status: string; // 마감여부
  paymentStatus: string; // 결제여부
  orderId: string;
  totalAmount: string;
  startDate?: string;
  endDate?: string;
  isClosed?: boolean; // 마감 여부
  order?: Order; // 전체 주문 정보
}

interface OrderCardData {
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
  advertisingFee: number;
  roadUsageFee: number;
  totalAmount: number;
  paymentMethod: string;
  depositorName: string;
  orderDate: string;
  canCancel: boolean;
  daysSinceOrder: number;
  // 추가 필드들
  projectName?: string; // 파일이름 (design_draft.project_name)
  displayStartDate?: string; // 송출 시작일
  displayEndDate?: string; // 송출 종료일
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);
  const [selectedOrderDetail, setSelectedOrderDetail] =
    useState<OrderDetailResponse | null>(null);
  const [loadingOrderDetail, setLoadingOrderDetail] = useState<string | null>(
    null
  );
  const { user } = useAuth();

  // 신청취소 관련 상태
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelSuccessModalOpen, setIsCancelSuccessModalOpen] =
    useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [pendingPaymentOrders, setPendingPaymentOrders] = useState<Order[]>([]);

  // 신청취소 핸들러
  const handleCancelClick = (orderNumber: string) => {
    setOrderToCancel(orderNumber);
    setIsCancelModalOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!orderToCancel) return;

    try {
      const response = await fetch(`/api/orders/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderNumber: orderToCancel,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsCancelSuccessModalOpen(true);
        // 주문 목록 새로고침
        fetchOrders();
        // 아코디언 닫기
        setExpandedItemId(null);
        setSelectedOrderDetail(null);
      } else {
        console.error('주문 취소 실패:', data.error);
        alert('주문 취소에 실패했습니다.');
      }
    } catch (error) {
      console.error('주문 취소 중 오류:', error);
      alert('주문 취소 중 오류가 발생했습니다.');
    } finally {
      setIsCancelModalOpen(false);
      setOrderToCancel(null);
    }
  };

  const handleCancelModalClose = () => {
    setIsCancelModalOpen(false);
    setOrderToCancel(null);
  };

  // 결제하기 핸들러
  const handlePaymentClick = (order: Order) => {
    // 결제 페이지로 이동 (주문 ID를 쿼리 파라미터로 전달)
    window.location.href = `/payment?orderId=${order.order_number}`;
  };

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

  // 결제대기 상태의 주문 필터링
  useEffect(() => {
    const pendingOrders = orders.filter(
      (order) => order.payment_status === 'pending_payment'
    );
    setPendingPaymentOrders(pendingOrders);
  }, [orders]);

  // 마감여부 판단 함수
  const getClosureStatus = (item: OrderDetail, order: Order): string => {
    // panel_slot_usage의 is_closed가 true이거나 order_status가 completed이면 완료
    if (item.panel_slot_usage?.is_closed === true) {
      return '완료';
    }
    // order_status가 completed인 경우도 완료로 표시
    if (order?.order_status === 'completed') {
      return '완료';
    }
    return '진행중';
  };

  // 결제여부 표시 함수
  const getPaymentStatusDisplay = (paymentStatus: string): string => {
    switch (paymentStatus) {
      case 'completed':
        return '완료';
      case 'pending_payment':
        return '대기';
      case 'cancelled':
      case 'rejected':
        return '거절';
      case 'pending':
      case 'pending_deposit':
        return '대기';
      default:
        return '대기';
    }
  };

  // 리스트에 표시할 데이터 변환
  const transformOrdersForDisplay = (): DisplayItem[] => {
    let globalIndex = 1;
    return orders.flatMap((order) =>
      (order.order_details || []).map((item: OrderDetail) => ({
        id: globalIndex++,
        // 게시대명: address (nickname)
        title:
          (item.panels?.address || '') +
          (item.panels?.nickname ? ` (${item.panels.nickname})` : ''),
        // 행정동
        location: item.panels?.region_gu?.name || '',
        // 마감여부
        status: getClosureStatus(item, order),
        // 결제여부
        paymentStatus: getPaymentStatusDisplay(order.payment_status),
        orderId: order.order_number,
        totalAmount: (order.payments?.[0]?.amount || 0).toLocaleString() + '원',
        startDate: item.display_start_date,
        endDate: item.display_end_date,
        isClosed: item.panel_slot_usage?.is_closed === true,
        order: order,
      }))
    );
  };

  // 상태 변환
  const getStatusDisplay = (status: string): string => {
    switch (status) {
      case 'pending':
        return '입금확인 중';
      case 'pending_payment':
        return '결제대기 중';
      case 'pending_deposit':
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
    const isExpanding = expandedItemId !== itemId;
    setExpandedItemId(isExpanding ? itemId : null);

    if (isExpanding) {
      // 기존 데이터 초기화 및 로딩 시작
      setSelectedOrderDetail(null);
      setLoadingOrderDetail(orderId);

      try {
        console.log('🔍 [주문 상세 조회] API 호출:', `/api/orders/${orderId}`);
        const response = await fetch(`/api/orders/${orderId}`);
        const data = await response.json();
        console.log('🔍 [주문 상세 조회] API 응답:', data);

        if (data.success && data.data) {
          console.log('🔍 [주문 상세 조회] 데이터 확인:', {
            order: data.data.order,
            orderDetails: data.data.orderDetails,
            customerInfo: data.data.customerInfo,
            priceInfo: data.data.priceInfo,
            payments: data.data.payments,
          });
          setSelectedOrderDetail(data.data);
        } else {
          console.error(
            '🔍 [주문 상세 조회] API 실패:',
            data.error || '알 수 없는 오류'
          );
          alert(
            `주문 상세 정보를 불러올 수 없습니다: ${
              data.error || '알 수 없는 오류'
            }`
          );
          setSelectedOrderDetail(null);
        }
      } catch (error) {
        console.error('🔍 [주문 상세 조회] 에러:', error);
        alert('주문 상세 조회 중 오류가 발생했습니다.');
        setSelectedOrderDetail(null);
      } finally {
        setLoadingOrderDetail(null);
      }
    } else {
      setSelectedOrderDetail(null);
      setLoadingOrderDetail(null);
    }
  };

  // 아코디언 상세에 사용할 더미 데이터 (모든 필드 '-')
  const dummyOrderDetail: OrderCardData = {
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
    advertisingFee: 0,
    roadUsageFee: 0,
    totalAmount: 0,
    paymentMethod: '-',
    depositorName: '-',
    orderDate: '-',
    canCancel: false,
    daysSinceOrder: 0,
    projectName: '-',
    displayStartDate: '-',
    displayEndDate: '-',
  };

  // 송출기간 포맷팅 함수
  const formatDisplayPeriod = (startDate: string, endDate: string): string => {
    if (!startDate || !endDate || startDate === '-' || endDate === '-') {
      return '-';
    }

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const startYear = start.getFullYear();
      const startMonth = start.getMonth() + 1;
      const endYear = end.getFullYear();
      const endMonth = end.getMonth() + 1;

      // 같은 년도인 경우
      if (startYear === endYear) {
        if (startMonth === endMonth) {
          return `${startYear}년 ${startMonth}월`;
        } else {
          return `${startYear}년 ${startMonth}월 ~ ${endMonth}월`;
        }
      } else {
        return `${startYear}년 ${startMonth}월 ~ ${endYear}년 ${endMonth}월`;
      }
    } catch {
      return `${startDate} ~ ${endDate}`;
    }
  };

  // 디스플레이 타입 한글 변환 함수
  const formatDisplayType = (displayType: string): string => {
    switch (displayType) {
      case 'banner_display':
        return '현수막게시대';
      case 'led_display':
        return 'LED 전자게시대';
      case 'digital_signage':
        return '디지털 사이니지';
      default:
        return displayType || '-';
    }
  };

  // 상세 데이터 → OrderItemCard용 데이터로 변환
  function mapOrderDetailToCard(detail: OrderDetailResponse): OrderCardData {
    console.log('🔍 [mapOrderDetailToCard] 입력 데이터:', detail);

    // 빈 객체인지 확인
    if (!detail || Object.keys(detail).length === 0) {
      console.error('🔍 [mapOrderDetailToCard] 빈 데이터 전달됨');
      return dummyOrderDetail;
    }

    const order = detail.order || ({} as Order);
    const orderDetails = detail.orderDetails || [];
    const orderDetail = orderDetails[0] || ({} as OrderDetail);
    const panelInfo = orderDetail.panels || ({} as PanelInfo);
    const customerInfo = detail.customerInfo || {};
    const priceInfo = detail.priceInfo || {};
    const payments = detail.payments || [];

    console.log('🔍 [mapOrderDetailToCard] 파싱된 데이터:', {
      order: order.order_number,
      orderDetailsCount: orderDetails.length,
      panelInfo: panelInfo.address,
      customerInfo,
      priceInfo,
      paymentsCount: payments.length,
    });

    // 최신 결제 정보 (created_at 기준으로 정렬된 첫 번째)
    const latestPayment = payments.length > 0 ? payments[0] : null;

    const displayStartDate = orderDetail.display_start_date ?? '-';
    const displayEndDate = orderDetail.display_end_date ?? '-';

    const result = {
      id: order.id ?? '-',
      order_number: order.order_number ?? '-',
      title: order.projectName ?? '-',
      location: panelInfo.address
        ? `${panelInfo.address}${
            panelInfo.nickname ? ` (${panelInfo.nickname})` : ''
          }`
        : '-',
      status: getStatusDisplay(order.payment_status || ''),
      category: formatDisplayType(panelInfo.display_types?.name || ''),
      customerName: customerInfo.name ?? '-',
      phone: customerInfo.phone ?? '-',
      companyName: customerInfo.company ?? '-',
      productName: panelInfo.panel_type ?? '-',
      price: priceInfo.totalPrice ?? 0,
      vat: priceInfo.totalTaxPrice ?? 0,
      advertisingFee: priceInfo.totalAdvertisingFee ?? 0,
      roadUsageFee: priceInfo.totalRoadUsageFee ?? 0,
      totalAmount: priceInfo.finalPrice ?? 0,
      paymentMethod: latestPayment?.payment_methods?.name ?? '-',
      depositorName: latestPayment?.depositor_name ?? '-',
      orderDate: order.created_at ?? '-',
      canCancel: order.payment_status === 'pending',
      daysSinceOrder: 0,
      // 추가 필드들
      projectName: order.projectName ?? '-',
      displayStartDate: formatDisplayPeriod(displayStartDate, displayEndDate),
      displayEndDate: displayEndDate,
    };

    console.log('🔍 [mapOrderDetailToCard] 결과:', result);
    return result;
  }

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col bg-gray-100 w-full">
        <Nav variant="default" className="bg-white sm:px-0" />
        <MypageContainer activeTab="주문내역">
          <h1 className="text-2xl font-bold mb-8">주문내역</h1>
          <TableSkeleton />
        </MypageContainer>
      </main>
    );
  }

  const items = transformOrdersForDisplay();

  return (
    <main className="min-h-screen flex flex-col bg-gray-100 w-full">
      <Nav variant="default" className="bg-white sm:px-0" />
      <MypageContainer activeTab="주문내역">
        <h1 className="text-2xl font-bold mb-8">주문내역</h1>

        {/* 결제대기 상태의 주문들 */}
        {pendingPaymentOrders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-blue-600">
              결제대기 주문
            </h2>
            <div className="space-y-4">
              {pendingPaymentOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        주문번호: {order.order_number}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {order.order_details?.[0]?.panels?.address || '상품명'}
                        {order.order_details?.[0]?.panels?.nickname &&
                          ` (${order.order_details[0].panels.nickname})`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {(order.payments?.[0]?.amount || 0).toLocaleString()}원
                      </p>
                      <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                        결제대기 중
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handlePaymentClick(order)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                      결제하기
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <OrderItemList
          items={items}
          expandedItemId={expandedItemId}
          onExpandItem={(itemId) => {
            const item = items.find((i) => i.id === itemId);
            if (item) handleOrderClick(item.orderId, itemId!);
            else setExpandedItemId(null);
          }}
          onCancelOrder={(item) => handleCancelClick(item.orderId || '')}
          expandedContent={
            expandedItemId
              ? (() => {
                  const item = items.find((i) => i.id === expandedItemId);
                  const currentOrder = item?.order;
                  const paymentStatus = item?.paymentStatus || '대기';
                  const isLoading = loadingOrderDetail === item?.orderId;

                  // 로딩 중이거나 데이터가 없으면 로딩 표시
                  if (isLoading || !selectedOrderDetail) {
                    return (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                          <p className="text-gray-600">
                            주문 정보를 불러오는 중...
                          </p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <OrderItemCard
                      orderDetail={mapOrderDetailToCard(selectedOrderDetail)}
                      paymentStatus={paymentStatus}
                      onClose={() => setExpandedItemId(null)}
                      onCancel={() =>
                        handleCancelClick(
                          selectedOrderDetail?.order?.order_number || ''
                        )
                      }
                      onPaymentClick={() => {
                        if (currentOrder) {
                          handlePaymentClick(currentOrder);
                        }
                      }}
                    />
                  );
                })()
              : null
          }
          onPaymentClick={(item) => {
            if (item.order) {
              handlePaymentClick(item.order);
            }
          }}
        />
      </MypageContainer>

      {/* 신청취소 확인 모달 */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 py-10">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-4">신청 취소</h3>
              <p className="text-gray-600 mb-6">신청을 취소하시겠습니까?</p>
              <div className="flex gap-4 justify-center">
                <Button
                  size="md"
                  variant="filledBlack"
                  onClick={handleCancelModalClose}
                  className="w-[6.5rem] h-[2.5rem] text-0.875 font-200 hover:cursor-pointer"
                >
                  아니오
                </Button>
                <Button
                  variant="filledBlack"
                  size="md"
                  onClick={handleCancelConfirm}
                  className="w-[6.5rem] h-[2.5rem] text-0.875 font-200 hover:cursor-pointer"
                >
                  예
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 신청취소 성공 모달 */}
      {isCancelSuccessModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="text-green-500 text-4xl mb-4">✓</div>
              <h3 className="text-xl font-bold mb-4">완료</h3>
              <p className="text-gray-600 mb-6">삭제되었습니다.</p>
              <Button
                size="md"
                variant="filledBlack"
                onClick={() => setIsCancelSuccessModalOpen(false)}
                className="w-full"
              >
                확인
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
