'use client';
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Button } from '@/src/components/button/button';
import Nav from '@/src/components/layouts/nav';
import { useAuth } from '@/src/contexts/authContext';
import { useCart } from '@/src/contexts/cartContext';
import { useProfile } from '@/src/contexts/profileContext';
import { useSearchParams } from 'next/navigation';
import { CartItem } from '@/src/contexts/cartContext';
import CustomFileUpload from '@/src/components/ui/CustomFileUpload';
// import Image from 'next/image';
// PaymentMethodSelector import 제거 - 바로 토스 위젯 사용
// processPayment import 제거 - 토스 위젯에서 직접 처리

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
  // 상하반기 정보 추가
  halfPeriod?: 'first_half' | 'second_half';
  selectedYear?: number;
  selectedMonth?: number;
  periodText?: string;
}

function PaymentPageContent() {
  const { user } = useAuth();
  const { cart } = useCart();
  const { profiles } = useProfile();
  // router 제거 - 토스 위젯에서 직접 처리
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

  // 구별 + 상하반기별 개별 상태 관리
  const [groupStates, setGroupStates] = useState<{
    [groupKey: string]: {
      projectName: string;
      selectedFile: File | null;
      sendByEmail: boolean;
      fileName: string | null;
      fileSize: number | null;
      fileType: string | null;
      emailAddress: string | null;
    };
  }>({});

  // 토스 위젯 상태
  const [tossWidgetOpen, setTossWidgetOpen] = useState(false);
  const [tossWidgetData, setTossWidgetData] = useState<GroupedCartItem | null>(
    null
  );

  // 세금계산서 상태
  const [modalTaxInvoice, setModalTaxInvoice] = useState(false);

  // 결제 처리 상태
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isProcessing, setIsProcessing] = useState(false);
  // completedDistricts, successModalOpen, successDistrict 제거 - 토스 위젯에서 직접 처리

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

  // 구별 + 상하반기별 상태 업데이트 핸들러들
  const handleGroupProjectNameChange = (groupKey: string, value: string) => {
    setGroupStates((prev) => ({
      ...prev,
      [groupKey]: {
        ...prev[groupKey],
        projectName: value,
      },
    }));
  };

  const handleGroupFileSelect = (groupKey: string, file: File) => {
    setGroupStates((prev) => ({
      ...prev,
      [groupKey]: {
        ...prev[groupKey],
        selectedFile: file,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        sendByEmail: false,
      },
    }));
  };

  const handleGroupEmailSelect = (groupKey: string, isEmail: boolean) => {
    setGroupStates((prev) => ({
      ...prev,
      [groupKey]: {
        ...prev[groupKey],
        sendByEmail: isEmail,
        emailAddress: isEmail ? 'banner114@hanmail.net' : null,
        selectedFile: null,
        fileName: null,
        fileSize: null,
        fileType: null,
      },
    }));
  };

  // 일괄적용 실행 함수 (useCallback으로 안정화)
  const applyBulkSettings = useCallback(() => {
    if (bulkApply.projectName && projectName) {
      groupedItems.forEach((group) => {
        handleGroupProjectNameChange(group.id, projectName);
      });
    }

    if (bulkApply.fileUpload && selectedFile) {
      // 파일 일괄적용이 켜져있고 파일이 선택되어 있으면 모든 그룹에 적용
      groupedItems.forEach((group) => {
        handleGroupFileSelect(group.id, selectedFile);
      });
    }

    if (bulkApply.emailMethod) {
      // 이메일 일괄적용이 켜져있으면 모든 그룹에 이메일 방식 적용
      groupedItems.forEach((group) => {
        handleGroupEmailSelect(group.id, true);
      });
    }
  }, [bulkApply, projectName, selectedFile, groupedItems]);

  // 일괄적용 상태 변경 시 자동 적용 (무한 루프 방지)
  useEffect(() => {
    // groupedItems가 있을 때만 실행
    if (groupedItems.length > 0) {
      applyBulkSettings();
    }
  }, [applyBulkSettings, groupedItems.length]);

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

  // Direct 모드일 때 프로필 정보가 로드된 후 그룹화 다시 수행
  useEffect(() => {
    const directParam = searchParams.get('direct');
    if (
      directParam === 'true' &&
      selectedItems.length > 0 &&
      userProfiles.length > 0 &&
      !projectName // 프로젝트명이 아직 설정되지 않은 경우에만 실행
    ) {
      console.log('🔍 Direct mode: re-grouping items with loaded profiles');
      const grouped = groupItemsByDistrict(selectedItems, true);
      setGroupedItems(grouped);

      // 기본 프로젝트 이름 설정 (현재 날짜 + 기본 프로필 회사명)
      const defaultProfile =
        userProfiles.find((profile) => profile.is_default) || userProfiles[0];

      console.log('🔍 Direct mode - defaultProfile:', defaultProfile);
      console.log(
        '🔍 Direct mode - company_name:',
        defaultProfile?.company_name
      );

      const today = new Date();
      const dateStr = `${today.getFullYear()}년 ${
        today.getMonth() + 1
      }월 ${today.getDate()}일`;

      // company_name이 undefined이거나 빈 문자열일 때 '광고'로 대체
      let companyName = '광고';
      if (
        defaultProfile?.company_name &&
        defaultProfile.company_name.trim() !== ''
      ) {
        companyName = defaultProfile.company_name;
      }

      console.log('🔍 Direct mode - final companyName:', companyName);

      const defaultProjectName = `${companyName} ${dateStr}`;

      console.log('🔍 Direct mode - defaultProjectName:', defaultProjectName);

      setProjectName(defaultProjectName);
      setTempProjectName(defaultProjectName);

      // 일괄적용 활성화
      setBulkApply((prev) => ({
        ...prev,
        projectName: true,
        fileUpload: true,
      }));
    }
  }, [userProfiles, selectedItems, searchParams, projectName]);

  // 묶음 결제를 위한 아이템 그룹화 함수 (useCallback으로 안정화)
  const groupItemsByDistrict = useCallback(
    (items: CartItem[], isDirectMode = false): GroupedCartItem[] => {
      // 구별 + 상하반기별로 그룹화
      const grouped: { [key: string]: CartItem[] } = {};

      items.forEach((item) => {
        // 상하반기 정보 생성
        const halfPeriod = item.halfPeriod || 'first_half';
        const year = item.selectedYear || new Date().getFullYear();
        const month = item.selectedMonth || new Date().getMonth() + 1;

        // 그룹 키: 구_상하반기_년월
        const groupKey = `${item.district}_${halfPeriod}_${year}_${month}`;

        if (!grouped[groupKey]) grouped[groupKey] = [];
        grouped[groupKey].push(item);
      });

      return Object.entries(grouped).map(([groupKey, group]) => {
        const firstItem = group[0];
        const totalPrice = group.reduce(
          (sum, item) => sum + (item.price || 0),
          0
        );

        // 상하반기 표시 텍스트 생성
        const halfPeriod = firstItem.halfPeriod || 'first_half';
        const year = firstItem.selectedYear || new Date().getFullYear();
        const month = firstItem.selectedMonth || new Date().getMonth() + 1;
        const periodText = `${year}년 ${month}월 ${
          halfPeriod === 'first_half' ? '상반기' : '하반기'
        }`;

        // Direct 모드인 경우 기본 프로필 정보를 우선적으로 사용
        const profileToUse = isDirectMode ? defaultProfile : null;

        return {
          id: `group_${groupKey}`,
          name: `${firstItem.district} 현수막게시대`,
          items: group,
          totalPrice,
          district: firstItem.district,
          type: 'banner-display',
          panel_type: firstItem.panel_type || 'panel',
          is_public_institution:
            firstItem.is_public_institution ||
            profileToUse?.is_public_institution,
          is_company: firstItem.is_company || profileToUse?.is_company,
          user_profile_id:
            firstItem.user_profile_id || profileToUse?.id || defaultProfile?.id,
          contact_person_name:
            firstItem.contact_person_name ||
            profileToUse?.contact_person_name ||
            defaultProfile?.contact_person_name,
          phone:
            firstItem.phone || profileToUse?.phone || defaultProfile?.phone,
          company_name:
            firstItem.company_name ||
            profileToUse?.company_name ||
            defaultProfile?.company_name,
          email:
            firstItem.email || profileToUse?.email || defaultProfile?.email,
          // 상하반기 정보 추가
          halfPeriod,
          selectedYear: year,
          selectedMonth: month,
          periodText,
        };
      });
    },
    [userProfiles]
  );

  // URL 파라미터에서 선택된 아이템 ID들 가져오기
  useEffect(() => {
    const itemsParam = searchParams.get('items');
    const approvedParam = searchParams.get('approved');
    const orderIdParam = searchParams.get('orderId');
    const directParam = searchParams.get('direct');
    console.log('🔍 Payment page - itemsParam:', itemsParam);
    console.log('🔍 Payment page - approvedParam:', approvedParam);
    console.log('🔍 Payment page - orderIdParam:', orderIdParam);
    console.log('🔍 Payment page - directParam:', directParam);
    console.log('🔍 Payment page - cart:', cart);

    if (approvedParam === 'true') {
      setIsApprovedOrder(true);
    }

    // 주문 ID가 있는 경우 (결제대기 주문)
    if (orderIdParam) {
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
          const fetchApprovedOrderItems = async (orderNumber: string) => {
            const directParam = searchParams.get('direct');
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

                // 묶음 결제를 위한 그룹화 (direct 모드 여부 전달)
                const grouped = groupItemsByDistrict(
                  orderItems,
                  directParam === 'true'
                );
                setGroupedItems(grouped);
              }
            } catch (error) {
              console.error('Failed to fetch approved order items:', error);
            }
          };

          fetchApprovedOrderItems(selectedItemIds[0]);
        } else {
          const items = cart.filter((item) =>
            selectedItemIds.includes(item.id)
          );
          console.log('🔍 Payment page - filtered items:', items);
          setSelectedItems(items);

          // 묶음 결제를 위한 그룹화 (direct 모드 여부 전달)
          const grouped = groupItemsByDistrict(items, directParam === 'true');
          setGroupedItems(grouped);

          // direct=true인 경우 기본 프로필 정보를 아이템들에 자동 설정
          if (directParam === 'true') {
            console.log('🔍 Direct mode: applying default profile to items');
          }
        }
      } catch (error) {
        console.error('Error parsing selected items:', error);
        // setError('선택된 상품 정보를 불러오는데 실패했습니다.'); // Removed setError
      }
    } else {
      console.log('🔍 Payment page - no items param found');
    }
  }, [searchParams, cart, isApprovedOrder, groupItemsByDistrict]);

  // // selectedItems 상태 변경 감지 (디버깅용 - 주기적 실행 방지)
  // useEffect(() => {
  //   // selectedItems가 비어있고 cart도 비어있을 때만 경고 (무한 루프 방지)
  //   if (selectedItems.length === 0 && cart.length === 0) {
  //     console.warn('🔍 WARNING: selectedItems와 cart가 모두 비어있음!');
  //     console.warn('🔍 현재 URL params:', searchParams.get('items'));
  //   }
  // }, [selectedItems.length, cart.length, searchParams]);

  // // selectedFile 상태 변경 감지
  // useEffect(() => {
  //   console.log('🔍 selectedFile 상태 변경됨:', selectedFile?.name || '없음');
  // }, [selectedFile]);

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
      profiles?.[0] ||
      null; // 명시적으로 null 반환

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

  // handleSingleGroupPayment 함수 제거 - 바로 토스 위젯 사용

  // 토스 위젯 열기 함수
  const openTossWidget = (group: GroupedCartItem) => {
    setTossWidgetData(group);
    setTossWidgetOpen(true);
  };

  // 토스 위젯 초기화
  useEffect(() => {
    if (tossWidgetOpen && tossWidgetData) {
      const initializeTossWidget = async () => {
        try {
          // 토스페이먼츠 SDK 동적 로드
          const { loadTossPayments, ANONYMOUS } = await import(
            '@tosspayments/tosspayments-sdk'
          );

          const tossPayments = await loadTossPayments(
            'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm' // 테스트 키
          );

          const widgets = tossPayments.widgets({
            customerKey: ANONYMOUS,
          });

          // 결제 금액 설정
          await widgets.setAmount({
            currency: 'KRW',
            value: tossWidgetData.totalPrice,
          });

          // 위젯 렌더링
          await Promise.all([
            widgets.renderPaymentMethods({
              selector: '#toss-payment-methods',
              variantKey: 'DEFAULT',
            }),
            widgets.renderAgreement({
              selector: '#toss-agreement',
              variantKey: 'AGREEMENT',
            }),
          ]);

          // 결제 요청 버튼 이벤트 리스너
          const paymentButton = document.createElement('button');
          paymentButton.textContent = '결제하기';
          paymentButton.className =
            'w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700';

          paymentButton.addEventListener('click', async () => {
            try {
              const randomId =
                Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15);
              const testOrderId = `test_${Date.now()}_${randomId}`;

              // 전화번호 정리 (숫자만 남기기)
              const sanitizedPhone = (
                tossWidgetData.phone || '010-0000-0000'
              ).replace(/\D/g, '');

              await widgets.requestPayment({
                orderId: testOrderId,
                orderName: `${tossWidgetData.district} 현수막게시대`,
                successUrl: `${window.location.origin}/payment/success?orderId=${testOrderId}`,
                failUrl: `${window.location.origin}/payment/fail?orderId=${testOrderId}`,
                customerEmail: tossWidgetData.email || 'customer@example.com',
                customerName: tossWidgetData.contact_person_name || '고객',
                customerMobilePhone: sanitizedPhone,
              });
            } catch (err) {
              console.error('결제 요청 실패:', err);
              alert('결제 요청 중 오류가 발생했습니다.');
            }
          });

          // 결제 버튼을 버튼 컨테이너에 추가
          const buttonContainer = document.getElementById(
            'toss-payment-button'
          );
          if (buttonContainer) {
            buttonContainer.innerHTML = '';
            buttonContainer.appendChild(paymentButton);
          }
        } catch (error) {
          console.error('토스 위젯 초기화 실패:', error);

          // 에러 발생 시 사용자에게 알림
          const container = document.getElementById('toss-payment-methods');
          if (container) {
            container.innerHTML = `
              <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div class="text-red-800 font-medium">토스 위젯 로딩 실패</div>
                <div class="text-red-600 text-sm mt-1">결제 위젯을 불러오는데 실패했습니다. 페이지를 새로고침해주세요.</div>
              </div>
            `;
          }
        }
      };

      initializeTossWidget();
    }
  }, [tossWidgetOpen, tossWidgetData]);

  // 모든 그룹 보여주기 (토스 위젯에서 직접 처리)
  const visibleGroups = groupedItems;

  return (
    <main className="min-h-screen bg-white pt-[5.5rem] bg-gray-100 lg:px-[10rem]">
      <Nav variant="default" className="bg-white" />

      <div className="container mx-auto px-4 sm:px-1 py-8 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-8">
        {/* Direct 모드 안내 메시지 */}
        {searchParams.get('direct') === 'true' && (
          <div className="col-span-full mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-blue-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-blue-800 font-medium">
                빠른 신청 모드: 기본 프로필 정보가 자동으로 설정되었습니다.
                필요시 수정해주세요.
              </span>
            </div>
          </div>
        )}

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
                          banner114@hanmail.net로 시안을 보내주세요.
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
                {/* 구별 작업이름 - 일괄적용이 꺼져있을 때만 표시 */}
                {!bulkApply.projectName && (
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                    <label className="w-full sm:w-[8rem] text-gray-600 font-medium text-sm">
                      작업이름
                    </label>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={groupStates[group.id]?.projectName || ''}
                        onChange={(e) =>
                          handleGroupProjectNameChange(group.id, e.target.value)
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
                          handleGroupFileSelect(group.id, file)
                        }
                        disabled={groupStates[group.id]?.sendByEmail}
                        placeholder="시안 파일을 선택해주세요"
                        className="w-full"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`email-${group.id}`}
                          checked={groupStates[group.id]?.sendByEmail || false}
                          onChange={(e) =>
                            handleGroupEmailSelect(group.id, e.target.checked)
                          }
                          className="w-4 h-4"
                        />
                        <label
                          htmlFor={`email-${group.id}`}
                          className="text-sm text-gray-500"
                        >
                          이메일로 파일 보낼게요
                        </label>
                      </div>
                      {groupStates[group.id]?.sendByEmail && (
                        <p className="text-xs text-gray-500 ml-6">
                          banner114@hanmail.net로 시안을 보내주세요.
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
                  {group.items.map((item, index) => {
                    // 상하반기 정보 표시
                    const itemHalfPeriod = item.halfPeriod || 'first_half';
                    const itemYear =
                      item.selectedYear || new Date().getFullYear();
                    const itemMonth =
                      item.selectedMonth || new Date().getMonth() + 1;
                    const itemPeriodText = `${itemYear}년 ${itemMonth}월 ${
                      itemHalfPeriod === 'first_half' ? '상반기' : '하반기'
                    }`;

                    return (
                      <div
                        key={item.id}
                        className="text-sm text-gray-600 flex flex-col sm:flex-row sm:justify-between items-center"
                      >
                        <span>
                          {index + 1}. 패널번호:{' '}
                          {item.panel_code || item.panel_id || '-'} / 이름:{' '}
                          {item.name || '-'} / 구: {item.district} / 기간:{' '}
                          {itemPeriodText}
                        </span>
                      </div>
                    );
                  })}
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
              {/* 결제 버튼 */}
              <div className="mt-2">
                {/* 결제 조건 확인 */}
                {(() => {
                  const groupState = groupStates[group.id];
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
                        onClick={() => openTossWidget(group)}
                        disabled={!isButtonEnabled}
                        className={`w-full py-2 rounded-lg ${
                          isButtonEnabled
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        {group.name} 결제하기
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

              {/* 환불 규정 사항 */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
                <h4 className="font-semibold text-gray-800 mb-3">
                  현수막 지정게시대 환불규정사항
                </h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>
                    · 현수막 접수일 기준(주말·공휴일 제외)으로 3일내에 입금 및
                    결제를 진행해야 합니다.
                  </li>
                  <li>
                    · 결제기간 내 결제하지 않을 시 통보 후 기간 조율 또는 취소를
                    진행할 수 있습니다.
                  </li>
                  <li>· 게시일 기준 2주 전까지는 100% 환불할 수 있습니다.</li>
                  <li>
                    · 디자인 조율 후 출력 및 제작이 들어간 상태라면 출력비용을
                    제외하고 환불받을 수 있습니다.
                  </li>
                  <li>
                    · 출력 후 게시 준비까지 마무리되었다면 환불을 받을 수
                    없습니다.
                  </li>
                  <li>
                    · 게시 후, 단순 변심으로 인한 게시 취소일 경우
                    철거비용(인건비와 장비비용)을 지불하고 철거해야 합니다.
                  </li>
                  <li>
                    · 게시물 허용한 내용이 미관을 해치거나 혐오를 줄 수 있는
                    내용일 시 강제취소를 통보받을 수 있으며 환불을 진행받을 수
                    있습니다.
                  </li>
                </ul>
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

      {/* 토스 위젯 모달 */}
      {tossWidgetOpen && tossWidgetData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">토스페이먼츠 결제</h2>
              <button
                onClick={() => {
                  setTossWidgetOpen(false);
                  setTossWidgetData(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded">
              <div className="flex justify-between font-semibold">
                <span>결제 금액:</span>
                <span>{tossWidgetData.totalPrice.toLocaleString()}원</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {tossWidgetData.district} 현수막게시대
              </div>
            </div>

            {/* 토스 위젯이 렌더링될 영역 */}
            <div className="space-y-4">
              <div id="toss-payment-methods" className="min-h-[200px]">
                {/* 토스 위젯이 여기에 렌더링됩니다 */}
              </div>

              <div id="toss-agreement" className="min-h-[100px]">
                {/* 토스 위젯 약관이 여기에 렌더링됩니다 */}
              </div>

              <div id="toss-payment-button" className="mt-4">
                {/* 결제 버튼이 여기에 동적으로 추가됩니다 */}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 결제 성공 모달 제거 - 토스 위젯에서 직접 처리 */}
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
