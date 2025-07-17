-- 현재 기간이 끝날 때 다음 기간을 자동 생성하는 함수들

-- 1. 상반기 기간이 끝날 때 다음달 상반기 생성
CREATE OR REPLACE FUNCTION generate_next_first_half_periods()
RETURNS void AS $$
DECLARE
    next_month_date DATE;
    next_year INTEGER;
    next_month INTEGER;
    display_type_record RECORD;
    region_record RECORD;
    target_year_month TEXT;
    mapo_next_month_5th DATE; -- 마포구 다음달 5일
BEGIN
    -- 다음달 날짜 계산
    next_month_date := (CURRENT_DATE + INTERVAL '1 month')::DATE;
    next_year := EXTRACT(YEAR FROM next_month_date);
    next_month := EXTRACT(MONTH FROM next_month_date);
    target_year_month := next_year || '년 ' || next_month || '월';
    
    -- 마포구용 다음달 5일 날짜 계산
    mapo_next_month_5th := (next_month_date + INTERVAL '4 days')::DATE;
    
    RAISE NOTICE '다음달 상반기 기간 자동 생성 시작: %', target_year_month;
    
    -- 배너 디스플레이만 처리 (LED는 전체 월 단위)
    FOR display_type_record IN 
        SELECT id, name FROM display_types 
        WHERE name = 'banner_display'
    LOOP
        -- 배너 디스플레이를 가진 구만 대상으로
        FOR region_record IN 
            SELECT DISTINCT rg.id, rg.name 
            FROM region_gu rg
            INNER JOIN panel_info pi ON rg.id = pi.region_gu_id
            WHERE rg.is_active = true 
              AND pi.display_type_id = display_type_record.id
              AND pi.panel_status = 'active'
        LOOP
            -- 마포구, 강북구 특별 처리: 5일-19일 상반기
            IF region_record.name IN ('마포구', '강북구') THEN
                INSERT INTO region_gu_display_periods (
                    display_type_id, 
                    region_gu_id, 
                    period_from, 
                    period_to, 
                    year_month, 
                    half_period
                )
                SELECT 
                    display_type_record.id,
                    region_record.id,
                    mapo_next_month_5th, -- 다음달 5일부터
                    (mapo_next_month_5th + INTERVAL '14 days')::DATE, -- 다음달 19일까지
                    target_year_month,
                    'first_half'
                WHERE NOT EXISTS (
                    SELECT 1 FROM region_gu_display_periods 
                    WHERE display_type_id = display_type_record.id
                      AND region_gu_id = region_record.id
                      AND year_month = target_year_month
                      AND half_period = 'first_half'
                );
            
            -- 송파, 관악, 용산, 서대문: 1일-15일 상반기
            ELSE
                INSERT INTO region_gu_display_periods (
                    display_type_id, 
                    region_gu_id, 
                    period_from, 
                    period_to, 
                    year_month, 
                    half_period
                )
                SELECT 
                    display_type_record.id,
                    region_record.id,
                    next_month_date, -- 다음달 1일부터
                    (next_month_date + INTERVAL '14 days')::DATE, -- 다음달 15일까지
                    target_year_month,
                    'first_half'
                WHERE NOT EXISTS (
                    SELECT 1 FROM region_gu_display_periods 
                    WHERE display_type_id = display_type_record.id
                      AND region_gu_id = region_record.id
                      AND year_month = target_year_month
                      AND half_period = 'first_half'
                );
            END IF;
            
            RAISE NOTICE '구 %에 % 타입 상반기 기간 데이터 생성 완료', 
                region_record.name, display_type_record.name;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE '다음달 상반기 기간 자동 생성 완료: %', target_year_month;
END;
$$ LANGUAGE plpgsql;

-- 2. 하반기 기간이 끝날 때 다음달 하반기 생성
CREATE OR REPLACE FUNCTION generate_next_second_half_periods()
RETURNS void AS $$
DECLARE
    next_month_date DATE;
    next_year INTEGER;
    next_month INTEGER;
    display_type_record RECORD;
    region_record RECORD;
    target_year_month TEXT;
    mapo_next_month_5th DATE; -- 마포구 다음달 5일
BEGIN
    -- 다음달 날짜 계산
    next_month_date := (CURRENT_DATE + INTERVAL '1 month')::DATE;
    next_year := EXTRACT(YEAR FROM next_month_date);
    next_month := EXTRACT(MONTH FROM next_month_date);
    target_year_month := next_year || '년 ' || next_month || '월';
    
    -- 마포구용 다음달 5일 날짜 계산
    mapo_next_month_5th := (next_month_date + INTERVAL '4 days')::DATE;
    
    RAISE NOTICE '다음달 하반기 기간 자동 생성 시작: %', target_year_month;
    
    -- 배너 디스플레이만 처리 (LED는 전체 월 단위)
    FOR display_type_record IN 
        SELECT id, name FROM display_types 
        WHERE name = 'banner_display'
    LOOP
        -- 배너 디스플레이를 가진 구만 대상으로
        FOR region_record IN 
            SELECT DISTINCT rg.id, rg.name 
            FROM region_gu rg
            INNER JOIN panel_info pi ON rg.id = pi.region_gu_id
            WHERE rg.is_active = true 
              AND pi.display_type_id = display_type_record.id
              AND pi.panel_status = 'active'
        LOOP
            -- 마포구, 강북구 특별 처리: 20일-다음달4일 하반기
            IF region_record.name IN ('마포구', '강북구') THEN
                INSERT INTO region_gu_display_periods (
                    display_type_id, 
                    region_gu_id, 
                    period_from, 
                    period_to, 
                    year_month, 
                    half_period
                )
                SELECT 
                    display_type_record.id,
                    region_record.id,
                    (next_month_date + INTERVAL '19 days')::DATE, -- 다음달 20일부터
                    (next_month_date + INTERVAL '1 month + 3 days')::DATE, -- 다음달 4일까지
                    target_year_month,
                    'second_half'
                WHERE NOT EXISTS (
                    SELECT 1 FROM region_gu_display_periods 
                    WHERE display_type_id = display_type_record.id
                      AND region_gu_id = region_record.id
                      AND year_month = target_year_month
                      AND half_period = 'second_half'
                );
            
            -- 송파, 관악, 용산, 서대문: 16일-31일 하반기
            ELSE
                INSERT INTO region_gu_display_periods (
                    display_type_id, 
                    region_gu_id, 
                    period_from, 
                    period_to, 
                    year_month, 
                    half_period
                )
                SELECT 
                    display_type_record.id,
                    region_record.id,
                    (next_month_date + INTERVAL '15 days')::DATE, -- 다음달 16일부터
                    (next_month_date + INTERVAL '1 month - 1 day')::DATE, -- 다음달 31일까지
                    target_year_month,
                    'second_half'
                WHERE NOT EXISTS (
                    SELECT 1 FROM region_gu_display_periods 
                    WHERE display_type_id = display_type_record.id
                      AND region_gu_id = region_record.id
                      AND year_month = target_year_month
                      AND half_period = 'second_half'
                );
            END IF;
            
            RAISE NOTICE '구 %에 % 타입 하반기 기간 데이터 생성 완료', 
                region_record.name, display_type_record.name;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE '다음달 하반기 기간 자동 생성 완료: %', target_year_month;
END;
$$ LANGUAGE plpgsql;

-- 3. LED 디스플레이용 전체 월 기간 생성 (매월 1일)
CREATE OR REPLACE FUNCTION generate_next_month_led_periods()
RETURNS void AS $$
DECLARE
    next_month_date DATE;
    next_year INTEGER;
    next_month INTEGER;
    region_record RECORD;
    target_year_month TEXT;
BEGIN
    -- 다음달 날짜 계산
    next_month_date := (CURRENT_DATE + INTERVAL '1 month')::DATE;
    next_year := EXTRACT(YEAR FROM next_month_date);
    next_month := EXTRACT(MONTH FROM next_month_date);
    target_year_month := next_year || '년 ' || next_month || '월';
    
    RAISE NOTICE '다음달 LED 기간 자동 생성 시작: %', target_year_month;
    
    -- LED 디스플레이 타입 ID 가져오기
    DECLARE
        led_display_type_id UUID;
    BEGIN
        SELECT id INTO led_display_type_id FROM display_types WHERE name = 'led_display';
        
        IF led_display_type_id IS NULL THEN
            RAISE EXCEPTION 'LED 디스플레이 타입을 찾을 수 없습니다.';
        END IF;
        
        -- LED 디스플레이를 가진 구만 대상으로
        FOR region_record IN 
            SELECT DISTINCT rg.id, rg.name 
            FROM region_gu rg
            INNER JOIN panel_info pi ON rg.id = pi.region_gu_id
            WHERE rg.is_active = true 
              AND pi.display_type_id = led_display_type_id
              AND pi.panel_status = 'active'
        LOOP
            -- LED는 모든 구 동일하게 전체 월 기간
            INSERT INTO region_gu_display_periods (
                display_type_id, 
                region_gu_id, 
                period_from, 
                period_to, 
                year_month, 
                half_period
            )
            SELECT 
                led_display_type_id,
                region_record.id,
                next_month_date,
                (next_month_date + INTERVAL '1 month - 1 day')::DATE,
                target_year_month,
                'full_month'
            WHERE NOT EXISTS (
                SELECT 1 FROM region_gu_display_periods 
                WHERE display_type_id = led_display_type_id
                  AND region_gu_id = region_record.id
                  AND year_month = target_year_month
                  AND half_period = 'full_month'
            );
            
            RAISE NOTICE '구 %에 LED 디스플레이 기간 데이터 생성 완료', region_record.name;
        END LOOP;
    END;
    
    RAISE NOTICE '다음달 LED 기간 자동 생성 완료: %', target_year_month;
END;
$$ LANGUAGE plpgsql;


-- 5. 통합 체크 함수 (더 효율적인 방식)
CREATE OR REPLACE FUNCTION check_and_generate_periods()
RETURNS void AS $$
DECLARE
    current_day INTEGER;
    last_day_of_month INTEGER;
    current_month INTEGER;
    current_year INTEGER;
BEGIN
    current_day := EXTRACT(DAY FROM CURRENT_DATE);
    current_month := EXTRACT(MONTH FROM CURRENT_DATE);
    current_year := EXTRACT(YEAR FROM CURRENT_DATE);
    last_day_of_month := EXTRACT(DAY FROM (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day'));
    
    RAISE NOTICE '기간 체크 시작: %년 %월 %일 (월말: %일)', current_year, current_month, current_day, last_day_of_month;
    
    -- 상반기 종료 체크 (15일)
    IF current_day = 15 THEN
        RAISE NOTICE '상반기 종료 감지 - 다음달 상반기 생성 시작';
        PERFORM generate_next_first_half_periods();
    END IF;
    
    -- 하반기 종료 체크
    -- 일반 구: 월말, 마포구: 다음달 4일
    IF current_day = last_day_of_month THEN
        RAISE NOTICE '일반 구 하반기 종료 감지 - 다음달 하반기 생성 시작';
        PERFORM generate_next_second_half_periods();
    ELSIF current_day = 4 THEN
        RAISE NOTICE '마포구 하반기 종료 감지 - 다음달 하반기 생성 시작';
        PERFORM generate_next_second_half_periods();
    END IF;
    
    -- LED 디스플레이: 매월 1일 생성
    IF current_day = 1 THEN
        RAISE NOTICE '새로운 월 시작 - LED 기간 생성 시작';
        PERFORM generate_next_month_led_periods();
    END IF;
    
    RAISE NOTICE '기간 체크 완료';
END;
$$ LANGUAGE plpgsql;


-- 4. 수동으로 다음달 기간 생성하는 함수 (관리자용)
CREATE OR REPLACE FUNCTION generate_specific_month_periods(target_year INTEGER, target_month INTEGER)
RETURNS void AS $$
DECLARE
    target_date DATE;
    target_year_month TEXT;
    display_type_record RECORD;
    region_record RECORD;
BEGIN
    -- 대상 월 날짜 계산
    target_date := (target_year || '-' || target_month || '-01')::DATE;
    target_year_month := target_year || '년 ' || target_month || '월';
    
    RAISE NOTICE '대상 월 기간 생성 시작: %', target_year_month;
    
    -- 각 display_type에 대해
    FOR display_type_record IN 
        SELECT id, name FROM display_types 
        WHERE name IN ('banner_display', 'led_display')
    LOOP
        -- 해당 디스플레이 타입을 가진 구만 대상으로
        FOR region_record IN 
            SELECT DISTINCT rg.id, rg.name 
            FROM region_gu rg
            INNER JOIN panel_info pi ON rg.id = pi.region_gu_id
            WHERE rg.is_active = true 
              AND pi.display_type_id = display_type_record.id
              AND pi.panel_status = 'active'
        LOOP
            -- 상반기 기간 데이터 생성 (중복 방지)
            INSERT INTO region_gu_display_periods (
                display_type_id, 
                region_gu_id, 
                period_from, 
                period_to, 
                year_month, 
                half_period
            )
            SELECT 
                display_type_record.id,
                region_record.id,
                target_date,
                (target_date + INTERVAL '1 month - 1 day')::DATE,
                target_year_month,
                'first_half'
            WHERE NOT EXISTS (
                SELECT 1 FROM region_gu_display_periods 
                WHERE display_type_id = display_type_record.id
                  AND region_gu_id = region_record.id
                  AND year_month = target_year_month
                  AND half_period = 'first_half'
            );
            
            -- 하반기 기간 데이터 생성 (중복 방지)
            INSERT INTO region_gu_display_periods (
                display_type_id, 
                region_gu_id, 
                period_from, 
                period_to, 
                year_month, 
                half_period
            )
            SELECT 
                display_type_record.id,
                region_record.id,
                target_date,
                (target_date + INTERVAL '1 month - 1 day')::DATE,
                target_year_month,
                'second_half'
            WHERE NOT EXISTS (
                SELECT 1 FROM region_gu_display_periods 
                WHERE display_type_id = display_type_record.id
                  AND region_gu_id = region_record.id
                  AND year_month = target_year_month
                  AND half_period = 'second_half'
            );
            
            RAISE NOTICE '구 %에 % 타입 기간 데이터 생성 완료', 
                region_record.name, display_type_record.name;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE '대상 월 기간 생성 완료: %', target_year_month;
END;
$$ LANGUAGE plpgsql;

-- 5. 기간 데이터 확인 함수
CREATE OR REPLACE FUNCTION check_period_data(target_year_month TEXT DEFAULT NULL)
RETURNS TABLE (
    district TEXT,
    display_type TEXT,
    year_month TEXT,
    half_period TEXT,
    period_from DATE,
    period_to DATE,
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rg.name as district,
        dt.name as display_type,
        rgdp.year_month,
        rgdp.half_period,
        rgdp.period_from,
        rgdp.period_to,
        rgdp.created_at
    FROM region_gu_display_periods rgdp
    JOIN region_gu rg ON rgdp.region_gu_id = rg.id
    JOIN display_types dt ON rgdp.display_type_id = dt.id
    WHERE (target_year_month IS NULL OR rgdp.year_month = target_year_month)
    ORDER BY rg.name, dt.name, rgdp.year_month, rgdp.half_period;
END;
$$ LANGUAGE plpgsql;

-- 사용 예시:
-- SELECT * FROM check_period_data('2025년 8월');
-- SELECT * FROM check_period_data(); -- 모든 기간 데이터 확인 