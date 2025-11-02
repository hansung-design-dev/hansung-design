-- Supabase에서 실제 함수 코드 확인
-- 이 쿼리를 실행하여 update_banner_slot_inventory_on_order 함수의 전체 코드를 확인하세요

SELECT pg_get_functiondef(oid) as function_definition
FROM pg_proc
WHERE proname = 'update_banner_slot_inventory_on_order';

-- 또는 간단히:
SELECT prosrc as function_source
FROM pg_proc
WHERE proname = 'update_banner_slot_inventory_on_order';

