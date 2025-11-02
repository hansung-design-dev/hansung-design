-- ⚠️ 임시: orders 테이블 트리거 비활성화
-- 함수 수정 전에 에러를 방지하기 위해 임시로 트리거 비활성화

ALTER TABLE orders DISABLE TRIGGER trigger_top_fixed_inventory_on_order;

-- 확인
SELECT 
  tgname as trigger_name,
  CASE tgenabled
    WHEN 'O' THEN '활성화됨'
    WHEN 'D' THEN '비활성화됨'
    ELSE '알 수 없음'
  END as status
FROM pg_trigger
WHERE tgrelid = (SELECT oid FROM pg_class WHERE relname = 'orders')
  AND tgname = 'trigger_top_fixed_inventory_on_order'
  AND NOT tgisinternal;

