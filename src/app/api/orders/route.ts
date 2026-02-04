import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';
import { ensureDesignDraftForOrderItem } from '@/src/lib/designDrafts';
import {
  ensurePanelSlotUsageForItem,
  type SlotResolverCache,
} from '@/src/lib/slotResolver';
import {
  resolveRegionGuDisplayPeriodRangeByPanel,
  type RegionGuDisplayPeriodResolverCache,
} from '@/src/lib/resolveRegionGuDisplayPeriod';

// Type definitions for the orders API
interface Panel {
  id: string;
  name: string;
  location: string;
  description?: string;
  created_at: string;
  updated_at: string;
  region_gu?: {
    name: string;
  };
}

interface OrderDetail {
  id: string;
  order_id: string;
  panel_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  half_period?: 'first_half' | 'second_half';
  selected_year?: number;
  selected_month?: number;
  start_date?: string;
  end_date?: string;
  design_draft_id?: string | null;
  design_draft?: DesignDraft | null;
  created_at: string;
  updated_at: string;
  panels?: Panel;
}

interface PaymentMethod {
  id: string;
  name: string;
  method_type: string;
  method_code: string;
  is_active: boolean;
  description?: string;
  is_online: boolean;
  requires_admin_approval: boolean;
  created_at: string;
  updated_at: string;
}

interface Payment {
  id: string;
  order_id: string;
  payment_method_id: string;
  payment_provider?: string;
  amount: number;
  payment_status:
    | 'pending'
    | 'pending_deposit'
    | 'completed'
    | 'failed'
    | 'cancelled'
    | 'refunded';
  transaction_id?: string;
  payment_date?: string;
  admin_approval_status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  depositor_name?: string;
  deposit_date?: string;
  created_at: string;
  updated_at: string;
  payment_method?: PaymentMethod;
}

interface UserProfile {
  id: string;
  user_auth_id: string;
  profile_title: string;
  company_name?: string;
  business_registration_file?: string;
  phone: string;
  email: string;
  contact_person_name: string;
  is_public_institution: boolean;
  is_company: boolean;
  created_at: string;
  updated_at: string;
}

interface DesignDraft {
  id: string;
  project_name?: string;
  draft_category: 'initial' | 'feedback' | 'revision' | 'final';
  file_name?: string;
  file_url?: string;
  file_extension?: string;
  file_size?: number;
  notes?: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

interface Order {
  id: string;
  user_auth_id: string;
  user_profile_id: string;
  order_number: string;
  total_price: number;
  payment_status:
    | 'pending'
    | 'pending_deposit'
    | 'completed'
    | 'failed'
    | 'cancelled'
    | 'refunded';
  admin_approval_status: 'pending' | 'approved' | 'rejected';
  draft_delivery_method?: 'email' | 'upload';
  design_drafts_id?: string;
  created_at: string;
  updated_at: string;
  order_details?: OrderDetail[];
  payments?: Payment[];
  user_profiles?: UserProfile;
  design_drafts?: DesignDraft[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/de0826ba-4e91-43eb-b001-5614ace69b75', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'pre-fix',
        hypothesisId: 'H5',
        location: 'src/app/api/orders/route.ts:GET:entry',
        message: 'orders GET called',
        data: { hasUserId: !!userId, userIdLength: userId?.length ?? 0 },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 1. 주문 정보 조회
    const { data: orders, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        order_details (
          *,
          panel_slot_usage!order_details_panel_slot_usage_id_fkey (
            slot_number,
            banner_type,
            usage_type
          ),
          panels (
            *,
            region_gu (
              name
            ),
            display_types (
              id,
              name,
              description
            )
          ),
          design_draft:design_draft_id (
            id,
            project_name,
            file_name,
            file_url,
            is_approved
          )
        ),
        payments (
          *,
          payment_methods (
            *
          )
        ),
        user_profiles (
          *
        )
      `
      )
      .eq('user_auth_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('주문 조회 오류:', error);
      // #region agent log
      const supabaseError = error as unknown as {
        details?: string;
        hint?: string;
      };
      fetch(
        'http://127.0.0.1:7242/ingest/de0826ba-4e91-43eb-b001-5614ace69b75',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: 'debug-session',
            runId: 'pre-fix',
            hypothesisId: 'H5',
            location: 'src/app/api/orders/route.ts:GET:select:error',
            message: 'orders select failed',
            data: {
              errorMessage: error.message,
              errorDetails: supabaseError.details ?? null,
              errorHint: supabaseError.hint ?? null,
            },
            timestamp: Date.now(),
          }),
        }
      ).catch(() => {});
      // #endregion
      return NextResponse.json(
        { error: '주문 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // #region agent log
    const ordersSample = (orders ?? []).slice(0, 3).map((o) => ({
      orderId: (o as { id?: string }).id ?? null,
      orderNumber: (o as { order_number?: string }).order_number ?? null,
      detailsCount: Array.isArray(
        (o as { order_details?: unknown }).order_details
      )
        ? (o as { order_details: unknown[] }).order_details.length
        : null,
      paymentsCount: Array.isArray((o as { payments?: unknown }).payments)
        ? (o as { payments: unknown[] }).payments.length
        : null,
    }));
    fetch('http://127.0.0.1:7242/ingest/de0826ba-4e91-43eb-b001-5614ace69b75', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'pre-fix',
        hypothesisId: 'H5',
        location: 'src/app/api/orders/route.ts:GET:select:ok',
        message: 'orders select ok',
        data: { ordersCount: orders?.length ?? 0, sample: ordersSample },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    // 2. 각 주문에 대한 design_drafts 조회
    // - orders.design_drafts_id로 조회
    // - 같은 user_profile_id와 주문 생성 시간 기준(±5분)으로 관련된 모든 design_drafts 조회
    const ordersWithDraftsAndProjectName = await Promise.all(
      (orders || []).map(async (order: Order) => {
        const designDrafts: DesignDraft[] = [];
        const draftIds = new Set<string>();

        // 1) orders.design_drafts_id로 조회
        if (order.design_drafts_id) {
          const { data: draft, error: draftError } = await supabase
            .from('design_drafts')
            .select(
              'id, project_name, file_name, file_url, file_extension, file_size, draft_category, notes, is_approved, created_at, updated_at, user_profile_id'
            )
            .eq('id', order.design_drafts_id)
            .single();

          if (draftError) {
            console.error(
              `🔍 주문 ${order.id}의 design_drafts 조회 오류:`,
              draftError
            );
          } else if (draft) {
            designDrafts.push(draft as DesignDraft);
            draftIds.add(draft.id);
          }
        }

        // 2) 같은 user_profile_id와 주문 생성 시간 기준(±5분)으로 관련된 모든 design_drafts 조회
        if (order.user_profile_id) {
          const orderCreatedAt = new Date(order.created_at);
          const timeWindowStart = new Date(
            orderCreatedAt.getTime() - 5 * 60 * 1000
          ); // 5분 전
          const timeWindowEnd = new Date(
            orderCreatedAt.getTime() + 5 * 60 * 1000
          ); // 5분 후

          const { data: relatedDrafts, error: relatedDraftsError } =
            await supabase
              .from('design_drafts')
              .select(
                'id, project_name, file_name, file_url, file_extension, file_size, draft_category, notes, is_approved, created_at, updated_at, user_profile_id'
              )
              .eq('user_profile_id', order.user_profile_id)
              .gte('created_at', timeWindowStart.toISOString())
              .lte('created_at', timeWindowEnd.toISOString())
              .order('created_at', { ascending: true });

          if (relatedDraftsError) {
            console.error(
              `🔍 주문 ${order.id}의 관련 design_drafts 조회 오류:`,
              relatedDraftsError
            );
          } else if (relatedDrafts && relatedDrafts.length > 0) {
            // 중복 제거하여 추가
            relatedDrafts.forEach((draft) => {
              if (!draftIds.has(draft.id)) {
                designDrafts.push(draft as DesignDraft);
                draftIds.add(draft.id);
              }
            });
          }

          console.log(`🔍 주문 ${order.id}의 관련 design_drafts 조회 결과:`, {
            user_profile_id: order.user_profile_id,
            timeWindow: {
              start: timeWindowStart.toISOString(),
              end: timeWindowEnd.toISOString(),
            },
            relatedDraftsCount: relatedDrafts?.length || 0,
            totalDraftsCount: designDrafts.length,
          });
        }

        (order.order_details || []).forEach((orderDetail) => {
          const detailDraft = orderDetail.design_draft;
          if (detailDraft && !draftIds.has(detailDraft.id)) {
            designDrafts.push(detailDraft as DesignDraft);
            draftIds.add(detailDraft.id);
          }
        });

        console.log(`🔍 주문 ${order.id}의 design_drafts 조회 결과:`, {
          design_drafts_id: order.design_drafts_id,
          designDraftsLength: designDrafts.length,
          drafts: designDrafts.map((d) => ({
            id: d.id,
            project_name: d.project_name,
            file_name: d.file_name,
          })),
        });

        // design_drafts에서 프로젝트명 추출 (주문 상세 API와 동일한 로직)
        const projectName =
          designDrafts && designDrafts.length > 0
            ? designDrafts[0]?.project_name || '프로젝트명 없음'
            : '프로젝트명 없음';

        console.log(`🔍 주문 ${order.id}의 최종 projectName:`, {
          orderId: order.id,
          orderNumber: order.order_number,
          designDraftsLength: designDrafts.length,
          projectName,
          firstDraftProjectName: designDrafts[0]?.project_name,
        });

        return {
          ...order,
          design_drafts: designDrafts,
          projectName,
        };
      })
    );

    return NextResponse.json({ orders: ordersWithDraftsAndProjectName });
  } catch (error) {
    console.error('주문 조회 중 예외 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// interface OrderItem {
//   id: string;
//   name: string;
//   price: number;
//   quantity: number;
//   panel_id: string;
//   halfPeriod?: 'first_half' | 'second_half';
//   selectedYear?: number; // 선택한 년도
//   selectedMonth?: number; // 선택한 월
//   startDate?: string;
//   endDate?: string;
//   // 기간 데이터 추가 (구별 카드에서 전달받은 데이터)
//   periodData?: {
//     first_half_from: string;
//     first_half_to: string;
//     second_half_from: string;
//     second_half_to: string;
//   };
//   // 선택된 기간의 시작/종료 날짜
//   selectedPeriodFrom?: string;
//   selectedPeriodTo?: string;
//   panel_slot_snapshot?: {
//     id: string | null;
//     notes: string | null;
//     max_width: number | null;
//     slot_name: string | null;
//     tax_price: number | null;
//     created_at: string | null;
//     max_height: number | null;
//     price_unit: string | null;
//     updated_at: string | null;
//     banner_type: string | null;
//     slot_number: number | null;
//     total_price: number | null;
//     panel_id: string | null;
//     road_usage_fee: number | null;
//     advertising_fee: number | null;
//     panel_slot_status: string | null;
//   };
//   panel_slot_usage_id?: string;
// }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      items,
      userAuthId,
      userProfileId,
      isPaid = false,
      draftDeliveryMethod,
      paymentMethodId, // 결제수단 ID 추가
      projectName, // 파일제목 필수
      depositorName, // 계좌이체 시 입금자명 (선택)
    } = body;

    console.log(
      '🔍 [주문 생성 API] 시작 =========================================='
    );
    console.log('🔍 [주문 생성 API] 입력 파라미터:', {
      itemsCount: items?.length,
      userAuthId,
      userProfileId,
      isPaid,
      draftDeliveryMethod,
      paymentMethodId,
      projectName,
    });

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('🔍 [주문 생성 API] ❌ 주문 항목 누락');
      return NextResponse.json(
        { error: '주문 항목이 필요합니다.' },
        { status: 400 }
      );
    }

    if (!userAuthId) {
      console.error('🔍 [주문 생성 API] ❌ 사용자 인증 ID 누락');
      return NextResponse.json(
        { error: '사용자 인증 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    if (
      !projectName ||
      typeof projectName !== 'string' ||
      !projectName.trim()
    ) {
      console.error('🔍 [주문 생성 API] ❌ 파일제목 누락');
      return NextResponse.json(
        { error: '파일제목(projectName)은 필수입니다.' },
        { status: 400 }
      );
    }

    // 사용자 프로필 조회 (선택적)
    console.log('🔍 [주문 생성 API] 사용자 프로필 조회 시작...', {
      userProfileId,
      hasUserProfileId: !!userProfileId,
    });

    let userProfile = null;
    if (userProfileId) {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userProfileId)
        .single();

      console.log('🔍 [주문 생성 API] 사용자 프로필 조회 결과:', {
        found: !!profile,
        profileId: profile?.id,
        error: profileError,
      });

      if (profileError || !profile) {
        console.warn(
          '🔍 [주문 생성 API] ⚠️ 사용자 프로필 조회 실패 (계속 진행):',
          profileError
        );
        // 프로필이 없어도 주문은 생성 가능하도록 변경
        // 하지만 프로필 정보는 사용할 수 없음
      } else {
        userProfile = profile;
      }
    } else {
      console.warn(
        '🔍 [주문 생성 API] ⚠️ userProfileId가 없음 (프로필 없이 주문 생성)'
      );
    }

    // 주문 번호 생성 (YYYYMMDD-XXXX 형식)
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `${dateStr}-${randomStr}`;

    console.log('🔍 [주문 생성 API] 생성된 주문번호:', orderNumber);

    // 총 가격 계산
    const totalPrice = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    console.log('🔍 [주문 생성 API] 총 가격 계산:', {
      totalPrice,
      itemsCount: items.length,
      itemPrices: items.map((item) => ({
        id: item.id,
        price: item.price,
        quantity: item.quantity,
      })),
    });

    // 결제수단이 계좌이체(bank_transfer)인지 확인 + 결제수단명 조회
    let isBankTransfer = false;
    let paymentMethodName: string | null = null;
    if (paymentMethodId) {
      const { data: pm, error: pmError } = await supabase
        .from('payment_methods')
        .select('id, method_code, name')
        .eq('id', paymentMethodId)
        .single();

      if (pmError) {
        console.warn('🔍 [주문 생성 API] payment_methods 조회 실패:', pmError);
      } else if (pm) {
        isBankTransfer = pm.method_code === 'bank_transfer';
        paymentMethodName = pm.name || pm.method_code || null;
      }
    }

    // 1. orders 테이블에 주문 생성 (가격 정보 포함)
    console.log('🔍 [주문 생성 API] orders 테이블에 주문 생성 시작...');
    const orderInsertData: {
      order_number: string;
      user_auth_id: string;
      user_profile_id?: string | null;
      payment_status: 'completed' | 'pending' | 'pending_deposit';
      order_status: string;
      draft_delivery_method: string;
      total_price: number;
    } = {
      order_number: orderNumber,
      user_auth_id: userAuthId,
      // 계좌이체: pending_deposit, 카드/온라인: pending, 결제완료: completed
      payment_status: isPaid
        ? 'completed'
        : isBankTransfer
        ? 'pending_deposit'
        : 'pending',
      order_status: 'pending',
      draft_delivery_method: draftDeliveryMethod || 'upload',
      total_price: totalPrice,
    };

    // user_profile_id가 있으면 추가 (없으면 null 또는 undefined)
    if (userProfileId && userProfile) {
      orderInsertData.user_profile_id = userProfileId;
      console.log('🔍 [주문 생성 API] user_profile_id 포함:', userProfileId);
    } else {
      orderInsertData.user_profile_id = null;
      console.warn('🔍 [주문 생성 API] ⚠️ user_profile_id 없이 주문 생성');
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderInsertData)
      .select('id, order_number, payment_status')
      .single();

    console.log('🔍 [주문 생성 API] orders 생성 결과:', {
      success: !orderError,
      orderId: order?.id,
      orderNumber: order?.order_number,
      payment_status: order?.payment_status,
      error: orderError,
    });

    if (orderError) {
      console.error('🔍 [주문 생성 API] ❌ 주문 생성 실패:', orderError);
      return NextResponse.json(
        { error: '주문 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    console.log('🔍 [주문 생성 API] ✅ 주문 생성 성공:', {
      orderId: order.id,
      orderNumber: order.order_number,
    });

    // 2. payments 테이블에 결제 정보 생성
    if (paymentMethodId) {
      console.log(
        '🔍 [주문 생성 API] payments 테이블에 결제 정보 생성 시작...'
      );
      // 입금자명: 전달받은 값이 없으면 주문자 정보에서 추출
      const finalDepositorName =
        depositorName ||
        userProfile?.contact_person_name ||
        userProfile?.company_name ||
        null;

      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_id: order.id,
          payment_method_id: paymentMethodId,
          amount: totalPrice,
          // 계좌이체: pending_deposit, 카드/온라인: pending, 결제완료: completed
          payment_status: isPaid
            ? 'completed'
            : isBankTransfer
            ? 'pending_deposit'
            : 'pending',
          payment_date: isPaid ? new Date().toISOString() : null,
          // 계좌이체는 관리자 승인 여부와 무관하게 최초에는 pending
          admin_approval_status: isPaid ? 'approved' : 'pending',
          // 입금자명: 항상 저장 (계좌이체가 아니어도)
          depositor_name: finalDepositorName,
          // 결제수단명 저장
          payment_provider: paymentMethodName,
        })
        .select('id, payment_status, amount')
        .single();

      console.log('🔍 [주문 생성 API] payments 생성 결과:', {
        success: !paymentError,
        paymentId: payment?.id,
        payment_status: payment?.payment_status,
        amount: payment?.amount,
        error: paymentError,
      });

      if (paymentError) {
        console.error(
          '🔍 [주문 생성 API] ⚠️ 결제 정보 생성 실패 (치명적이지 않음):',
          paymentError
        );
        // 결제 정보 생성 실패는 치명적이지 않으므로 계속 진행
      } else {
        console.log('🔍 [주문 생성 API] ✅ 결제 정보 생성 성공:', payment.id);
      }
    } else {
      console.log(
        '🔍 [주문 생성 API] paymentMethodId가 없어서 payments 레코드 생성 건너뜀'
      );
    }

    // 3. order_details 생성
    console.log('🔍 [주문 생성 API] order_details 생성 시작...');
    type OrderDetailInsert = {
      order_id: string;
      panel_id: string;
      panel_slot_usage_id: string | null;
      slot_order_quantity: number;
      display_start_date: string;
      display_end_date: string;
      design_draft_id: string | null;
      use_previous_design: boolean;
      price: number;
    };

    const orderDetails: OrderDetailInsert[] = [];
    const designDraftIdsByItem: Record<string, string | null> = {};

    const slotResolverCache: SlotResolverCache = {
      panelInfoAndPeriod: new Map(),
      bannerSlotsByPanel: new Map(),
      inventoryByPeriodPanel: new Map(),
      slotUsageByPanelDate: new Map(),
    };

    const periodResolverCache: RegionGuDisplayPeriodResolverCache = {
      panelInfoByPanelId: new Map(),
      periodRangeByKey: new Map(),
    };

    // 병목 최적화: 아이템별 슬롯 확보/시안 생성은 병렬 수행 (네트워크 왕복 시간 절감)
    let resolvedOrderDetails: OrderDetailInsert[];
    try {
      resolvedOrderDetails = await Promise.all(
        items.map(async (item) => {
          console.log('🔍 [주문 생성 API] order_detail 처리 중:', {
            itemId: item.id,
            panelId: item.panel_id,
            quantity: item.quantity,
            price: item.price,
          });
          // 기간 설정 - 수정된 부분: selectedPeriodFrom/selectedPeriodTo 우선 사용
          let displayStartDate: string;
          let displayEndDate: string;

          if (item.selectedPeriodFrom && item.selectedPeriodTo) {
            // 선택된 기간이 있으면 그것을 사용
            displayStartDate = item.selectedPeriodFrom;
            displayEndDate = item.selectedPeriodTo;
          } else if (
            item.halfPeriod &&
            item.selectedYear &&
            item.selectedMonth
          ) {
            // 없으면 halfPeriod로 계산
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
              // fallback (레거시): 상반기 1일-15일
              displayStartDate = `${year}-${String(month).padStart(2, '0')}-01`;
              displayEndDate = `${year}-${String(month).padStart(2, '0')}-15`;
            } else {
              // fallback (레거시): 하반기 16일-마지막일
              const lastDay = new Date(year, month, 0).getDate();
              displayStartDate = `${year}-${String(month).padStart(2, '0')}-16`;
              displayEndDate = `${year}-${String(month).padStart(
                2,
                '0'
              )}-${lastDay}`;
            }
          } else {
            // price_unit에 따른 자동 기간 계산 (기본값)
            const priceUnit = item.panel_slot_snapshot?.price_unit || '15 days';
            const startDate = new Date();
            const endDate = new Date(startDate);

            // price_unit에 따라 기간 계산
            if (priceUnit === '15 days') {
              endDate.setDate(startDate.getDate() + 15);
            } else if (priceUnit === '30 days') {
              endDate.setDate(startDate.getDate() + 30);
            } else if (priceUnit === '7 days') {
              endDate.setDate(startDate.getDate() + 7);
            } else {
              // 기본값: 15일
              endDate.setDate(startDate.getDate() + 15);
            }

            displayStartDate = startDate.toISOString().split('T')[0];
            displayEndDate = endDate.toISOString().split('T')[0];
          }

          // 재고 중복 확인은 DB 트리거가 자동으로 처리

          // 2. panel_slot_usage 레코드 생성 (order_details_id는 나중에 업데이트)
          let panelSlotUsageId: string | null | undefined = null;

          try {
            const slotResult = await ensurePanelSlotUsageForItem({
              item,
              existingPanelSlotUsageId: item.panel_slot_usage_id,
              displayStartDate,
              displayEndDate,
              cache: slotResolverCache,
            });
            panelSlotUsageId = slotResult.panelSlotUsageId;
            if (slotResult.slotNumber) {
              if (!item.panel_slot_snapshot) {
                item.panel_slot_snapshot = {};
              }
              item.panel_slot_snapshot.slot_number = slotResult.slotNumber;
            }
          } catch (error) {
            console.error(
              '🔍 [주문 생성 API] 슬롯 확보 실패:',
              error,
              item.id,
              item.panel_id
            );
            const message =
              error instanceof Error && error.message
                ? error.message
                : '슬롯 확보 중 오류가 발생했습니다.';
            throw new Error(message);
          }

          const existingItemDraftId =
            item.designDraftId || item.draftId || null;
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
                  orderNumber,
                  panelId: item.panel_id,
                  itemLabel: item.name || item.panel_id,
                  draftDeliveryMethod: itemDraftDeliveryMethod,
                })
              : null);

          designDraftIdsByItem[item.id] = designDraftIdForItem;

          // 2. order_details 생성
          const orderDetail = {
            order_id: order.id,
            panel_id: item.panel_id,
            panel_slot_usage_id: panelSlotUsageId,
            slot_order_quantity: item.quantity,
            display_start_date: displayStartDate,
            display_end_date: displayEndDate,
            design_draft_id: designDraftIdForItem,
            use_previous_design: item.usePreviousDesign || false,
            price: item.price, // 주문 당시 가격 저장
          } satisfies OrderDetailInsert;

          return orderDetail;
        })
      );
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : '슬롯 확보 중 오류가 발생했습니다.';
      return NextResponse.json({ error: message }, { status: 500 });
    }

    orderDetails.push(...resolvedOrderDetails);

    console.log('🔍 [주문 생성 API] 생성할 order_details:', {
      count: orderDetails.length,
      details: orderDetails.map((od) => ({
        panel_id: od.panel_id,
        slot_order_quantity: od.slot_order_quantity,
        display_start_date: od.display_start_date,
        display_end_date: od.display_end_date,
      })),
    });

    // order_details 일괄 생성
    const orderDetailsResult = await supabase
      .from('order_details')
      .insert(orderDetails)
      .select('id, panel_slot_usage_id, panel_id, slot_order_quantity');

    console.log('🔍 [주문 생성 API] order_details 생성 결과:', {
      success: !orderDetailsResult.error,
      createdCount: orderDetailsResult.data?.length || 0,
      createdIds: orderDetailsResult.data?.map((od) => od.id) || [],
      error: orderDetailsResult.error,
    });

    if (orderDetailsResult.error) {
      console.error(
        '🔍 [주문 생성 API] ❌ order_details 생성 실패:',
        orderDetailsResult.error
      );
      return NextResponse.json(
        { error: '주문 상세 정보 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    console.log(
      '🔍 [주문 생성 API] ✅ order_details 생성 성공:',
      orderDetailsResult.data?.length,
      '개'
    );

    // 생성된 order_details의 panel_slot_usage_id는 이미 설정되어 있음
    // panel_slot_usage 테이블에는 order_details_id 컬럼이 없으므로 업데이트 불필요
    // 재고는 DB 트리거가 자동으로 처리함
    if (orderDetailsResult.data) {
      console.log('🔍 [주문 생성 API] order_details 생성 완료:');
      for (const orderDetail of orderDetailsResult.data) {
        console.log('🔍 [주문 생성 API] order_detail:', {
          id: orderDetail.id,
          panel_id: orderDetail.panel_id,
          panel_slot_usage_id: orderDetail.panel_slot_usage_id,
          note: '재고 관리는 DB 트리거가 자동 처리합니다.',
        });
      }
    }

    const representativeDesignDraftId = Object.values(
      designDraftIdsByItem
    ).find((id): id is string => Boolean(id));

    if (representativeDesignDraftId) {
      const { error: designDraftUpdateError } = await supabase
        .from('orders')
        .update({
          design_drafts_id: representativeDesignDraftId,
        })
        .eq('id', order.id);

      if (designDraftUpdateError) {
        console.error(
          '🔍 [주문 생성 API] ⚠️ orders.design_drafts_id 업데이트 실패:',
          designDraftUpdateError
        );
      } else {
        console.log(
          '🔍 [주문 생성 API] ✅ 대표 design_drafts_id를 orders에 연결:',
          {
            orderId: order.id,
            designDraftId: representativeDesignDraftId,
          }
        );
      }
    } else {
      console.warn(
        '🔍 [주문 생성 API] 디자인 draft 생성되지 않음 (user profile 혹은 아이템 로직 확인 필요)'
      );
    }

    // 4. 결제 완료 시 시안관리 레코드 자동 생성
    // (기존 결제완료 시 design_drafts 생성 로직은 제거)

    console.log(
      '🔍 [주문 생성 API] ✅ 모든 처리 완료 =========================================='
    );
    console.log('🔍 [주문 생성 API] 최종 결과:', {
      orderId: order.id,
      orderNumber: orderNumber,
      totalPrice: totalPrice,
      itemCount: items.length,
      orderDetailsCount: orderDetailsResult.data?.length || 0,
    });

    // 재고 현황 확인을 위한 로그 추가
    // ⚠️ banner_slot_inventory 테이블에는 panel_id가 없고 banner_slot_id가 있음
    // 재고 확인은 DB 트리거가 처리하므로 여기서는 로그만 남김
    console.log('🔍 [주문 생성 API] 재고 현황 확인:');
    for (const item of items) {
      // banner_slot_inventory는 banner_slot_id 기준이므로 직접 조회하지 않음
      // 필요시 order_details의 panel_slot_usage_id를 통해 banner_slot_id를 찾아야 함
      console.log(`🔍 [주문 생성 API] 패널 ${item.panel_id} 재고:`, {
        note: '재고는 banner_slot_id 기준으로 관리되며 DB 트리거가 자동 처리합니다.',
        panel_id: item.panel_id,
      });
    }

    return NextResponse.json({
      success: true,
      order: {
        orderId: order.id,
        orderNumber: orderNumber,
        totalPrice: totalPrice,
        itemCount: items.length,
      },
      message: '주문이 성공적으로 생성되었습니다.',
    });
  } catch (error) {
    console.error('🔍 [주문 생성 API] ❌ 예외 발생:', error);
    console.error('🔍 [주문 생성 API] 예외 상세:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
