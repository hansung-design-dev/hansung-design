-- =================================================================
-- 마포구 저단형 데이터 삽입 (46-60번)
-- =================================================================

-- 마포구 저단형 데이터 삽입 함수 (이미 생성되어 있음)
-- CREATE OR REPLACE FUNCTION insert_mapo_lower_panel() 함수는 part1에서 이미 생성됨

-- =================================================================
-- 데이터 삽입 실행 (46-60번)
-- =================================================================
DO $$
DECLARE
    v_mapo_gu_id UUID;
    v_mapo_gu_code TEXT;
    v_seogyo_dong_id UUID;
    v_yeonnam_dong_id UUID;
    v_mangwon_dong_id UUID;
    v_mangwon1_dong_id UUID;
    v_mangwon2_dong_id UUID;
    v_seongsan1_dong_id UUID;
    v_seongsan2_dong_id UUID;
BEGIN
    -- 1. Get region_gu id and code for Mapo-gu
    SELECT id, code INTO v_mapo_gu_id, v_mapo_gu_code FROM region_gu WHERE name = '마포구' LIMIT 1;

    -- 2. Insert region_dong entries if not exists
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '서교동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '서교동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '연남동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '연남동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '망원동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '망원동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '망원1동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '망원1동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '망원2동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '망원2동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '성산1동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '성산1동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '성산2동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '성산2동' AND district_code = v_mapo_gu_code);

    -- 3. Get region_dong_id variables
    SELECT id INTO v_seogyo_dong_id FROM region_dong WHERE name = '서교동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_yeonnam_dong_id FROM region_dong WHERE name = '연남동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_mangwon_dong_id FROM region_dong WHERE name = '망원동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_mangwon1_dong_id FROM region_dong WHERE name = '망원1동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_mangwon2_dong_id FROM region_dong WHERE name = '망원2동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_seongsan1_dong_id FROM region_dong WHERE name = '성산1동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_seongsan2_dong_id FROM region_dong WHERE name = '성산2동' AND district_code = v_mapo_gu_code LIMIT 1;

    -- 4. Call the function to insert data for lower-panel billboards (46-60번)
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 46, 'B46.서교동374-1 (현대자동차 서교지점앞)구45', '서교동 374-1', v_seogyo_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 47, 'B47.양화로 93 (서교사거리 우리은행 서교동지점 정문앞)구32', '서교동 양화로 93', v_seogyo_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 48, 'B48.동교동163-8 (홍대H&M앞)구13', '서교동 동교동 163-8', v_seogyo_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 49, 'B49.서교동 356-2 (나이키앞)구72', '서교동 356-2', v_seogyo_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 50, 'B50.마포구서교동 (홍익대학교 정문앞)구30', '서교동', v_seogyo_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 1, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 51, 'B51.연남로4 (연남파출소 맞은편)구29', '연남동 연남로 4', v_yeonnam_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 52, 'B52.성미산로29길 17-3 (은행나무어린이공원 좌측면. 주민센터 옆)구46', '연남동 성미산로29길 17-3', v_yeonnam_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 3, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 53, 'B53.동교로 79 맞은편 (성산초등학교 후문앞 펜스)구39', '망원동 동교로 79', v_mangwon_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 54, 'B54.월드컵로 59 (망원동 기업은행 옆)구43', '망원1동 월드컵로 59', v_mangwon1_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 55, 'B55.월드컵로 87 (망원동 하나은행 앞)구41', '망원1동 월드컵로 87', v_mangwon1_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 56, 'B56.월드컵로 125옆 (공영주차장 앞) 농협인근구64', '망원2동 월드컵로 125', v_mangwon2_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 57, 'B57.희우정로77 (망원어린이공원 횡단보도앞)이전 구60', '망원동 희우정로 77', v_mangwon_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 1, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 58, 'B58.월드컵로 166 (마포구청역4번출구방면-24시 가마솥순대국) 구48', '성산1동 월드컵로 166', v_seongsan1_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 59, 'B59.성산로2길 54 (마포구청역 3번출구)구47', '성산1동 성산로2길 54', v_seongsan1_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 60, 'B60.월드컵로 204 (마포구청 파리바게트앞)이전 구53', '성산동 월드컵로 204', v_seongsan1_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');

    RAISE NOTICE '마포구 저단형 46-60번 데이터 삽입 완료!';
END $$; 