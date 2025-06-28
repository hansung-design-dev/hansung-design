-- =================================================================
-- 현재 데이터베이스 상태 확인
-- =================================================================

-- 1. user_auth 테이블 확인
SELECT 'user_auth 테이블' as table_name, COUNT(*) as count FROM user_auth
UNION ALL
SELECT 'panel_info 테이블' as table_name, COUNT(*) as count FROM panel_info
UNION ALL
SELECT 'orders 테이블' as table_name, COUNT(*) as count FROM orders
UNION ALL
SELECT 'order_details 테이블' as table_name, COUNT(*) as count FROM order_details;

-- 2. testsung 사용자 확인
SELECT 
    id, 
    username, 
    email, 
    name, 
    created_at 
FROM user_auth 
WHERE username = 'testsung';

-- 3. 패널 정보 확인 (구별, 타입별)
SELECT 
    pi.id,
    pi.nickname,
    pi.panel_type,
    rg.name as region_name,
    pi.address
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
ORDER BY rg.name, pi.panel_type;

-- 4. 현재 orders 테이블 데이터 확인
SELECT 
    o.id,
    o.total_price,
    o.depositor_name,
    o.half_period,
    o.display_location,
    o.created_at,
    pi.nickname as panel_name,
    rg.name as region_name,
    ua.name as user_name
FROM orders o
LEFT JOIN panel_info pi ON o.panel_info_id = pi.id
LEFT JOIN region_gu rg ON pi.region_gu_id = rg.id
LEFT JOIN user_auth ua ON o.user_id = ua.id
ORDER BY o.created_at DESC
LIMIT 10;

-- 5. order_details 테이블 데이터 확인
SELECT 
    od.id,
    od.order_id,
    od.slot_order_quantity,
    od.display_start_date,
    od.display_end_date,
    od.half_period,
    od.created_at
FROM order_details od
ORDER BY od.created_at DESC
LIMIT 10; 