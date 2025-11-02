-- ⚠️ 즉시 실행: 결제 오류 해결을 위한 트리거 함수 수정
-- 이 파일의 모든 SQL을 Supabase SQL Editor에서 실행하세요

-- ============================================
-- 1. update_banner_slot_inventory_on_order 함수 수정
-- ============================================
-- ❌ 제거: NEW.banner_slot_id 직접 참조
-- ✅ 추가: NEW.panel_slot_usage_id를 통해 banner_slot_id 조회

CREATE OR REPLACE FUNCTION update_banner_slot_inventory_on_order()
RETURNS TRIGGER AS $update_inventory$
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
$update_inventory$ LANGUAGE plpgsql;

-- ============================================
-- 2. check_inventory_before_order 함수 수정
-- ============================================

CREATE OR REPLACE FUNCTION check_inventory_before_order()
RETURNS TRIGGER AS $check_inventory$
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
$check_inventory$ LANGUAGE plpgsql;

-- ============================================
-- 3. restore_banner_slot_inventory_on_order_delete 함수 수정
-- ============================================

CREATE OR REPLACE FUNCTION restore_banner_slot_inventory_on_order_delete()
RETURNS TRIGGER AS $restore_inventory$
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
$restore_inventory$ LANGUAGE plpgsql;

-- ============================================
-- 검증: 함수가 올바르게 수정되었는지 확인
-- ============================================

-- 각 함수의 정의 확인 (실행 후 확인용)
SELECT 
  proname as function_name,
  CASE 
    WHEN prosrc LIKE '%NEW.banner_slot_id%' THEN '❌ 아직 NEW.banner_slot_id 직접 참조 있음!'
    WHEN prosrc LIKE '%panel_slot_usage_id%' THEN '✅ 올바르게 수정됨'
    ELSE '⚠️ 확인 필요'
  END as status
FROM pg_proc
WHERE proname IN (
  'update_banner_slot_inventory_on_order',
  'check_inventory_before_order',
  'restore_banner_slot_inventory_on_order_delete'
);

