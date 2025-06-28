-- =================================================================
-- 마포구 저단형 데이터 삽입 (61-72번)
-- =================================================================

-- 마포구 저단형 데이터 삽입 함수 (이미 생성되어 있음)
-- CREATE OR REPLACE FUNCTION insert_mapo_lower_panel() 함수는 part1에서 이미 생성됨

-- =================================================================
-- 데이터 삽입 실행 (61-72번)
-- =================================================================
DO $$
DECLARE
    v_mapo_gu_id UUID;
    v_mapo_gu_code TEXT;
    v_seongsan1_dong_id UUID;
    v_seongsan2_dong_id UUID;
    v_sangam_dong_id UUID;
BEGIN
    -- 1. Get region_gu id and code for Mapo-gu
    SELECT id, code INTO v_mapo_gu_id, v_mapo_gu_code FROM region_gu WHERE name = '마포구' LIMIT 1;

    -- 2. Insert region_dong entries if not exists
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '성산1동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '성산1동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '성산2동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '성산2동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '상암동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '상암동' AND district_code = v_mapo_gu_code);

    -- 3. Get region_dong_id variables
    SELECT id INTO v_seongsan1_dong_id FROM region_dong WHERE name = '성산1동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_seongsan2_dong_id FROM region_dong WHERE name = '성산2동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_sangam_dong_id FROM region_dong WHERE name = '상암동' AND district_code = v_mapo_gu_code LIMIT 1;

    -- 4. Call the function to insert data for lower-panel billboards (61-72번)
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 61, 'B61.월드컵로 215 (마포구청 맞은 편) 구49', '성산동 월드컵로 215', v_seongsan1_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 62, 'B62.성산동 528-1 (마포농수산물시장 맞은편 삼거리)구51', '성산2동 528-1', v_seongsan2_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 63, 'B63.중동 65-1 (성산시영아파트 정문)구54', '성산2동 중동 65-1', v_seongsan2_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 64, 'B64.월드컵북로 183 (큰길어린이공원 근처)구55', '성산2동 월드컵북로 183', v_seongsan2_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 65, 'B65.월드컵북로 356 (서서울농협 하나로마트 앞)구61', '상암동 월드컵북로 356', v_sangam_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 66, 'B66.월드컵북로 356 (서서울농협 하나로마트 성암삼거리방향 횡단보도)구56', '상암동 월드컵북로 356', v_sangam_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 67, 'B67.상암산로1길 92 (월드컵파크7단지 교차로)구58', '상암동 상암산로1길 92', v_sangam_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 68, 'B68.상암산로1길 52 (월드컵파크5단지 교차로)구59', '상암동 상암산로1길 52', v_sangam_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 69, 'B69.월드컵로 365 (월드컵파크 3단지 309동앞 삼거리)구65', '상암동 월드컵로 365', v_sangam_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 70, 'B70.상암동MBC신사옥.SBS프리즘타워삼거리 (MBC횡단보도앞)구57', '상암동', v_sangam_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 71, 'B71.월드컵북로396 (YTN_CJ ENM누리꿈스퀘어.KFC횡단보도앞)구50', '상암동 월드컵북로 396', v_sangam_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 72, 'B72.상암산로76 (YTN스퀘어앞.올리브영 횡단보도앞)구73', '상암동 상암산로 76', v_sangam_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');

    RAISE NOTICE '마포구 저단형 61-72번 데이터 삽입 완료!';
END $$; 