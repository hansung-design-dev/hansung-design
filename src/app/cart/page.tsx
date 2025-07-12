'use client';
import { motion } from 'framer-motion';
import { useCart } from '@/src/contexts/cartContext';
import { useAuth } from '@/src/contexts/authContext';
import { useProfile } from '@/src/contexts/profileContext';
import Image from 'next/image';
import { Button } from '@/src/components/button/button';
import { CartItem } from '@/src/contexts/cartContext';

// interface UserProfile {
//   id: string;
//   profile_title: string;
//   company_name?: string;
//   business_registration_number?: string;
//   business_registration_file?: string;
//   phone: string;
//   email: string;
//   contact_person_name: string;
//   fax_number?: string;
//   is_default: boolean;
//   is_public_institution?: boolean;
//   is_company?: boolean;
//   created_at: string;
// }
import { useState, useMemo, useEffect, useCallback } from 'react';
import UserProfileModal from '@/src/components/modal/UserProfileModal';
import ConsultationModal from '@/src/components/modal/ConsultationModal';
import PeriodSelector from '@/src/components/PeriodSelector';
// import CartItemAccordion from '@/src/components/cartItemAccordion';
import { useRouter } from 'next/navigation';

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
  onDelete,
}: {
  title: string;
  children: React.ReactNode;
  phoneList?: string[];
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  onDelete?: () => void;
}) {
  return (
    <div className="mb-8 bg-white rounded-lg overflow-hidden py-4">
      <div className=" relative flex items-center pt-4 pb-2 border-b border-black px-[3rem]">
        <input
          type="checkbox"
          className="w-6 h-6 mr-4 cursor-pointer"
          checked={isSelected}
          onChange={(e) => onSelect?.(e.target.checked)}
        />
        <span className="text-xl font-semibold">{title}</span>
        {phoneList && (
          <span className="ml-4 text-sm text-gray-500">
            상담전화: {phoneList.join(', ')}
          </span>
        )}
        <button
          className="absolute top-4 right-10 text-1.5 font-100 text-gray-2 hover:cursor-pointer"
          onClick={onDelete}
        >
          x
        </button>
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
  getPanelTypeDisplay,
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
  getPanelTypeDisplay: (panelType: string) => string;
}) {
  // 패널 번호 추출 함수
  // const getPanelNumber = () => {
  //   // panel_slot_snapshot에서 slot_number가 있으면 사용
  //   if (item.panel_slot_snapshot?.slot_number) {
  //     return item.panel_slot_snapshot.slot_number;
  //   }
  //   // panel_info_id에서 패널 번호 추출 시도
  //   if (item.panel_info_id) {
  //     const match = item.panel_info_id.match(/(\d+)$/);
  //     if (match) {
  //       return match[1];
  //     }
  //   }
  //   return null;
  // };
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
            <div className="text-1 truncate">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-gray-600 font-medium text-sm">
                  no.{item.panel_code}
                </span>
                {item.name}
              </div>
            </div>
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
          <div className="text-1 truncate">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-gray-600 font-medium text-sm">
                no.{item.panel_code}
              </span>
              {item.name}
            </div>
            <span className="text-gray-500 text-0.875">
              (
              {getPanelTypeDisplay(
                item.panel_type ||
                  item.panel_slot_snapshot?.banner_type ||
                  'panel'
              )}
              {item.district === '서대문구' &&
                item.is_for_admin &&
                '-행정용패널'}
              )
            </span>
          </div>
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
  const { profiles } = useProfile();
  const router = useRouter();
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
  const [isGroupDeleteModalOpen, setIsGroupDeleteModalOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<{
    userType: 'company' | 'public_institution' | 'general';
    district: string;
    title: string;
  } | null>(null);
  const [isUpdateSuccessModalOpen, setIsUpdateSuccessModalOpen] =
    useState(false);
  const [inquiryStatuses, setInquiryStatuses] = useState<InquiryStatus>({});
  // (defaultProfile, district 변수 선언 제거)

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

  // ProfileContext에서 기본 프로필 찾기 (최초 1회만)
  useEffect(() => {
    if (profiles.length > 0) {
      // defaultProf 변수 및 관련 코드 제거
    }
  }, [profiles]);

  // useEffect에서 cart를 바꾸는 로직 완전히 제거!
  // cart는 오직 아이템 추가/삭제/프로필 변경 등 명확한 액션에서만 dispatch로 바뀜

  // 결제신청/상담신청 분류 로직 (useMemo)
  const groupedItems = useMemo(() => {
    const consultingItems: CartItem[] = [];
    const paymentItems: CartItem[] = [];

    cart.forEach((item) => {
      const panelType =
        item.panel_type || item.panel_slot_snapshot?.banner_type || 'panel';

      // 상담신청: LED 전자게시대 전체, 상단광고(용산구/송파구)
      if (
        item.type === 'led-display' ||
        (item.type === 'banner-display' && panelType === 'top_fixed')
      ) {
        consultingItems.push(item);
        return;
      }

      // 결제신청: 현수막게시대 전체 구
      paymentItems.push(item);
    });

    // 결제신청 아이템들을 구별로 분류
    const districtGroups: { [district: string]: CartItem[] } = {};

    paymentItems.forEach((item) => {
      const district = item.district;
      if (!districtGroups[district]) {
        districtGroups[district] = [];
      }
      districtGroups[district].push(item);
    });

    return {
      consulting: consultingItems,
      districts: districtGroups,
    };
  }, [cart]);

  // 상담신청 아이템들을 타입별로 분리
  const bannerConsultingItems = groupedItems.consulting.filter(
    (item) => item.type === 'banner-display'
  );
  const ledConsultingItemsOnly = groupedItems.consulting.filter(
    (item) => item.type === 'led-display'
  );

  // 상담신청 아이템들의 문의 상태 확인
  const fetchInquiryStatuses = useCallback(async () => {
    try {
      const statuses: InquiryStatus = {};

      // 현재 cart에서 상담신청 아이템 필터링
      const consultingItems = cart.filter((item) => {
        const panelType =
          item.panel_type || item.panel_slot_snapshot?.banner_type || 'panel';
        const district = item.district;

        // LED 전자게시대는 모두 상담신청
        if (item.type === 'led-display') {
          return true;
        }

        // 현수막게시대 분류
        if (item.type === 'banner-display') {
          // 상단광고는 모두 상담신청 (용산구, 송파구)
          if (panelType === 'top_fixed') {
            return true;
          }

          // 결제신청 조건
          const isPaymentEligible =
            // 용산구, 송파구의 현수막게시대
            ((district === '용산구' || district === '송파구') &&
              panelType === 'panel') ||
            // 마포구 연립형과 저단형
            (district === '마포구' &&
              (panelType === 'multi_panel' || panelType === 'lower_panel')) ||
            // 서대문구, 관악구
            district === '서대문구' ||
            district === '관악구';

          return !(isPaymentEligible && item.price > 0);
        }

        return false;
      });

      for (const item of consultingItems) {
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
  }, [cart]);

  // 문의 상태 확인을 수동으로만 호출하도록 변경
  // useEffect(() => {
  //   if (user && cart.length > 0) {
  //     // 상담신청 아이템이 있는지 확인
  //     const hasConsultingItems = cart.some((item) => {
  //       const panelType =
  //         item.panel_slot_snapshot?.banner_type || item.panel_type || 'panel';
  //       const district = item.district;

  //       if (item.type === 'led-display') return true;
  //       if (item.type === 'banner-display' && panelType === 'top_fixed')
  //         return true;

  //       const isPaymentEligible =
  //         ((district === '용산구' || district === '송파구') &&
  //           panelType === 'panel') ||
  //         (district === '마포구' &&
  //           (panelType === 'multi-panel' || panelType === 'lower-panel')) ||
  //         district === '서대문구' ||
  //         district === '관악구';

  //       return !(isPaymentEligible && item.price > 0);
  //     });

  //     if (hasConsultingItems) {
  //       fetchInquiryStatuses();
  //     }
  //   }
  // }, [user, fetchInquiryStatuses]);

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

    // 기업용 아이템이 선택되었는지 확인
    const hasCompanyItems = selectedCartItems.some((item) => item.is_company);

    // 공공기관용 아이템이 선택되었는지 확인
    const hasPublicInstitutionItems = selectedCartItems.some(
      (item) => item.is_public_institution
    );

    // 개인용 아이템이 선택되었는지 확인
    const hasGeneralItems = selectedCartItems.some(
      (item) => !item.is_company && !item.is_public_institution
    );

    // 공공기관용과 개인용 아이템이 함께 선택되었는지 확인
    const hasMixedUserTypes = hasPublicInstitutionItems && hasGeneralItems;

    // 상세 가격 정보가 있는 아이템이 선택되었는지 확인
    const hasDetailedPriceItems = selectedCartItems.some(
      (item) => item.panel_slot_snapshot
    );

    // 디버깅: 선택된 아이템들의 panel_slot_snapshot 확인
    console.log(
      '🔍 Cart - Selected items with panel_slot_snapshot:',
      selectedCartItems.map((item) => ({
        id: item.id,
        name: item.name,
        hasSnapshot: !!item.panel_slot_snapshot,
        snapshot: item.panel_slot_snapshot,
        price: item.price,
        district: item.district,
        panel_type: item.panel_type,
      }))
    );

    // 상세 가격 정보 계산 (모든 아이템)
    let priceDetails = null;
    if (hasDetailedPriceItems) {
      const itemsWithDetails = selectedCartItems.filter(
        (item) => item.panel_slot_snapshot
      );
      const totalAdvertisingFee = itemsWithDetails.reduce((sum, item) => {
        return sum + (item.panel_slot_snapshot?.advertising_fee || 0);
      }, 0);
      const totalTaxPrice = itemsWithDetails.reduce((sum, item) => {
        return sum + (item.panel_slot_snapshot?.tax_price || 0);
      }, 0);
      const totalRoadUsageFee = itemsWithDetails.reduce((sum, item) => {
        return sum + (item.panel_slot_snapshot?.road_usage_fee || 0);
      }, 0);

      priceDetails = {
        advertising_fee: totalAdvertisingFee,
        tax_price: totalTaxPrice,
        road_usage_fee: totalRoadUsageFee,
      };

      console.log('🔍 Cart - Calculated price details:', priceDetails);
    } else {
      console.log('🔍 Cart - No items with panel_slot_snapshot found');
    }

    return {
      quantity: totalQuantity,
      totalAmount: totalPrice,
      hasCompanyItems,
      hasPublicInstitutionItems,
      hasGeneralItems,
      hasMixedUserTypes,
      hasDetailedPriceItems,
      priceDetails,
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

  const handleGroupSelect = (
    userType: 'company' | 'public_institution' | 'general',
    district: string,
    selected: boolean
  ) => {
    const groupItems = cart.filter((item) => {
      const matchesUserType =
        (userType === 'company' && item.is_company) ||
        (userType === 'public_institution' && item.is_public_institution) ||
        (userType === 'general' &&
          !item.is_company &&
          !item.is_public_institution);

      // 상담신청 아이템의 경우 district 체크를 건너뜀
      if (district === '') {
        return matchesUserType;
      }

      return matchesUserType && item.district === district;
    });
    const groupItemIds = groupItems.map((item) => item.id);

    if (selected) {
      // 해당 그룹의 모든 아이템을 선택
      const newSelected = new Set(selectedItems);
      groupItemIds.forEach((id) => newSelected.add(id));
      setSelectedItems(newSelected);
    } else {
      // 해당 그룹의 모든 아이템을 선택 해제
      const newSelected = new Set(selectedItems);
      groupItemIds.forEach((id) => newSelected.delete(id));
      setSelectedItems(newSelected);
    }
  };

  const isGroupSelected = (
    userType: 'company' | 'public_institution' | 'general',
    district: string
  ) => {
    const groupItems = cart.filter((item) => {
      const matchesUserType =
        (userType === 'company' && item.is_company) ||
        (userType === 'public_institution' && item.is_public_institution) ||
        (userType === 'general' &&
          !item.is_company &&
          !item.is_public_institution);

      // 상담신청 아이템의 경우 district 체크를 건너뜀
      if (district === '') {
        return matchesUserType;
      }

      return matchesUserType && item.district === district;
    });
    return (
      groupItems.length > 0 &&
      groupItems.every((item) => selectedItems.has(item.id))
    );
  };

  const handleOrderModify = (itemId: string) => {
    setCurrentModifyingItemId(itemId);
    setIsOrderModalOpen(true);
  };

  // 프로필 변경 시에만 cart의 해당 아이템 속성만 dispatch로 바꿈
  const handleProfileConfirm = async (
    profileData: {
      profile_title: string;
      company_name: string;
      business_registration_number: string;
      phone: string;
      email: string;
      contact_person_name: string;
      fax_number: string;
      is_default: boolean;
      is_public_institution: boolean;
      is_company: boolean;
    },
    itemId: string
  ) => {
    const item = cart.find((item) => item.id === itemId);
    if (!item) return;

    let updatedPrice = item.price;
    let updatedPanelSlotSnapshot = item.panel_slot_snapshot;

    // 공공기관용으로 변경된 경우 가격 정보 업데이트
    if (profileData.is_public_institution && item.panel_info_id) {
      try {
        // banner_slot_price_policy에서 public_institution 가격 가져오기
        const response = await fetch(
          `/api/banner-display?action=getByDistrict&district=${encodeURIComponent(
            item.district
          )}`
        );
        const result = await response.json();

        if (result.success && result.data) {
          const panelInfo = result.data.find(
            (panel: { id: string }) => panel.id === item.panel_info_id
          );
          if (
            panelInfo &&
            panelInfo.banner_slot_info &&
            panelInfo.banner_slot_info.length > 0
          ) {
            const slotInfo = panelInfo.banner_slot_info[0];
            if (slotInfo.banner_slot_price_policy) {
              const publicInstitutionPolicy =
                slotInfo.banner_slot_price_policy.find(
                  (p: { price_usage_type: string }) =>
                    p.price_usage_type === 'public_institution'
                );
              if (publicInstitutionPolicy) {
                updatedPrice = publicInstitutionPolicy.total_price;
                updatedPanelSlotSnapshot = {
                  id: null,
                  notes: null,
                  max_width: null,
                  slot_name: null,
                  tax_price: publicInstitutionPolicy.tax_price,
                  created_at: null,
                  max_height: null,
                  price_unit: null,
                  updated_at: null,
                  banner_type: null,
                  slot_number: null,
                  total_price: publicInstitutionPolicy.total_price,
                  panel_info_id: null,
                  road_usage_fee: publicInstitutionPolicy.road_usage_fee,
                  advertising_fee: publicInstitutionPolicy.advertising_fee,
                  panel_slot_status: null,
                };
              }
            }
          }
        }
      } catch (error) {
        console.error('공공기관용 가격 정보 가져오기 실패:', error);
      }
    }

    const updatedCart = cart.map((item) =>
      item.id === itemId
        ? {
            ...item,
            price: updatedPrice,
            panel_slot_snapshot: updatedPanelSlotSnapshot,
            is_public_institution: profileData.is_public_institution,
            is_company: profileData.is_company,
            contact_person_name: profileData.contact_person_name,
            phone: profileData.phone,
            company_name: profileData.company_name,
            email: profileData.email,
          }
        : item
    );
    dispatch({ type: 'UPDATE_CART', items: updatedCart });
    // 선택된 아이템 해제 (분류가 변경되었으므로)
    const newSelectedItems = new Set(selectedItems);
    newSelectedItems.delete(itemId);
    setSelectedItems(newSelectedItems);
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
    dispatch({ type: 'UPDATE_CART', items: updatedCart });
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

  // 그룹별 삭제 확인 모달 표시
  const handleGroupDeleteClick = (
    userType: 'company' | 'public_institution' | 'general',
    district: string,
    title: string
  ) => {
    setGroupToDelete({ userType, district, title });
    setIsGroupDeleteModalOpen(true);
  };

  // 그룹별 삭제 확인 모달에서 확인 클릭 시 실행
  const handleGroupDeleteConfirm = () => {
    if (!groupToDelete) return;

    const { userType, district } = groupToDelete;
    const groupItems = cart.filter((item) => {
      const matchesUserType =
        (userType === 'company' && item.is_company) ||
        (userType === 'public_institution' && item.is_public_institution) ||
        (userType === 'general' &&
          !item.is_company &&
          !item.is_public_institution);

      // 상담신청 아이템의 경우 district 체크를 건너뜀
      if (district === '') {
        return matchesUserType;
      }

      return matchesUserType && item.district === district;
    });

    // 해당 그룹의 모든 아이템을 장바구니에서 제거
    groupItems.forEach((item) => {
      dispatch({ type: 'REMOVE_ITEM', id: item.id });
    });

    // 선택된 아이템에서도 제거
    const newSelected = new Set(selectedItems);
    groupItems.forEach((item) => newSelected.delete(item.id));
    setSelectedItems(newSelected);

    // 모달 닫기
    setIsGroupDeleteModalOpen(false);
    setGroupToDelete(null);
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

      // 선택된 아이템들을 URL 파라미터로 인코딩하여 결제 페이지로 이동
      const selectedItemsParam = encodeURIComponent(
        JSON.stringify(selectedCartItems.map((item) => item.id))
      );

      console.log('🔍 Cart - selectedCartItems:', selectedCartItems);
      console.log('🔍 Cart - selectedItemsParam:', selectedItemsParam);

      // 선택 상태 초기화 (아이템은 payment 페이지에서 성공 후 제거)
      setSelectedItems(new Set());

      router.push(`/payment?items=${selectedItemsParam}`);
    } catch (error) {
      console.error('Payment navigation error:', error);
      setErrorMessage(
        '결제 페이지로 이동 중 오류가 발생했습니다. 다시 시도해주세요.'
      );
      setIsPaymentErrorModalOpen(true);
    }
  };

  // phone이 없을 때 기본값 설정
  const userWithPhone = user
    ? {
        ...user,
        phone: user.phone || '전화번호 없음',
        company_name: '-',
      }
    : null;

  // 패널 타입을 한글로 변환하는 함수
  const getPanelTypeDisplay = (panelType: string) => {
    const typeMap: Record<string, string> = {
      panel: '현수막게시대',
      top_fixed: '상단광고',
      led: 'LED전자게시대',
      multi_panel: '연립형',
      lower_panel: '저단형',
      bulletin_board: '시민/문화게시대',
      semi_auto: '반자동',
      with_lighting: '조명용',
      no_lighting: '비조명용',
      manual: '현수막게시대',
      cultural_board: '시민/문화게시대',
    };
    return typeMap[panelType] || panelType;
  };

  return (
    <main
      className={`pt-[3rem] bg-gray-100 min-h-screen lg:px-[1rem] ${
        cartSummary.hasPublicInstitutionItems
          ? 'pb-[17rem]'
          : cartSummary.hasDetailedPriceItems
          ? 'pb-[15rem]'
          : 'pb-[12rem]'
      }`}
    >
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
              {/* 구별로 분류된 현수막게시대 아이템들 */}
              {Object.keys(groupedItems.districts).length > 0 &&
                Object.entries(groupedItems.districts).map(
                  ([district, items]) => {
                    // 각 구 내에서 개인용/공공기관용/기업용으로 분류
                    const regularItems = items.filter(
                      (item) => !item.is_company && !item.is_public_institution
                    );
                    const publicInstitutionItems = items.filter(
                      (item) => item.is_public_institution
                    );
                    const companyItems = items.filter(
                      (item) => item.is_company
                    );

                    return (
                      <div key={`district-${district}`}>
                        {/* 기본 구별 카드 (개인용 아이템들) */}
                        {regularItems.length > 0 && (
                          <CartGroupCard
                            title={`현수막게시대 (${district})`}
                            phoneList={[
                              '1533-0570',
                              '1899-0596',
                              '02-719-0083',
                            ]}
                            isSelected={isGroupSelected('general', district)}
                            onSelect={(selected) =>
                              handleGroupSelect('general', district, selected)
                            }
                            onDelete={() =>
                              handleGroupDeleteClick(
                                'general',
                                district,
                                `현수막게시대 (${district})`
                              )
                            }
                          >
                            {regularItems.map((item) => {
                              const userInfo = {
                                name:
                                  item.contact_person_name ||
                                  userWithPhone?.name,
                                phone: item.phone || userWithPhone?.phone,
                                company_name:
                                  item.company_name ||
                                  userWithPhone?.company_name,
                              };
                              return (
                                <CartItemRow
                                  key={item.id}
                                  item={item}
                                  user={userInfo}
                                  isSelected={selectedItems.has(item.id)}
                                  onSelect={(selected) =>
                                    handleItemSelect(item.id, selected)
                                  }
                                  onOrderModify={() =>
                                    handleOrderModify(item.id)
                                  }
                                  onDelete={() => handleDelete(item)}
                                  onPeriodChange={handlePeriodChange}
                                  getPanelTypeDisplay={getPanelTypeDisplay}
                                />
                              );
                            })}
                          </CartGroupCard>
                        )}

                        {/* 공공기관용 카드 (해당 구에서 공공기관용으로 변경된 아이템들) */}
                        {publicInstitutionItems.length > 0 && (
                          <CartGroupCard
                            title={`현수막게시대 (공공기관용) - ${district}`}
                            phoneList={[
                              '1533-0570',
                              '1899-0596',
                              '02-719-0083',
                            ]}
                            isSelected={isGroupSelected(
                              'public_institution',
                              district
                            )}
                            onSelect={(selected) =>
                              handleGroupSelect(
                                'public_institution',
                                district,
                                selected
                              )
                            }
                            onDelete={() =>
                              handleGroupDeleteClick(
                                'public_institution',
                                district,
                                `현수막게시대 (공공기관용) - ${district}`
                              )
                            }
                          >
                            {publicInstitutionItems.map((item) => {
                              const userInfo = {
                                name:
                                  item.contact_person_name ||
                                  userWithPhone?.name,
                                phone: item.phone || userWithPhone?.phone,
                                company_name:
                                  item.company_name ||
                                  userWithPhone?.company_name,
                              };
                              return (
                                <CartItemRow
                                  key={item.id}
                                  item={item}
                                  user={userInfo}
                                  isSelected={selectedItems.has(item.id)}
                                  onSelect={(selected) =>
                                    handleItemSelect(item.id, selected)
                                  }
                                  onOrderModify={() =>
                                    handleOrderModify(item.id)
                                  }
                                  onDelete={() => handleDelete(item)}
                                  onPeriodChange={handlePeriodChange}
                                  getPanelTypeDisplay={getPanelTypeDisplay}
                                />
                              );
                            })}
                          </CartGroupCard>
                        )}

                        {/* 기업용 카드 (해당 구에서 기업용으로 변경된 아이템들) */}
                        {companyItems.length > 0 && (
                          <CartGroupCard
                            title={`현수막게시대 (기업용) - ${district}`}
                            phoneList={[
                              '1533-0570',
                              '1899-0596',
                              '02-719-0083',
                            ]}
                            isSelected={isGroupSelected('company', district)}
                            onSelect={(selected) =>
                              handleGroupSelect('company', district, selected)
                            }
                            onDelete={() =>
                              handleGroupDeleteClick(
                                'company',
                                district,
                                `현수막게시대 (기업용) - ${district}`
                              )
                            }
                          >
                            {companyItems.map((item) => {
                              const userInfo = {
                                name:
                                  item.contact_person_name ||
                                  userWithPhone?.name,
                                phone: item.phone || userWithPhone?.phone,
                                company_name:
                                  item.company_name ||
                                  userWithPhone?.company_name,
                              };
                              return (
                                <CartItemRow
                                  key={item.id}
                                  item={item}
                                  user={userInfo}
                                  isSelected={selectedItems.has(item.id)}
                                  onSelect={(selected) =>
                                    handleItemSelect(item.id, selected)
                                  }
                                  onOrderModify={() =>
                                    handleOrderModify(item.id)
                                  }
                                  onDelete={() => handleDelete(item)}
                                  onPeriodChange={handlePeriodChange}
                                  getPanelTypeDisplay={getPanelTypeDisplay}
                                />
                              );
                            })}
                          </CartGroupCard>
                        )}
                      </div>
                    );
                  }
                )}

              {/* 경고 메시지 */}
            </>
          )}

          {userWithPhone && activeTab === 'consulting' && (
            <>
              {bannerConsultingItems.length > 0 && (
                <CartGroupCard
                  title="상단광고"
                  phoneList={['1533-0570', '1899-0596', '02-719-0083']}
                  isSelected={isGroupSelected('general', '')}
                  onSelect={(selected) =>
                    handleGroupSelect('general', '', selected)
                  }
                  onDelete={() =>
                    handleGroupDeleteClick('general', '', '상단광고')
                  }
                >
                  {bannerConsultingItems.map((item) => {
                    const userInfo = {
                      name: item.contact_person_name || userWithPhone?.name,
                      phone: item.phone || userWithPhone?.phone,
                      company_name:
                        item.company_name || userWithPhone?.company_name,
                    };
                    return (
                      <CartItemRow
                        key={item.id}
                        item={item}
                        user={userInfo}
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
                        getPanelTypeDisplay={getPanelTypeDisplay}
                      />
                    );
                  })}
                </CartGroupCard>
              )}

              {ledConsultingItemsOnly.length > 0 && (
                <CartGroupCard
                  title="LED전자게시대"
                  phoneList={['1533-0570', '1899-0596', '02-719-0083']}
                  isSelected={isGroupSelected('general', '')}
                  onSelect={(selected) =>
                    handleGroupSelect('general', '', selected)
                  }
                  onDelete={() =>
                    handleGroupDeleteClick('general', '', 'LED전자게시대')
                  }
                >
                  {ledConsultingItemsOnly.map((item) => {
                    const userInfo = {
                      name: item.contact_person_name || userWithPhone?.name,
                      phone: item.phone || userWithPhone?.phone,
                      company_name:
                        item.company_name || userWithPhone?.company_name,
                    };
                    return (
                      <CartItemRow
                        key={item.id}
                        item={item}
                        user={userInfo}
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
                        getPanelTypeDisplay={getPanelTypeDisplay}
                      />
                    );
                  })}
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

      <div
        className={`fixed bottom-0 left-0 w-full bg-white border-t border-gray-300 py-0 px-8 flex items-center justify-around gap-4 ${
          cartSummary.hasDetailedPriceItems ? 'h-[14rem]' : 'h-[11rem]'
        }`}
      >
        <div className="flex flex-col space-y-2 text-lg font-semibold">
          <div>선택수량 {cartSummary.quantity}개</div>
          {cartSummary.hasDetailedPriceItems && cartSummary.priceDetails && (
            <div className="flex items-center justify-center gap-4 text-1">
              <div>
                광고대행료{' '}
                {cartSummary.priceDetails.advertising_fee.toLocaleString()}원
              </div>
              <div>+</div>
              <div>
                수수료 {cartSummary.priceDetails.tax_price.toLocaleString()}원
              </div>
              <div>+</div>
              <div>
                도로사용료{' '}
                {cartSummary.priceDetails.road_usage_fee.toLocaleString()}원
              </div>
            </div>
          )}
          <div>= 총 주문금액 {cartSummary.totalAmount.toLocaleString()}원</div>
          {cartSummary.hasPublicInstitutionItems && (
            <div className="text-red text-xs">
              행정용결제는 사용자 승인과정 후에 결제가 진행됩니다.
            </div>
          )}
        </div>
        <div className="flex flex-col items-center gap-2">
          <Button
            className={`px-12 py-4 text-lg font-bold rounded ${
              cartSummary.hasMixedUserTypes
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-black text-white'
            }`}
            onClick={handlePayment}
            disabled={cartSummary.hasMixedUserTypes}
          >
            {cartSummary.hasCompanyItems ||
            cartSummary.hasPublicInstitutionItems
              ? '결제 신청하기'
              : `총 ${cartSummary.quantity}건 결제하기`}
          </Button>
          {cartSummary.hasMixedUserTypes && (
            <div className="text-red text-xs">개별결제 해주세요.</div>
          )}
        </div>
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

      {/* 그룹별 삭제 확인 모달 */}
      <DeleteConfirmModal
        isOpen={isGroupDeleteModalOpen}
        onClose={() => {
          setIsGroupDeleteModalOpen(false);
          setGroupToDelete(null);
        }}
        onConfirm={handleGroupDeleteConfirm}
        itemName={
          groupToDelete
            ? `${groupToDelete.title} 아이템을 전체삭제 하시겠습니까?`
            : ''
        }
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
