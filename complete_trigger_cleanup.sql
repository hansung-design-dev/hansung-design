-- 1. 모든 관련 트리거 삭제
DROP TRIGGER IF EXISTS trigger_update_closure_quantity ON orders;
DROP TRIGGER IF EXISTS trigger_update_panel_quantity ON order_details;
DROP TRIGGER IF EXISTS trigger_update_order_metadata ON orders;
DROP TRIGGER IF EXISTS trigger_sync_max_banner ON banner_panel_details;

-- 2. 모든 관련 함수 삭제
DROP FUNCTION IF EXISTS update_closure_quantity_on_order();
DROP FUNCTION IF EXISTS update_panel_quantity();
DROP FUNCTION IF EXISTS update_order_metadata();
DROP FUNCTION IF EXISTS sync_max_banner_from_details();

-- 3. orders 테이블에서 panel_info_id 컬럼이 남아있다면 제거
ALTER TABLE orders DROP COLUMN IF EXISTS panel_info_id;
ALTER TABLE orders DROP COLUMN IF EXISTS panel_slot_usage_id;

-- 4. order_details 테이블에 필요한 컬럼들 추가
ALTER TABLE order_details ADD COLUMN IF NOT EXISTS panel_info_id UUID REFERENCES panel_info(id);
ALTER TABLE order_details ADD COLUMN IF NOT EXISTS panel_slot_usage_id UUID REFERENCES panel_slot_usage(id);
ALTER TABLE order_details ADD COLUMN IF NOT EXISTS half_period text CHECK (half_period IN ('first_half', 'second_half'));

-- 5. orders 테이블에 필요한 컬럼들 추가
ALTER TABLE orders ADD COLUMN IF NOT EXISTS half_period text CHECK (half_period IN ('first_half', 'second_half'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_profile_id UUID REFERENCES user_profiles(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_auth_id UUID REFERENCES user_auth(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS year_month varchar(7) NOT NULL DEFAULT '2025-01';

-- 6. 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_order_details_panel_info_id ON order_details(panel_info_id);
CREATE INDEX IF NOT EXISTS idx_order_details_panel_slot_usage_id ON order_details(panel_slot_usage_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_auth_id ON orders(user_auth_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_profile_id ON orders(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_orders_year_month ON orders(year_month);

-- 7. 현재 상태 확인
SELECT 'orders 테이블 컬럼:' as info;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'orders' ORDER BY ordinal_position;

SELECT 'order_details 테이블 컬럼:' as info;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'order_details' ORDER BY ordinal_position;

SELECT '남은 트리거:' as info;
SELECT trigger_name, event_object_table FROM information_schema.triggers WHERE event_object_table IN ('orders', 'order_details'); 