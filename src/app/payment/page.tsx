'use client';
import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { Button } from '@/src/components/button/button';
import Nav from '@/src/components/layouts/nav';
import { useAuth } from '@/src/contexts/authContext';
import { useCart } from '@/src/contexts/cartContext';
import { useProfile } from '@/src/contexts/profileContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { CartItem } from '@/src/contexts/cartContext';
import { PaymentSuccessModal } from '@/src/components/modal/UserProfileModal';
import CustomFileUpload from '@/src/components/ui/CustomFileUpload';

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

function PaymentPageContent() {
  const { user } = useAuth();
  const { cart, dispatch } = useCart();
  const { profiles } = useProfile();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedItems, setSelectedItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank_transfer'>(
    'card'
  );
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendByEmail, setSendByEmail] = useState(false);
  const [showBankTransferModal, setShowBankTransferModal] = useState(false);
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
      business_registration_number?: string;
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

  // 결제 처리
  const handlePayment = async () => {
    console.log('🔍 handlePayment 시작');
    console.log('🔍 user:', user);
    console.log('🔍 selectedItems.length:', selectedItems.length);
    console.log('🔍 selectedFile:', selectedFile?.name || '없음');
    console.log('🔍 sendByEmail:', sendByEmail);
    console.log('🔍 defaultProfile:', defaultProfile);
    console.log('🔍 userProfiles:', userProfiles);
    console.log('🔍 profiles:', profiles);
    console.log('🔍 projectName:', projectName);

    if (!user) {
      setError('로그인이 필요합니다.');
      return;
    }

    if (!defaultProfile) {
      console.error('🔍 defaultProfile이 undefined입니다.');
      console.error('🔍 userProfiles:', userProfiles);
      console.error('🔍 profiles:', profiles);
      console.error('🔍 selectedProfileId:', selectedProfileId);
      setError(
        '사용자 프로필 정보가 없습니다. 마이페이지에서 프로필을 설정해주세요.'
      );
      return;
    }

    console.log('🔍 defaultProfile 검증 통과:', defaultProfile.id);

    if (selectedItems.length === 0) {
      console.error('🔍 selectedItems가 비어있음!');
      setError('선택된 상품이 없습니다.');
      return;
    }

    console.log('🔍 selectedItems 검증 통과:', selectedItems.length);

    // 폼 유효성 검사
    console.log('🔍 폼 유효성 검사 시작');
    if (!validateForm()) {
      console.error('🔍 폼 유효성 검사 실패');
      setError('필수 항목을 모두 입력해주세요.');
      return;
    }

    console.log('🔍 폼 유효성 검사 통과');

    setIsProcessing(true);
    setError(null);

    try {
      // 승인된 주문의 경우 기존 주문을 업데이트
      if (isApprovedOrder) {
        await handleApprovedOrderPayment();
        return;
      }

      // 복합 ID에서 원본 UUID 추출 함수
      const extractPanelInfoId = (item: CartItem) => {
        const uuidPattern =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        if (item.panel_info_id) {
          if (uuidPattern.test(item.panel_info_id)) {
            return item.panel_info_id;
          } else if (item.panel_info_id.includes('-')) {
            const parts = item.panel_info_id.split('-');
            if (parts.length >= 5) {
              const uuidPart = parts.slice(2).join('-');
              if (uuidPattern.test(uuidPart)) {
                return uuidPart;
              }
            }
          }
        } else if (item.id) {
          if (uuidPattern.test(item.id)) {
            return item.id;
          } else if (item.id.includes('-')) {
            const parts = item.id.split('-');
            if (parts.length >= 5) {
              const uuidPart = parts.slice(2).join('-');
              if (uuidPattern.test(uuidPart)) {
                return uuidPart;
              }
            }
          }
        }
        throw new Error('패널 정보 ID를 추출할 수 없습니다.');
      };

      // 1. 주문 생성 API 호출 (파일 업로드는 주문 생성 후)
      console.log('🔍 주문 생성 시작 - selectedItems:', selectedItems.length);
      console.log('🔍 user.id:', user.id);
      console.log('🔍 defaultProfile?.id:', defaultProfile?.id);

      // 2. 결제수단 ID 결정
      let paymentMethodId: string;

      if (paymentMethod === 'card') {
        // 신용카드 결제수단 ID 조회
        const cardResponse = await fetch(
          '/api/payment?action=getPaymentMethods'
        );
        const cardData = await cardResponse.json();
        const creditCard = cardData.data.find(
          (method: { method_code: string; id: string }) =>
            method.method_code === 'credit_card'
        );

        if (!creditCard) {
          throw new Error(
            '신용카드 결제수단을 찾을 수 없습니다. 관리자에게 문의하세요.'
          );
        }

        paymentMethodId = creditCard.id;
      } else if (paymentMethod === 'bank_transfer') {
        // 계좌이체 결제수단 ID 조회
        const bankResponse = await fetch(
          '/api/payment?action=getPaymentMethods'
        );
        const bankData = await bankResponse.json();
        const bankTransfer = bankData.data.find(
          (method: { method_code: string; id: string }) =>
            method.method_code === 'bank_transfer'
        );

        if (!bankTransfer) {
          throw new Error(
            '계좌이체 결제수단을 찾을 수 없습니다. 관리자에게 문의하세요.'
          );
        }

        paymentMethodId = bankTransfer.id;
      } else {
        throw new Error('지원하지 않는 결제수단입니다.');
      }

      // 선택된 프로필 정보를 주문에 포함
      const orderPayload = {
        items: selectedItems.map((item) => ({
          id: item.id,
          price: item.price,
          quantity: 1,
          panel_info_id: extractPanelInfoId(item),
          panel_slot_snapshot: item.panel_slot_snapshot,
          panel_slot_usage_id: item.panel_slot_usage_id,
          halfPeriod: item.halfPeriod,
          selectedYear: item.selectedYear,
          selectedMonth: item.selectedMonth,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
        })),
        userAuthId: user.id, // 사용자 인증 ID 추가
        userProfileId: defaultProfile?.id, // 실제 프로필 ID 사용
        paymentMethodId: paymentMethodId, // 결제수단 ID 추가
        draftDeliveryMethod: draftDeliveryMethod, // 시안 전송 방식 추가
        isRequireTaxFiling: taxInvoice, // 세금계산서 신청 여부 추가
        isAgreedCaution: isAgreedCaution, // 유의사항 동의 여부 추가
        projectName: projectName, // 작업 이름 추가
      };

      console.log('🔍 주문 페이로드:', orderPayload);

      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.error || '주문 생성에 실패했습니다.');
      }

      const orderId = orderData.order.orderId;
      const totalAmount = priceSummary.totalPrice;

      // 2. selectedItems에서 파일 정보 추출
      const fileInfo = selectedItems[0]?.selectedFile;
      const fileUploadMethod = selectedItems[0]?.fileUploadMethod;
      const fileName = selectedItems[0]?.fileName;

      console.log('🔍 파일 업로드 정보:', {
        fileInfo: fileInfo?.name,
        fileUploadMethod,
        fileName,
      });

      // 3. 결제 처리 API 호출
      const paymentResponse = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'processPayment',
          orderId: orderId,
          paymentMethodId: paymentMethodId,
          amount: totalAmount,
          userAuthId: user.id,
          userProfileId: defaultProfile?.id,
          draftDeliveryMethod: draftDeliveryMethod, // 시안 전송 방식 추가
          isRequireTaxFiling: taxInvoice, // 세금계산서 신청 여부 추가
          isAgreedCaution: isAgreedCaution, // 유의사항 동의 여부 추가
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentData.success) {
        throw new Error(paymentData.error || '결제 처리에 실패했습니다.');
      }

      // 성공 시 선택된 아이템들을 장바구니에서 제거
      selectedItems.forEach((item) => {
        dispatch({ type: 'REMOVE_ITEM', id: item.id });
      });

      // 3. 결제 완료 후 파일 업로드 (selectedItems에서 파일 정보 추출)
      if (fileInfo && fileUploadMethod === 'upload') {
        console.log('🔍 결제 완료 후 파일 업로드 시작:', fileName);
        const formData = new FormData();
        formData.append('file', fileInfo);
        formData.append('orderId', orderId);

        try {
          const uploadResponse = await fetch('/api/design-drafts/upload', {
            method: 'POST',
            body: formData,
          });

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            if (uploadData.success) {
              console.log('🔍 파일 업로드 성공:', uploadData.data);
            }
          } else {
            console.warn('🔍 파일 업로드 실패:', uploadResponse.status);
          }
        } catch (error) {
          console.error('🔍 파일 업로드 오류:', error);
        }
      }

      // 결제 완료 모달 표시
      setPaymentSuccessData({
        orderNumber: orderData.order.orderNumber || orderId.slice(0, 8),
        totalAmount: totalAmount,
      });
      setShowPaymentSuccessModal(true);
    } catch (error) {
      console.error('Payment error:', error);
      setError(
        error instanceof Error ? error.message : '결제 처리에 실패했습니다.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // 승인된 주문의 결제 처리
  const handleApprovedOrderPayment = async () => {
    console.log('🔍 handleApprovedOrderPayment 시작');
    console.log('🔍 projectName:', projectName);

    if (!user) {
      setError('로그인이 필요합니다.');
      return;
    }

    try {
      // URL에서 주문 ID 가져오기
      const itemsParam = searchParams.get('items');
      if (!itemsParam) {
        throw new Error('주문 정보를 찾을 수 없습니다.');
      }

      const orderIds = JSON.parse(decodeURIComponent(itemsParam)) as string[];
      const orderId = orderIds[0];

      // 결제수단 ID 결정
      let paymentMethodId: string;

      if (paymentMethod === 'card') {
        const cardResponse = await fetch(
          '/api/payment?action=getPaymentMethods'
        );
        const cardData = await cardResponse.json();
        const creditCard = cardData.data.find(
          (method: { method_code: string; id: string }) =>
            method.method_code === 'credit_card'
        );

        if (!creditCard) {
          throw new Error(
            '신용카드 결제수단을 찾을 수 없습니다. 관리자에게 문의하세요.'
          );
        }

        paymentMethodId = creditCard.id;
      } else if (paymentMethod === 'bank_transfer') {
        const bankResponse = await fetch(
          '/api/payment?action=getPaymentMethods'
        );
        const bankData = await bankResponse.json();
        const bankTransfer = bankData.data.find(
          (method: { method_code: string; id: string }) =>
            method.method_code === 'bank_transfer'
        );

        if (!bankTransfer) {
          throw new Error(
            '계좌이체 결제수단을 찾을 수 없습니다. 관리자에게 문의하세요.'
          );
        }

        paymentMethodId = bankTransfer.id;
      } else {
        throw new Error('지원하지 않는 결제수단입니다.');
      }

      // 결제 처리
      const paymentResponse = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'processApprovedOrderPayment',
          orderId: orderId,
          paymentMethodId: paymentMethodId,
          amount: priceSummary.totalPrice,
          userAuthId: user.id,
          userProfileId: defaultProfile?.id,
          draftDeliveryMethod: draftDeliveryMethod,
          isRequireTaxFiling: taxInvoice, // 세금계산서 신청 여부 추가
          isAgreedCaution: isAgreedCaution, // 유의사항 동의 여부 추가
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentData.success) {
        throw new Error(paymentData.error || '결제 처리에 실패했습니다.');
      }

      // 성공 시 시안관리 페이지로 이동
      router.push('/mypage/design');
    } catch (error) {
      console.error('Approved order payment error:', error);
      setError(
        error instanceof Error ? error.message : '결제 처리에 실패했습니다.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (error) {
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

  return (
    <main className="min-h-screen bg-white pt-[5.5rem] bg-gray-100 lg:px-[10rem]">
      <Nav variant="default" className="bg-white" />

      <div className="container mx-auto px-4 sm:px-1 py-8 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-8">
        {/* 좌측 - 주문 상품 정보 */}
        <div className="space-y-8 border border-solid border-gray-3 rounded-[0.375rem] p-[2.5rem] sm:p-[1.5rem]">
          {/* 주문 상품 목록 */}
          {selectedItems.map((item) => (
            <div key={item.id}>
              <section
                key={item.id}
                className="p-6 border rounded-lg shadow-sm flex flex-col gap-4 sm:p-2"
              >
                <div>
                  <h2 className="text-1.25 text-gray-2 font-bold mb-4 border-b-solid border-black border-b-[0.1rem] pb-4">
                    {item.type === 'banner-display'
                      ? '현수막 게시대'
                      : 'LED 전자게시대'}
                  </h2>
                  <div className="mb-4 text-1.25 font-700 text-[#222] sm:text-0.875">
                    {item.name}
                    <span className="text-gray-500 text-0.875 ml-2">
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
                  <div className="flex items-center gap-2 border border-solid border-gray-12 rounded-[0.375rem] p-4 bg-gray-11 sm:p-2">
                    <div className="text-1.25 font-700 sm:text-0.875">
                      {item.is_public_institution
                        ? '공공기관용'
                        : item.is_company
                        ? '기업용'
                        : '개인용'}{' '}
                      -{' '}
                      {defaultProfile?.contact_person_name ||
                        user?.name ||
                        '사용자'}
                    </div>
                  </div>
                </div>

                <div className="text-1 text-gray-10">
                  <h3 className="text-1.25 font-600 mb-2 text-[#222] sm:pb-5">
                    고객 정보
                  </h3>
                  <form className="flex flex-col gap-5">
                    <div className="flex flex-col gap-4 sm:gap-8">
                      {/* 작업이름 */}
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
                              // 입력 시 유효성 검사 에러 초기화
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

                      {/* 파일업로드 */}
                      <div className="flex flex-col sm:flex-col md:flex-row items-start justify-between gap-2 md:gap-4 sm:gap-2">
                        <label className="w-full md:w-[9rem] text-gray-600 font-medium pt-2">
                          파일업로드
                        </label>
                        <div className="flex-1 space-y-2">
                          {/* 커스텀 파일 업로드 */}
                          <CustomFileUpload
                            onFileSelect={(file) => {
                              console.log(
                                '🔍 결제 페이지에서 파일 선택됨:',
                                file.name
                              );
                              console.log(
                                '🔍 파일 선택 전 selectedItems:',
                                selectedItems.length
                              );

                              // selectedItems에 파일 정보 추가 - 함수형 업데이트 사용
                              setSelectedItems((prevItems) => {
                                console.log(
                                  '🔍 setSelectedItems 함수형 업데이트 시작'
                                );
                                console.log('🔍 prevItems:', prevItems.length);

                                if (prevItems.length === 0) {
                                  console.warn(
                                    '🔍 WARNING: prevItems가 비어있음! 복구 시도...'
                                  );

                                  // URL에서 아이템 정보를 다시 가져와서 복구 시도
                                  const itemsParam = searchParams.get('items');
                                  if (itemsParam) {
                                    try {
                                      const selectedItemIds = JSON.parse(
                                        decodeURIComponent(itemsParam)
                                      ) as string[];
                                      const recoveredItems = cart.filter(
                                        (item) =>
                                          selectedItemIds.includes(item.id)
                                      );
                                      console.log(
                                        '🔍 복구된 아이템:',
                                        recoveredItems.length
                                      );

                                      if (recoveredItems.length > 0) {
                                        const updatedItems = recoveredItems.map(
                                          (item) => ({
                                            ...item,
                                            selectedFile: file,
                                            fileUploadMethod: 'upload' as const,
                                            fileName: file.name,
                                            fileSize: file.size,
                                            fileType: file.type,
                                          })
                                        );
                                        console.log(
                                          '🔍 복구 후 파일 정보 추가:',
                                          updatedItems.length
                                        );
                                        return updatedItems;
                                      }
                                    } catch (error) {
                                      console.error('🔍 복구 실패:', error);
                                    }
                                  }

                                  return prevItems;
                                }

                                const updatedItems = prevItems.map((item) => ({
                                  ...item,
                                  selectedFile: file,
                                  fileUploadMethod: 'upload' as const,
                                  fileName: file.name,
                                  fileSize: file.size,
                                  fileType: file.type,
                                }));

                                console.log(
                                  '🔍 파일 정보가 추가된 updatedItems:',
                                  updatedItems.length
                                );
                                return updatedItems;
                              });

                              setSelectedFile(file);
                            }}
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
                                onChange={(e) => {
                                  const isEmail = e.target.checked;
                                  setSendByEmail(isEmail);

                                  // 이메일 선택 시 selectedItems에 정보 추가 - 함수형 업데이트 사용
                                  setSelectedItems((prevItems) => {
                                    console.log(
                                      '🔍 이메일 체크박스 변경 - prevItems:',
                                      prevItems.length
                                    );

                                    if (prevItems.length === 0) {
                                      console.warn(
                                        '🔍 WARNING: 이메일 변경 시 prevItems가 비어있음! 복구 시도...'
                                      );

                                      // URL에서 아이템 정보를 다시 가져와서 복구 시도
                                      const itemsParam =
                                        searchParams.get('items');
                                      if (itemsParam) {
                                        try {
                                          const selectedItemIds = JSON.parse(
                                            decodeURIComponent(itemsParam)
                                          ) as string[];
                                          const recoveredItems = cart.filter(
                                            (item) =>
                                              selectedItemIds.includes(item.id)
                                          );
                                          console.log(
                                            '🔍 이메일 변경 시 복구된 아이템:',
                                            recoveredItems.length
                                          );

                                          if (recoveredItems.length > 0) {
                                            if (isEmail) {
                                              const updatedItems =
                                                recoveredItems.map((item) => ({
                                                  ...item,
                                                  fileUploadMethod:
                                                    'email' as const,
                                                  emailAddress:
                                                    'banner114@hanmail.net',
                                                  selectedFile: null,
                                                  fileName: null,
                                                  fileSize: null,
                                                  fileType: null,
                                                }));
                                              console.log(
                                                '🔍 이메일 선택 복구 후:',
                                                updatedItems.length
                                              );
                                              return updatedItems;
                                            } else {
                                              const updatedItems =
                                                recoveredItems.map((item) => ({
                                                  ...item,
                                                  fileUploadMethod: null,
                                                  emailAddress: null,
                                                  selectedFile: null,
                                                  fileName: null,
                                                  fileSize: null,
                                                  fileType: null,
                                                }));
                                              console.log(
                                                '🔍 이메일 해제 복구 후:',
                                                updatedItems.length
                                              );
                                              return updatedItems;
                                            }
                                          }
                                        } catch (error) {
                                          console.error(
                                            '🔍 이메일 변경 시 복구 실패:',
                                            error
                                          );
                                        }
                                      }

                                      return prevItems;
                                    }

                                    if (isEmail) {
                                      const updatedItems = prevItems.map(
                                        (item) => ({
                                          ...item,
                                          fileUploadMethod: 'email' as const,
                                          emailAddress: 'banner114@hanmail.net',
                                          selectedFile: null,
                                          fileName: null,
                                          fileSize: null,
                                          fileType: null,
                                        })
                                      );
                                      console.log(
                                        '🔍 이메일 선택 - updatedItems:',
                                        updatedItems.length
                                      );
                                      return updatedItems;
                                    } else {
                                      // 이메일 해제 시 파일 정보 제거
                                      const updatedItems = prevItems.map(
                                        (item) => ({
                                          ...item,
                                          fileUploadMethod: null,
                                          emailAddress: null,
                                          selectedFile: null,
                                          fileName: null,
                                          fileSize: null,
                                          fileType: null,
                                        })
                                      );
                                      console.log(
                                        '🔍 이메일 해제 - updatedItems:',
                                        updatedItems.length
                                      );
                                      return updatedItems;
                                    }
                                  });

                                  if (isEmail) {
                                    setSelectedFile(null); // 파일 선택 해제
                                  }
                                }}
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
                              <span className="text-gray-600 font-medium text-sm h-[3rem] w-full md:w-[20rem] sm:w-[14.4rem] placeholder:pl-4">
                                banner114@hanmail.net
                              </span>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              * 선택한 방식과 관계없이 결제 완료 후 시안관리
                              페이지에서 시안을 업로드할 수 있습니다.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 세금계산서 */}
                      <div className="flex flex-col sm:flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 sm:gap-2">
                        <label className="w-full md:w-[9rem] text-gray-600 font-medium">
                          세금계산서
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={taxInvoice}
                            onChange={(e) => setTaxInvoice(e.target.checked)}
                            className="w-5 h-5 sm:w-4 sm:h-4"
                          />
                          <label className="text-gray-600 font-medium sm:text-0.875">
                            세금계산서 신청
                          </label>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </section>
              {/* 동의서 */}
              <section className="flex flex-col gap-2">
                <div>
                  <div className="flex flex-col gap-2">
                    <div>
                      <div className="text-blue-500">
                        ○ 현수막 표시내용의 금지, 제한사항
                      </div>
                      <ul>
                        <li>
                          성적인 표현 암시, 인권침해(국제결혼, --- 신부 등)
                        </li>
                        <li>
                          음란, 퇴폐성 및 청소년 보호, 선도에 저해 우려가 있는
                          내용
                        </li>
                        <li>
                          사채, 대부업, 채권추심등이 관련된 내용, 시민정서에
                          적합하지 않은 내용
                        </li>
                        <li>
                          특정 개인, 단체 등의 가치관을 비방 또는 홍보하려는
                          내용
                        </li>
                        <li>
                          기타 반사회적 내용 또는 시민정서에 적합하지 않다고
                          판단되는 내용
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div>
                    <div className="text-blue-500">
                      ○ 현수막게시의 지연 또는 일시 중지
                    </div>
                    <ul>
                      <li>
                        법정공휴일 또는 강풍,우천,폭설 시에는 현수막 게시일정이
                        전후날로 변경 될 수 있습니다.{' '}
                      </li>
                      <li>
                        현수막 게시 기간 중, 태풍,재난긴급 공사 등의 사유가
                        발생할 때에는 광고주에게 사전 통보 없이 게시를 일시 중지
                        할 수 있습니다.
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="text-red text-1 font-500 flex flex-col gap-2 items-center">
                  <span className="">[유의사항]</span>
                  <div>
                    현수막게시대 신청 시 아래 규약사항을 반드시 숙지하시기
                    바라며,
                    <br />
                    숙지하지 못한 책임은 신청인에게 있습니다. <br />
                    또한 관련 규정을 위반한 경우에도 신청 및 게시대가
                    불가합니다.
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <input
                    type="checkbox"
                    id="agreeCaution"
                    checked={isAgreedCaution}
                    onChange={(e) => setIsAgreedCaution(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label
                    htmlFor="agreeCaution"
                    className="text-sm text-gray-700"
                  >
                    위 유의사항을 모두 읽고 동의합니다.
                  </label>
                </div>
              </section>
            </div>
          ))}

          {/* 결제수단 선택 */}
          {(() => {
            console.log(
              '🔍 렌더링 시 selectedItems.length:',
              selectedItems.length
            );
            return selectedItems.length > 0;
          })() ? (
            <section className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-1.25 font-700 mb-4 sm:text-1">결제수단</h3>
              <div className="flex flex-col gap-3 items-center justify-center">
                <button
                  className={`hover:cursor-pointer border-solid rounded-[0.375rem] px-4 py-6 w-full text-1.25 font-700 sm:text-1 sm:py-4 ${
                    paymentMethod === 'card'
                      ? 'border-black border-[0.1rem] hover:bg-gray-3 text-black shadow-sm'
                      : 'border-gray-3 bg-gray-11'
                  }`}
                  onClick={() => {
                    console.log('🔍 신용카드 버튼 클릭됨');
                    console.log('🔍 현재 paymentMethod:', paymentMethod);
                    console.log('🔍 클릭 후 paymentMethod:', 'card');
                    setPaymentMethod('card');
                  }}
                >
                  신용 · 체크카드
                </button>

                <button
                  className={`hover:cursor-pointer border-solid rounded-[0.375rem] px-4 py-6 w-full text-1.25 font-700 sm:text-1 sm:py-4 ${
                    paymentMethod === 'bank_transfer'
                      ? 'border-black border-[0.1rem] hover:bg-gray-3 text-black shadow-sm'
                      : 'border-gray-3 bg-gray-11'
                  }`}
                  onClick={() => {
                    console.log('🔍 계좌이체 버튼 클릭됨');
                    console.log('🔍 현재 paymentMethod:', paymentMethod);
                    console.log('🔍 클릭 후 paymentMethod:', 'bank_transfer');
                    setPaymentMethod('bank_transfer');
                  }}
                >
                  계좌이체
                </button>

                <div className="w-full flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <button className="border border-gray-3 rounded-[0.375rem] p-4 w-full sm:h-[3rem] sm:flex sm:items-center sm:justify-center">
                    <Image
                      src="/svg/naver-pay.svg"
                      alt="Naver Pay"
                      width={80}
                      height={80}
                      className="sm:w-[3rem] sm:h-[3rem]"
                    />
                  </button>
                  <button className="border border-gray-3 rounded-[0.375rem] p-4 w-full sm:h-[3rem] sm:flex sm:items-center sm:justify-center">
                    <Image
                      src="/svg/kakao-pay.svg"
                      alt="Kakao Pay"
                      width={80}
                      height={80}
                      className="sm:w-[3rem] sm:h-[3rem]"
                    />
                  </button>
                </div>
              </div>

              {/* 계좌이체 선택 시 계좌번호 표시 */}
              {paymentMethod === 'bank_transfer' && bankInfo && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    입금 계좌 정보 ({selectedItems[0]?.district || '선택된 구'})
                  </h4>
                  <div className="text-blue-700">
                    <p>
                      <strong>은행:</strong> {bankInfo.bank_name}
                    </p>
                    <p>
                      <strong>계좌번호:</strong> {bankInfo.account_number}
                    </p>
                    <p>
                      <strong>예금주:</strong> {bankInfo.depositor}
                    </p>
                  </div>
                  <p className="text-sm text-blue-600 mt-2">
                    * 계좌이체시 입금자명을 주문자명과 동일하게 입력해주세요.
                  </p>
                </div>
              )}
            </section>
          ) : (
            <section className="p-6 bg-white rounded-lg shadow-md">
              <div className="flex flex-col items-center justify-center py-8">
                <div className="text-gray-500 text-lg font-medium mb-2">
                  결제 상품이 없습니다
                </div>
                <p className="text-gray-400 text-sm text-center mb-4">
                  장바구니에서 상품을 선택해주세요
                </p>
                <Button
                  className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
                  onClick={() => router.push('/cart')}
                >
                  장바구니로 이동
                </Button>
              </div>
            </section>
          )}

          {/* 승인된 주문 안내 메시지 */}
          {isApprovedOrder && (
            <section className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-1.25 font-700 mb-2 text-blue-800 sm:text-1">
                승인된 주문
              </h3>
              <p className="text-sm text-blue-700">
                어드민 승인이 완료된 주문입니다. 결제를 완료하면 시안관리
                페이지에서 시안을 업로드할 수 있습니다.
              </p>
            </section>
          )}
        </div>

        {/* 우측 - 결제 영역 */}
        <div className="w-full md:w-[24rem] space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-bold text-1.25 mb-4 border-b-sollid border-gray-1 pb-4 border-b-[2px]">
              최종 결제 금액
            </h3>
            <div className="flex flex-col gap-[0.88rem] text-1 font-500 text-gray-2">
              <div className="flex justify-between py-1">
                <span>도로이용비</span>
                <span>{priceSummary.roadUsageFee.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between py-1">
                <span>광고대행비</span>
                <span>{priceSummary.advertisingFee.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between py-1">
                <span>수수료</span>
                <span>{priceSummary.taxPrice.toLocaleString()}원</span>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4 border-t border-gray-1 pt-7 sm:flex-col sm:gap-4">
              <span className="text-1.25 font-900">최종결제금액</span>
              <span className="text-1.875 font-900">
                {priceSummary.totalPrice.toLocaleString()}{' '}
                <span className="text-1 font-400">원</span>
              </span>
            </div>
          </div>

          {/* 유효성 검사 에러 메시지 */}
          {(validationErrors.projectName ||
            validationErrors.fileUpload ||
            validationErrors.agreement) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
              {validationErrors.projectName && (
                <div className="text-red-600 text-sm">
                  • {validationErrors.projectName}
                </div>
              )}
              {validationErrors.fileUpload && (
                <div className="text-red-600 text-sm">
                  • {validationErrors.fileUpload}
                </div>
              )}
              {validationErrors.agreement && (
                <div className="text-red-600 text-sm">
                  • {validationErrors.agreement}
                </div>
              )}
            </div>
          )}

          <button
            className={`w-full py-6 rounded-lg transition-colors hover:cursor-pointer ${
              isProcessing ||
              Object.values(validationErrors).some((error) => error !== '')
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
            disabled={
              isProcessing ||
              Object.values(validationErrors).some((error) => error !== '')
            }
            onClick={() => {
              if (paymentMethod === 'bank_transfer') {
                setShowBankTransferModal(true);
              } else {
                handlePayment();
              }
            }}
          >
            <span className="text-white sm:text-1.25 ">
              {isProcessing
                ? '처리중...'
                : paymentMethod === 'bank_transfer'
                ? '입금대기 신청'
                : '결제하기'}
            </span>
          </button>
        </div>
      </div>

      {/* 계좌이체 모달 */}
      {showBankTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">계좌이체 안내</h3>
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                계좌이체 후 주문내역에서 확인해주세요.
              </p>
              {bankInfo && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-semibold mb-2">입금 계좌 정보</p>
                  <p className="text-sm text-gray-600">
                    은행: {bankInfo.bank_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    계좌번호: {bankInfo.account_number}
                  </p>
                  <p className="text-sm text-gray-600">
                    예금주: {bankInfo.depositor}
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <button
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
                onClick={() => setShowBankTransferModal(false)}
              >
                취소
              </button>
              <button
                className="flex-1 bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
                onClick={() => {
                  setShowBankTransferModal(false);
                  handlePayment();
                }}
              >
                결제하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 결제 완료 모달 */}
      <PaymentSuccessModal
        isOpen={showPaymentSuccessModal}
        onClose={() => setShowPaymentSuccessModal(false)}
        orderNumber={paymentSuccessData.orderNumber}
        totalAmount={paymentSuccessData.totalAmount}
      />
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
