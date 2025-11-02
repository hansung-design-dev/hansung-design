-- 🔍 간단한 트리거 상태 확인 (타입 캐스팅 없이)

-- 1. order_details 트리거 상태
SELECT 
  tgname as trigger_name,
  CASE tgenabled
    WHEN 'O' THEN '활성화됨'
    WHEN 'D' THEN '비활성화됨'
    WHEN 'R' THEN '복제로 비활성화됨'
    WHEN 'A' THEN '항상 활성화'
    ELSE '알 수 없음'
  END as status
FROM pg_trigger
WHERE tgrelid = (SELECT oid FROM pg_class WHERE relname = 'order_details')
  AND NOT tgisinternal
ORDER BY tgname;

-- 2. fill_panel_slot_snapshot 함수에서 NEW.banner_slot_id 사용 여부
SELECT 
  proname as function_name,
  CASE 
    WHEN prosrc LIKE '%NEW.banner_slot_id%' THEN 'NEW.banner_slot_id 참조 발견!'
    WHEN prosrc LIKE '%OLD.banner_slot_id%' THEN 'OLD.banner_slot_id 참조 발견'
    ELSE 'banner_slot_id 직접 참조 없음'
  END as status
FROM pg_proc
WHERE proname = 'fill_panel_slot_snapshot_after_order_details';

-- 3. panel_slot_usage 트리거 상태
SELECT 
  tgname as trigger_name,
  CASE tgenabled
    WHEN 'O' THEN '활성화됨'
    WHEN 'D' THEN '비활성화됨'
    ELSE '알 수 없음'
  END as status
FROM pg_trigger
WHERE tgrelid = (SELECT oid FROM pg_class WHERE relname = 'panel_slot_usage')
  AND NOT tgisinternal
ORDER BY tgname;

-- 4. 모든 트리거 함수에서 NEW.banner_slot_id 사용 여부
SELECT 
  proname as function_name,
  CASE 
    WHEN prosrc LIKE '%NEW.banner_slot_id%' THEN 'NEW.banner_slot_id 참조 발견!'
    ELSE '참조 없음'
  END as status
FROM pg_proc
WHERE prorettype = (SELECT oid FROM pg_type WHERE typname = 'trigger')
  AND prosrc LIKE '%NEW.banner_slot_id%'
ORDER BY proname;

