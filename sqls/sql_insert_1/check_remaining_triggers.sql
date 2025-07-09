-- 남은 트리거들의 함수 내용 확인
SELECT 
    t.trigger_name,
    t.event_object_table,
    t.event_manipulation,
    t.action_timing,
    p.prosrc as function_source
FROM information_schema.triggers t
JOIN pg_trigger pt ON t.trigger_name = pt.tgname
JOIN pg_proc p ON pt.tgfoid = p.oid
WHERE t.event_object_table IN ('orders', 'order_details')
ORDER BY t.event_object_table, t.trigger_name;

-- trg_fill_slot_snapshot 트리거 비활성화 (문제가 될 수 있는 트리거)
ALTER TABLE orders DISABLE TRIGGER trg_fill_slot_snapshot;

-- 트리거 상태 확인
SELECT 
    schemaname,
    tablename,
    triggername,
    enabled
FROM pg_trigger
WHERE tablename IN ('orders', 'order_details'); 