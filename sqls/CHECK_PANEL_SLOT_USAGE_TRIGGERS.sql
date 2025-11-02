-- panel_slot_usage 테이블에 연결된 트리거 확인
-- order_details INSERT 전에 panel_slot_usage를 생성하는데, 그때 트리거가 실행될 수 있음!

-- 1. panel_slot_usage에 연결된 모든 트리거
SELECT 
  trigger_name,
  event_object_table,
  action_statement,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE event_object_table = 'panel_slot_usage'
ORDER BY action_timing, trigger_name;

-- 2. panel_slot_usage 트리거 함수에서 NEW.banner_slot_id 사용 여부 확인
SELECT 
  proname as function_name,
  CASE 
    WHEN prosrc LIKE '%NEW.banner_slot_id%' THEN '❌ NEW.banner_slot_id 사용!'
    WHEN prosrc LIKE '%OLD.banner_slot_id%' THEN '❌ OLD.banner_slot_id 사용!'
    ELSE '✅ 문제 없음'
  END as status
FROM pg_proc
WHERE proname IN (
  'update_top_fixed_banner_inventory',
  'prevent_duplicate_banner_booking',
  'prevent_duplicate_slot_booking'
)
ORDER BY proname;

-- 3. update_top_fixed_banner_inventory 함수 확인
-- ⚠️ 이 함수는 panel_slot_usage의 트리거인데 NEW.banner_slot_id를 사용합니다
-- 하지만 panel_slot_usage 테이블에는 banner_slot_id가 있으므로 정상입니다!
SELECT 
  'update_top_fixed_banner_inventory' as function_name,
  prosrc as full_code
FROM pg_proc
WHERE proname = 'update_top_fixed_banner_inventory';

