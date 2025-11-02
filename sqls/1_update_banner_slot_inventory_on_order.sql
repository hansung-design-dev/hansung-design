-- 함수 1: update_banner_slot_inventory_on_order
-- ⚠️ 이 파일만 복사해서 Supabase SQL Editor에서 실행하세요

CREATE OR REPLACE FUNCTION update_banner_slot_inventory_on_order()
RETURNS TRIGGER AS $$
DECLARE
  period_id UUID;
  banner_slot_id_val UUID;
  current_inventory RECORD;
BEGIN
  -- 1. panel_slot_usage_id를 통해 banner_slot_id 조회 (NEW.banner_slot_id 직접 참조하지 않음!)
  IF NEW.panel_slot_usage_id IS NOT NULL THEN
    SELECT banner_slot_id INTO banner_slot_id_val
    FROM panel_slot_usage
    WHERE id = NEW.panel_slot_usage_id;
    
    IF banner_slot_id_val IS NULL THEN
      RAISE NOTICE 'panel_slot_usage_id %에 해당하는 banner_slot_id를 찾을 수 없음', NEW.panel_slot_usage_id;
      RETURN NEW;
    END IF;
  ELSE
    -- panel_slot_usage_id가 없으면 panel_id로 기본 슬롯 찾기
    SELECT bs.id INTO banner_slot_id_val
    FROM banner_slots bs
    WHERE bs.panel_id = NEW.panel_id
      AND bs.slot_number = 1
    LIMIT 1;
    
    IF banner_slot_id_val IS NULL THEN
      RAISE NOTICE 'panel_id %에 해당하는 banner_slot을 찾을 수 없음', NEW.panel_id;
      RETURN NEW;
    END IF;
  END IF;

  -- 2. order_details의 display_start_date와 display_end_date를 기반으로 해당하는 기간 찾기
  SELECT rgdp.id INTO period_id
  FROM region_gu_display_periods rgdp
  JOIN panels pi ON pi.region_gu_id = rgdp.region_gu_id
  WHERE pi.id = NEW.panel_id
    AND rgdp.display_type_id = pi.display_type_id
    AND (
      (NEW.display_start_date >= rgdp.period_from AND NEW.display_end_date <= rgdp.period_to)
      OR
      (NEW.display_start_date <= rgdp.period_to AND NEW.display_end_date >= rgdp.period_from)
    );
  
  -- 3. 해당 기간의 재고 업데이트 (banner_slot_id 기준)
  IF period_id IS NOT NULL THEN
    -- 기존 재고 조회
    SELECT * INTO current_inventory
    FROM banner_slot_inventory
    WHERE banner_slot_id = banner_slot_id_val
      AND region_gu_display_period_id = period_id;
    
    IF FOUND THEN
      -- 재고 업데이트: 주문되면 닫힘
      UPDATE banner_slot_inventory 
      SET 
        is_available = false,
        is_closed = true,
        updated_at = NOW()
      WHERE banner_slot_id = banner_slot_id_val
        AND region_gu_display_period_id = period_id;
    ELSE
      -- 재고 정보가 없으면 새로 생성 (주문되면 닫힘 상태로)
      INSERT INTO banner_slot_inventory (
        banner_slot_id,
        region_gu_display_period_id,
        is_available,
        is_closed
      )
      VALUES (
        banner_slot_id_val,
        period_id,
        false,
        true
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

