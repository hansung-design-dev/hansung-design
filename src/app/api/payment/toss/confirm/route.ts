import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';
import { ensureDesignDraftForOrderItem } from '@/src/lib/designDrafts';
import { ensurePanelSlotUsageForItem } from '@/src/lib/slotResolver';
import { CartItem } from '@/src/contexts/cartContext';
import {
  resolveRegionGuDisplayPeriodRangeByPanel,
  type RegionGuDisplayPeriodResolverCache,
} from '@/src/lib/resolveRegionGuDisplayPeriod';

// 주문 아이템 타입 (CartItem에 quantity 추가)
interface OrderItem extends CartItem {
  quantity: number;
  design_draft_id?: string | null;
  projectName?: string;
  draftDeliveryMethod?: string | null;
}

const createEmptyPanelSlotSnapshot = (): NonNullable<
  CartItem['panel_slot_snapshot']
> => ({
  id: null,
  notes: null,
  max_width: null,
  slot_name: null,
  tax_price: null,
  created_at: null,
  max_height: null,
  price_unit: null,
  updated_at: null,
  banner_type: null,
  slot_number: null,
  total_price: null,
  panel_id: null,
  road_usage_fee: null,
  advertising_fee: null,
  panel_slot_status: null,
});

// 주문 생성 로직 (결제 확인 API에서 직접 사용)
async function createOrderAfterPayment(
  orderData: {
    items: OrderItem[];
    userAuthId: string;
    userProfileId?: string;
    draftDeliveryMethod: string;
    projectName: string;
    draftId?: string;
  },
  paymentMethodId: string,
  paymentInfo?: {
    transactionId?: string;
    paymentProviderMethod?: string;
    amount?: number;
    paymentType?: string;
    approveNo?: string;
    installmentMonths?: number;
  },
  externalOrderId?: string
) {
  const { items, userAuthId, userProfileId, draftDeliveryMethod, projectName } =
    orderData;

  console.log('🔍 [주문 생성] 시작...', {
    itemsCount: items.length,
    userAuthId,
    userProfileId,
    projectName,
  });

  // 사용자 프로필 조회
  let userProfile = null;
  if (userProfileId) {
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userProfileId)
      .single();

    if (!profileError && profile) {
      userProfile = profile;
    }
  }

  // 주문 번호 생성
  // - externalOrderId가 있으면 (예: 토스 orderId) 그 값을 그대로 사용
  // - 없으면 기존 방식(날짜 + 랜덤 문자열)으로 생성
  let orderNumber = externalOrderId;
  if (!orderNumber) {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    orderNumber = `${dateStr}-${randomStr}`;
  }

  // 총 가격 계산
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // 1. orders 테이블에 주문 생성 (결제 완료 상태)
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      payment_method_id: paymentMethodId,
      user_auth_id: userAuthId,
      user_profile_id: userProfileId || null,
      payment_status: 'completed', // 결제 완료 상태
      order_status: 'pending',
      draft_delivery_method: draftDeliveryMethod || 'upload',
    })
    .select('id, order_number, payment_status')
    .single();

  if (orderError || !order) {
    console.error('🔍 [주문 생성] ❌ orders 생성 실패:', orderError);
    throw new Error('주문 생성에 실패했습니다.');
  }

  console.log('🔍 [주문 생성] ✅ orders 생성 성공:', order.id);

  // 2. payments 테이블에 결제 정보 생성
  const paymentInsertData: {
    order_id: string;
    payment_method_id: string;
    amount: number;
    payment_status: string;
    payment_provider?: string;
    payment_date: string;
    admin_approval_status: string;
    transaction_id?: string;
    payment_type?: string;
    approve_no?: string;
    installment_months?: number;
  } = {
    order_id: order.id,
    payment_method_id: paymentMethodId,
    amount: paymentInfo?.amount || totalPrice,
    payment_status: 'completed',
    payment_date: new Date().toISOString(),
    admin_approval_status: 'approved',
  };

  // transaction_id와 payment_provider가 있으면 추가
  if (paymentInfo?.transactionId) {
    paymentInsertData.transaction_id = paymentInfo.transactionId;
  }
  if (paymentInfo?.paymentProviderMethod) {
    paymentInsertData.payment_provider = paymentInfo.paymentProviderMethod;
  }
  if (paymentInfo?.paymentType) {
    paymentInsertData.payment_type = paymentInfo.paymentType;
  }
  if (paymentInfo?.approveNo) {
    paymentInsertData.approve_no = paymentInfo.approveNo;
  }
  if (typeof paymentInfo?.installmentMonths === 'number') {
    paymentInsertData.installment_months = paymentInfo.installmentMonths;
  }

  console.log('🔍 [주문 생성] payments insert 시작:', {
    order_id: paymentInsertData.order_id,
    payment_method_id: paymentInsertData.payment_method_id,
    amount: paymentInsertData.amount,
    hasTransactionId: !!paymentInsertData.transaction_id,
    hasPaymentProvider: !!paymentInsertData.payment_provider,
  });

  const { data: paymentData, error: paymentError } = await supabase
    .from('payments')
    .insert(paymentInsertData)
    .select('id, order_id, payment_status')
    .single();

  if (paymentError) {
    console.error('🔍 [주문 생성] ❌ payments 생성 실패:', {
      error: paymentError,
      errorMessage: paymentError.message,
      errorDetails: paymentError.details,
      errorHint: paymentError.hint,
      insertData: paymentInsertData,
    });
    throw new Error(`결제 정보 저장 실패: ${paymentError.message}`);
  }

  if (!paymentData) {
    console.error('🔍 [주문 생성] ❌ payments 생성 결과가 없음');
    throw new Error('결제 정보가 생성되지 않았습니다.');
  }

  console.log('🔍 [주문 생성] ✅ payments 생성 성공:', {
    paymentId: paymentData.id,
    orderId: paymentData.order_id,
    paymentStatus: paymentData.payment_status,
  });

  // 3. order_details 및 panel_slot_usage 생성
  const orderDetails = [];
  const designDraftIdsByItem: Record<string, string | null> = {};
  const periodResolverCache: RegionGuDisplayPeriodResolverCache = {
    panelInfoByPanelId: new Map(),
    periodRangeByKey: new Map(),
  };

  for (const item of items) {
    // 기간 설정
    let displayStartDate: string;
    let displayEndDate: string;

    if (item.selectedPeriodFrom && item.selectedPeriodTo) {
      displayStartDate = item.selectedPeriodFrom;
      displayEndDate = item.selectedPeriodTo;
    } else if (item.halfPeriod && item.selectedYear && item.selectedMonth) {
      const year = item.selectedYear;
      const month = item.selectedMonth;

      const resolved = item.panel_id
        ? await resolveRegionGuDisplayPeriodRangeByPanel({
            panelId: item.panel_id,
            year,
            month,
            halfPeriod: item.halfPeriod,
            cache: periodResolverCache,
          })
        : null;

      if (resolved) {
        displayStartDate = resolved.from;
        displayEndDate = resolved.to;
      } else if (item.halfPeriod === 'first_half') {
        displayStartDate = `${year}-${String(month).padStart(2, '0')}-01`;
        displayEndDate = `${year}-${String(month).padStart(2, '0')}-15`;
      } else {
        const lastDay = new Date(year, month, 0).getDate();
        displayStartDate = `${year}-${String(month).padStart(2, '0')}-16`;
        displayEndDate = `${year}-${String(month).padStart(
          2,
          '0'
        )}-${lastDay}`;
      }
    } else {
      const priceUnit = item.panel_slot_snapshot?.price_unit || '15 days';
      const startDate = new Date();
      const endDate = new Date(startDate);

      if (priceUnit === '15 days') {
        endDate.setDate(startDate.getDate() + 15);
      } else if (priceUnit === '30 days') {
        endDate.setDate(startDate.getDate() + 30);
      } else if (priceUnit === '7 days') {
        endDate.setDate(startDate.getDate() + 7);
      } else {
        endDate.setDate(startDate.getDate() + 15);
      }

      displayStartDate = startDate.toISOString().split('T')[0];
      displayEndDate = endDate.toISOString().split('T')[0];
    }

    // panel_slot_usage 레코드 확보 (닫힌 슬롯이면 열린 슬롯으로 대체)
    let panelSlotUsageId = item.panel_slot_usage_id ?? null;
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/de0826ba-4e91-43eb-b001-5614ace69b75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H3',location:'src/app/api/payment/toss/confirm/route.ts:createOrderAfterPayment:beforeEnsureSlot',message:'calling ensurePanelSlotUsageForItem',data:{panel_id:item.panel_id??null,existingPanelSlotUsageId:panelSlotUsageId,displayStartDate,displayEndDate,snapshotSlotNumber:item.panel_slot_snapshot?.slot_number??null,snapshotBannerType:item.panel_slot_snapshot?.banner_type??null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    const slotResolution = await ensurePanelSlotUsageForItem({
      item,
      existingPanelSlotUsageId: panelSlotUsageId,
      displayStartDate,
      displayEndDate,
    });
    panelSlotUsageId = slotResolution.panelSlotUsageId;
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/de0826ba-4e91-43eb-b001-5614ace69b75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H3',location:'src/app/api/payment/toss/confirm/route.ts:createOrderAfterPayment:afterEnsureSlot',message:'ensurePanelSlotUsageForItem resolved',data:{panel_id:item.panel_id??null,panelSlotUsageId:panelSlotUsageId,slotNumber:slotResolution.slotNumber,slotCategory:slotResolution.slotCategory},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    if (!item.panel_slot_snapshot) {
      item.panel_slot_snapshot = createEmptyPanelSlotSnapshot();
    }

    if (slotResolution.slotNumber !== null) {
      item.panel_slot_snapshot.slot_number = slotResolution.slotNumber;
    }

    // order_details 생성
    const existingItemDraftId =
      item.designDraftId || item.design_draft_id || item.draftId || null;
    const projectNameForItem =
      item.projectName?.trim() ||
      projectName?.trim() ||
      item.name ||
      '프로젝트명 없음' ||
      '프로젝트명 없음';
    const itemDraftDeliveryMethod =
      item.draftDeliveryMethod || draftDeliveryMethod || 'upload';
    const designDraftIdForItem =
      existingItemDraftId ||
      (userProfile?.id
        ? await ensureDesignDraftForOrderItem({
            userProfileId: userProfile.id,
            projectName: projectNameForItem,
            orderNumber: order.order_number,
            panelId: item.panel_id,
            itemLabel: item.name || item.panel_id,
            draftDeliveryMethod: itemDraftDeliveryMethod,
          })
        : null);

    designDraftIdsByItem[item.id] = designDraftIdForItem;

    orderDetails.push({
      order_id: order.id,
      panel_id: item.panel_id,
      panel_slot_usage_id: panelSlotUsageId,
      slot_order_quantity: item.quantity,
      display_start_date: displayStartDate,
      display_end_date: displayEndDate,
      design_draft_id: designDraftIdForItem,
      use_previous_design: item.usePreviousDesign || false,
      self_made_reuse: item.selfMadeReuse || false, // 자체제작/1회 재사용 (관악구 할인)
      price: item.price, // 주문 당시 가격 저장
    });
  }

  // order_details 일괄 생성 (재고 차감 트리거 자동 실행)
  const { data: orderDetailsResult, error: orderDetailsError } = await supabase
    .from('order_details')
    .insert(orderDetails)
    .select('id, panel_slot_usage_id, panel_id');

  if (orderDetailsError) {
    console.error(
      '🔍 [주문 생성] ❌ order_details 생성 실패:',
      orderDetailsError
    );
    throw new Error('주문 상세 정보 생성에 실패했습니다.');
  }

  console.log(
    '🔍 [주문 생성] ✅ order_details 생성 성공:',
    orderDetailsResult?.length
  );

  const representativeDesignDraftId = Object.values(designDraftIdsByItem).find(
    (id): id is string => Boolean(id)
  );

  if (representativeDesignDraftId) {
    const { error: orderDraftUpdateError } = await supabase
      .from('orders')
      .update({
        design_drafts_id: representativeDesignDraftId,
      })
      .eq('id', order.id);

    if (orderDraftUpdateError) {
      console.error(
        '🔍 [주문 생성] orders.design_drafts_id 업데이트 실패:',
        orderDraftUpdateError
      );
    } else {
      console.log('🔍 [주문 생성] ✅ 대표 design_drafts_id를 orders에 연결:', {
        orderId: order.id,
        designDraftId: representativeDesignDraftId,
      });
    }
  } else {
    console.warn(
      '🔍 [주문 생성] 디자인 draft 생성되지 않음 (userProfile 혹은 아이템 로직 확인 필요)'
    );
  }

  return {
    orderId: order.id,
    orderNumber: order.order_number,
    totalPrice,
  };
}

export async function POST(request: NextRequest) {
  try {
    const {
      paymentKey,
      orderId,
      amount: rawAmount,
      orderData,
    } = await request.json();
    const requestedAmount =
      typeof rawAmount === 'number'
        ? rawAmount
        : typeof rawAmount === 'string'
        ? Number(rawAmount)
        : NaN;

    console.log(
      '🔍 [결제 확인 API] 시작 =========================================='
    );
    console.log('🔍 [결제 확인 API] 입력 파라미터:', {
      paymentKey: paymentKey ? `${paymentKey.substring(0, 20)}...` : '없음',
      orderId,
      amount: requestedAmount,
      hasOrderData: !!orderData,
    });

    if (!paymentKey || !orderId || Number.isNaN(requestedAmount)) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 테스트 결제 확인 (paymentKey가 test_free_로 시작하면 테스트 결제)
    const isTestPayment = paymentKey.startsWith('test_free_');

    // TODO: 테스트 완료 후 0원 결제 로직 제거
    // [임시] 테스트용 0원 결제 로직 (dev/stage 전용)
    const isTestFreePaymentEnabled =
      process.env.ENABLE_TEST_FREE_PAYMENT === 'true';
    const testFreePaymentUserId =
      process.env.TEST_FREE_PAYMENT_USER_ID || 'testsung';
    const isProd = process.env.NODE_ENV === 'production';
    const userId = orderData?.userAuthId;

    // 테스트 유저인지 확인
    const isTestUser =
      !isProd && isTestFreePaymentEnabled && userId === testFreePaymentUserId;

    // 테스트 결제인 경우 0원 처리
    let finalAmount = requestedAmount;
    if (isTestPayment || isTestUser) {
      finalAmount = 0;
      console.log('🔍 [결제 확인 API] ⚠️ 테스트용 0원 결제 적용:', {
        userId,
        originalAmount: requestedAmount,
        finalAmount: 0,
        isTestPayment,
        isTestUser,
      });
    }

    // 테스트 결제가 아니면 시크릿 키 필요
    const secretKey = process.env.TOSS_PAYMENTS_SECRET_KEY;
    if (!isTestPayment && !secretKey) {
      return NextResponse.json(
        { error: '서버 시크릿 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    // 0원 결제인 경우 토스페이먼츠 API 호출 스킵
    let confirmData: {
      code?: string;
      status?: string;
      totalAmount?: number;
      method?: string;
      approvedAt?: string;
      requestedAt?: string;
      orderId?: string;
      paymentKey?: string;
      message?: string;
      cancels?: Array<{
        cancelAmount?: number;
        canceledAt?: string;
        cancelStatus?: string;
      }>;
      card?: {
        approveNo?: string;
        installmentPlanMonths?: number;
        [key: string]: unknown;
      };
      [key: string]: unknown;
    } | null = null;
    let confirmResponse: Response | null = null;

    if (finalAmount === 0) {
      console.log(
        '🔍 [결제 확인 API] ⚠️ 0원 결제 - 토스페이먼츠 API 호출 스킵, 바로 주문 생성으로 진행'
      );
      // 0원 결제는 토스페이먼츠 API를 호출하지 않고 가짜 응답 생성
      confirmData = {
        code: 'SUCCESS',
        status: 'DONE',
        totalAmount: 0,
        method: 'FREE',
        approvedAt: new Date().toISOString(),
        requestedAt: new Date().toISOString(),
        orderId: orderId,
        paymentKey: paymentKey,
      };
    } else {
      // ⚠️ 중요: 토스페이먼츠 결제 승인 API 호출 (이 호출이 실제로 카드에서 돈을 빠져나가게 함)
      if (!secretKey) {
        return NextResponse.json(
          { error: '서버 시크릿 키가 설정되지 않았습니다.' },
          { status: 500 }
        );
      }

      console.log(
        '🔍 [결제 확인 API] 토스페이먼츠 결제 승인 API 호출 시작...',
        {
          paymentKey: paymentKey
            ? `${paymentKey.substring(0, 30)}...`
            : '(없음)',
          orderId,
          amount: finalAmount,
          originalAmount:
            requestedAmount !== finalAmount ? requestedAmount : undefined,
          timestamp: new Date().toISOString(),
        }
      );

      const basicToken = Buffer.from(`${secretKey}:`).toString('base64');
      confirmResponse = await fetch(
        'https://api.tosspayments.com/v1/payments/confirm',
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${basicToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: finalAmount,
          }),
        }
      );

      confirmData = await confirmResponse.json();
    }

    // 🔍 디버깅: 토스페이먼츠 응답 상세 로깅
    console.log('🔍 [결제 확인 API] 토스페이먼츠 결제 승인 API 응답:', {
      isFreePayment: finalAmount === 0,
      ok: confirmResponse?.ok ?? true,
      status: confirmResponse?.status ?? 200,
      statusText: confirmResponse?.statusText ?? 'OK',
      confirmData: confirmData
        ? {
            code: confirmData.code || '(없음)',
            message: confirmData.message || '(없음)',
            status: confirmData.status || '(없음)',
            totalAmount: confirmData.totalAmount || '(없음)',
            method: confirmData.method || '(없음)',
            approvedAt: confirmData.approvedAt || '(없음)',
            requestedAt: confirmData.requestedAt || '(없음)',
            orderId: confirmData.orderId || '(없음)',
            paymentKey: confirmData.paymentKey
              ? `${confirmData.paymentKey.substring(0, 30)}...`
              : '(없음)',
            allKeys: Object.keys(confirmData),
          }
        : null,
      fullResponse: confirmData,
    });

    // HTTP 응답 상태 확인 (0원 결제가 아닌 경우만)
    if (finalAmount !== 0 && confirmResponse && !confirmResponse.ok) {
      const errorCode = confirmData?.code;
      const errorMessage = confirmData?.message || '결제 승인 실패';

      console.error(
        '🔍 [결제 확인 API] ❌ 토스페이먼츠 결제 승인 실패 (HTTP 에러):',
        {
          status: confirmResponse.status,
          statusText: confirmResponse.statusText,
          errorCode,
          errorMessage,
          error: confirmData,
          note:
            errorCode === 'M006'
              ? '토스페이먼츠 측 문제 - 업체 사정으로 결제 일시 중지. 카드에서 돈이 빠져나가지 않았습니다.'
              : '결제 승인 실패. 카드에서 돈이 빠져나가지 않았습니다.',
        }
      );

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          code: errorCode,
          confirmData,
        },
        { status: 400 }
      );
    }

    // ⚠️ 중요: 토스페이먼츠 응답에서 실제 결제 완료 상태 확인
    // 토스페이먼츠 결제 승인 API 호출 자체가 실제 결제를 완료시키지만,
    // 응답 코드와 상태를 확인하여 안전하게 처리
    const responseCode = confirmData?.code;
    const paymentStatus = confirmData?.status;
    const hasError = confirmData?.message && !responseCode?.includes('SUCCESS');

    // 결제 승인 API가 성공적으로 호출되었는지 확인
    // HTTP 200 응답이면 결제 승인이 완료된 것이지만, 에러 메시지가 있으면 확인 필요
    // 0원 결제는 항상 성공으로 처리
    if (
      finalAmount !== 0 &&
      (hasError || (responseCode && !responseCode.includes('SUCCESS')))
    ) {
      console.error('🔍 [결제 확인 API] ❌ 토스페이먼츠 응답에 에러:', {
        code: responseCode,
        message: confirmData?.message,
        status: paymentStatus,
        note: '결제 승인이 실패했을 수 있습니다. 카드에서 돈이 빠져나가지 않았습니다.',
        fullResponse: confirmData,
      });
      return NextResponse.json(
        {
          success: false,
          error:
            confirmData?.message ||
            `결제 승인 실패. 코드: ${responseCode || '알 수 없음'}`,
          code: responseCode,
          status: paymentStatus,
          confirmData,
        },
        { status: 400 }
      );
    }

    // ✅ 토스 Payment 원본 정보 정리 및 DB에 저장할 메타 계산
    const tossStatus = confirmData?.status as string | undefined;
    const tossMethod = confirmData?.method as string | undefined;
    const tossOrderId = confirmData?.orderId as string | undefined;

    type TossCancelInfo = {
      cancelAmount?: number;
      canceledAt?: string;
      cancelStatus?: string;
    };

    const tossCancels: TossCancelInfo[] | null =
      Array.isArray(confirmData?.cancels) && confirmData.cancels.length > 0
        ? confirmData.cancels.map(
            (c: TossCancelInfo): TossCancelInfo => ({
              cancelAmount: c.cancelAmount,
              canceledAt: c.canceledAt,
              cancelStatus: c.cancelStatus,
            })
          )
        : null;

    // 카드 상세 정보 (승인번호, 할부 개월 수, 카드 타입 등) 추출
    type TossCardInfo = {
      approveNo?: string;
      installmentPlanMonths?: number;
      cardType?: string;
    };

    const cardMeta: TossCardInfo | null = confirmData?.card
      ? {
          approveNo: (confirmData.card as TossCardInfo).approveNo,
          installmentPlanMonths: (confirmData.card as TossCardInfo)
            .installmentPlanMonths,
          cardType: (confirmData.card as TossCardInfo).cardType,
        }
      : null;

    // DB에 저장할 메타 정보 정리
    const paymentProviderForDb = tossMethod || undefined; // 토스 method를 그대로 provider에 사용

    let paymentTypeForDb: string | undefined = undefined;
    let approveNoForDb: string | undefined = undefined;
    let installmentMonthsForDb: number | undefined = undefined;

    if (cardMeta) {
      paymentTypeForDb = cardMeta.cardType || undefined;
      approveNoForDb = cardMeta.approveNo || undefined;

      let isCreditCard = false;
      if (cardMeta.cardType) {
        const cardTypeLower = cardMeta.cardType.toLowerCase();
        isCreditCard =
          cardTypeLower.includes('신용') || cardTypeLower.includes('credit');
      }

      if (isCreditCard && typeof cardMeta.installmentPlanMonths === 'number') {
        installmentMonthsForDb = cardMeta.installmentPlanMonths;
      }
    }

    console.log('🔍 [결제 확인 API] 토스 원본 메타 정보 정리:', {
      tossStatus,
      tossMethod,
      tossOrderId,
      tossCancels,
      cardMeta,
      paymentProviderForDb,
      paymentTypeForDb,
      approveNoForDb,
      installmentMonthsForDb,
    });

    // 결제 승인/실패 상태 분기
    const isCancelledOrFailed =
      paymentStatus === 'CANCELED' ||
      paymentStatus === 'FAILED' ||
      paymentStatus === 'PARTIAL_CANCELED';

    if (isCancelledOrFailed) {
      console.error('🔍 [결제 확인 API] ❌ 결제가 취소되었거나 실패:', {
        paymentStatus,
        code: responseCode,
        message: confirmData?.message,
        note: '결제가 취소되었거나 실패했습니다. 카드에서 돈이 빠져나가지 않았을 수 있습니다.',
        fullResponse: confirmData,
      });

      // 기존 주문 기준으로 payments / orders 상태를 실패로 업데이트
      let actualOrderIdForFail = orderId;

      if (
        !orderId.match(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        )
      ) {
        const { data: orderByNumber } = await supabase
          .from('orders')
          .select('id, order_number')
          .eq('order_number', orderId)
          .single();

        if (orderByNumber) {
          actualOrderIdForFail = orderByNumber.id;
        } else {
          // 주문을 찾지 못하면 DB 업데이트 없이 에러만 반환
          return NextResponse.json(
            {
              success: false,
              error: `결제가 취소되었거나 실패했습니다. 상태: ${paymentStatus}`,
              paymentStatus,
              code: responseCode,
              confirmData,
            },
            { status: 400 }
          );
        }
      }

      // payments 테이블에 실패 상태 upsert
      await supabase.from('payments').upsert(
        {
          order_id: actualOrderIdForFail,
          amount: requestedAmount,
          payment_status: 'failed',
          transaction_id: paymentKey,
          payment_provider: paymentProviderForDb,
          payment_date: new Date().toISOString(),
          admin_approval_status: 'pending',
          payment_type: paymentTypeForDb,
          approve_no: approveNoForDb,
          installment_months: installmentMonthsForDb,
        },
        { onConflict: 'order_id' }
      );

      // orders 테이블의 payment_status를 실패/취소로 표시
      await supabase
        .from('orders')
        .update({
          payment_status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', actualOrderIdForFail);

      return NextResponse.json(
        {
          success: false,
          error: `결제가 취소되었거나 실패했습니다. 상태: ${paymentStatus}`,
          paymentStatus,
          code: responseCode,
          confirmData,
        },
        { status: 400 }
      );
    }

    // payment_methods 테이블에서 카드 결제 수단 ID 찾기
    // 토스페이먼츠 응답에서 결제 수단 확인
    // 토스페이먼츠 응답: method: "카드" (한글), "카드", "간편결제" 등
    const tossPaymentMethod = confirmData?.method || '';
    let methodCode = 'card'; // 기본값

    console.log('🔍 [결제 확인 API] 토스페이먼츠 결제 수단 정보:', {
      method: confirmData?.method,
      hasCard: !!confirmData?.card,
      hasVirtualAccount: !!confirmData?.virtualAccount,
      hasTransfer: !!confirmData?.transfer,
      hasMobilePhone: !!confirmData?.mobilePhone,
      cardInfo: confirmData?.card
        ? {
            cardType: confirmData.card.cardType,
            ownerType: confirmData.card.ownerType,
          }
        : null,
    });

    // 토스페이먼츠 method를 우리 DB method_code로 변환
    // 토스페이먼츠는 한글로 "카드", "간편결제" 등으로 반환
    const methodLower = tossPaymentMethod.toLowerCase();

    if (
      methodLower.includes('카드') ||
      methodLower.includes('card') ||
      confirmData?.card
    ) {
      // 카드 결제인 경우 (method가 "카드"이거나 card 객체가 있는 경우)
      methodCode = 'card';
    } else if (
      methodLower.includes('kakao') ||
      methodLower.includes('카카오')
    ) {
      methodCode = 'kakao';
    } else if (
      methodLower.includes('naver') ||
      methodLower.includes('네이버')
    ) {
      methodCode = 'naver';
    } else if (
      methodLower.includes('bank') ||
      methodLower.includes('계좌') ||
      confirmData?.transfer
    ) {
      methodCode = 'bank_transfer';
    } else if (confirmData?.virtualAccount) {
      methodCode = 'bank_transfer';
    }

    // 카드 타입(신용/체크 등)에 따라 methodCode를 한 번 더 세분화
    // - 현재 정책:
    //   - 기본 카드(methodCode === 'card') 중에서
    //   - 토스 card.cardType 이 '신용'이면 methodCode를 'credit_card'로 변경
    //   - 그 외(체크/기프트/미확인)는 그대로 'card' 사용
    const cardInfo = confirmData?.card as
      | {
          cardType?: string;
        }
      | undefined;

    if (methodCode === 'card' && cardInfo?.cardType) {
      const cardTypeLower = String(cardInfo.cardType).toLowerCase();
      if (cardTypeLower.includes('신용') || cardTypeLower.includes('credit')) {
        methodCode = 'credit_card';
      }
    }

    console.log('🔍 [결제 확인 API] 결제 수단 매핑 결과:', {
      tossPaymentMethod,
      methodCode,
      confirmDataMethod: confirmData?.method,
      note: '토스페이먼츠 응답에서 결제 수단을 확인하여 DB method_code로 변환했습니다.',
    });

    // 0원 결제인 경우 결제 수단을 'FREE'로 설정
    if (finalAmount === 0) {
      methodCode = 'free';
    }

    // payment_methods 테이블에서 결제 수단 조회 (없으면 자동 생성)
    let paymentMethodData;
    const { error: paymentMethodError, data: foundPaymentMethod } =
      await supabase
        .from('payment_methods')
        .select('id, method_code, name')
        .eq('method_code', methodCode)
        .single();

    if (paymentMethodError || !foundPaymentMethod) {
      console.warn(
        '🔍 [결제 확인 API] ⚠️ payment_methods 조회 실패 - 자동 생성 시도:',
        {
          error: paymentMethodError,
          methodCode,
          tossPaymentMethod,
          errorMessage: paymentMethodError?.message,
          note: 'payment_methods 테이블에 레코드가 없어서 자동 생성합니다.',
        }
      );

      // payment_methods 매핑 (method_code -> name, method_type)
      const methodMapping: Record<
        string,
        { name: string; method_type: string }
      > = {
        card: { name: '카드결제', method_type: 'online' },
        kakao: { name: '카카오페이', method_type: 'online' },
        naver: { name: '네이버페이', method_type: 'online' },
        bank_transfer: { name: '계좌이체', method_type: 'offline' },
        free: { name: '무료결제', method_type: 'online' },
      };

      const methodInfo = methodMapping[methodCode] || {
        name: '카드결제',
        method_type: 'online',
      };

      // 자동 생성 시도
      const { data: createdPaymentMethod, error: createError } = await supabase
        .from('payment_methods')
        .insert({
          method_code: methodCode,
          name: methodInfo.name,
          method_type: methodInfo.method_type,
          is_active: true,
          is_online: methodInfo.method_type === 'online',
          requires_admin_approval: false,
        })
        .select('id, method_code, name')
        .single();

      if (createError || !createdPaymentMethod) {
        console.error(
          '🔍 [결제 확인 API] ❌ payment_methods 자동 생성도 실패:',
          {
            createError,
            methodCode,
            note: 'payment_methods 자동 생성에 실패했습니다. DB에 수동으로 레코드를 추가해주세요.',
          }
        );
        return NextResponse.json(
          {
            success: false,
            error: '결제 수단을 찾을 수 없고 생성에도 실패했습니다.',
            details: {
              methodCode,
              tossPaymentMethod,
              error: createError?.message || paymentMethodError?.message,
            },
          },
          { status: 500 }
        );
      }

      paymentMethodData = createdPaymentMethod;
      console.log(
        '🔍 [결제 확인 API] ✅ payment_methods 자동 생성 성공:',
        paymentMethodData
      );
    } else {
      paymentMethodData = foundPaymentMethod;
      console.log('🔍 [결제 확인 API] ✅ payment_methods 조회 성공:', {
        id: paymentMethodData.id,
        method_code: paymentMethodData.method_code,
        name: paymentMethodData.name,
      });
    }

    // ⚠️ 중요: 임시 orderId인 경우 실제 주문 생성 (결제 완료 후!)
    if (orderId.startsWith('temp_')) {
      console.log(
        '🔍 [결제 확인 API] 임시 orderId 감지 - 결제 완료 후 주문 생성 시작...'
      );

      if (!orderData) {
        console.error(
          '🔍 [결제 확인 API] ❌ 주문 생성에 필요한 데이터가 없습니다.'
        );
        return NextResponse.json(
          {
            success: false,
            error: '주문 생성에 필요한 정보가 없습니다.',
            requiresOrderData: true,
          },
          { status: 400 }
        );
      }

      // 실제 주문 생성 (orders, order_details, design_drafts, panel_slot_usage, payments)
      try {
        const externalOrderId =
          (confirmData?.orderId as string | undefined) || orderId;

        const orderResult = await createOrderAfterPayment(
          orderData,
          paymentMethodData.id,
          {
            transactionId: paymentKey,
            paymentProviderMethod: paymentProviderForDb,
            amount: finalAmount,
            paymentType: paymentTypeForDb,
            approveNo: approveNoForDb,
            installmentMonths: installmentMonthsForDb,
          },
          externalOrderId
        );

        console.log('🔍 [결제 확인 API] ✅ 주문 생성 성공:', orderResult);
        console.log(
          '🔍 [결제 확인 API] ✅ payments 테이블에 데이터 저장 완료 (createOrderAfterPayment 내부에서 처리)'
        );

        return NextResponse.json({
          success: true,
          data: {
            ...confirmData,
            orderId: orderResult.orderId,
            orderNumber: orderResult.orderNumber,
          },
        });
      } catch (error) {
        console.error('🔍 [결제 확인 API] ❌ 주문 생성 중 에러:', error);
        return NextResponse.json(
          {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : '주문 생성에 실패했습니다.',
          },
          { status: 500 }
        );
      }
    }

    // 기존 주문이 있는 경우 (임시 orderId가 아닌 경우)
    let actualOrderId = orderId;
    let orderNumber = orderId;

    // orderId가 UUID가 아닌 경우 order_number로 조회
    if (
      !orderId.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      )
    ) {
      const { data: orderByNumber } = await supabase
        .from('orders')
        .select('id, order_number')
        .eq('order_number', orderId)
        .single();

      if (orderByNumber) {
        actualOrderId = orderByNumber.id;
        orderNumber = orderByNumber.order_number;
      } else {
        return NextResponse.json(
          {
            success: false,
            error: '주문을 찾을 수 없습니다.',
          },
          { status: 404 }
        );
      }
    }

    // payments 테이블에 결제 정보 저장/업데이트
    console.log('🔍 [결제 확인 API] 기존 주문에 대한 payments 저장 시작:', {
      orderId: actualOrderId,
      paymentKey: paymentKey.substring(0, 20) + '...',
      amount: finalAmount,
    });

    const { data: upsertedPayment, error: paymentUpsertError } = await supabase
      .from('payments')
      .upsert(
        {
          order_id: actualOrderId,
          payment_method_id: paymentMethodData.id,
          amount: finalAmount,
          payment_status: 'completed',
          transaction_id: paymentKey,
          payment_provider: paymentProviderForDb,
          payment_date: new Date().toISOString(),
          admin_approval_status: 'approved',
          payment_type: paymentTypeForDb,
          approve_no: approveNoForDb,
          installment_months: installmentMonthsForDb,
        },
        { onConflict: 'order_id' }
      )
      .select('id, order_id, payment_status')
      .single();

    if (paymentUpsertError) {
      console.error('🔍 [결제 확인 API] ❌ payments upsert 실패:', {
        error: paymentUpsertError,
        errorMessage: paymentUpsertError.message,
        errorDetails: paymentUpsertError.details,
        orderId: actualOrderId,
      });
      // payments 저장 실패는 치명적이지 않을 수 있으므로 경고만 표시
    } else if (upsertedPayment) {
      console.log('🔍 [결제 확인 API] ✅ payments 저장 성공:', {
        paymentId: upsertedPayment.id,
        orderId: upsertedPayment.order_id,
        paymentStatus: upsertedPayment.payment_status,
      });
    } else {
      console.warn('🔍 [결제 확인 API] ⚠️ payments upsert 결과가 없음');
    }

    // orders 테이블의 payment_status 업데이트
    await supabase
      .from('orders')
      .update({
        payment_status: 'completed',
        payment_method_id: paymentMethodData.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', actualOrderId);

    // 🔍 기존 주문에 대해 projectName(파일이름) / draft_delivery_method 업데이트
    if (orderData?.projectName) {
      try {
        console.log(
          '🔍 [결제 확인 API] 기존 주문의 projectName 업데이트 시도:',
          {
            orderId: actualOrderId,
            orderNumber,
            projectName: orderData.projectName,
            draftDeliveryMethod: orderData.draftDeliveryMethod,
            userProfileIdFromOrderData: orderData.userProfileId,
          }
        );

        // 1) 현재 주문 정보 조회 (user_profile_id, design_drafts_id 필요)
        const { data: existingOrder, error: existingOrderError } =
          await supabase
            .from('orders')
            .select('id, user_profile_id, design_drafts_id')
            .eq('id', actualOrderId)
            .single();

        if (existingOrderError) {
          console.error(
            '🔍 [결제 확인 API] 기존 주문 조회 실패 (projectName 업데이트 건너뜀):',
            existingOrderError
          );
        } else if (existingOrder) {
          const userProfileId =
            existingOrder.user_profile_id || orderData.userProfileId || null;
          let designDraftId =
            existingOrder.design_drafts_id || orderData.draftId || null;

          // 2) design_drafts가 없으면 새로 생성, 있으면 project_name 업데이트
          if (userProfileId) {
            if (!designDraftId) {
              const { data: newDraft, error: draftInsertError } = await supabase
                .from('design_drafts')
                .insert({
                  user_profile_id: userProfileId,
                  draft_category: 'initial',
                  project_name: orderData.projectName,
                  notes: `기존 주문 결제 시 자동 생성 (전송방식: ${
                    orderData.draftDeliveryMethod || 'upload'
                  })`,
                })
                .select('id')
                .single();

              if (draftInsertError) {
                console.error(
                  '🔍 [결제 확인 API] 기존 주문용 design_drafts 생성 실패:',
                  draftInsertError
                );
              } else if (newDraft) {
                designDraftId = newDraft.id;
              }
            } else {
              const { error: draftUpdateError } = await supabase
                .from('design_drafts')
                .update({
                  project_name: orderData.projectName,
                })
                .eq('id', designDraftId);

              if (draftUpdateError) {
                console.error(
                  '🔍 [결제 확인 API] 기존 주문용 design_drafts 업데이트 실패:',
                  draftUpdateError
                );
              }
            }

            // 3) orders.design_drafts_id 및 draft_delivery_method 업데이트
            if (designDraftId) {
              const { error: orderUpdateError } = await supabase
                .from('orders')
                .update({
                  design_drafts_id: designDraftId,
                  draft_delivery_method:
                    orderData.draftDeliveryMethod || 'upload',
                })
                .eq('id', actualOrderId);

              if (orderUpdateError) {
                console.error(
                  '🔍 [결제 확인 API] 기존 주문의 design_drafts_id 업데이트 실패:',
                  orderUpdateError
                );
              } else {
                console.log(
                  '🔍 [결제 확인 API] 기존 주문의 projectName / design_drafts 연결 완료:',
                  {
                    orderId: actualOrderId,
                    designDraftId,
                    projectName: orderData.projectName,
                  }
                );
              }
            }
          } else {
            console.warn(
              '🔍 [결제 확인 API] 기존 주문에 user_profile_id가 없어 projectName을 design_drafts에 연결할 수 없음:',
              { orderId: actualOrderId }
            );
          }
        }
      } catch (e) {
        console.error(
          '🔍 [결제 확인 API] 기존 주문 projectName 업데이트 중 예외 발생:',
          e
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...confirmData,
        orderId: actualOrderId,
        orderNumber: orderNumber,
      },
    });
  } catch (error) {
    console.error('🔍 [결제 확인 API] ❌ 예외 발생:', error);
    return NextResponse.json(
      { success: false, error: '결제 승인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
