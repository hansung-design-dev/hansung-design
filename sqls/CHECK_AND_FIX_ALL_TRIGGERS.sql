-- ⚠️ 즉시 실행: Supabase에서 실제 함수 상태 확인 및 수정
-- 이 쿼리를 Supabase SQL Editor에서 실행하세요

-- ============================================
-- 1단계: order_details에 연결된 모든 트리거 확인
-- ============================================
SELECT 
  trigger_name,
  event_object_table,
  action_statement,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE event_object_table = 'order_details'
ORDER BY action_timing, trigger_name;

-- ============================================
-- 2단계: 모든 관련 함수에서 NEW.banner_slot_id 참조 확인
-- ============================================
SELECT 
  proname as function_name,
  CASE 
    WHEN prosrc LIKE '%NEW.banner_slot_id%' THEN '❌ NEW.banner_slot_id 직접 참조 있음!'
    WHEN prosrc LIKE '%OLD.banner_slot_id%' THEN '❌ OLD.banner_slot_id 직접 참조 있음!'
    ELSE '✅ banner_slot_id 직접 참조 없음'
  END as has_direct_reference,
  CASE 
    WHEN proname IN ('update_banner_slot_inventory_on_order', 'check_inventory_before_order', 'restore_banner_slot_inventory_on_order_delete') 
      AND prosrc LIKE '%panel_slot_usage_id%' THEN '✅ 올바르게 수정됨'
    WHEN proname IN ('update_banner_slot_inventory_on_order', 'check_inventory_before_order', 'restore_banner_slot_inventory_on_order_delete') THEN '⚠️ 확인 필요'
    ELSE '-'
  END as status
FROM pg_proc
WHERE proname IN (
  'update_banner_slot_inventory_on_order',
  'check_inventory_before_order',
  'restore_banner_slot_inventory_on_order_delete',
  'update_slot_inventory_on_order',
  'restore_slot_inventory_on_order_delete'
)
ORDER BY proname;

-- ============================================
-- 3단계: update_slot_inventory_on_order 함수 확인
-- ============================================
-- 이 함수가 존재하는지, 그리고 NEW.banner_slot_id를 참조하는지 확인
SELECT 
  proname,
  prosrc LIKE '%NEW.banner_slot_id%' as has_new_banner_slot_id,
  prosrc LIKE '%OLD.banner_slot_id%' as has_old_banner_slot_id,
  prosrc LIKE '%panel_slot_usage_id%' as has_panel_slot_usage_id,
  LEFT(prosrc, 500) as function_preview
FROM pg_proc
WHERE proname = 'update_slot_inventory_on_order';

-- 만약 함수가 존재하고 NEW.banner_slot_id를 참조한다면, 이 트리거를 임시로 비활성화하거나 함수를 수정해야 함

