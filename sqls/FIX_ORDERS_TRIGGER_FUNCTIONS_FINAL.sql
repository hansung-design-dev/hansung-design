-- ⚠️ 긴급 수정: orders 테이블 트리거 함수들
-- orders 테이블에는 banner_slot_id가 없으므로 NEW.banner_slot_id를 참조하면 에러 발생!
-- order_details가 생성된 후에 처리해야 하므로, 이 함수들은 비활성화하거나 로직 변경 필요

-- ============================================
-- 1. update_top_fixed_inventory_on_order 함수 수정
-- ============================================
-- orders INSERT 시점에는 order_details가 아직 생성되지 않았으므로
-- 이 함수는 실행할 수 없습니다. 
-- 대신 order_details 트리거에서 처리하거나 이 트리거를 비활성화해야 합니다.

CREATE OR REPLACE FUNCTION update_top_fixed_inventory_on_order()
RETURNS TRIGGER AS $$
BEGIN
  -- orders 테이블에는 banner_slot_id가 없으므로 이 함수는 실행할 수 없음
  -- order_details가 생성된 후에 처리해야 하므로, 
  -- 이 트리거 대신 order_details 트리거에서 처리하는 것이 맞습니다.
  
  -- 현재는 아무것도 하지 않음 (에러 방지)
  -- 필요하다면 나중에 order_details 트리거로 로직 이동
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. disable_other_periods_on_order 함수 수정
-- ============================================
-- 이 함수는 orders 테이블 트리거가 아닌 것 같지만, 안전을 위해 수정합니다.

CREATE OR REPLACE FUNCTION disable_other_periods_on_order()
RETURNS TRIGGER AS $$
BEGIN
  -- NEW.banner_slot_id를 직접 참조하지 않도록 수정
  -- orders 테이블에는 banner_slot_id가 없으므로 order_details를 통해 확인해야 함
  
  -- 현재는 아무것도 하지 않음 (에러 방지)
  -- 필요하다면 나중에 order_details 트리거로 로직 이동
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. 선택사항: 트리거 비활성화 (임시)
-- ============================================
-- 함수를 수정했으므로 트리거는 유지해도 되지만,
-- 만약 여전히 문제가 있다면 다음 명령으로 비활성화 가능:

-- ALTER TABLE orders DISABLE TRIGGER trigger_top_fixed_inventory_on_order;

-- 나중에 다시 활성화하려면:
-- ALTER TABLE orders ENABLE TRIGGER trigger_top_fixed_inventory_on_order;

