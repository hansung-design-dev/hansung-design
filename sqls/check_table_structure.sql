-- orders 테이블 구조 확인
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- order_details 테이블 구조 확인
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'order_details'
ORDER BY ordinal_position;

-- panel_info_id 컬럼이 있는지 확인
SELECT 
    table_name,
    column_name
FROM information_schema.columns 
WHERE column_name = 'panel_info_id'
AND table_schema = 'public'; 