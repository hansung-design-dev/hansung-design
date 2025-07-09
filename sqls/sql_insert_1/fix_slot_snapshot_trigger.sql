-- 문제가 되는 트리거 삭제
DROP TRIGGER IF EXISTS trg_fill_slot_snapshot ON orders;

-- 트리거 상태 확인 (수정된 쿼리)
SELECT 
    n.nspname as schema_name,
    c.relname as table_name,
    t.tgname as trigger_name,
    t.tgenabled as enabled
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.relname IN ('orders', 'order_details')
ORDER BY c.relname, t.tgname;

-- 주문 생성 테스트를 위한 간단한 확인
SELECT '트리거 정리 완료' as status; 