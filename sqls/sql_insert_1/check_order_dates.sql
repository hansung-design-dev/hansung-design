-- 주문 데이터의 날짜 정보 확인
SELECT 
    o.id,
    o.order_number,
    o.created_at,
    o.total_price,
    od.display_start_date,
    od.display_end_date,
    od.half_period
FROM orders o 
LEFT JOIN order_details od ON o.id = od.order_id 
ORDER BY o.created_at DESC 
LIMIT 10;

-- 날짜 데이터 타입 확인
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('created_at', 'updated_at');

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'order_details' 
AND column_name IN ('display_start_date', 'display_end_date', 'created_at'); 