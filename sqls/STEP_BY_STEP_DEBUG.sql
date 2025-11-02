-- 단계별 디버깅: 어떤 트리거가 문제인지 정확히 찾기

-- 1단계: 모든 트리거 비활성화
ALTER TABLE order_details DISABLE TRIGGER ALL;

-- 확인
SELECT 
  trigger_name,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'order_details';

-- 이제 주문을 시도해보세요. 에러가 사라지면 트리거 문제입니다.
-- 에러가 계속되면 트리거 문제가 아닙니다.

-- 2단계: BEFORE 트리거만 활성화
ALTER TABLE order_details ENABLE TRIGGER inventory_check_trigger;

-- 주문 시도 → 에러 발생하면 inventory_check_trigger가 문제

-- 3단계: AFTER 트리거 하나씩 활성화
-- (2단계에서 에러가 없었다면 계속)

ALTER TABLE order_details ENABLE TRIGGER trigger_fill_panel_slot_snapshot_after_order_details;
-- 주문 시도 → 에러 발생하면 trigger_fill_panel_slot_snapshot_after_order_details가 문제

ALTER TABLE order_details ENABLE TRIGGER banner_inventory_insert_trigger;
-- 주문 시도 → 에러 발생하면 banner_inventory_insert_trigger가 문제

ALTER TABLE order_details ENABLE TRIGGER slot_inventory_insert_trigger;
-- 주문 시도 → 에러 발생하면 slot_inventory_insert_trigger가 문제

