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
          ),
          panel_slot_usage:panel_slot_usage_id (
            id,
            panel_info_id,
            banner_slot_info_id,
            banner_slot_info:banner_slot_info_id (
              tax_price,
              advertising_fee,
              road_usage_fee,
              total_price
            )
          )
        ),
        user_profiles (
          *
        )
      `
      )
      .eq('order_number', orderNumber)
      .eq('user_auth_id', userId)
      .single();

    console.log('🔍 주문 상세 조회 결과:', {
      orderId: order?.id,
      orderNumber: order?.order_number,
      orderError,
    });

    // order_details 데이터 자세히 로그
    if (order?.order_details) {
      console.log('🔍 order_details 상세 데이터:');
      (
        order.order_details as Array<{
          id: string;
          panel_info_id: string;
          panel_slot_usage_id?: string;
          panel_info?: {
            id: string;
            nickname?: string;
            address?: string;
            panel_type?: string;
            region_gu?: { name: string };
          };
          panel_slot_usage?: {
            id: string;
            banner_slot_info?: {
              tax_price?: number;
              advertising_fee?: number;
              road_usage_fee?: number;
              total_price?: number;
            };
          };
        }>
      ).forEach((detail, index: number) => {
        console.log(`  [${index}] order_detail:`, {
          id: detail.id,
          panel_info_id: detail.panel_info_id,
          panel_slot_usage_id: detail.panel_slot_usage_id,
          panel_info: detail.panel_info,
          panel_slot_usage: detail.panel_slot_usage,
          banner_slot_info: detail.panel_slot_usage?.banner_slot_info,
        });
      });
    }

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

    // 상품 분류 한글 변환 함수
    const getProductName = (panelType: string) => {
      const typeMap: Record<string, string> = {
        manual: '현수막게시대',
        'semi-auto': '반자동',
        'bulletin-board': '시민게시대',
        'bulletin-boardg': '시민게시대', // 오타 수정
        'cultural-board': '시민/문화게시대',
        'lower-panel': '저단형',
        'multi-panel': '연립형',
        led: 'LED전자게시대',
        no_lighting: '비조명용',
        with_lighting: '조명용',
        panel: '현수막게시대',
        'top-fixed': '상단광고',
      };
      return typeMap[panelType] || panelType;
    };

    // 주문 생성일로부터 3일 경과 여부 확인
    const orderDate = new Date(order.created_at);
    const currentDate = new Date();
    const daysDiff = Math.floor(
      (currentDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const canCancel = daysDiff <= 3 && !order.is_paid;

    // 주문 상세 데이터 변환
    const firstOrderDetail = order.order_details?.[0];
    const panelInfo = firstOrderDetail?.panel_info;
    const panelSlotUsage = firstOrderDetail?.panel_slot_usage;
    const bannerSlotInfo = panelSlotUsage?.banner_slot_info;

    // 위치 정보 조합 (nickname + address + region_gu.name)
    const location = [
      panelInfo?.nickname,
      panelInfo?.address,
      panelInfo?.region_gu?.name,
    ]
      .filter(Boolean)
      .join(' ');

    // 결제 상태에 따른 상태 표시
    const getStatus = () => {
      if (!order.is_paid) {
        return order.payment_method === 'card'
          ? '입금확인 중...'
          : '입금확인 중...';
      }
      return order.is_checked ? '송출중' : '진행중';
    };

    // 가격 정보 결정 (banner_slot_info 우선, 없으면 panel_slot_snapshot 사용)
    let vat = 0;
    let designFee = 0;
    let roadUsageFee = 0;
    let totalAmount = order.total_price;

    if (bannerSlotInfo) {
      // banner_slot_info에서 가격 정보 가져오기 (우선순위)
      vat = bannerSlotInfo.tax_price || 0;
      designFee = bannerSlotInfo.advertising_fee || 0;
      roadUsageFee = bannerSlotInfo.road_usage_fee || 0;
      totalAmount = bannerSlotInfo.total_price || order.total_price;
    } else if (order.panel_slot_snapshot) {
      // panel_slot_snapshot에서 가격 정보 가져오기 (백업)
      const snapshot = order.panel_slot_snapshot as {
        tax_price?: number;
        advertising_fee?: number;
        road_usage_fee?: number;
        total_price?: number;
      };
      vat = snapshot.tax_price || 0;
      designFee = snapshot.advertising_fee || 0;
      roadUsageFee = snapshot.road_usage_fee || 0;
      totalAmount = snapshot.total_price || order.total_price;
    }

    const orderDetail = {
      id: order.id,
      order_number: order.order_number,
      title: panelInfo?.nickname || panelInfo?.address || '',
      location: location,
      status: getStatus(),
      category: getProductName(panelInfo?.panel_type || ''),
      customerName: order.user_profiles?.contact_person_name || '',
      phone: order.user_profiles?.phone || '',
      companyName: order.user_profiles?.company_name || '',
      productName: getProductName(panelInfo?.panel_type || ''),
      vat: vat,
      designFee: designFee,
      roadUsageFee: roadUsageFee,
      totalAmount: totalAmount,
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
