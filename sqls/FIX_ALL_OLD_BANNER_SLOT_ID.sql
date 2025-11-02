-- ⚠️ 긴급: OLD.banner_slot_id를 참조하는 모든 함수 수정
-- order_details 테이블에는 banner_slot_id가 없으므로 OLD.banner_slot_id 참조 시 에러 발생

-- ============================================
-- 1. restore_banner_slot_inventory_on_order_delete 함수 확인 및 수정
-- ============================================
-- 이미 수정되어 있어야 하지만, 혹시 모르니 다시 확인

CREATE OR REPLACE FUNCTION restore_banner_slot_inventory_on_order_delete()
RETURNS TRIGGER AS $$
DECLARE
  period_id UUID;
  banner_slot_id_val UUID;
BEGIN
  -- 1. panel_slot_usage_id를 통해 banner_slot_id 조회 (OLD.banner_slot_id 직접 참조하지 않음!)
  IF OLD.panel_slot_usage_id IS NOT NULL THEN
    SELECT banner_slot_id INTO banner_slot_id_val
    FROM panel_slot_usage
    WHERE id = OLD.panel_slot_usage_id;
    
    IF banner_slot_id_val IS NULL THEN
      RAISE NOTICE 'panel_slot_usage_id %에 해당하는 banner_slot_id를 찾을 수 없음', OLD.panel_slot_usage_id;
      RETURN OLD;
    END IF;
  ELSE
    -- panel_slot_usage_id가 없으면 panel_id로 기본 슬롯 찾기
    SELECT bs.id INTO banner_slot_id_val
    FROM banner_slots bs
    WHERE bs.panel_id = OLD.panel_id
      AND bs.slot_number = 1
    LIMIT 1;
    
    IF banner_slot_id_val IS NULL THEN
      RAISE NOTICE 'panel_id %에 해당하는 banner_slot을 찾을 수 없음', OLD.panel_id;
      RETURN OLD;
    END IF;
  END IF;

  -- 2. order_details의 display_start_date와 display_end_date를 기반으로 해당하는 기간 찾기
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
  
  -- 3. 해당 기간의 재고 복구 (banner_slot_id 기준)
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

-- ============================================
-- 2. restore_slot_inventory_on_order_delete 함수 확인 및 수정
-- ============================================
-- 이 함수도 확인 필요

CREATE OR REPLACE FUNCTION restore_slot_inventory_on_order_delete()
RETURNS TRIGGER AS $$
DECLARE
  period_id UUID;
  banner_slot_id_val UUID;
BEGIN
  -- order_details 테이블에는 banner_slot_id가 없으므로 panel_slot_usage_id를 통해 조회
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

  -- 기간 찾기 및 재고 복구 로직
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
  
  IF period_id IS NOT NULL THEN
    -- 재고 복구 로직 (필요에 따라 수정)
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

-- ============================================
-- 3. release_top_fixed_inventory_on_cancel 함수 확인
-- ============================================
-- orders 테이블 UPDATE 트리거인데, 혹시 OLD.banner_slot_id를 참조하는지 확인 필요

-- 먼저 이 함수의 코드를 확인하세요:
-- SELECT prosrc FROM pg_proc WHERE proname = 'release_top_fixed_inventory_on_cancel';

