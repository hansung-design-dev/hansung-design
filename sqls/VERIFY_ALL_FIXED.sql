-- 🔍 모든 함수가 올바르게 수정되었는지 최종 확인

-- 1. NEW.banner_slot_id를 참조하는 함수 확인
SELECT 
  'NEW.banner_slot_id 참조 함수' as check_type,
  proname as function_name,
  '❌ NEW.banner_slot_id 직접 참조 발견!' as status
FROM pg_proc
WHERE prosrc LIKE '%NEW.banner_slot_id%'
  AND proname NOT IN ('update_top_fixed_banner_inventory') -- panel_slot_usage 테이블 트리거는 정상
ORDER BY proname;

-- 2. OLD.banner_slot_id를 참조하는 함수 확인
SELECT 
  'OLD.banner_slot_id 참조 함수' as check_type,
  proname as function_name,
  '❌ OLD.banner_slot_id 직접 참조 발견!' as status
FROM pg_proc
WHERE prosrc LIKE '%OLD.banner_slot_id%'
  AND proname NOT IN ('release_top_fixed_inventory_on_cancel') -- 수정 후에는 없어야 함
ORDER BY proname;

-- 3. orders 테이블 트리거 상태 확인
SELECT 
  'orders 테이블 트리거' as check_type,
  tgname as trigger_name,
  CASE tgenabled
    WHEN 'O' THEN '활성화됨'
    WHEN 'D' THEN '비활성화됨'
    ELSE '알 수 없음'
  END as status
FROM pg_trigger
WHERE tgrelid = (SELECT oid FROM pg_class WHERE relname = 'orders')
  AND NOT tgisinternal
ORDER BY tgname;

-- 4. 주요 함수들의 수정 상태 확인
SELECT 
  '주요 함수 수정 상태' as check_type,
  proname as function_name,
  CASE 
    WHEN proname = 'update_top_fixed_inventory_on_order' AND prosrc LIKE '%RETURN NEW%' THEN '✅ 수정됨 (빈 함수)'
    WHEN proname = 'release_top_fixed_inventory_on_cancel' AND prosrc LIKE '%order_details%' THEN '✅ 수정됨'
    WHEN proname = 'restore_banner_slot_inventory_on_order_delete' AND prosrc LIKE '%panel_slot_usage_id%' THEN '✅ 수정됨'
    WHEN proname = 'update_banner_slot_inventory_on_order' AND prosrc LIKE '%panel_slot_usage_id%' THEN '✅ 수정됨'
    WHEN proname = 'check_inventory_before_order' AND prosrc LIKE '%panel_slot_usage_id%' THEN '✅ 수정됨'
    ELSE '⚠️ 확인 필요'
  END as status
FROM pg_proc
WHERE proname IN (
  'update_top_fixed_inventory_on_order',
  'release_top_fixed_inventory_on_cancel',
  'restore_banner_slot_inventory_on_order_delete',
  'update_banner_slot_inventory_on_order',
  'check_inventory_before_order'
)
ORDER BY proname;

