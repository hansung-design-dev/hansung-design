-- =================================================================
-- 마포구 저단형 데이터 삽입 (31-45번)
-- =================================================================

-- 마포구 저단형 데이터 삽입 함수 (이미 생성되어 있음)
-- CREATE OR REPLACE FUNCTION insert_mapo_lower_panel() 함수는 part1에서 이미 생성됨

-- =================================================================
-- 데이터 삽입 실행 (31-45번)
-- =================================================================
DO $$
DECLARE
    v_mapo_gu_id UUID;
    v_mapo_gu_code TEXT;
    v_seogang_dong_id UUID;
    v_hapjeong_dong_id UUID;
    v_donggyo_dong_id UUID;
    v_seogyo_dong_id UUID;
BEGIN
    -- 1. Get region_gu id and code for Mapo-gu
    SELECT id, code INTO v_mapo_gu_id, v_mapo_gu_code FROM region_gu WHERE name = '마포구' LIMIT 1;

    -- 2. Insert region_dong entries if not exists
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '서강동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '서강동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '합정동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '합정동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '동교동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '동교동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '서교동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '서교동' AND district_code = v_mapo_gu_code);

    -- 3. Get region_dong_id variables
    SELECT id INTO v_seogang_dong_id FROM region_dong WHERE name = '서강동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_hapjeong_dong_id FROM region_dong WHERE name = '합정동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_donggyo_dong_id FROM region_dong WHERE name = '동교동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_seogyo_dong_id FROM region_dong WHERE name = '서교동' AND district_code = v_mapo_gu_code LIMIT 1;

    -- 4. Call the function to insert data for lower-panel billboards (31-45번)
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 31, 'B31.창전로 60 (광흥창역 3번 출구)구27', '서강동 창전로 60', v_seogang_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 32, 'B32.독막로83 (상수역1번출구 안경공장앞)구70', '서강동 독막로 83', v_seogang_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 33, 'B33.월드컵로5길 11 (합정동주민센터앞 횡단보도)구23', '합정동 월드컵로5길 11', v_hapjeong_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 3, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 34, 'B34.월드컵로1길 14 (마포한강푸르지오1차아파트 부근)합정역8번출구 구36', '합정동 월드컵로1길 14', v_hapjeong_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 3, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 35, 'B35.독막로 5 (합정역6번출구)구40', '합정동 독막로 5', v_hapjeong_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 1, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 36, 'B36.독막로 4 (합정역7번출구)구30', '합정동 독막로 4', v_hapjeong_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 37, 'B37.신촌로10 (LG BEST SHOP)앞 구34', '동교동 신촌로 10', v_donggyo_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 38, 'B38.양화로191 (홍대AK백화점 건너편 광명약국앞)구24', '동교동 양화로 191', v_donggyo_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 3, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 39, 'B39.양화로18길3 (홍대입구8번출구자전거대여소앞.삼성프라자건너편)구38', '동교동 양화로18길 3', v_donggyo_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 40, 'B40.양화로165 (홍대입구역2번출구앞)구69', '동교동 양화로 165', v_donggyo_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 41, 'B41.양화로 162 (카카오프랜즈,무신사앞)구42', '동교동 양화로 162', v_donggyo_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 42, 'B42.양화로141 (홍대입구사거리 라인프랜즈앞)구25', '동교동 양화로 141', v_donggyo_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 43, 'B43.마포구 서교동353-1 (서교타워 파파이스앞)구44', '서교동 353-1', v_seogyo_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 44, 'B44.양화로 133 (서교타워 홍대입구사거리)구33', '서교동 양화로 133', v_seogyo_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 45, 'B45.월드컵북로 13 (투썸플래이스 홍대서교점앞)구31', '서교동 월드컵북로 13', v_seogyo_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');

    RAISE NOTICE '마포구 저단형 31-45번 데이터 삽입 완료!';
END $$; 