-- 임시로 모든 트리거 비활성화 (테스트용)
ALTER TABLE orders DISABLE TRIGGER ALL;
ALTER TABLE order_details DISABLE TRIGGER ALL;

-- 트리거 상태 확인
SELECT 
    schemaname,
    tablename,
    triggername,
    enabled
FROM pg_trigger
WHERE tablename IN ('orders', 'order_details');

-- 주문 생성 테스트 후 다시 활성화하려면:
-- ALTER TABLE orders ENABLE TRIGGER ALL;
-- ALTER TABLE order_details ENABLE TRIGGER ALL; 