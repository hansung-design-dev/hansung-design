-- 트리거를 하나씩 비활성화하여 문제가 되는 트리거 찾기
-- 주문 시도 후 에러가 사라지면 그 트리거가 문제입니다

-- 현재 활성화된 트리거 확인
SELECT 
  trigger_name,
  CASE 
    WHEN NOT tgisinternal THEN '활성화'
    ELSE '비활성화'
  END as status
FROM pg_trigger
WHERE tgrelid = 'order_details'::regclass
  AND NOT tgisinternal
ORDER BY trigger_name;

-- 1단계: slot_inventory_insert_trigger 비활성화 (가장 의심되는 트리거)
ALTER TABLE order_details DISABLE TRIGGER slot_inventory_insert_trigger;

-- 주문 시도해보고 에러가 사라지면 이 트리거가 문제입니다
-- 그렇다면 update_slot_inventory_on_order 함수를 확인하세요

-- 2단계: fill_panel_slot_snapshot 트리거 비활성화 (테스트용)
-- ALTER TABLE order_details DISABLE TRIGGER trigger_fill_panel_slot_snapshot_after_order_details;

-- 3단계: check_inventory_before_order 비활성화 (BEFORE 트리거)
-- ALTER TABLE order_details DISABLE TRIGGER inventory_check_trigger;

-- 모든 트리거 다시 활성화하려면:
-- ALTER TABLE order_details ENABLE TRIGGER ALL;

