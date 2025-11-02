-- 🔍 orders 테이블 트리거 및 함수 확인
-- 이 함수들이 NEW.banner_slot_id를 참조하려고 시도하는 것이 문제!

-- 1. orders 테이블의 모든 트리거 확인
SELECT 
  tgname as trigger_name,
  CASE tgenabled
    WHEN 'O' THEN '활성화됨'
    WHEN 'D' THEN '비활성화됨'
    ELSE '알 수 없음'
  END as status,
  pg_get_triggerdef(oid::oid) as trigger_definition
FROM pg_trigger
WHERE tgrelid = (SELECT oid FROM pg_class WHERE relname = 'orders')
  AND NOT tgisinternal
ORDER BY tgname;

-- 2. 문제가 있는 함수들의 실제 코드 확인
SELECT 
  '=== update_top_fixed_inventory_on_order 함수 코드 ===' as section,
  prosrc as full_code
FROM pg_proc
WHERE proname = 'update_top_fixed_inventory_on_order';

SELECT 
  '=== disable_other_periods_on_order 함수 코드 ===' as section,
  prosrc as full_code
FROM pg_proc
WHERE proname = 'disable_other_periods_on_order';

-- 3. 이 함수들이 어느 테이블의 트리거인지 확인
SELECT 
  t.tgname as trigger_name,
  c.relname as table_name,
  p.proname as function_name,
  CASE 
    WHEN p.prosrc LIKE '%NEW.banner_slot_id%' THEN 'NEW.banner_slot_id 참조 발견!'
    ELSE '참조 없음'
  END as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE p.proname IN ('update_top_fixed_inventory_on_order', 'disable_other_periods_on_order')
  AND NOT t.tgisinternal;

