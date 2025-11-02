-- 모든 함수의 전체 코드 확인 (NEW.banner_slot_id 검색)

-- 1. fill_panel_slot_snapshot_after_order_details 함수 확인
SELECT 
  proname,
  CASE 
    WHEN prosrc ~ '\mNEW\.banner_slot_id\M' THEN '❌ NEW.banner_slot_id 발견!'
    WHEN prosrc ~ '\mOLD\.banner_slot_id\M' THEN '❌ OLD.banner_slot_id 발견!'
    ELSE '✅ 문제 없음'
  END as status,
  -- 문제가 되는 부분 추출
  CASE 
    WHEN prosrc ~ '\mNEW\.banner_slot_id\M' THEN 
      (SELECT string_agg(line, E'\n')
       FROM (
         SELECT unnest(string_to_array(prosrc, E'\n')) as line
       ) t
       WHERE line ~ '\mNEW\.banner_slot_id\M'
       LIMIT 3)
    ELSE NULL
  END as problematic_code
FROM pg_proc
WHERE proname = 'fill_panel_slot_snapshot_after_order_details';

-- 2. 모든 order_details 관련 함수 전체 코드 확인
SELECT 
  proname,
  pg_get_functiondef(oid) as full_definition
FROM pg_proc
WHERE proname IN (
  'update_banner_slot_inventory_on_order',
  'check_inventory_before_order',
  'restore_banner_slot_inventory_on_order_delete',
  'update_slot_inventory_on_order',
  'restore_slot_inventory_on_order_delete',
  'fill_panel_slot_snapshot_after_order_details'
)
ORDER BY proname;

-- 3. 실제 코드에서 NEW.banner_slot_id가 나타나는 정확한 위치 찾기
SELECT 
  proname,
  -- 라인 번호와 함께 표시
  array_to_string(
    array(
      SELECT format('Line %s: %s', row_number() OVER (), line)
      FROM unnest(string_to_array(prosrc, E'\n')) WITH ORDINALITY AS t(line, line_num)
      WHERE line ~ '\mNEW\.banner_slot_id\M'
    ),
    E'\n'
  ) as lines_with_new_banner_slot_id
FROM pg_proc
WHERE proname IN (
  'update_banner_slot_inventory_on_order',
  'check_inventory_before_order',
  'update_slot_inventory_on_order',
  'fill_panel_slot_snapshot_after_order_details'
)
AND prosrc ~ '\mNEW\.banner_slot_id\M';

