-- orders 테이블의 user_profile_id 컬럼을 NULL 허용으로 변경
ALTER TABLE orders ALTER COLUMN user_profile_id DROP NOT NULL;

-- 현재 제약조건 확인
SELECT 
    constraint_name,
    constraint_type,
    table_name,
    column_name
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage ccu 
ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'orders' 
AND ccu.column_name = 'user_profile_id'; 