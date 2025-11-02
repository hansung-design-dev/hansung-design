-- 🔒 안전한 테스트 데이터 삭제 (특정 기간/조건만 삭제)

-- 1. 최근 생성된 order_details만 삭제
DELETE FROM order_details
WHERE created_at >= NOW() - INTERVAL '1 day'
  OR created_at IS NULL;

-- 2. 연결된 orders 삭제 (order_details가 없는 orders)
DELETE FROM orders
WHERE id NOT IN (
  SELECT DISTINCT order_id 
  FROM order_details 
  WHERE order_id IS NOT NULL
)
OR created_at >= NOW() - INTERVAL '1 day';

-- 3. 연결된 design_drafts 삭제 (orders가 없는 design_drafts)
DELETE FROM design_drafts
WHERE id NOT IN (
  SELECT DISTINCT design_drafts_id 
  FROM orders 
  WHERE design_drafts_id IS NOT NULL
);

-- 4. 연결된 panel_slot_usage 삭제 (order_details와 연결된 것만)
DELETE FROM panel_slot_usage
WHERE id IN (
  SELECT DISTINCT panel_slot_usage_id 
  FROM order_details 
  WHERE panel_slot_usage_id IS NOT NULL
);

