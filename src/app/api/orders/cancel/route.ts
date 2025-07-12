import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function DELETE(request: NextRequest) {
  try {
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

    // URL에서 주문 ID 가져오기
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: '주문 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('🔍 주문 취소 시작 - 주문 ID:', orderId, '사용자 ID:', userId);

    // 주문이 해당 사용자의 것인지 확인 (실제 주문 ID로 검색)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, is_paid, is_checked')
      .eq('id', orderId)
      .eq('user_auth_id', userId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: '주문을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 테스트 중이므로 결제 완료된 주문도 취소 가능
    // TODO: 실제 운영 시에는 아래 주석을 해제하고 위의 체크를 활성화
    /*
    // 이미 결제 완료된 주문은 취소 불가
    if (order.is_paid) {
      return NextResponse.json(
        { success: false, error: '이미 결제된 주문은 취소할 수 없습니다.' },
        { status: 400 }
      );
    }
    */

    // 트랜잭션 시작
    const { data: orderDetails, error: detailsError } = await supabase
      .from('order_details')
      .select('panel_slot_usage_id, slot_order_quantity')
      .eq('order_id', orderId);

    if (detailsError) {
      console.error('Order details fetch error:', detailsError);
      return NextResponse.json(
        { success: false, error: '주문 상세 정보를 불러오는데 실패했습니다.' },
        { status: 500 }
      );
    }

    // 1. panel_slot_usage 테이블에서 사용량 복원
    for (const detail of orderDetails || []) {
      if (detail.panel_slot_usage_id) {
        // 현재 사용량을 먼저 조회
        const { data: currentUsage, error: fetchError } = await supabase
          .from('panel_slot_usage')
          .select('used_quantity')
          .eq('id', detail.panel_slot_usage_id)
          .single();

        if (fetchError) {
          console.error('Panel slot usage fetch error:', fetchError);
          return NextResponse.json(
            { success: false, error: '슬롯 사용량 조회에 실패했습니다.' },
            { status: 500 }
          );
        }

        // 사용량 감소
        const newUsedQuantity = Math.max(
          0,
          (currentUsage?.used_quantity || 0) - detail.slot_order_quantity
        );

        const { error: usageError } = await supabase
          .from('panel_slot_usage')
          .update({
            used_quantity: newUsedQuantity,
            updated_at: new Date().toISOString(),
          })
          .eq('id', detail.panel_slot_usage_id);

        if (usageError) {
          console.error('Panel slot usage update error:', usageError);
          return NextResponse.json(
            { success: false, error: '슬롯 사용량 복원에 실패했습니다.' },
            { status: 500 }
          );
        }
      }
    }

    // 2. order_details 삭제
    const { error: deleteDetailsError } = await supabase
      .from('order_details')
      .delete()
      .eq('order_id', orderId);

    if (deleteDetailsError) {
      console.error('Order details delete error:', deleteDetailsError);
      return NextResponse.json(
        { success: false, error: '주문 상세 정보 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 3. orders 삭제
    const { error: deleteOrderError } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (deleteOrderError) {
      console.error('Order delete error:', deleteOrderError);
      return NextResponse.json(
        { success: false, error: '주문 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }

    console.log('🔍 주문 취소 완료 - 주문 ID:', orderId);

    return NextResponse.json({
      success: true,
      message: '주문이 성공적으로 취소되었습니다.',
    });
  } catch (error) {
    console.error('Order cancel error:', error);
    return NextResponse.json(
      { success: false, error: '주문 취소 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
