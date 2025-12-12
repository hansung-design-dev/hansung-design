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
    banner_slot_price_policy?: BannerSlotPricePolicy[];
  };
}

interface BannerSlotPricePolicy {
  id: string;
  price_usage_type?: string;
  tax_price?: number;
  road_usage_fee?: number;
  advertising_fee?: number;
  total_price?: number;
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
  design_draft_id?: string;
  design_draft?: {
    id: string;
    project_name?: string;
    file_name?: string;
    file_url?: string;
    is_approved?: boolean;
  };
}

interface Payment {
  id: string;
  order_id: string;
  payment_method_id: string;
  payment_provider?: string;
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
  subtitle?: string; // 작업명
  location: string;
  status: string; // 마감여부
  paymentStatus: string; // 결제여부
  orderId: string;
  totalAmount: string;
  startDate?: string;
  endDate?: string;
  isClosed?: boolean; // 마감 여부
  panelCode?: string; // 게시대번호 (현수막게시대용)
  slotNumber?: number; // 배정 면 번호
  category?: string; // 품명 (현수막게시대, 전자게시대 등)
  productType: string;
  orderDetailId?: string; // 연결된 order_detail ID
  order?: Order; // 전체 주문 정보
  requiresManualPayment?: boolean;
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
  paymentMethodCode?: string;
  depositorName: string;
  orderDate: string;
  canCancel: boolean;
  daysSinceOrder: number;
  // 추가 필드들
  projectName?: string; // 파일이름 (design_draft.project_name)
  panelDisplayName?: string; // 게시대 명 (주소 + 별칭)
  panelCode?: string; // 게시대번호 (현수막게시대용)
  slotNumber?: number; // 배정 면 번호
  displayStartDate?: string; // 송출 시작일
  displayEndDate?: string; // 송출 종료일
  // 주문 프로필 정보
  profileTitle?: string; // 주문 프로필명
  profileCompany?: string; // 주문 프로필 회사명
  productType?: string;
  requiresManualPayment?: boolean;
}

type CancelTarget =
  | { kind: 'order'; orderNumber: string }
  | { kind: 'detail'; orderNumber: string; orderDetailId: string };

// 상담문의 데이터 (주문내역 페이지에서 사용)
interface InquiryForOrders {
  id: string;
  title: string;
  content: string;
  status: string;
  product_name?: string;
  answered_at?: string;
  created_at: string;
  product_type?: string;
}

const PRODUCT_TYPE_LABELS = {
  BANNER: '현수막게시대',
  TOP_FIXED: '현수막게시대 상단광고',
  LED: 'led전자게시대',
  DIGITAL_MEDIA: '디지털미디어 쇼핑몰아이템',
};

interface ProductTypeLookupParams {
  bannerType?: string | null;
  panelType?: string | null;
  displayTypeName?: string | null;
  inquiryProductType?: string | null;
}

const getProductTypeLabel = ({
  bannerType,
  panelType,
  displayTypeName,
  inquiryProductType,
}: ProductTypeLookupParams = {}) => {
  const normalizedBannerType = bannerType?.toLowerCase();
  const normalizedPanelType = panelType?.toLowerCase();
  const normalizedDisplayType = displayTypeName?.toLowerCase();
  const normalizedInquiryType = inquiryProductType?.toLowerCase();

  if (
    normalizedBannerType === 'top_fixed' ||
    normalizedPanelType === 'top_fixed' ||
    normalizedInquiryType === 'top_fixed'
  ) {
    return PRODUCT_TYPE_LABELS.TOP_FIXED;
  }

  if (normalizedInquiryType === 'led') {
    return PRODUCT_TYPE_LABELS.LED;
  }

  if (normalizedInquiryType === 'digital_media_product') {
    return PRODUCT_TYPE_LABELS.DIGITAL_MEDIA;
  }

  if (
    normalizedDisplayType === 'led_display' ||
    normalizedPanelType?.includes('led')
  ) {
    return PRODUCT_TYPE_LABELS.LED;
  }

  if (
    normalizedDisplayType === 'digital_signage' ||
    normalizedPanelType?.includes('digital')
  ) {
    return PRODUCT_TYPE_LABELS.DIGITAL_MEDIA;
  }

  return PRODUCT_TYPE_LABELS.BANNER;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);
  const [detailPage, setDetailPage] = useState(1);
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
  const [cancelTarget, setCancelTarget] = useState<CancelTarget | null>(null);
  const [isCancelNotAllowedModalOpen, setIsCancelNotAllowedModalOpen] =
    useState(false);
  const [isCancelProcessing, setIsCancelProcessing] = useState(false);
  const [inquiries, setInquiries] = useState<InquiryForOrders[]>([]);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<OrderCardData | null>(null);

  // 신청취소 핸들러
  const handleCancelClick = (order: Order, orderDetailId?: string) => {
    if (!order) return;

    try {
      const createdAt = order.created_at ? new Date(order.created_at) : null;

      if (createdAt) {
        const now = new Date();
        const diffMs = now.getTime() - createdAt.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        // 주문일로부터 2일(48시간) 이상 경과한 경우: 취소 불가
        if (diffDays >= 2) {
          setCancelTarget(null);
          setIsCancelModalOpen(false);
          setIsCancelNotAllowedModalOpen(true);
          return;
        }
      }

      const target: CancelTarget = orderDetailId
        ? {
            kind: 'detail',
            orderNumber: order.order_number,
            orderDetailId,
          }
        : {
            kind: 'order',
            orderNumber: order.order_number,
          };

      // 2일 이내인 경우에만 실제 취소 확인 모달 표시
      setCancelTarget(target);
      setIsCancelModalOpen(true);
    } catch (e) {
      console.error('신청 취소 가능 여부 판단 중 오류:', e);
      setCancelTarget(null);
      setIsCancelModalOpen(false);
    }
  };

  const fetchOrderDetail = useCallback(async (orderId: string) => {
    if (!orderId) {
      return;
    }

    setLoadingOrderDetail(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();

      if (data.success && data.data) {
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
  }, []);

  const handleCancelConfirm = async () => {
    if (!cancelTarget || isCancelProcessing) return;

    const targetOrderNumber = cancelTarget.orderNumber?.trim();

    if (!targetOrderNumber) {
      console.error(
        '주문 취소 요청 실패: 주문번호가 누락되었습니다.',
        cancelTarget
      );
      alert('주문번호를 확인할 수 없어 신청을 취소할 수 없습니다.');
      setIsCancelModalOpen(false);
      setCancelTarget(null);
      return;
    }

    setIsCancelProcessing(true);

    try {
      let response: Response;
      if (cancelTarget.kind === 'detail') {
        response = await fetch(
          `/api/order-details/${cancelTarget.orderDetailId}`,
          {
            method: 'DELETE',
          }
        );
      } else {
        console.log('🔍 [주문 취소] 요청 보내는 주문번호:', targetOrderNumber);
        response = await fetch(`/api/orders/cancel`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderNumber: targetOrderNumber,
          }),
        });
      }

      const data = await response.json();

      if (data.success) {
        setIsCancelSuccessModalOpen(true);
        // 주문 목록 새로고침
        fetchOrders();
        if (cancelTarget.kind === 'detail') {
          if (cancelTarget.orderNumber) {
            await fetchOrderDetail(cancelTarget.orderNumber);
          } else {
            setExpandedItemId(null);
            setSelectedOrderDetail(null);
          }
        } else {
          // 아코디언 닫기
          setExpandedItemId(null);
          setSelectedOrderDetail(null);
        }
      } else {
        console.error('주문 취소 실패:', {
          orderNumber: targetOrderNumber,
          error: data.error,
          code: data.code,
        });

        // 취소 가능 기간 초과 에러 처리
        if (data.code === 'CANCEL_PERIOD_EXPIRED') {
          setIsCancelNotAllowedModalOpen(true);
        } else {
          alert('주문 취소에 실패했습니다.');
        }
      }
    } catch (error) {
      console.error('주문 취소 중 오류:', error);
      alert('주문 취소 중 오류가 발생했습니다.');
    } finally {
      setIsCancelProcessing(false);
      setIsCancelModalOpen(false);
      setCancelTarget(null);
    }
  };

  const handleCancelModalClose = () => {
    setIsCancelModalOpen(false);
    setCancelTarget(null);
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

  // 상담신청 데이터도 함께 가져와서 INQ-* 주문과 매칭
  useEffect(() => {
    const fetchInquiriesForOrders = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch('/api/customer-service?page=1&limit=100');
        const data = await response.json();

        if (data.success && Array.isArray(data.inquiries)) {
          setInquiries(data.inquiries as InquiryForOrders[]);
        } else {
          console.error(
            '주문내역용 상담 데이터 조회 실패:',
            data.error || data
          );
        }
      } catch (error) {
        console.error('주문내역용 상담 데이터 조회 중 오류:', error);
      }
    };

    fetchInquiriesForOrders();
  }, [user?.id]);

  useEffect(() => {
    if (!selectedOrderDetail) return;
    const detailCount = selectedOrderDetail.orderDetails?.length ?? 0;
    const maxPage = Math.max(1, detailCount);
    if (detailPage > maxPage) {
      setDetailPage(maxPage);
    }
  }, [selectedOrderDetail, detailPage]);

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
        return '대기';
      case 'pending_deposit':
        return '입금대기';
      default:
        return '대기';
    }
  };

  // INQ-* 주문과 상담신청 매칭
  const findInquiryForOrder = (order: Order): InquiryForOrders | undefined => {
    if (!order.order_number?.startsWith('INQ-')) return undefined;
    const prefix = order.order_number.replace('INQ-', '');
    return inquiries.find((inq) => inq.id?.startsWith(prefix));
  };

  // "수유사거리 앞 - 서울 강북구 도봉로 316-1" 형태를
  // { alias: '수유사거리 앞', address: '서울 강북구 도봉로 316-1' } 로 분리
  const splitProductName = (
    productName: string
  ): { alias: string; address: string } => {
    if (!productName) {
      return { alias: '', address: '' };
    }
    const parts = productName.split(' - ');
    if (parts.length === 1) {
      const trimmed = productName.trim();
      return { alias: trimmed, address: trimmed };
    }
    const alias = parts[0].trim();
    const address = parts.slice(1).join(' - ').trim();
    return { alias, address };
  };

  const requiresManualPayment = (
    order: Order,
    payments?: Payment[]
  ): boolean => {
    const latestPayment =
      payments && payments.length > 0
        ? payments[0]
        : order.payments && order.payments.length > 0
        ? order.payments[0]
        : null;

    const manualMethodCode =
      latestPayment?.payment_methods?.method_code ||
      latestPayment?.payment_provider;

    const hasAdminProjectTag =
      order.projectName?.includes('[행정/기업용 결제대기]');
    const isTempOrder = Boolean(order.order_number?.startsWith('temp_'));

    return (
      Boolean(order.order_number?.startsWith('INQ-')) ||
      order.payment_status === 'waiting_admin_approval' ||
      manualMethodCode === 'admin_approval' ||
      hasAdminProjectTag ||
      isTempOrder
    );
  };

  // 리스트에 표시할 데이터 변환
  const transformOrdersForDisplay = (): DisplayItem[] => {
    let globalIndex = 1;
    const displayItems: DisplayItem[] = [];

    const safeTrim = (value?: string | number): string => {
      if (value === undefined || value === null) return '';
      if (typeof value === 'string') return value.trim();
      return String(value).trim();
    };

    const buildBoardLabel = (
      rowNumber: number,
      panelCode?: string | number,
      panelName?: string,
      panelAddress?: string,
      slotNumber?: number | null
    ): string => {
      const codeLabel = safeTrim(panelCode) || '-';
      const addressLabel = safeTrim(panelAddress) || '-';
      const nameLabel = safeTrim(panelName) || addressLabel || '-';
      const slotLabel =
        typeof slotNumber === 'number' ? ` / ${slotNumber}번면` : '';
      return `${rowNumber}. ${codeLabel} / ${nameLabel} / ${addressLabel}${slotLabel}`;
    };

    orders.forEach((order) => {
      const orderDetails = order.order_details || [];
      const manualPaymentRequired = requiresManualPayment(order);

      // 작업명 추출 (order.projectName 또는 design_drafts에서)
      const projectName =
        order.projectName && order.projectName !== '프로젝트명 없음'
          ? order.projectName
          : (() => {
              const orderWithDrafts = order as Order & {
                design_drafts?: Array<{ project_name?: string }>;
              };
              const draftProjectName =
                orderWithDrafts.design_drafts?.[0]?.project_name;
              return draftProjectName && draftProjectName !== '프로젝트명 없음'
                ? draftProjectName
                : null;
            })();

      const rowNumber = globalIndex++;

      if (orderDetails.length > 0) {
        // 대표 상세 정보(첫 번째 항목)로 대표 정보 생성
        const item = orderDetails[0];
        const displayTypeName = item.panels?.display_types?.name || '';
        const category = formatDisplayType(displayTypeName);
        const productType = getProductTypeLabel({
          bannerType: item.panel_slot_usage?.banner_type,
          panelType: item.panels?.panel_type,
          displayTypeName,
        });
        const panelAddress = item.panels?.address;
        const panelName = item.panels?.nickname;
        const panelCode = item.panels?.panel_code || item.panel_id;
        const slotNumber = item.panel_slot_usage?.slot_number ?? null;
        const boardLabel = buildBoardLabel(
          rowNumber,
          panelCode,
          panelName,
          panelAddress,
          slotNumber
        );

        displayItems.push({
          id: rowNumber,
          title: boardLabel,
          subtitle: projectName || undefined,
          location: item.panels?.region_gu?.name || '-',
          status: getClosureStatus(item, order),
          paymentStatus: getPaymentStatusDisplay(order.payment_status),
          orderId: order.order_number,
          totalAmount:
            (order.payments?.[0]?.amount || 0).toLocaleString() + '원',
          startDate: item.display_start_date,
          endDate: item.display_end_date,
          isClosed: item.panel_slot_usage?.is_closed === true,
          panelCode: item.panels?.panel_code,
          slotNumber: typeof slotNumber === 'number' ? slotNumber : undefined,
          category: category,
          productType,
          order: order,
          requiresManualPayment: manualPaymentRequired,
        });
      } else {
        // 상담신청 기반 등 order_details가 없는 주문도 목록에 표시
        const inquiry = findInquiryForOrder(order);
        let location = order.user_profiles?.company_name || '';

        let panelAlias = order.projectName || '상담신청 주문';
        let panelAddress = '';
        if (inquiry?.product_name) {
          const { alias, address } = splitProductName(inquiry.product_name);
          panelAlias = alias || panelAlias;
          panelAddress = address || '';

          const addressParts = address.split(' ');
          const guName =
            addressParts.length >= 2 ? addressParts[1] : address || '';
          location = guName;
        } else if (inquiry?.title) {
          panelAlias = inquiry.title;
        }

        const boardLabel = buildBoardLabel(
          rowNumber,
          undefined,
          panelAlias,
          panelAddress
        );

        displayItems.push({
          id: rowNumber,
          title: boardLabel,
          subtitle: order.projectName || undefined,
          location: location || '-',
          status: '진행중',
          paymentStatus: getPaymentStatusDisplay(order.payment_status),
          orderId: order.order_number,
          totalAmount:
            (order.payments?.[0]?.amount || 0).toLocaleString() + '원',
          order: order,
          productType: getProductTypeLabel({
            inquiryProductType: inquiry?.product_type,
          }),
          requiresManualPayment: manualPaymentRequired,
        });
      }
    });

    return displayItems;
  };

  // 상태 변환
  const getStatusDisplay = (status: string): string => {
    switch (status) {
      case 'pending':
        // 카드/온라인 결제 대기 (결제하기 버튼 표시)
        return '결제대기 중';
      case 'pending_payment':
        return '결제대기 중';
      case 'waiting_admin_approval':
        return '결제대기 중';
      case 'pending_deposit':
        // 계좌이체 입금 대기 (결제하기 버튼 숨김)
        return '입금대기 중';
      case 'confirmed':
        return '결제완료';
      case 'completed':
        // 결제까지 모두 완료된 상태
        return '결제완료';
      case 'cancelled':
        return '취소';
      default:
        return status;
    }
  };

  // 상세 정보 fetch (orderId 기준)
  const handleOrderClick = (orderId: string, itemId: number) => {
    const isExpanding = expandedItemId !== itemId;
    setExpandedItemId(isExpanding ? itemId : null);
    setDetailPage(1);

    if (isExpanding) {
      setSelectedOrderDetail(null);
      fetchOrderDetail(orderId);
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
    productType: '-',
    requiresManualPayment: false,
  };

  // 주문일시 포맷 (년월일)
  const formatOrderDate = (dateString?: string): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) {
        return '-';
      }
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return '-';
    }
  };

  // 송출기간 포맷팅 함수 (현수막게시대는 상/하반기까지 표시)
  const formatDisplayPeriod = (startDate: string, endDate: string): string => {
    if (!startDate || !endDate || startDate === '-' || endDate === '-') {
      return '-';
    }

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const startYear = start.getFullYear();
      const startMonth = start.getMonth() + 1;
      const startDay = start.getDate();
      const endYear = end.getFullYear();
      const endMonth = end.getMonth() + 1;
      const endDay = end.getDate();

      // 같은 년/월이고, 날짜 범위가 한 달 안에서 끝나는 경우에는 상/하반기까지 표시
      if (startYear === endYear && startMonth === endMonth) {
        const isFirstHalf = startDay <= 15 && endDay <= 15;
        const halfLabel = isFirstHalf ? '상반기' : '하반기';
        return `${startYear}년 ${startMonth}월 ${halfLabel}`;
      }

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
        return '전자게시대';
      case 'digital_signage':
        return '디지털미디어 쇼핑몰';
      default:
        return displayType || '-';
    }
  };

  // 상세 데이터 → OrderItemCard용 데이터로 변환
  interface DetailPriceInfo {
    totalPrice: number;
    totalTaxPrice: number;
    totalAdvertisingFee: number;
    totalRoadUsageFee: number;
    finalPrice: number;
  }

  const getDetailProjectName = (order: Order, detail: OrderDetail): string => {
    const projectNameFromDetail = detail.design_draft?.project_name;
    if (
      projectNameFromDetail &&
      projectNameFromDetail.trim() !== '' &&
      projectNameFromDetail !== '프로젝트명 없음' &&
      projectNameFromDetail !== '미정'
    ) {
      return projectNameFromDetail;
    }

    if (
      order.projectName &&
      order.projectName.trim() !== '' &&
      order.projectName !== '프로젝트명 없음' &&
      order.projectName !== '미정'
    ) {
      return order.projectName;
    }

    const orderWithDrafts = order as Order & {
      design_drafts?: Array<{ project_name?: string }>;
    };
    const draftProjectName =
      orderWithDrafts.design_drafts?.[0]?.project_name ?? undefined;
    if (
      draftProjectName &&
      draftProjectName.trim() !== '' &&
      draftProjectName !== '프로젝트명 없음' &&
      draftProjectName !== '미정'
    ) {
      return draftProjectName;
    }

    return '프로젝트명 없음';
  };

  const getDetailPriceInfo = (
    order: Order,
    detail: OrderDetail,
    allDetails: OrderDetail[],
    payments: Payment[]
  ): DetailPriceInfo => {
    const quantity = detail.slot_order_quantity || 1;
    const policies =
      detail.panel_slot_usage?.banner_slots?.banner_slot_price_policy || [];
    const isPublicInstitution =
      order.user_profiles?.is_public_institution || false;
    const preferredType = isPublicInstitution
      ? 'public_institution'
      : 'default';

    let selectedPolicy = policies.find(
      (policy) => policy.price_usage_type === preferredType
    );
    if (!selectedPolicy) {
      selectedPolicy = policies.find(
        (policy) => policy.price_usage_type === 'default'
      );
    }
    if (!selectedPolicy && policies.length > 0) {
      selectedPolicy = policies[0];
    }

    if (selectedPolicy) {
      const totalPrice = Number(selectedPolicy.total_price || 0) * quantity;
      const totalTaxPrice = Number(selectedPolicy.tax_price || 0) * quantity;
      const totalAdvertisingFee =
        Number(selectedPolicy.advertising_fee || 0) * quantity;
      const totalRoadUsageFee =
        Number(selectedPolicy.road_usage_fee || 0) * quantity;
      return {
        totalPrice,
        totalTaxPrice,
        totalAdvertisingFee,
        totalRoadUsageFee,
        finalPrice: totalPrice,
      };
    }

    if (detail.panel_slot_usage?.unit_price) {
      const unitPrice = Number(detail.panel_slot_usage.unit_price);
      const totalPrice = unitPrice * quantity;
      return {
        totalPrice,
        totalTaxPrice: 0,
        totalAdvertisingFee: totalPrice,
        totalRoadUsageFee: 0,
        finalPrice: totalPrice,
      };
    }

    const paymentAmount = Number(payments?.[0]?.amount ?? 0);
    const totalSlots = allDetails.reduce(
      (sum, current) => sum + (current.slot_order_quantity || 1),
      0
    );

    if (paymentAmount > 0 && totalSlots > 0) {
      const detailSlots = detail.slot_order_quantity || 1;
      const distributedPrice = Math.round(
        (paymentAmount * detailSlots) / totalSlots
      );
      return {
        totalPrice: distributedPrice,
        totalTaxPrice: 0,
        totalAdvertisingFee: distributedPrice,
        totalRoadUsageFee: 0,
        finalPrice: distributedPrice,
      };
    }

    return {
      totalPrice: 0,
      totalTaxPrice: 0,
      totalAdvertisingFee: 0,
      totalRoadUsageFee: 0,
      finalPrice: 0,
    };
  };

  function mapOrderDetailToCard(
    detail: OrderDetailResponse,
    targetDetailId?: string
  ): OrderCardData {
    console.log('🔍 [mapOrderDetailToCard] 입력 데이터:', detail);

    // 빈 객체인지 확인
    if (!detail || Object.keys(detail).length === 0) {
      console.error('🔍 [mapOrderDetailToCard] 빈 데이터 전달됨');
      return dummyOrderDetail;
    }

    const order = detail.order || ({} as Order);
    const orderDetails = detail.orderDetails || [];
    const orderDetail =
      (targetDetailId
        ? orderDetails.find((item) => item.id === targetDetailId)
        : undefined) ||
      orderDetails[0] ||
      ({} as OrderDetail);
    const panelInfo = orderDetail.panels || ({} as PanelInfo);
    const slotNumber = orderDetail.panel_slot_usage?.slot_number;

    const userProfile = order.user_profiles || ({} as UserProfile);
    const customerInfo = detail.customerInfo || {};
    const payments = detail.payments || [];
    const detailPriceInfo = getDetailPriceInfo(
      order,
      orderDetail,
      orderDetails,
      payments
    );

    console.log('🔍 [mapOrderDetailToCard] 파싱된 데이터:', {
      order: order.order_number,
      orderDetailsCount: orderDetails.length,
      panelInfo: panelInfo.address,
      customerInfo,
      detailPriceInfo,
      paymentsCount: payments.length,
    });

    // 최신 결제 정보 (created_at 기준으로 정렬된 첫 번째)
    const latestPayment = payments.length > 0 ? payments[0] : null;

    const displayStartDate = orderDetail.display_start_date ?? '-';
    const displayEndDate = orderDetail.display_end_date ?? '-';

    // 주문일 기준 취소 가능 여부 및 경과 일수 계산
    const createdAt = order.created_at ? new Date(order.created_at) : null;
    let daysSinceOrder = 0;
    let canCancel = true;

    if (createdAt) {
      const now = new Date();
      const diffMs = now.getTime() - createdAt.getTime();
      daysSinceOrder = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      // 주문일로부터 2일(48시간) 이상 경과한 경우: 취소 불가
      canCancel = daysSinceOrder < 2;
    }

    // INQ-* 주문의 경우 대응되는 상담 데이터를 찾아서 위치/게시대명을 보완
    const inquiryForOrder = findInquiryForOrder(order);
    let inquiryAddress = '';
    if (inquiryForOrder?.product_name) {
      const { address } = splitProductName(inquiryForOrder.product_name);
      inquiryAddress = address;
    }

    // 파일이름(프로젝트명): 실제 프로젝트 이름만 사용 (게시대 주소/별칭은 사용하지 않음)
    // - design_drafts[0].project_name 우선 사용 (원본 데이터)
    // - 없으면 order.projectName 사용 (API에서 이미 처리된 값)
    // - 둘 다 없으면 '프로젝트명 없음' 또는 '미정'
    let finalProjectName = getDetailProjectName(order, orderDetail);
    const hasRealProjectName =
      finalProjectName !== '프로젝트명 없음' && finalProjectName !== '미정';

    // 게시대 명: 주소 + 별칭 조합
    let panelDisplayName = '-';
    if (panelInfo.address) {
      panelDisplayName = panelInfo.address;
      if (panelInfo.nickname) {
        panelDisplayName += ` (${panelInfo.nickname})`;
      }
    }

    // 게시대번호 추출 (현수막게시대용)
    const panelCode = panelInfo.panel_code || undefined;

    // 상담신청(INQ-*) 주문이고 패널 정보가 없으면
    // - 결제 전: 파일이름은 '미정'
    // - 결제 후(projectName이 생긴 후): 파일이름은 실제 projectName 유지
    // - 위치: 상담신청 주소
    // - 품명: 전자게시대 (상담신청 아이템 기본값)
    const isInquiryOrder =
      Boolean(order.order_number) && order.order_number.startsWith('INQ-');
    const manualPaymentRequired = requiresManualPayment(order, payments);

    let finalLocation = panelInfo.address || '-';
    let finalCategory = formatDisplayType(panelInfo.display_types?.name || '');
    const productTypeLabel = getProductTypeLabel({
      bannerType: orderDetail.panel_slot_usage?.banner_type,
      panelType: panelInfo.panel_type,
      displayTypeName: panelInfo.display_types?.name,
    });

    if (isInquiryOrder && !panelInfo.address && inquiryAddress) {
      if (!hasRealProjectName) {
        finalProjectName = '미정';
      }
      finalLocation = inquiryAddress;
      finalCategory = '전자게시대';
      // 상담신청 주문의 경우 게시대 명도 상담 주소 사용
      if (inquiryAddress) {
        panelDisplayName = inquiryAddress;
      }
    }

    const result: OrderCardData = {
      id: order.id ?? '-',
      order_number: order.order_number ?? '-',
      title: finalProjectName,
      // 위치는 순수 주소만 표시 (상담신청 주문이면 상담 주소)
      location: finalLocation,
      status: getStatusDisplay(order.payment_status || ''),
      category: finalCategory,
      customerName: customerInfo.name ?? '-',
      phone: customerInfo.phone ?? '-',
      companyName: customerInfo.company ?? '-',
      productName: panelInfo.panel_type ?? '-',
      price: detailPriceInfo.totalPrice,
      vat: detailPriceInfo.totalTaxPrice,
      advertisingFee: detailPriceInfo.totalAdvertisingFee,
      roadUsageFee: detailPriceInfo.totalRoadUsageFee,
      totalAmount: detailPriceInfo.finalPrice,
      paymentMethod: latestPayment?.payment_methods?.name ?? '-',
      paymentMethodCode: latestPayment?.payment_methods?.method_code,
      depositorName: latestPayment?.depositor_name ?? '-',
      orderDate: formatOrderDate(order.created_at ?? undefined),
      canCancel,
      daysSinceOrder,
      // 추가 필드들
      projectName: finalProjectName,
      panelDisplayName: panelDisplayName,
      panelCode: panelCode,
      slotNumber: typeof slotNumber === 'number' ? slotNumber : undefined,
      displayStartDate: formatDisplayPeriod(displayStartDate, displayEndDate),
      displayEndDate: displayEndDate,
      // 주문 프로필 정보 (없으면 '-'로 표시)
      profileTitle: userProfile.profile_title || '-',
      profileCompany: userProfile.company_name || '-',
      productType: productTypeLabel,
      requiresManualPayment: manualPaymentRequired,
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

        <OrderItemList
          items={items}
          expandedItemId={expandedItemId}
          onExpandItem={(itemId) => {
            const item = items.find((i) => i.id === itemId);
            if (item) handleOrderClick(item.orderId, itemId!);
            else setExpandedItemId(null);
          }}
          onCancelOrder={(item) => {
            if (item.order) {
              handleCancelClick(item.order);
            }
          }}
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

                  return (() => {
                    const orderDetails =
                      selectedOrderDetail?.orderDetails || [];
                    const detailCount = orderDetails.length;
                    const totalDetailPages = Math.max(1, detailCount);
                    const currentDetail = orderDetails[detailPage - 1];
                    const currentCardData =
                      currentDetail && selectedOrderDetail
                        ? mapOrderDetailToCard(
                            selectedOrderDetail,
                            currentDetail.id
                          )
                        : null;

                    return (
                      <div className="flex flex-col gap-6 bg-white px-4 py-6 border border-t-0 border-gray-200">
                        {currentCardData ? (
                          <OrderItemCard
                            orderDetail={currentCardData}
                            paymentStatus={paymentStatus}
                            onClose={() => setExpandedItemId(null)}
                            onCancel={() => {
                              if (
                                selectedOrderDetail?.order &&
                                currentDetail?.id
                              ) {
                                handleCancelClick(
                                  selectedOrderDetail.order,
                                  currentDetail.id
                                );
                              }
                            }}
                            onPaymentClick={() => {
                              if (currentOrder) {
                                handlePaymentClick(currentOrder);
                              }
                            }}
                            onResendFile={() => {
                              if (currentCardData.order_number) {
                                window.location.href = `/mypage/design?orderNumber=${encodeURIComponent(
                                  currentCardData.order_number
                                )}&tab=upload`;
                              } else {
                                window.location.href = `/mypage/design?tab=upload`;
                              }
                            }}
                            onReceiptClick={() => {
                              setReceiptData(currentCardData);
                              setReceiptModalOpen(true);
                            }}
                          />
                        ) : (
                          <div className="text-center py-10 text-gray-500">
                            주문 상세 정보를 불러올 수 없습니다.
                          </div>
                        )}

                        {detailCount > 0 && (
                          <div className="flex items-center justify-between gap-4 pt-2 border-t border-gray-200">
                            <Button
                              size="xs"
                              variant="outlinedGray"
                              disabled={detailPage <= 1}
                              onClick={() =>
                                setDetailPage((prev) => Math.max(1, prev - 1))
                              }
                            >
                              이전 상세
                            </Button>
                            <div className="text-sm font-medium text-gray-600">
                              {detailPage} / {totalDetailPages}
                            </div>
                            <Button
                              size="xs"
                              variant="outlinedGray"
                              disabled={detailPage >= totalDetailPages}
                              onClick={() =>
                                setDetailPage((prev) =>
                                  Math.min(totalDetailPages, prev + 1)
                                )
                              }
                            >
                              다음 상세
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })();
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
                  disabled={isCancelProcessing}
                  className={`w-[6.5rem] h-[2.5rem] text-0.875 font-200 ${
                    isCancelProcessing
                      ? 'cursor-not-allowed opacity-60'
                      : 'hover:cursor-pointer'
                  }`}
                >
                  {isCancelProcessing ? '처리중...' : '예'}
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

      {/* 신청취소 불가 안내 모달 (주문일로부터 2일 경과) */}
      {isCancelNotAllowedModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-4">신청 취소 불가</h3>
              <p className="text-gray-600 mb-6">
                구매 후 2일 뒤부터는 취소가 불가합니다. 고객센터로 문의해주세요.
              </p>
              <Button
                size="md"
                variant="filledBlack"
                onClick={() => setIsCancelNotAllowedModalOpen(false)}
                className="w-full"
              >
                확인
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 영수증 모달 */}
      {receiptModalOpen && receiptData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold mb-4">영수증</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">주문번호</span>
                <span className="font-medium">{receiptData.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">주문일자</span>
                <span className="font-medium">{receiptData.orderDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">결제수단</span>
                <span className="font-medium">
                  {receiptData.paymentMethod || '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">결제금액</span>
                <span className="font-medium">
                  {receiptData.totalAmount?.toLocaleString?.() ?? '0'}원
                </span>
              </div>
            </div>
            <Button
              size="md"
              variant="filledBlack"
              className="mt-6 w-full"
              onClick={() => {
                setReceiptModalOpen(false);
                setReceiptData(null);
              }}
            >
              닫기
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
