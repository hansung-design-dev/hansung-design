import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// 주문 내역 조회
export async function GET(request: NextRequest) {
  try {
    // 세션에서 사용자 정보 가져오기 (쿠키에서)
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 쿠키에서 사용자 ID 추출 (간단한 방식)
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    // 실제로는 JWT 토큰을 디코드해서 사용자 ID를 가져와야 함
    // 여기서는 임시로 쿠키에서 사용자 ID를 가져오는 방식 사용
    const userId = cookies['user_id'] || 'temp-user-id';

    // URL 파라미터에서 페이지네이션 정보 가져오기
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // 주문 내역 조회 (새로운 스키마에 맞게 수정)
    const {
      data: orders,
      error: ordersError,
      count,
    } = await supabase
      .from('orders')
      .select(
        `
        *,
        panel_info:panel_info_id (
          address,
          nickname,
          panel_status,
          panel_type
        ),
        region_gu:panel_info!inner(region_gu_id (
          name
        )),
        order_details (
          *
        )
      `,
        { count: 'exact' }
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (ordersError) {
      console.error('Orders fetch error:', ordersError);
      return NextResponse.json(
        { success: false, error: '주문 내역을 불러오는데 실패했습니다.' },
        { status: 500 }
      );
    }

    // 주문 상태별 개수 계산
    const { data: statusCounts } = await supabase
      .from('orders')
      .select('is_paid, is_checked')
      .eq('user_id', userId);

    const statusSummary = {
      total: statusCounts?.length || 0,
      pending: statusCounts?.filter((o) => !o.is_paid).length || 0,
      paid: statusCounts?.filter((o) => o.is_paid && !o.is_checked).length || 0,
      completed:
        statusCounts?.filter((o) => o.is_paid && o.is_checked).length || 0,
    };

    // 주문 데이터를 프론트엔드 형식으로 변환
    const transformedOrders =
      orders?.map((order) => ({
        id: order.id,
        order_number: order.id.slice(0, 8), // 간단한 주문번호 생성
        total_amount: order.total_price,
        status: order.is_paid
          ? order.is_checked
            ? 'completed'
            : 'confirmed'
          : 'pending',
        payment_status: order.is_paid ? 'paid' : 'pending',
        order_date: order.created_at,
        order_items:
          order.order_details?.map(
            (detail: {
              id: string;
              slot_order_quantity: number;
              display_start_date: string;
              display_end_date: string;
            }) => ({
              id: detail.id,
              panel_info: {
                address: order.panel_info?.address || '',
                nickname: order.panel_info?.nickname || '',
                panel_status: order.panel_info?.panel_status || '',
              },
              slot_info: {
                slot_name: '기본 슬롯',
                banner_type: 'panel',
                price_unit: '15 days',
              },
              quantity: detail.slot_order_quantity,
              unit_price: order.total_price,
              total_price: order.total_price,
              start_date: detail.display_start_date,
              end_date: detail.display_end_date,
              // 특별한 가격 표시 로직
              price_display: (() => {
                if (order.total_price === 0) {
                  const panelType = order.panel_info?.panel_type;
                  const regionName = order.region_gu?.name;

                  // 마포구 시민게시대 (bulletin-board)
                  if (
                    panelType === 'bulletin-board' &&
                    regionName === '마포구'
                  ) {
                    return '포스터 지참 후 방문 신청';
                  }

                  // 송파구, 용산구 상담문의
                  if (regionName === '송파구' || regionName === '용산구') {
                    return '상담문의';
                  }

                  return '상담문의';
                }
                return `${order.total_price.toLocaleString()}원`;
              })(),
            })
          ) || [],
      })) || [];

    return NextResponse.json({
      success: true,
      orders: transformedOrders,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      statusSummary,
    });
  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 주문 생성 (테스트용)
export async function POST(request: NextRequest) {
  try {
    // 임시 사용자 ID 사용
    const userId = 'temp-user-id';

    const { total_price, panel_info_id, order_details } = await request.json();

    // 주문 생성 (새로운 스키마에 맞게 수정)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        panel_info_id,
        total_price,
        is_paid: false,
        is_checked: false,
        payment_method: 'bank_transfer',
        depositor_name: '테스트',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      return NextResponse.json(
        { success: false, error: '주문을 생성하는데 실패했습니다.' },
        { status: 500 }
      );
    }

    // 주문 상세 정보 생성
    if (order_details && order_details.length > 0) {
      const orderDetailsWithOrderId = order_details.map(
        (detail: {
          slot_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          start_date: string;
          end_date: string;
        }) => ({
          order_id: order.id,
          slot_order_quantity: detail.quantity,
          display_start_date: detail.start_date,
          display_end_date: detail.end_date,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      );

      const { error: detailsError } = await supabase
        .from('order_details')
        .insert(orderDetailsWithOrderId);

      if (detailsError) {
        console.error('Order details creation error:', detailsError);
        return NextResponse.json(
          {
            success: false,
            error: '주문 상세 정보를 생성하는데 실패했습니다.',
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: '주문이 생성되었습니다.',
      order,
    });
  } catch (error) {
    console.error('Order creation API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
