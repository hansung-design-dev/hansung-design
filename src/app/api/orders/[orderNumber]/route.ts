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
  draft_category?: string;
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
      const { data: drafts, error: draftsError } = await supabase
        .from('design_drafts')
        .select(
          `
          *,
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
        .order('created_at', { ascending: true });

      designDrafts = drafts || [];
      designDraftsError = draftsError;
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

    // 가격 정보 계산
    const calculateOrderPrice = () => {
      if (!orderDetails || orderDetails.length === 0) return null;

      // panel_slot_snapshot에서 가격 정보 가져오기 (우선순위 1)
      const snapshot = order.panel_slot_snapshot;
      if (snapshot && snapshot.policy_total_price) {
        return {
          totalPrice: Number(snapshot.policy_total_price || 0),
          totalTaxPrice: Number(snapshot.policy_tax_price || 0),
          totalAdvertisingFee: Number(snapshot.policy_advertising_fee || 0),
          totalRoadUsageFee: Number(snapshot.policy_road_usage_fee || 0),
          totalAdministrativeFee: 0,
          finalPrice: Number(snapshot.policy_total_price || 0),
        };
      }

      // fallback: orderDetails에서 banner_slot_price_policy로 계산
      let totalPrice = 0;
      let totalTaxPrice = 0;
      let totalAdvertisingFee = 0;
      let totalRoadUsageFee = 0;

      // 사용자 타입 확인 (공공기관 여부)
      const isPublicInstitution =
        order.user_profiles?.is_public_institution || false;
      const preferredPriceUsageType = isPublicInstitution
        ? 'public_institution'
        : 'default';

      orderDetails.forEach((detail) => {
        const quantity = detail.slot_order_quantity || 1;

        // banner_slot_price_policy에서 가격 정보 가져오기
        if (
          detail.panel_slot_usage?.banner_slots?.banner_slot_price_policy &&
          detail.panel_slot_usage.banner_slots.banner_slot_price_policy.length >
            0
        ) {
          // 사용자 타입에 따라 적절한 정책 선택
          const policies =
            detail.panel_slot_usage.banner_slots.banner_slot_price_policy;

          // 우선순위: 사용자 타입에 맞는 정책 > default > 첫 번째 정책
          let selectedPolicy = policies.find(
            (p: { price_usage_type: string }) =>
              p.price_usage_type === preferredPriceUsageType
          );

          if (!selectedPolicy) {
            selectedPolicy = policies.find(
              (p: { price_usage_type: string }) =>
                p.price_usage_type === 'default'
            );
          }

          if (!selectedPolicy) {
            selectedPolicy = policies[0];
          }

          if (selectedPolicy) {
            totalPrice += Number(selectedPolicy.total_price || 0) * quantity;
            totalTaxPrice += Number(selectedPolicy.tax_price || 0) * quantity;
            totalAdvertisingFee +=
              Number(selectedPolicy.advertising_fee || 0) * quantity;
            totalRoadUsageFee +=
              Number(selectedPolicy.road_usage_fee || 0) * quantity;
          }
        } else if (detail.panel_slot_usage?.unit_price) {
          // banner_slot_price_policy가 없으면 unit_price 사용 (하위 호환성)
          totalPrice += Number(detail.panel_slot_usage.unit_price) * quantity;
        }
      });

      return {
        totalPrice,
        totalTaxPrice,
        totalAdvertisingFee,
        totalRoadUsageFee,
        totalAdministrativeFee: 0,
        finalPrice: totalPrice,
      };
    };

    // 프로젝트 이름 추출 (디자인 드래프트에서)
    const getProjectName = () => {
      if (designDrafts && designDrafts.length > 0) {
        // design_drafts_id는 단일 ID이므로 첫 번째 항목 사용
        const draft = designDrafts[0];
        console.log('🔍 draft:', draft);
        return draft?.project_name || '프로젝트명 없음';
      }
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
      },
      orderDetails: orderDetails || [],
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
