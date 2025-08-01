-- 데이터베이스의 모든 함수를 조회하는 스크립트

-- 1. 모든 함수 목록 조회
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type,
    p.prosrc as function_source,
    p.prolang as language_oid,
    l.lanname as language_name,
    p.prokind as function_kind,
    CASE p.prokind
        WHEN 'f' THEN 'function'
        WHEN 'p' THEN 'procedure'
        WHEN 'a' THEN 'aggregate'
        WHEN 'w' THEN 'window'
    END as function_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
JOIN pg_language l ON p.prolang = l.oid
WHERE n.nspname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
  AND n.nspname NOT LIKE 'pg_%'
ORDER BY n.nspname, p.proname;

-- 2. 함수 소스 코드만 조회 (복사하기 쉬운 형태)
SELECT 
    '-- Function: ' || n.nspname || '.' || p.proname || E'\n' ||
    '-- Arguments: ' || pg_get_function_arguments(p.oid) || E'\n' ||
    '-- Return: ' || pg_get_function_result(p.oid) || E'\n' ||
    'CREATE OR REPLACE FUNCTION ' || n.nspname || '.' || p.proname || 
    '(' || pg_get_function_arguments(p.oid) || ')' ||
    ' RETURNS ' || pg_get_function_result(p.oid) || E'\n' ||
    'AS $$' || E'\n' ||
    p.prosrc || E'\n' ||
    '$$ LANGUAGE ' || l.lanname || ';' || E'\n' as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
JOIN pg_language l ON p.prolang = l.oid
WHERE n.nspname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
  AND n.nspname NOT LIKE 'pg_%'
  AND l.lanname = 'plpgsql'  -- PL/pgSQL 함수만
ORDER BY n.nspname, p.proname;

-- 3. 트리거 함수만 조회
SELECT 
    '-- Trigger Function: ' || n.nspname || '.' || p.proname || E'\n' ||
    '-- Arguments: ' || pg_get_function_arguments(p.oid) || E'\n' ||
    '-- Return: ' || pg_get_function_result(p.oid) || E'\n' ||
    'CREATE OR REPLACE FUNCTION ' || n.nspname || '.' || p.proname || 
    '(' || pg_get_function_arguments(p.oid) || ')' ||
    ' RETURNS ' || pg_get_function_result(p.oid) || E'\n' ||
    'AS $$' || E'\n' ||
    p.prosrc || E'\n' ||
    '$$ LANGUAGE ' || l.lanname || ';' || E'\n' as trigger_function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
JOIN pg_language l ON p.prolang = l.oid
WHERE n.nspname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
  AND n.nspname NOT LIKE 'pg_%'
  AND l.lanname = 'plpgsql'
  AND p.prosrc LIKE '%TRIGGER%'  -- 트리거 함수만
ORDER BY n.nspname, p.proname;

-- 4. 트리거 목록 조회
SELECT 
    t.tgname as trigger_name,
    n.nspname as schema_name,
    c.relname as table_name,
    p.proname as function_name,
    t.tgenabled as enabled,
    t.tgtype as trigger_type,
    t.tgdeferrable as deferrable,
    t.tginitdeferred as initially_deferred
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE n.nspname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
  AND n.nspname NOT LIKE 'pg_%'
  AND NOT t.tgisinternal  -- 내부 트리거 제외
ORDER BY n.nspname, c.relname, t.tgname;

-- 5. 뷰 목록 조회
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views
WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
  AND schemaname NOT LIKE 'pg_%'
ORDER BY schemaname, viewname;

-- 6. 인덱스 목록 조회
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
  AND schemaname NOT LIKE 'pg_%'
ORDER BY schemaname, tablename, indexname;

-- 7. 제약조건 목록 조회
SELECT 
    tc.table_schema,
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema NOT IN ('information_schema', 'pg_catalog')
  AND tc.table_schema NOT LIKE 'pg_%'
ORDER BY tc.table_schema, tc.table_name, tc.constraint_name; 