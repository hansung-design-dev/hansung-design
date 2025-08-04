'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { Button } from '@/src/components/button/button';
import Nav from '@/src/components/layouts/nav';
import { useAuth } from '@/src/contexts/authContext';
import { useCart } from '@/src/contexts/cartContext';
import { useProfile } from '@/src/contexts/profileContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { CartItem } from '@/src/contexts/cartContext';
import CustomFileUpload from '@/src/components/ui/CustomFileUpload';
// import Image from 'next/image';
import PaymentMethodSelector from '@/src/components/payment/PaymentMethodSelector';
import { processPayment } from '@/src/lib/payment';

// UserProfile 타입 정의
interface UserProfile {
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
  const { cart } = useCart();
  const { profiles } = useProfile();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedItems, setSelectedItems] = useState<CartItem[]>([]);
  const [groupedItems, setGroupedItems] = useState<GroupedCartItem[]>([]);
  const [isApprovedOrder, setIsApprovedOrder] = useState(false);
  const [isAgreedCaution, setIsAgreedCaution] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [tempProjectName, setTempProjectName] = useState('');
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
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);

  // 일괄적용 상태 관리
  const [bulkApply, setBulkApply] = useState({
    projectName: false,
    fileUpload: false,
    emailMethod: false,
  });

  // 구별 개별 상태 관리
  const [groupStates, setGroupStates] = useState<{
    [district: string]: {
      projectName: string;
      selectedFile: File | null;
      sendByEmail: boolean;
      fileName: string | null;
      fileSize: number | null;
      fileType: string | null;
      emailAddress: string | null;
    };
  }>({});

  // 결제 모달 상태
  const [paymentModalOpen, setPaymentModalOpen] = useState<string | null>(null);
  const [modalPaymentMethod, setModalPaymentMethod] = useState<string>('card');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const [modalTaxInvoice, setModalTaxInvoice] = useState(false);

  // 결제 처리 상태
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedDistricts, setCompletedDistricts] = useState<string[]>([]);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successDistrict, setSuccessDistrict] = useState<string | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  // 일괄적용 핸들러들
  const handleBulkProjectNameToggle = () => {
    setBulkApply((prev) => ({ ...prev, projectName: !prev.projectName }));
  };

  const handleBulkFileUploadToggle = () => {
    setBulkApply((prev) => {
      const newFileUpload = !prev.fileUpload;
      return {
        ...prev,
        fileUpload: newFileUpload,
        // 파일 일괄적용을 켤 때 이메일 일괄적용은 끄기
        emailMethod: newFileUpload ? false : prev.emailMethod,
      };
    });
  };

  const handleBulkEmailMethodToggle = () => {
    setBulkApply((prev) => {
      const newEmailMethod = !prev.emailMethod;
      return {
        ...prev,
        emailMethod: newEmailMethod,
        // 이메일 일괄적용을 켤 때 파일 일괄적용은 끄기
        fileUpload: newEmailMethod ? false : prev.fileUpload,
      };
    });
  };

  // 구별 상태 업데이트 핸들러들
  const handleGroupProjectNameChange = (district: string, value: string) => {
    setGroupStates((prev) => ({
      ...prev,
      [district]: {
        ...prev[district],
        projectName: value,
      },
    }));
  };

  const handleGroupFileSelect = (district: string, file: File) => {
    setGroupStates((prev) => ({
      ...prev,
      [district]: {
        ...prev[district],
        selectedFile: file,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        sendByEmail: false,
      },
    }));
  };

  const handleGroupEmailSelect = (district: string, isEmail: boolean) => {
    setGroupStates((prev) => ({
      ...prev,
      [district]: {
        ...prev[district],
        sendByEmail: isEmail,
        emailAddress: isEmail ? 'banner114@hanmail.net' : null,
        selectedFile: null,
        fileName: null,
        fileSize: null,
        fileType: null,
      },
    }));
  };

  // 일괄적용 실행 함수
  const applyBulkSettings = () => {
    if (bulkApply.projectName && projectName) {
      groupedItems.forEach((group) => {
        handleGroupProjectNameChange(group.district, projectName);
      });
    }

    if (bulkApply.fileUpload && selectedFile) {
      // 파일 일괄적용이 켜져있고 파일이 선택되어 있으면 모든 구에 적용
      groupedItems.forEach((group) => {
        handleGroupFileSelect(group.district, selectedFile);
      });
    }

    if (bulkApply.emailMethod) {
      // 이메일 일괄적용이 켜져있으면 모든 구에 이메일 방식 적용
      groupedItems.forEach((group) => {
        handleGroupEmailSelect(group.district, true);
      });
    }
  };

  // 일괄적용 상태 변경 시 자동 적용
  useEffect(() => {
    applyBulkSettings();
  }, [bulkApply, projectName, selectedFile]);

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

  // URL 파라미터에서 선택된 아이템 ID들 가져오기
  useEffect(() => {
    const itemsParam = searchParams.get('items');
    const approvedParam = searchParams.get('approved');
    const orderIdParam = searchParams.get('orderId');
    console.log('🔍 Payment page - itemsParam:', itemsParam);
    console.log('🔍 Payment page - approvedParam:', approvedParam);
    console.log('🔍 Payment page - orderIdParam:', orderIdParam);
    console.log('🔍 Payment page - cart:', cart);

    if (approvedParam === 'true') {
      setIsApprovedOrder(true);
    }

    // 주문 ID가 있는 경우 (결제대기 주문)
    if (orderIdParam) {
      setPendingOrderId(orderIdParam);
      fetchPendingOrder(orderIdParam);
      return;
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
        // setError('선택된 상품 정보를 불러오는데 실패했습니다.'); // Removed setError
      }
    } else {
      console.log('🔍 Payment page - no items param found');
    }
  }, [searchParams, cart, isApprovedOrder]);

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

      // 2. 파일업로드 방식 검사 (일괄적용이 켜져있을 때만)
      if (bulkApply.fileUpload || bulkApply.emailMethod) {
        if (!selectedFile && !bulkApply.emailMethod) {
          errors.fileUpload = '파일을 업로드하거나 이메일 전송을 선택해주세요.';
        }
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
    bulkApply,
    isAgreedCaution,
    selectedItems.length,
  ]);

  // 승인된 주문의 아이템 정보 가져오기
  const fetchApprovedOrderItems = async (orderNumber: string) => {
    try {
      const response = await fetch(`/api/orders/${orderNumber}`);
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
              panel_id?: string;
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
              panel_id: detail.panel_id,
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
      // setError('승인된 주문 정보를 불러오는데 실패했습니다.'); // Removed setError
    }
  };

  // 결제대기 주문 정보 가져오기
  const fetchPendingOrder = async (orderNumber: string) => {
    try {
      const response = await fetch(`/api/orders/${orderNumber}`);
      const data = await response.json();

      if (data.success && data.data) {
        const order = data.data.order;
        const orderDetails = data.data.orderDetails;
        const payments = data.data.payments;

        // 주문 정보를 GroupedCartItem 형태로 변환
        const groupedItem: GroupedCartItem = {
          id: order.id,
          name: order.projectName || '상담신청 주문',
          items: orderDetails.map(
            (detail: {
              id: string;
              panels?: {
                address?: string;
                region_gu?: { name: string };
                panel_type?: string;
              };
            }) => ({
              id: detail.id,
              name: detail.panels?.address || '상담신청',
              price: payments?.[0]?.amount || 0,
              district: detail.panels?.region_gu?.name || '상담신청',
              panel_type: detail.panels?.panel_type || '상담신청',
              is_public_institution:
                order.user_profiles?.is_public_institution || false,
              is_company: order.user_profiles?.is_company || false,
              user_profile_id: order.user_profile_id,
              contact_person_name:
                order.user_profiles?.contact_person_name || '',
              phone: order.user_profiles?.phone || '',
              company_name: order.user_profiles?.company_name || '',
              email: order.user_profiles?.email || '',
            })
          ),
          totalPrice: payments?.[0]?.amount || 0,
          district: orderDetails?.[0]?.panels?.region_gu?.name || '상담신청',
          type: 'banner-display', // 기본값
          panel_type: orderDetails?.[0]?.panels?.panel_type || '상담신청',
          contact_person_name: order.user_profiles?.contact_person_name || '',
          phone: order.user_profiles?.phone || '',
          company_name: order.user_profiles?.company_name || '',
          email: order.user_profiles?.email || '',
        };

        setGroupedItems([groupedItem]);
        setIsApprovedOrder(true);
      }
    } catch (error) {
      console.error('결제대기 주문 조회 실패:', error);
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
          // setBankInfo(data.data); // Removed setBankInfo
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

  // 에러가 있는 경우 에러 화면 표시 (현재는 사용하지 않음)
  // if (/* error && */ !isProcessing) {
  //   // Removed error
  //   return (
  //     <main className="min-h-screen bg-white pt-[5.5rem] bg-gray-100 lg:px-[10rem]">
  //       <Nav variant="default" className="bg-white" />
  //       <div className="container mx-auto px-4 sm:px-1 py-8">
  //         <div className="bg-red-50 border border-red-200 rounded-lg p-4">
  //           <div className="flex items-center">
  //             <svg
  //               className="w-5 h-5 text-red-400 mr-2"
  //               fill="currentColor"
  //               viewBox="0 0 20 20"
  //             >
  //               <path
  //                 fillRule="evenodd"
  //                 d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
  //                 clipRule="evenodd"
  //               />
  //             </svg>
  //             <span className="text-red-800 font-medium">
  //               {/* {error} */}
  //               결제 중 오류가 발생했습니다.
  //             </span>
  //           </div>
  //           <Button
  //             className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
  //             onClick={() => router.push('/cart')}
  //           >
  //             장바구니로 돌아가기
  //           </Button>
  //         </div>
  //       </div>
  //     </main>
  //   );
  // }

  // 결제 처리 함수
  const handleSingleGroupPayment = async (group: GroupedCartItem) => {
    try {
      setIsProcessingPayment(true);

      // 결제 요청 데이터 생성
      const paymentRequest = {
        orderId: `order_${Date.now()}_${group.district}`,
        amount: group.totalPrice,
        orderName: `${group.district} ${group.type} 광고`,
        customerName: group.contact_person_name || '고객',
        customerEmail: group.email || 'customer@example.com',
        customerPhone: group.phone || '010-0000-0000',
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
        cancelUrl: `${window.location.origin}/payment/cancel`,
      };

      // 결제 처리
      const result = await processPayment(modalPaymentMethod, paymentRequest);

      if (result.success) {
        // 결제 성공
        setCompletedDistricts((prev) => [...prev, group.district]);
        setSuccessDistrict(group.district);
        setSuccessModalOpen(true);
        setPaymentModalOpen(null);

        // 결제대기 주문의 경우 상태 업데이트
        if (pendingOrderId) {
          try {
            await fetch(`/api/orders/${pendingOrderId}/update-status`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                payment_status:
                  modalPaymentMethod === 'bank_transfer'
                    ? 'pending_deposit'
                    : 'completed',
              }),
            });
          } catch (error) {
            console.error('주문 상태 업데이트 실패:', error);
          }
        }

        // 계좌이체의 경우 리다이렉트 URL로 이동
        if (modalPaymentMethod === 'bank_transfer' && result.redirectUrl) {
          window.location.href = result.redirectUrl;
        }
      } else {
        // 결제 실패
        alert(`결제 실패: ${result.errorMessage}`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('결제 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // 결제 안한 구만 보여주기
  const visibleGroups = groupedItems.filter(
    (group) => !completedDistricts.includes(group.district)
  );

  return (
    <main className="min-h-screen bg-white pt-[5.5rem] bg-gray-100 lg:px-[10rem]">
      <Nav variant="default" className="bg-white" />

      <div className="container mx-auto px-4 sm:px-1 py-8 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-8">
        {/* 좌측 - 작업이름, 시안 업로드 및 구별 카드 */}
        <div className="space-y-8 border border-solid border-gray-3 rounded-[0.375rem] p-[2.5rem] sm:p-[1.5rem]">
          {/* 작업이름 입력 */}
          <section className="p-6 border rounded-lg shadow-sm flex flex-col gap-4 sm:p-2">
            <div className="flex items-center justify-between mb-4 border-b-solid border-black border-b-[0.1rem] pb-4">
              <h2 className="text-1.25 text-gray-2 font-bold">작업이름</h2>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="bulkProjectName"
                  checked={bulkApply.projectName}
                  onChange={handleBulkProjectNameToggle}
                  className="w-4 h-4"
                />
                <label
                  htmlFor="bulkProjectName"
                  className="text-sm text-gray-600"
                >
                  일괄적용
                </label>
              </div>
            </div>
            {/* 시안업로드 섹셕 */}
            {bulkApply.projectName && (
              <div className="flex flex-col sm:flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-4 sm:gap-2">
                <label className="w-full md:w-[9rem] text-gray-600 font-medium">
                  작업이름
                </label>
                <div className="flex flex-col gap-1">
                  <input
                    type="text"
                    value={tempProjectName}
                    onChange={(e) => {
                      setTempProjectName(e.target.value);
                      if (validationErrors.projectName) {
                        setValidationErrors((prev) => ({
                          ...prev,
                          projectName: '',
                        }));
                      }
                    }}
                    onBlur={() => {
                      setProjectName(tempProjectName);
                      if (bulkApply.projectName) {
                        applyBulkSettings();
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
            )}
          </section>

          {/* 시안 업로드 UI */}
          {bulkApply.projectName && (
            <section className="p-6 border rounded-lg shadow-sm flex flex-col gap-4 sm:p-2">
              <div className="flex items-center justify-between mb-4 border-b-solid border-black border-b-[0.1rem] pb-4">
                <h2 className="text-1.25 text-gray-2 font-bold">시안 업로드</h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="bulkFileUpload"
                      checked={bulkApply.fileUpload}
                      onChange={handleBulkFileUploadToggle}
                      className="w-4 h-4"
                    />
                    <label
                      htmlFor="bulkFileUpload"
                      className="text-sm text-gray-600"
                    >
                      파일 일괄적용
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="bulkEmailMethod"
                      checked={bulkApply.emailMethod}
                      onChange={handleBulkEmailMethodToggle}
                      className="w-4 h-4"
                    />
                    <label
                      htmlFor="bulkEmailMethod"
                      className="text-sm text-gray-600"
                    >
                      이메일 일괄적용
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-col md:flex-row items-start justify-between gap-2 md:gap-4 sm:gap-2">
                  <label className="w-full md:w-[9rem] text-gray-600 font-medium pt-2">
                    파일업로드
                  </label>
                  <div className="flex-1 space-y-2">
                    <CustomFileUpload
                      onFileSelect={handleFileSelect}
                      disabled={bulkApply.emailMethod}
                      placeholder="시안 파일을 선택해주세요"
                      className="w-full md:w-[21.25rem] sm:w-[13rem]"
                    />
                    <div className="flex flex-col gap-2 items-start">
                      {bulkApply.emailMethod && (
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
          )}
          {/* 구별 카드 */}
          {visibleGroups.map((group) => (
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
              {/* 구별 개별 입력 필드들 */}
              <div className="space-y-4 mb-4">
                {/* 일괄적용 정보 표시 */}
                {(bulkApply.projectName ||
                  bulkApply.fileUpload ||
                  bulkApply.emailMethod) && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">
                      일괄적용 설정
                    </h4>
                    <div className="space-y-1 text-sm text-blue-700">
                      {bulkApply.projectName && projectName && (
                        <div> 작업이름: {projectName}</div>
                      )}
                      {bulkApply.fileUpload && selectedFile && (
                        <div>📎 파일: {selectedFile.name}</div>
                      )}
                      {bulkApply.emailMethod && (
                        <div>📧 이메일: banner114@hanmail.net</div>
                      )}
                    </div>
                  </div>
                )}

                {/* 구별 작업이름 - 일괄적용이 꺼져있을 때만 표시 */}
                {!bulkApply.projectName && (
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                    <label className="w-full sm:w-[8rem] text-gray-600 font-medium text-sm">
                      작업이름
                    </label>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={groupStates[group.district]?.projectName || ''}
                        onChange={(e) =>
                          handleGroupProjectNameChange(
                            group.district,
                            e.target.value
                          )
                        }
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        placeholder="작업 이름을 입력하세요"
                      />
                    </div>
                  </div>
                )}

                {/* 구별 시안 업로드 - 일괄적용이 꺼져있을 때만 표시 */}
                {!bulkApply.projectName && (
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                    <label className="w-full sm:w-[8rem] text-gray-600 font-medium text-sm">
                      시안 업로드
                    </label>
                    <div className="flex-1 space-y-2">
                      <CustomFileUpload
                        onFileSelect={(file) =>
                          handleGroupFileSelect(group.district, file)
                        }
                        disabled={groupStates[group.district]?.sendByEmail}
                        placeholder="시안 파일을 선택해주세요"
                        className="w-full"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`email-${group.district}`}
                          checked={
                            groupStates[group.district]?.sendByEmail || false
                          }
                          onChange={(e) =>
                            handleGroupEmailSelect(
                              group.district,
                              e.target.checked
                            )
                          }
                          className="w-4 h-4"
                        />
                        <label
                          htmlFor={`email-${group.district}`}
                          className="text-sm text-gray-500"
                        >
                          이메일로 파일 보낼게요
                        </label>
                      </div>
                      {groupStates[group.district]?.sendByEmail && (
                        <p className="text-xs text-gray-500 ml-6">
                          banner114@hanmail.net로 시안을 보내드리겠습니다.
                        </p>
                      )}
                    </div>
                  </div>
                )}
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
                        {item.panel_code || item.panel_id || '-'} / 이름:{' '}
                        {item.name || '-'} / 구: {item.district}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              {/* 구별 상세 가격표 */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3 text-sm">
                  {group.district} 가격 상세
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">도로점용료:</span>
                    <span className="font-medium">
                      {group.items
                        .reduce(
                          (sum, item) =>
                            sum +
                            (item.panel_slot_snapshot?.road_usage_fee || 0),
                          0
                        )
                        .toLocaleString()}
                      원
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">광고료:</span>
                    <span className="font-medium">
                      {group.items
                        .reduce(
                          (sum, item) =>
                            sum +
                            (item.panel_slot_snapshot?.advertising_fee || 0),
                          0
                        )
                        .toLocaleString()}
                      원
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">부가세:</span>
                    <span className="font-medium">
                      {group.items
                        .reduce(
                          (sum, item) =>
                            sum + (item.panel_slot_snapshot?.tax_price || 0),
                          0
                        )
                        .toLocaleString()}
                      원
                    </span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>총 결제 금액:</span>
                      <span className="text-blue-700">
                        {group.totalPrice.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 결제 버튼 */}
              <div className="mt-2">
                {/* 결제 조건 확인 */}
                {(() => {
                  const groupState = groupStates[group.district];
                  const hasProjectName =
                    groupState?.projectName &&
                    groupState.projectName.trim() !== '';
                  const hasFileUploadMethod =
                    groupState?.selectedFile || groupState?.sendByEmail;
                  const hasAgreedToTerms = isAgreedCaution;

                  const isButtonEnabled =
                    hasProjectName && hasFileUploadMethod && hasAgreedToTerms;

                  return (
                    <>
                      <Button
                        onClick={() => setPaymentModalOpen(group.district)}
                        disabled={!isButtonEnabled}
                        className={`w-full py-2 rounded-lg ${
                          isButtonEnabled
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        {group.district} 결제하기
                      </Button>

                      {/* 조건 미충족 시 안내 메시지 */}
                      {!isButtonEnabled && (
                        <div className="mt-2 text-xs text-red">
                          {!hasProjectName && (
                            <div>• 작업이름을 입력해주세요</div>
                          )}
                          {!hasFileUploadMethod && (
                            <div>• 파일 업로드 방법을 선택해주세요</div>
                          )}
                          {!hasAgreedToTerms && (
                            <div>• 유의사항에 동의해주세요</div>
                          )}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </section>
          ))}
        </div>
        {/* 우측 - 유의사항 및 전체 가격 정보 */}
        <div className="space-y-8 border border-solid border-gray-3 rounded-[0.375rem] p-[2.5rem] sm:p-[1.5rem]">
          {/* 유의사항 */}
          <section className="p-6 border rounded-lg shadow-sm">
            <h2 className="text-1.25 text-gray-2 font-bold mb-4 border-b-solid border-black border-b-[0.1rem] pb-4">
              유의사항
            </h2>
            <div className="space-y-4">
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
                    사채, 대부업, 채권추심등에 관련된 내용, 시민정서에 적합하지
                    않은 내용
                  </li>
                  <li>
                    특정 개인, 단체 등의 가치관을 비방 또는 홍보하려는 내용
                  </li>
                  <li>
                    기타 반사회적 내용 또는 시민정서에 적합하지 않다고 판단되는
                    내용
                  </li>
                </ul>

                <h4 className="font-semibold text-gray-800 mb-3">
                  현수막 게시의 지연 또는 일시 중지
                </h4>
                <ul className="text-sm text-gray-700 space-y-2 mb-4">
                  <li>
                    • 법정공휴일 또는 강풍, 우천, 폭설 시에는 현수막 게시 일정이
                    전후날로 변경 될 수 있습니다.
                  </li>
                  <li>
                    • 현수막 게시 기간 중, 태풍, 재난, 긴급 공사 등의 사유가
                    발생할 때에는 광고주에게 사전 통보 없이 게시를 일시 중지 할
                    수 있습니다.
                  </li>
                </ul>

                <div className=" border border-red-200 p-3 rounded">
                  <h4 className="font-semibold text-red mb-2">[유의사항]</h4>
                  <p className="text-sm text-red">
                    현수막게시대 게시 신청 시 아래 규약사항을 반드시 숙지하시기
                    바라며, 숙지하지 못한 책임은 신청인에게 있습니다. 또한 관련
                    규정을 위반한 경우에도 신청 및 게시가 불가합니다.
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
          </section>

          {/* 전체 가격 정보 */}
          <section className="p-6 border rounded-lg shadow-sm">
            <h2 className="text-1.25 text-gray-2 font-bold mb-4 border-b-solid border-black border-b-[0.1rem] pb-4">
              전체 가격 정보
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
        </div>
      </div>

      {/* 구별 결제 모달 */}
      {paymentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">{paymentModalOpen} 결제</h3>

            {/* 결제 방법 선택 */}
            <div className="mb-4">
              <PaymentMethodSelector
                selectedMethod={modalPaymentMethod}
                onMethodChange={setModalPaymentMethod}
                disabled={isProcessingPayment}
              />
            </div>

            {/* 세금계산서 */}
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="modal-tax"
                  checked={modalTaxInvoice}
                  onChange={(e) => setModalTaxInvoice(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="modal-tax">세금계산서 발급을 원합니다</label>
              </div>
            </div>

            {/* 결제 금액 */}
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <div className="flex justify-between font-semibold">
                <span>결제 금액:</span>
                <span>
                  {groupedItems
                    .find((g) => g.district === paymentModalOpen)
                    ?.totalPrice.toLocaleString()}
                  원
                </span>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex gap-2">
              <Button
                onClick={() => setPaymentModalOpen(null)}
                className="flex-1 bg-gray-500 text-white py-2 rounded"
              >
                취소
              </Button>
              <Button
                onClick={async () => {
                  const group = groupedItems.find(
                    (g) => g.district === paymentModalOpen
                  );
                  if (group) {
                    await handleSingleGroupPayment(group);
                  }
                }}
                disabled={isProcessingPayment}
                className="flex-1 bg-blue-600 text-white py-2 rounded"
              >
                {isProcessingPayment ? '결제 처리 중...' : '결제하기'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 결제 성공 모달 */}
      {successModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-8 shadow-lg w-full max-w-xs flex flex-col items-center">
            <div className="text-2xl font-bold mb-2 text-blue-700">
              결제 완료
            </div>
            <div className="mb-6 text-center text-gray-700">
              {successDistrict} 결제가 완료되었습니다.
            </div>
            <div className="flex gap-2 w-full">
              <button
                className="flex-1 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => setSuccessModalOpen(false)}
              >
                결제페이지로 돌아가기
              </button>
              <button
                className="flex-1 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                onClick={() => router.push('/mypage/orders')}
              >
                마이페이지로 가기
              </button>
            </div>
          </div>
        </div>
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
