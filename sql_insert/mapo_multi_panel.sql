-- Mapo-gu multi-panel data insertion for PostgreSQL (Supabase)
-- This script is split into two parts.
-- Please run Part 1 first, wait for success, then run Part 2.

-- =================================================================
-- PART 1: Create the data insertion function
-- This part defines a function to insert multi-panel data for Mapo-gu.
-- =================================================================
DROP FUNCTION IF EXISTS insert_mapo_multi_panel;

CREATE OR REPLACE FUNCTION insert_mapo_multi_panel(
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
        'multi-panel'
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

    -- Step 3: Insert into banner_slot_info, assuming one primary slot per panel
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
        1, -- Assuming slot #1 for each panel
        p_width,
        p_height,
        p_total_price,
        p_tax_price,
        p_advertising_fee,
        p_road_usage_fee,
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
    v_mapo_gu_id UUID;
    v_mapo_gu_code TEXT;
    v_sangsan_dong_id UUID;
    v_sangam_dong_id UUID;
    v_mangwon_dong_id UUID;
    v_seogyo_dong_id UUID;
    v_hapjeong_dong_id UUID;
    v_changjeon_dong_id UUID;
    v_ahyeon_dong_id UUID;
    v_mapo_dong_id UUID;
BEGIN
    -- 1. Get region_gu id and code for Mapo-gu
    SELECT id, code INTO v_mapo_gu_id, v_mapo_gu_code FROM region_gu WHERE name = '마포구' LIMIT 1;

    -- 2. Insert region_dong entries using district_code
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '성산동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '성산동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '상암동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '상암동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '망원동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '망원동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '서교동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '서교동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '합정동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '합정동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '창전동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '창전동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '아현동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '아현동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '마포동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '마포동' AND district_code = v_mapo_gu_code);

    -- 3. Get region_dong_id variables (using district_code for accuracy)
    SELECT id INTO v_sangsan_dong_id FROM region_dong WHERE name = '성산동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_sangam_dong_id FROM region_dong WHERE name = '상암동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_mangwon_dong_id FROM region_dong WHERE name = '망원동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_seogyo_dong_id FROM region_dong WHERE name = '서교동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_hapjeong_dong_id FROM region_dong WHERE name = '합정동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_changjeon_dong_id FROM region_dong WHERE name = '창전동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_ahyeon_dong_id FROM region_dong WHERE name = '아현동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_mapo_dong_id FROM region_dong WHERE name = '마포동' AND district_code = v_mapo_gu_code LIMIT 1;

    -- 4. Call the function to insert data for multi-panel billboards
    PERFORM insert_mapo_multi_panel(v_mapo_gu_id, 1, '상암사거리', '성산동 487', v_sangsan_dong_id, 'panel', 130000, 10000, 93600, 26400, 600, 70, 6, '15 days');
    PERFORM insert_mapo_multi_panel(v_mapo_gu_id, 2, '서부면허시험장사거리', '상암동1542-4', v_sangam_dong_id, 'panel', 130000, 10000, 93600, 26400, 600, 70, 6, '15 days');
    PERFORM insert_mapo_multi_panel(v_mapo_gu_id, 3, '월드컵파크7단지', '상암동 1715-26', v_sangam_dong_id, 'panel', 130000, 10000, 93600, 26400, 600, 70, 6, '15 days');
    PERFORM insert_mapo_multi_panel(v_mapo_gu_id, 4, '성산대교북단', '상암동 1563-1', v_mangwon_dong_id, 'panel', 130000, 10000, 93600, 26400, 600, 70, 6, '15 days');
    PERFORM insert_mapo_multi_panel(v_mapo_gu_id, 5, '홍익소공원앞', '서교동 359', v_seogyo_dong_id, 'panel', 130000, 10000, 93600, 26400, 600, 70, 6, '15 days');
    PERFORM insert_mapo_multi_panel(v_mapo_gu_id, 6, '양화대교북단', '합정동 401-1도', v_hapjeong_dong_id, 'panel', 130000, 10000, 93600, 26400, 600, 70, 6, '15 days');
    PERFORM insert_mapo_multi_panel(v_mapo_gu_id, 7, '광흥창역', '창전동 243-3도', v_changjeon_dong_id, 'panel', 130000, 10000, 93600, 26400, 600, 70, 6, '15 days');
    PERFORM insert_mapo_multi_panel(v_mapo_gu_id, 8, '아현로타리앞', '아현동 610-1도', v_ahyeon_dong_id, 'panel', 130000, 10000, 93600, 26400, 600, 70, 6, '15 days');
    PERFORM insert_mapo_multi_panel(v_mapo_gu_id, 9, '마포구청 맞은편', '성산동 373-15도', v_sangsan_dong_id, 'panel', 130000, 10000, 93600, 26400, 600, 70, 6, '15 days');
    PERFORM insert_mapo_multi_panel(v_mapo_gu_id, 10, '월드컵경기장주차장앞', '성산동665', v_sangsan_dong_id, 'panel', 130000, 10000, 93600, 26400, 600, 70, 6, '15 days');
    PERFORM insert_mapo_multi_panel(v_mapo_gu_id, 11, '마포중앙도서관 건너편', '성산동 191-33도', v_sangsan_dong_id, 'panel', 130000, 10000, 93600, 26400, 600, 70, 6, '15 days');
    PERFORM insert_mapo_multi_panel(v_mapo_gu_id, 12, '합정로타리앞-좌', '서교동 419-4도', v_hapjeong_dong_id, 'panel', 130000, 10000, 93600, 26400, 600, 70, 6, '15 days');
    PERFORM insert_mapo_multi_panel(v_mapo_gu_id, 13, '아현시장입구', '아현267-1', v_ahyeon_dong_id, 'panel', 130000, 10000, 93600, 26400, 600, 70, 6, '15 days');
    PERFORM insert_mapo_multi_panel(v_mapo_gu_id, 14, '합정로타리앞-우', '서교동 419-4도', v_hapjeong_dong_id, 'panel', 130000, 10000, 93600, 26400, 600, 70, 6, '15 days');
    PERFORM insert_mapo_multi_panel(v_mapo_gu_id, 15, '월드컵경기장사거리', '성산동 670공', v_sangam_dong_id, 'panel', 130000, 10000, 93600, 26400, 600, 70, 6, '15 days');
    PERFORM insert_mapo_multi_panel(v_mapo_gu_id, 16, '공덕동 마포대교북단', '마포동 123-2', v_mapo_dong_id, 'panel', 130000, 10000, 93600, 26400, 600, 70, 6, '15 days');
    PERFORM insert_mapo_multi_panel(v_mapo_gu_id, 17, 'MBC신사옥-SBS프리즘타워삼거리', '상암동231-5', v_sangam_dong_id, 'panel', 130000, 10000, 93600, 26400, 600, 70, 6, '15 days');
    PERFORM insert_mapo_multi_panel(v_mapo_gu_id, 18, 'DMC역3번출구 맞은편', '상암동1151', v_sangam_dong_id, 'panel', 130000, 10000, 93600, 26400, 600, 70, 6, '15 days');

END $$; 

-- =================================================================
-- SCRIPT TO FIX EXISTING MAPO-GU MULTI-PANEL DATA
-- Run this block to add missing slots for existing multi-panel billboards
-- =================================================================
DO $$
DECLARE
    v_mapo_gu_id UUID;
    panel_record RECORD;
    slot_num INTEGER;
BEGIN
    -- Get the ID for Mapo-gu to scope the updates
    SELECT id INTO v_mapo_gu_id FROM region_gu WHERE name = '마포구' LIMIT 1;

    -- Loop through each existing multi-panel billboard
    FOR panel_record IN 
        SELECT pi.id as panel_id, bsi.total_price, bsi.tax_price, bsi.advertising_fee, bsi.road_usage_fee, bsi.banner_type, bsi.price_unit, bpd.panel_width, bpd.panel_height
        FROM panel_info pi
        JOIN banner_slot_info bsi ON pi.id = bsi.panel_info_id
        JOIN banner_panel_details bpd ON pi.id = bpd.panel_info_id
        WHERE pi.region_gu_id = v_mapo_gu_id 
        AND pi.panel_type = 'multi-panel'
        AND bsi.slot_number = 1  -- Only get the first slot to get the data
    LOOP
        -- Delete the existing single slot
        DELETE FROM banner_slot_info WHERE panel_info_id = panel_record.panel_id;
        
        -- Create 6 slots for each panel
        FOR slot_num IN 1..6 LOOP
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
                panel_record.panel_id,
                slot_num,
                panel_record.panel_width,
                panel_record.panel_height,
                panel_record.total_price,
                panel_record.tax_price,
                panel_record.advertising_fee,
                panel_record.road_usage_fee,
                panel_record.banner_type,
                panel_record.price_unit
            );
        END LOOP;
    END LOOP;
END $$; 

-- =================================================================
-- SCRIPT TO FIX PANEL_TYPE FOR MAPO-GU MULTI-PANEL
-- Run this block to change panel_type from 'panel' to 'multi-panel'
-- =================================================================
DO $$
DECLARE
    v_mapo_gu_id UUID;
BEGIN
    -- Get the ID for Mapo-gu to scope the updates
    SELECT id INTO v_mapo_gu_id FROM region_gu WHERE name = '마포구' LIMIT 1;

    -- Update panel_type from 'panel' to 'multi-panel' for all Mapo-gu panels
    UPDATE panel_info 
    SET panel_type = 'multi-panel'
    WHERE region_gu_id = v_mapo_gu_id 
    AND panel_type = 'panel';

END $$; 