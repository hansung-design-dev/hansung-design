-- 1. panel_info 테이블에 max_banner, first_half_closure_quantity, second_half_closure_quantity 컬럼 추가
ALTER TABLE panel_info 
ADD COLUMN max_banner integer DEFAULT 1,
ADD COLUMN first_half_closure_quantity integer DEFAULT 0,
ADD COLUMN second_half_closure_quantity integer DEFAULT 0;

-- 2. region_gu_display_periods 테이블에 year_month 컬럼 추가 (분기별 데이터 관리)
ALTER TABLE region_gu_display_periods 
ADD COLUMN year_month varchar(7) NOT NULL DEFAULT '2025-06'; -- YYYY-MM 형식

-- 3. banner_slot_info에서 first_half_closure_quantity, second_half_closure_quantity 컬럼 제거
ALTER TABLE banner_slot_info 
DROP COLUMN IF EXISTS first_half_closure_quantity,
DROP COLUMN IF EXISTS second_half_closure_quantity;

-- 4. banner_panel_details의 max_banners를 panel_info의 max_banner로 복사하는 함수 생성
CREATE OR REPLACE FUNCTION sync_max_banner_from_details()
RETURNS TRIGGER AS $$
BEGIN
    -- banner_panel_details에서 max_banners 값을 panel_info의 max_banner로 업데이트
    UPDATE panel_info 
    SET max_banner = NEW.max_banners
    WHERE id = NEW.panel_info_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. banner_panel_details 테이블에 트리거 추가
CREATE TRIGGER trigger_sync_max_banner
    AFTER INSERT OR UPDATE ON banner_panel_details
    FOR EACH ROW
    EXECUTE FUNCTION sync_max_banner_from_details();

-- 6. 기존 banner_panel_details 데이터를 panel_info로 동기화
UPDATE panel_info 
SET max_banner = bpd.max_banners
FROM banner_panel_details bpd
WHERE panel_info.id = bpd.panel_info_id;

-- 7. orders 테이블에 user_auth_id 컬럼 추가 (실제 사용자 ID 연결)
ALTER TABLE orders 
ADD COLUMN user_auth_id uuid DEFAULT '00000000-0000-0000-0000-000000000000';

-- 8. orders 테이블에 year_month 컬럼 추가 (분기별 주문 관리)
ALTER TABLE orders 
ADD COLUMN year_month varchar(7) NOT NULL DEFAULT '2025-06';

-- 9. 주문 생성 시 panel_info의 closure_quantity를 업데이트하는 함수
CREATE OR REPLACE FUNCTION update_closure_quantity_on_order()
RETURNS TRIGGER AS $$
DECLARE
    panel_record record;
    current_year_month varchar(7);
    is_first_half boolean;
BEGIN
    -- 현재 년월 계산 (YYYY-MM 형식)
    current_year_month := to_char(NOW(), 'YYYY-MM');
    
    -- panel_info 정보 가져오기
    SELECT * INTO panel_record 
    FROM panel_info 
    WHERE id = NEW.panel_info_id;
    
    -- 상반기/하반기 판단 (1-6월: 상반기, 7-12월: 하반기)
    is_first_half := EXTRACT(MONTH FROM NOW()) <= 6;
    
    -- 해당 분기의 closure_quantity 업데이트
    IF is_first_half THEN
        UPDATE panel_info 
        SET first_half_closure_quantity = first_half_closure_quantity + 1
        WHERE id = NEW.panel_info_id;
    ELSE
        UPDATE panel_info 
        SET second_half_closure_quantity = second_half_closure_quantity + 1
        WHERE id = NEW.panel_info_id;
    END IF;
    
    -- year_month 설정
    NEW.year_month := current_year_month;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. orders 테이블에 트리거 추가
CREATE TRIGGER trigger_update_closure_quantity
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_closure_quantity_on_order();

-- 11. 인덱스 추가 (성능 최적화)
CREATE INDEX idx_orders_user_auth_id ON orders(user_auth_id);
CREATE INDEX idx_orders_year_month ON orders(year_month);
CREATE INDEX idx_region_gu_display_periods_year_month ON region_gu_display_periods(year_month);

-- 12. 기존 데이터에 year_month 설정 (2025년 6월로 가정)
UPDATE orders SET year_month = '2025-06' WHERE year_month IS NULL;
UPDATE region_gu_display_periods SET year_month = '2025-06' WHERE year_month IS NULL;

-- 13. 확인용 쿼리
SELECT 
    'panel_info 업데이트 확인' as check_type,
    COUNT(*) as total_panels,
    SUM(max_banner) as total_max_banners,
    SUM(first_half_closure_quantity) as total_first_half_closed,
    SUM(second_half_closure_quantity) as total_second_half_closed
FROM panel_info;

-- orders 테이블에 order_number 컬럼 추가
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number VARCHAR(20);

-- 기존 주문들에 대한 주문번호 생성 (YYYYMMDD + 4자리 순번)
UPDATE orders 
SET order_number = CONCAT(
  TO_CHAR(created_at, 'YYYYMMDD'),
  LPAD(ROW_NUMBER() OVER (PARTITION BY DATE(created_at) ORDER BY created_at)::TEXT, 4, '0')
)
WHERE order_number IS NULL;

-- order_number 컬럼을 NOT NULL로 설정
ALTER TABLE orders ALTER COLUMN order_number SET NOT NULL;

-- order_number에 인덱스 추가 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number); 