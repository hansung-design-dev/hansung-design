-- ⚠️ 긴급 수정: orders 테이블 트리거 함수들
-- orders 테이블에는 banner_slot_id가 없으므로 이 함수들을 수정해야 합니다!

-- 1. update_top_fixed_inventory_on_order 함수 수정
-- orders 테이블에는 banner_slot_id가 없으므로 order_details를 통해 확인해야 함
CREATE OR REPLACE FUNCTION update_top_fixed_inventory_on_order()
RETURNS TRIGGER AS $$
DECLARE
  banner_slot_id_val UUID;
  period_id UUID;
BEGIN
  -- orders 테이블에는 banner_slot_id가 없으므로
  -- 해당 주문의 order_details를 통해 banner_slot_id를 찾아야 함
  -- 또는 이 함수를 비활성화하거나 다른 방식으로 처리해야 함
  
  -- 주문이 생성될 때는 아직 order_details가 없을 수 있으므로
  -- 이 함수는 실행하지 않거나, 다른 방식으로 처리해야 합니다
  
  -- 임시 해결책: 함수를 비어있는 상태로 만들거나 트리거를 비활성화
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. disable_other_periods_on_order 함수 수정
CREATE OR REPLACE FUNCTION disable_other_periods_on_order()
RETURNS TRIGGER AS $$
BEGIN
  -- orders 테이블에는 banner_slot_id가 없으므로
  -- 이 함수는 실행하지 않거나, 다른 방식으로 처리해야 함
  
  -- 임시 해결책: 함수를 비어있는 상태로 만들거나 트리거를 비활성화
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 또는 트리거를 비활성화:
-- ALTER TABLE orders DISABLE TRIGGER trigger_top_fixed_inventory_on_order;

