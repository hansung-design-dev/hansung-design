-- =================================================================
-- panel_slot_usage 테이블에 order_details_id 컬럼 추가
-- =================================================================

-- 1. panel_slot_usage 테이블에 order_details_id 컬럼 추가
ALTER TABLE panel_slot_usage 
ADD COLUMN IF NOT EXISTS order_details_id UUID REFERENCES order_details(id);

-- 2. 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_panel_slot_usage_order_details_id 
ON panel_slot_usage(order_details_id);

-- 3. 기존 데이터 확인 (order_details_id가 NULL인 레코드들)
SELECT 
    COUNT(*) as total_records,
    COUNT(order_details_id) as records_with_order_details_id,
    COUNT(*) - COUNT(order_details_id) as records_without_order_details_id
FROM panel_slot_usage;

-- 4. 결과 확인
SELECT 
    'panel_slot_usage' as table_name,
    COUNT(*) as total_records,
    COUNT(order_details_id) as records_with_order_details_id
FROM panel_slot_usage; 