-- 1. order_status enum 타입 생성
CREATE TYPE order_status_enum AS ENUM ('pending', 'completed');

-- 2. orders 테이블에 order_status 컬럼 추가
ALTER TABLE orders ADD COLUMN order_status order_status_enum DEFAULT 'pending';

-- 3. 기존 데이터가 있다면 모두 pending으로 설정
UPDATE orders SET order_status = 'pending' WHERE order_status IS NULL;

-- 4. order_status 컬럼을 NOT NULL로 설정
ALTER TABLE orders ALTER COLUMN order_status SET NOT NULL; 