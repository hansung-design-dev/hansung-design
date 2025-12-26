import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

// half_period_inventory_status / summary / debug 뷰를
// 최신 스키마(banner_slot_id, is_closed 플래그) 기준으로 재정의
export async function POST() {
  try {
    console.log('🔧 Fixing half-period inventory views...');

    // 1. 패널별 상/하반기 재고 현황 뷰 (slot_number별로 분리)
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE VIEW half_period_inventory_status AS
        SELECT
          p.id AS panel_id,
          rgu.name AS district,
          rgdp.year_month,
          rgdp.period AS half_period,
          bs.slot_number,
          COUNT(DISTINCT bs.id) AS total_slots,
          COALESCE(
            COUNT(DISTINCT CASE WHEN bsi.is_closed = true THEN bs.id END),
            0
          ) AS closed_slots,
          COUNT(DISTINCT bs.id)
            - COALESCE(
                COUNT(DISTINCT CASE WHEN bsi.is_closed = true THEN bs.id END),
                0
              ) AS available_slots
        FROM panels p
        JOIN region_gu rgu
          ON p.region_gu_id = rgu.id
        JOIN region_gu_display_periods rgdp
          ON rgdp.region_gu_id = rgu.id
         AND rgdp.display_type_id = p.display_type_id
        LEFT JOIN banner_slots bs
          ON bs.panel_id = p.id
        LEFT JOIN banner_slot_inventory bsi
          ON bsi.banner_slot_id = bs.id
         AND bsi.region_gu_display_period_id = rgdp.id
        WHERE p.display_type_id = (
          SELECT id FROM display_types WHERE name = 'banner_display'
        )
        GROUP BY
          p.id,
          rgu.name,
          rgdp.year_month,
          rgdp.period,
          bs.slot_number;
      `,
    });

    // 2. 상/하반기 재고 통계 뷰
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE VIEW half_period_inventory_summary AS
        SELECT
          district,
          year_month,
          half_period,
          SUM(total_slots) AS total_slots,
          SUM(available_slots) AS available_slots,
          SUM(closed_slots) AS closed_slots
        FROM half_period_inventory_status
        GROUP BY
          district,
          year_month,
          half_period;
      `,
    });

    // 3. 디버깅용 주문/기간/슬롯 매칭 뷰
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE VIEW half_period_debug_view AS
        SELECT
          od.id AS order_detail_id,
          o.order_number,
          p.id AS panel_id,
          p.nickname AS panel_name,
          rgu.name AS district,
          od.display_start_date,
          od.display_end_date,
          rgdp.year_month,
          rgdp.period AS half_period,
          bs.id AS banner_slot_id,
          bsi.is_available,
          bsi.is_closed
        FROM order_details od
        JOIN orders o
          ON od.order_id = o.id
        JOIN panels p
          ON od.panel_id = p.id
        JOIN region_gu rgu
          ON p.region_gu_id = rgu.id
        LEFT JOIN panel_slot_usage psu
          ON od.panel_slot_usage_id = psu.id
        LEFT JOIN banner_slots bs
          ON (
            psu.banner_slot_id IS NOT NULL
            AND bs.id = psu.banner_slot_id
          )
          OR (
            psu.banner_slot_id IS NULL
            AND bs.panel_id = p.id
            AND bs.slot_number = 1
          )
        LEFT JOIN region_gu_display_periods rgdp
          ON rgdp.region_gu_id = rgu.id
         AND rgdp.display_type_id = p.display_type_id
         AND od.display_start_date <= rgdp.period_to
         AND od.display_end_date >= rgdp.period_from
        LEFT JOIN banner_slot_inventory bsi
          ON bsi.banner_slot_id = bs.id
         AND bsi.region_gu_display_period_id = rgdp.id;
      `,
    });

    console.log('✅ Half-period inventory views fixed successfully');

    return NextResponse.json({
      success: true,
      message: 'half_period_* 뷰가 최신 재고 스키마 기준으로 재정의되었습니다.',
    });
  } catch (error) {
    console.error('❌ Error fixing half-period inventory views:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'half_period_* 뷰 재정의 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}


