-- 상세한 에러 로깅 활성화 및 모든 함수 재확인

-- 1. 모든 order_details 트리거 함수에서 NEW.banner_slot_id 사용 여부 정확히 확인
WITH function_checks AS (
  SELECT 
    proname,
    -- 주석 제외하고 실제 코드만
    regexp_replace(prosrc, '--[^\n]*', '', 'g') as clean_code,
    -- NEW.banner_slot_id가 실제 코드에서 사용되는지 (IF, WHERE, SELECT, INTO, SET 제외한 경우)
    CASE 
      WHEN regexp_replace(prosrc, '--[^\n]*', '', 'g') ~ '\mNEW\.banner_slot_id\M' THEN true
      ELSE false
    END as uses_new_banner_slot_id
  FROM pg_proc
  WHERE proname IN (
    'update_banner_slot_inventory_on_order',
    'check_inventory_before_order',
    'restore_banner_slot_inventory_on_order_delete',
    'update_slot_inventory_on_order',
    'restore_slot_inventory_on_order_delete',
    'fill_panel_slot_snapshot_after_order_details'
  )
)
SELECT 
  proname,
  uses_new_banner_slot_id,
  -- 실제 사용되는 부분 찾기
  CASE 
    WHEN uses_new_banner_slot_id THEN 
      (SELECT string_agg(line, E'\n')
       FROM unnest(string_to_array(clean_code, E'\n')) line
       WHERE line ~ '\mNEW\.banner_slot_id\M'
       LIMIT 5)
    ELSE NULL
  END as problematic_lines
FROM function_checks;

-- 2. 트리거를 일시적으로 비활성화하여 어떤 트리거가 문제인지 확인
-- 하나씩 비활성화하면서 테스트하는 것이 가장 빠른 방법입니다

-- 옵션 A: slot_inventory_insert_trigger 비활성화 (update_slot_inventory_on_order 사용)
ALTER TABLE order_details DISABLE TRIGGER slot_inventory_insert_trigger;

-- 옵션 B: fill_panel_slot_snapshot 트리거 비활성화 (테스트용)
-- ALTER TABLE order_details DISABLE TRIGGER trigger_fill_panel_slot_snapshot_after_order_details;

-- 다시 활성화하려면:
-- ALTER TABLE order_details ENABLE TRIGGER trigger_name;

