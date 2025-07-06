-- Songpa-gu data insertion for PostgreSQL (Supabase)
-- This script is split into two parts.
-- Please run Part 1 first, wait for success, then run Part 2.

-- =================================================================
-- PART 1: Create the data insertion function
-- This part defines a function to insert banner data for Songpa-gu.
-- =================================================================
DROP FUNCTION IF EXISTS insert_songpa_banner;

CREATE OR REPLACE FUNCTION insert_songpa_banner(
    p_gu_id UUID,
    p_panel_code TEXT,
    p_nickname VARCHAR(255),
    p_address VARCHAR(255),
    p_region_dong_id UUID,
    p_banner_type banner_type_enum,
    p_total_price DECIMAL(10, 2),
    p_width DECIMAL(5, 2),
    p_height DECIMAL(5, 2),
    p_max_banners INT,
    p_price_unit price_unit_enum
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
        p_price_unit
    );
END;
$$ LANGUAGE plpgsql;


-- =================================================================
-- PART 2: Execute the function to insert data
-- =================================================================
DO $$
DECLARE
    v_songpa_gu_id UUID;
    v_songpa_gu_code TEXT;
    v_jamsil_dong_id UUID;
    v_bangi_dong_id UUID;
    v_munjeong_dong_id UUID;
    v_garak_dong_id UUID;
    v_jangji_dong_id UUID;
    v_geojeo_dong_id UUID;
    v_songpa_dong_id UUID;
BEGIN
    -- 0. Add '1 year' to price_unit_enum if it doesn't exist
    ALTER TYPE price_unit_enum ADD VALUE IF NOT EXISTS '1 year';

    -- 1. Get region_gu id and code for Songpa-gu
    SELECT id, code INTO v_songpa_gu_id, v_songpa_gu_code FROM region_gu WHERE name = '송파구' LIMIT 1;

    -- 2. Insert region_dong entries using district_code
    INSERT INTO region_dong (district_code, name) SELECT v_songpa_gu_code, '잠실동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '잠실동' AND district_code = v_songpa_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_songpa_gu_code, '방이동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '방이동' AND district_code = v_songpa_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_songpa_gu_code, '문정동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '문정동' AND district_code = v_songpa_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_songpa_gu_code, '가락동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '가락동' AND district_code = v_songpa_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_songpa_gu_code, '장지동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '장지동' AND district_code = v_songpa_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_songpa_gu_code, '거여동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '거여동' AND district_code = v_songpa_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_songpa_gu_code, '송파동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '송파동' AND district_code = v_songpa_gu_code);

    -- 3. Get region_dong_id variables (using district_code for accuracy)
    SELECT id INTO v_jamsil_dong_id FROM region_dong WHERE name = '잠실동' AND district_code = v_songpa_gu_code LIMIT 1;
    SELECT id INTO v_bangi_dong_id FROM region_dong WHERE name = '방이동' AND district_code = v_songpa_gu_code LIMIT 1;
    SELECT id INTO v_munjeong_dong_id FROM region_dong WHERE name = '문정동' AND district_code = v_songpa_gu_code LIMIT 1;
    SELECT id INTO v_garak_dong_id FROM region_dong WHERE name = '가락동' AND district_code = v_songpa_gu_code LIMIT 1;
    SELECT id INTO v_jangji_dong_id FROM region_dong WHERE name = '장지동' AND district_code = v_songpa_gu_code LIMIT 1;
    SELECT id INTO v_geojeo_dong_id FROM region_dong WHERE name = '거여동' AND district_code = v_songpa_gu_code LIMIT 1;
    SELECT id INTO v_songpa_dong_id FROM region_dong WHERE name = '송파동' AND district_code = v_songpa_gu_code LIMIT 1;

    -- 4. Call the function to insert data for 'no_lighting' billboards
    PERFORM insert_songpa_banner(v_songpa_gu_id, '1', '잠실종합운동장 사거리앞(실내체육관 방향)', '잠실동 10', v_jamsil_dong_id, 'no_lighting', 5000000, 500, 100, 5, '1 year');
    PERFORM insert_songpa_banner(v_songpa_gu_id, '2', '올림픽대교 남단사거리 앞(빗물펌프장)', '방이동 88-11', v_bangi_dong_id, 'no_lighting', 5000000, 500, 100, 5, '1 year');
    PERFORM insert_songpa_banner(v_songpa_gu_id, '3', '올림픽대교 남단사거리 앞(남단 유수지앞)', '방이동 88-13', v_bangi_dong_id, 'no_lighting', 5000000, 500, 100, 5, '1 year');
    PERFORM insert_songpa_banner(v_songpa_gu_id, '4', '풍납사거리 성내유수지리 앞', '방이동 88-13', v_bangi_dong_id, 'no_lighting', 5000000, 500, 100, 5, '1 year');
    PERFORM insert_songpa_banner(v_songpa_gu_id, '5', '올림픽공원 북2문 앞', '방이동 88-14', v_bangi_dong_id, 'no_lighting', 5000000, 500, 100, 5, '1 year');
    PERFORM insert_songpa_banner(v_songpa_gu_id, '6', '둔촌사거리 보성중고 앞', '방이동 89-22', v_bangi_dong_id, 'no_lighting', 5000000, 500, 100, 5, '1 year');
    PERFORM insert_songpa_banner(v_songpa_gu_id, '7', '서하남IC 사거리 앞', '방이동 433', v_bangi_dong_id, 'no_lighting', 5000000, 500, 100, 5, '1 year');
    PERFORM insert_songpa_banner(v_songpa_gu_id, '8', '오륜사거리 앞', '방이동 445', v_bangi_dong_id, 'no_lighting', 5000000, 500, 100, 5, '1 year');
    PERFORM insert_songpa_banner(v_songpa_gu_id, '9', '올림픽선수촌(아) 남문 앞', '방이동 449', v_bangi_dong_id, 'no_lighting', 5000000, 500, 100, 5, '1 year');
    PERFORM insert_songpa_banner(v_songpa_gu_id, '10', '가든파이브 글샘공원 앞', '문정동 625', v_munjeong_dong_id, 'no_lighting', 5000000, 500, 100, 5, '1 year');
    PERFORM insert_songpa_banner(v_songpa_gu_id, '11', '문정로데오거리 입구 앞', '가락동 102', v_garak_dong_id, 'no_lighting', 5000000, 500, 100, 5, '1 year');
    PERFORM insert_songpa_banner(v_songpa_gu_id, '12', '가든파이브 글샘공원 앞', '문정동 625', v_munjeong_dong_id, 'no_lighting', 5000000, 500, 100, 5, '1 year');
    PERFORM insert_songpa_banner(v_songpa_gu_id, '13', '장지교 사거리 앞', '장지동 640', v_jangji_dong_id, 'no_lighting', 5000000, 500, 100, 5, '1 year');
    PERFORM insert_songpa_banner(v_songpa_gu_id, '14', '가락시장역 7번출구', '문정동', v_munjeong_dong_id, 'no_lighting', 5000000, 500, 100, 5, '1 year');
    PERFORM insert_songpa_banner(v_songpa_gu_id, '15', '송파역 3번 출구 옆', '가락동', v_garak_dong_id, 'no_lighting', 5000000, 500, 100, 5, '1 year');
    PERFORM insert_songpa_banner(v_songpa_gu_id, '16', '법조단지 앞 사거리', '문정동', v_munjeong_dong_id, 'no_lighting', 5000000, 500, 100, 5, '1 year');
    PERFORM insert_songpa_banner(v_songpa_gu_id, '17', '장지교 사거리2', '장지동', v_jangji_dong_id, 'no_lighting', 5000000, 500, 100, 5, '1 year');
    PERFORM insert_songpa_banner(v_songpa_gu_id, '18', '거여동 사거리', '거여동', v_geojeo_dong_id, 'no_lighting', 5000000, 500, 100, 5, '1 year');
    PERFORM insert_songpa_banner(v_songpa_gu_id, '19', '송파역 2번 출구 옆', '송파동', v_songpa_dong_id, 'no_lighting', 5000000, 500, 100, 5, '1 year');
    PERFORM insert_songpa_banner(v_songpa_gu_id, '20', '둔촌사거리 보성중고 앞2', '방이동', v_bangi_dong_id, 'no_lighting', 5000000, 500, 100, 5, '1 year');

END $$; 

-- =================================================================
-- SCRIPT TO UPDATE SIZES FOR SONGPA-GU
-- =================================================================
-- Run this block to set the width and height for all Songpa-gu billboards.

DO $$
DECLARE
    v_songpa_gu_id UUID;
BEGIN
    -- Get the ID for Songpa-gu to scope the updates
    SELECT id INTO v_songpa_gu_id FROM region_gu WHERE name = '송파구' LIMIT 1;

    -- Update the width and height for all banner panels in Songpa-gu.
    UPDATE banner_panel_details
    SET 
        panel_width = 500,
        panel_height = 100
    WHERE 
        panel_info_id IN (SELECT id FROM panel_info WHERE region_gu_id = v_songpa_gu_id);

END $$; 