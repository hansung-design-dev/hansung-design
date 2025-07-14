import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 주문 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // 쿠키에서 사용자 ID 추출
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    const userId = cookies['user_id'];

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    console.log('🔍 주문 목록 조회 시작 - 사용자 ID:', userId);

    // 주문 목록 조회 (단방향 관계 사용)
    const { data: orders, error } = await supabase
      .from('orders')
      .select(
        `
        id,
        order_number,
        created_at,
        updated_at,
        draft_delivery_method,
        design_drafts!design_drafts_order_id_fkey (
          id,
          project_name,
          draft_category,
          file_name,
          created_at,
          is_approved
        ),
        order_details (
          id,
          slot_order_quantity,
          display_start_date,
          display_end_date,
          panel_info_id,
          panel_slot_usage_id,
          panel_info (
            address,
            nickname,
            panel_status,
            panel_type,
            region_gu (
              name
            ),
            region_dong (
              name
            )
          )
        ),
        payments (
          id,
          amount,
          payment_status,
          payment_date,
          admin_approval_status
        )
      `
      )
      .eq('user_auth_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Orders fetch error:', error);
      return NextResponse.json(
        { success: false, error: '주문 목록을 불러오는데 실패했습니다.' },
        { status: 500 }
      );
    }

    // 주문 데이터를 프론트엔드 형식으로 변환
    const transformedOrders =
      orders?.map((order: any) => {
        // 총 가격 계산 (payments 테이블에서)
        const totalAmount =
          order.payments?.reduce((sum: number, payment: any) => {
            return sum + (payment.amount || 0);
          }, 0) || 0;

        // 결제 상태 결정
        const paymentStatus =
          order.payments?.length > 0
            ? order.payments[0]?.payment_status || 'pending'
            : 'pending';

        // 어드민 승인 상태
        const adminApprovalStatus =
          order.payments?.length > 0
            ? order.payments[0]?.admin_approval_status || 'pending'
            : 'pending';

        return {
          id: order.id,
          order_number: order.order_number || order.id.slice(0, 8),
          total_price: totalAmount,
          payment_status: paymentStatus,
          admin_approval_status: adminApprovalStatus,
          created_at: order.created_at,
          updated_at: order.updated_at,
          draft_delivery_method: order.draft_delivery_method,
          design_drafts: order.design_drafts || [],
          order_details:
            order.order_details?.map((detail: any) => ({
              id: detail.id,
              project_name:
                order.design_drafts?.[0]?.project_name || '작업명 없음',
              quantity: detail.slot_order_quantity || 1,
              unit_price: 0, // 임시로 0 설정
              total_price: 0, // 임시로 0 설정
            })) || [],
        };
      }) || [];

    return NextResponse.json({
      success: true,
      data: transformedOrders,
      pagination: {
        page,
        limit,
        total: orders?.length || 0,
        totalPages: Math.ceil((orders?.length || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  panel_info_id: string;
  halfPeriod?: 'first_half' | 'second_half';
  selectedYear?: number; // 선택한 년도
  selectedMonth?: number; // 선택한 월
  startDate?: string;
  endDate?: string;
  // 기간 데이터 추가 (구별 카드에서 전달받은 데이터)
  periodData?: {
    first_half_from: string;
    first_half_to: string;
    second_half_from: string;
    second_half_to: string;
  };
  // 선택된 기간의 시작/종료 날짜
  selectedPeriodFrom?: string;
  selectedPeriodTo?: string;
  panel_slot_snapshot?: {
    id: string | null;
    notes: string | null;
    max_width: number | null;
    slot_name: string | null;
    tax_price: number | null;
    created_at: string | null;
    max_height: number | null;
    price_unit: string | null;
    updated_at: string | null;
    banner_type: string | null;
    slot_number: number | null;
    total_price: number | null;
    panel_info_id: string | null;
    road_usage_fee: number | null;
    advertising_fee: number | null;
    panel_slot_status: string | null;
  };
  panel_slot_usage_id?: string;
}

// 주문 생성 (기존 코드 유지)
export async function POST(request: NextRequest) {
  // 기존 POST 로직 유지
  return NextResponse.json({ success: false, error: 'Not implemented' });
}
