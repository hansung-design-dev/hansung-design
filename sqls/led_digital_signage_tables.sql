-- LED 디스플레이용 테이블 및 수정사항
-- display_type.name = 'led_display'인 panel_info를 위한 테이블들

-- 1. LED 디스플레이 가격 정책 테이블
CREATE TABLE IF NOT EXISTS led_display_price_policy (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  panel_info_id uuid NOT NULL,
  price_usage_type price_usage_type_enum DEFAULT 'default',
  tax_price INTEGER NOT NULL DEFAULT 0,
  road_usage_fee INTEGER NOT NULL DEFAULT 0,
  advertising_fee INTEGER NOT NULL DEFAULT 0,
  total_price INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT led_display_price_policy_pkey PRIMARY KEY (id),
  CONSTRAINT led_display_price_policy_panel_info_id_fkey 
    FOREIGN KEY (panel_info_id) REFERENCES public.panel_info(id)
);

-- 2. LED 디스플레이 재고 테이블
CREATE TABLE IF NOT EXISTS led_display_inventory (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  panel_info_id uuid NOT NULL,
  region_gu_display_period_id uuid NOT NULL,
  total_faces INTEGER NOT NULL DEFAULT 20, -- 각 게시대별 20개 면
  available_faces INTEGER NOT NULL DEFAULT 20,
  closed_faces INTEGER DEFAULT 0,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  
  CONSTRAINT led_display_inventory_pkey PRIMARY KEY (id),
  CONSTRAINT led_display_inventory_panel_info_id_fkey 
    FOREIGN KEY (panel_info_id) REFERENCES public.panel_info(id),
  CONSTRAINT led_display_inventory_region_gu_display_period_id_fkey 
    FOREIGN KEY (region_gu_display_period_id) REFERENCES public.region_gu_display_periods(id),
  CONSTRAINT led_display_inventory_unique 
    UNIQUE (panel_info_id, region_gu_display_period_id)
);

-- 3. LED 디스플레이 주문 시 재고 감소 트리거 함수
CREATE OR REPLACE FUNCTION update_led_display_inventory_on_order()
RETURNS TRIGGER AS $$
DECLARE
  period_id UUID;
BEGIN
  -- 해당 기간 찾기 (LED는 전체 월)
  SELECT rgdp.id INTO period_id
  FROM region_gu_display_periods rgdp
  JOIN panel_info pi ON pi.region_gu_id = rgdp.region_gu_id
  WHERE pi.id = NEW.panel_info_id
    AND rgdp.display_type_id = pi.display_type_id
    AND rgdp.period = 'full_month' -- LED는 전체 월
    AND (
      (NEW.display_start_date >= rgdp.period_from AND NEW.display_end_date <= rgdp.period_to)
      OR
      (NEW.display_start_date <= rgdp.period_to AND NEW.display_end_date >= rgdp.period_from)
    );
  
  -- 재고 감소
  IF period_id IS NOT NULL THEN
    UPDATE led_display_inventory 
    SET 
      available_faces = GREATEST(0, available_faces - NEW.slot_order_quantity),
      closed_faces = closed_faces + NEW.slot_order_quantity,
      updated_at = NOW()
    WHERE panel_info_id = NEW.panel_info_id
      AND region_gu_display_period_id = period_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. LED 디스플레이 주문 취소 시 재고 복구 트리거 함수
CREATE OR REPLACE FUNCTION restore_led_display_inventory_on_order_delete()
RETURNS TRIGGER AS $$
DECLARE
  period_id UUID;
BEGIN
  -- 해당 기간 찾기
  SELECT rgdp.id INTO period_id
  FROM region_gu_display_periods rgdp
  JOIN panel_info pi ON pi.region_gu_id = rgdp.region_gu_id
  WHERE pi.id = OLD.panel_info_id
    AND rgdp.display_type_id = pi.display_type_id
    AND rgdp.period = 'full_month'
    AND (
      (OLD.display_start_date >= rgdp.period_from AND OLD.display_end_date <= rgdp.period_to)
      OR
      (OLD.display_start_date <= rgdp.period_to AND OLD.display_end_date >= rgdp.period_from)
    );
  
  -- 재고 복구
  IF period_id IS NOT NULL THEN
    UPDATE led_display_inventory 
    SET 
      available_faces = LEAST(total_faces, available_faces + OLD.slot_order_quantity),
      closed_faces = GREATEST(0, closed_faces - OLD.slot_order_quantity),
      updated_at = NOW()
    WHERE panel_info_id = OLD.panel_info_id
      AND region_gu_display_period_id = period_id;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 5. LED 디스플레이 재고 부족 확인 트리거 함수
CREATE OR REPLACE FUNCTION check_led_display_inventory_before_order()
RETURNS TRIGGER AS $$
DECLARE
  period_id UUID;
  current_inventory RECORD;
BEGIN
  -- 해당 기간 찾기
  SELECT rgdp.id INTO period_id
  FROM region_gu_display_periods rgdp
  JOIN panel_info pi ON pi.region_gu_id = rgdp.region_gu_id
  WHERE pi.id = NEW.panel_info_id
    AND rgdp.display_type_id = pi.display_type_id
    AND rgdp.period = 'full_month'
    AND (
      (NEW.display_start_date >= rgdp.period_from AND NEW.display_end_date <= rgdp.period_to)
      OR
      (NEW.display_start_date <= rgdp.period_to AND NEW.display_end_date >= rgdp.period_from)
    );
  
  -- 해당 기간의 재고 확인
  IF period_id IS NOT NULL THEN
    SELECT available_faces, total_faces INTO current_inventory
    FROM led_display_inventory
    WHERE panel_info_id = NEW.panel_info_id
      AND region_gu_display_period_id = period_id;
    
    -- 재고 정보가 있고, 주문 수량이 가용 재고를 초과하는 경우
    IF FOUND AND current_inventory.available_faces < NEW.slot_order_quantity THEN
      RAISE EXCEPTION 'LED 디스플레이 재고 부족: 요청 수량 %개, 가용 재고 %개 (기간: %)', 
        NEW.slot_order_quantity, current_inventory.available_faces, period_id;
    END IF;
  ELSE
    -- 기간을 찾지 못한 경우 경고
    RAISE WARNING 'LED 디스플레이 기간을 찾을 수 없음: panel_info_id=%, display_start_date=%, display_end_date=%', 
      NEW.panel_info_id, NEW.display_start_date, NEW.display_end_date;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. 트리거 등록
-- 주문 시 재고 감소
DROP TRIGGER IF EXISTS led_display_inventory_insert_trigger ON order_details;
CREATE TRIGGER led_display_inventory_insert_trigger
  AFTER INSERT ON order_details
  FOR EACH ROW
  EXECUTE FUNCTION update_led_display_inventory_on_order();

-- 주문 취소 시 재고 복구
DROP TRIGGER IF EXISTS led_display_inventory_delete_trigger ON order_details;
CREATE TRIGGER led_display_inventory_delete_trigger
  AFTER DELETE ON order_details
  FOR EACH ROW
  EXECUTE FUNCTION restore_led_display_inventory_on_order_delete();

-- 주문 전 재고 부족 확인
DROP TRIGGER IF EXISTS led_display_inventory_check_trigger ON order_details;
CREATE TRIGGER led_display_inventory_check_trigger
  BEFORE INSERT ON order_details
  FOR EACH ROW
  EXECUTE FUNCTION check_led_display_inventory_before_order();

-- 7. 기간 생성 시 LED 디스플레이 재고 자동 생성 함수 수정
-- generate_next_month_led_periods 함수에 재고 생성 로직 추가 필요

-- 8. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_led_display_inventory_panel_info_id 
ON led_display_inventory(panel_info_id);

CREATE INDEX IF NOT EXISTS idx_led_display_inventory_period_id 
ON led_display_inventory(region_gu_display_period_id);

CREATE INDEX IF NOT EXISTS idx_led_display_price_policy_panel_info_id 
ON led_display_price_policy(panel_info_id);

-- 9. LED 디스플레이 재고 현황 뷰
CREATE OR REPLACE VIEW led_display_inventory_status AS
SELECT 
  pi.id as panel_info_id,
  pi.nickname as panel_name,
  pi.address,
  rgu.name as district,
  ldsi.total_faces,
  ldsi.available_faces,
  ldsi.closed_faces,
  CASE 
    WHEN ldsi.available_faces = 0 THEN '매진'
    WHEN ldsi.available_faces <= ldsi.total_faces * 0.2 THEN '재고부족'
    ELSE '재고있음'
  END as inventory_status,
  ldsi.updated_at as last_updated
FROM panel_info pi
JOIN display_types dt ON pi.display_type_id = dt.id
LEFT JOIN region_gu rgu ON pi.region_gu_id = rgu.id
LEFT JOIN led_display_inventory ldsi ON pi.id = ldsi.panel_info_id
WHERE dt.name = 'led_display'
  AND pi.panel_status = 'active'
ORDER BY ldsi.updated_at DESC;

-- 10. 샘플 데이터 삽입 예시
-- LED 디스플레이 패널에 기본 가격 정책 추가
-- INSERT INTO led_display_price_policy (
--   panel_info_id, price_usage_type, tax_price, road_usage_fee, 
--   advertising_fee, total_price
-- ) VALUES (
--   'led_panel_uuid', 'default', 50000, 30000, 20000, 100000
-- );

-- 사용 예시:
-- SELECT * FROM led_display_inventory_status;
-- SELECT * FROM led_display_price_policy WHERE panel_info_id = 'your_panel_id'; 