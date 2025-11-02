-- 🔍 트리거 에러 디버깅 SQL
-- Supabase SQL Editor에서 실행하여 문제 확인

-- 1. 모든 트리거 확인
SELECT 
    trigger_name,
    event_object_table as table_name,
    action_timing,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 2. update_top_fixed_banner_inventory 함수 확인
SELECT 
    proname as function_name,
    pg_get_functiondef(oid) as full_definition
FROM pg_proc
WHERE proname = 'update_top_fixed_banner_inventory';

-- 3. panel_slot_usage 테이블의 최근 INSERT 확인
-- (banner_slot_id가 NULL인 레코드 확인)
SELECT 
    id,
    panel_id,
    banner_slot_id,
    slot_number,
    usage_type,
    created_at
FROM panel_slot_usage
WHERE banner_slot_id IS NULL
ORDER BY created_at DESC
LIMIT 10;

-- 4. 트리거 실행 로그 확인 (Supabase에서 지원하는 경우)
-- PostgreSQL 로그를 확인하거나, 함수 내부의 RAISE NOTICE를 확인

-- 5. 실제 문제가 발생하는지 테스트
-- 다음 INSERT가 성공하는지 확인:
INSERT INTO panel_slot_usage (
    display_type_id,
    panel_id,
    slot_number,
    banner_slot_id,  -- NULL이면 안 됨!
    usage_type,
    attach_date_from,
    is_active,
    is_closed,
    banner_type
)
SELECT 
    dt.id,
    p.id,
    1,
    bs.id,  -- banner_slot_id
    'banner_display',
    CURRENT_DATE,
    true,
    false,
    'panel'
FROM panels p
JOIN display_types dt ON p.display_type_id = dt.id
JOIN banner_slots bs ON bs.panel_id = p.id AND bs.slot_number = 1
WHERE dt.name = 'banner_display'
LIMIT 1
RETURNING *;

-- 위 INSERT가 성공하면 트리거도 정상 실행되어야 함

-- 6. 함수 내부 로직 테스트 (직접 호출)
-- 주의: 트리거 함수는 직접 호출할 수 없지만, 로직 확인용
-- 실제로는 트리거를 통해만 실행됨

