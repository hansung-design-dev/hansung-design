-- 모든 관련 트리거와 함수를 완전히 삭제
DROP TRIGGER IF EXISTS trigger_update_closure_quantity ON orders;
DROP TRIGGER IF EXISTS trigger_update_panel_quantity ON order_details;
DROP TRIGGER IF EXISTS trigger_update_order_metadata ON orders;
DROP TRIGGER IF EXISTS trigger_sync_max_banner ON banner_panel_details;

DROP FUNCTION IF EXISTS update_closure_quantity_on_order();
DROP FUNCTION IF EXISTS update_panel_quantity();
DROP FUNCTION IF EXISTS update_order_metadata();
DROP FUNCTION IF EXISTS sync_max_banner_from_details();

-- 모든 트리거 확인
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table IN ('orders', 'order_details')
ORDER BY event_object_table, trigger_name;

-- 모든 함수 확인 (panel_info_id를 참조할 수 있는 함수들)
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_definition LIKE '%panel_info_id%'
AND routine_schema = 'public'; 