import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      action,
      panel_id,
      display_start_date,
      display_end_date,
      slot_order_quantity,
    } = body;

    console.log('🧪 Testing half-period inventory flow...', {
      action,
      panel_id,
      display_start_date,
      display_end_date,
      slot_order_quantity,
    });

    let result;

    switch (action) {
      case 'check_period':
        // 1. 해당 패널의 상하반기 기간 확인
        result = await supabase
          .from('region_gu_display_periods')
          .select(
            `
            id,
            period,
            period_from,
            period_to,
            year_month,
            region_gu:region_gu_id(name),
            display_type:display_type_id(name)
          `
          )
          .eq(
            'region_gu_id',
            (
              await supabase
                .from('panels')
                .select('region_gu_id')
                .eq('id', panel_id)
                .single()
            ).data?.region_gu_id
          )
          .gte('period_from', display_start_date)
          .lte('period_to', display_end_date);

        return NextResponse.json({
          success: true,
          message: '상하반기 기간 확인 완료',
          data: result.data,
        });

      case 'check_inventory':
        // 2. 해당 상하반기의 재고 현황 확인
        const periodResult = await supabase
          .from('region_gu_display_periods')
          .select('id, period')
          .eq(
            'region_gu_id',
            (
              await supabase
                .from('panels')
                .select('region_gu_id')
                .eq('id', panel_id)
                .single()
            ).data?.region_gu_id
          )
          .gte('period_from', display_start_date)
          .lte('period_to', display_end_date)
          .single();

        if (periodResult.data) {
          const inventoryResult = await supabase
            .from('banner_slot_inventory')
            .select('*')
            .eq('panel_id', panel_id)
            .eq('region_gu_display_period_id', periodResult.data.id)
            .single();

          return NextResponse.json({
            success: true,
            message: '재고 현황 확인 완료',
            data: {
              period: periodResult.data,
              inventory: inventoryResult.data,
            },
          });
        }

        return NextResponse.json({
          success: false,
          message: '해당 기간을 찾을 수 없습니다.',
        });

      case 'simulate_order':
        // 3. 주문 시뮬레이션 (실제 주문은 생성하지 않고 재고만 확인)
        const { data: periodData } = await supabase
          .from('region_gu_display_periods')
          .select('id, period, period_from, period_to')
          .eq(
            'region_gu_id',
            (
              await supabase
                .from('panels')
                .select('region_gu_id')
                .eq('id', panel_id)
                .single()
            ).data?.region_gu_id
          )
          .gte('period_from', display_start_date)
          .lte('period_to', display_end_date)
          .single();

        if (!periodData) {
          return NextResponse.json({
            success: false,
            message: '해당 기간을 찾을 수 없습니다.',
          });
        }

        const { data: currentInventory } = await supabase
          .from('banner_slot_inventory')
          .select('*')
          .eq('panel_id', panel_id)
          .eq('region_gu_display_period_id', periodData.id)
          .single();

        if (!currentInventory) {
          return NextResponse.json({
            success: false,
            message: '재고 정보가 없습니다.',
          });
        }

        const newAvailableSlots = Math.max(
          0,
          currentInventory.available_slots - slot_order_quantity
        );
        const newClosedSlots =
          currentInventory.closed_slots + slot_order_quantity;

        return NextResponse.json({
          success: true,
          message: '주문 시뮬레이션 완료',
          data: {
            period: periodData,
            current_inventory: currentInventory,
            simulation: {
              requested_quantity: slot_order_quantity,
              new_available_slots: newAvailableSlots,
              new_closed_slots: newClosedSlots,
              can_order:
                currentInventory.available_slots >= slot_order_quantity,
            },
          },
        });

      case 'view_inventory_status':
        // 4. 상하반기 재고 현황 뷰 조회
        const { data: inventoryStatus } = await supabase
          .from('half_period_inventory_status')
          .select('*')
          .eq('panel_id', panel_id)
          .order('year_month', { ascending: false })
          .order('half_period', { ascending: true });

        return NextResponse.json({
          success: true,
          message: '상하반기 재고 현황 조회 완료',
          data: inventoryStatus,
        });

      case 'view_inventory_summary':
        // 5. 상하반기 재고 통계 뷰 조회
        const { data: inventorySummary } = await supabase
          .from('half_period_inventory_summary')
          .select('*')
          .order('year_month', { ascending: false })
          .order('half_period', { ascending: true });

        return NextResponse.json({
          success: true,
          message: '상하반기 재고 통계 조회 완료',
          data: inventorySummary,
        });

      case 'debug_orders':
        // 6. 디버깅용 주문 뷰 조회
        const { data: debugOrders } = await supabase
          .from('half_period_debug_view')
          .select('*')
          .eq('panel_id', panel_id)
          .order('order_detail_id', { ascending: false });

        return NextResponse.json({
          success: true,
          message: '디버깅용 주문 정보 조회 완료',
          data: debugOrders,
        });

      default:
        return NextResponse.json({
          success: false,
          message: '지원하지 않는 액션입니다.',
          supported_actions: [
            'check_period',
            'check_inventory',
            'simulate_order',
            'view_inventory_status',
            'view_inventory_summary',
            'debug_orders',
          ],
        });
    }
  } catch (error) {
    console.error('❌ Error testing half-period inventory:', error);
    return NextResponse.json(
      {
        success: false,
        message: '상하반기 재고 테스트 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district');
    const yearMonth = searchParams.get('yearMonth');

    console.log('📊 Fetching half-period inventory test data...', {
      district,
      yearMonth,
    });

    let query = supabase.from('half_period_inventory_status').select('*');

    if (district) {
      query = query.eq('district', district);
    }

    if (yearMonth) {
      query = query.eq('year_month', yearMonth);
    }

    const { data, error } = await query
      .order('district', { ascending: true })
      .order('year_month', { ascending: false })
      .order('half_period', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: '상하반기 재고 테스트 데이터 조회 완료',
      data: data || [],
    });
  } catch (error) {
    console.error('❌ Error fetching half-period inventory test data:', error);
    return NextResponse.json(
      {
        success: false,
        message: '상하반기 재고 테스트 데이터 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
