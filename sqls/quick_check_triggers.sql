-- ⚡ 빠른 트리거 및 함수 상태 확인 (간단 버전)

-- 1. 트리거 활성화 상태만 확인
SELECT 
  trigger_name,
  action_timing || ' ' || event_manipulation as trigger_type,
  action_statement as function_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_trigger 
      WHERE tgname = trigger_name 
      AND tgenabled = 'O'
    ) THEN '✅ 활성화'
    ELSE '❌ 비활성화'
  END as status
FROM information_schema.triggers
WHERE event_object_table = 'order_details'
ORDER BY action_timing, trigger_name;

-- 2. 재고 관련 함수 존재 여부
SELECT 
  proname as function_name,
  CASE 
    WHEN proname IS NOT NULL THEN '✅ 존재'
    ELSE '❌ 없음'
  END as exists
FROM pg_proc
WHERE proname IN (
  'update_banner_slot_inventory_on_order',
  'check_inventory_before_order',
  'restore_banner_slot_inventory_on_order_delete'
);

-- 3. 문제 있는 함수 확인 (NEW.banner_slot_id 직접 참조)
SELECT 
  proname as function_name,
  '❌ NEW.banner_slot_id 직접 참조 발견!' as issue
FROM pg_proc
WHERE proname IN (
  'update_banner_slot_inventory_on_order',
  'check_inventory_before_order',
  'update_slot_inventory_on_order'
)
AND prosrc LIKE '%NEW.banner_slot_id%';

