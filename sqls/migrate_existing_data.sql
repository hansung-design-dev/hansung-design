-- 기존 orders 테이블의 panel_info_id를 order_details로 마이그레이션
-- (기존 주문 데이터가 있는 경우에만 실행)

-- 1. order_details에 panel_info_id가 없는 경우에만 업데이트
UPDATE order_details 
SET panel_info_id = orders.panel_info_id
FROM orders 
WHERE order_details.order_id = orders.id 
  AND order_details.panel_info_id IS NULL 
  AND orders.panel_info_id IS NOT NULL;

-- 2. 마이그레이션 결과 확인
SELECT 
    'orders 테이블' as table_name,
    COUNT(*) as total_records,
    COUNT(panel_info_id) as records_with_panel_info_id
FROM orders
UNION ALL
SELECT 
    'order_details 테이블' as table_name,
    COUNT(*) as total_records,
    COUNT(panel_info_id) as records_with_panel_info_id
FROM order_details;

-- 3. 주문별 상세 정보 확인
SELECT 
    o.id as order_id,
    o.order_number,
    o.total_price,
    o.created_at,
    COUNT(od.id) as detail_count,
    COUNT(od.panel_info_id) as details_with_panel_info
FROM orders o
LEFT JOIN order_details od ON o.id = od.order_id
GROUP BY o.id, o.order_number, o.total_price, o.created_at
ORDER BY o.created_at DESC; 