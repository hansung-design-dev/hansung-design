'use client';
import React, {
  useState,
  useEffect,
  useCallback,
  Suspense,
  useRef,
} from 'react';
import { Button } from '@/src/components/button/button';
import Nav from '@/src/components/layouts/nav';
import { useAuth } from '@/src/contexts/authContext';
import { useCart } from '@/src/contexts/cartContext';
import { useProfile } from '@/src/contexts/profileContext';
import { useSearchParams } from 'next/navigation';
import { CartItem } from '@/src/contexts/cartContext';
import CustomFileUpload from '@/src/components/ui/CustomFileUpload';
import type { BankAccountInfo, GroupedCartItem, UserProfile } from './_types';
import BankTransferModal from './_components/BankTransferModal';
import TossPaymentModal from './_components/TossPaymentModal';
// import Image from 'next/image';
// PaymentMethodSelector import 제거 - 바로 토스 위젯 사용
// processPayment import 제거 - 토스 위젯에서 직접 처리

const PENDING_PAYMENT_ITEMS_KEY = 'pending_payment_items';

// 관악구 이전 디자인 동일 할인 가격
const GWANAK_PREVIOUS_DESIGN_PRICE = 78000;

const buildPaymentDebugMetadata = (
  label: string,
  details: Record<string, unknown> = {}
) => {
  const base = {
    label,
    timestamp: new Date().toISOString(),
    ...(typeof window !== 'undefined'
      ? {
          userAgent: navigator.userAgent,
          userActivation: navigator.userActivation?.hasBeenActive,
          documentHasFocus: document.hasFocus?.() ?? true,
          origin: window.location.origin,
          href: window.location.href,
        }
      : {}),
    ...details,
  };

  return base;
};

const logPaymentDebug = (
  label: string,
  details: Record<string, unknown> = {}
) => {
  if (typeof window === 'undefined') return;
  const title = `🧩 [결제 디버그] ${label}`;
  console.groupCollapsed(title);
  console.log(buildPaymentDebugMetadata(label, details));
  console.groupEnd();
};

// #region agent log - ndjson ingest helper
const __DEBUG_INGEST_URL__ =
  'http://127.0.0.1:7242/ingest/de0826ba-4e91-43eb-b001-5614ace69b75';

type AgentDebugPayload = {
  sessionId: string;
  runId: string;
  hypothesisId: 'A' | 'B' | 'C' | 'D' | 'E';
  location: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: number;
};

const postAgentDebugLog = (payload: AgentDebugPayload) => {
  if (typeof window === 'undefined') return;
  // HTTPS 페이지에서 HTTP로 요청하면 브라우저가 Mixed Content로 차단함
  // 로컬 HTTPS(dev) 사용 시 디버그 ingest는 자동 스킵 (기능에는 영향 없음)
  if (
    window.location.protocol === 'https:' &&
    __DEBUG_INGEST_URL__?.startsWith('http://')
  ) {
    return;
  }
  fetch(__DEBUG_INGEST_URL__, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {});
};
// #endregion

function PaymentPageContent() {
  const { user } = useAuth();
  const { cart, dispatch: cartDispatch } = useCart();
  const { profiles } = useProfile();
  // router 제거 - 토스 위젯에서 직접 처리
  const searchParams = useSearchParams();
  const itemsParam = searchParams.get('items');
  const encodedItemsParam = itemsParam ? encodeURIComponent(itemsParam) : null;

  const [selectedItems, setSelectedItems] = useState<CartItem[]>([]);
  const [groupedItems, setGroupedItems] = useState<GroupedCartItem[]>([]);
  const [isApprovedOrder, setIsApprovedOrder] = useState(false);
  const [cartUpdated, setCartUpdated] = useState(false); // cart 업데이트 플래그
  const [isAgreedCaution, setIsAgreedCaution] = useState(false);
  const [projectName, setProjectName] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      adContent: string;
      selectedFile: File | null;
      sendByEmail: boolean;
      fileName: string | null;
      fileSize: number | null;
      fileType: string | null;
      emailAddress: string | null;
      usePreviousDesign: boolean;
      selfMadeReuse: boolean; // 자체제작/1회 재사용 (관악구 할인용)
      mapoFreeInstall: boolean; // 마포구 저단형 무료 설치 (행정용)
    };
  }>({});

  // 아이템별 시안 업로드 상태 관리
  const [itemStates, setItemStates] = useState<{
    [itemId: string]: {
      projectName: string;
      adContent: string;
      selectedFile: File | null;
      sendByEmail: boolean;
      fileName: string | null;
      fileSize: number | null;
      fileType: string | null;
      emailAddress: string | null;
      usePreviousDesign: boolean;
      selfMadeReuse: boolean; // 자체제작/1회 재사용 (관악구 할인용)
      mapoFreeInstall: boolean; // 마포구 저단형 무료 설치 (행정용)
    };
  }>({});

  const [draftUploadCache, setDraftUploadCache] = useState<{
    group: Record<string, { sig: string; draftId: string }>;
    item: Record<string, { sig: string; draftId: string }>;
  }>({ group: {}, item: {} });

  const draftUploadInFlightRef = useRef<Set<string>>(new Set());
  const debugRunIdRef = useRef(
    `payment_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`
  );

  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [bankModalGroup, setBankModalGroup] = useState<GroupedCartItem | null>(
    null
  );
  const [bankAccountInfo, setBankAccountInfo] =
    useState<BankAccountInfo | null>(null);
  const [bankModalLoading, setBankModalLoading] = useState(false);
  const [bankModalError, setBankModalError] = useState<string | null>(null);
  const [isBankTransferProcessing, setIsBankTransferProcessing] =
    useState(false);
  const [depositorName, setDepositorName] = useState('');

  // 자체제작 유의사항 (관악구 등 구별 공지사항)
  const [selfMadeNotices, setSelfMadeNotices] = useState<{
    [district: string]: { title: string; items: { text: string; important: boolean }[] }[];
  }>({});

  // 일반 유의사항 (구별 공통 공지사항 - 항상 표시)
  const [generalNotices, setGeneralNotices] = useState<{
    [district: string]: { title: string; items: { text: string; important: boolean }[] }[];
  }>({});

  // 마포구 저단형 무료 설치 유의사항 (행정용)
  const [mapoFreeInstallNotices, setMapoFreeInstallNotices] = useState<{
    [district: string]: { title: string; items: { text: string; important: boolean }[] }[];
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

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleGlobalError = (event: ErrorEvent) => {
      logPaymentDebug('전역 에러 이벤트', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });

      // #region agent log - hypothesis A (global error / CSP / script load)
      postAgentDebugLog({
        sessionId: 'debug-session',
        runId: debugRunIdRef.current,
        hypothesisId: 'A',
        location: 'src/app/payment/page.tsx:global-error',
        message: 'window.error',
        data: {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          errorName:
            typeof event.error?.name === 'string'
              ? event.error.name
              : undefined,
          errorMessage:
            typeof event.error?.message === 'string'
              ? event.error.message
              : undefined,
          stack:
            typeof event.error?.stack === 'string'
              ? event.error.stack.slice(0, 800)
              : undefined,
          userAgent: navigator.userAgent,
        },
        timestamp: Date.now(),
      });
      // #endregion
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logPaymentDebug('처리되지 않은 프로미스 예외', {
        reason: event.reason,
      });

      // #region agent log - hypothesis A (unhandled rejection)
      const reason = event.reason as unknown;
      postAgentDebugLog({
        sessionId: 'debug-session',
        runId: debugRunIdRef.current,
        hypothesisId: 'A',
        location: 'src/app/payment/page.tsx:unhandledrejection',
        message: 'window.unhandledrejection',
        data: {
          reasonType: typeof reason,
          reasonName:
            reason && typeof reason === 'object' && 'name' in reason
              ? String((reason as { name?: unknown }).name)
              : undefined,
          reasonMessage:
            reason && typeof reason === 'object' && 'message' in reason
              ? String((reason as { message?: unknown }).message)
              : typeof reason === 'string'
              ? reason
              : undefined,
          userAgent: navigator.userAgent,
        },
        timestamp: Date.now(),
      });
      // #endregion
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener(
        'unhandledrejection',
        handleUnhandledRejection
      );
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // #region agent log - hypothesis C (device/env perf characteristics)
    const nav = navigator as unknown as {
      deviceMemory?: number;
      hardwareConcurrency?: number;
      connection?: { effectiveType?: string; saveData?: boolean };
    };
    postAgentDebugLog({
      sessionId: 'debug-session',
      runId: debugRunIdRef.current,
      hypothesisId: 'C',
      location: 'src/app/payment/page.tsx:env',
      message: 'payment page env snapshot',
      data: {
        userAgent: navigator.userAgent,
        deviceMemory: nav.deviceMemory,
        hardwareConcurrency: nav.hardwareConcurrency,
        effectiveType: nav.connection?.effectiveType,
        saveData: nav.connection?.saveData,
        hasUserActivation: !!navigator.userActivation,
      },
      timestamp: Date.now(),
    });
    // #endregion

    // #region agent log - hypothesis C (long tasks)
    try {
      if (typeof PerformanceObserver !== 'undefined') {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const durations = entries
            .map((e) => Number(e.duration))
            .filter((n) => Number.isFinite(n));
          const maxDuration = durations.length ? Math.max(...durations) : 0;
          postAgentDebugLog({
            sessionId: 'debug-session',
            runId: debugRunIdRef.current,
            hypothesisId: 'C',
            location: 'src/app/payment/page.tsx:longtask',
            message: 'longtask observed',
            data: { count: entries.length, maxDuration },
            timestamp: Date.now(),
          });
        });
        observer.observe({ entryTypes: ['longtask'] });
        return () => observer.disconnect();
      }
    } catch {
      // ignore
    }
    // #endregion
  }, []);

  useEffect(() => {
    logPaymentDebug('결제 페이지 마운트됨', {
      cartLength: cart.length,
    });
  }, [cart.length]);

  useEffect(() => {
    if (bankModalOpen && bankModalGroup) {
      logPaymentDebug('계좌이체 모달 표시', {
        groupId: bankModalGroup.id,
        district: bankModalGroup.district,
        groupTotal: bankModalGroup.totalPrice,
        modalError: bankModalError,
      });
    }
  }, [bankModalOpen, bankModalGroup, bankModalError]);

  useEffect(() => {
    if (tossWidgetOpen && tossWidgetData) {
      logPaymentDebug('토스 결제 모달 표시', {
        groupId: tossWidgetData.id,
        district: tossWidgetData.district,
        itemsCount: tossWidgetData.items.length,
        totalPrice: tossWidgetData.totalPrice,
      });
    }
  }, [tossWidgetOpen, tossWidgetData]);

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

  const handleGroupAdContentChange = (groupKey: string, value: string) => {
    setGroupStates((prev) => ({
      ...prev,
      [groupKey]: {
        ...prev[groupKey],
        adContent: value,
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

  // 아이템별 시안 업로드 핸들러들
  const handleItemFileSelect = (itemId: string, file: File) => {
    setItemStates((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        projectName: prev[itemId]?.projectName || '',
        selectedFile: file,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        sendByEmail: false,
        emailAddress: null,
      },
    }));
  };

  const handleItemEmailSelect = (itemId: string, isEmail: boolean) => {
    setItemStates((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        projectName: prev[itemId]?.projectName || '',
        sendByEmail: isEmail,
        emailAddress: isEmail ? 'banner114@hanmail.net' : null,
        selectedFile: null,
        fileName: null,
        fileSize: null,
        fileType: null,
      },
    }));
  };

  // 그룹별 이전 디자인 동일 체크 핸들러
  const handleGroupPreviousDesignSelect = (groupKey: string, isChecked: boolean) => {
    setGroupStates((prev) => ({
      ...prev,
      [groupKey]: {
        ...prev[groupKey],
        usePreviousDesign: isChecked,
      },
    }));
  };

  // 아이템별 이전 디자인 동일 체크 핸들러
  const handleItemPreviousDesignSelect = (itemId: string, isChecked: boolean) => {
    setItemStates((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        usePreviousDesign: isChecked,
      },
    }));
  };

  // 그룹별 자체제작/1회 재사용 체크 핸들러 (관악구 할인용)
  const handleGroupSelfMadeReuseSelect = (groupKey: string, isChecked: boolean) => {
    setGroupStates((prev) => ({
      ...prev,
      [groupKey]: {
        ...prev[groupKey],
        selfMadeReuse: isChecked,
      },
    }));
  };

  // 아이템별 자체제작/1회 재사용 체크 핸들러 (관악구 할인용)
  const handleItemSelfMadeReuseSelect = (itemId: string, isChecked: boolean) => {
    setItemStates((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        selfMadeReuse: isChecked,
      },
    }));
  };

  // 그룹별 마포구 저단형 무료 설치 체크 핸들러 (행정용)
  const handleGroupMapoFreeInstallSelect = (groupKey: string, isChecked: boolean) => {
    setGroupStates((prev) => ({
      ...prev,
      [groupKey]: {
        ...prev[groupKey],
        mapoFreeInstall: isChecked,
      },
    }));
  };

  // 아이템별 마포구 저단형 무료 설치 체크 핸들러 (행정용)
  const handleItemMapoFreeInstallSelect = (itemId: string, isChecked: boolean) => {
    setItemStates((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        mapoFreeInstall: isChecked,
      },
    }));
  };

  // 아이템별 작업이름 변경 핸들러
  const handleItemProjectNameChange = (itemId: string, value: string) => {
    setItemStates((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        projectName: value,
        selectedFile: prev[itemId]?.selectedFile || null,
        sendByEmail: prev[itemId]?.sendByEmail || false,
        fileName: prev[itemId]?.fileName || null,
        fileSize: prev[itemId]?.fileSize || null,
        fileType: prev[itemId]?.fileType || null,
        emailAddress: prev[itemId]?.emailAddress || null,
      },
    }));
  };

  // 아이템별 광고내용 변경 핸들러
  const handleItemAdContentChange = (itemId: string, value: string) => {
    setItemStates((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        adContent: value,
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

  // 사용자 프로필 데이터 가져오기 및 cart 아이템 업데이트
  useEffect(() => {
    const fetchUserProfiles = async () => {
      if (!user?.id) return;

      try {
        // 먼저 localStorage에서 기본 프로필 ID 확인
        const storedDefaultProfileId =
          typeof window !== 'undefined'
            ? localStorage.getItem('hansung_profiles_user_id')
            : null;

        console.log('🔍 [Payment] 기본 프로필 ID 확인:', {
          storedDefaultProfileId,
          hasUser: !!user,
          userId: user.id,
        });

        const response = await fetch(`/api/user-profiles?userId=${user.id}`);
        const data = await response.json();

        if (data.success) {
          console.log('🔍 가져온 프로필 데이터:', data.data);
          // user_auth_id 및 프로필 플래그 기본값 보완
          const profilesWithAuthId: UserProfile[] = data.data.map(
            (profile: Record<string, unknown>) => ({
              ...profile,
              user_auth_id: (profile.user_auth_id as string) || user.id,
              is_public_institution:
                (profile.is_public_institution as boolean) ?? false,
              is_company: (profile.is_company as boolean) ?? false,
              is_approved: (profile.is_approved as boolean) ?? false,
            })
          );
          console.log('🔍 user_auth_id 추가 및 플래그 보완된 프로필 데이터:', {
            profiles: profilesWithAuthId.map((p) => ({
              id: p.id,
              title: p.profile_title,
              is_default: p.is_default,
              is_public_institution: p.is_public_institution,
              is_company: p.is_company,
              is_approved: p.is_approved,
            })),
          });
          setUserProfiles(profilesWithAuthId);

          // 만약 profiles가 비어있고 localStorage에 기본 프로필 ID가 있으면
          // profiles context에서 해당 프로필 찾기
          if (
            profilesWithAuthId.length === 0 &&
            storedDefaultProfileId &&
            profiles?.length > 0
          ) {
            console.log(
              '🔍 [Payment] API가 빈 배열 반환, profiles context에서 기본 프로필 찾기:',
              {
                storedDefaultProfileId,
                profilesCount: profiles.length,
              }
            );

            const foundProfile = profiles.find(
              (p) => p.id === storedDefaultProfileId
            );
            if (foundProfile) {
              console.log(
                '🔍 [Payment] profiles context에서 기본 프로필 찾음:',
                foundProfile
              );
              setUserProfiles([foundProfile]);
            } else {
              // is_default = true인 프로필 찾기
              const defaultProfile = profiles.find((p) => p.is_default);
              if (defaultProfile) {
                console.log(
                  '🔍 [Payment] profiles context에서 기본 프로필 찾음 (is_default):',
                  defaultProfile
                );
                setUserProfiles([defaultProfile]);
              }
            }
          }

          // 프로필이 있고 cart 아이템에 user_profile_id가 없으면 업데이트
          if (profilesWithAuthId.length > 0 && cart.length > 0) {
            const defaultProfile =
              profilesWithAuthId.find(
                (p: { is_default?: boolean }) => p.is_default
              ) || profilesWithAuthId[0];
            const defaultProfileId = defaultProfile?.id;

            if (defaultProfileId) {
              const itemsNeedingUpdate = cart.filter(
                (item) => !item.user_profile_id
              );

              if (itemsNeedingUpdate.length > 0) {
                console.log('🔍 [Payment] cart 아이템 user_profile_id 보완:', {
                  itemsNeedingUpdate: itemsNeedingUpdate.length,
                  defaultProfileId,
                });

                // cart 아이템 업데이트
                const updatedCart = cart.map((item) => {
                  if (!item.user_profile_id) {
                    return {
                      ...item,
                      user_profile_id: defaultProfileId,
                      // 프로필 정보도 함께 업데이트
                      contact_person_name:
                        item.contact_person_name ||
                        defaultProfile.contact_person_name,
                      phone: item.phone || defaultProfile.phone,
                      company_name:
                        item.company_name || defaultProfile.company_name,
                      email: item.email || defaultProfile.email,
                    };
                  }
                  return item;
                });

                // cart 업데이트
                cartDispatch({
                  type: 'UPDATE_CART',
                  items: updatedCart,
                });

                console.log('🔍 [Payment] cart 업데이트 완료:', {
                  updatedItems: updatedCart.filter(
                    (item) => item.user_profile_id === defaultProfileId
                  ).length,
                });

                // cart 업데이트 플래그 설정
                setCartUpdated(true);
              }
            }
          } else if (profilesWithAuthId.length === 0) {
            // 프로필이 없는 경우
            console.warn(
              '🔍 [Payment] ⚠️ 프로필이 없습니다. 마이페이지에서 프로필을 생성해주세요.'
            );
          }
        }
      } catch (error) {
        console.error('🔍 프로필 데이터 가져오기 실패:', error);
      }
    };

    fetchUserProfiles();
  }, [user?.id, cart, cartDispatch, user, profiles]);

  // cart 업데이트 후 cart가 변경되면 그룹화 다시 수행
  useEffect(() => {
    // selectedItems가 있고 이미 그룹화가 수행된 상태에서만 재실행
    if (selectedItems.length > 0 && groupedItems.length > 0 && cartUpdated) {
      console.log('🔍 [Payment] cart 업데이트 후 그룹화 재실행');
      const directParam = searchParams.get('direct');

      // cart에서 최신 아이템 다시 가져오기
      const itemsParam = searchParams.get('items');
      if (itemsParam) {
        try {
          const selectedItemIds = JSON.parse(
            decodeURIComponent(itemsParam)
          ) as string[];
          const latestItems = cart.filter((item) =>
            selectedItemIds.includes(item.id)
          );

          if (latestItems.length > 0) {
            const grouped = groupItemsByDistrict(
              latestItems,
              directParam === 'true'
            );
            console.log('🔍 [Payment] 재그룹화 결과:', {
              groupedCount: grouped.length,
              groupedItems: grouped.map((group) => ({
                id: group.id,
                name: group.name,
                user_profile_id: group.user_profile_id,
                hasProfileId: !!group.user_profile_id,
              })),
            });
            setGroupedItems(grouped);
            setSelectedItems(latestItems);
            setCartUpdated(false);
          }
        } catch (error) {
          console.error('🔍 [Payment] 재그룹화 중 오류:', error);
        }
      }
    }
  }, [cartUpdated, cart]);

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
      // is_default = true인 프로필만 사용
      const defaultProfile = userProfiles.find((profile) => profile.is_default);

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

      // 일괄적용 활성화
      setBulkApply((prev) => ({
        ...prev,
        projectName: true,
        fileUpload: true,
      }));
    }
  }, [userProfiles, selectedItems, searchParams, projectName]);

  // 자체제작 유의사항 조회 (관악구 등 해당 구가 있을 때)
  useEffect(() => {
    const fetchSelfMadeNotices = async () => {
      // groupedItems에서 유니크한 구 목록 추출
      const districts = [...new Set(groupedItems.map((g) => g.district))];

      for (const district of districts) {
        // 이미 조회한 구는 스킵
        if (selfMadeNotices[district]) continue;

        try {
          const res = await fetch(
            `/api/region-gu-notices?district=${encodeURIComponent(district)}&noticeType=self_made`
          );
          const data = await res.json();

          if (data.success && data.data && data.data.length > 0) {
            setSelfMadeNotices((prev) => ({
              ...prev,
              [district]: data.data.map((n: { title: string; items: { text: string; important: boolean }[] }) => ({
                title: n.title,
                items: n.items,
              })),
            }));
          }
        } catch (error) {
          console.error(`Error fetching self_made notices for ${district}:`, error);
        }
      }
    };

    if (groupedItems.length > 0) {
      fetchSelfMadeNotices();
    }
  }, [groupedItems, selfMadeNotices]);

  // 일반 유의사항 조회 (구별 공통 공지사항 - 항상 표시)
  useEffect(() => {
    const fetchGeneralNotices = async () => {
      const districts = [...new Set(groupedItems.map((g) => g.district))];

      for (const district of districts) {
        if (generalNotices[district]) continue;

        try {
          const res = await fetch(
            `/api/region-gu-notices?district=${encodeURIComponent(district)}&noticeType=general`
          );
          const data = await res.json();

          if (data.success && data.data && data.data.length > 0) {
            setGeneralNotices((prev) => ({
              ...prev,
              [district]: data.data.map((n: { title: string; items: { text: string; important: boolean }[] }) => ({
                title: n.title,
                items: n.items,
              })),
            }));
          }
        } catch (error) {
          console.error(`Error fetching general notices for ${district}:`, error);
        }
      }
    };

    if (groupedItems.length > 0) {
      fetchGeneralNotices();
    }
  }, [groupedItems, generalNotices]);

  // 마포구 저단형 무료 설치 유의사항 조회 (행정용)
  useEffect(() => {
    const fetchMapoFreeInstallNotices = async () => {
      // 마포구만 조회
      const hasMapo = groupedItems.some((g) => g.district === '마포구');
      if (!hasMapo || mapoFreeInstallNotices['마포구']) return;

      try {
        const res = await fetch(
          `/api/region-gu-notices?district=${encodeURIComponent('마포구')}&noticeType=mapo_free_install`
        );
        const data = await res.json();

        if (data.success && data.data && data.data.length > 0) {
          setMapoFreeInstallNotices((prev) => ({
            ...prev,
            ['마포구']: data.data.map((n: { title: string; items: { text: string; important: boolean }[] }) => ({
              title: n.title,
              items: n.items,
            })),
          }));
        }
      } catch (error) {
        console.error('Error fetching mapo_free_install notices:', error);
      }
    };

    if (groupedItems.length > 0) {
      fetchMapoFreeInstallNotices();
    }
  }, [groupedItems, mapoFreeInstallNotices]);

  // 묶음 결제를 위한 아이템 그룹화 함수 (useCallback으로 안정화)
  const groupItemsByDistrict = useCallback(
    (items: CartItem[], isDirectMode = false): GroupedCartItem[] => {
      // localStorage에서 기본 프로필 ID 직접 가져오기 (항상 확인)
      let storedDefaultProfileId: string | null = null;
      if (typeof window !== 'undefined') {
        try {
          storedDefaultProfileId = localStorage.getItem(
            'hansung_profiles_user_id'
          );
          // #region agent log - hypothesis B (localStorage access)
          postAgentDebugLog({
            sessionId: 'debug-session',
            runId: debugRunIdRef.current,
            hypothesisId: 'B',
            location: 'src/app/payment/page.tsx:groupItemsByDistrict',
            message: 'localStorage.getItem(hansung_profiles_user_id) success',
            data: {
              hasValue: !!storedDefaultProfileId,
              valueLength: storedDefaultProfileId
                ? storedDefaultProfileId.length
                : 0,
            },
            timestamp: Date.now(),
          });
          // #endregion
        } catch (e) {
          const err = e as unknown as { name?: unknown; message?: unknown };
          // #region agent log - hypothesis B (localStorage blocked/throws)
          postAgentDebugLog({
            sessionId: 'debug-session',
            runId: debugRunIdRef.current,
            hypothesisId: 'B',
            location: 'src/app/payment/page.tsx:groupItemsByDistrict',
            message: 'localStorage.getItem threw',
            data: {
              key: 'hansung_profiles_user_id',
              errorName: typeof err?.name === 'string' ? err.name : undefined,
              errorMessage:
                typeof err?.message === 'string' ? err.message : undefined,
            },
            timestamp: Date.now(),
          });
          // #endregion
          throw e;
        }
      }

      console.log(
        '🔍 [groupItemsByDistrict] localStorage 기본 프로필 ID:',
        storedDefaultProfileId
      );

      // 구별로 그룹화 (상하반기 구분 없이 같은 구는 하나의 그룹으로)
      const grouped: { [key: string]: CartItem[] } = {};

      items.forEach((item) => {
        // 그룹 키: 구만 사용 (같은 구의 상반기/하반기 아이템을 하나의 그룹으로)
        const groupKey = item.district;

        if (!grouped[groupKey]) grouped[groupKey] = [];
        grouped[groupKey].push(item);
      });

      const groups = Object.entries(grouped).map(([groupKey, group]) => {
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

        // 🔍 [디버깅] 그룹화 단계에서 user_profile_id 파싱 확인
        console.log('🔍 [그룹화] 아이템 user_profile_id 확인:', {
          groupKey,
          firstItemId: firstItem.id,
          firstItemName: firstItem.name,
          firstItemUserProfileId: firstItem.user_profile_id,
          hasFirstItemProfileId: !!firstItem.user_profile_id,
          groupItemsProfileIds: group.map((item) => ({
            id: item.id,
            name: item.name,
            user_profile_id: item.user_profile_id,
            hasProfileId: !!item.user_profile_id,
          })),
          defaultProfileId: defaultProfile?.id,
          userProfilesCount: userProfiles?.length || 0,
          userProfilesIds:
            userProfiles?.map((p) => ({
              id: p.id,
              is_default: p.is_default,
              profile_title: p.profile_title,
            })) || [],
        });

        // user_profile_id가 없으면 현재 사용자의 기본 프로필 사용 (폴백)
        let finalUserProfileId = firstItem.user_profile_id;

        if (!finalUserProfileId) {
          console.warn(
            '🔍 [그룹화] ⚠️ 첫 번째 아이템에 user_profile_id가 없음, 기본 프로필 찾기:',
            {
              itemId: firstItem.id,
              itemName: firstItem.name,
              district: firstItem.district,
              groupKey,
            }
          );

          // 그룹 내 다른 아이템에서 user_profile_id 찾기
          const itemWithProfile = group.find((item) => item.user_profile_id);
          if (itemWithProfile) {
            finalUserProfileId = itemWithProfile.user_profile_id;
            console.log(
              '🔍 [그룹화] ✅ 그룹 내 다른 아이템에서 user_profile_id 찾음:',
              finalUserProfileId
            );
          } else {
            // localStorage에서 기본 프로필 ID 직접 가져오기
            const storedDefaultProfileId =
              typeof window !== 'undefined'
                ? localStorage.getItem('hansung_profiles_user_id')
                : null;

            console.log('🔍 [그룹화] localStorage 기본 프로필 ID 확인:', {
              storedDefaultProfileId,
              hasDefaultProfile: !!defaultProfile,
              defaultProfileId: defaultProfile?.id,
              userProfilesCount: userProfiles?.length || 0,
              profilesCount: profiles?.length || 0,
            });

            // localStorage에 저장된 기본 프로필 ID 우선 사용 (이미 함수 시작 부분에서 가져옴)
            if (storedDefaultProfileId) {
              finalUserProfileId = storedDefaultProfileId;
              console.log(
                '🔍 [그룹화] ✅ localStorage 기본 프로필 ID 사용:',
                finalUserProfileId
              );
            } else if (typeof window !== 'undefined') {
              // 혹시나 해서 한번 더 확인
              const fallbackId = localStorage.getItem(
                'hansung_profiles_user_id'
              );
              if (fallbackId) {
                finalUserProfileId = fallbackId;
                console.log(
                  '🔍 [그룹화] ✅ localStorage 기본 프로필 ID 사용 (재확인):',
                  finalUserProfileId
                );
              }
            }

            if (!finalUserProfileId) {
              // localStorage에도 없으면 defaultProfile 또는 userProfiles에서 찾기
              const currentDefaultProfile =
                defaultProfile ||
                userProfiles?.find((p) => p.is_default) ||
                profiles?.find((p) => p.is_default);

              if (currentDefaultProfile?.id) {
                finalUserProfileId = currentDefaultProfile.id;
                console.log(
                  '🔍 [그룹화] ✅ 기본 프로필 찾음 (is_default):',
                  finalUserProfileId
                );
              } else {
                // 기본 프로필도 없으면 에러 (프로필 생성 필요)
                console.error(
                  '🔍 [그룹화] ❌ 프로필이 없습니다. 기본 프로필 생성이 필요합니다:',
                  {
                    itemId: firstItem.id,
                    itemName: firstItem.name,
                    district: firstItem.district,
                    groupKey,
                    hasDefaultProfile: !!defaultProfile,
                    hasUserProfiles: !!userProfiles?.length,
                    hasProfiles: !!profiles?.length,
                    storedDefaultProfileId,
                    note: '마이페이지에서 프로필을 먼저 생성해주세요.',
                  }
                );
                // 프로필이 없으면 그룹 생성 생략 (null 반환하여 필터링)
                return null;
              }
            }
          }
        }

        console.log('🔍 [그룹화] 최종 user_profile_id:', finalUserProfileId);

        // user_profile_id가 없으면 그룹 생성 생략 (기본 프로필도 없음 = 프로필 생성 필요)
        // 하지만 localStorage에 기본 프로필 ID가 있으면 사용 (프로필 객체가 로드되지 않아도 ID만 있으면 진행)
        if (!finalUserProfileId) {
          const fallbackProfileId =
            typeof window !== 'undefined'
              ? localStorage.getItem('hansung_profiles_user_id')
              : null;

          if (fallbackProfileId) {
            finalUserProfileId = fallbackProfileId;
            console.log(
              '🔍 [그룹화] ⚠️ localStorage 기본 프로필 ID로 폴백 (프로필 객체는 아직 로드되지 않음):',
              finalUserProfileId
            );
          } else {
            console.error(
              '🔍 [그룹화] ❌ user_profile_id가 없어서 그룹 생성 생략 (기본 프로필도 없음)',
              {
                groupKey,
                firstItemId: firstItem.id,
                firstItemName: firstItem.name,
                note: '마이페이지에서 프로필을 먼저 생성해주세요.',
              }
            );
            return null;
          }
        }

        return {
          id: `group_${groupKey}`,
          // name은 구 이름만; 상세 라벨은 getDisplayTypeLabel에서 처리
          name: firstItem.district,
          items: group,
          totalPrice,
          district: firstItem.district,
          type: firstItem.type || 'banner-display',
          panel_type: firstItem.panel_type || 'panel',
          is_public_institution:
            firstItem.is_public_institution ||
            profileToUse?.is_public_institution,
          is_company: firstItem.is_company || profileToUse?.is_company,
          // user_profile_id는 보완된 값 사용 (없으면 undefined)
          user_profile_id: finalUserProfileId || undefined,
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

      // 모든 그룹 반환 (null 체크만)
      return groups.filter((group) => group !== null) as GroupedCartItem[];
    },
    [userProfiles]
  );

  // URL 파라미터에서 선택된 아이템 ID들 가져오기
  useEffect(() => {
    const itemsParam = searchParams.get('items');
    const approvedParam = searchParams.get('approved');
    const orderIdParam = searchParams.get('orderId');
    const directParam = searchParams.get('direct');

    // 통합 로그: user 정보와 cart 정보를 함께 출력
    console.log('🔍 [Payment 페이지] 초기 로드:', {
      user: user
        ? {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
          }
        : null,
      hasUser: !!user,
      itemsParam,
      approvedParam,
      orderIdParam,
      directParam,
      cartLength: cart.length,
      cartItems: cart.map((item) => ({
        id: item.id,
        name: item.name,
        user_profile_id: item.user_profile_id,
        user_auth_id: item.user_auth_id,
        hasUserProfileId: !!item.user_profile_id,
        hasUserAuthId: !!item.user_auth_id,
      })),
    });

    // localStorage에서 직접 확인
    if (typeof window !== 'undefined') {
      try {
        const storedCart = localStorage.getItem('hansung_cart');
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart);
          console.log('🔍 [Payment] localStorage 직접 확인:', {
            itemsCount: parsedCart.items?.length || 0,
            items:
              parsedCart.items?.map((item: CartItem) => ({
                id: item.id,
                name: item.name,
                user_profile_id: item.user_profile_id,
                user_auth_id: item.user_auth_id,
                hasUserProfileId: !!item.user_profile_id,
              })) || [],
          });
        } else {
          console.log('🔍 [Payment] localStorage에 장바구니 데이터 없음');
        }
      } catch (error) {
        console.error('🔍 [Payment] localStorage 확인 중 오류:', error);
      }
    }

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
          // cart에서 최신 상태 가져오기 (cart가 업데이트되었을 수 있음)
          const latestCart = cart; // useCart에서 가져온 최신 cart

          console.log('🔍 [Payment 필터링] 통합 정보:', {
            user: user
              ? {
                  id: user.id,
                  username: user.username,
                  email: user.email,
                }
              : null,
            selectedItemIds: selectedItemIds,
            selectedItemIdsType: typeof selectedItemIds,
            selectedItemIdsIsArray: Array.isArray(selectedItemIds),
            latestCartLength: latestCart.length,
            latestCartItemIds: latestCart.map((item) => item.id),
            latestCartItems: latestCart.map((item) => ({
              id: item.id,
              name: item.name,
              user_profile_id: item.user_profile_id,
              user_auth_id: item.user_auth_id,
              hasUserProfileId: !!item.user_profile_id,
              hasUserAuthId: !!item.user_auth_id,
            })),
            matchCheck: selectedItemIds.map((id) => ({
              id,
              foundInCart: latestCart.some((item) => item.id === id),
              matchedItem: latestCart.find((item) => item.id === id)
                ? {
                    id: latestCart.find((item) => item.id === id)?.id,
                    name: latestCart.find((item) => item.id === id)?.name,
                  }
                : null,
            })),
          });

          // 아이템 필터링 (ID 타입 일치 확인)
          const items = latestCart.filter((item) => {
            // ID 타입이 다를 수 있으므로 문자열로 변환하여 비교
            const itemIdStr = String(item.id);
            const isIncluded = selectedItemIds.some(
              (id) => String(id) === itemIdStr
            );
            if (!isIncluded) {
              console.warn('🔍 [필터링] 매칭 실패:', {
                itemId: item.id,
                itemIdType: typeof item.id,
                itemIdStr,
                selectedItemIds: selectedItemIds,
                selectedItemIdsStr: selectedItemIds.map((id) => String(id)),
              });
            }
            return isIncluded;
          });

          console.log('🔍 [장바구니 필터링] 최신 cart 상태:', {
            latestCartLength: latestCart.length,
            latestCartItems: latestCart.map((item) => ({
              id: item.id,
              idType: typeof item.id,
              name: item.name,
              user_profile_id: item.user_profile_id,
              user_auth_id: item.user_auth_id,
              hasUserProfileId: !!item.user_profile_id,
            })),
          });

          // 🔍 [디버깅] 장바구니에서 필터링된 아이템의 user_profile_id 확인
          const matchedIds = items.map((item) => String(item.id));
          const unmatchedIds = selectedItemIds.filter(
            (id) => !latestCart.some((item) => String(item.id) === String(id))
          );

          console.log('🔍 [장바구니 필터링] 필터링 결과:', {
            cartLength: latestCart.length,
            selectedItemIdsCount: selectedItemIds.length,
            selectedItemIds: selectedItemIds.map((id) => ({
              original: id,
              type: typeof id,
              stringified: String(id),
            })),
            cartItemIds: latestCart.map((item) => ({
              original: item.id,
              type: typeof item.id,
              stringified: String(item.id),
            })),
            matchedIds,
            matchedCount: matchedIds.length,
            unmatchedIds,
            unmatchedCount: unmatchedIds.length,
            filteredItemsCount: items.length,
            filteredItems: items.map((item) => ({
              id: item.id,
              name: item.name,
              user_profile_id: item.user_profile_id,
              hasProfileId: !!item.user_profile_id,
              user_auth_id: item.user_auth_id,
            })),
          });

          // 필터링 결과가 비어있으면 경고 (하지만 에러가 아니라 경고로 처리)
          if (items.length === 0 && selectedItemIds.length > 0) {
            console.warn('🔍 [장바구니 필터링] ⚠️ 필터링 결과가 비어있음:', {
              selectedItemIds,
              selectedItemIdsTypes: selectedItemIds.map((id) => typeof id),
              cartItemIds: latestCart.map((item) => ({
                id: item.id,
                type: typeof item.id,
              })),
              cartLength: latestCart.length,
              unmatchedIds,
              possibleCauses: [
                '장바구니 아이템이 삭제되었을 수 있음',
                'URL 파라미터의 ID와 장바구니의 ID 형식이 다를 수 있음',
                '장바구니 상태가 업데이트되지 않았을 수 있음',
              ],
              localStorageCheck:
                typeof window !== 'undefined'
                  ? localStorage.getItem('hansung_cart')
                  : null,
            });

            // 장바구니에 아이템이 있으면 첫 번째 아이템으로 폴백 (사용자 경험 개선)
            if (latestCart.length > 0) {
              console.warn(
                '🔍 [장바구니 필터링] ⚠️ 장바구니 첫 번째 아이템으로 폴백'
              );
              setSelectedItems([latestCart[0]]);
              return;
            }
          }

          setSelectedItems(items);

          // 묶음 결제를 위한 그룹화 (direct 모드 여부 전달)
          console.log('🔍 [그룹화 전] groupItemsByDistrict 호출:', {
            itemsCount: items.length,
            isDirectMode: directParam === 'true',
            userProfilesCount: userProfiles.length,
            profilesCount: profiles?.length || 0,
          });

          const grouped = groupItemsByDistrict(items, directParam === 'true');

          console.log('🔍 [그룹화 후] 그룹화 결과:', {
            groupedCount: grouped.length,
            groupedItems: grouped.map((group) => ({
              id: group.id,
              name: group.name,
              district: group.district,
              user_profile_id: group.user_profile_id,
              hasProfileId: !!group.user_profile_id,
              itemsCount: group.items.length,
              totalPrice: group.totalPrice,
              itemsProfileIds: group.items.map((item) => ({
                id: item.id,
                name: item.name,
                user_profile_id: item.user_profile_id,
              })),
            })),
            willBeSetToGroupedItems: grouped.length > 0,
          });

          if (grouped.length > 0) {
            console.log('🔍 [그룹화 후] ✅ groupedItems 설정:', grouped.length);
            setGroupedItems(grouped);
          } else {
            console.warn(
              '🔍 [그룹화 후] ⚠️ groupedItems가 비어있어서 설정 안 함'
            );
          }

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
  }, [
    searchParams,
    cart,
    isApprovedOrder,
    groupItemsByDistrict,
    user,
    profiles?.length,
    userProfiles.length,
  ]);

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
    // 일반 장바구니 결제(selectedItems) 또는 상담신청 기반 결제(groupedItems) 모두 검사 대상
    const hasItems = selectedItems.length > 0 || groupedItems.length > 0;
    if (!hasItems) return;

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
  }, [
    projectName,
    selectedFile,
    bulkApply,
    isAgreedCaution,
    selectedItems.length,
    groupedItems.length,
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
        // 주문 상세의 디스플레이 타입을 그룹 타입으로 매핑
        let groupType: GroupedCartItem['type'] = 'banner-display';
        const firstDetail = orderDetails?.[0];
        const displayTypeName =
          firstDetail?.panels?.display_types?.name || null;
        if (displayTypeName === 'led_display') {
          groupType = 'led-display';
        } else if (displayTypeName === 'digital_signage') {
          groupType = 'digital-signage';
        }

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
          type: groupType, // 주문 타입에 따라 현수막/전자/디지털 구분
          panel_type: orderDetails?.[0]?.panels?.panel_type || '상담신청',
          contact_person_name: order.user_profiles?.contact_person_name || '',
          phone: order.user_profiles?.phone || '',
          company_name: order.user_profiles?.company_name || '',
          email: order.user_profiles?.email || '',
        };

        setGroupedItems([groupedItem]);
        setIsApprovedOrder(true);

        // 기존 결제대기 주문의 경우: Toss orderId로 기존 order_number를 사용하도록 설정
        if (typeof window !== 'undefined') {
          (
            window as unknown as { currentTossOrderId?: string }
          ).currentTossOrderId = order.order_number;
        }
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

  // localStorage에서 기본 프로필 ID 가져오기
  const storedDefaultProfileId =
    typeof window !== 'undefined'
      ? localStorage.getItem('hansung_profiles_user_id')
      : null;

  // 실제 프로필 ID가 있으면 해당 프로필 사용, 없으면 기본 프로필 사용
  const defaultProfile = (() => {
    // 1. selectedProfileId가 있으면 해당 프로필 찾기
    if (selectedProfileId) {
      const found =
        userProfiles?.find((profile) => profile.id === selectedProfileId) ||
        profiles?.find((profile) => profile.id === selectedProfileId);
      if (found) return found;
    }

    // 2. userProfiles에서 is_default = true인 프로필 찾기
    if (userProfiles?.length > 0) {
      const defaultFromUserProfiles = userProfiles.find(
        (profile) => profile.is_default
      );
      if (defaultFromUserProfiles) return defaultFromUserProfiles;
    }

    // 3. profiles context에서 is_default = true인 프로필 찾기
    if (profiles?.length > 0) {
      const defaultFromProfiles = profiles.find(
        (profile) => profile.is_default
      );
      if (defaultFromProfiles) return defaultFromProfiles;
    }

    // 4. localStorage에 저장된 기본 프로필 ID로 찾기
    if (storedDefaultProfileId) {
      const foundById =
        userProfiles?.find(
          (profile) => profile.id === storedDefaultProfileId
        ) || profiles?.find((profile) => profile.id === storedDefaultProfileId);
      if (foundById) {
        console.log(
          '🔍 [Payment] localStorage 기본 프로필 ID로 프로필 찾음:',
          foundById
        );
        return foundById;
      }
    }

    // 5. 마지막으로 첫 번째 프로필 사용 (폴백 제거됨)
    return null;
  })();

  console.log('🔍 defaultProfile:', defaultProfile);

  // 가격 계산 (결제 페이지에서는 원래 금액 표시, 토스 위젯에서만 0원 표시)
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

  // 결제 페이지에서는 원래 금액 표시 (토스 위젯에서만 0원 표시)
  const finalPriceSummary = priceSummary;

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

  const getDisplayTypeForBankAccount = (
    group: GroupedCartItem
  ): 'banner_display' | 'led_display' | null => {
    if (group.type === 'banner-display') return 'banner_display';
    if (group.type === 'led-display') return 'led_display';
    return null;
  };

  const uploadDraftToDesigns = async (
    file: File,
    projectName: string,
    userProfileId?: string
  ): Promise<string> => {
    if (!userProfileId) {
      throw new Error('사용자 프로필이 필요합니다.');
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userProfileId', userProfileId);
    formData.append('projectName', projectName);
    formData.append('draftDeliveryMethod', 'upload');

    const response = await fetch('/api/design-drafts/direct-upload', {
      method: 'POST',
      body: formData,
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      console.error('🔍 [계좌이체] 시안 direct-upload 실패:', result);
      throw new Error(result.error || '시안 업로드 실패');
    }
    return result.data?.draftId || result.draftId;
  };

  const fetchBankAccountForDistrict = async (
    district: string,
    displayType: 'banner_display' | 'led_display'
  ): Promise<BankAccountInfo | null> => {
    try {
      const params = new URLSearchParams({
        action: 'getBankData',
        district,
        displayType,
      });
      const res = await fetch(`/api/region-gu?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success || !json.data) {
        console.warn('🔍 [계좌이체] bank info missing', {
          district,
          displayType,
          json,
        });
        return null;
      }
      return {
        bankName: json.data.bank_name as string,
        accountNumber: json.data.account_number as string,
        owner: json.data.depositor as string,
      };
    } catch (error) {
      console.error('🔍 [계좌이체] bank info fetch failed', {
        district,
        displayType,
        error,
      });
      return null;
    }
  };

  const closeBankModal = () => {
    setBankModalOpen(false);
    setBankModalGroup(null);
    setBankAccountInfo(null);
    setBankModalError(null);
    setBankModalLoading(false);
  };

  const buildFileSignature = (file: File) =>
    `${file.name}|${file.size}|${file.lastModified}`;

  const warmupBankTransferDraftUploads = useCallback(
    async (group: GroupedCartItem) => {
      try {
        if (!user?.id) return;
        if (!group.user_profile_id) return;

        const groupState = groupStates[group.id];
        const projectName =
          groupState?.projectName?.trim() ||
          group.name ||
          group.district ||
          '광고주';

        const draftDeliveryMethod =
          groupState?.sendByEmail === true ? 'email' : 'upload';

        const requiresGroupFileUpload =
          draftDeliveryMethod === 'upload' &&
          (group.items.length === 1 || bulkApply.fileUpload);

        if (requiresGroupFileUpload && groupState?.selectedFile) {
          const sig = buildFileSignature(groupState.selectedFile);
          const cacheHit = draftUploadCache.group[group.id];
          const inFlightKey = `group:${group.id}:${sig}`;
          if (!cacheHit || cacheHit.sig !== sig) {
            if (!draftUploadInFlightRef.current.has(inFlightKey)) {
              draftUploadInFlightRef.current.add(inFlightKey);
              uploadDraftToDesigns(
                groupState.selectedFile,
                projectName,
                group.user_profile_id
              )
                .then((draftId) => {
                  if (!draftId) return;
                  const resolvedDraftId = draftId;
                  setDraftUploadCache((prev) => ({
                    ...prev,
                    group: {
                      ...prev.group,
                      [group.id]: { sig, draftId: resolvedDraftId },
                    },
                  }));
                })
                .finally(() => {
                  draftUploadInFlightRef.current.delete(inFlightKey);
                });
            }
          }
        }

        if (group.items.length >= 2) {
          type UploadTarget = {
            item: CartItem;
            itemState: (typeof itemStates)[string];
            itemProjectName: string;
          };

          const uploadTargets = group.items
            .map((item): UploadTarget | null => {
              const itemState = itemStates[item.id];
              if (
                !itemState ||
                !itemState.selectedFile ||
                itemState.sendByEmail
              ) {
                return null;
              }
              const itemProjectName =
                itemState.projectName?.trim() ||
                item.name ||
                projectName ||
                '작업';
              return { item, itemState, itemProjectName };
            })
            .filter((target): target is UploadTarget => target !== null);

          uploadTargets.forEach(({ item, itemState, itemProjectName }) => {
            const file: File | null = itemState?.selectedFile || null;
            if (!file) return;
            const sig = buildFileSignature(file);
            const cacheHit = draftUploadCache.item[item.id];
            const inFlightKey = `item:${item.id}:${sig}`;
            if (!cacheHit || cacheHit.sig !== sig) {
              if (!draftUploadInFlightRef.current.has(inFlightKey)) {
                draftUploadInFlightRef.current.add(inFlightKey);
                uploadDraftToDesigns(
                  file,
                  itemProjectName,
                  group.user_profile_id
                )
                  .then((draftId) => {
                    if (!draftId) return;
                    const resolvedDraftId = draftId;
                    setDraftUploadCache((prev) => ({
                      ...prev,
                      item: {
                        ...prev.item,
                        [item.id]: { sig, draftId: resolvedDraftId },
                      },
                    }));
                  })
                  .finally(() => {
                    draftUploadInFlightRef.current.delete(inFlightKey);
                  });
              }
            }
          });
        }
      } catch (error) {
        console.warn('🔍 [계좌이체] warmup draft upload failed', error);
      }
    },
    [user?.id, groupStates, itemStates, bulkApply.fileUpload, draftUploadCache]
  );

  const openBankTransferModal = async (group: GroupedCartItem) => {
    setBankModalError(null);
    setBankModalGroup(group);
    setBankModalLoading(true);
    setBankModalOpen(true);
    // 입금자명 기본값 설정
    setDepositorName(user?.name || group.contact_person_name || '');
    logPaymentDebug('계좌이체 모달 열기 시도', {
      groupId: group.id,
      district: group.district,
      totalPrice: group.totalPrice,
      itemsCount: group.items.length,
    });

    // 모달이 열려있는 동안 사용자 대기 시간을 줄이기 위해 시안 업로드를 미리 시작
    void warmupBankTransferDraftUploads(group);

    const displayType = getDisplayTypeForBankAccount(group);
    if (!displayType) {
      setBankModalError('현재 상품은 계좌이체를 지원하지 않습니다.');
      setBankModalLoading(false);
      logPaymentDebug('계좌이체 모달 지원 불가', {
        groupId: group.id,
        reason: 'displayType missing',
      });
      return;
    }
    const account = await fetchBankAccountForDistrict(
      group.district,
      displayType
    );
    if (!account) {
      setBankModalError(
        `${group.district}의 계좌정보가 아직 등록되지 않았습니다.`
      );
      setBankModalLoading(false);
      logPaymentDebug('계좌정보 없음', {
        district: group.district,
        displayType,
      });
      return;
    }
    setBankAccountInfo(account);
    setBankModalLoading(false);
    logPaymentDebug('계좌정보 확인 완료', {
      district: group.district,
      account: {
        bankName: account.bankName,
        last4: account.accountNumber.slice(-4),
      },
    });
  };

  const handleBankTransferPayment = async (
    group: GroupedCartItem,
    account: BankAccountInfo
  ) => {
    console.log('🔍🔍🔍 handleBankTransferPayment 호출됨!', { groupId: group.id });
    if (isBankTransferProcessing) return;
    setIsBankTransferProcessing(true);
    logPaymentDebug('계좌이체 결제 시작', {
      groupId: group.id,
      district: group.district,
      totalAmount: group.totalPrice,
      userId: user?.id,
      accountName: account.bankName,
    });
    try {
      if (!user?.id) {
        alert('로그인이 필요합니다.');
        return;
      }
      if (!group.user_profile_id) {
        alert(
          '계좌이체 주문에는 프로필이 필요합니다. 마이페이지에서 프로필을 설정해주세요.'
        );
        return;
      }
      const groupState = groupStates[group.id];
      let projectName =
        groupState?.projectName?.trim() ||
        group.name ||
        group.district ||
        '광고주';
      if (!projectName) {
        projectName = '광고주';
      }
      // 이전 디자인/자체제작 사용 여부 확인
      const useExistingDesign =
        groupState?.usePreviousDesign === true || groupState?.selfMadeReuse === true;
      const draftDeliveryMethod = useExistingDesign
        ? 'existing'
        : groupState?.sendByEmail === true
        ? 'email'
        : 'upload';
      const requiresGroupFileUpload =
        !useExistingDesign &&
        draftDeliveryMethod === 'upload' &&
        (group.items.length === 1 || bulkApply.fileUpload);

      console.log('🔍 [계좌이체] 파일업로드 검증:', {
        useExistingDesign,
        usePreviousDesign: groupState?.usePreviousDesign,
        selfMadeReuse: groupState?.selfMadeReuse,
        draftDeliveryMethod,
        requiresGroupFileUpload,
        hasSelectedFile: !!groupState?.selectedFile,
        groupId: group.id,
      });

      const itemsForOrder = group.items.map((item) => {
        const itemState = itemStates[item.id];
        const groupState = groupStates[group.id];
        const itemProjectName =
          itemState?.projectName?.trim() || projectName || item.name || '작업';
        const itemAdContent =
          itemState?.adContent?.trim() || groupState?.adContent?.trim() || '';
        // 이전 디자인 동일 여부 (표시용)
        const usePreviousDesign = itemState?.usePreviousDesign || groupState?.usePreviousDesign || false;
        // 자체제작/1회 재사용 여부 (관악구 할인용)
        const selfMadeReuse = itemState?.selfMadeReuse || groupState?.selfMadeReuse || false;
        // 마포구 저단형 무료 설치 여부 (행정용)
        const mapoFreeInstall = itemState?.mapoFreeInstall || groupState?.mapoFreeInstall || false;
        const isMapoFreeEligible = group.district === '마포구' &&
                                   group.panel_type === 'lower_panel' &&
                                   group.is_public_institution === true &&
                                   mapoFreeInstall;
        // 가격 결정 (마포구 무료 > 관악구 할인 > 원가)
        const finalPrice = isMapoFreeEligible
          ? 0
          : (group.district === '관악구' && selfMadeReuse)
            ? GWANAK_PREVIOUS_DESIGN_PRICE
            : (item.price || 0);
        return {
          id: item.id,
          panel_id: item.panel_id,
          price: finalPrice,
          quantity: 1,
          halfPeriod: item.halfPeriod,
          selectedYear: item.selectedYear,
          selectedMonth: item.selectedMonth,
          panel_slot_usage_id: item.panel_slot_usage_id,
          panel_slot_snapshot: item.panel_slot_snapshot,
          draftDeliveryMethod:
            itemState?.sendByEmail === true ? 'email' : 'upload',
          projectName: itemProjectName,
          adContent: itemAdContent,
          designDraftId: null as string | null,
          usePreviousDesign,
          selfMadeReuse,
          mapoFreeInstall,
        };
      });

      const paymentMethodRes = await fetch(
        '/api/payment/methods?code=bank_transfer'
      );
      const paymentMethodJson = await paymentMethodRes.json();
      if (
        !paymentMethodRes.ok ||
        !paymentMethodJson.success ||
        !paymentMethodJson.data?.id
      ) {
        console.error(
          '🔍 [계좌이체] payment method lookup failed',
          paymentMethodJson
        );
        alert('계좌이체 결제수단 정보를 불러올 수 없습니다.');
        return;
      }
      const paymentMethodId: string = paymentMethodJson.data.id;
      logPaymentDebug('계좌이체 결제수단 확보', {
        paymentMethodId,
        paymentMethodPayload: paymentMethodJson,
      });

      let draftId: string | undefined;
      const itemDraftIds: Record<string, string> = {};

      console.log('🔍🔍🔍 requiresGroupFileUpload 체크 직전:', {
        requiresGroupFileUpload,
        useExistingDesign,
        hasSelectedFile: !!groupState?.selectedFile,
      });
      if (requiresGroupFileUpload) {
        console.log('🔍🔍🔍 파일 업로드 필요! selectedFile:', groupState?.selectedFile);
        if (!groupState?.selectedFile) {
          alert('시안 파일을 선택해주세요.');
          return;
        }
        const sig = buildFileSignature(groupState.selectedFile);
        const cacheHit = draftUploadCache.group[group.id];
        if (cacheHit && cacheHit.sig === sig) {
          draftId = cacheHit.draftId;
        } else {
          draftId = await uploadDraftToDesigns(
            groupState.selectedFile,
            projectName,
            group.user_profile_id
          );
          if (draftId) {
            const resolvedDraftId = draftId;
            setDraftUploadCache((prev) => ({
              ...prev,
              group: {
                ...prev.group,
                [group.id]: { sig, draftId: resolvedDraftId },
              },
            }));
          }
        }
      }

      if (group.items.length >= 2) {
        type UploadTarget = {
          item: CartItem;
          itemState: (typeof itemStates)[string];
          itemProjectName: string;
        };

        const uploadTargets = group.items
          .map((item): UploadTarget | null => {
            const itemState = itemStates[item.id];
            if (
              !itemState ||
              !itemState.selectedFile ||
              itemState.sendByEmail
            ) {
              return null;
            }
            const itemProjectName =
              itemState.projectName?.trim() || item.name || '작업';
            return {
              item,
              itemState,
              itemProjectName,
            };
          })
          .filter((target): target is UploadTarget => target !== null);

        // 병목 최적화: 아이템별 파일 업로드 병렬 처리
        const uploaded = await Promise.all(
          uploadTargets.map(async ({ item, itemState, itemProjectName }) => {
            if (!itemProjectName) {
              throw new Error(
                `"${item?.name || '아이템'}"의 작업이름을 입력해주세요.`
              );
            }
            const file: File | null = itemState?.selectedFile || null;
            if (!file) {
              throw new Error('시안 파일을 선택해주세요.');
            }
            const sig = buildFileSignature(file);
            const cacheHit = draftUploadCache.item[item.id];
            const itemDraftId =
              cacheHit && cacheHit.sig === sig
                ? cacheHit.draftId
                : await uploadDraftToDesigns(
                    file,
                    itemProjectName,
                    group.user_profile_id
                  );
            if (itemDraftId) {
              const resolvedDraftId = itemDraftId;
              setDraftUploadCache((prev) => ({
                ...prev,
                item: {
                  ...prev.item,
                  [item.id]: { sig, draftId: resolvedDraftId },
                },
              }));
            }
            return { itemId: item.id, draftId: itemDraftId };
          })
        );

        uploaded.forEach(({ itemId, draftId }) => {
          itemDraftIds[itemId] = draftId;
        });
      }

      itemsForOrder.forEach((orderItem) => {
        orderItem.designDraftId = itemDraftIds[orderItem.id] || draftId || null;
      });

      logPaymentDebug('계좌이체 주문 요청 페이로드', {
        userAuthId: user.id,
        userProfileId: group.user_profile_id,
        draftDeliveryMethod,
        paymentMethodId,
        projectName,
        itemCount: itemsForOrder.length,
      });
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: itemsForOrder,
          userAuthId: user.id,
          userProfileId: group.user_profile_id,
          isPaid: false,
          draftDeliveryMethod,
          paymentMethodId,
          projectName,
          depositorName,
          draftId,
          itemDraftIds:
            Object.keys(itemDraftIds).length > 0 ? itemDraftIds : undefined,
          meta: {
            paymentAccount: account,
            displayType: getDisplayTypeLabel(group),
          },
        }),
      });
      const orderJson = await orderRes.json();
      if (!orderRes.ok || !orderJson.success) {
        console.error('🔍 [계좌이체] order creation failed', orderJson);
        alert(orderJson.error || '계좌이체 주문을 생성할 수 없습니다.');
        return;
      }
      logPaymentDebug('계좌이체 주문 생성 성공', {
        orderNumber:
          orderJson.order?.orderNumber || orderJson.order?.orderId || '(none)',
        totalPrice: group.totalPrice,
      });

      const paidItemIds = itemsForOrder.map((item) => item.id);
      if (paidItemIds.length > 0) {
        cartDispatch({ type: 'REMOVE_ITEMS', ids: paidItemIds });
      }
      const orderNumber =
        orderJson.order?.orderNumber || orderJson.order?.orderId || '';
      const today = new Date();
      const dateStr = `${today.getFullYear()}${String(
        today.getMonth() + 1
      ).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
      const paymentId = `bank_${orderNumber || dateStr}`;

      // 할인 적용된 총액 계산 (관악구 이전 디자인 동일 등)
      const finalTotalAmount = itemsForOrder.reduce((sum, item) => sum + (item.price || 0), 0);
      window.location.href = `/payment/success?orderId=${encodeURIComponent(
        orderNumber
      )}&paymentId=${encodeURIComponent(paymentId)}&amount=${
        finalTotalAmount
      }&status=pending_deposit`;
    } catch (error) {
      console.error('🔍 [계좌이체] exception', error);
      alert('계좌이체 주문 처리 중 오류가 발생했습니다.');
      logPaymentDebug('계좌이체 예외 발생', {
        error,
        groupId: group.id,
        district: group.district,
      });
    } finally {
      setIsBankTransferProcessing(false);
      closeBankModal();
    }
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

  // 마포구 저단형 무료 주문 처리 함수 (행정용)
  const handleMapoFreeOrder = async (group: GroupedCartItem) => {
    try {
      const groupState = groupStates[group.id];

      // 아이템 정보 수집
      const itemsForOrder = group.items.map((item) => {
        const itemState = itemStates[item.id];
        const itemProjectName =
          itemState?.projectName?.trim() || groupState?.projectName?.trim() || projectName || item.name || '작업';
        const itemAdContent =
          itemState?.adContent?.trim() || groupState?.adContent?.trim() || '';
        const usePreviousDesign = itemState?.usePreviousDesign || groupState?.usePreviousDesign || false;
        const selfMadeReuse = itemState?.selfMadeReuse || groupState?.selfMadeReuse || false;
        const mapoFreeInstall = itemState?.mapoFreeInstall || groupState?.mapoFreeInstall || false;

        return {
          id: item.id,
          panel_id: item.panel_id,
          price: 0, // 무료
          quantity: 1,
          halfPeriod: item.halfPeriod,
          selectedYear: item.selectedYear,
          selectedMonth: item.selectedMonth,
          panel_slot_usage_id: item.panel_slot_usage_id,
          panel_slot_snapshot: item.panel_slot_snapshot,
          projectName: itemProjectName,
          adContent: itemAdContent,
          usePreviousDesign,
          selfMadeReuse,
          mapoFreeInstall,
          draftDeliveryMethod: itemState?.sendByEmail === true ? 'email' : 'upload',
          designDraftId: null as string | null,
        };
      });

      // 결제수단 조회 (무료결제)
      const paymentMethodRes = await fetch('/api/payment/methods?code=free');
      const paymentMethodJson = await paymentMethodRes.json();
      const paymentMethodId = paymentMethodJson.data?.id;

      // 임시 주문번호 생성
      const tempOrderId = `FREE-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

      // 주문 API 호출
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tempOrderId,
          items: itemsForOrder,
          userAuthId: user?.id,
          userProfileId: group.user_profile_id,
          paymentMethodId,
          totalAmount: 0,
          paymentStatus: 'completed', // 무료이므로 바로 완료
          district: group.district,
          displayType: group.type,
          taxInvoiceRequested: false,
        }),
      });

      if (orderRes.ok) {
        const orderData = await orderRes.json();
        // 장바구니에서 아이템 제거
        group.items.forEach((item) => {
          cartDispatch({ type: 'REMOVE_ITEM', id: item.id });
        });
        // 주문 완료 페이지로 이동
        window.location.href = `/mypage/orders/${orderData.orderNumber}`;
      } else {
        const errorData = await orderRes.json();
        throw new Error(errorData.message || '주문 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('마포구 무료 주문 처리 실패:', error);
      alert('주문 처리 중 오류가 발생했습니다.');
    }
  };

  // 토스 위젯 열기 함수
  const openTossWidget = (group: GroupedCartItem) => {
    // 🔍 [디버깅] tossWidgetData에 저장될 그룹의 user_profile_id 확인
    console.log('🔍 [토스 위젯 열기] openTossWidget 호출:', {
      groupId: group.id,
      groupName: group.name,
      user_profile_id: group.user_profile_id,
      hasProfileId: !!group.user_profile_id,
      itemsCount: group.items.length,
      itemsProfileIds: group.items.map((item) => ({
        id: item.id,
        name: item.name,
        user_profile_id: item.user_profile_id,
        hasProfileId: !!item.user_profile_id,
      })),
    });

    logPaymentDebug('토스 위젯 열기 컨텍스트', {
      groupId: group.id,
      district: group.district,
      totalPrice: group.totalPrice,
      user_profile_id: group.user_profile_id,
      itemsCount: group.items.length,
    });

    setTossWidgetData(group);
    setTossWidgetOpen(true);
  };

  // 토스 위젯 초기화
  useEffect(() => {
    if (tossWidgetOpen && tossWidgetData) {
      const initializeTossWidget = async () => {
        try {
          // 클로저 문제 방지를 위해 현재 상태 값 저장
          const currentUser = user;
          const currentGroupStates = groupStates;
          const currentItemStates = itemStates;
          const currentBulkApply = bulkApply;
          const currentTossWidgetData = tossWidgetData;
          // profiles (context)와 userProfiles (state) 둘 다 확인
          const currentProfilesFromContext = profiles;
          const currentUserProfiles = userProfiles;
          const currentProfiles =
            currentUserProfiles.length > 0
              ? currentUserProfiles
              : currentProfilesFromContext || [];

          // 관악구 자체제작/1회 재사용 할인 가격 계산
          const isGwanakSelfMadeReuse =
            currentTossWidgetData.district === '관악구' &&
            currentGroupStates[currentTossWidgetData.id]?.selfMadeReuse;
          const finalTotalPrice = isGwanakSelfMadeReuse
            ? currentTossWidgetData.items.length * GWANAK_PREVIOUS_DESIGN_PRICE
            : currentTossWidgetData.totalPrice;

          logPaymentDebug('토스 위젯 초기화 시작', {
            groupId: currentTossWidgetData.id,
            profilesLoaded: currentProfiles.length,
            hasClientKey: !!process.env.NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY,
            cartLength: cart.length,
          });

          // #region agent log - hypothesis D (toss containers / init preflight)
          postAgentDebugLog({
            sessionId: 'debug-session',
            runId: debugRunIdRef.current,
            hypothesisId: 'D',
            location: 'src/app/payment/page.tsx:initializeTossWidget',
            message: 'toss init preflight',
            data: {
              groupId: currentTossWidgetData.id,
              profilesCount: currentProfiles.length,
              methodsContainerExists: !!document.getElementById(
                'toss-payment-methods'
              ),
              buttonContainerExists: !!document.getElementById(
                'toss-payment-button'
              ),
              userActivation:
                navigator.userActivation?.hasBeenActive ?? undefined,
            },
            timestamp: Date.now(),
          });
          // #endregion

          // 토스페이먼츠 통합결제창 SDK 동적 로드
          // 문서: https://docs.tosspayments.com/guides/v2/payment-window/integration
          const { loadTossPayments } = await import(
            '@tosspayments/payment-sdk'
          );

          // 토스페이먼츠 클라이언트 키 가져오기
          const clientKey = process.env.NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY;

          console.log('🔍 [로컬 디버깅] 토스페이먼츠 초기화 시작:', {
            hasClientKey: !!clientKey,
            clientKeyPrefix: clientKey
              ? `${clientKey.substring(0, 10)}...`
              : '(없음)',
            isTestKey: clientKey?.startsWith('test_') || false,
            isProductionKey: clientKey?.startsWith('live_') || false,
            windowOrigin:
              typeof window !== 'undefined' ? window.location.origin : '(SSR)',
            timestamp: new Date().toISOString(),
          });

          if (!clientKey) {
            console.error(
              '🔍 [로컬 디버깅] ❌ 토스페이먼츠 클라이언트 키가 설정되지 않았습니다.'
            );
            const container = document.getElementById('toss-payment-methods');
            if (container) {
              container.innerHTML = `
                <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div class="text-red-800 font-medium">설정 오류</div>
                  <div class="text-red-600 text-sm mt-1">토스페이먼츠 클라이언트 키가 설정되지 않았습니다.</div>
                  <div class="text-gray-600 text-xs mt-2">로컬 환경에서는 테스트 키 (test_로 시작)를 사용해야 합니다.</div>
                </div>
              `;
            }
            return;
          }

          // 로컬 환경에서는 테스트 키를 사용하는 것이 좋습니다
          if (
            typeof window !== 'undefined' &&
            window.location.hostname === 'localhost' &&
            !clientKey.startsWith('test_')
          ) {
            console.warn(
              '🔍 [로컬 디버깅] ⚠️ 로컬 환경에서 프로덕션 키를 사용하고 있습니다. 테스트 키(test_로 시작) 사용을 권장합니다.'
            );
          }

          console.log('🔍 [통합결제창] 토스페이먼츠 SDK 로드 시작...');
          const tossPayments = await loadTossPayments(clientKey);
          console.log('🔍 [통합결제창] ✅ 토스페이먼츠 SDK 로드 성공');

          // 통합결제창 방식: 위젯 렌더링 없이 바로 결제 버튼만 표시
          // 버튼 클릭 시 tossPayments.requestPayment()로 결제창 직접 열기
          const container = document.getElementById('toss-payment-methods');
          if (container) {
            container.innerHTML = `
              <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                
                <div class="text-blue-600 text-sm">카드 또는 계좌이체 버튼을 눌러 결제 해 주세요.</div>
              </div>
            `;
          }

          // 결제 요청 버튼 이벤트 리스너
          const paymentButton = document.createElement('button');
          paymentButton.textContent = '카드/간편결제';
          paymentButton.className =
            'w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700';

          paymentButton.addEventListener('click', async () => {
            try {
              // 현재 그룹에서 사용할 프로필 정보 확인
              const selectedProfile =
                currentProfiles.find(
                  (p: UserProfile) =>
                    p.id === currentTossWidgetData.user_profile_id
                ) || null;

              if (selectedProfile) {
                // 행정용(공공기관)인데 승인되지 않은 프로필은 결제 불가
                // 기업용(is_company)은 승인 프로세스 제거됨 - 일반 결제 가능
                const isPublicInstitution = !!selectedProfile.is_public_institution;
                const isApprovedProfile = !!selectedProfile.is_approved;

                if (isPublicInstitution && !isApprovedProfile) {
                  alert(
                    '행정용 프로필은 관리자 승인 후에만 할인된 가격으로 결제할 수 있습니다.\n프로필 승인 상태를 확인하시거나 기본 프로필로 다시 주문해주세요.'
                  );
                  paymentButton.disabled = false;
                  paymentButton.textContent = '카드/간편결제';
                  return;
                }
              }

              console.log('🔍 [통합결제창] 결제 버튼 클릭됨:', {
                timestamp: new Date().toISOString(),
                storedOrderId:
                  typeof window !== 'undefined'
                    ? (window as unknown as { currentTossOrderId?: string })
                        .currentTossOrderId || '(없음)'
                    : '(window 없음)',
                hasStoredOrderId:
                  typeof window !== 'undefined' &&
                  !!(window as unknown as { currentTossOrderId?: string })
                    .currentTossOrderId,
              });

              logPaymentDebug('결제 버튼 클릭됨', {
                groupId: currentTossWidgetData.id,
                totalPrice: currentTossWidgetData.totalPrice,
                userProfileId: currentTossWidgetData.user_profile_id,
                clickTimestamp: performance.now(),
              });

              // #region agent log - hypothesis E (payment window click / user activation)
              postAgentDebugLog({
                sessionId: 'debug-session',
                runId: debugRunIdRef.current,
                hypothesisId: 'E',
                location:
                  'src/app/payment/page.tsx:paymentButton.click(before-requestPayment)',
                message: 'payment button clicked',
                data: {
                  groupId: currentTossWidgetData.id,
                  itemsCount: currentTossWidgetData.items.length,
                  amount: currentTossWidgetData.totalPrice,
                  userActivation:
                    navigator.userActivation?.hasBeenActive ?? undefined,
                },
                timestamp: Date.now(),
              });
              // #endregion

              // 버튼 비활성화
              paymentButton.disabled = true;
              paymentButton.textContent = '주문 생성 중...';

              // 주문 생성에 필요한 정보 가져오기 (클로저에서 저장한 값 사용)
              const groupState = currentGroupStates[currentTossWidgetData.id];
              const projectName = groupState?.projectName || '';

              // 아이템 개수 확인
              const itemCount = currentTossWidgetData.items.length;

              // 일괄적용 여부 확인
              const isBulkFileUpload =
                currentBulkApply.fileUpload || currentBulkApply.emailMethod;

              // 이전 디자인 동일 또는 자체제작・1회재사용 체크 시 파일 업로드 검증 스킵
              const useExistingDesign = groupState?.usePreviousDesign === true || groupState?.selfMadeReuse === true;

              // 아이템이 1개이거나 일괄적용이 체크된 경우: 그룹 단위로 확인
              // 아이템이 2개 이상이고 일괄적용이 체크되지 않은 경우: 각 아이템별로 확인
              if (itemCount === 1 || isBulkFileUpload) {
                // 그룹 단위 검증 (이전 디자인/자체제작 사용 시 스킵)
                if (!useExistingDesign) {
                  const isEmailSelected = groupState?.sendByEmail === true;
                  const hasFileUploaded = !!groupState?.selectedFile;

                  // 둘 중 하나는 반드시 선택되어야 함
                  if (!isEmailSelected && !hasFileUploaded) {
                    alert(
                      '시안 파일을 업로드하거나 "이메일로 파일 보낼게요"를 선택해주세요.'
                    );
                    paymentButton.disabled = false;
                    paymentButton.textContent = '카드/간편결제';
                    return;
                  }
                }
              } else {
                // 아이템별 검증 (아이템이 2개 이상이고 일괄적용이 체크되지 않은 경우)
                for (const item of currentTossWidgetData.items) {
                  const itemState = currentItemStates[item.id];
                  // 아이템별 이전 디자인/자체제작 사용 체크
                  const itemUseExistingDesign = itemState?.usePreviousDesign === true || itemState?.selfMadeReuse === true;

                  if (!itemUseExistingDesign) {
                    const isEmailSelected = itemState?.sendByEmail === true;
                    const hasFileUploaded = !!itemState?.selectedFile;

                    // 각 아이템마다 둘 중 하나는 반드시 선택되어야 함
                    if (!isEmailSelected && !hasFileUploaded) {
                      alert(
                        `"${
                          item.name || item.panel_code || '아이템'
                        }"의 시안 파일을 업로드하거나 "이메일로 파일 보낼게요"를 선택해주세요.`
                      );
                      paymentButton.disabled = false;
                      paymentButton.textContent = '카드/간편결제';
                      return;
                    }
                  }
                }
              }

              // 이메일 체크박스가 선택되었으면 'email', 파일이 업로드되었으면 'upload'
              // 이전 디자인/자체제작 사용 시 'existing' (파일 업로드 불필요)
              // (그룹 단위 또는 아이템별로 이미 검증 완료)
              const draftDeliveryMethod: 'email' | 'upload' | 'existing' =
                useExistingDesign
                  ? 'existing'
                  : itemCount === 1 || isBulkFileUpload
                  ? groupState?.sendByEmail === true
                    ? 'email'
                    : 'upload'
                  : 'upload'; // 아이템별인 경우는 나중에 각 아이템별로 처리

              // 결제 전에 시안 파일을 Storage + design_drafts에 업로드 (upload 방식인 경우)
              let draftId: string | undefined;
              // 아이템별 draftId 저장 (아이템별인 경우)
              const itemDraftIds: { [itemId: string]: string } = {};

              // 그룹 단위로 파일 업로드가 필요한 경우 처리 (이전 디자인/자체제작 사용 시 스킵)
              if (
                draftDeliveryMethod === 'upload' &&
                (itemCount === 1 || isBulkFileUpload)
              ) {
                // upload 방식이고 그룹 단위인 경우 파일이 반드시 있어야 함
                if (!groupState?.selectedFile) {
                  console.error(
                    '🔍 [결제 페이지] ❌ upload 방식인데 파일이 없음',
                    {
                      itemCount,
                      isBulkFileUpload,
                      hasGroupState: !!groupState,
                      hasSelectedFile: !!groupState?.selectedFile,
                    }
                  );
                  alert('시안 파일을 선택해주세요.');
                  paymentButton.disabled = false;
                  paymentButton.textContent = '카드/간편결제';
                  return;
                }

                if (!currentTossWidgetData.user_profile_id) {
                  alert(
                    '주문에 사용할 프로필을 찾을 수 없습니다. 마이페이지에서 프로필을 확인해주세요.'
                  );
                  paymentButton.disabled = false;
                  paymentButton.textContent = '카드/간편결제';
                  return;
                }

                try {
                  const uploadFormData = new FormData();
                  uploadFormData.append('file', groupState.selectedFile);
                  uploadFormData.append(
                    'userProfileId',
                    currentTossWidgetData.user_profile_id
                  );
                  uploadFormData.append('projectName', projectName);
                  uploadFormData.append(
                    'adContent',
                    groupState.adContent || ''
                  );
                  uploadFormData.append(
                    'draftDeliveryMethod',
                    draftDeliveryMethod
                  );

                  console.log('🔍 [결제 페이지] 시안 direct-upload API 호출:', {
                    hasFile: !!groupState.selectedFile,
                    userProfileId: currentTossWidgetData.user_profile_id,
                    projectName,
                    adContent: groupState.adContent,
                    draftDeliveryMethod,
                  });

                  const uploadResponse = await fetch(
                    '/api/design-drafts/direct-upload',
                    {
                      method: 'POST',
                      body: uploadFormData,
                    }
                  );

                  const uploadResult = await uploadResponse.json();

                  if (!uploadResponse.ok || !uploadResult.success) {
                    console.error(
                      '🔍 [결제 페이지] ❌ 시안 direct-upload 실패:',
                      uploadResult
                    );
                    alert(
                      uploadResult.error ||
                        '시안 파일 업로드 중 오류가 발생했습니다.'
                    );
                    paymentButton.disabled = false;
                    paymentButton.textContent = '카드/간편결제';
                    return;
                  }

                  draftId =
                    uploadResult.data?.draftId || uploadResult.draftId || null;

                  console.log('🔍 [결제 페이지] ✅ 시안 direct-upload 성공:', {
                    draftId,
                    fileName: uploadResult.data?.fileName,
                  });
                } catch (uploadError) {
                  console.error(
                    '🔍 [결제 페이지] ❌ 시안 direct-upload 예외:',
                    uploadError
                  );
                  alert(
                    '시안 파일 업로드 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
                  );
                  paymentButton.disabled = false;
                  paymentButton.textContent = '카드/간편결제';
                  return;
                }
              }

              // 아이템별 파일 업로드 처리 (아이템이 2개 이상이고 일괄적용이 체크되지 않은 경우)
              if (itemCount >= 2 && !isBulkFileUpload) {
                if (!currentTossWidgetData.user_profile_id) {
                  alert(
                    '주문에 사용할 프로필을 찾을 수 없습니다. 마이페이지에서 프로필을 확인해주세요.'
                  );
                  paymentButton.disabled = false;
                  paymentButton.textContent = '카드/간편결제';
                  return;
                }

                // 각 아이템별로 파일이 업로드된 경우 DB에 업로드
                for (const item of currentTossWidgetData.items) {
                  const itemState = currentItemStates[item.id];
                  // 정확한 값만 사용 (기본값 사용 안 함)
                  const itemProjectName = itemState?.projectName || '';
                  const itemAdContent = itemState?.adContent || '';

                  // 파일이 업로드된 아이템만 처리 (이메일 체크박스가 선택된 아이템은 건너뜀)
                  if (itemState?.selectedFile && !itemState?.sendByEmail) {
                    // projectName이 없으면 에러
                    if (!itemProjectName || itemProjectName.trim() === '') {
                      alert(
                        `"${
                          item.name || item.panel_code || '아이템'
                        }"의 작업이름을 입력해주세요.`
                      );
                      paymentButton.disabled = false;
                      paymentButton.textContent = '카드/간편결제';
                      return;
                    }
                    try {
                      const uploadFormData = new FormData();
                      uploadFormData.append('file', itemState.selectedFile);
                      uploadFormData.append(
                        'userProfileId',
                        currentTossWidgetData.user_profile_id
                      );
                      uploadFormData.append('projectName', itemProjectName);
                      uploadFormData.append('adContent', itemAdContent);
                      uploadFormData.append('draftDeliveryMethod', 'upload');

                      console.log(
                        `🔍 [결제 페이지] 아이템별 시안 direct-upload API 호출:`,
                        {
                          itemId: item.id,
                          itemName: item.name,
                          hasFile: !!itemState.selectedFile,
                          userProfileId: currentTossWidgetData.user_profile_id,
                          projectName: itemProjectName,
                        }
                      );

                      const uploadResponse = await fetch(
                        '/api/design-drafts/direct-upload',
                        {
                          method: 'POST',
                          body: uploadFormData,
                        }
                      );

                      const uploadResult = await uploadResponse.json();

                      if (!uploadResponse.ok || !uploadResult.success) {
                        console.error(
                          `🔍 [결제 페이지] ❌ 아이템 ${item.id} 시안 direct-upload 실패:`,
                          uploadResult
                        );
                        alert(
                          `"${
                            item.name || item.panel_code || '아이템'
                          }"의 시안 파일 업로드 중 오류가 발생했습니다.`
                        );
                        paymentButton.disabled = false;
                        paymentButton.textContent = '카드/간편결제';
                        return;
                      }

                      const itemDraftId =
                        uploadResult.data?.draftId ||
                        uploadResult.draftId ||
                        null;

                      if (itemDraftId) {
                        itemDraftIds[item.id] = itemDraftId;
                        console.log(
                          `🔍 [결제 페이지] ✅ 아이템 ${item.id} 시안 direct-upload 성공:`,
                          {
                            itemId: item.id,
                            draftId: itemDraftId,
                            fileName: uploadResult.data?.fileName,
                          }
                        );
                      }
                    } catch (uploadError) {
                      console.error(
                        `🔍 [결제 페이지] ❌ 아이템 ${item.id} 시안 direct-upload 예외:`,
                        uploadError
                      );
                      alert(
                        `"${
                          item.name || item.panel_code || '아이템'
                        }"의 시안 파일 업로드 중 오류가 발생했습니다.`
                      );
                      paymentButton.disabled = false;
                      paymentButton.textContent = '카드/간편결제';
                      return;
                    }
                  }
                }
              }
              // user_auth_id: localStorage에서 가져오기 (로그인 시 저장됨)
              const userAuthId = (() => {
                if (typeof window !== 'undefined') {
                  const storedAuthId = localStorage.getItem(
                    'hansung_user_auth_id'
                  );
                  if (storedAuthId) {
                    console.log(
                      '🔍 [결제 페이지] localStorage에서 user_auth_id 가져옴:',
                      storedAuthId
                    );
                    return storedAuthId;
                  }
                }
                // localStorage에 없으면 currentUser.id 사용 (폴백)
                if (currentUser?.id) {
                  console.warn(
                    '🔍 [결제 페이지] ⚠️ localStorage에 없어서 user.id 폴백 사용:',
                    currentUser.id
                  );
                  // 폴백 사용 시 localStorage에 저장
                  if (typeof window !== 'undefined') {
                    localStorage.setItem(
                      'hansung_user_auth_id',
                      currentUser.id
                    );
                  }
                  return currentUser.id;
                }
                console.error(
                  '🔍 [결제 페이지] ❌ user_auth_id를 찾을 수 없음!',
                  {
                    hasLocalStorage: typeof window !== 'undefined',
                    storedAuthId:
                      typeof window !== 'undefined'
                        ? localStorage.getItem('hansung_user_auth_id')
                        : null,
                    hasUser: !!currentUser,
                    userId: currentUser?.id,
                  }
                );
                return undefined;
              })();

              // user_profile_id: 사용자가 선택한 프로필 우선, 없으면 기본 프로필
              const userProfileId = currentTossWidgetData.user_profile_id;

              console.log('🔍 [결제 페이지] 사용자 정보 확인:', {
                userAuthId,
                userProfileId,
                hasUser: !!currentUser,
                hasTossWidgetData: !!currentTossWidgetData,
                tossWidgetDataKeys: currentTossWidgetData
                  ? Object.keys(currentTossWidgetData)
                  : [],
                profilesCount: currentProfiles?.length || 0,
                tossWidgetDataItems:
                  currentTossWidgetData?.items?.map((item) => ({
                    id: item.id,
                    name: item.name,
                    user_profile_id: item.user_profile_id,
                  })) || [],
              });

              // user_profile_id는 필수이므로 폴백 제거

              if (!userAuthId) {
                console.error('🔍 [결제 페이지] ❌ userAuthId가 없음');
                alert('로그인이 필요합니다.');
                paymentButton.disabled = false;
                paymentButton.textContent = '카드/간편결제';
                return;
              }

              // user_profile_id가 없으면 기본 프로필 사용 (자동 선택)
              let finalUserProfileId = userProfileId;

              if (!finalUserProfileId) {
                console.log(
                  '🔍 [결제 페이지] 사용자가 프로필을 선택하지 않음, 기본 프로필 자동 선택...',
                  {
                    profilesFromContext:
                      currentProfilesFromContext?.length || 0,
                    userProfiles: currentUserProfiles?.length || 0,
                    currentProfiles: currentProfiles?.length || 0,
                  }
                );

                // 프로필이 없으면 API를 다시 호출하여 가져오기 시도
                if (currentProfiles.length === 0 && currentUser?.id) {
                  console.log(
                    '🔍 [결제 페이지] 프로필이 없어서 API 재호출 시도...',
                    {
                      userId: currentUser.id,
                    }
                  );
                  try {
                    const profileResponse = await fetch(
                      `/api/user-profiles?userId=${currentUser.id}`
                    );
                    const profileData = await profileResponse.json();

                    console.log('🔍 [결제 페이지] 프로필 API 응답:', {
                      ok: profileResponse.ok,
                      status: profileResponse.status,
                      success: profileData.success,
                      dataLength: profileData.data?.length || 0,
                      data: profileData.data,
                    });

                    if (profileData.success && profileData.data?.length > 0) {
                      const fetchedProfiles = profileData.data.map(
                        (profile: Record<string, unknown>) => ({
                          ...profile,
                          user_auth_id:
                            (profile.user_auth_id as string) || currentUser.id,
                        })
                      );
                      console.log(
                        '🔍 [결제 페이지] 가져온 프로필:',
                        fetchedProfiles
                      );

                      const fallbackProfile =
                        fetchedProfiles.find(
                          (p: UserProfile) => p.is_default
                        ) || fetchedProfiles[0];

                      console.log(
                        '🔍 [결제 페이지] 선택된 폴백 프로필:',
                        fallbackProfile
                      );

                      if (fallbackProfile?.id) {
                        finalUserProfileId = fallbackProfile.id;
                        console.log(
                          '🔍 [결제 페이지] ✅ API 재호출로 기본 프로필 자동 선택:',
                          finalUserProfileId
                        );
                      } else {
                        console.error(
                          '🔍 [결제 페이지] ❌ 폴백 프로필에도 id가 없음:',
                          fallbackProfile
                        );
                      }
                    } else {
                      console.error(
                        '🔍 [결제 페이지] ❌ 프로필 API 응답이 비어있음:',
                        {
                          success: profileData.success,
                          hasData: !!profileData.data,
                          dataLength: profileData.data?.length || 0,
                          error: profileData.error,
                        }
                      );
                    }
                  } catch (error) {
                    console.error(
                      '🔍 [결제 페이지] 프로필 API 재호출 실패:',
                      error
                    );
                  }
                } else if (currentProfiles.length > 0) {
                  const fallbackProfile =
                    currentProfiles.find((p: UserProfile) => p.is_default) ||
                    currentProfiles[0];
                  if (fallbackProfile?.id) {
                    finalUserProfileId = fallbackProfile.id;
                    console.log(
                      '🔍 [결제 페이지] ✅ 사용자가 프로필을 선택하지 않아 기본 프로필 자동 선택:',
                      finalUserProfileId
                    );
                  }
                }
              }

              // 기본 프로필도 없으면 에러 (프로필 생성 필요) - 이 경우는 프로필이 하나도 없는 경우
              if (!finalUserProfileId) {
                console.error(
                  '🔍 [결제 페이지] ❌ 프로필이 없습니다. 기본 프로필 생성이 필요합니다.',
                  {
                    tossWidgetData: currentTossWidgetData,
                    items: currentTossWidgetData?.items?.map((item) => ({
                      id: item.id,
                      name: item.name,
                      user_profile_id: item.user_profile_id,
                    })),
                    profilesCount: currentProfiles?.length || 0,
                    userId: currentUser?.id,
                    note: '사용자가 프로필을 선택하지 않았고 기본 프로필도 없는 경우 = 프로필이 하나도 없음',
                  }
                );

                alert(
                  '프로필이 없습니다. 마이페이지에서 프로필을 먼저 생성해주세요.'
                );
                paymentButton.disabled = false;
                paymentButton.textContent = '카드/간편결제';

                // 마이페이지로 리다이렉트 제안
                if (confirm('프로필 생성 페이지로 이동하시겠습니까?')) {
                  window.location.href = '/mypage/info';
                }
                return;
              }

              // 사용자가 프로필을 선택하지 않았지만 기본 프로필이 자동 선택된 경우
              if (!userProfileId && finalUserProfileId) {
                console.log(
                  '🔍 [결제 페이지] ✅ 사용자가 프로필을 선택하지 않아 기본 프로필 자동 선택됨:',
                  {
                    autoSelectedProfileId: finalUserProfileId,
                    note: '사용자가 명시적으로 선택하지 않았지만 기본 프로필이 자동으로 사용됨',
                  }
                );
              }

              // 작업이름 검증
              // 그룹 단위인 경우: 그룹 projectName 확인
              // 아이템별인 경우: 각 아이템의 projectName 확인 (각각 필수 입력)
              const isBulkProjectName = currentBulkApply.projectName;
              if (itemCount === 1 || isBulkProjectName) {
                // 그룹 단위 검증
                if (!projectName || projectName.trim() === '') {
                  alert('작업이름을 입력해주세요.');
                  paymentButton.disabled = false;
                  paymentButton.textContent = '카드/간편결제';
                  return;
                }
              } else {
                // 아이템별 검증: 각 아이템의 projectName이 반드시 입력되어야 함
                for (const item of currentTossWidgetData.items) {
                  const itemState = currentItemStates[item.id];
                  const itemProjectName = itemState?.projectName || '';
                  if (!itemProjectName || itemProjectName.trim() === '') {
                    alert(
                      `"${
                        item.name || item.panel_code || '아이템'
                      }"의 작업이름을 입력해주세요.`
                    );
                    paymentButton.disabled = false;
                    paymentButton.textContent = '카드/간편결제';
                    return;
                  }
                }
              }

              console.log('🔍 [결제 페이지] 결제 정보 준비...', {
                itemsCount: currentTossWidgetData.items.length,
                userAuthId,
                userProfileId: finalUserProfileId,
                projectName,
                draftDeliveryMethod,
              });

              // ⚠️ 중요: 결제 전에 주문을 생성하지 않음!
              // 결제 성공 후 결제 확인 API에서 실제 주문 생성
              // orderId는 위젯 초기화 시 이미 생성되었으므로 사용 (또는 새로 생성)
              let finalOrderId: string;

              // 전역 변수에 저장된 orderId가 있으면 사용
              if (
                typeof window !== 'undefined' &&
                (window as unknown as { currentTossOrderId?: string })
                  .currentTossOrderId
              ) {
                finalOrderId = (
                  window as unknown as { currentTossOrderId?: string }
                ).currentTossOrderId!;
                console.log(
                  '🔍 [결제 페이지] 전역 변수에서 orderId 가져옴:',
                  finalOrderId
                );
              } else {
                // 위젯 초기화 시 orderId가 생성되지 않았으면 새로 생성
                const timestamp = Date.now();
                const randomStr = Math.random().toString(36).substring(2, 11);
                finalOrderId = `temp_${timestamp}_${randomStr}`;
                console.log(
                  '🔍 [결제 페이지] orderId 새로 생성:',
                  finalOrderId
                );

                // 전역 변수에 저장
                if (typeof window !== 'undefined') {
                  (
                    window as unknown as { currentTossOrderId?: string }
                  ).currentTossOrderId = finalOrderId;
                }
              }

              // orderId 검증
              if (!finalOrderId || finalOrderId.trim() === '') {
                console.error('🔍 [결제 페이지] ❌ orderId가 없음');
                alert('주문 ID를 생성할 수 없습니다. 다시 시도해주세요.');
                paymentButton.disabled = false;
                paymentButton.textContent = '카드/간편결제';
                return;
              }

              // orderId 형식 검증 (영문, 숫자, 언더스코어, 하이픈만 허용)
              const orderIdPattern = /^[a-zA-Z0-9_-]+$/;
              if (!orderIdPattern.test(finalOrderId)) {
                console.error(
                  '🔍 [결제 페이지] ❌ orderId 형식 오류:',
                  finalOrderId
                );
                alert('주문 ID 형식이 올바르지 않습니다. 다시 시도해주세요.');
                paymentButton.disabled = false;
                paymentButton.textContent = '카드/간편결제';
                return;
              }

              console.log('🔍 [결제 페이지] 사용할 orderId:', {
                finalOrderId,
                length: finalOrderId.length,
                isValidFormat: orderIdPattern.test(finalOrderId),
                source: '위젯 초기화 시 생성',
              });

              // 아이템별 draftDeliveryMethod 생성 (아이템별인 경우)
              const itemDraftDeliveryMethods: {
                [itemId: string]: 'email' | 'upload';
              } = {};
              if (itemCount >= 2 && !isBulkFileUpload) {
                for (const item of currentTossWidgetData.items) {
                  const itemState = currentItemStates[item.id];
                  itemDraftDeliveryMethods[item.id] =
                    itemState?.sendByEmail === true ? 'email' : 'upload';
                }
              }

              // 결제 정보를 localStorage에 저장 (결제 성공 시 실제 주문 생성에 사용)
              const paymentData = {
                tempOrderId: finalOrderId,
                items: currentTossWidgetData.items.map((item) => {
                  const itemState = currentItemStates[item.id];
                  const groupState = currentGroupStates[currentTossWidgetData.id];
                  // 이전 디자인 동일 여부 (표시용)
                  const usePreviousDesign = itemState?.usePreviousDesign || groupState?.usePreviousDesign || false;
                  // 자체제작/1회 재사용 여부 (관악구 할인용)
                  const selfMadeReuse = itemState?.selfMadeReuse || groupState?.selfMadeReuse || false;
                  // 마포구 저단형 무료 설치 여부 (행정용)
                  const mapoFreeInstall = itemState?.mapoFreeInstall || groupState?.mapoFreeInstall || false;
                  const isMapoFreeEligible = currentTossWidgetData.district === '마포구' &&
                                             currentTossWidgetData.panel_type === 'lower_panel' &&
                                             currentTossWidgetData.is_public_institution === true &&
                                             mapoFreeInstall;
                  // 가격 결정 (마포구 무료 > 관악구 할인 > 원가)
                  const finalPrice = isMapoFreeEligible
                    ? 0
                    : (currentTossWidgetData.district === '관악구' && selfMadeReuse)
                      ? GWANAK_PREVIOUS_DESIGN_PRICE
                      : (item.price || 0);
                  return {
                    id: item.id,
                    panel_id: item.panel_id,
                    price: finalPrice,
                    quantity: 1,
                    halfPeriod: item.halfPeriod,
                    selectedYear: item.selectedYear,
                    selectedMonth: item.selectedMonth,
                    panel_slot_usage_id: item.panel_slot_usage_id,
                    panel_slot_snapshot: item.panel_slot_snapshot,
                    // 아이템별 정보 추가
                    draftId: itemDraftIds[item.id] || undefined,
                    designDraftId: itemDraftIds[item.id] || draftId || null,
                    draftDeliveryMethod:
                      itemDraftDeliveryMethods[item.id] || draftDeliveryMethod,
                    projectName:
                      itemCount >= 2 && !isBulkFileUpload
                        ? currentItemStates[item.id]?.projectName || ''
                        : projectName,
                    usePreviousDesign,
                    selfMadeReuse,
                    mapoFreeInstall,
                  };
                }),
                userAuthId,
                userProfileId: finalUserProfileId,
                draftDeliveryMethod,
                projectName,
                draftId,
                // 아이템별 정보 추가
                itemDraftIds:
                  Object.keys(itemDraftIds).length > 0
                    ? itemDraftIds
                    : undefined,
                itemDraftDeliveryMethods:
                  Object.keys(itemDraftDeliveryMethods).length > 0
                    ? itemDraftDeliveryMethods
                    : undefined,
                district: currentTossWidgetData.district,
                email: currentTossWidgetData.email,
                contact_person_name: currentTossWidgetData.contact_person_name,
                phone: currentTossWidgetData.phone,
              };

              // localStorage에 결제 정보 저장 (결제 성공 페이지에서 사용)
              localStorage.setItem(
                'pending_order_data',
                JSON.stringify(paymentData)
              );
              console.log('🔍 [결제 페이지] 결제 정보 localStorage 저장 완료');

              // 전화번호 정리 (숫자만 남기기)
              const sanitizedPhone = (
                currentTossWidgetData.phone || '010-0000-0000'
              ).replace(/\D/g, '');

              // 전화번호 검증
              if (!sanitizedPhone || sanitizedPhone.length < 10) {
                console.error(
                  '🔍 [결제 페이지] ❌ 전화번호 형식 오류:',
                  sanitizedPhone
                );
                alert('전화번호 형식이 올바르지 않습니다.');
                paymentButton.disabled = false;
                paymentButton.textContent = '카드/간편결제';
                return;
              }

              // 통합결제창 SDK가 준비되었는지 확인
              if (!tossPayments) {
                console.error('🔍 [결제 페이지] ❌ 토스 SDK가 초기화되지 않음');
                alert(
                  '결제 SDK가 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.'
                );
                paymentButton.disabled = false;
                paymentButton.textContent = '카드/간편결제';
                return;
              }

              // 결제 요청 파라미터 검증
              const successUrl = `${window.location.origin}/payment/success?orderId=${finalOrderId}`;
              const failUrl = `${window.location.origin}/payment/fail?orderId=${finalOrderId}`;

              if (typeof window !== 'undefined') {
                if (encodedItemsParam) {
                  window.localStorage.setItem(
                    PENDING_PAYMENT_ITEMS_KEY,
                    encodedItemsParam
                  );
                } else {
                  window.localStorage.removeItem(PENDING_PAYMENT_ITEMS_KEY);
                }
              }

              console.log('🔍 [로컬 디버깅] 결제 URL 생성:', {
                windowOrigin: window.location.origin,
                hostname: window.location.hostname,
                protocol: window.location.protocol,
                successUrl,
                failUrl,
                orderId: finalOrderId,
                note: '로컬 환경에서는 localhost를 사용해야 하며, 토스페이먼츠 테스트 키가 필요합니다.',
              });

              const isConsultingGroup =
                currentTossWidgetData.district === '상담신청';

              const displayTypeLabel = getDisplayTypeLabel(
                currentTossWidgetData
              );

              const paymentParams = {
                orderId: finalOrderId,
                orderName: isConsultingGroup
                  ? '상담신청'
                  : `${currentTossWidgetData.district} ${displayTypeLabel}`,
                successUrl,
                failUrl,
                customerEmail:
                  currentTossWidgetData.email || 'customer@example.com',
                customerName:
                  currentTossWidgetData.contact_person_name || '고객',
                customerMobilePhone: sanitizedPhone,
              };

              // 모든 필수 파라미터 검증
              if (
                !paymentParams.orderId ||
                !paymentParams.orderName ||
                !paymentParams.successUrl ||
                !paymentParams.failUrl ||
                !paymentParams.customerEmail ||
                !paymentParams.customerName ||
                !paymentParams.customerMobilePhone
              ) {
                console.error('🔍 [결제 페이지] ❌ 결제 파라미터 누락:', {
                  hasOrderId: !!paymentParams.orderId,
                  hasOrderName: !!paymentParams.orderName,
                  hasSuccessUrl: !!paymentParams.successUrl,
                  hasFailUrl: !!paymentParams.failUrl,
                  hasCustomerEmail: !!paymentParams.customerEmail,
                  hasCustomerName: !!paymentParams.customerName,
                  hasCustomerMobilePhone: !!paymentParams.customerMobilePhone,
                });
                alert('결제 정보가 불완전합니다. 다시 시도해주세요.');
                paymentButton.disabled = false;
                paymentButton.textContent = '카드/간편결제';
                return;
              }

              // 테스트용 0원 결제 확인
              const isTestFreePaymentEnabled =
                process.env.NEXT_PUBLIC_ENABLE_TEST_FREE_PAYMENT === 'true';
              const testFreePaymentUserId =
                process.env.NEXT_PUBLIC_TEST_FREE_PAYMENT_USER_ID || 'testsung';
              const isTestUser =
                currentUser?.username === testFreePaymentUserId ||
                currentUser?.id === testFreePaymentUserId;
              const shouldUseTestFlow =
                isTestFreePaymentEnabled && isTestUser && tossWidgetData;

              // 디버깅 로그
              console.log('🔍 [통합결제창] 테스트 결제 디버깅:', {
                isTestFreePaymentEnabled,
                envValue: process.env.NEXT_PUBLIC_ENABLE_TEST_FREE_PAYMENT,
                testFreePaymentUserId,
                currentUserUsername: currentUser?.username,
                currentUserId: currentUser?.id,
                isTestUser,
                originalAmount: currentTossWidgetData.totalPrice,
              });

              // 테스트 유저인 경우 위젯 스킵하고 바로 서버로 요청
              if (shouldUseTestFlow) {
                console.log(
                  '🔍 [통합결제창] ⚠️ 테스트 유저 감지 - 위젯 스킵하고 바로 주문 생성'
                );

                try {
                  const testPaymentKey = `test_free_${finalOrderId}`;
                  const confirmResponse = await fetch(
                    '/api/payment/toss/confirm',
                    {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        paymentKey: testPaymentKey,
                        orderId: finalOrderId,
                        amount: finalTotalPrice,
                        orderData: paymentData,
                      }),
                    }
                  );

                  const confirmResponseClone = confirmResponse.clone();
                  const confirmResult = await confirmResponse.json();

                  if (!confirmResponse.ok || !confirmResult.success) {
                    console.error(
                      '🔍 [결제 페이지] ❌ 테스트 결제 주문 생성 실패:',
                      {
                        confirmResult,
                        confirmResponseStatus: confirmResponse.status,
                        confirmResponseText: await confirmResponseClone.text(),
                      }
                    );
                    alert(
                      confirmResult.error || '주문 생성 중 오류가 발생했습니다.'
                    );
                    paymentButton.disabled = false;
                    paymentButton.textContent = '카드/간편결제';
                    return;
                  }

                  console.log(
                    '🔍 [결제 페이지] ✅ 테스트 결제 주문 생성 성공:',
                    confirmResult
                  );

                  console.log('🔍 [결제 페이지] 장바구니 초기화');
                  const paidItemIds = paymentData.items.map((item) => item.id);
                  if (paidItemIds.length > 0) {
                    cartDispatch({ type: 'REMOVE_ITEMS', ids: paidItemIds });
                  }

                  window.location.href = `/payment/success?orderId=${
                    confirmResult.data?.orderId || finalOrderId
                  }&amount=0&status=SUCCESS&paymentKey=${encodeURIComponent(
                    testPaymentKey
                  )}`;
                  return;
                } catch (error) {
                  console.error('🔍 [결제 페이지] ❌ 테스트 결제 예외:', error);
                  alert('주문 생성 중 오류가 발생했습니다.');
                  paymentButton.disabled = false;
                  paymentButton.textContent = '카드/간편결제';
                  return;
                }
              }

              // 일반 유저는 기존대로 토스 위젯 열기
              const paymentRequestStart = performance.now();

              logPaymentDebug('결제 요청 페이로드 준비됨', {
                isTestUser,
                clientKey: process.env.NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY
                  ? '[REDACTED]'
                  : '(없음)',
                paymentMethod: 'CARD',
                amount: currentTossWidgetData.totalPrice,
                hasUserActivation:
                  typeof navigator !== 'undefined'
                    ? navigator.userActivation?.hasBeenActive
                    : null,
              });

              console.log('🔍 [통합결제창] 결제 요청 시작:', {
                orderId: paymentParams.orderId,
                orderName: paymentParams.orderName,
                originalAmount: currentTossWidgetData.totalPrice,
                finalAmount: finalTotalPrice,
                isGwanakSelfMadeReuse,
                isTestUser,
                isTestFreePaymentEnabled,
                hasTossPayments: !!tossPayments,
                paymentMethod: 'CARD',
                paymentRequestStart,
              });

              // 통합결제창 방식: tossPayments.requestPayment() 직접 호출
              // 문서: https://docs.tosspayments.com/guides/v2/payment-window/integration
              await tossPayments.requestPayment('CARD', {
                amount: finalTotalPrice,
                orderId: paymentParams.orderId,
                orderName: paymentParams.orderName,
                customerName: paymentParams.customerName,
                customerEmail: paymentParams.customerEmail,
                customerMobilePhone: paymentParams.customerMobilePhone,
                successUrl: paymentParams.successUrl,
                failUrl: paymentParams.failUrl,
              });

              logPaymentDebug('requestPayment 호출됨', {
                orderId: paymentParams.orderId,
                requestCompletionTimestamp: performance.now(),
              });

              console.log(
                '🔍 [통합결제창] ✅ 결제창 열기 요청 완료 (리다이렉트 예상)'
              );
            } catch (err) {
              console.error('🔍 [결제 페이지] ❌ 결제 요청 실패:', err);
              alert('결제 요청 중 오류가 발생했습니다.');
              paymentButton.disabled = false;
              paymentButton.textContent = '카드/간편결제';
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

          // #region agent log - hypothesis D (toss init failure)
          const err = error as unknown as {
            name?: unknown;
            message?: unknown;
            stack?: unknown;
          };
          postAgentDebugLog({
            sessionId: 'debug-session',
            runId: debugRunIdRef.current,
            hypothesisId: 'D',
            location: 'src/app/payment/page.tsx:initializeTossWidget(catch)',
            message: 'toss init failed',
            data: {
              groupId: tossWidgetData?.id,
              errorName: typeof err?.name === 'string' ? err.name : undefined,
              errorMessage:
                typeof err?.message === 'string' ? err.message : undefined,
              stack:
                typeof err?.stack === 'string'
                  ? err.stack.slice(0, 800)
                  : undefined,
            },
            timestamp: Date.now(),
          });
          // #endregion

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tossWidgetOpen, tossWidgetData]);

  // 모든 그룹 보여주기 (토스 위젯에서 직접 처리)
  const visibleGroups = groupedItems;

  // 그룹(구별)별 디스플레이 타입 라벨
  const getDisplayTypeLabel = (group: GroupedCartItem): string => {
    // 상단광고: panel_type 또는 banner_type이 top_fixed 인 경우
    const hasTopFixed =
      group.panel_type === 'top_fixed' ||
      group.items.some(
        (item) =>
          item.panel_type === 'top_fixed' ||
          item.panel_slot_snapshot?.banner_type === 'top_fixed'
      );

    if (hasTopFixed) return '상단광고';

    if (group.type === 'banner-display') return '현수막게시대';
    if (group.type === 'led-display') return '전자게시대';
    if (group.type === 'digital-signage') return '디지털미디어 쇼핑몰';

    return '상품';
  };

  // 디버깅: visibleGroups 상태 확인
  useEffect(() => {
    console.log('🔍 [UI 렌더링] visibleGroups 상태:', {
      visibleGroupsCount: visibleGroups.length,
      groupedItemsCount: groupedItems.length,
      visibleGroups: visibleGroups.map((group) => ({
        id: group.id,
        name: group.name,
        district: group.district,
        itemsCount: group.items.length,
        user_profile_id: group.user_profile_id,
      })),
    });
  }, [visibleGroups, groupedItems]);

  return (
    <main className="min-h-screen bg-white pt-[5.5rem] bg-gray-100 lg:px-[4rem] xl:px-[6rem] 2xl:px-[10rem]">
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
          {/* 구별 카드 */}
          {visibleGroups.map((group) => {
            // 디스플레이 타입 라벨
            const displayTypeLabel = getDisplayTypeLabel(group);

            // 상담신청을 통해 결제페이지로 온 상품들 (구 이름이 '상담신청'인 그룹)
            const isConsultingGroup = group.district === '상담신청';

            // 헤더 제목
            const headerTitle = isConsultingGroup
              ? '상담신청'
              : `${group.district} ${displayTypeLabel}`;

            // 항목 개수 (상담신청 등 items가 비어있어도 최소 1개로 표시)
            const itemCount = group.items.length > 0 ? group.items.length : 1;
            const unitLabel = isConsultingGroup
              ? '상품'
              : group.items.length === 0
              ? '상품'
              : group.type === 'banner-display' || group.type === 'led-display'
              ? '패널'
              : '상품';

            return (
              <section
                key={group.id}
                className="p-6 border rounded-lg shadow-sm flex flex-col gap-4 sm:p-2"
              >
                <div className="flex items-center mb-2">
                  <span className="text-1.25 font-700 text-[#222] sm:text-0.875">
                    {headerTitle}
                  </span>
                  <span className="text-gray-500 text-0.875 ml-2">
                    ({itemCount}개 {unitLabel})
                  </span>
                </div>

                {/* 아이템이 2개 이상일 때 일괄적용 체크박스 - 항상 표시 */}
                {itemCount >= 2 && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`bulk-project-${group.id}`}
                          checked={bulkApply.projectName}
                          onChange={handleBulkProjectNameToggle}
                          className="w-4 h-4"
                        />
                        <label
                          htmlFor={`bulk-project-${group.id}`}
                          className="text-sm text-gray-700 font-medium"
                        >
                          작업이름 일괄적용
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`bulk-file-${group.id}`}
                          checked={
                            bulkApply.fileUpload || bulkApply.emailMethod
                          }
                          onChange={() => {
                            if (bulkApply.fileUpload || bulkApply.emailMethod) {
                              setBulkApply((prev) => ({
                                ...prev,
                                fileUpload: false,
                                emailMethod: false,
                              }));
                            } else {
                              handleBulkFileUploadToggle();
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <label
                          htmlFor={`bulk-file-${group.id}`}
                          className="text-sm text-gray-700 font-medium"
                        >
                          시안 일괄적용
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* 그룹 단위 작업이름 - 아이템 1개이거나 작업이름 일괄적용이 체크되었을 때 */}
                {(itemCount === 1 || bulkApply.projectName) && (
                  <div className="mb-4">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                      <label className="w-full sm:w-[8rem] text-gray-600 font-medium text-sm">
                        작업이름
                      </label>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={groupStates[group.id]?.projectName || ''}
                          onChange={(e) =>
                            handleGroupProjectNameChange(
                              group.id,
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          placeholder="작업 이름을 입력하세요"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 그룹 단위 광고내용 - 아이템 1개이거나 작업이름 일괄적용이 체크되었을 때 */}
                {(itemCount === 1 || bulkApply.projectName) && (
                  <div className="mb-4">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                      <label className="w-full sm:w-[8rem] text-gray-600 font-medium text-sm">
                        광고내용
                      </label>
                      <div className="flex-1">
                        <textarea
                          value={groupStates[group.id]?.adContent || ''}
                          onChange={(e) =>
                            handleGroupAdContentChange(group.id, e.target.value)
                          }
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-none"
                          placeholder="광고 내용을 입력하세요"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 그룹 단위 시안 업로드 - 아이템 1개이거나 시안 일괄적용이 체크되었을 때 */}
                {(itemCount === 1 ||
                  bulkApply.fileUpload ||
                  bulkApply.emailMethod) && (
                  <div className="mb-4">
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
                            checked={
                              groupStates[group.id]?.sendByEmail || false
                            }
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
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`previous-design-${group.id}`}
                            checked={
                              groupStates[group.id]?.usePreviousDesign || false
                            }
                            onChange={(e) =>
                              handleGroupPreviousDesignSelect(group.id, e.target.checked)
                            }
                            className="w-4 h-4"
                          />
                          <label
                            htmlFor={`previous-design-${group.id}`}
                            className="text-sm text-gray-500"
                          >
                            이전 디자인 동일
                          </label>
                        </div>
                        {/* 관악구일 때만 자체제작/1회 재사용 체크박스 표시 */}
                        {group.district === '관악구' && (
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`self-made-reuse-${group.id}`}
                              checked={
                                groupStates[group.id]?.selfMadeReuse || false
                              }
                              onChange={(e) =>
                                handleGroupSelfMadeReuseSelect(group.id, e.target.checked)
                              }
                              className="w-4 h-4"
                            />
                            <label
                              htmlFor={`self-made-reuse-${group.id}`}
                              className="text-sm text-gray-500"
                            >
                              자체제작・1회재사용
                            </label>
                            {groupStates[group.id]?.selfMadeReuse && (
                              <span className="text-xs text-blue-600 font-medium">
                                78,000원
                              </span>
                            )}
                          </div>
                        )}
                        {/* 마포구 저단형 + 행정용일 때 자체제작・설치 0원 체크박스 표시 */}
                        {group.district === '마포구' && group.panel_type === 'lower_panel' && group.is_public_institution && (
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`mapo-free-install-${group.id}`}
                              checked={
                                groupStates[group.id]?.mapoFreeInstall || false
                              }
                              onChange={(e) =>
                                handleGroupMapoFreeInstallSelect(group.id, e.target.checked)
                              }
                              className="w-4 h-4"
                            />
                            <label
                              htmlFor={`mapo-free-install-${group.id}`}
                              className="text-sm text-gray-500"
                            >
                              자체제작・설치・철거: 0원
                            </label>
                            {groupStates[group.id]?.mapoFreeInstall && (
                              <span className="text-xs text-green-600 font-medium ml-1">
                                무료
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 구별 아이템 목록 */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-semibold mb-2 text-gray-700">
                    결제할 게시대 목록:
                  </h3>
                  <div className="space-y-4">
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

                      const itemState = itemStates[item.id];

                      return (
                        <div
                          key={item.id}
                          className="border border-gray-200 rounded-lg p-3 bg-white"
                        >
                          <div className="text-sm text-gray-600 mb-3">
                            <span className="font-medium">
                              {index + 1}. 패널번호:{' '}
                              {item.panel_code || item.panel_id || '-'} / 이름:{' '}
                              {item.name || '-'} / 구: {item.district} / 기간:{' '}
                              {itemPeriodText}
                            </span>
                          </div>

                          {/* 아이템별 입력란 - 아이템 2개 이상이고 해당 항목의 일괄적용이 체크되지 않았을 때만 표시 */}
                          {itemCount >= 2 && (
                            <div className="space-y-3 mt-3">
                              {/* 아이템별 작업이름 - 작업이름 일괄적용이 체크되지 않았을 때만 표시 */}
                              {!bulkApply.projectName && (
                                <div className="flex flex-col gap-2">
                                  <label className="text-xs text-gray-600 font-medium">
                                    작업이름
                                  </label>
                                  <input
                                    type="text"
                                    value={itemState?.projectName || ''}
                                    onChange={(e) =>
                                      handleItemProjectNameChange(
                                        item.id,
                                        e.target.value
                                      )
                                    }
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                    placeholder="작업 이름을 입력하세요"
                                  />
                                </div>
                              )}

                              {/* 아이템별 광고내용 - 작업이름 일괄적용이 체크되지 않았을 때만 표시 */}
                              {!bulkApply.projectName && (
                                <div className="flex flex-col gap-2">
                                  <label className="text-xs text-gray-600 font-medium">
                                    광고내용
                                  </label>
                                  <textarea
                                    value={itemState?.adContent || ''}
                                    onChange={(e) =>
                                      handleItemAdContentChange(
                                        item.id,
                                        e.target.value
                                      )
                                    }
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-none"
                                    placeholder="광고 내용을 입력하세요"
                                    rows={3}
                                  />
                                </div>
                              )}

                              {/* 아이템별 시안 업로드 - 시안 일괄적용이 체크되지 않았을 때만 표시 */}
                              {!bulkApply.fileUpload &&
                                !bulkApply.emailMethod && (
                                  <div className="flex flex-col gap-2">
                                    <label className="text-xs text-gray-600 font-medium">
                                      시안 업로드
                                    </label>
                                    <div className="space-y-2">
                                      <CustomFileUpload
                                        onFileSelect={(file) =>
                                          handleItemFileSelect(item.id, file)
                                        }
                                        disabled={itemState?.sendByEmail}
                                        placeholder="시안 파일을 선택해주세요"
                                        className="w-full"
                                      />
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="checkbox"
                                          id={`email-item-${item.id}`}
                                          checked={
                                            itemState?.sendByEmail || false
                                          }
                                          onChange={(e) =>
                                            handleItemEmailSelect(
                                              item.id,
                                              e.target.checked
                                            )
                                          }
                                          className="w-4 h-4"
                                        />
                                        <label
                                          htmlFor={`email-item-${item.id}`}
                                          className="text-xs text-gray-500"
                                        >
                                          이메일로 파일 보낼게요
                                        </label>
                                      </div>
                                      {itemState?.sendByEmail && (
                                        <p className="text-xs text-gray-500 ml-6">
                                          banner114@hanmail.net로 시안을
                                          보내주세요.
                                        </p>
                                      )}
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="checkbox"
                                          id={`previous-design-item-${item.id}`}
                                          checked={
                                            itemState?.usePreviousDesign || false
                                          }
                                          onChange={(e) =>
                                            handleItemPreviousDesignSelect(
                                              item.id,
                                              e.target.checked
                                            )
                                          }
                                          className="w-4 h-4"
                                        />
                                        <label
                                          htmlFor={`previous-design-item-${item.id}`}
                                          className="text-xs text-gray-500"
                                        >
                                          이전 디자인 동일
                                        </label>
                                      </div>
                                      {/* 관악구일 때만 자체제작/1회 재사용 체크박스 표시 */}
                                      {item.district === '관악구' && (
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="checkbox"
                                            id={`self-made-reuse-item-${item.id}`}
                                            checked={
                                              itemState?.selfMadeReuse || false
                                            }
                                            onChange={(e) =>
                                              handleItemSelfMadeReuseSelect(
                                                item.id,
                                                e.target.checked
                                              )
                                            }
                                            className="w-4 h-4"
                                          />
                                          <label
                                            htmlFor={`self-made-reuse-item-${item.id}`}
                                            className="text-xs text-gray-500"
                                          >
                                            자체제작・1회재사용
                                          </label>
                                          {itemState?.selfMadeReuse && (
                                            <span className="text-xs text-blue-600 font-medium">
                                              78,000원
                                            </span>
                                          )}
                                        </div>
                                      )}
                                      {/* 마포구 저단형 + 행정용일 때 자체제작・설치 0원 체크박스 표시 */}
                                      {item.district === '마포구' && group.panel_type === 'lower_panel' && group.is_public_institution && (
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="checkbox"
                                            id={`mapo-free-install-item-${item.id}`}
                                            checked={
                                              itemState?.mapoFreeInstall || false
                                            }
                                            onChange={(e) =>
                                              handleItemMapoFreeInstallSelect(
                                                item.id,
                                                e.target.checked
                                              )
                                            }
                                            className="w-4 h-4"
                                          />
                                          <label
                                            htmlFor={`mapo-free-install-item-${item.id}`}
                                            className="text-xs text-gray-500"
                                          >
                                            자체제작・설치・철거: 0원
                                          </label>
                                          {itemState?.mapoFreeInstall && (
                                            <span className="text-xs text-green-600 font-medium ml-1">
                                              무료
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                            </div>
                          )}
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
                      <span className="text-gray-600">수수료:</span>
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
                          {(() => {
                            // 마포구 저단형 무료 설치 확인 (행정용)
                            const isMapoFreeEligible =
                              group.district === '마포구' &&
                              group.panel_type === 'lower_panel' &&
                              group.is_public_institution === true &&
                              groupStates[group.id]?.mapoFreeInstall;
                            if (isMapoFreeEligible) {
                              return '0';
                            }
                            // 관악구이고 자체제작/1회 재사용이 체크된 경우 할인 가격 적용
                            if (group.district === '관악구' && groupStates[group.id]?.selfMadeReuse) {
                              const discountedTotal = group.items.length * GWANAK_PREVIOUS_DESIGN_PRICE;
                              return discountedTotal.toLocaleString();
                            }
                            return group.totalPrice.toLocaleString();
                          })()} 원
                        </span>
                      </div>
                      {/* 마포구 저단형 무료 설치 적용 메시지 */}
                      {group.district === '마포구' && group.panel_type === 'lower_panel' && group.is_public_institution && groupStates[group.id]?.mapoFreeInstall && (
                        <div className="flex justify-between text-xs text-green-600 mt-1">
                          <span>무료 적용 (자체제작・설치・철거)</span>
                          <span>-{group.totalPrice.toLocaleString()} 원</span>
                        </div>
                      )}
                      {group.district === '관악구' && groupStates[group.id]?.selfMadeReuse && (
                        <div className="flex justify-between text-xs text-blue-600 mt-1">
                          <span>할인 적용 (자체제작・1회재사용)</span>
                          <span>-{(group.totalPrice - group.items.length * GWANAK_PREVIOUS_DESIGN_PRICE).toLocaleString()} 원</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* 세금계산서 */}
                <div className="mb-4">
                  <div className="flex flex-col items-start gap-2">
                    <div className="flex items-center justify-center gap-2">
                      <input
                        type="checkbox"
                        id="modal-tax"
                        checked={modalTaxInvoice}
                        onChange={(e) => setModalTaxInvoice(e.target.checked)}
                        className="w-4 h-4"
                      />

                      <label htmlFor="modal-tax">
                        세금계산서 발급을 원합니다
                      </label>
                    </div>
                    <span>
                      *세금계산서 발행시 입금자명을 사업자명으로 표시해주세요.
                    </span>
                    <span>*세금계산서 미발행시 현금영수증 가능합니다.</span>
                  </div>
                </div>
                {/* 결제 버튼 */}
                <div className="mt-2">
                  {/* 결제 조건 확인 */}
                  {(() => {
                    const groupState = groupStates[group.id];
                    const itemCount =
                      group.items.length > 0 ? group.items.length : 1;

                    // 작업이름 확인
                    let hasProjectName = false;
                    if (itemCount === 1 || bulkApply.projectName) {
                      // 아이템 1개이거나 작업이름 일괄적용이 체크되었을 때
                      hasProjectName = !!(
                        groupState?.projectName &&
                        groupState.projectName.trim() !== ''
                      );
                    } else {
                      // 아이템 2개 이상이고 작업이름 일괄적용이 꺼져있을 때
                      hasProjectName = group.items.every((item) => {
                        const itemState = itemStates[item.id];
                        return !!(
                          itemState?.projectName &&
                          itemState.projectName.trim() !== ''
                        );
                      });
                    }

                    // 시안 업로드 확인 (이전 디자인/자체제작 사용 시 스킵)
                    let hasFileUploadMethod = false;
                    const useExistingDesignForButton =
                      !!groupState?.usePreviousDesign || !!groupState?.selfMadeReuse;

                    if (useExistingDesignForButton) {
                      // 이전 디자인 또는 자체제작・1회재사용 체크 시 파일 업로드 불필요
                      hasFileUploadMethod = true;
                    } else if (
                      itemCount === 1 ||
                      bulkApply.fileUpload ||
                      bulkApply.emailMethod
                    ) {
                      // 아이템 1개이거나 시안 일괄적용이 체크되었을 때
                      hasFileUploadMethod =
                        !!groupState?.selectedFile || !!groupState?.sendByEmail;
                    } else {
                      // 아이템 2개 이상이고 시안 일괄적용이 꺼져있을 때
                      hasFileUploadMethod = group.items.every((item) => {
                        const itemState = itemStates[item.id];
                        const itemUseExisting =
                          !!itemState?.usePreviousDesign || !!itemState?.selfMadeReuse;
                        return (
                          itemUseExisting || !!itemState?.selectedFile || !!itemState?.sendByEmail
                        );
                      });
                    }

                    const hasAgreedToTerms = isAgreedCaution;

                    const isButtonEnabled =
                      hasProjectName && hasFileUploadMethod && hasAgreedToTerms;

                    // 마포구 저단형 무료 설치 확인 (행정용)
                    const isMapoFreeEligible =
                      group.district === '마포구' &&
                      group.panel_type === 'lower_panel' &&
                      group.is_public_institution === true &&
                      groupStates[group.id]?.mapoFreeInstall;

                    return (
                      <>
                        <Button
                          onClick={() => isMapoFreeEligible ? handleMapoFreeOrder(group) : openTossWidget(group)}
                          disabled={!isButtonEnabled}
                          className={`w-full py-2 rounded-lg border ${
                            isMapoFreeEligible
                              ? 'border-green-600'
                              : group.name?.includes('남은구')
                                ? 'border-pink-600'
                                : 'border-blue-600'
                          } ${
                            isButtonEnabled
                              ? isMapoFreeEligible
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : group.name?.includes('남은구')
                                  ? 'bg-pink-600 text-white hover:bg-pink-700'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          }`}
                        >
                          {group.name} {isMapoFreeEligible ? '주문하기 (무료)' : '결제하기'}
                        </Button>

                        {!isButtonEnabled && (
                          <div className="mt-2 text-xs text-red">
                            {!hasProjectName && (
                              <div>• 작업이름을 입력해주세요</div>
                            )}
                            {!hasFileUploadMethod && (
                              <div>
                                •{' '}
                                {bulkApply.fileUpload || bulkApply.emailMethod
                                  ? '파일 업로드 방법을 선택해주세요'
                                  : '모든 아이템의 시안 업로드 방법을 선택해주세요'}
                              </div>
                            )}
                            {!hasAgreedToTerms && (
                              <div className="text-1">
                                • 유의사항에 동의해주세요
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </section>
            );
          })}
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
                    법정공휴일 또는 강풍, 우천, 폭설 시에는 현수막 게시 일정이
                    전후날로 변경 될 수 있습니다.
                  </li>
                  <li>
                    현수막 게시 기간 중, 태풍, 재난, 긴급 공사 등의 사유가
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
                    현수막 접수일 기준(주말·공휴일 제외)으로 3일내에 입금 및
                    결제를 진행해야 합니다.
                  </li>
                  <li>
                    결제기간 내 결제하지 않을 시 통보 후 기간 조율 또는 취소를
                    진행할 수 있습니다.
                  </li>
                  <li>게시일 기준 2주 전까지는 100% 환불할 수 있습니다.</li>
                  <li>
                    디자인 조율 후 출력 및 제작이 들어간 상태라면 출력비용을
                    제외하고 환불받을 수 있습니다.
                  </li>
                  <li>
                    출력 후 게시 준비까지 마무리되었다면 환불을 받을 수
                    없습니다.
                  </li>
                  <li>
                    게시 후, 단순 변심으로 인한 게시 취소일 경우
                    철거비용(인건비와 장비비용)을 지불하고 철거해야 합니다.
                  </li>
                  <li>
                    게시물 허용한 내용이 미관을 해치거나 혐오를 줄 수 있는
                    내용일 시 강제취소를 통보받을 수 있으며 환불을 진행받을 수
                    있습니다.
                  </li>
                </ul>
              </div>

              {/* 일반 유의사항 (구별 공통 - 항상 표시) */}
              {Object.entries(generalNotices).map(([district, notices]) => {
                // 해당 구가 장바구니에 있는 경우에만 표시
                const hasDistrict = groupedItems.some((g) => g.district === district);
                if (!hasDistrict || !notices || notices.length === 0) return null;

                return notices.map((notice, idx) => (
                  <div key={`general-${district}-${idx}`} className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
                    <h4 className="font-semibold text-gray-800 mb-3">
                      {notice.title} ({district})
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-2">
                      {notice.items.map((item: { text: string; important: boolean } | string, itemIdx: number) => {
                        const text = typeof item === 'string' ? item : item.text;
                        const important = typeof item === 'string' ? false : item.important;
                        return (
                          <li
                            key={itemIdx}
                            style={{
                              color: important ? '#dc2626' : undefined,
                              fontWeight: important ? 600 : undefined
                            }}
                          >
                            {text}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ));
              })}

              {/* 자체제작 유의사항 (구별) */}
              {Object.entries(selfMadeNotices).map(([district, notices]) => {
                // 해당 구에서 자체제작이 체크된 경우에만 표시
                const hasCheckedSelfMade = groupedItems.some(
                  (g) => g.district === district && groupStates[g.id]?.selfMadeReuse
                );
                if (!hasCheckedSelfMade || !notices || notices.length === 0) return null;

                return notices.map((notice, idx) => (
                  <div key={`${district}-${idx}`} className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
                    <h4 className="font-semibold text-gray-800 mb-3">
                      {notice.title} ({district})
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-2">
                      {notice.items.map((item: { text: string; important: boolean } | string, itemIdx: number) => {
                        const text = typeof item === 'string' ? item : item.text;
                        const important = typeof item === 'string' ? false : item.important;
                        return (
                          <li
                            key={itemIdx}
                            style={{
                              color: important ? '#dc2626' : undefined,
                              fontWeight: important ? 600 : undefined
                            }}
                          >
                            {text}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ));
              })}

              {/* 마포구 저단형 무료 설치 유의사항 (행정용) */}
              {Object.entries(mapoFreeInstallNotices).map(([district, notices]) => {
                // 마포구 저단형 무료 설치가 체크된 경우에만 표시
                const hasCheckedMapoFreeInstall = groupedItems.some(
                  (g) => g.district === district &&
                         g.panel_type === 'lower_panel' &&
                         g.is_public_institution === true &&
                         groupStates[g.id]?.mapoFreeInstall
                );
                if (!hasCheckedMapoFreeInstall || !notices || notices.length === 0) return null;

                return notices.map((notice, idx) => (
                  <div key={`mapo-free-${district}-${idx}`} className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
                    <h4 className="font-semibold text-gray-800 mb-3">
                      {notice.title} ({district})
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-2">
                      {notice.items.map((item: { text: string; important: boolean } | string, itemIdx: number) => {
                        const text = typeof item === 'string' ? item : item.text;
                        const important = typeof item === 'string' ? false : item.important;
                        return (
                          <li
                            key={itemIdx}
                            style={{
                              color: important ? '#dc2626' : undefined,
                              fontWeight: important ? 600 : undefined
                            }}
                          >
                            {text}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ));
              })}

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
                  {validationErrors.agreement && (
                    <span className="text-red text-sm block mt-1">
                      {validationErrors.agreement}
                    </span>
                  )}
                </label>
              </div>
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
                  {finalPriceSummary.roadUsageFee.toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">광고료:</span>
                <span className="font-medium">
                  {finalPriceSummary.advertisingFee.toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">수수료:</span>
                <span className="font-medium">
                  {finalPriceSummary.taxPrice.toLocaleString()}원
                </span>
              </div>
              {(() => {
                // 마포구 저단형 무료 설치 금액 계산 (행정용)
                const mapoFreeDiscount = groupedItems.reduce((sum, group) => {
                  const isMapoFreeEligible =
                    group.district === '마포구' &&
                    group.panel_type === 'lower_panel' &&
                    group.is_public_institution === true &&
                    groupStates[group.id]?.mapoFreeInstall;
                  if (isMapoFreeEligible) {
                    return sum + group.totalPrice;
                  }
                  return sum;
                }, 0);
                // 관악구 자체제작/1회 재사용 할인 금액 계산
                const gwanakDiscount = groupedItems.reduce((sum, group) => {
                  if (group.district === '관악구' && groupStates[group.id]?.selfMadeReuse) {
                    const originalTotal = group.totalPrice;
                    const discountedTotal = group.items.length * GWANAK_PREVIOUS_DESIGN_PRICE;
                    return sum + (originalTotal - discountedTotal);
                  }
                  return sum;
                }, 0);
                const totalDiscount = mapoFreeDiscount + gwanakDiscount;
                const finalTotal = finalPriceSummary.totalPrice - totalDiscount;

                return (
                  <div className="border-t pt-3">
                    {mapoFreeDiscount > 0 && (
                      <div className="flex justify-between text-green-600 mb-2">
                        <span>무료 적용 (자체제작・설치・철거)</span>
                        <span>-{mapoFreeDiscount.toLocaleString()}원</span>
                      </div>
                    )}
                    {gwanakDiscount > 0 && (
                      <div className="flex justify-between text-blue-600 mb-2">
                        <span>할인 적용 (자체제작・1회재사용)</span>
                        <span>-{gwanakDiscount.toLocaleString()}원</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold">
                      <span>총 결제 금액:</span>
                      <span>{finalTotal.toLocaleString()}원</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </section>
        </div>
      </div>

      <BankTransferModal
        open={bankModalOpen}
        group={bankModalGroup}
        loading={bankModalLoading}
        error={bankModalError}
        accountInfo={bankAccountInfo}
        isProcessing={isBankTransferProcessing}
        onClose={closeBankModal}
        onConfirm={handleBankTransferPayment}
        getDisplayTypeLabel={getDisplayTypeLabel}
        discountedTotalPrice={
          bankModalGroup && bankModalGroup.district === '관악구' && groupStates[bankModalGroup.id]?.selfMadeReuse
            ? bankModalGroup.items.length * GWANAK_PREVIOUS_DESIGN_PRICE
            : undefined
        }
        depositorName={depositorName}
        onDepositorNameChange={setDepositorName}
      />

      <TossPaymentModal
        open={tossWidgetOpen}
        data={tossWidgetData}
        user={user as unknown as { username?: string; id?: string } | null}
        isBankTransferProcessing={isBankTransferProcessing}
        onClose={() => {
          setTossWidgetOpen(false);
          setTossWidgetData(null);
        }}
        getDisplayTypeLabel={getDisplayTypeLabel}
        logPaymentDebug={logPaymentDebug}
        openBankTransferModal={openBankTransferModal}
        discountedTotalPrice={
          tossWidgetData && tossWidgetData.district === '관악구' && groupStates[tossWidgetData.id]?.selfMadeReuse
            ? tossWidgetData.items.length * GWANAK_PREVIOUS_DESIGN_PRICE
            : undefined
        }
      />

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
