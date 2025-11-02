-- 트리거 재생성 SQL
-- Supabase SQL Editor에서 실행

-- 1. 기존 트리거 삭제
DROP TRIGGER IF EXISTS trigger_update_top_fixed_banner_inventory ON panel_slot_usage;

-- 2. 함수가 제대로 생성되었는지 다시 확인
SELECT 
    proname,
    pg_get_functiondef(oid) LIKE '%$top_fixed_inventory$%' as has_correct_tag
FROM pg_proc
WHERE proname = 'update_top_fixed_banner_inventory';

-- 3. 트리거 재생성
CREATE TRIGGER trigger_update_top_fixed_banner_inventory
  AFTER INSERT ON panel_slot_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_top_fixed_banner_inventory();

-- 4. 트리거 생성 확인
SELECT 
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_update_top_fixed_banner_inventory';

