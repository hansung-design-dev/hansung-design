-- 함수 3: restore_banner_slot_inventory_on_order_delete
-- ⚠️ 이 파일만 복사해서 Supabase SQL Editor에서 실행하세요

CREATE OR REPLACE FUNCTION restore_banner_slot_inventory_on_order_delete()
RETURNS TRIGGER AS $$
DECLARE
  period_id UUID;
  banner_slot_id_val UUID;
BEGIN
  -- 1. panel_slot_usage_id를 통해 banner_slot_id 조회
  IF OLD.panel_slot_usage_id IS NOT NULL THEN
    SELECT banner_slot_id INTO banner_slot_id_val
    FROM panel_slot_usage
    WHERE id = OLD.panel_slot_usage_id;
    
    IF banner_slot_id_val IS NULL THEN
      RETURN OLD;
    END IF;
  ELSE
    SELECT bs.id INTO banner_slot_id_val
    FROM banner_slots bs
    WHERE bs.panel_id = OLD.panel_id
      AND bs.slot_number = 1
    LIMIT 1;
    
    IF banner_slot_id_val IS NULL THEN
      RETURN OLD;
    END IF;
  END IF;

  -- 2. 기간 찾기
  SELECT rgdp.id INTO period_id
  FROM region_gu_display_periods rgdp
  JOIN panels pi ON pi.region_gu_id = rgdp.region_gu_id
  WHERE pi.id = OLD.panel_id
    AND rgdp.display_type_id = pi.display_type_id
    AND (
      (OLD.display_start_date >= rgdp.period_from AND OLD.display_end_date <= rgdp.period_to)
      OR
      (OLD.display_start_date <= rgdp.period_to AND OLD.display_end_date >= rgdp.period_from)
    );
  
  -- 3. 재고 복구 (banner_slot_id 기준)
  IF period_id IS NOT NULL THEN
    UPDATE banner_slot_inventory 
    SET 
      is_available = true,
      is_closed = false,
      updated_at = NOW()
    WHERE banner_slot_id = banner_slot_id_val
      AND region_gu_display_period_id = period_id;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

