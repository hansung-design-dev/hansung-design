-- Supabase에 실행할 수정된 함수들
-- 각 함수를 개별적으로 실행하거나 모두 선택해서 실행할 수 있습니다
-- ⚠️ 각 함수를 개별적으로 실행하는 것을 권장합니다

-- 1. fill_panel_slot_snapshot_after_order_details 함수 수정
CREATE OR REPLACE FUNCTION fill_panel_slot_snapshot_after_order_details()
RETURNS TRIGGER AS $fill_snapshot$
DECLARE
    v_panel_type TEXT;
    v_slot_record RECORD;
    v_snapshot JSONB;
BEGIN
    -- 디버깅 로그
    RAISE NOTICE 'order_details 트리거 실행: order_id = %, panel_id = %', 
        NEW.order_id, NEW.panel_id;
    
    -- panel_id가 없으면 처리하지 않음
    IF NEW.panel_id IS NULL THEN
        RAISE NOTICE 'panel_id가 NULL이므로 처리 중단';
        RETURN NEW;
    END IF;
    
    -- 패널 타입 확인
    SELECT dt.name INTO v_panel_type
    FROM panels pi
    JOIN display_types dt ON pi.display_type_id = dt.id
    WHERE pi.id = NEW.panel_id;
    
    RAISE NOTICE '패널 타입: %', v_panel_type;
    
    -- 패널 타입에 따라 슬롯 정보 조회
    IF v_panel_type = 'banner_display' THEN
        -- 배너 패널: panel_slot_usage에서 정확한 슬롯 정보 가져오기
        IF NEW.panel_slot_usage_id IS NOT NULL THEN
            -- panel_slot_usage가 있으면 해당 슬롯 사용 (banner_slot_price_policy 포함)
            SELECT 
                bsi.*,
                bsp.total_price as policy_total_price,
                bsp.tax_price as policy_tax_price,
                bsp.road_usage_fee as policy_road_usage_fee,
                bsp.advertising_fee as policy_advertising_fee
            INTO v_slot_record 
            FROM panel_slot_usage psu
            JOIN banner_slots bsi ON psu.banner_slot_id = bsi.id
            LEFT JOIN banner_slot_price_policy bsp ON bsi.id = bsp.banner_slot_id 
                AND bsp.price_usage_type = 'default'  -- 기본값, 필요시 사용자 타입에 따라 변경
            WHERE psu.id = NEW.panel_slot_usage_id;
            
            RAISE NOTICE '배너 슬롯 조회 (panel_slot_usage): slot_number = %, id = %, policy_total_price = %', 
                v_slot_record.slot_number, v_slot_record.id, v_slot_record.policy_total_price;
        ELSE
            -- panel_slot_usage가 없으면 1번 슬롯 사용 (banner_slot_price_policy 포함)
            SELECT 
                bsi.*,
                bsp.total_price as policy_total_price,
                bsp.tax_price as policy_tax_price,
                bsp.road_usage_fee as policy_road_usage_fee,
                bsp.advertising_fee as policy_advertising_fee
            INTO v_slot_record 
            FROM banner_slots bsi
            LEFT JOIN banner_slot_price_policy bsp ON bsi.id = bsp.banner_slot_id 
                AND bsp.price_usage_type = 'default'  -- 기본값, 필요시 사용자 타입에 따라 변경
            WHERE bsi.panel_id = NEW.panel_id
              AND bsi.slot_number = 1;
            
            RAISE NOTICE '배너 슬롯 조회 (기본값): slot_number = %, id = %, policy_total_price = %', 
                v_slot_record.slot_number, v_slot_record.id, v_slot_record.policy_total_price;
        END IF;
            
    ELSIF v_panel_type = 'led_display' THEN
        -- LED 패널: panel_slot_usage에서 정확한 슬롯 정보 가져오기
        IF NEW.panel_slot_usage_id IS NOT NULL THEN
            -- panel_slot_usage가 있으면 해당 슬롯 사용
            SELECT lsi.* INTO v_slot_record 
            FROM panel_slot_usage psu
            JOIN led_slots lsi ON psu.panel_id = lsi.panel_id 
                AND psu.slot_number = lsi.slot_number
            WHERE psu.id = NEW.panel_slot_usage_id;
            
            RAISE NOTICE 'LED 슬롯 조회 (panel_slot_usage): slot_number = %, id = %', 
                v_slot_record.slot_number, v_slot_record.id;
        ELSE
            -- panel_slot_usage가 없으면 1번 슬롯 사용
            SELECT * INTO v_slot_record 
            FROM led_slots
            WHERE panel_id = NEW.panel_id
              AND slot_number = 1;
            
            RAISE NOTICE 'LED 슬롯 조회 (기본값): slot_number = %, id = %', 
                v_slot_record.slot_number, v_slot_record.id;
        END IF;
    ELSE
        RAISE NOTICE '알 수 없는 패널 타입: %', v_panel_type;
        RETURN NEW;
    END IF;
    
    -- 슬롯 정보가 없으면 처리하지 않음
    IF v_slot_record.id IS NULL THEN
        RAISE NOTICE '슬롯 정보를 찾을 수 없으므로 처리 중단';
        RETURN NEW;
    END IF;
    
    -- JSONB 스냅샷 생성
    v_snapshot := to_jsonb(v_slot_record);
    
    RAISE NOTICE '생성된 스냅샷: %', v_snapshot;
    
    -- orders 테이블의 panel_slot_snapshot 업데이트
    UPDATE orders 
    SET panel_slot_snapshot = v_snapshot
    WHERE id = NEW.order_id;
    
    RAISE NOTICE 'panel_slot_snapshot 업데이트 완료: 주문 ID %', NEW.order_id;
    
    RETURN NEW;
END;
$fill_snapshot$ LANGUAGE plpgsql;


-- 2. update_banner_slot_inventory_on_order 함수 수정
-- ⚠️ 중요: banner_slot_inventory는 banner_slot_id 기준으로 관리됨!
CREATE OR REPLACE FUNCTION update_banner_slot_inventory_on_order()
RETURNS TRIGGER AS $update_inventory$
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
      -- 기간이 완전히 겹치는 경우
      (NEW.display_start_date >= rgdp.period_from AND NEW.display_end_date <= rgdp.period_to)
      OR
      -- 기간이 부분적으로 겹치는 경우
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
        false, -- 주문되면 사용 불가
        true   -- 닫힘
      );
    END IF;
  ELSE
    -- 기간을 찾지 못한 경우 로그 출력 (디버깅용)
    RAISE NOTICE '기간을 찾을 수 없음: panel_id=%, banner_slot_id=%, display_start_date=%, display_end_date=%', 
      NEW.panel_id, banner_slot_id_val, NEW.display_start_date, NEW.display_end_date;
  END IF;
  
  RETURN NEW;
END;
$update_inventory$ LANGUAGE plpgsql;


-- 2-1. check_inventory_before_order 함수 수정 (banner_slot_id 기준)
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


-- 2-2. restore_banner_slot_inventory_on_order_delete 함수 수정
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


-- 3. update_top_fixed_banner_inventory 함수 수정 (banner_slot_id NULL 체크 추가)
CREATE OR REPLACE FUNCTION update_top_fixed_banner_inventory()
RETURNS TRIGGER AS $top_fixed_inventory$
BEGIN
  -- Only process if banner_slot_id is not NULL
  IF NEW.banner_slot_id IS NOT NULL THEN
    -- Check if this is a top-fixed banner (slot_number = 0)
    IF EXISTS (
      SELECT 1 FROM banner_slots 
      WHERE id = NEW.banner_slot_id 
      AND slot_number = 0
      AND banner_type = 'top_fixed'
    ) THEN
      -- Update top_fixed_banner_inventory to mark all periods as unavailable for this panel
      UPDATE top_fixed_banner_inventory 
      SET available_slots = 0,
          updated_at = NOW()
      WHERE panel_id = NEW.panel_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$top_fixed_inventory$ LANGUAGE plpgsql;


-- 4. update_updated_at_column 함수 수정
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $update_timestamp$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$update_timestamp$ LANGUAGE plpgsql;

