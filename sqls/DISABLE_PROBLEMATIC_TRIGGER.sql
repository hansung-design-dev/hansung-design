-- ⚠️ 문제 해결: update_slot_inventory_on_order 트리거 임시 비활성화
-- 이 쿼리를 실행하면 slot_inventory_insert_trigger가 비활성화됩니다
-- update_banner_slot_inventory_on_order 트리거만 사용하면 충분합니다

-- 트리거 비활성화
ALTER TABLE order_details DISABLE TRIGGER slot_inventory_insert_trigger;

-- 확인
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation,
  CASE WHEN tgisinternal THEN '시스템 내부' ELSE '사용자 정의' END as trigger_type
FROM information_schema.triggers
WHERE event_object_table = 'order_details'
  AND trigger_name = 'slot_inventory_insert_trigger';

-- 다시 활성화하려면:
-- ALTER TABLE order_details ENABLE TRIGGER slot_inventory_insert_trigger;

