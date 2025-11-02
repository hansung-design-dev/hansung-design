-- Supabase 호환: 간단한 검색 쿼리

-- 방법 1: 각 함수에서 NEW.banner_slot_id 검색 (간단한 방법)
SELECT 
  proname as function_name,
  CASE 
    WHEN prosrc LIKE '%NEW.banner_slot_id%' THEN '❌ NEW.banner_slot_id 발견!'
    WHEN prosrc LIKE '%OLD.banner_slot_id%' THEN '❌ OLD.banner_slot_id 발견!'
    ELSE '✅ 없음'
  END as status
FROM pg_proc
WHERE proname IN (
  'update_banner_slot_inventory_on_order',
  'check_inventory_before_order',
  'update_slot_inventory_on_order',
  'fill_panel_slot_snapshot_after_order_details'
)
ORDER BY proname;

-- 방법 2: 전체 함수 코드 확인 (문제가 있는 함수만)
SELECT 
  proname,
  prosrc as full_code
FROM pg_proc
WHERE proname IN (
  'update_banner_slot_inventory_on_order',
  'check_inventory_before_order',
  'update_slot_inventory_on_order',
  'fill_panel_slot_snapshot_after_order_details'
)
AND (prosrc LIKE '%NEW.banner_slot_id%' OR prosrc LIKE '%OLD.banner_slot_id%')
ORDER BY proname;

-- 방법 3: 각 함수의 전체 코드를 개별적으로 확인
-- fill_panel_slot_snapshot_after_order_details
SELECT 
  'fill_panel_slot_snapshot_after_order_details' as function_name,
  prosrc as full_code
FROM pg_proc
WHERE proname = 'fill_panel_slot_snapshot_after_order_details';

-- update_slot_inventory_on_order
SELECT 
  'update_slot_inventory_on_order' as function_name,
  prosrc as full_code
FROM pg_proc
WHERE proname = 'update_slot_inventory_on_order';

-- check_inventory_before_order
SELECT 
  'check_inventory_before_order' as function_name,
  prosrc as full_code
FROM pg_proc
WHERE proname = 'check_inventory_before_order';

