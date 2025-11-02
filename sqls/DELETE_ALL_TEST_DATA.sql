-- ⚠️ 주의: 이 쿼리는 모든 주문 관련 데이터를 삭제합니다!
-- 외래키 제약조건 때문에 삭제 순서가 중요합니다.

-- 1. order_details 삭제 (가장 먼저)
DELETE FROM order_details;

-- 2. orders의 design_drafts_id를 NULL로 설정 (외래키 제약 해제)
UPDATE orders SET design_drafts_id = NULL WHERE design_drafts_id IS NOT NULL;

-- 3. orders 삭제
DELETE FROM orders;

-- 4. panel_slot_usage 삭제 (order_details와 연결된 것만)
-- 주의: 주문과 연결된 panel_slot_usage만 삭제합니다
DELETE FROM panel_slot_usage 
WHERE id IN (
  SELECT DISTINCT panel_slot_usage_id 
  FROM order_details 
  WHERE panel_slot_usage_id IS NOT NULL
);

-- 또는 모든 panel_slot_usage 삭제하려면 (더 강력한 방법)
-- DELETE FROM panel_slot_usage;

-- 5. design_drafts 삭제 (이제 orders와 연결이 끊어졌으므로 삭제 가능)
DELETE FROM design_drafts;

-- 확인: 삭제된 레코드 수 확인
SELECT 
  'order_details' as table_name,
  COUNT(*) as remaining_rows
FROM order_details
UNION ALL
SELECT 
  'orders',
  COUNT(*)
FROM orders
UNION ALL
SELECT 
  'design_drafts',
  COUNT(*)
FROM design_drafts
UNION ALL
SELECT 
  'panel_slot_usage',
  COUNT(*)
FROM panel_slot_usage;

