-- 이미 존재하는 orders.user_auth_id 컬럼을 user_auth.id와 외래키로 연결

-- 1. 외래키 제약조건 추가
ALTER TABLE orders 
ADD CONSTRAINT fk_orders_user_auth_id 
FOREIGN KEY (user_auth_id) 
REFERENCES user_auth(id) 
ON DELETE CASCADE;

-- 2. 인덱스 추가 (성능 향상을 위해)
CREATE INDEX IF NOT EXISTS idx_orders_user_auth_id ON orders(user_auth_id);

-- 3. 외래키 제약조건 확인
SELECT 
    tc.constraint_name, 
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
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='orders'; 