-- 재고관리 개선을 위한 스키마 수정안

-- 1. 기존 banner_slot_inventory 테이블 개선
-- 기간별 재고 관리를 위해 region_gu_display_period_id 추가
ALTER TABLE banner_slot_inventory 
ADD COLUMN IF NOT EXISTS region_gu_display_period_id UUID REFERENCES region_gu_display_periods(id);

-- 2. 재고 현황을 더 정확하게 추적하는 테이블
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_info_id UUID NOT NULL REFERENCES panel_info(id),
  region_gu_display_period_id UUID NOT NULL REFERENCES region_gu_display_periods(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('reserve', 'release', 'adjust')),
  quantity INTEGER NOT NULL,
  order_id UUID REFERENCES orders(id),
  order_detail_id UUID REFERENCES order_details(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID -- 사용자 또는 시스템
);

-- 3. 실시간 재고 계산을 위한 뷰
CREATE OR REPLACE VIEW real_time_inventory AS
SELECT 
  pi.id as panel_info_id,
  pi.nickname as panel_name,
  rgdp.id as period_id,
  rgdp.year_month,
  rgdp.period,
  pi.max_banner as total_slots,
  pi.max_banner - COALESCE(SUM(
    CASE 
      WHEN it.transaction_type = 'reserve' THEN it.quantity
      WHEN it.transaction_type = 'release' THEN -it.quantity
      ELSE 0
    END
  ), 0) as available_slots,
  COALESCE(SUM(
    CASE 
      WHEN it.transaction_type = 'reserve' THEN it.quantity
      WHEN it.transaction_type = 'release' THEN -it.quantity
      ELSE 0
    END
  ), 0) as reserved_slots,
  CASE 
    WHEN pi.max_banner - COALESCE(SUM(
      CASE 
        WHEN it.transaction_type = 'reserve' THEN it.quantity
        WHEN it.transaction_type = 'release' THEN -it.quantity
        ELSE 0
      END
    ), 0) = 0 THEN '매진'
    WHEN pi.max_banner - COALESCE(SUM(
      CASE 
        WHEN it.transaction_type = 'reserve' THEN it.quantity
        WHEN it.transaction_type = 'release' THEN -it.quantity
        ELSE 0
      END
    ), 0) <= pi.max_banner * 0.2 THEN '재고부족'
    ELSE '재고있음'
  END as inventory_status
FROM panel_info pi
CROSS JOIN region_gu_display_periods rgdp
LEFT JOIN inventory_transactions it ON pi.id = it.panel_info_id 
  AND rgdp.id = it.region_gu_display_period_id
WHERE pi.region_gu_id = rgdp.region_gu_id
  AND pi.display_type_id = rgdp.display_type_id
  AND pi.panel_status = 'active'
GROUP BY pi.id, pi.nickname, rgdp.id, rgdp.year_month, rgdp.period, pi.max_banner;

-- 4. 재고 예약 함수
CREATE OR REPLACE FUNCTION reserve_inventory(
  p_panel_info_id UUID,
  p_period_id UUID,
  p_quantity INTEGER,
  p_order_id UUID,
  p_order_detail_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  current_available INTEGER;
BEGIN
  -- 현재 가용 재고 확인
  SELECT available_slots INTO current_available
  FROM real_time_inventory
  WHERE panel_info_id = p_panel_info_id 
    AND period_id = p_period_id;
  
  -- 재고 부족 시 예약 실패
  IF current_available < p_quantity THEN
    RETURN FALSE;
  END IF;
  
  -- 재고 예약 트랜잭션 기록
  INSERT INTO inventory_transactions (
    panel_info_id,
    region_gu_display_period_id,
    transaction_type,
    quantity,
    order_id,
    order_detail_id,
    notes
  ) VALUES (
    p_panel_info_id,
    p_period_id,
    'reserve',
    p_quantity,
    p_order_id,
    p_order_detail_id,
    '주문에 의한 재고 예약'
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 5. 재고 해제 함수
CREATE OR REPLACE FUNCTION release_inventory(
  p_panel_info_id UUID,
  p_period_id UUID,
  p_quantity INTEGER,
  p_order_id UUID,
  p_order_detail_id UUID
) RETURNS VOID AS $$
BEGIN
  INSERT INTO inventory_transactions (
    panel_info_id,
    region_gu_display_period_id,
    transaction_type,
    quantity,
    order_id,
    order_detail_id,
    notes
  ) VALUES (
    p_panel_info_id,
    p_period_id,
    'release',
    p_quantity,
    p_order_id,
    p_order_detail_id,
    '주문 취소에 의한 재고 해제'
  );
END;
$$ LANGUAGE plpgsql;

-- 6. 개선된 주문 시 재고 예약 트리거
CREATE OR REPLACE FUNCTION handle_order_inventory()
RETURNS TRIGGER AS $$
DECLARE
  period_id UUID;
  reservation_success BOOLEAN;
BEGIN
  -- 주문 기간에 해당하는 period_id 찾기
  SELECT rgdp.id INTO period_id
  FROM region_gu_display_periods rgdp
  JOIN panel_info pi ON pi.region_gu_id = rgdp.region_gu_id
  WHERE pi.id = NEW.panel_info_id
    AND rgdp.display_type_id = pi.display_type_id
    AND NEW.display_start_date >= rgdp.period_from
    AND NEW.display_start_date <= rgdp.period_to;
  
  IF period_id IS NOT NULL THEN
    -- 재고 예약 시도
    SELECT reserve_inventory(
      NEW.panel_info_id,
      period_id,
      NEW.slot_order_quantity,
      NEW.order_id,
      NEW.id
    ) INTO reservation_success;
    
    IF NOT reservation_success THEN
      RAISE EXCEPTION '재고 부족: 요청 수량 %개를 예약할 수 없습니다', NEW.slot_order_quantity;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. 주문 취소 시 재고 해제 트리거
CREATE OR REPLACE FUNCTION handle_order_cancellation()
RETURNS TRIGGER AS $$
DECLARE
  period_id UUID;
BEGIN
  -- 주문 기간에 해당하는 period_id 찾기
  SELECT rgdp.id INTO period_id
  FROM region_gu_display_periods rgdp
  JOIN panel_info pi ON pi.region_gu_id = rgdp.region_gu_id
  WHERE pi.id = OLD.panel_info_id
    AND rgdp.display_type_id = pi.display_type_id
    AND OLD.display_start_date >= rgdp.period_from
    AND OLD.display_start_date <= rgdp.period_to;
  
  IF period_id IS NOT NULL THEN
    -- 재고 해제
    PERFORM release_inventory(
      OLD.panel_info_id,
      period_id,
      OLD.slot_order_quantity,
      OLD.order_id,
      OLD.id
    );
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 8. 트리거 등록
DROP TRIGGER IF EXISTS order_inventory_trigger ON order_details;
CREATE TRIGGER order_inventory_trigger
  AFTER INSERT ON order_details
  FOR EACH ROW
  EXECUTE FUNCTION handle_order_inventory();

DROP TRIGGER IF EXISTS order_cancellation_trigger ON order_details;
CREATE TRIGGER order_cancellation_trigger
  AFTER DELETE ON order_details
  FOR EACH ROW
  EXECUTE FUNCTION handle_order_cancellation();

-- 9. 재고 현황 모니터링 쿼리
CREATE OR REPLACE VIEW inventory_monitoring AS
SELECT 
  rti.panel_info_id,
  rti.panel_name,
  rgu.name as district,
  rti.year_month,
  rti.period,
  rti.total_slots,
  rti.available_slots,
  rti.reserved_slots,
  rti.inventory_status,
  pi.panel_code,
  pi.panel_type
FROM real_time_inventory rti
JOIN panel_info pi ON rti.panel_info_id = pi.id
JOIN region_gu rgu ON pi.region_gu_id = rgu.id
ORDER BY rti.year_month DESC, rti.period, rgu.name, pi.panel_code; 