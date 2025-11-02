-- 함수가 올바르게 수정되었는지 확인

-- 1. restore_banner_slot_inventory_on_order_delete 함수 확인
SELECT 
  proname,
  CASE 
    WHEN prosrc LIKE '%OLD.banner_slot_id%' THEN '❌ OLD.banner_slot_id 직접 참조 발견!'
    WHEN prosrc LIKE '%OLD.panel_slot_usage_id%' THEN '✅ 올바르게 수정됨'
    ELSE '⚠️ 확인 필요'
  END as status,
  -- 코드 일부 확인
  LEFT(prosrc, 200) as code_preview
FROM pg_proc
WHERE proname = 'restore_banner_slot_inventory_on_order_delete';

-- 2. restore_slot_inventory_on_order_delete 함수 확인
SELECT 
  proname,
  CASE 
    WHEN prosrc LIKE '%OLD.banner_slot_id%' THEN '❌ OLD.banner_slot_id 직접 참조 발견!'
    WHEN prosrc LIKE '%OLD.panel_slot_usage_id%' THEN '✅ 올바르게 수정됨'
    ELSE '⚠️ 확인 필요'
  END as status,
  LEFT(prosrc, 200) as code_preview
FROM pg_proc
WHERE proname = 'restore_slot_inventory_on_order_delete';

