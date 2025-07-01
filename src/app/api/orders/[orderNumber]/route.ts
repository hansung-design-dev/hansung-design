import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// 주문번호로 주문 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    console.log('🔍 주문 상세 조회 시작, 주문번호:', orderNumber);

    // 세션에서 사용자 정보 가져오기 (쿠키에서)
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 쿠키에서 사용자 ID 추출
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

    console.log('🔍 사용자 ID:', userId);

    // 주문번호로 주문 상세 정보 조회
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(
        `
        *,
        order_details (
          id,
          panel_info_id,
          panel_slot_usage_id,
          slot_order_quantity,
          display_start_date,
          display_end_date,
          half_period,
          panel_info:panel_info_id (
            id,
            nickname,
            address,
            panel_status,
            panel_type,
            region_gu:region_gu_id (
              name
            )
          )
        ),
        user_profiles (
          *
        )
      `
      )
      .eq('order_number', orderNumber)
      .or(`user_auth_id.eq.${userId},user_profile_id.eq.${userId}`)
      .single();

    console.log('🔍 주문 상세 조회 결과:', { order, orderError });

    if (orderError) {
      console.error('Order detail fetch error:', orderError);
      return NextResponse.json(
        { success: false, error: '주문을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: '주문을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 주문 생성일로부터 3일 경과 여부 확인
    const orderDate = new Date(order.created_at);
    const currentDate = new Date();
    const daysDiff = Math.floor(
      (currentDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const canCancel = daysDiff <= 3 && !order.is_paid;

    // 주문 상세 데이터 변환
    const firstOrderDetail = order.order_details?.[0];
    const orderDetail = {
      id: order.id,
      order_number: order.order_number,
      title:
        firstOrderDetail?.panel_info?.nickname ||
        firstOrderDetail?.panel_info?.address ||
        '',
      location: firstOrderDetail?.panel_info?.region_gu?.name || '',
      status: order.is_paid
        ? order.is_checked
          ? '송출중'
          : '진행중'
        : '대기중',
      category: firstOrderDetail?.panel_info?.panel_type || '',
      customerName: order.user_profiles?.contact_person_name || '',
      phone: order.user_profiles?.phone || '',
      companyName: order.user_profiles?.company_name || '',
      productName: firstOrderDetail?.panel_info?.panel_type || '',
      price: order.total_price,
      vat: Math.floor(order.total_price * 0.1), // 부가세 10%
      designFee: 0, // 디자인비 (필요시 추가)
      roadUsageFee: 0, // 도로사용료
      totalAmount: order.total_price,
      paymentMethod:
        order.payment_method === 'card' ? '카드결제' : '무통장입금',
      depositorName: order.user_profiles?.contact_person_name || '',
      orderDate: order.created_at,
      year_month: order.year_month,
      half_period: order.half_period,
      canCancel: canCancel,
      daysSinceOrder: daysDiff,
      // panel_slot_snapshot 데이터 추가
      panel_slot_snapshot: order.panel_slot_snapshot,
      panel_slot_usage_id: firstOrderDetail?.panel_slot_usage_id,
    };

    return NextResponse.json({
      success: true,
      orderDetail,
    });
  } catch (error) {
    console.error('Order detail API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
