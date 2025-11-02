-- 트리거 다시 활성화

-- 1. 특정 트리거 활성화
ALTER TABLE order_details ENABLE TRIGGER slot_inventory_insert_trigger;

-- 2. 모든 트리거 활성화
-- ALTER TABLE order_details ENABLE TRIGGER ALL;

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

