import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/app/api/supabase';

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
        user_auth!orders_auth_user_id_fkey (
          id,
          username,
          email,
          name,
          phone
        ),
        user_profiles!orders_user_profile_id_fkey (
          id,
          profile_title,
          company_name,
          business_registration_number,
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
        panel_info!order_details_panel_info_id_fkey (
          id,
          nickname,
          address,
          photo_url,
          location_url,
          map_url,
          latitude,
          longitude,
          panel_code,
          panel_type,
          max_banner,
          region_gu!panel_info_region_gu_id_fkey (
            id,
            name,
            code
          ),
          region_dong!panel_info_region_dong_id_fkey (
            id,
            name
          ),
          display_types!panel_info_display_type_id_fkey (
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
          banner_slot_info!panel_slot_usage_banner_slot_info_id_fkey (
            id,
            slot_name,
            max_width,
            max_height,
            banner_type,
            price_unit,
            panel_slot_status,
            notes
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
    let designDrafts: any[] = [];
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

      // panel_slot_snapshot에서 가격 정보 가져오기
      const snapshot = order.panel_slot_snapshot;
      if (snapshot) {
        return {
          totalPrice: Number(snapshot.policy_total_price || 0),
          totalTaxPrice: Number(snapshot.policy_tax_price || 0),
          totalAdvertisingFee: Number(snapshot.policy_advertising_fee || 0),
          totalRoadUsageFee: Number(snapshot.policy_road_usage_fee || 0),
          totalAdministrativeFee: 0,
          finalPrice: Number(snapshot.policy_total_price || 0),
        };
      }

      // fallback: orderDetails에서 계산
      let totalPrice = 0;
      orderDetails.forEach((detail) => {
        if (detail.panel_slot_usage) {
          if (detail.panel_slot_usage.unit_price) {
            totalPrice +=
              Number(detail.panel_slot_usage.unit_price) *
              (detail.slot_order_quantity || 1);
          }
        }
      });

      return {
        totalPrice,
        totalTaxPrice: 0,
        totalAdvertisingFee: 0,
        totalRoadUsageFee: 0,
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

    // 주문자 정보 정리
    const getCustomerInfo = () => {
      const userAuth = order.user_auth;
      const userProfile = order.user_profiles;

      return {
        name: userProfile?.contact_person_name || userAuth?.name || '이름 없음',
        company: userProfile?.company_name || '회사명 없음',
        email: userProfile?.email || userAuth?.email || '이메일 없음',
        phone: userProfile?.phone || userAuth?.phone || '전화번호 없음',
        businessNumber:
          userProfile?.business_registration_number || '사업자번호 없음',
        isCompany: userProfile?.is_company || false,
        isPublicInstitution: userProfile?.is_public_institution || false,
      };
    };

    // 응답 데이터 구성
    const responseData = {
      order: {
        ...order,
        projectName: getProjectName(),
        customerInfo: getCustomerInfo(),
        priceInfo: calculateOrderPrice(),
      },
      orderDetails,
      designDrafts,
      payments,
    };

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
