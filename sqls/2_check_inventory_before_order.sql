-- 함수 2: check_inventory_before_order
-- ⚠️ 이 파일만 복사해서 Supabase SQL Editor에서 실행하세요

CREATE OR REPLACE FUNCTION check_inventory_before_order()
RETURNS TRIGGER AS $$
DECLARE
  period_id UUID;
  banner_slot_id_val UUID;
  current_inventory RECORD;
BEGIN
  -- 1. panel_slot_usage_id를 통해 banner_slot_id 조회
  IF NEW.panel_slot_usage_id IS NOT NULL THEN
    SELECT banner_slot_id INTO banner_slot_id_val
    FROM panel_slot_usage
    WHERE id = NEW.panel_slot_usage_id;
    
    IF banner_slot_id_val IS NULL THEN
      RETURN NEW;
    END IF;
  ELSE
    SELECT bs.id INTO banner_slot_id_val
    FROM banner_slots bs
    WHERE bs.panel_id = NEW.panel_id
      AND bs.slot_number = 1
    LIMIT 1;
    
    IF banner_slot_id_val IS NULL THEN
      RETURN NEW;
    END IF;
  END IF;

  -- 2. 기간 찾기
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
  
  -- 3. 재고 확인 (banner_slot_id 기준)
  IF period_id IS NOT NULL THEN
    SELECT * INTO current_inventory
    FROM banner_slot_inventory
    WHERE banner_slot_id = banner_slot_id_val
      AND region_gu_display_period_id = period_id;
    
    -- 재고가 이미 닫혀있으면 에러
    IF FOUND AND current_inventory.is_closed = true THEN
      RAISE EXCEPTION '재고 부족: 해당 슬롯이 이미 닫혀있습니다 (슬롯 ID: %, 기간: %)', 
        banner_slot_id_val, period_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

