-- Yongsan-gu data insertion for PostgreSQL (Supabase) - FINAL v8 (panel_code type corrected)
-- This script is split into two parts.
-- Please run Part 1 first, wait for success, then run Part 2.

-- =================================================================
-- PART 1: Create the data insertion function
-- This part is MODIFIED to handle panel_code as int2. Please run this part again.
-- =================================================================
DROP FUNCTION IF EXISTS insert_yongsan_banner;

CREATE OR REPLACE FUNCTION insert_yongsan_banner(
    p_gu_id UUID,
    p_panel_code TEXT,
    p_nickname VARCHAR(255),
    p_address VARCHAR(255),
    p_region_dong_id UUID,
    p_banner_type banner_type_enum,
    p_total_price DECIMAL(10, 2),
    p_width DECIMAL(5, 2),
    p_height DECIMAL(5, 2),
    p_max_banners INT
) RETURNS VOID AS $$
DECLARE
    new_panel_id UUID;
    v_display_type_id UUID;
BEGIN
    -- Get the display_type_id for 'banner_display'
    SELECT id INTO v_display_type_id FROM display_types WHERE name = 'banner_display' LIMIT 1;

    -- Step 1: Insert into panel_info (casting panel_code to int2)
    INSERT INTO panel_info (
        display_type_id,
        panel_code,
        region_gu_id,
        region_dong_id,
        address,
        nickname,
        panel_status
    )
    VALUES (
        v_display_type_id,
        p_panel_code::int2, -- Cast TEXT to int2
        p_gu_id,
        p_region_dong_id,
        p_address,
        p_nickname,
        'active'
    )
    RETURNING id INTO new_panel_id;

    -- Step 2: Insert into banner_panel_details
    INSERT INTO banner_panel_details (
        panel_info_id,
        max_banners,
        is_for_admin -- 상업용
    )
    VALUES (
        new_panel_id,
        p_max_banners,
        FALSE 
    );

    -- Step 3: Insert into banner_slot_info, assuming one primary slot per panel
    INSERT INTO banner_slot_info (
        panel_info_id,
        slot_number,
        max_width,
        max_height,
        total_price,
        banner_type,
        price_unit
    )
    VALUES (
        new_panel_id,
        1, -- Assuming slot #1 for each panel
        p_width,
        p_height,
        p_total_price,
        p_banner_type,
        '15 days' -- Using the only valid enum '15 days'. Price might not match unit.
    );
END;
$$ LANGUAGE plpgsql;


-- =================================================================
-- PART 2: Execute the function to insert data
-- This part is MODIFIED based on the correct schema. Please run this part again.
-- =================================================================
DO $$
DECLARE
    v_yongsan_gu_id UUID;
    v_yongsan_gu_code TEXT;
    v_ichon2_dong_id UUID;
    v_hangangro_dong_id UUID;
    v_ichon1_dong_id UUID;
    v_seobinggo_dong_id UUID;
    v_wonhyoro2_dong_id UUID;
    v_hannam_dong_id UUID;
    v_cheongpa_dong_id UUID;
    v_yongsan2ga_dong_id UUID;
    v_namyeong_dong_id UUID;
BEGIN
    -- 1. Get region_gu id and code for Yongsan-gu
    SELECT id, code INTO v_yongsan_gu_id, v_yongsan_gu_code FROM region_gu WHERE name = '용산구' LIMIT 1;

    -- 2. Insert region_dong entries using district_code
    INSERT INTO region_dong (district_code, name)
    SELECT v_yongsan_gu_code, '이촌제2동'
    WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '이촌제2동' AND district_code = v_yongsan_gu_code);

    INSERT INTO region_dong (district_code, name)
    SELECT v_yongsan_gu_code, '한강로동'
    WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '한강로동' AND district_code = v_yongsan_gu_code);

    INSERT INTO region_dong (district_code, name)
    SELECT v_yongsan_gu_code, '이촌제1동'
    WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '이촌제1동' AND district_code = v_yongsan_gu_code);

    INSERT INTO region_dong (district_code, name)
    SELECT v_yongsan_gu_code, '서빙고동'
    WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '서빙고동' AND district_code = v_yongsan_gu_code);

    INSERT INTO region_dong (district_code, name)
    SELECT v_yongsan_gu_code, '원효로제2동'
    WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '원효로제2동' AND district_code = v_yongsan_gu_code);

    INSERT INTO region_dong (district_code, name)
    SELECT v_yongsan_gu_code, '한남동'
    WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '한남동' AND district_code = v_yongsan_gu_code);

    INSERT INTO region_dong (district_code, name)
    SELECT v_yongsan_gu_code, '청파동'
    WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '청파동' AND district_code = v_yongsan_gu_code);

    INSERT INTO region_dong (district_code, name)
    SELECT v_yongsan_gu_code, '용산2가동'
    WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '용산2가동' AND district_code = v_yongsan_gu_code);

    INSERT INTO region_dong (district_code, name)
    SELECT v_yongsan_gu_code, '남영동'
    WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '남영동' AND district_code = v_yongsan_gu_code);

    -- 3. Get region_dong_id variables (using district_code for accuracy)
    SELECT id INTO v_ichon2_dong_id FROM region_dong WHERE name = '이촌제2동' AND district_code = v_yongsan_gu_code LIMIT 1;
    SELECT id INTO v_hangangro_dong_id FROM region_dong WHERE name = '한강로동' AND district_code = v_yongsan_gu_code LIMIT 1;
    SELECT id INTO v_ichon1_dong_id FROM region_dong WHERE name = '이촌제1동' AND district_code = v_yongsan_gu_code LIMIT 1;
    SELECT id INTO v_seobinggo_dong_id FROM region_dong WHERE name = '서빙고동' AND district_code = v_yongsan_gu_code LIMIT 1;
    SELECT id INTO v_wonhyoro2_dong_id FROM region_dong WHERE name = '원효로제2동' AND district_code = v_yongsan_gu_code LIMIT 1;
    SELECT id INTO v_hannam_dong_id FROM region_dong WHERE name = '한남동' AND district_code = v_yongsan_gu_code LIMIT 1;
    SELECT id INTO v_cheongpa_dong_id FROM region_dong WHERE name = '청파동' AND district_code = v_yongsan_gu_code LIMIT 1;
    SELECT id INTO v_yongsan2ga_dong_id FROM region_dong WHERE name = '용산2가동' AND district_code = v_yongsan_gu_code LIMIT 1;
    SELECT id INTO v_namyeong_dong_id FROM region_dong WHERE name = '남영동' AND district_code = v_yongsan_gu_code LIMIT 1;

    -- 4. Call the function to insert data for 'with_lighting' billboards
    PERFORM insert_yongsan_banner(v_yongsan_gu_id, '1', '성촌공원', '강변북로 전자상가IC', v_ichon2_dong_id, 'with_lighting', 6000000, 600, 100, 6);
    PERFORM insert_yongsan_banner(v_yongsan_gu_id, '2', '서부이촌동 우편집중국 앞', '이촌로 버스승강장옆', v_hangangro_dong_id, 'with_lighting', 6000000, 540, 66, 6);
    PERFORM insert_yongsan_banner(v_yongsan_gu_id, '3', '한강대교입구', '한강대로 한강대교 북단', v_ichon1_dong_id, 'with_lighting', 6000000, 600, 100, 6);
    PERFORM insert_yongsan_banner(v_yongsan_gu_id, '4', '동부이촌동', '이촌로 빌라맨션 앞', v_hangangro_dong_id, 'with_lighting', 6000000, 600, 100, 6);
    PERFORM insert_yongsan_banner(v_yongsan_gu_id, '5', '한강대교북단사거리', '한강로 트럼프월드아파트앞', v_ichon1_dong_id, 'with_lighting', 6000000, 600, 100, 6);
    PERFORM insert_yongsan_banner(v_yongsan_gu_id, '7', '한강중학교 앞 삼거리1', '국립중앙박물관 방향', v_seobinggo_dong_id, 'with_lighting', 6000000, 600, 100, 6);
    PERFORM insert_yongsan_banner(v_yongsan_gu_id, '8', '한강중학교 앞 삼거리2', '녹사평대로 용산구청 방향', v_seobinggo_dong_id, 'with_lighting', 6000000, 600, 100, 6);
    PERFORM insert_yongsan_banner(v_yongsan_gu_id, '9', '원효대교북단', '청파로 용산전자오피스텔 상가 앞', v_wonhyoro2_dong_id, 'with_lighting', 6000000, 600, 100, 6);
    PERFORM insert_yongsan_banner(v_yongsan_gu_id, '10', '북한남동', '이태원로 북한남 삼거리', v_hannam_dong_id, 'with_lighting', 6000000, 600, 100, 6);
    PERFORM insert_yongsan_banner(v_yongsan_gu_id, '16', '갈월동 숙대입구', '청파로 갈월동 지하차도 옆', v_cheongpa_dong_id, 'with_lighting', 6000000, 600, 100, 5);

    -- 5. Call the function to insert data for 'no_lighting' billboards
    PERFORM insert_yongsan_banner(v_yongsan_gu_id, '12', '경리단 앞 삼거리', '녹사평대로 중앙경리단 삼거리', v_yongsan2ga_dong_id, 'no_lighting', 6000000, 600, 100, 6);
    PERFORM insert_yongsan_banner(v_yongsan_gu_id, '13', '삼각지 육군회관 앞', '이태원로 지방보훈청 앞', v_hangangro_dong_id, 'no_lighting', 6000000, 540, 66, 6);
    PERFORM insert_yongsan_banner(v_yongsan_gu_id, '14', '서울역', '한강대로 게이트웨이타워 앞', v_namyeong_dong_id, 'no_lighting', 6000000, 600, 100, 6);
    PERFORM insert_yongsan_banner(v_yongsan_gu_id, '15', '서빙고역앞', '서빙고 지하차도 옆', v_seobinggo_dong_id, 'no_lighting', 6000000, 600, 100, 6);
    PERFORM insert_yongsan_banner(v_yongsan_gu_id, '18', '한남역앞 삼거리', '한남역앞 삼거리', v_hannam_dong_id, 'no_lighting', 6000000, 600, 100, 6);

END $$; 

-- =================================================================
-- SCRIPT TO FIX INCORRECTLY INSERTED DATA
-- =================================================================
-- Run this block ONLY ONCE to correct the data that was inserted using an old script.

-- NOTE: Before running the DO block below, you MUST run this command first
-- to allow '1 year' as a valid value for the price_unit.
-- ALTER TYPE price_unit_enum ADD VALUE IF NOT EXISTS '1 year';

DO $$
DECLARE
    v_yongsan_gu_id UUID;
BEGIN
    -- Get the ID for Yongsan-gu to scope the updates
    SELECT id INTO v_yongsan_gu_id FROM region_gu WHERE name = '용산구' LIMIT 1;

    -- Fix 1: Move the value from post_code to the correct panel_code column
    -- and set post_code to NULL as its value was incorrect.
    -- This assumes a 'panel_code' column has been added to the 'panel_info' table.
    UPDATE panel_info
    SET 
        panel_code = post_code::int2, -- Cast TEXT to int2
        post_code = NULL
    WHERE 
        region_gu_id = v_yongsan_gu_id AND post_code IS NOT NULL;

    -- Fix 2: Update the price_unit to '1 year' for the relevant slots.
    UPDATE banner_slot_info
    SET price_unit = '1 year'
    WHERE 
        panel_info_id IN (SELECT id FROM panel_info WHERE region_gu_id = v_yongsan_gu_id);

END $$;


