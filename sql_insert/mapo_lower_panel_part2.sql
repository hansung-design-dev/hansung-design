-- =================================================================
-- 마포구 저단형 데이터 삽입 (16-30번)
-- =================================================================

-- 마포구 저단형 데이터 삽입 함수 (이미 생성되어 있음)
-- CREATE OR REPLACE FUNCTION insert_mapo_lower_panel() 함수는 part1에서 이미 생성됨

-- =================================================================
-- 데이터 삽입 실행 (16-30번)
-- =================================================================
DO $$
DECLARE
    v_mapo_gu_id UUID;
    v_mapo_gu_code TEXT;
    v_dohwa_dong_id UUID;
    v_yonggang_dong_id UUID;
    v_yeomri_dong_id UUID;
    v_daeheung_dong_id UUID;
    v_nogosan_dong_id UUID;
    v_sinsu_dong_id UUID;
    v_seogang_dong_id UUID;
BEGIN
    -- 1. Get region_gu id and code for Mapo-gu
    SELECT id, code INTO v_mapo_gu_id, v_mapo_gu_code FROM region_gu WHERE name = '마포구' LIMIT 1;

    -- 2. Insert region_dong entries if not exists
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '도화동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '도화동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '용강동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '용강동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '염리동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '염리동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '대흥동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '대흥동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '노고산동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '노고산동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '신수동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '신수동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '서강동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '서강동' AND district_code = v_mapo_gu_code);

    -- 3. Get region_dong_id variables
    SELECT id INTO v_dohwa_dong_id FROM region_dong WHERE name = '도화동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_yonggang_dong_id FROM region_dong WHERE name = '용강동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_yeomri_dong_id FROM region_dong WHERE name = '염리동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_daeheung_dong_id FROM region_dong WHERE name = '대흥동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_nogosan_dong_id FROM region_dong WHERE name = '노고산동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_sinsu_dong_id FROM region_dong WHERE name = '신수동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_seogang_dong_id FROM region_dong WHERE name = '서강동' AND district_code = v_mapo_gu_code LIMIT 1;

    -- 4. Call the function to insert data for lower-panel billboards (16-30번)
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 16, 'B16.마포구 도화동 559 (가든호텔 건너편/트라팰리스C동대로변)구28', '도화동 559', v_dohwa_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 1, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 17, 'B17.토정로 31길 31 (용강동 주민센터 앞)구11', '용강동 토정로 31길 31', v_yonggang_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 3, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 18, 'B18.백범로 139 (동도중학교 정문 우측)구19', '염리동 백범로 139', v_yeomri_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 3, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 19, 'B19.대흥로20길 28 (마포아트센터 앞 보도휀스)소금나루도서관건너편 구18', '염리동 대흥로20길 28', v_yeomri_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 20, 'B20.숭문길 99 (숭문고등학교 앞, 마포아트센터 맞은편)구14', '대흥동 숭문길 99', v_daeheung_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 3, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 21, 'B21.백범로 91앞 (대흥역 1번출구)구15', '대흥동 백범로 91', v_daeheung_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 22, 'B22.대흥동 803 (경의선숲길 대로-동양엔파크아파트)구16', '대흥동 803', v_daeheung_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 23, 'B23.대흥로74 (경의선숲길 횡단보도앞)-2단형 구71', '대흥동 대흥로 74', v_daeheung_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 24, 'B24.백범로 35 (서강대학교우리은행 앞)구63', '대흥동 백범로 35', v_daeheung_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 3, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 25, 'B25.마포구노고산동(신촌역7번출구) 구67', '노고산동', v_nogosan_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 26, 'B26.노고산동57-62 (신촌역8번출구앞.이마트방면)구21', '노고산동 57-62', v_nogosan_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 27, 'B27.노고산동40-33 (신촌종로학원앞)구52', '노고산동 40-33', v_nogosan_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 28, 'B28.서강로110 (신촌연세병원 앞)구68', '신수동 서강로 110', v_sinsu_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 29, 'B29.독막로 192 (신수동주민센터 앞)구20', '신수동 독막로 192', v_sinsu_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 30, 'B30.서강로 51 (광흥창역 1번출구)구26', '서강동 서강로 51', v_seogang_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');

    RAISE NOTICE '마포구 저단형 16-30번 데이터 삽입 완료!';
END $$; 