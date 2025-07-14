import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/app/api/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;

    // 주문 정보 조회 (order_details, design_drafts 포함)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(
        `
        *,
        order_details (
          id,
          slot_order_quantity,
          display_start_date,
          display_end_date,
          panel_info_id,
          panel_slot_usage_id
        ),
        design_drafts (
          id,
          draft_category,
          file_name,
          created_at,
          is_approved,
          draft_delivery_method
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

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Order API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
