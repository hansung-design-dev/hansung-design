-- Mapo-gu lower-panel data insertion for PostgreSQL (Supabase)
-- This script is split into two parts.
-- Please run Part 1 first, wait for success, then run Part 2.

-- =================================================================
-- PART 1: Create the data insertion function
-- This part defines a function to insert lower-panel data for Mapo-gu.
-- =================================================================
DROP FUNCTION IF EXISTS insert_mapo_lower_panel;

CREATE OR REPLACE FUNCTION insert_mapo_lower_panel(
    p_gu_id UUID,
    p_panel_code INTEGER,
    p_nickname VARCHAR(255),
    p_address VARCHAR(255),
    p_region_dong_id UUID,
    p_banner_type banner_type_enum,
    p_total_price DECIMAL(10, 2),
    p_tax_price DECIMAL(10, 2),
    p_advertising_fee DECIMAL(10, 2),
    p_road_usage_fee DECIMAL(10, 2),
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

    -- Step 1: Insert into panel_info
    INSERT INTO panel_info (
        display_type_id,
        panel_code,
        region_gu_id,
        region_dong_id,
        address,
        nickname,
        panel_status,
        panel_type
    )
    VALUES (
        v_display_type_id,
        p_panel_code,
        p_gu_id,
        p_region_dong_id,
        p_address,
        p_nickname,
        'active',
        'lower-panel'
    )
    RETURNING id INTO new_panel_id;

    -- Step 2: Insert into banner_panel_details
    INSERT INTO banner_panel_details (
        panel_info_id,
        max_banners,
        panel_width,
        panel_height,
        is_for_admin -- 상업용
    )
    VALUES (
        new_panel_id,
        p_max_banners,
        p_width,
        p_height,
        FALSE 
    );

    -- Step 3: Insert into banner_slot_info, creating multiple slots per panel
    FOR slot_num IN 1..p_max_banners LOOP
        INSERT INTO banner_slot_info (
            panel_info_id,
            slot_number,
            max_width,
            max_height,
            total_price,
            tax_price,
            advertising_fee,
            road_usage_fee,
            banner_type,
            price_unit
        )
        VALUES (
            new_panel_id,
            slot_num,
            p_width,
            p_height,
            p_total_price,
            p_tax_price,
            p_advertising_fee,
            p_road_usage_fee,
            p_banner_type,
            p_price_unit
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;


-- =================================================================
-- PART 2: Execute the function to insert data
-- =================================================================
DO $$
DECLARE
    v_mapo_gu_id UUID;
    v_mapo_gu_code TEXT;
    v_seogyo_dong_id UUID;
    v_ahyeon_dong_id UUID;
    v_gongdeok_dong_id UUID;
    v_sinsu_dong_id UUID;
    v_sangsan_dong_id UUID;
    v_donggyo_dong_id UUID;
    v_hapjeong_dong_id UUID;
    v_changjeon_dong_id UUID;
    v_mapo_dong_id UUID;
    v_mangwon_dong_id UUID;
BEGIN
    -- 1. Get region_gu id and code for Mapo-gu
    SELECT id, code INTO v_mapo_gu_id, v_mapo_gu_code FROM region_gu WHERE name = '마포구' LIMIT 1;

    -- 2. Insert region_dong entries using district_code (if not already exists)
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '서교동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '서교동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '아현동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '아현동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '공덕동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '공덕동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '신수동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '신수동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '성산동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '성산동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '동교동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '동교동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '합정동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '합정동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '창전동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '창전동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '마포동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '마포동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '망원동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '망원동' AND district_code = v_mapo_gu_code);

    -- 3. Get region_dong_id variables (using district_code for accuracy)
    SELECT id INTO v_seogyo_dong_id FROM region_dong WHERE name = '서교동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_ahyeon_dong_id FROM region_dong WHERE name = '아현동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_gongdeok_dong_id FROM region_dong WHERE name = '공덕동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_sinsu_dong_id FROM region_dong WHERE name = '신수동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_sangsan_dong_id FROM region_dong WHERE name = '성산동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_donggyo_dong_id FROM region_dong WHERE name = '동교동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_hapjeong_dong_id FROM region_dong WHERE name = '합정동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_changjeon_dong_id FROM region_dong WHERE name = '창전동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_mapo_dong_id FROM region_dong WHERE name = '마포동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_mangwon_dong_id FROM region_dong WHERE name = '망원동' AND district_code = v_mapo_gu_code LIMIT 1;

    -- 4. Call the function to insert data for lower-panel billboards
    -- Note: 저단형 데이터는 실제 데이터로 교체해야 합니다
    -- 현재는 예시 데이터로 설정했습니다
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 1, '저단형 예시 1', '서교동 123', v_seogyo_dong_id, 'panel', 100000, 5000, 80000, 15000, 400, 60, 4, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 2, '저단형 예시 2', '아현동 456', v_ahyeon_dong_id, 'panel', 100000, 5000, 80000, 15000, 400, 60, 4, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 3, '저단형 예시 3', '공덕동 789', v_gongdeok_dong_id, 'panel', 100000, 5000, 80000, 15000, 400, 60, 4, '15 days');
    -- 추가 저단형 데이터는 실제 데이터로 교체하세요

END $$; 