-- 상단광고 재고 시스템 올바른 구현
-- region_gu_display_periods와 연결하지 않고 banner_slots의 price_unit만 사용

-- 1. 테이블 구조 변경 (region_gu_display_period_id 제거)
ALTER TABLE top_fixed_banner_inventory 
DROP CONSTRAINT IF EXISTS top_fixed_banner_inventory_region_gu_display_period_id_fkey;

ALTER TABLE top_fixed_banner_inventory 
DROP COLUMN IF EXISTS region_gu_display_period_id;

-- 2. 기존 데이터 정리
DELETE FROM top_fixed_banner_inventory;

-- 3. 올바른 상단광고 데이터 삽입 (게시대별 1개씩만)
INSERT INTO top_fixed_banner_inventory (
  panel_id,
  is_occupied,
  occupied_slot_id,
  occupied_until,
  occupied_from
)
SELECT DISTINCT
  p.id as panel_id,
  false as is_occupied,
  null::uuid as occupied_slot_id,
  null::date as occupied_until,
  null::date as occupied_from
FROM panels p
JOIN region_gu rg ON p.region_gu_id = rg.id
WHERE p.panel_status = 'active'
  AND rg.name IN ('용산구', '송파구')
  AND EXISTS (
    SELECT 1 FROM banner_slots bs 
    WHERE bs.panel_id = p.id 
    AND bs.banner_type = 'top_fixed'
    AND bs.slot_number = 0
  );

-- 4. 수정된 주문 시 재고 업데이트 함수
CREATE OR REPLACE FUNCTION update_top_fixed_inventory_on_order()
RETURNS TRIGGER AS $$
DECLARE
  panel_uuid UUID;
  slot_period_months INTEGER;
  order_start_date DATE;
  order_end_date DATE;
BEGIN
  -- 상단광고인 경우에만 처리
  IF EXISTS (
    SELECT 1 FROM banner_slots bs 
    WHERE bs.id = NEW.banner_slot_id 
    AND bs.banner_type = 'top_fixed'
  ) THEN
    -- 주문한 상단광고 슬롯의 정보 가져오기
    SELECT 
      bs.panel_id,
      CASE 
        WHEN bs.price_unit = '6 months' THEN 6
        WHEN bs.price_unit = '1 year' THEN 12
        WHEN bs.price_unit = '3 years' THEN 36
        ELSE 12
      END,
      NEW.start_date,
      NEW.start_date + INTERVAL '1 month' * (
        CASE 
          WHEN bs.price_unit = '6 months' THEN 6
          WHEN bs.price_unit = '1 year' THEN 12
          WHEN bs.price_unit = '3 years' THEN 36
          ELSE 12
        END
      )::INTEGER
    INTO panel_uuid, slot_period_months, order_start_date, order_end_date
    FROM banner_slots bs
    WHERE bs.id = NEW.banner_slot_id
      AND bs.banner_type = 'top_fixed';

    -- 상단광고 재고 업데이트 (게시대별 1개만)
    UPDATE top_fixed_banner_inventory 
    SET 
      is_occupied = true,
      occupied_slot_id = NEW.banner_slot_id,
      occupied_from = order_start_date,
      occupied_until = order_end_date,
      updated_at = NOW()
    WHERE panel_id = panel_uuid;

    RAISE NOTICE '상단광고 재고 업데이트: panel_id=%, slot_id=%, 기간=%개월', 
      panel_uuid, NEW.banner_slot_id, slot_period_months;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. 수정된 주문 취소 시 재고 해제 함수
CREATE OR REPLACE FUNCTION release_top_fixed_inventory_on_cancel()
RETURNS TRIGGER AS $$
BEGIN
  -- 상단광고인 경우에만 재고 해제
  IF EXISTS (
    SELECT 1 FROM banner_slots bs 
    WHERE bs.id = OLD.banner_slot_id 
    AND bs.banner_type = 'top_fixed'
  ) THEN
    -- 상단광고 재고 해제
    UPDATE top_fixed_banner_inventory 
    SET 
      is_occupied = false,
      occupied_slot_id = null::uuid,
      occupied_from = null::date,
      occupied_until = null::date,
      updated_at = NOW()
    WHERE occupied_slot_id = OLD.banner_slot_id;

    RAISE NOTICE '상단광고 재고 해제: slot_id=%', OLD.banner_slot_id;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 6. 트리거 생성
CREATE TRIGGER trigger_top_fixed_inventory_on_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_top_fixed_inventory_on_order();

CREATE TRIGGER trigger_top_fixed_inventory_on_cancel
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION release_top_fixed_inventory_on_cancel();

-- 7. 결과 확인
SELECT 
  COUNT(*) as total_panels,
  COUNT(CASE WHEN is_occupied = true THEN 1 END) as occupied_panels,
  COUNT(CASE WHEN is_occupied = false THEN 1 END) as available_panels
FROM top_fixed_banner_inventory; 