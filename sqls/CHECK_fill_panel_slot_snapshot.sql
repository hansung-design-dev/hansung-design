-- fill_panel_slot_snapshot_after_order_details 함수 전체 코드 확인

SELECT 
  proname,
  pg_get_functiondef(oid) as full_function_code
FROM pg_proc
WHERE proname = 'fill_panel_slot_snapshot_after_order_details';

-- 또는 간단히:
SELECT 
  proname,
  prosrc as function_source
FROM pg_proc
WHERE proname = 'fill_panel_slot_snapshot_after_order_details';

-- NEW.banner_slot_id가 실제로 사용되는지 확인
SELECT 
  proname,
  CASE 
    WHEN regexp_replace(prosrc, '--[^\n]*', '', 'g') ~ '\mNEW\.banner_slot_id\M' THEN '❌ 발견!'
    ELSE '✅ 없음'
  END as status,
  -- 실제 사용 부분 찾기
  (SELECT string_agg(line, E'\n')
   FROM (
     SELECT unnest(string_to_array(prosrc, E'\n')) as line
   ) t
   WHERE regexp_replace(line, '--.*', '') ~ '\mNEW\.banner_slot_id\M'
   LIMIT 5) as problematic_lines
FROM pg_proc
WHERE proname = 'fill_panel_slot_snapshot_after_order_details';

