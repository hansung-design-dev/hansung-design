-- 모든 트리거 비활성화 후 하나씩 활성화하여 문제 트리거 찾기

-- 1단계: 모든 order_details 트리거 비활성화
ALTER TABLE order_details DISABLE TRIGGER ALL;

-- 확인
SELECT 
  trigger_name,
  '비활성화됨' as status
FROM information_schema.triggers
WHERE event_object_table = 'order_details'
ORDER BY trigger_name;

-- 2단계: 하나씩 활성화하며 테스트
-- 주문 시도 → 에러가 없으면 다음 트리거 활성화

-- 첫 번째: inventory_check_trigger (BEFORE INSERT)
ALTER TABLE order_details ENABLE TRIGGER inventory_check_trigger;
-- 주문 시도 → 에러 발생하면 이 트리거가 문제

-- 두 번째: banner_inventory_insert_trigger (AFTER INSERT)
ALTER TABLE order_details ENABLE TRIGGER banner_inventory_insert_trigger;
-- 주문 시도 → 에러 발생하면 이 트리거가 문제

-- 세 번째: trigger_fill_panel_slot_snapshot_after_order_details (AFTER INSERT)
ALTER TABLE order_details ENABLE TRIGGER trigger_fill_panel_slot_snapshot_after_order_details;
-- 주문 시도 → 에러 발생하면 이 트리거가 문제

-- 네 번째: slot_inventory_insert_trigger (AFTER INSERT)
ALTER TABLE order_details ENABLE TRIGGER slot_inventory_insert_trigger;
-- 주문 시도 → 에러 발생하면 이 트리거가 문제

-- 모든 트리거 다시 활성화하려면:
-- ALTER TABLE order_details ENABLE TRIGGER ALL;

