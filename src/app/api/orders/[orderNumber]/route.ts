import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/app/api/supabase';

// 타입 정의
interface UserProfile {
  id: string;
  profile_title?: string;
  company_name?: string;
  contact_person_name?: string;
}

interface AdminProfile {
  id: string;
  name?: string;
  department?: string;
  position?: string;
}

interface DesignDraft {
  id: string;
  user_profile_id?: string;
  admin_profile_id?: string;
  draft_category?: 'initial' | 'feedback' | 'revision' | 'final';
  project_name?: string;
  notes?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  delivery_method?: string;
  email_address?: string;
  status?: string;
  created_at: string;
  updated_at?: string;
  user_profiles?: UserProfile;
  admin_profiles?: AdminProfile;
}

interface BannerSlotPricePolicy {
  price_usage_type?: string;
  tax_price?: number;
  advertising_fee?: number;
  road_usage_fee?: number;
  total_price?: number;
}

interface BannerSlots {
  banner_slot_price_policy?: BannerSlotPricePolicy[];
}

interface PanelSlotUsage {
  unit_price?: number;
  banner_slots?: BannerSlots;
}

interface OrderDetail {
  slot_order_quantity?: number;
  panel_slot_usage?: PanelSlotUsage;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;

    // 주문 기본 정보 조회
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(
        `
        *,
        user_profiles!orders_user_profile_id_fkey (
          id,
          profile_title,
          company_name,
          business_registration_file,
          phone,
          email,
          contact_person_name,
          fax_number,
          is_public_institution,
          is_company
        ),
        payment_methods!orders_payment_method_id_fkey (
          id,
          name,
          method_type,
          method_code,
          description
        )
      `
      )
      .eq('order_number', orderNumber)
      .single();

    if (orderError) {
      console.error('Order fetch error:', orderError);
      return NextResponse.json(
        { success: false, error: '주문을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 주문 상세 정보 조회
    const { data: orderDetails, error: orderDetailsError } = await supabase
      .from('order_details')
      .select(
        `
        *,
        panels!order_details_panel_info_id_fkey (
          id,
          nickname,
          address,
          photo_url,
          latitude,
          longitude,
          panel_code,
          panel_type,
          max_banner,
          region_gu!panels_region_gu_id_fkey (
            id,
            name,
            code
          ),
          region_dong!panels_region_dong_id_fkey (
            id,
            name
          ),
          display_types!panels_display_type_id_fkey (
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
        ),
        panel_slot_usage!order_details_panel_slot_usage_id_fkey (
          id,
          slot_number,
          usage_type,
          attach_date_from,
          unit_price,
          is_active,
          is_closed,
          banner_type,
          banner_slots!panel_slot_usage_banner_slot_id_fkey (
            id,
            slot_name,
            max_width,
            max_height,
            banner_type,
            price_unit,
            panel_slot_status,
            notes,
            banner_slot_price_policy!banner_slot_price_policy_banner_slot_id_fkey (
              id,
              price_usage_type,
              tax_price,
              road_usage_fee,
              advertising_fee,
              total_price
            )
          )
        )
      `
      )
      .eq('order_id', order.id);

    if (orderDetailsError) {
      console.error('Order details fetch error:', orderDetailsError);
      return NextResponse.json(
        { success: false, error: '주문 상세 정보를 가져올 수 없습니다.' },
        { status: 500 }
      );
    }

    // 디자인 드래프트 정보 조회
    let designDrafts: DesignDraft[] = [];
    let designDraftsError = null;

    if (order.design_drafts_id) {
      // design_drafts_id는 단일 ID이므로 single() 사용
      const { data: draft, error: draftsError } = await supabase
        .from('design_drafts')
        .select(
          `
          id,
          project_name,
          file_name,
          file_url,
          file_extension,
          file_size,
          draft_category,
          notes,
          is_approved,
          created_at,
          updated_at,
          user_profile_id,
          admin_profile_id,
          user_profiles!design_drafts_user_profile_id_fkey (
            id,
            profile_title,
            company_name,
            contact_person_name
          ),
          admin_profiles!design_drafts_admin_profile_id_fkey (
            id,
            name,
            department,
            position
          )
        `
        )
        .eq('id', order.design_drafts_id)
        .single();

      if (draft) {
        // 필요한 필드만 추출하여 DesignDraft 타입으로 변환
        const draftData: DesignDraft = {
          id: draft.id,
          user_profile_id: draft.user_profile_id,
          admin_profile_id: draft.admin_profile_id,
          draft_category: draft.draft_category,
          project_name: draft.project_name,
          notes: draft.notes,
          file_url: draft.file_url,
          file_name: draft.file_name,
          file_size: draft.file_size,
          file_type: draft.file_extension,
          created_at: draft.created_at,
          updated_at: draft.updated_at,
        };
        designDrafts = [draftData];
      }
      designDraftsError = draftsError;

      console.log('🔍 [주문 상세 API] design_drafts 조회 결과:', {
        design_drafts_id: order.design_drafts_id,
        draft: draft,
        draftProjectName: draft?.project_name,
        designDraftsLength: designDrafts.length,
      });
    }

    if (designDraftsError) {
      console.error('Design drafts fetch error:', designDraftsError);
      return NextResponse.json(
        { success: false, error: '디자인 드래프트 정보를 가져올 수 없습니다.' },
        { status: 500 }
      );
    }

    // 결제 정보 조회
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select(
        `
        *,
        payment_methods!payments_payment_method_id_fkey (
          id,
          name,
          method_type,
          method_code,
          description
        )
      `
      )
      .eq('order_id', order.id)
      .order('created_at', { ascending: false });

    if (paymentsError) {
      console.error('Payments fetch error:', paymentsError);
      return NextResponse.json(
        { success: false, error: '결제 정보를 가져올 수 없습니다.' },
        { status: 500 }
      );
    }

    // 관악구 이전 디자인 동일 할인 가격
    const GWANAK_PREVIOUS_DESIGN_PRICE = 78000;

    const getDetailPrice = (detail: OrderDetail): number => {
      const quantity = detail.slot_order_quantity || 1;

      // 확장된 타입 (저장된 가격 및 관악구 할인 정보)
      const extendedDetail = detail as OrderDetail & {
        price?: number | null;
        use_previous_design?: boolean;
        panels?: { region_gu?: { name?: string | null } | null } | null;
      };

      // 1. 저장된 가격이 있으면 우선 사용 (주문 당시 가격)
      if (extendedDetail.price !== null && extendedDetail.price !== undefined) {
        return Number(extendedDetail.price);
      }

      // 2. 관악구이고 이전 디자인 동일인 경우 할인 가격 적용 (레거시 fallback)
      const districtName = extendedDetail.panels?.region_gu?.name;
      const usePreviousDesign = extendedDetail.use_previous_design === true;

      if (districtName === '관악구' && usePreviousDesign) {
        return GWANAK_PREVIOUS_DESIGN_PRICE * quantity;
      }

      // 3. banner_slot_price_policy에서 계산 (레거시 fallback)
      const isPublicInstitution =
        order.user_profiles?.is_public_institution || false;
      const preferredPriceUsageType = isPublicInstitution
        ? 'public_institution'
        : 'default';

      const policies: BannerSlotPricePolicy[] =
        detail.panel_slot_usage?.banner_slots?.banner_slot_price_policy || [];
      let selectedPolicy = policies.find(
        (p) => p.price_usage_type === preferredPriceUsageType
      );

      if (!selectedPolicy) {
        selectedPolicy = policies.find(
          (p) => p.price_usage_type === 'default'
        );
      }

      if (!selectedPolicy && policies.length > 0) {
        selectedPolicy = policies[0];
      }

      if (selectedPolicy) {
        const totalPrice = Number(selectedPolicy.total_price || 0) * quantity;
        return totalPrice;
      }

      if (detail.panel_slot_usage?.unit_price) {
        return Number(detail.panel_slot_usage.unit_price) * quantity;
      }

      return 0;
    };

    // 가격 정보 계산 (모든 아이템의 할인 적용된 가격 합산)
    const calculateOrderPrice = () => {
      // 1) order_details가 없고, 결제 정보만 있는 경우 (상담신청 기반 주문 등)
      if (!orderDetails || orderDetails.length === 0) {
        const latestPayment =
          payments && payments.length > 0 ? payments[0] : null;

        if (latestPayment) {
          const amount = Number(latestPayment.amount || 0);
          return {
            totalPrice: amount,
            totalTaxPrice: 0,
            totalAdvertisingFee: amount,
            totalRoadUsageFee: 0,
            totalAdministrativeFee: 0,
            finalPrice: amount,
          };
        }

        return null;
      }

      // 모든 아이템의 할인 적용된 가격 합산
      const totalPrice = orderDetails.reduce((sum, detail) => {
        return sum + getDetailPrice(detail as OrderDetail);
      }, 0);

      // 완전한 fallback
      return {
        totalPrice,
        totalTaxPrice: 0,
        totalAdvertisingFee: totalPrice,
        totalRoadUsageFee: 0,
        totalAdministrativeFee: 0,
        finalPrice: totalPrice,
      };
    };

    const enrichedOrderDetails = (orderDetails || []).map((detail) => ({
      ...detail,
      price: getDetailPrice(detail),
    }));

    // 프로젝트 이름 추출 (디자인 드래프트에서)
    const getProjectName = () => {
      console.log('🔍 [getProjectName] designDrafts:', designDrafts);
      if (designDrafts && designDrafts.length > 0) {
        // design_drafts_id는 단일 ID이므로 첫 번째 항목 사용
        const draft = designDrafts[0];
        console.log('🔍 [getProjectName] draft:', draft);
        console.log('🔍 [getProjectName] draft.project_name:', draft?.project_name);
        const projectName = draft?.project_name;
        if (projectName && projectName.trim() !== '') {
          return projectName;
        }
      }
      console.log('🔍 [getProjectName] 프로젝트명 없음 반환');
      return '프로젝트명 없음';
    };

    // user_auth 정보 별도 조회 (외래 키 관계 문제 해결)
    let userAuth = null;
    if (order.user_auth_id) {
      const { data: authData } = await supabase
        .from('user_auth')
        .select('id, username, email, name, phone')
        .eq('id', order.user_auth_id)
        .single();
      userAuth = authData;
    }

    // 주문자 정보 정리
    const getCustomerData = () => {
      const userProfile = order.user_profiles;

      return {
        name: userProfile?.contact_person_name || userAuth?.name || '이름 없음',
        company: userProfile?.company_name || '회사명 없음',
        email: userProfile?.email || userAuth?.email || '이메일 없음',
        phone: userProfile?.phone || userAuth?.phone || '전화번호 없음',
        businessNumber:
          userProfile?.business_registration_file || '사업자등록증 없음',
        isCompany: userProfile?.is_company || false,
        isPublicInstitution: userProfile?.is_public_institution || false,
      };
    };

    // 응답 데이터 구성 (프론트엔드 타입에 맞춤)
    const priceInfo = calculateOrderPrice();
    const customerInfo = getCustomerData();

    console.log('🔍 [주문 상세 API] 계산된 정보:', {
      priceInfo,
      customerInfo,
      orderNumber: order.order_number,
      orderDetailsCount: orderDetails?.length || 0,
      paymentsCount: payments?.length || 0,
    });

    const responseData = {
      order: {
        ...order,
        projectName: getProjectName(),
        design_drafts: designDrafts, // design_drafts를 응답에 포함
      },
      orderDetails: enrichedOrderDetails,
      payments: payments || [],
      customerInfo: {
        name: customerInfo.name || '',
        phone: customerInfo.phone || '',
        company: customerInfo.company || '',
      },
      priceInfo: priceInfo || {
        totalPrice: 0,
        totalTaxPrice: 0,
        totalAdvertisingFee: 0,
        totalRoadUsageFee: 0,
        totalAdministrativeFee: 0,
        finalPrice: 0,
      },
    };

    console.log('🔍 [주문 상세 API] 최종 응답 데이터:', responseData);

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error('Order API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
