-- panel_slot_usage 테이블에 order_details_id 컬럼 추가
ALTER TABLE panel_slot_usage 
ADD COLUMN order_details_id UUID REFERENCES order_details(id);

-- 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_panel_slot_usage_order_details_id 
ON panel_slot_usage(order_details_id);

-- 기존 데이터 확인
SELECT 
  COUNT(*) as total_records,
  COUNT(order_details_id) as records_with_order_details_id
FROM panel_slot_usage; 