-- 주문과 관련된 모든 데이터를 삭제하는 함수
CREATE OR REPLACE FUNCTION delete_order_with_related_data(order_id UUID)
RETURNS void AS $$
BEGIN
  -- 트랜잭션 시작
  BEGIN
    -- 1. payments 삭제
    DELETE FROM payments WHERE order_id = delete_order_with_related_data.order_id;
    
    -- 2. design_drafts 삭제
    DELETE FROM design_drafts WHERE order_id = delete_order_with_related_data.order_id;
    
    -- 3. order_details 삭제 (재고 복구는 트리거가 자동 처리)
    DELETE FROM order_details WHERE order_id = delete_order_with_related_data.order_id;
    
    -- 4. orders 삭제
    DELETE FROM orders WHERE id = delete_order_with_related_data.order_id;
    
    -- 트랜잭션 커밋
    COMMIT;
  EXCEPTION
    WHEN OTHERS THEN
      -- 트랜잭션 롤백
      ROLLBACK;
      RAISE EXCEPTION '주문 삭제 중 오류가 발생했습니다: %', SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql; 