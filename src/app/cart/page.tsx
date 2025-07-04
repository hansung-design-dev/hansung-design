'use client';
import { motion } from 'framer-motion';
import { useCart } from '@/src/contexts/cartContext';
import { useAuth } from '@/src/contexts/authContext';
import Image from 'next/image';
import { Button } from '@/src/components/button/button';
import { CartItem } from '@/src/contexts/cartContext';
import { useState, useMemo, useEffect, useCallback } from 'react';
import UserProfileModal from '@/src/components/modal/UserProfileModal';
import ConsultationModal from '@/src/components/modal/ConsultationModal';
import PeriodSelector from '@/src/components/PeriodSelector';
// import CartItemAccordion from '@/src/components/cartItemAccordion';
//import { useRouter } from 'next/navigation';

const fadeInUp = {
  initial: { y: 60, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
};
const dividerVertical = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="2"
    height="128"
    viewBox="0 0 2 128"
    fill="none"
  >
    <path d="M1 0V128" stroke="#D9D9D9" />
  </svg>
);

// const dividerHorizontal = (
//   <div className="w-[95%] mx-auto">
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       width="100%"
//       height="4"
//       viewBox="0 0 1441 4"
//       fill="none"
//     >
//       <path d="M0 2H1441" stroke="black" strokeWidth="4" />
//     </svg>
//   </div>
// );

function CartGroupCard({
  title,
  children,
  phoneList,
  isSelected,
  onSelect,
}: {
  title: string;
  children: React.ReactNode;
  phoneList?: string[];
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
}) {
  return (
    <div className="mb-8 bg-white rounded-lg overflow-hidden py-4">
      <div className="flex items-center pt-4 pb-2 border-b border-black px-[3rem]">
        <input
          type="checkbox"
          className="w-6 h-6 mr-4"
          checked={isSelected}
          onChange={(e) => onSelect?.(e.target.checked)}
        />
        <span className="text-xl font-semibold">{title}</span>
        {phoneList && (
          <span className="ml-4 text-sm text-gray-500">
            상담전화: {phoneList.join(', ')}
          </span>
        )}
      </div>
      <div className="w-[95%] mx-auto">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="4"
          viewBox="0 0 1441 4"
          fill="none"
        >
          <path d="M0 2H1441" stroke="black" strokeWidth="4" />
        </svg>
      </div>
      <div>{children}</div>
    </div>
  );
}

interface InquiryStatus {
  [productId: string]: {
    status: string;
    answer_content?: string;
    answered_at?: string;
  };
}

function CartItemRow({
  item,
  user,
  isSelected,
  onSelect,
  isConsulting = false,
  onOrderModify,
  onConsultation,
  onDelete,
  onPeriodChange,
  inquiryStatus,
}: {
  item: CartItem;
  user: { name: string; phone: string; company_name?: string };
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  isConsulting?: boolean;
  onOrderModify?: () => void;
  onConsultation?: () => void;
  onDelete?: () => void;
  onPeriodChange?: (
    itemId: string,
    year: number,
    month: number,
    halfPeriod: 'first_half' | 'second_half'
  ) => void;
  inquiryStatus?: {
    status: string;
    answer_content?: string;
    answered_at?: string;
  };
}) {
  if (isConsulting) {
    const hasInquiry = inquiryStatus && inquiryStatus.status;
    const isPending = hasInquiry && inquiryStatus.status === 'pending';
    const isAnswered = hasInquiry && inquiryStatus.status === 'answered';

    return (
      <div className="relative flex items-center pl-[3rem] py-6 border-b border-gray-200">
        <div className="flex items-center w-2/3 min-w-0">
          <Image
            src="/images/digital-signage-grid-example.jpeg"
            alt="썸네일"
            width={80}
            height={80}
            className="w-24 h-24 object-cover mr-4 flex-shrink-0"
          />

          <div className="flex flex-col gap-3 min-w-0 flex-1">
            <div className="text-1 truncate">{item.name}</div>
            <div className="text-1.25 font-semibold">
              {item.price === 0
                ? '상담문의'
                : `${item.price?.toLocaleString()}원`}
            </div>
          </div>
        </div>
        {dividerVertical}
        <div className="flex flex-col ml-2 text-1 font-500 gap-2 text-gray-2 w-1/3">
          <div>담당자명: {user?.name}</div>
          <div>전화번호: {user?.phone}</div>
          <div>회사이름: {user?.company_name || '-'}</div>
          <Button
            size="xs"
            variant="outlinedBlack"
            className="w-[5rem] h-[2rem] text-1"
            onClick={onOrderModify}
          >
            주문수정
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 p-4 border-solid border-1 border-gray-1 w-[20rem] mt-4">
          <div className="text-center text-0.875 font-500">
            해당상품은 상담 진행 후 결제가 완료됩니다.
            <br /> 상담문의가 어려우실 경우 고객센터에 문의 부탁드립니다.
          </div>
          <Button
            className={`w-[15rem] h-[2rem] px-12 py-4 text-lg font-bold rounded text-1 ${
              isPending
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
            onClick={onConsultation}
            disabled={!!isPending}
          >
            {isPending ? (
              <>
                상담문의
                <br />
                <span className="text-0.75">*답변대기중입니다.</span>
              </>
            ) : isAnswered ? (
              '답변완료'
            ) : (
              '상담문의'
            )}
          </Button>
        </div>
        <button
          className="absolute top-1 right-10 text-1.5 font-100 text-gray-2 hover:cursor-pointer"
          onClick={onDelete}
        >
          x
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex items-center pl-[3rem] py-6">
      <input
        type="checkbox"
        className="w-5 h-5 mr-6 flex-shrink-0"
        checked={isSelected}
        onChange={(e) => onSelect?.(e.target.checked)}
      />
      <div className="flex items-center w-2/3 min-w-0">
        <Image
          src="/images/digital-signage-grid-example.jpeg"
          alt="썸네일"
          width={80}
          height={80}
          className="w-24 h-24 object-cover mr-4 flex-shrink-0"
        />
        <div className="flex flex-col gap-3 min-w-0 flex-1">
          <div className="text-1 truncate">{item.name}</div>
          <div className="text-1.25 font-semibold">
            {item.price === 0
              ? '상담문의'
              : `${item.price?.toLocaleString()}원`}
          </div>
          {/* 기간 선택 UI - 상담이 아닌 경우에만 표시, LED 전자게시대는 제외 */}
          {!isConsulting && item.price !== 0 && item.type !== 'led-display' && (
            <div className="mt-2">
              <PeriodSelector
                halfPeriod={item.halfPeriod}
                onPeriodChange={(year, month, halfPeriod) => {
                  onPeriodChange?.(item.id, year, month, halfPeriod);
                }}
              />
            </div>
          )}
        </div>
      </div>
      {dividerVertical}
      <div className="flex flex-col ml-2 text-1 font-500 gap-2 text-gray-2 w-1/3">
        <div>담당자명: {user?.name}</div>
        <div>전화번호: {user?.phone}</div>
        <div>회사이름: {user?.company_name || '-'}</div>
        <Button
          size="xs"
          variant="outlinedBlack"
          className="w-[5rem] h-[2rem] text-1"
          onClick={onOrderModify}
        >
          주문수정
        </Button>
      </div>
      <button
        className="absolute top-5 right-10 text-1.5 font-100 text-gray-2 hover:cursor-pointer"
        onClick={onDelete}
      >
        x
      </button>
    </div>
  );
}

// 삭제 확인 모달 컴포넌트
function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 py-10">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-4">상품 삭제</h3>
          <p className="text-gray-600 mb-6">
            &ldquo;{itemName}&rdquo; 상품을 <br />
            정말 삭제하시겠습니까?
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="md"
              variant="filledBlack"
              onClick={onClose}
              className="w-[6.5rem] h-[2.5rem] text-0.875 font-200 hover:cursor-pointer"
            >
              아니오
            </Button>
            <Button
              variant="filledBlack"
              size="md"
              onClick={onConfirm}
              className="w-[6.5rem] h-[2.5rem] text-0.875 font-200 hover:cursor-pointer"
            >
              예
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 성공 모달 컴포넌트
function SuccessModal({
  isOpen,
  onClose,
  message,
}: {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="text-green-500 text-4xl mb-4">✓</div>
          <h3 className="text-xl font-bold mb-4">완료</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <Button
            size="md"
            variant="filledBlack"
            onClick={onClose}
            className="w-full"
          >
            확인
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Cart() {
  const { cart, dispatch } = useCart();
  const { user } = useAuth();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'payment' | 'consulting'>(
    'payment'
  );
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [selectedProductName, setSelectedProductName] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);
  const [isUpdateSuccessModalOpen, setIsUpdateSuccessModalOpen] =
    useState(false);
  const [inquiryStatuses, setInquiryStatuses] = useState<InquiryStatus>({});

  // 선택된 프로필 정보 상태 추가 - 각 아이템별로 관리
  const [selectedProfiles, setSelectedProfiles] = useState<
    Map<
      string,
      {
        name: string;
        phone: string;
        company_name: string;
      }
    >
  >(new Map());

  // 현재 주문수정 버튼을 클릭한 아이템 ID
  const [currentModifyingItemId, setCurrentModifyingItemId] = useState<
    string | null
  >(null);

  // alert를 모달로 교체하기 위한 상태들
  const [isPaymentSuccessModalOpen, setIsPaymentSuccessModalOpen] =
    useState(false);
  const [isPaymentErrorModalOpen, setIsPaymentErrorModalOpen] = useState(false);
  const [isValidationErrorModalOpen, setIsValidationErrorModalOpen] =
    useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  console.log('user', user);

  // phone이 없을 때 기본값 설정
  const userWithPhone = user
    ? {
        ...user,
        phone: user.phone || '전화번호 없음',
        company_name: '-',
      }
    : null;

  // 특정 아이템의 사용자 정보를 가져오는 함수
  const getItemUserInfo = (itemId: string) => {
    const profileInfo = selectedProfiles.get(itemId);
    return (
      profileInfo ||
      userWithPhone || {
        name: '사용자',
        phone: '전화번호 없음',
        company_name: '-',
      }
    );
  };

  // 상단광고와 현수막게시대를 구분하여 그룹화
  const groupedItems = useMemo(() => {
    const consultingItems = cart.filter(
      (item) => item.price === 0 || item.isTopFixed
    );
    const regularItems = cart.filter(
      (item) => item.price > 0 && !item.isTopFixed
    );

    return {
      consulting: consultingItems,
      regular: regularItems,
    };
  }, [cart]);

  // 상담신청 아이템들을 타입별로 분리
  const bannerConsultingItems = groupedItems.consulting.filter(
    (item) => item.type === 'banner-display'
  );
  const ledConsultingItemsOnly = groupedItems.consulting.filter(
    (item) => item.type === 'led-display'
  ); // LED 전자게시대는 모두 상담신청

  // 상담신청 아이템들의 문의 상태 확인
  const fetchInquiryStatuses = useCallback(async () => {
    try {
      const statuses: InquiryStatus = {};

      for (const item of groupedItems.consulting) {
        const response = await fetch(
          `/api/customer-service?product_id=${item.id}`
        );
        const data = await response.json();

        if (data.success && data.inquiries && data.inquiries.length > 0) {
          const latestInquiry = data.inquiries[0];
          statuses[item.id] = {
            status: latestInquiry.status,
            answer_content: latestInquiry.answer,
            answered_at: latestInquiry.answered_at,
          };
        }
      }

      setInquiryStatuses(statuses);
    } catch (error) {
      console.error('문의 상태 확인 실패:', error);
    }
  }, [groupedItems.consulting]);

  useEffect(() => {
    if (user && groupedItems.consulting.length > 0) {
      fetchInquiryStatuses();
    }
  }, [user, groupedItems.consulting.length, fetchInquiryStatuses]);

  // 선택된 아이템들의 총계 계산
  const cartSummary = useMemo(() => {
    const selectedCartItems = cart.filter((item) =>
      selectedItems.has(String(item.id))
    );
    const totalQuantity = selectedCartItems.length;
    const totalPrice = selectedCartItems.reduce((sum, item) => {
      // 상담문의는 가격이 0이므로 제외
      if (item.price === 0) return sum;
      return sum + (item.price || 0);
    }, 0);

    return {
      quantity: totalQuantity,
      totalAmount: totalPrice,
    };
  }, [cart, selectedItems]);

  const handleItemSelect = (itemId: string, selected: boolean) => {
    const newSelected = new Set(selectedItems);
    if (selected) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleGroupSelect = (items: CartItem[], selected: boolean) => {
    const newSelected = new Set(selectedItems);
    if (selected) {
      items.forEach((item) => newSelected.add(String(item.id)));
    } else {
      items.forEach((item) => newSelected.delete(String(item.id)));
    }
    setSelectedItems(newSelected);
  };

  const isGroupSelected = (items: CartItem[]) => {
    return (
      items.length > 0 &&
      items.every((item) => selectedItems.has(String(item.id)))
    );
  };

  const handleOrderModify = (itemId: string) => {
    setCurrentModifyingItemId(itemId);
    setIsOrderModalOpen(true);
  };

  const handleProfileConfirm = (
    profileData: {
      profile_title: string;
      company_name: string;
      business_registration_number: string;
      phone: string;
      email: string;
      contact_person_name: string;
      fax_number: string;
      is_default: boolean;
    },
    itemId: string
  ) => {
    // 주문자 정보 업데이트 로직
    console.log('주문자 정보 업데이트:', profileData, 'for item:', itemId);

    // 선택한 프로필 정보로 상태 업데이트
    setSelectedProfiles(
      (prevProfiles) =>
        new Map(
          prevProfiles.set(itemId, {
            name: profileData.contact_person_name,
            phone: profileData.phone,
            company_name: profileData.company_name || '-',
          })
        )
    );

    setIsUpdateSuccessModalOpen(true);
  };

  const handleConsultation = (productName: string, productId: string) => {
    setSelectedProductName(productName);
    setSelectedProductId(productId);
    setIsConsultationModalOpen(true);
  };

  const handleConsultationSuccess = () => {
    setIsConsultationModalOpen(false);
    // 문의 성공 후 상태 다시 확인
    fetchInquiryStatuses();
  };

  // 기간 변경 핸들러 추가
  const handlePeriodChange = (
    itemId: string,
    year: number,
    month: number,
    halfPeriod: 'first_half' | 'second_half'
  ) => {
    console.log('🔍 기간 변경 요청:', {
      itemId,
      year,
      month,
      halfPeriod,
      displayPeriod: `${year}년 ${month}월 ${
        halfPeriod === 'first_half' ? '상반기' : '하반기'
      }`,
    });

    const updatedCart = cart.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          selectedYear: year,
          selectedMonth: month,
          halfPeriod: halfPeriod,
        };
      }
      return item;
    });

    // 카트 상태 업데이트
    updatedCart.forEach((item) => {
      dispatch({ type: 'ADD_ITEM', item });
    });
  };

  const handleDelete = (item: CartItem) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      dispatch({ type: 'REMOVE_ITEM', id: itemToDelete.id });
      setItemToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  // 결제 처리 함수
  const handlePayment = async () => {
    if (selectedItems.size === 0) {
      setErrorMessage('선택된 상품이 없습니다.');
      setIsValidationErrorModalOpen(true);
      return;
    }

    if (!user) {
      setErrorMessage('로그인이 필요합니다.');
      setIsValidationErrorModalOpen(true);
      return;
    }

    try {
      // 선택된 아이템들 가져오기 (상담신청 제외)
      const selectedCartItems = cart.filter(
        (item) => selectedItems.has(String(item.id)) && item.price !== 0
      );

      if (selectedCartItems.length === 0) {
        setErrorMessage('결제 가능한 상품이 없습니다.');
        setIsValidationErrorModalOpen(true);
        return;
      }

      // 주문 생성 API 호출
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: selectedCartItems.map((item) => {
            // 복합 ID에서 원본 UUID 추출
            let panelInfoId;

            // UUID 패턴: 8-4-4-4-12 형식 (예: 298a1257-f68f-4f64-b918-bdd8db37fb79)
            const uuidPattern =
              /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

            if (item.panel_info_id) {
              if (uuidPattern.test(item.panel_info_id)) {
                // 이미 UUID인 경우
                panelInfoId = item.panel_info_id;
              } else if (item.panel_info_id.includes('-')) {
                // 복합 ID인 경우: district-panel-uuid
                const parts = item.panel_info_id.split('-');
                if (parts.length >= 5) {
                  // UUID 부분 추출 (3번째 요소부터 끝까지)
                  const uuidPart = parts.slice(2).join('-');
                  if (uuidPattern.test(uuidPart)) {
                    panelInfoId = uuidPart;
                  } else {
                    console.error('❌ 잘못된 UUID 형식:', uuidPart);
                    throw new Error('잘못된 패널 정보 ID 형식입니다.');
                  }
                } else {
                  console.error('❌ 복합 ID 형식 오류:', item.panel_info_id);
                  throw new Error('잘못된 패널 정보 ID 형식입니다.');
                }
              } else {
                console.error('❌ 알 수 없는 ID 형식:', item.panel_info_id);
                throw new Error('잘못된 패널 정보 ID 형식입니다.');
              }
            } else if (item.id) {
              if (uuidPattern.test(item.id)) {
                // 이미 UUID인 경우
                panelInfoId = item.id;
              } else if (item.id.includes('-')) {
                // 복합 ID인 경우
                const parts = item.id.split('-');
                if (parts.length >= 5) {
                  const uuidPart = parts.slice(2).join('-');
                  if (uuidPattern.test(uuidPart)) {
                    panelInfoId = uuidPart;
                  } else {
                    console.error('❌ 잘못된 UUID 형식:', uuidPart);
                    throw new Error('잘못된 패널 정보 ID 형식입니다.');
                  }
                } else {
                  console.error('❌ 복합 ID 형식 오류:', item.id);
                  throw new Error('잘못된 패널 정보 ID 형식입니다.');
                }
              } else {
                console.error('❌ 알 수 없는 ID 형식:', item.id);
                throw new Error('잘못된 패널 정보 ID 형식입니다.');
              }
            } else {
              throw new Error('패널 정보 ID가 없습니다.');
            }

            console.log('🔍 원본 ID:', item.id, '추출된 UUID:', panelInfoId);

            return {
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: 1,
              panel_info_id: panelInfoId,
              panel_slot_snapshot: item.panel_slot_snapshot,
              panel_slot_usage_id: item.panel_slot_usage_id,
              halfPeriod: item.halfPeriod,
              selectedYear: item.selectedYear,
              selectedMonth: item.selectedMonth,
              startDate: new Date().toISOString().split('T')[0],
              endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0],
            };
          }),
          paymentMethod: 'card',
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '주문 생성에 실패했습니다.');
      }

      // 성공 시 선택된 아이템들을 장바구니에서 제거
      selectedCartItems.forEach((item) => {
        dispatch({ type: 'REMOVE_ITEM', id: item.id });
      });

      // 선택 상태 초기화
      setSelectedItems(new Set());

      // 성공 모달 표시
      setIsPaymentSuccessModalOpen(true);
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage('결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsPaymentErrorModalOpen(true);
    }
  };

  return (
    <main className="pt-[3rem] bg-gray-100 min-h-screen lg:px-[1rem] pb-[12rem]">
      <div className="max-w-5xl mx-auto py-10">
        {/* 탭 버튼들 */}
        <div className="flex gap-5 py-10">
          <Button
            size="sm"
            variant={activeTab === 'payment' ? 'outlinedBlack' : 'outlinedGray'}
            className="rounded-full"
            onClick={() => setActiveTab('payment')}
          >
            결제신청
          </Button>

          <Button
            size="sm"
            variant={
              activeTab === 'consulting' ? 'outlinedBlack' : 'outlinedGray'
            }
            className="rounded-full"
            onClick={() => setActiveTab('consulting')}
          >
            상담신청
          </Button>
        </div>

        <motion.div initial="initial" animate="animate" variants={fadeInUp}>
          {userWithPhone && activeTab === 'payment' && (
            <>
              {groupedItems.regular.length > 0 && (
                <CartGroupCard
                  title="현수막게시대"
                  phoneList={['1533-0570', '1899-0596', '02-719-0083']}
                >
                  {groupedItems.regular.map((item) => (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      user={userWithPhone}
                      isSelected={selectedItems.has(item.id)}
                      onSelect={(selected) =>
                        handleItemSelect(item.id, selected)
                      }
                      onOrderModify={() => handleOrderModify(item.id)}
                      onDelete={() => handleDelete(item)}
                      onPeriodChange={handlePeriodChange}
                    />
                  ))}
                </CartGroupCard>
              )}

              {groupedItems.regular.length === 0 && (
                <CartGroupCard
                  title="현수막게시대"
                  phoneList={['1533-0570', '1899-0596', '02-719-0083']}
                >
                  <div className="flex items-center justify-center py-12 text-gray-500">
                    결제신청할 상품이 없습니다.
                  </div>
                </CartGroupCard>
              )}
            </>
          )}

          {userWithPhone && activeTab === 'consulting' && (
            <>
              {bannerConsultingItems.length > 0 && (
                <CartGroupCard
                  title="상단광고"
                  phoneList={['1533-0570', '1899-0596', '02-719-0083']}
                >
                  {bannerConsultingItems.map((item) => (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      user={userWithPhone}
                      isSelected={selectedItems.has(item.id)}
                      onSelect={(selected) =>
                        handleItemSelect(item.id, selected)
                      }
                      isConsulting={true}
                      onOrderModify={() => handleOrderModify(item.id)}
                      onConsultation={() =>
                        handleConsultation(item.name, item.id)
                      }
                      onDelete={() => handleDelete(item)}
                      inquiryStatus={inquiryStatuses[item.id]}
                    />
                  ))}
                </CartGroupCard>
              )}

              {ledConsultingItemsOnly.length > 0 && (
                <CartGroupCard
                  title="LED전자게시대"
                  phoneList={['1533-0570', '1899-0596', '02-719-0083']}
                >
                  {ledConsultingItemsOnly.map((item) => (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      user={userWithPhone}
                      isSelected={selectedItems.has(item.id)}
                      onSelect={(selected) =>
                        handleItemSelect(item.id, selected)
                      }
                      isConsulting={true}
                      onOrderModify={() => handleOrderModify(item.id)}
                      onConsultation={() =>
                        handleConsultation(item.name, item.id)
                      }
                      onDelete={() => handleDelete(item)}
                      inquiryStatus={inquiryStatuses[item.id]}
                    />
                  ))}
                </CartGroupCard>
              )}

              {bannerConsultingItems.length === 0 &&
                ledConsultingItemsOnly.length === 0 && (
                  <CartGroupCard title="상담신청">
                    <div className="flex items-center justify-center py-12 text-gray-500">
                      상담신청할 상품이 없습니다.
                    </div>
                  </CartGroupCard>
                )}
            </>
          )}
        </motion.div>
      </div>

      <div className="fixed bottom-0 left-0 w-full h-[11rem] bg-white border-t border-gray-300 py-0 px-8 flex items-center justify-around gap-4">
        <div className="flex space-x-6 text-lg font-semibold">
          <div>선택수량 {cartSummary.quantity}개</div>
          <div>= 총 주문금액 {cartSummary.totalAmount.toLocaleString()}원</div>
        </div>
        <Button
          className="px-12 py-4 text-lg font-bold rounded bg-black text-white"
          onClick={handlePayment}
        >
          총 {cartSummary.quantity}건 결제하기
        </Button>
      </div>

      {/* 모달들 */}
      <UserProfileModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        mode="edit"
        onConfirm={(profileData) =>
          handleProfileConfirm(profileData, currentModifyingItemId || '')
        }
      />

      <ConsultationModal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        productName={selectedProductName}
        productId={selectedProductId}
        onSuccess={handleConsultationSuccess}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.name || ''}
      />

      <SuccessModal
        isOpen={isUpdateSuccessModalOpen}
        onClose={() => setIsUpdateSuccessModalOpen(false)}
        message="주문자 정보가 성공적으로 업데이트되었습니다."
      />

      {/* 결제 성공 모달 */}
      <SuccessModal
        isOpen={isPaymentSuccessModalOpen}
        onClose={() => {
          setIsPaymentSuccessModalOpen(false);
          // 마이페이지 주문내역으로 이동
          window.location.href = '/mypage/orders';
        }}
        message="주문이 성공적으로 완료되었습니다!"
      />

      {/* 결제 오류 모달 */}
      <SuccessModal
        isOpen={isPaymentErrorModalOpen}
        onClose={() => setIsPaymentErrorModalOpen(false)}
        message={errorMessage}
      />

      {/* 유효성 검사 오류 모달 */}
      <SuccessModal
        isOpen={isValidationErrorModalOpen}
        onClose={() => setIsValidationErrorModalOpen(false)}
        message={errorMessage}
      />
    </main>
  );
}
