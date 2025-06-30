-- 현재 orders 테이블의 데이터 확인
SELECT 
    id,
    order_number,
    panel_info_id,
    total_price,
    is_paid,
    is_checked,
    created_at,
    user_auth_id,
    user_profile_id
FROM orders
ORDER BY created_at DESC;

-- order_details 테이블의 데이터 확인
SELECT 
    id,
    order_id,
    slot_order_quantity,
    display_start_date,
    display_end_date,
    created_at
FROM order_details
ORDER BY created_at DESC;

-- 외래키 제약조건 확인
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('orders', 'order_details'); 