-- 1. orders 테이블에서 panel_slot_usage_id 컬럼 제거
ALTER TABLE orders DROP COLUMN IF EXISTS panel_slot_usage_id;

-- 2. order_details 테이블에 panel_slot_usage_id 컬럼 추가
ALTER TABLE order_details ADD COLUMN IF NOT EXISTS panel_slot_usage_id INTEGER REFERENCES panel_slot_usage(id); 