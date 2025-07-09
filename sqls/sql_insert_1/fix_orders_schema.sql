-- orders 테이블에서 panel_info_id와 panel_slot_usage_id 컬럼 제거
ALTER TABLE orders DROP COLUMN IF EXISTS panel_info_id;
ALTER TABLE orders DROP COLUMN IF EXISTS panel_slot_usage_id;

-- order_details 테이블에 panel_info_id와 panel_slot_usage_id 컬럼 추가 (이미 있으면 무시)
ALTER TABLE order_details ADD COLUMN IF NOT EXISTS panel_info_id UUID REFERENCES panel_info(id);
ALTER TABLE order_details ADD COLUMN IF NOT EXISTS panel_slot_usage_id UUID REFERENCES panel_slot_usage(id);

-- order_details 테이블에 half_period 컬럼 추가 (이미 있으면 무시)
ALTER TABLE order_details ADD COLUMN IF NOT EXISTS half_period text CHECK (half_period IN ('first_half', 'second_half'));

-- orders 테이블에 half_period 컬럼 추가 (이미 있으면 무시)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS half_period text CHECK (half_period IN ('first_half', 'second_half'));

-- orders 테이블에 user_profile_id 컬럼 추가 (이미 있으면 무시)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_profile_id UUID REFERENCES user_profiles(id);

-- orders 테이블에 user_auth_id 컬럼 추가 (이미 있으면 무시)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_auth_id UUID REFERENCES user_auth(id);

-- orders 테이블에 year_month 컬럼 추가 (이미 있으면 무시)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS year_month varchar(7) NOT NULL DEFAULT '2025-01';

-- 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_order_details_panel_info_id ON order_details(panel_info_id);
CREATE INDEX IF NOT EXISTS idx_order_details_panel_slot_usage_id ON order_details(panel_slot_usage_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_auth_id ON orders(user_auth_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_profile_id ON orders(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_orders_year_month ON orders(year_month); 