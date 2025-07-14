-- 1. user_auth_id에 외래키 제약조건 추가
ALTER TABLE orders 
ADD CONSTRAINT fk_orders_user_auth_id 
FOREIGN KEY (user_auth_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- 2. 인덱스 추가 (성능 향상을 위해)
CREATE INDEX idx_orders_user_auth_id ON orders(user_auth_id); 