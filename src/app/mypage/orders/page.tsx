'use client';

import { useState, useEffect, useCallback } from 'react';
import Nav from '../../../components/layouts/nav';
import MypageContainer from '@/src/components/mypageContainer';
import { useAuth } from '@/src/contexts/authContext';
import OrderItemList from '@/src/components/orderItemList';
import OrderItemCard from '@/src/components/orderItemCard';
import { Button } from '@/src/components/button/button';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<any | null>(
    null
  );
  const { user } = useAuth();

  // 신청취소 관련 상태
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelSuccessModalOpen, setIsCancelSuccessModalOpen] =
    useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);

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
          console.log('selectedOrderDetail', data.data);
        } else {
          setSelectedOrderDetail({}); // 실패해도 빈 객체로 설정해 아코디언이 열리게
          console.log('selectedOrderDetail', {});
        }
      } catch (error) {
        console.error('주문 상세 조회 에러:', error);
        setSelectedOrderDetail({}); // 에러 시에도 빈 객체
        console.log('selectedOrderDetail', {});
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

  // 송출기간 포맷팅 함수
  const formatDisplayPeriod = (startDate: string, endDate: string) => {
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
    } catch (error) {
      return `${startDate} ~ ${endDate}`;
    }
  };

  // 디스플레이 타입 한글 변환 함수
  const formatDisplayType = (displayType: string) => {
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
  function mapOrderDetailToCard(detail: any): any {
    console.log('mapOrderDetailToCard input:', detail);

    const order = detail.order || {};
    const orderDetails = detail.orderDetails || [];
    const orderDetail = orderDetails[0] || {};
    const panelInfo = orderDetail.panel_info || {};
    const customerInfo = order.customerInfo || {};
    const priceInfo = order.priceInfo || {};
    const payments = detail.payments || [];

    // 최신 결제 정보 (created_at 기준으로 정렬된 첫 번째)
    const latestPayment = payments.length > 0 ? payments[0] : null;

    const displayStartDate = orderDetail.display_start_date ?? '-';
    const displayEndDate = orderDetail.display_end_date ?? '-';

    return {
      id: order.id ?? '-',
      order_number: order.order_number ?? '-',
      title: order.projectName ?? '-',
      location: panelInfo.address
        ? `${panelInfo.address}${
            panelInfo.nickname ? ` (${panelInfo.nickname})` : ''
          }`
        : '-',
      category: formatDisplayType(panelInfo.display_types?.name),
      customerName: customerInfo.name ?? '-',
      phone: customerInfo.phone ?? '-',
      companyName: customerInfo.company ?? undefined,
      productName: panelInfo.panel_type ?? '-',
      advertisingFee: priceInfo.totalAdvertisingFee ?? 0,
      vat: priceInfo.totalTaxPrice ?? 0,
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
  }

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
          onCancelOrder={(item) => handleCancelClick(item.orderId || '')}
          expandedContent={
            expandedItemId ? (
              <OrderItemCard
                orderDetail={
                  selectedOrderDetail
                    ? mapOrderDetailToCard(selectedOrderDetail)
                    : dummyOrderDetail
                }
                onClose={() => setExpandedItemId(null)}
                onCancel={() =>
                  handleCancelClick(
                    selectedOrderDetail?.order?.order_number || ''
                  )
                }
              />
            ) : null
          }
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
