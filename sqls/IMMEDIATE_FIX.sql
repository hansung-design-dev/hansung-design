-- ⚠️ 즉시 해결: 문제가 될 수 있는 트리거 비활성화
-- 이것들을 하나씩 실행하고 주문을 시도해보세요

-- 방법 1: slot_inventory_insert_trigger 비활성화 (가장 의심되는 트리거)
ALTER TABLE order_details DISABLE TRIGGER slot_inventory_insert_trigger;

-- 주문 시도 → 에러가 사라지면 이 트리거가 문제
-- 에러가 계속되면 다음 트리거도 비활성화:

-- 방법 2: 모든 재고 관련 트리거를 임시로 비활성화하고 하나씩 활성화
-- ALTER TABLE order_details DISABLE TRIGGER slot_inventory_insert_trigger;
-- ALTER TABLE order_details DISABLE TRIGGER banner_inventory_insert_trigger;
-- ALTER TABLE order_details DISABLE TRIGGER inventory_check_trigger;

-- 그 다음 하나씩 활성화하며 테스트:
-- ALTER TABLE order_details ENABLE TRIGGER banner_inventory_insert_trigger;
-- (주문 시도)

-- 방법 3: Supabase에서 실제 함수 코드를 다시 확인
SELECT 
  proname,
  LEFT(prosrc, 1000) as first_1000_chars  -- 처음 1000자만 확인
FROM pg_proc
WHERE proname IN (
  'update_banner_slot_inventory_on_order',
  'update_slot_inventory_on_order'
)
ORDER BY proname;

