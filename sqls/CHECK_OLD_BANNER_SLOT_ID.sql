-- 🔍 OLD.banner_slot_id를 참조하는 함수 확인
-- order_details INSERT 시 OLD는 없는데, DELETE/UPDATE 트리거가 잘못 실행되고 있을 수 있음

-- 1. OLD.banner_slot_id를 참조하는 모든 함수 확인
SELECT 
  proname as function_name,
  'OLD.banner_slot_id 참조 발견!' as status,
  prosrc as full_code
FROM pg_proc
WHERE prosrc LIKE '%OLD.banner_slot_id%'
ORDER BY proname;

-- 2. order_details 테이블의 DELETE/UPDATE 트리거 확인
SELECT 
  tgname as trigger_name,
  CASE tgenabled
    WHEN 'O' THEN '활성화됨'
    WHEN 'D' THEN '비활성화됨'
    ELSE '알 수 없음'
  END as status,
  CASE tgtype::integer & 2
    WHEN 2 THEN 'AFTER'
    ELSE 'BEFORE'
  END as timing,
  CASE tgtype::integer & 4
    WHEN 4 THEN 'UPDATE'
    ELSE CASE tgtype::integer & 8
      WHEN 8 THEN 'DELETE'
      ELSE 'INSERT'
    END
  END as event,
  pg_get_triggerdef(oid::oid) as trigger_definition
FROM pg_trigger
WHERE tgrelid = (SELECT oid FROM pg_class WHERE relname = 'order_details')
  AND NOT tgisinternal
ORDER BY tgname;

-- 3. restore_banner_slot_inventory_on_order_delete 함수 확인
SELECT 
  proname,
  CASE 
    WHEN prosrc LIKE '%OLD.banner_slot_id%' THEN 'OLD.banner_slot_id 직접 참조!'
    ELSE '직접 참조 없음'
  END as status,
  prosrc as full_code
FROM pg_proc
WHERE proname = 'restore_banner_slot_inventory_on_order_delete';

