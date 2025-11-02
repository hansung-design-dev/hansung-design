-- 정확한 에러 원인 찾기: 모든 order_details 트리거 함수에서 NEW.banner_slot_id 검색

-- 1. 모든 관련 함수 확인 (주석 제외)
SELECT 
  proname as function_name,
  CASE 
    WHEN regexp_replace(prosrc, '--[^\n]*', '', 'g') ~ 'IF\s+NEW\.banner_slot_id|IF\s*\(\s*NEW\.banner_slot_id|WHERE.*NEW\.banner_slot_id|SELECT.*NEW\.banner_slot_id|INTO.*NEW\.banner_slot_id|SET.*NEW\.banner_slot_id' THEN '❌ NEW.banner_slot_id 직접 사용!'
    WHEN regexp_replace(prosrc, '--[^\n]*', '', 'g') ~ 'OLD\.banner_slot_id' THEN '❌ OLD.banner_slot_id 직접 사용!'
    ELSE '✅ 문제 없음'
  END as has_problem,
  -- 실제 코드에서 NEW.banner_slot_id가 사용되는 부분 찾기
  regexp_match(regexp_replace(prosrc, '--[^\n]*', '', 'g'), 'NEW\.banner_slot_id[^;]*') as problematic_code_snippet
FROM pg_proc
WHERE proname IN (
  'update_banner_slot_inventory_on_order',
  'check_inventory_before_order',
  'restore_banner_slot_inventory_on_order_delete',
  'update_slot_inventory_on_order',
  'restore_slot_inventory_on_order_delete',
  'fill_panel_slot_snapshot_after_order_details'
);

-- 2. 트리거 실행 순서 확인
SELECT 
  trigger_name,
  action_timing,
  action_order,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'order_details'
ORDER BY 
  CASE action_timing 
    WHEN 'BEFORE' THEN 1 
    WHEN 'AFTER' THEN 2 
  END,
  action_order NULLS LAST;

-- 3. 특정 함수의 전체 코드에서 문제 부분 찾기
SELECT 
  proname,
  -- 주석 제거 후 실제 코드에서 NEW.banner_slot_id가 나타나는 라인 찾기
  array_to_string(
    array(
      SELECT unnest(string_to_array(prosrc, E'\n'))
      WHERE unnest(string_to_array(prosrc, E'\n')) ~ 'NEW\.banner_slot_id'
      AND unnest(string_to_array(prosrc, E'\n')) !~ '^[\s]*--'
    ),
    E'\n'
  ) as lines_with_banner_slot_id
FROM pg_proc
WHERE proname IN (
  'update_banner_slot_inventory_on_order',
  'check_inventory_before_order',
  'update_slot_inventory_on_order',
  'fill_panel_slot_snapshot_after_order_details'
);

