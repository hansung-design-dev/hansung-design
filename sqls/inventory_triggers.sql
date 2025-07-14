-- 재고관리 트리거 함수들 (기존 트리거와 충돌하지 않도록 새로 생성)

-- 1. 일반 현수막게시대 재고 자동 감소 트리거 (banner_slot_inventory용)
CREATE OR REPLACE FUNCTION update_banner_slot_inventory_on_order()
RETURNS TRIGGER AS $$
BEGIN
  -- order_details 삽입 시 자동으로 재고 업데이트 (banner_slot_inventory)
  UPDATE banner_slot_inventory 
  SET 
    available_slots = GREATEST(0, available_slots - NEW.slot_order_quantity),
    closed_slots = closed_slots + NEW.slot_order_quantity,
    updated_at = NOW()
  WHERE panel_info_id = NEW.panel_info_id;
  
  -- 재고 정보가 없으면 새로 생성
  IF NOT FOUND THEN
    INSERT INTO banner_slot_inventory (
      panel_info_id, 
      total_slots, 
      available_slots, 
      closed_slots, 
      created_at, 
      updated_at
    ) VALUES (
      NEW.panel_info_id,
      1, -- 기본값
      GREATEST(0, 1 - NEW.slot_order_quantity),
      NEW.slot_order_quantity,
      NOW(),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. 주문 취소 시 재고 자동 복구 트리거 (banner_slot_inventory용)
CREATE OR REPLACE FUNCTION restore_banner_slot_inventory_on_order_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- order_details 삭제 시 자동으로 재고 복구 (banner_slot_inventory)
  UPDATE banner_slot_inventory 
  SET 
    available_slots = LEAST(total_slots, available_slots + OLD.slot_order_quantity),
    closed_slots = GREATEST(0, closed_slots - OLD.slot_order_quantity),
    updated_at = NOW()
  WHERE panel_info_id = OLD.panel_info_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 3. 중복 예약 방지 트리거 (panel_slot_usage용)
CREATE OR REPLACE FUNCTION prevent_duplicate_banner_booking()
RETURNS TRIGGER AS $$
DECLARE
  conflicting_usage RECORD;
BEGIN
  -- banner_type이 'top_fixed'가 아닌 경우에만 중복 확인 (일반 현수막게시대)
  IF NEW.banner_type != 'top_fixed' THEN
    -- 같은 패널의 같은 슬롯이 같은 기간에 이미 예약되어 있는지 확인
    SELECT ps.id INTO conflicting_usage
    FROM panel_slot_usage ps
    WHERE ps.panel_info_id = NEW.panel_info_id
      AND ps.slot_number = NEW.slot_number
      AND ps.is_active = true
      AND ps.is_closed = false
      AND ps.banner_type != 'top_fixed'
      AND (
        (ps.attach_date_from <= NEW.attach_date_from AND ps.attach_date_from + INTERVAL '15 days' >= NEW.attach_date_from)
        OR (ps.attach_date_from >= NEW.attach_date_from AND ps.attach_date_from <= NEW.attach_date_from + INTERVAL '15 days')
      );
    
    IF FOUND THEN
      RAISE EXCEPTION '선택한 기간에 이미 예약된 슬롯입니다. (conflicting_usage_id: %)', conflicting_usage.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. 재고 부족 시 주문 방지 트리거
CREATE OR REPLACE FUNCTION check_inventory_before_order()
RETURNS TRIGGER AS $$
DECLARE
  current_inventory RECORD;
BEGIN
  -- banner_slot_inventory에서 현재 재고 확인
  SELECT available_slots, total_slots INTO current_inventory
  FROM banner_slot_inventory
  WHERE panel_info_id = NEW.panel_info_id;
  
  -- 재고 정보가 있고, 주문 수량이 가용 재고를 초과하는 경우
  IF FOUND AND current_inventory.available_slots < NEW.slot_order_quantity THEN
    RAISE EXCEPTION '재고 부족: 요청 수량 %개, 가용 재고 %개', 
      NEW.slot_order_quantity, current_inventory.available_slots;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 등록 (기존 트리거와 충돌하지 않도록 새 이름 사용)
-- 1. order_details 삽입 시 재고 감소 (banner_slot_inventory)
DROP TRIGGER IF EXISTS banner_inventory_insert_trigger ON order_details;
CREATE TRIGGER banner_inventory_insert_trigger
  AFTER INSERT ON order_details
  FOR EACH ROW
  EXECUTE FUNCTION update_banner_slot_inventory_on_order();

-- 2. order_details 삭제 시 재고 복구 (banner_slot_inventory)
DROP TRIGGER IF EXISTS banner_inventory_delete_trigger ON order_details;
CREATE TRIGGER banner_inventory_delete_trigger
  AFTER DELETE ON order_details
  FOR EACH ROW
  EXECUTE FUNCTION restore_banner_slot_inventory_on_order_delete();

-- 3. panel_slot_usage 삽입 시 중복 예약 방지
DROP TRIGGER IF EXISTS duplicate_banner_booking_trigger ON panel_slot_usage;
CREATE TRIGGER duplicate_banner_booking_trigger
  BEFORE INSERT ON panel_slot_usage
  FOR EACH ROW
  EXECUTE FUNCTION prevent_duplicate_banner_booking();

-- 4. order_details 삽입 전 재고 부족 확인
DROP TRIGGER IF EXISTS inventory_check_trigger ON order_details;
CREATE TRIGGER inventory_check_trigger
  BEFORE INSERT ON order_details
  FOR EACH ROW
  EXECUTE FUNCTION check_inventory_before_order();

-- 성능 최적화를 위한 인덱스 추가 (중복 방지)
CREATE INDEX IF NOT EXISTS idx_banner_slot_inventory_panel_info_id 
ON banner_slot_inventory(panel_info_id);

CREATE INDEX IF NOT EXISTS idx_panel_slot_usage_panel_info_active 
ON panel_slot_usage(panel_info_id, is_active, is_closed, banner_type);

CREATE INDEX IF NOT EXISTS idx_order_details_panel_info_id 
ON order_details(panel_info_id);

-- 재고 현황 모니터링 뷰 생성
CREATE OR REPLACE VIEW inventory_status_view AS
SELECT 
  pi.id as panel_info_id,
  pi.nickname as panel_name,
  pi.address,
  rgu.name as district,
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
WHERE pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
ORDER BY bsi.updated_at DESC; 