import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Fixing period-based inventory management...');

    // 1. 기존 트리거 삭제
    await supabase.rpc('exec_sql', {
      sql: `
        DROP TRIGGER IF EXISTS banner_inventory_insert_trigger ON order_details;
        DROP TRIGGER IF EXISTS banner_inventory_delete_trigger ON order_details;
        DROP TRIGGER IF EXISTS inventory_check_trigger ON order_details;
      `,
    });

    // 2. 기간별 재고 관리 함수들 생성
    await supabase.rpc('exec_sql', {
      sql: `
        -- 주문 시 특정 기간의 재고만 감소
        CREATE OR REPLACE FUNCTION update_banner_slot_inventory_on_order()
        RETURNS TRIGGER AS $$
        DECLARE
          period_id UUID;
          panel_record RECORD;
        BEGIN
          -- order_details의 display_start_date를 기반으로 해당하는 기간 찾기
          SELECT rgdp.id INTO period_id
          FROM region_gu_display_periods rgdp
          JOIN panel_info pi ON pi.region_gu_id = rgdp.region_gu_id
          WHERE pi.id = NEW.panel_info_id
            AND rgdp.display_type_id = pi.display_type_id
            AND NEW.display_start_date >= rgdp.period_from
            AND NEW.display_start_date <= rgdp.period_to;
          
          -- 해당 기간의 재고 업데이트
          IF period_id IS NOT NULL THEN
            UPDATE banner_slot_inventory 
            SET 
              available_slots = GREATEST(0, available_slots - NEW.slot_order_quantity),
              closed_slots = closed_slots + NEW.slot_order_quantity,
              updated_at = NOW()
            WHERE panel_info_id = NEW.panel_info_id
              AND region_gu_display_period_id = period_id;
            
            -- 재고 정보가 없으면 새로 생성
            IF NOT FOUND THEN
              SELECT * INTO panel_record FROM panel_info WHERE id = NEW.panel_info_id;
              INSERT INTO banner_slot_inventory (
                panel_info_id,
                region_gu_display_period_id,
                total_slots,
                available_slots,
                closed_slots
              )
              VALUES (
                NEW.panel_info_id,
                period_id,
                panel_record.max_banner,
                GREATEST(0, panel_record.max_banner - NEW.slot_order_quantity),
                NEW.slot_order_quantity
              );
            END IF;
          END IF;
          
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `,
    });

    await supabase.rpc('exec_sql', {
      sql: `
        -- 주문 취소 시 특정 기간의 재고만 복구
        CREATE OR REPLACE FUNCTION restore_banner_slot_inventory_on_order_delete()
        RETURNS TRIGGER AS $$
        DECLARE
          period_id UUID;
        BEGIN
          -- order_details의 display_start_date를 기반으로 해당하는 기간 찾기
          SELECT rgdp.id INTO period_id
          FROM region_gu_display_periods rgdp
          JOIN panel_info pi ON pi.region_gu_id = rgdp.region_gu_id
          WHERE pi.id = OLD.panel_info_id
            AND rgdp.display_type_id = pi.display_type_id
            AND OLD.display_start_date >= rgdp.period_from
            AND OLD.display_start_date <= rgdp.period_to;
          
          -- 해당 기간의 재고 복구
          IF period_id IS NOT NULL THEN
            UPDATE banner_slot_inventory 
            SET 
              available_slots = LEAST(total_slots, available_slots + OLD.slot_order_quantity),
              closed_slots = GREATEST(0, closed_slots - OLD.slot_order_quantity),
              updated_at = NOW()
            WHERE panel_info_id = OLD.panel_info_id
              AND region_gu_display_period_id = period_id;
          END IF;
          
          RETURN OLD;
        END;
        $$ LANGUAGE plpgsql;
      `,
    });

    await supabase.rpc('exec_sql', {
      sql: `
        -- 주문 전 특정 기간의 재고 확인
        CREATE OR REPLACE FUNCTION check_inventory_before_order()
        RETURNS TRIGGER AS $$
        DECLARE
          period_id UUID;
          current_inventory RECORD;
        BEGIN
          -- order_details의 display_start_date를 기반으로 해당하는 기간 찾기
          SELECT rgdp.id INTO period_id
          FROM region_gu_display_periods rgdp
          JOIN panel_info pi ON pi.region_gu_id = rgdp.region_gu_id
          WHERE pi.id = NEW.panel_info_id
            AND rgdp.display_type_id = pi.display_type_id
            AND NEW.display_start_date >= rgdp.period_from
            AND NEW.display_start_date <= rgdp.period_to;
          
          -- 해당 기간의 재고 확인
          IF period_id IS NOT NULL THEN
            SELECT available_slots, total_slots INTO current_inventory
            FROM banner_slot_inventory
            WHERE panel_info_id = NEW.panel_info_id
              AND region_gu_display_period_id = period_id;
            
            -- 재고 정보가 있고, 주문 수량이 가용 재고를 초과하는 경우
            IF FOUND AND current_inventory.available_slots < NEW.slot_order_quantity THEN
              RAISE EXCEPTION '재고 부족: 요청 수량 %개, 가용 재고 %개 (기간: %)', 
                NEW.slot_order_quantity, current_inventory.available_slots, period_id;
            END IF;
          END IF;
          
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `,
    });

    // 3. 새로운 트리거 등록
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TRIGGER banner_inventory_insert_trigger
          AFTER INSERT ON order_details
          FOR EACH ROW
          EXECUTE FUNCTION update_banner_slot_inventory_on_order();

        CREATE TRIGGER banner_inventory_delete_trigger
          AFTER DELETE ON order_details
          FOR EACH ROW
          EXECUTE FUNCTION restore_banner_slot_inventory_on_order_delete();

        CREATE TRIGGER inventory_check_trigger
          BEFORE INSERT ON order_details
          FOR EACH ROW
          EXECUTE FUNCTION check_inventory_before_order();
      `,
    });

    // 4. 기간별 재고 현황 확인을 위한 뷰 업데이트
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE VIEW inventory_status_view AS
        SELECT 
          pi.id as panel_info_id,
          pi.nickname as panel_name,
          pi.address,
          rgu.name as district,
          rgdp.year_month,
          rgdp.period,
          rgdp.period_from,
          rgdp.period_to,
          bsi.total_slots,
          bsi.available_slots,
          bsi.closed_slots,
          CASE 
            WHEN bsi.available_slots = 0 THEN '매진'
            WHEN bsi.available_slots <= bsi.total_slots * 0.2 THEN '재고부족'
            ELSE '재고있음'
          END as inventory_status,
          bsi.updated_at as last_updated
        FROM panel_info pi
        LEFT JOIN region_gu rgu ON pi.region_gu_id = rgu.id
        LEFT JOIN banner_slot_inventory bsi ON pi.id = bsi.panel_info_id
        LEFT JOIN region_gu_display_periods rgdp ON bsi.region_gu_display_period_id = rgdp.id
        WHERE pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
        ORDER BY rgdp.year_month DESC, rgdp.period, bsi.updated_at DESC;
      `,
    });

    console.log('✅ Period-based inventory management fixed successfully');

    return NextResponse.json({
      success: true,
      message: 'Period-based inventory management has been fixed successfully',
    });
  } catch (error) {
    console.error('❌ Error fixing inventory management:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
