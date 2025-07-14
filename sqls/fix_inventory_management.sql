-- 재고 관리 문제 해결을 위한 SQL 스크립트
-- 1. 기존 재고 데이터 정리
-- 2. 기간별 재고 생성
-- 3. 트리거 수정

-- 1. 기존 재고 데이터 정리 (중복 제거)
DELETE FROM banner_slot_inventory 
WHERE id NOT IN (
  SELECT MIN(id) 
  FROM banner_slot_inventory 
  GROUP BY panel_info_id, region_gu_display_period_id
);

-- 2. 기간별 재고가 없는 패널들에 대해 재고 생성
INSERT INTO banner_slot_inventory (
  panel_info_id,
  region_gu_display_period_id,
  total_slots,
  available_slots,
  closed_slots
)
SELECT 
  pi.id as panel_info_id,
  rgdp.id as region_gu_display_period_id,
  pi.max_banner as total_slots,
  CASE 
    WHEN rgdp.period = 'first_half' THEN 
      pi.max_banner - COALESCE(pi.first_half_closure_quantity, 0)
    ELSE 
      pi.max_banner - COALESCE(pi.second_half_closure_quantity, 0)
  END as available_slots,
  CASE 
    WHEN rgdp.period = 'first_half' THEN 
      COALESCE(pi.first_half_closure_quantity, 0)
    ELSE 
      COALESCE(pi.second_half_closure_quantity, 0)
  END as closed_slots
FROM panel_info pi
CROSS JOIN region_gu_display_periods rgdp
WHERE pi.region_gu_id = rgdp.region_gu_id
  AND pi.display_type_id = rgdp.display_type_id
  AND pi.panel_status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM banner_slot_inventory bsi
    WHERE bsi.panel_info_id = pi.id
      AND bsi.region_gu_display_period_id = rgdp.id
  );

-- 3. top_fixed_banner_inventory도 동일하게 생성
INSERT INTO top_fixed_banner_inventory (
  panel_info_id,
  region_gu_display_period_id,
  banner_slot_info_id,
  total_slots,
  available_slots,
  closed_faces
)
SELECT 
  pi.id as panel_info_id,
  rgdp.id as region_gu_display_period_id,
  bsi.id as banner_slot_info_id,
  1 as total_slots,
  1 as available_slots,
  0 as closed_faces
FROM panel_info pi
CROSS JOIN region_gu_display_periods rgdp
JOIN banner_slot_info bsi ON pi.id = bsi.panel_info_id
WHERE pi.region_gu_id = rgdp.region_gu_id
  AND pi.display_type_id = rgdp.display_type_id
  AND pi.panel_status = 'active'
  AND bsi.banner_type = 'top_fixed'
  AND bsi.panel_slot_status = 'available'
  AND NOT EXISTS (
    SELECT 1 FROM top_fixed_banner_inventory tfbi
    WHERE tfbi.panel_info_id = pi.id
      AND tfbi.region_gu_display_period_id = rgdp.id
      AND tfbi.banner_slot_info_id = bsi.id
  );

-- 4. 재고 트리거 함수 개선 (기간별 재고 관리)
CREATE OR REPLACE FUNCTION update_banner_slot_inventory_on_order()
RETURNS TRIGGER AS $$
DECLARE
  period_id UUID;
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
      INSERT INTO banner_slot_inventory (
        panel_info_id,
        region_gu_display_period_id,
        total_slots,
        available_slots,
        closed_slots
      )
      SELECT 
        NEW.panel_info_id,
        period_id,
        pi.max_banner,
        GREATEST(0, pi.max_banner - NEW.slot_order_quantity),
        NEW.slot_order_quantity
      FROM panel_info pi
      WHERE pi.id = NEW.panel_info_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. 주문 취소 시 재고 복구 함수도 개선
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

-- 6. 재고 부족 확인 함수도 기간별로 수정
CREATE OR REPLACE FUNCTION check_inventory_before_order()
RETURNS TRIGGER AS $$
DECLARE
  current_inventory RECORD;
  period_id UUID;
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
      RAISE EXCEPTION '재고 부족: 요청 수량 %개, 가용 재고 %개', 
        NEW.slot_order_quantity, current_inventory.available_slots;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. 재고 현황 확인을 위한 뷰 업데이트
CREATE OR REPLACE VIEW inventory_status_view AS
SELECT 
  pi.id as panel_info_id,
  pi.nickname as panel_name,
  pi.address,
  rgu.name as district,
  rgdp.year_month,
  rgdp.period,
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

-- 8. 현재 재고 현황 확인 쿼리
SELECT 
  '현재 재고 현황' as info,
  COUNT(*) as total_panels,
  SUM(CASE WHEN available_slots = 0 THEN 1 ELSE 0 END) as sold_out_panels,
  SUM(CASE WHEN available_slots > 0 AND available_slots <= total_slots * 0.2 THEN 1 ELSE 0 END) as low_stock_panels,
  SUM(CASE WHEN available_slots > total_slots * 0.2 THEN 1 ELSE 0 END) as available_panels
FROM inventory_status_view
WHERE year_month = '2025년 8월'; -- 현재 월로 변경 