-- ⚠️ 중요: panel_slot_usage INSERT 시 실행되는 트리거 확인
-- order_details INSERT 전에 panel_slot_usage를 생성하는데, 그때 트리거가 실행될 수 있음!

-- panel_slot_usage에 연결된 트리거
SELECT 
  tgname as trigger_name,
  tgenabled as is_enabled,
  CASE tgenabled
    WHEN 'O' THEN '활성화'
    WHEN 'D' THEN '비활성화'
    ELSE '알 수 없음'
  END as status,
  pg_get_triggerdef(oid) as trigger_definition
FROM pg_trigger
WHERE tgrelid = 'panel_slot_usage'::regclass
  AND NOT tgisinternal;

-- update_top_fixed_banner_inventory 함수는 panel_slot_usage의 트리거입니다
-- 이 함수는 NEW.banner_slot_id를 사용하지만, panel_slot_usage 테이블에는 banner_slot_id가 있으므로 정상입니다.

-- 혹시 다른 함수가 문제일 수 있으니 확인
SELECT 
  proname,
  CASE 
    WHEN prosrc LIKE '%NEW.banner_slot_id%' AND proname LIKE '%order%' THEN '❌ 문제!'
    ELSE '✅ 정상'
  END as status
FROM pg_proc
WHERE proname LIKE '%order%'
  AND prosrc LIKE '%NEW.banner_slot_id%';

