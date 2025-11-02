-- ⚠️ 빠른 해결: 가장 의심되는 트리거 비활성화
-- 이 쿼리를 실행한 후 주문을 다시 시도해보세요

-- slot_inventory_insert_trigger 비활성화 (update_slot_inventory_on_order 사용)
ALTER TABLE order_details DISABLE TRIGGER slot_inventory_insert_trigger;

-- 확인
SELECT 
  trigger_name,
  CASE 
    WHEN NOT tgisinternal THEN '활성화'
    ELSE '비활성화'
  END as status
FROM pg_trigger
WHERE tgrelid = 'order_details'::regclass
  AND trigger_name = 'slot_inventory_insert_trigger';

-- 주문 시도해보세요. 에러가 사라지면 이 트리거가 문제입니다.

-- 다시 활성화하려면 (문제 해결 후):
-- ALTER TABLE order_details ENABLE TRIGGER slot_inventory_insert_trigger;

