'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { Button } from '@/src/components/button/button';
import Nav from '@/src/components/layouts/nav';
import { useAuth } from '@/src/contexts/authContext';
import { useCart } from '@/src/contexts/cartContext';
import { useProfile } from '@/src/contexts/profileContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { CartItem } from '@/src/contexts/cartContext';
import { PaymentSuccessModal } from '@/src/components/modal/UserProfileModal';
import CustomFileUpload from '@/src/components/ui/CustomFileUpload';
import UserProfileModal from '@/src/components/modal/UserProfileModal';
import type { UserProfile } from '@/src/components/modal/UserProfileModal';

interface BankInfo {
  id: string;
  bank_name: string;
  account_number: string;
  depositor: string;
  region_gu: {
    id: string;
    name: string;
  };
  display_types: {
    id: string;
    name: string;
  };
}

// 묶음 결제를 위한 그룹화된 아이템 인터페이스
interface GroupedCartItem {
  id: string;
  name: string;
  items: CartItem[];
  totalPrice: number;
  district: string;
  type: 'banner-display' | 'led-display' | 'digital-signage';
  panel_type: string;
  is_public_institution?: boolean;
  is_company?: boolean;
  user_profile_id?: string;
  contact_person_name?: string;
  phone?: string;
  company_name?: string;
  email?: string;
  selectedFile?: File | null;
  fileUploadMethod?: 'upload' | 'email' | null;
  fileName?: string | null;
  fileSize?: number | null;
  fileType?: string | null;
  emailAddress?: string | null;
}

function PaymentPageContent() {
  const { user } = useAuth();
  const { cart, dispatch } = useCart();
  const { profiles } = useProfile();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedItems, setSelectedItems] = useState<CartItem[]>([]);
  const [groupedItems, setGroupedItems] = useState<GroupedCartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank_transfer'>(
    'card'
  );
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendByEmail, setSendByEmail] = useState(false);
  const [draftDeliveryMethod, setDraftDeliveryMethod] = useState<
    'email' | 'upload'
  >('upload');
  const [isApprovedOrder, setIsApprovedOrder] = useState(false);
  const [taxInvoice, setTaxInvoice] = useState(false);
  const [isAgreedCaution, setIsAgreedCaution] = useState(false);
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState({
    orderNumber: '',
    totalAmount: 0,
  });
  const [projectName, setProjectName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    projectName: string;
    fileUpload: string;
    agreement: string;
  }>({
    projectName: '',
    fileUpload: '',
    agreement: '',
  });
  const [userProfiles, setUserProfiles] = useState<
    {
      id: string;
      profile_title: string;
      company_name?: string;
      business_registration_file?: string;
      phone: string;
      email: string;
      contact_person_name: string;
      fax_number?: string;
      is_default: boolean;
      is_public_institution?: boolean;
      is_company?: boolean;
      created_at: string;
    }[]
  >([]);

  // 구별별 프로필 상태 관리
  const [groupProfiles, setGroupProfiles] = useState<{
    [district: string]: UserProfile | undefined;
  }>({});
  const [groupBulkProfile, setGroupBulkProfile] = useState<{
    [district: string]: boolean;
  }>({});
  const [profileModalOpen, setProfileModalOpen] = useState<string | null>(null);
  // 프로필 선택 핸들러
  const handleProfileSelect = (district: string, profile: UserProfile) => {
    setGroupProfiles((prev) => ({ ...prev, [district]: profile }));
    setProfileModalOpen(null);
  };
  // 대표 프로필 선택 핸들러
  const handleBulkProfileToggle = (district: string) => {
    setGroupBulkProfile((prev) => ({ ...prev, [district]: !prev[district] }));
  };

  // 사용자 프로필 데이터 가져오기
  useEffect(() => {
    const fetchUserProfiles = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/user-profiles?userId=${user.id}`);
        const data = await response.json();

        if (data.success) {
          console.log('🔍 가져온 프로필 데이터:', data.data);
          // user_auth_id가 없는 경우 추가
          const profilesWithAuthId = data.data.map(
            (profile: Record<string, unknown>) => ({
              ...profile,
              user_auth_id: (profile.user_auth_id as string) || user.id,
            })
          );
          console.log(
            '🔍 user_auth_id 추가된 프로필 데이터:',
            profilesWithAuthId
          );
          setUserProfiles(profilesWithAuthId);
        }
      } catch (error) {
        console.error('🔍 프로필 데이터 가져오기 실패:', error);
      }
    };

    fetchUserProfiles();
  }, [user?.id]);

  // 묶음 결제를 위한 아이템 그룹화 함수
  const groupItemsByDistrict = (items: CartItem[]): GroupedCartItem[] => {
    const grouped: { [district: string]: CartItem[] } = {};
    items.forEach((item) => {
      if (!grouped[item.district]) grouped[item.district] = [];
      grouped[item.district].push(item);
    });
    return Object.entries(grouped).map(([district, group]) => {
      const firstItem = group[0];
      const totalPrice = group.reduce(
        (sum, item) => sum + (item.price || 0),
        0
      );
      return {
        id: `group_${district}`,
        name: `${district} 현수막게시대`,
        items: group,
        totalPrice,
        district,
        type: 'banner-display',
        panel_type: firstItem.panel_type || 'panel',
        is_public_institution: firstItem.is_public_institution,
        is_company: firstItem.is_company,
        user_profile_id: firstItem.user_profile_id,
        contact_person_name: firstItem.contact_person_name,
        phone: firstItem.phone,
        company_name: firstItem.company_name,
        email: firstItem.email,
      };
    });
  };

  // 유효성 검사 함수
  const validateForm = () => {
    console.log('🔍 validateForm 시작');
    console.log('🔍 projectName:', projectName);
    console.log('🔍 sendByEmail:', sendByEmail);
    console.log('🔍 selectedFile:', selectedFile?.name || '없음');
    console.log('🔍 isAgreedCaution:', isAgreedCaution);

    const errors = {
      projectName: '',
      fileUpload: '',
      agreement: '',
    };

    // 1. 작업이름 검사
    if (!projectName.trim()) {
      errors.projectName = '작업이름을 입력해주세요.';
      console.log('🔍 작업이름 검사 실패');
    }

    // 2. 파일업로드 방식 검사
    if (!sendByEmail && !selectedFile) {
      errors.fileUpload = '파일을 업로드하거나 이메일 전송을 선택해주세요.';
      console.log('🔍 파일업로드 방식 검사 실패');
    }

    // 3. 유의사항 동의 검사
    if (!isAgreedCaution) {
      errors.agreement = '유의사항에 동의해주세요.';
      console.log('🔍 유의사항 동의 검사 실패');
    }

    console.log('🔍 검사 결과 errors:', errors);
    setValidationErrors(errors);
    const isValid = !Object.values(errors).some((error) => error !== '');
    console.log('🔍 최종 유효성 검사 결과:', isValid);
    return isValid;
  };

  // 패널 타입 표시 함수
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

  // URL 파라미터에서 선택된 아이템 ID들 가져오기
  useEffect(() => {
    const itemsParam = searchParams.get('items');
    const approvedParam = searchParams.get('approved');
    console.log('🔍 Payment page - itemsParam:', itemsParam);
    console.log('🔍 Payment page - approvedParam:', approvedParam);
    console.log('🔍 Payment page - cart:', cart);

    if (approvedParam === 'true') {
      setIsApprovedOrder(true);
    }

    if (itemsParam) {
      try {
        const selectedItemIds = JSON.parse(
          decodeURIComponent(itemsParam)
        ) as string[];
        console.log('🔍 Payment page - selectedItemIds:', selectedItemIds);

        // 승인된 주문의 경우 cart에서 아이템을 찾지 않고 주문 ID를 직접 사용
        if (isApprovedOrder) {
          // 승인된 주문의 경우 주문 정보를 가져와서 selectedItems 설정
          fetchApprovedOrderItems(selectedItemIds[0]);
        } else {
          const items = cart.filter((item) =>
            selectedItemIds.includes(item.id)
          );
          console.log('🔍 Payment page - filtered items:', items);
          setSelectedItems(items);

          // 묶음 결제를 위한 그룹화
          const grouped = groupItemsByDistrict(items);
          setGroupedItems(grouped);
        }
      } catch (error) {
        console.error('Error parsing selected items:', error);
        setError('선택된 상품 정보를 불러오는데 실패했습니다.');
      }
    } else {
      console.log('🔍 Payment page - no items param found');
    }
  }, [searchParams, cart, isApprovedOrder]);

  // sendByEmail 상태가 변경될 때 draftDeliveryMethod 업데이트
  useEffect(() => {
    setDraftDeliveryMethod(sendByEmail ? 'email' : 'upload');
  }, [sendByEmail]);

  // paymentMethod 상태 변경 감지
  useEffect(() => {
    console.log('🔍 paymentMethod 상태 변경됨:', paymentMethod);
  }, [paymentMethod]);

  // selectedItems 상태 변경 감지
  useEffect(() => {
    console.log(
      '🔍 selectedItems 상태 변경됨:',
      selectedItems.length,
      selectedItems.map((item) => ({
        id: item.id,
        name: item.name,
        fileName: item.fileName,
        fileUploadMethod: item.fileUploadMethod,
      }))
    );

    // selectedItems가 비어있게 되면 경고
    if (selectedItems.length === 0) {
      console.warn('🔍 WARNING: selectedItems가 비어있음!');
      console.warn('🔍 현재 cart 상태:', cart.length);
      console.warn('🔍 현재 URL params:', searchParams.get('items'));
    }
  }, [selectedItems, cart, searchParams]);

  // selectedFile 상태 변경 감지
  useEffect(() => {
    console.log('🔍 selectedFile 상태 변경됨:', selectedFile?.name || '없음');
  }, [selectedFile]);

  // 실시간 유효성 검사
  useEffect(() => {
    if (selectedItems.length > 0) {
      const errors = {
        projectName: '',
        fileUpload: '',
        agreement: '',
      };

      // 1. 작업이름 검사
      if (!projectName.trim()) {
        errors.projectName = '작업이름을 입력해주세요.';
      }

      // 2. 파일업로드 방식 검사
      if (!sendByEmail && !selectedFile) {
        errors.fileUpload = '파일을 업로드하거나 이메일 전송을 선택해주세요.';
      }

      // 3. 유의사항 동의 검사
      if (!isAgreedCaution) {
        errors.agreement = '유의사항에 동의해주세요.';
      }

      setValidationErrors(errors);
    }
  }, [
    projectName,
    selectedFile,
    sendByEmail,
    isAgreedCaution,
    selectedItems.length,
  ]);

  // 승인된 주문의 아이템 정보 가져오기
  const fetchApprovedOrderItems = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();

      if (data.success) {
        // 주문 정보를 CartItem 형태로 변환
        const orderItems: CartItem[] =
          data.data.order_details?.map(
            (detail: {
              id: string;
              name: string;
              price: number;
              quantity: number;
              district?: string;
              panel_type?: string;
              panel_info_id?: string;
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
                panel_info_id?: string;
                road_usage_fee?: number;
                advertising_fee?: number;
                panel_slot_status?: string;
              };
              panel_slot_usage_id?: string;
              period?: string;
              selected_year?: number;
              selected_month?: number;
            }) => ({
              id: detail.id,
              name: detail.name,
              price: detail.price,
              quantity: detail.quantity,
              district: detail.district || '',
              type: 'banner-display' as const,
              panel_type: detail.panel_type || 'panel',
              panel_info_id: detail.panel_info_id,
              panel_slot_snapshot: detail.panel_slot_snapshot,
              panel_slot_usage_id: detail.panel_slot_usage_id,
              halfPeriod: detail.period,
              selectedYear: detail.selected_year,
              selectedMonth: detail.selected_month,
            })
          ) || [];

        setSelectedItems(orderItems);

        // 묶음 결제를 위한 그룹화
        const grouped = groupItemsByDistrict(orderItems);
        setGroupedItems(grouped);
      }
    } catch (error) {
      console.error('Failed to fetch approved order items:', error);
      setError('승인된 주문 정보를 불러오는데 실패했습니다.');
    }
  };

  // 장바구니에서 선택된 프로필 정보 가져오기
  console.log('🔍 profiles 상태:', profiles?.length || 0, profiles);
  console.log('🔍 userProfiles 상태:', userProfiles?.length || 0, userProfiles);
  console.log(
    '🔍 selectedItems:',
    selectedItems.length,
    selectedItems.map((item) => ({
      id: item.id,
      contact_person_name: item.contact_person_name,
      phone: item.phone,
      company_name: item.company_name,
      email: item.email,
      user_profile_id: item.user_profile_id,
    }))
  );

  // selectedItems에서 실제 프로필 ID 확인 (첫 번째 아이템 기준)
  const selectedProfileId =
    selectedItems.length > 0 ? selectedItems[0].user_profile_id : null;

  console.log('🔍 selectedProfileId:', selectedProfileId);

  // 실제 프로필 ID가 있으면 해당 프로필 사용, 없으면 기본 프로필 사용
  const defaultProfile = selectedProfileId
    ? userProfiles?.find((profile) => profile.id === selectedProfileId) ||
      profiles?.find((profile) => profile.id === selectedProfileId)
    : userProfiles?.find((profile) => profile.is_default) ||
      userProfiles?.[0] ||
      profiles?.find((profile) => profile.is_default) ||
      profiles?.[0];

  console.log('🔍 defaultProfile:', defaultProfile);

  // 가격 계산
  const priceSummary = selectedItems.reduce(
    (summary, item) => {
      const roadUsageFee = item.panel_slot_snapshot?.road_usage_fee || 0;
      const advertisingFee = item.panel_slot_snapshot?.advertising_fee || 0;
      const taxPrice = item.panel_slot_snapshot?.tax_price || 0;
      const totalPrice = item.price || 0;

      return {
        roadUsageFee: summary.roadUsageFee + roadUsageFee,
        advertisingFee: summary.advertisingFee + advertisingFee,
        taxPrice: summary.taxPrice + taxPrice,
        totalPrice: summary.totalPrice + totalPrice,
      };
    },
    {
      roadUsageFee: 0,
      advertisingFee: 0,
      taxPrice: 0,
      totalPrice: 0,
    }
  );

  // 구별 계좌번호 정보 가져오기
  useEffect(() => {
    const fetchBankInfo = async () => {
      if (selectedItems.length === 0) return;

      // 첫 번째 아이템의 구와 타입으로 계좌번호 가져오기
      const firstItem = selectedItems[0];
      const displayType =
        firstItem.type === 'banner-display' ? 'banner_display' : 'led_display';

      try {
        const response = await fetch(
          `/api/region-gu?action=getBankInfo&district=${encodeURIComponent(
            firstItem.district
          )}&displayType=${displayType}`
        );
        const data = await response.json();

        if (data.success) {
          setBankInfo(data.data);
        }
      } catch (error) {
        console.error('Error fetching bank info:', error);
      }
    };

    fetchBankInfo();
  }, [selectedItems]);

  // 파일 선택 핸들러 (묶음 결제용)
  const handleFileSelect = (file: File) => {
    console.log('🔍 결제 페이지에서 파일 선택됨:', file.name);
    console.log('🔍 파일 선택 전 groupedItems:', groupedItems.length);

    setSelectedFile(file);

    // groupedItems에 파일 정보 추가
    setGroupedItems((prevGroups) => {
      return prevGroups.map((group) => ({
        ...group,
        selectedFile: file,
        fileUploadMethod: 'upload' as const,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      }));
    });
  };

  // 이메일 선택 핸들러 (묶음 결제용)
  const handleEmailSelect = (isEmail: boolean) => {
    setSendByEmail(isEmail);

    setGroupedItems((prevGroups) => {
      return prevGroups.map((group) => ({
        ...group,
        fileUploadMethod: isEmail ? ('email' as const) : null,
        emailAddress: isEmail ? 'banner114@hanmail.net' : null,
        selectedFile: null,
        fileName: null,
        fileSize: null,
        fileType: null,
      }));
    });

    if (isEmail) {
      setSelectedFile(null);
    }
  };

  // 결제 처리
  const handlePayment = async () => {
    console.log('🔍 handlePayment 시작');
    if (!user) {
      setError('로그인이 필요합니다.');
      return;
    }
    if (!validateForm()) {
      console.error('🔍 유효성 검사 실패');
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      let allSuccess = true;
      let totalAmountSum = 0;
      let lastOrderNumber = '';
      // 구별 주문 생성
      for (const group of groupedItems) {
        // 구별 프로필(추후 확장 가능, 현재는 defaultProfile 사용)
        const groupProfile = groupProfiles[group.district] || defaultProfile;
        if (!groupProfile) {
          allSuccess = false;
          setError('프로필 정보가 필요합니다.');
          break;
        }
        // 주문 데이터 준비
        const orderData = {
          user_auth_id: user.id,
          user_profile_id: groupProfile.id,
          project_name: projectName,
          draft_delivery_method: draftDeliveryMethod,
          payment_method: paymentMethod,
          total_amount: group.totalPrice,
          tax_invoice: taxInvoice,
          order_details: group.items.map((item) => ({
            panel_info_id:
              item.panel_info_id || item.panel_slot_snapshot?.panel_info_id,
            panel_slot_usage_id: item.panel_slot_usage_id,
            slot_order_quantity: 1,
            display_start_date:
              item.selectedPeriodFrom || new Date().toISOString().split('T')[0],
            display_end_date:
              item.selectedPeriodTo ||
              new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0],
            price: item.price,
            name: item.name,
            district: item.district,
            panel_type: item.panel_type || 'panel',
            period: item.halfPeriod,
            selected_year: item.selectedYear,
            selected_month: item.selectedMonth,
          })),
        };
        // 주문 생성 API 호출
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        });
        const result = await response.json();
        if (result.success) {
          totalAmountSum += result.data.order.total_amount;
          lastOrderNumber = result.data.order.order_number;
          // 시안 파일 업로드
          if (selectedFile && !sendByEmail) {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('orderId', result.data.order.id);
            formData.append('projectName', projectName);
            const uploadResponse = await fetch('/api/design-drafts/upload', {
              method: 'POST',
              body: formData,
            });
            const uploadResult = await uploadResponse.json();
            if (!uploadResult.success) {
              allSuccess = false;
              setError('파일 업로드에 실패했습니다.');
              break;
            }
          }
          // 장바구니에서 해당 구의 아이템 제거
          group.items.forEach((item) => {
            dispatch({ type: 'REMOVE_ITEM', id: item.id });
          });
        } else {
          allSuccess = false;
          setError(result.error || '주문 생성에 실패했습니다.');
          break;
        }
      }
      if (allSuccess) {
        setPaymentSuccessData({
          orderNumber: lastOrderNumber,
          totalAmount: totalAmountSum,
        });
        setShowPaymentSuccessModal(true);
        setTimeout(() => {
          router.push('/mypage/orders');
        }, 3000);
      }
    } catch (error) {
      setError('결제 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 승인된 주문 결제 처리
  const handleApprovedOrderPayment = async () => {
    console.log('🔍 handleApprovedOrderPayment 시작');

    if (!user) {
      setError('로그인이 필요합니다.');
      return;
    }

    if (!defaultProfile) {
      setError('프로필 정보가 필요합니다.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // 승인된 주문 결제 API 호출
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: selectedItems[0]?.id, // 승인된 주문의 ID
          user_auth_id: user.id,
          user_profile_id: defaultProfile.id,
          project_name: projectName,
          draft_delivery_method: draftDeliveryMethod,
          payment_method: paymentMethod,
          total_amount: priceSummary.totalPrice,
          tax_invoice: taxInvoice,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setPaymentSuccessData({
          orderNumber: result.data.order_number,
          totalAmount: result.data.total_amount,
        });
        setShowPaymentSuccessModal(true);

        setTimeout(() => {
          router.push('/mypage/orders');
        }, 3000);
      } else {
        setError(result.error || '결제 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('승인된 주문 결제 처리 중 오류:', error);
      setError('결제 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 에러가 있는 경우 에러 화면 표시
  if (error && !isProcessing) {
    return (
      <main className="min-h-screen bg-white pt-[5.5rem] bg-gray-100 lg:px-[10rem]">
        <Nav variant="default" className="bg-white" />
        <div className="container mx-auto px-4 sm:px-1 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-400 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-red-800 font-medium">{error}</span>
            </div>
            <Button
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
              onClick={() => router.push('/cart')}
            >
              장바구니로 돌아가기
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // handleSingleGroupPayment 함수 추가
  const handleSingleGroupPayment = async (group: GroupedCartItem) => {
    setIsProcessing(true);
    setError(null);
    try {
      const groupProfile = groupBulkProfile[group.district]
        ? groupProfiles[group.district] || defaultProfile
        : defaultProfile;
      if (!groupProfile) {
        setError('프로필 정보가 필요합니다.');
        setIsProcessing(false);
        return;
      }
      const orderData = {
        user_auth_id: user.id,
        user_profile_id: groupProfile.id,
        project_name: projectName,
        draft_delivery_method: draftDeliveryMethod,
        payment_method: paymentMethod,
        total_amount: group.totalPrice,
        tax_invoice: taxInvoice,
        order_details: group.items.map((item) => ({
          panel_info_id:
            item.panel_info_id || item.panel_slot_snapshot?.panel_info_id,
          panel_slot_usage_id: item.panel_slot_usage_id,
          slot_order_quantity: 1,
          display_start_date:
            item.selectedPeriodFrom || new Date().toISOString().split('T')[0],
          display_end_date:
            item.selectedPeriodTo ||
            new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
          price: item.price,
          name: item.name,
          district: item.district,
          panel_type: item.panel_type || 'panel',
          period: item.halfPeriod,
          selected_year: item.selectedYear,
          selected_month: item.selectedMonth,
        })),
      };
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      const result = await response.json();
      if (result.success) {
        if (selectedFile && !sendByEmail) {
          const formData = new FormData();
          formData.append('file', selectedFile);
          formData.append('orderId', result.data.order.id);
          formData.append('projectName', projectName);
          const uploadResponse = await fetch('/api/design-drafts/upload', {
            method: 'POST',
            body: formData,
          });
          const uploadResult = await uploadResponse.json();
          if (!uploadResult.success) {
            setError('파일 업로드에 실패했습니다.');
            setIsProcessing(false);
            return;
          }
        }
        group.items.forEach((item) => {
          dispatch({ type: 'REMOVE_ITEM', id: item.id });
        });
        setPaymentSuccessData({
          orderNumber: result.data.order.order_number,
          totalAmount: result.data.order.total_amount,
        });
        setShowPaymentSuccessModal(true);
        setTimeout(() => {
          router.push('/mypage/orders');
        }, 3000);
      } else {
        setError(result.error || '주문 생성에 실패했습니다.');
      }
    } catch {
      setError('결제 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-white pt-[5.5rem] bg-gray-100 lg:px-[10rem]">
      <Nav variant="default" className="bg-white" />

      <div className="container mx-auto px-4 sm:px-1 py-8 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-8">
        {/* 좌측 - 시안 업로드 및 구별 카드 */}
        <div className="space-y-8 border border-solid border-gray-3 rounded-[0.375rem] p-[2.5rem] sm:p-[1.5rem]">
          {/* 시안 업로드 UI (한 번만) */}
          <section className="p-6 border rounded-lg shadow-sm flex flex-col gap-4 sm:p-2">
            <h2 className="text-1.25 text-gray-2 font-bold mb-4 border-b-solid border-black border-b-[0.1rem] pb-4">
              시안 업로드
            </h2>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-col md:flex-row items-start justify-between gap-2 md:gap-4 sm:gap-2">
                <label className="w-full md:w-[9rem] text-gray-600 font-medium pt-2">
                  파일업로드
                </label>
                <div className="flex-1 space-y-2">
                  <CustomFileUpload
                    onFileSelect={handleFileSelect}
                    disabled={sendByEmail}
                    placeholder="시안 파일을 선택해주세요"
                    className="w-full md:w-[21.25rem] sm:w-[13rem]"
                  />
                  <div className="flex flex-col gap-2 items-start">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="sendByEmail"
                        checked={sendByEmail}
                        onChange={(e) => handleEmailSelect(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <label
                        htmlFor="sendByEmail"
                        className="text-sm text-gray-500"
                      >
                        이메일로 파일 보낼게요
                      </label>
                    </div>
                    {sendByEmail && (
                      <p className="text-xs text-gray-500 ml-6">
                        banner114@hanmail.net로 시안을 보내드리겠습니다.
                      </p>
                    )}
                  </div>
                  {validationErrors.fileUpload && (
                    <span className="text-red-500 text-sm">
                      {validationErrors.fileUpload}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>
          {/* 구별 카드 */}
          {groupedItems.map((group) => (
            <section
              key={group.id}
              className="p-6 border rounded-lg shadow-sm flex flex-col gap-4 sm:p-2"
            >
              <div className="flex items-center mb-2">
                <span className="text-1.25 font-700 text-[#222] sm:text-0.875">
                  {group.district} 현수막게시대
                </span>
                <span className="text-gray-500 text-0.875 ml-2">
                  ({group.items.length}개 패널)
                </span>
              </div>
              {/* 구별 아이템 목록 */}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold mb-2 text-gray-700">
                  결제할 게시대 목록:
                </h3>
                <div className="space-y-1">
                  {group.items.map((item, index) => (
                    <div
                      key={item.id}
                      className="text-sm text-gray-600 flex flex-col sm:flex-row sm:justify-between items-center"
                    >
                      <span>
                        {index + 1}. 패널번호:{' '}
                        {item.panel_code || item.panel_info_id || '-'} / 이름:{' '}
                        {item.name || '-'} / 구: {item.district}
                      </span>
                      {/* 아이템별 프로필 선택 UI: 일괄적용 해제 시에만 활성화 */}
                      {!groupBulkProfile[group.district] && (
                        <Button
                          type="button"
                          className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded ml-2 text-xs"
                          onClick={() =>
                            setProfileModalOpen(
                              `${group.district}-item-${item.id}`
                            )
                          }
                        >
                          프로필 선택
                        </Button>
                      )}
                      {/* 아이템별 프로필 모달 */}
                      {profileModalOpen ===
                        `${group.district}-item-${item.id}` && (
                        <UserProfileModal
                          isOpen={true}
                          onClose={() => setProfileModalOpen(null)}
                          mode="edit"
                          onConfirm={(profile) => {
                            // 아이템별 프로필 적용 (추후 확장)
                            // setItemProfiles((prev) => ({ ...prev, [item.id]: profile }));
                            setProfileModalOpen(null);
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {/* 결제 금액/계좌/결제 버튼 */}
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">
                    총 결제 금액:
                  </span>
                  <span className="font-bold text-lg text-blue-700">
                    {group.totalPrice.toLocaleString()}원
                  </span>
                </div>
                {/* 계좌 정보 등 추가 가능 */}
                <Button
                  onClick={async () => {
                    // 구별 결제 로직: 해당 group만 주문 생성/시안 업로드
                    await handleSingleGroupPayment(group);
                  }}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 mt-2"
                >
                  {group.district} 결제하기
                </Button>
              </div>
            </section>
          ))}
          {/* 유의사항 동의 및 작업이름 입력 */}
          <section className="p-6 border rounded-lg shadow-sm flex flex-col gap-4 sm:p-2">
            <div className="flex flex-col sm:flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-4 sm:gap-2">
              <label className="w-full md:w-[9rem] text-gray-600 font-medium">
                작업이름
              </label>
              <div className="flex flex-col gap-1">
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => {
                    setProjectName(e.target.value);
                    if (validationErrors.projectName) {
                      setValidationErrors((prev) => ({
                        ...prev,
                        projectName: '',
                      }));
                    }
                  }}
                  className={`w-full md:w-[21.25rem] sm:w-[13rem] border border-solid shadow-none rounded px-4 h-[3rem] ${
                    validationErrors.projectName
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="작업 이름을 입력하세요"
                />
                {validationErrors.projectName && (
                  <span className="text-red-500 text-sm">
                    {validationErrors.projectName}
                  </span>
                )}
              </div>
            </div>
            {/* 유의사항 동의 기존 UI 유지 */}
            {/* 유의사항 동의 */}
            <div className="flex flex-col sm:flex-col md:flex-row items-start justify-between gap-2 md:gap-4 sm:gap-2">
              <label className="w-full md:w-[9rem] text-gray-600 font-medium pt-2">
                유의사항
              </label>
              <div className="flex flex-col gap-4">
                {/* 유의사항 내용 */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    현수막 표시내용의 금지, 제한 사항
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-2 mb-4">
                    <li>성적인 표현 암시, 인권침해(국제결혼, 신부 등)</li>
                    <li>
                      음란, 퇴폐성 및 청소년 보호, 선도에 저해 우려가 있는 내용
                    </li>
                    <li>
                      사채, 대부업, 채권추심등에 관련된 내용, 시민정서에
                      적합하지 않은 내용
                    </li>
                    <li>
                      특정 개인, 단체 등의 가치관을 비방 또는 홍보하려는 내용
                    </li>
                    <li>
                      기타 반사회적 내용 또는 시민정서에 적합하지 않다고
                      판단되는 내용
                    </li>
                  </ul>

                  <h4 className="font-semibold text-gray-800 mb-3">
                    현수막 게시의 지연 또는 일시 중지
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-2 mb-4">
                    <li>
                      • 법정공휴일 또는 강풍, 우천, 폭설 시에는 현수막 게시
                      일정이 전후날로 변경 될 수 있습니다.
                    </li>
                    <li>
                      • 현수막 게시 기간 중, 태풍, 재난, 긴급 공사 등의 사유가
                      발생할 때에는 광고주에게 사전 통보 없이 게시를 일시 중지
                      할 수 있습니다.
                    </li>
                  </ul>

                  <div className="bg-red-50 border border-red-200 p-3 rounded">
                    <h4 className="font-semibold text-red-700 mb-2">
                      [유의사항]
                    </h4>
                    <p className="text-sm text-red-700">
                      현수막게시대 게시 신청 시 아래 규약사항을 반드시
                      숙지하시기 바라며, 숙지하지 못한 책임은 신청인에게
                      있습니다. 또한 관련 규정을 위반한 경우에도 신청 및 게시가
                      불가합니다.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="agreement"
                    checked={isAgreedCaution}
                    onChange={(e) => {
                      setIsAgreedCaution(e.target.checked);
                      if (validationErrors.agreement) {
                        setValidationErrors((prev) => ({
                          ...prev,
                          agreement: '',
                        }));
                      }
                    }}
                    className="w-4 h-4 mt-1"
                  />
                  <label
                    htmlFor="agreement"
                    className="text-sm text-gray-700 leading-relaxed"
                  >
                    <span className="text-red-500">*</span> 유의사항을 확인하고
                    동의합니다.
                  </label>
                </div>
                {validationErrors.agreement && (
                  <span className="text-red-500 text-sm">
                    {validationErrors.agreement}
                  </span>
                )}
              </div>
            </div>
          </section>
        </div>
        {/* 우측 - 결제 정보 및 결제 버튼 */}
        <div className="space-y-8 border border-solid border-gray-3 rounded-[0.375rem] p-[2.5rem] sm:p-[1.5rem]">
          {/* 결제 방법 선택 */}
          <section className="p-6 border rounded-lg shadow-sm">
            <h2 className="text-1.25 text-gray-2 font-bold mb-4 border-b-solid border-black border-b-[0.1rem] pb-4">
              결제 방법
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="card"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as 'card' | 'bank_transfer')
                  }
                  className="w-4 h-4"
                />
                <label htmlFor="card" className="text-gray-700">
                  카드 결제
                </label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="bank_transfer"
                  name="paymentMethod"
                  value="bank_transfer"
                  checked={paymentMethod === 'bank_transfer'}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as 'card' | 'bank_transfer')
                  }
                  className="w-4 h-4"
                />
                <label htmlFor="bank_transfer" className="text-gray-700">
                  계좌이체
                </label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="card"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as 'card' | 'bank_transfer')
                  }
                  className="w-4 h-4"
                />
                <label htmlFor="card" className="text-gray-700">
                  네이버페이
                </label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="card"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as 'card' | 'bank_transfer')
                  }
                  className="w-4 h-4"
                />
                <label htmlFor="card" className="text-gray-700">
                  카카오페이
                </label>
              </div>
            </div>
          </section>

          {/* 계좌이체 정보 */}
          {paymentMethod === 'bank_transfer' && bankInfo && (
            <section className="p-6 border rounded-lg shadow-sm">
              <h2 className="text-1.25 text-gray-2 font-bold mb-4 border-b-solid border-black border-b-[0.1rem] pb-4">
                계좌 정보
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">은행:</span>
                  <span className="font-medium">{bankInfo.bank_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">계좌번호:</span>
                  <span className="font-medium">{bankInfo.account_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">예금주:</span>
                  <span className="font-medium">{bankInfo.depositor}</span>
                </div>
              </div>
            </section>
          )}

          {/* 가격 정보 */}
          <section className="p-6 border rounded-lg shadow-sm">
            <h2 className="text-1.25 text-gray-2 font-bold mb-4 border-b-solid border-black border-b-[0.1rem] pb-4">
              가격 정보
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">도로점용료:</span>
                <span className="font-medium">
                  {priceSummary.roadUsageFee.toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">광고료:</span>
                <span className="font-medium">
                  {priceSummary.advertisingFee.toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">부가세:</span>
                <span className="font-medium">
                  {priceSummary.taxPrice.toLocaleString()}원
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>총 결제 금액:</span>
                  <span>{priceSummary.totalPrice.toLocaleString()}원</span>
                </div>
              </div>
            </div>
          </section>

          {/* 세금계산서 */}
          <section className="p-6 border rounded-lg shadow-sm">
            <h2 className="text-1.25 text-gray-2 font-bold mb-4 border-b-solid border-black border-b-[0.1rem] pb-4">
              세금계산서
            </h2>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="taxInvoice"
                checked={taxInvoice}
                onChange={(e) => setTaxInvoice(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="taxInvoice" className="text-gray-700">
                세금계산서 발급을 원합니다
              </label>
            </div>
          </section>

          {/* 결제 버튼 */}
          <Button
            onClick={
              isApprovedOrder ? handleApprovedOrderPayment : handlePayment
            }
            disabled={isProcessing}
            className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isProcessing ? '처리 중...' : '결제하기'}
          </Button>
        </div>
      </div>

      {/* 결제 성공 모달 */}
      {showPaymentSuccessModal && (
        <PaymentSuccessModal
          isOpen={showPaymentSuccessModal}
          onClose={() => setShowPaymentSuccessModal(false)}
          orderNumber={paymentSuccessData.orderNumber}
          totalAmount={paymentSuccessData.totalAmount}
        />
      )}
    </main>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentPageContent />
    </Suspense>
  );
}
