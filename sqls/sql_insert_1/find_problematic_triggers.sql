-- orders 테이블에 연결된 모든 트리거 찾기
SELECT 
    t.trigger_name,
    t.event_object_table,
    t.event_manipulation,
    t.action_timing,
    p.prosrc as function_source
FROM information_schema.triggers t
JOIN pg_trigger pt ON t.trigger_name = pt.tgname
JOIN pg_proc p ON pt.tgfoid = p.oid
WHERE t.event_object_table = 'orders'
ORDER BY t.trigger_name;

-- panel_info_id를 참조하는 모든 함수 찾기
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_definition LIKE '%panel_info_id%'
AND routine_schema = 'public'
ORDER BY routine_name;

-- orders 테이블에 실제로 panel_info_id 컬럼이 있는지 확인
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'panel_info_id';

-- 모든 테이블에서 panel_info_id 컬럼 찾기
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE column_name = 'panel_info_id'
AND table_schema = 'public'
ORDER BY table_name; 