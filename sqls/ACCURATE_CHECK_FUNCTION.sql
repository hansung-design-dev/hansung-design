-- 정확한 검증: 주석은 제외하고 실제 코드만 확인

SELECT 
  proname,
  -- 주석 라인 제거 후 검색 (-- 로 시작하는 라인 제외)
  CASE 
    WHEN regexp_replace(prosrc, '--[^\n]*', '', 'g') LIKE '%NEW.banner_slot_id%' THEN '❌ NEW.banner_slot_id 직접 참조 있음!'
    WHEN regexp_replace(prosrc, '--[^\n]*', '', 'g') LIKE '%OLD.banner_slot_id%' THEN '❌ OLD.banner_slot_id 직접 참조 있음!'
    WHEN prosrc LIKE '%panel_slot_usage_id%' THEN '✅ 올바르게 수정됨 (panel_slot_usage_id 사용)'
    ELSE '⚠️ 확인 필요'
  END as status,
  -- 실제 문제가 되는 부분만 찾기 (IF문이나 WHERE절에서 사용)
  CASE 
    WHEN regexp_replace(prosrc, '--[^\n]*', '', 'g') ~ 'IF\s+NEW\.banner_slot_id' THEN '❌ IF문에서 직접 참조'
    WHEN regexp_replace(prosrc, '--[^\n]*', '', 'g') ~ 'WHERE.*NEW\.banner_slot_id' THEN '❌ WHERE절에서 직접 참조'
    WHEN regexp_replace(prosrc, '--[^\n]*', '', 'g') ~ 'SELECT.*NEW\.banner_slot_id' THEN '❌ SELECT에서 직접 참조'
    ELSE '✅ 직접 참조 없음'
  END as code_usage_check
FROM pg_proc
WHERE proname = 'update_banner_slot_inventory_on_order';

-- 실제 함수 본문 전체 확인 (주석 제외)
SELECT 
  regexp_replace(prosrc, '--[^\n]*', '', 'g') as function_code_without_comments
FROM pg_proc
WHERE proname = 'update_banner_slot_inventory_on_order';

