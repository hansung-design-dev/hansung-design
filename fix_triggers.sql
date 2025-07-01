-- 기존 트리거들 삭제 (panel_info_id를 참조하는 트리거들)
DROP TRIGGER IF EXISTS trigger_update_closure_quantity ON orders;
DROP TRIGGER IF EXISTS trigger_update_panel_quantity ON order_details;
DROP FUNCTION IF EXISTS update_closure_quantity_on_order();
DROP FUNCTION IF EXISTS update_panel_quantity();

-- 새로운 트리거 함수 생성 (order_details에서 panel_info_id를 가져오도록 수정)
CREATE OR REPLACE FUNCTION update_panel_quantity()
RETURNS TRIGGER AS $$
DECLARE
    panel_max_banner INTEGER;
    current_first_half INTEGER;
    current_second_half INTEGER;
    display_start_date DATE;
    display_month INTEGER;
    display_year INTEGER;
    is_first_half BOOLEAN;
    period_settings RECORD;
BEGIN
    -- 주문에서 선택한 게시 시작 날짜 사용
    display_start_date := NEW.display_start_date;
    display_month := EXTRACT(MONTH FROM display_start_date);
    display_year := EXTRACT(YEAR FROM display_start_date);
    
    -- panel_info_id가 없으면 처리하지 않음
    IF NEW.panel_info_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- 해당 패널의 기간 설정 조회
    SELECT * INTO period_settings
    FROM panel_period_settings
    WHERE panel_info_id = NEW.panel_info_id;
    
    -- 기간 설정이 없으면 기본값 사용 (1-15일 / 16-31일)
    IF period_settings IS NULL THEN
        is_first_half := EXTRACT(DAY FROM display_start_date) BETWEEN 1 AND 15;
    ELSE
        -- 패널별 설정에 따라 상반기/하반기 판단
        IF period_settings.second_half_start_day > period_settings.first_half_end_day THEN
            -- 일반적인 경우 (예: 1-15일, 16-31일)
            is_first_half := EXTRACT(DAY FROM display_start_date) BETWEEN period_settings.first_half_start_day AND period_settings.first_half_end_day;
        ELSE
            -- 월을 넘어가는 경우 (예: 21일-다음달 4일)
            is_first_half := EXTRACT(DAY FROM display_start_date) BETWEEN period_settings.first_half_start_day AND period_settings.first_half_end_day;
        END IF;
    END IF;
    
    -- 해당 패널의 정보 조회
    SELECT max_banner, first_half_closure_quantity, second_half_closure_quantity
    INTO panel_max_banner, current_first_half, current_second_half
    FROM panel_info
    WHERE id = NEW.panel_info_id;
    
    -- NULL 값 처리
    panel_max_banner := COALESCE(panel_max_banner, 0);
    current_first_half := COALESCE(current_first_half, 0);
    current_second_half := COALESCE(current_second_half, 0);
    
    -- 상반기/하반기 판단 및 수량 업데이트
    IF is_first_half THEN
        -- 상반기 구매
        IF current_first_half < panel_max_banner THEN
            UPDATE panel_info 
            SET first_half_closure_quantity = current_first_half + NEW.slot_order_quantity
            WHERE id = NEW.panel_info_id;
            
            RAISE NOTICE '상반기 구매: 패널 %, 수량 %, 게시기간: %년 %월', 
                NEW.panel_info_id, NEW.slot_order_quantity, display_year, display_month;
        ELSE
            RAISE EXCEPTION '상반기가 가득 찼습니다. (max_banner: %, current: %)', 
                panel_max_banner, current_first_half;
        END IF;
    ELSE
        -- 하반기 구매
        IF current_second_half < panel_max_banner THEN
            UPDATE panel_info 
            SET second_half_closure_quantity = current_second_half + NEW.slot_order_quantity
            WHERE id = NEW.panel_info_id;
            
            RAISE NOTICE '하반기 구매: 패널 %, 수량 %, 게시기간: %년 %월', 
                NEW.panel_info_id, NEW.slot_order_quantity, display_year, display_month;
        ELSE
            RAISE EXCEPTION '하반기가 가득 찼습니다. (max_banner: %, current: %)', 
                panel_max_banner, current_second_half;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- order_details 테이블에 새로운 트리거 생성
CREATE TRIGGER trigger_update_panel_quantity
    AFTER INSERT ON order_details
    FOR EACH ROW
    EXECUTE FUNCTION update_panel_quantity();

-- orders 테이블용 새로운 트리거 함수 (panel_info_id 없이)
CREATE OR REPLACE FUNCTION update_order_metadata()
RETURNS TRIGGER AS $$
DECLARE
    current_year_month varchar(7);
BEGIN
    -- 현재 년월 계산 (YYYY-MM 형식)
    current_year_month := to_char(NOW(), 'YYYY-MM');
    
    -- year_month 설정
    NEW.year_month := current_year_month;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- orders 테이블에 새로운 트리거 생성
CREATE TRIGGER trigger_update_order_metadata
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_order_metadata(); 