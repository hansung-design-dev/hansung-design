-- Mapo-gu bulletin board data insertion for PostgreSQL (Supabase)
-- This script is split into two parts.
-- Please run Part 1 first, wait for success, then run Part 2.

-- =================================================================
-- PART 1: Create the data insertion function
-- This part defines a function to insert bulletin board data for Mapo-gu.
-- =================================================================
DROP FUNCTION IF EXISTS insert_mapo_bulletin_board;

CREATE OR REPLACE FUNCTION insert_mapo_bulletin_board(
    p_gu_id UUID,
    p_panel_code INTEGER,
    p_nickname VARCHAR(255),
    p_address VARCHAR(255),
    p_region_dong_id UUID,
    p_banner_type banner_type_enum,
    p_tax_price DECIMAL(10, 2),
    p_max_banners INT,
    p_price_unit price_unit_enum
) RETURNS VOID AS $$
DECLARE
    new_panel_id UUID;
    v_display_type_id UUID;
    slot_num INTEGER;
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
        'bulletin-board'
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

    -- Step 3: Insert into banner_slot_info, creating 12 slots per panel
    FOR slot_num IN 1..12 LOOP
        INSERT INTO banner_slot_info (
            panel_info_id,
            slot_number,
            total_price,
            tax_price,
            advertising_fee,
            road_usage_fee,
            banner_type,
            price_unit
        )
        VALUES (
            new_panel_id,
            slot_num, -- slot_number from 1 to 12
            NULL, -- total_price is null
            p_tax_price,
            NULL, -- advertising_fee is null
            NULL, -- road_usage_fee is null
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
BEGIN
    -- 1. Get region_gu id and code for Mapo-gu
    SELECT id, code INTO v_mapo_gu_id, v_mapo_gu_code FROM region_gu WHERE name = '마포구' LIMIT 1;

    -- 2. Insert region_dong entries using district_code
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '서교동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '서교동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '아현동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '아현동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '공덕동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '공덕동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '신수동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '신수동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '성산동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '성산동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '동교동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '동교동' AND district_code = v_mapo_gu_code);

    -- 3. Get region_dong_id variables (using district_code for accuracy)
    SELECT id INTO v_seogyo_dong_id FROM region_dong WHERE name = '서교동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_ahyeon_dong_id FROM region_dong WHERE name = '아현동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_gongdeok_dong_id FROM region_dong WHERE name = '공덕동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_sinsu_dong_id FROM region_dong WHERE name = '신수동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_sangsan_dong_id FROM region_dong WHERE name = '성산동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_donggyo_dong_id FROM region_dong WHERE name = '동교동' AND district_code = v_mapo_gu_code LIMIT 1;

    -- 4. Call the function to insert data for bulletin board billboards
    PERFORM insert_mapo_bulletin_board(v_mapo_gu_id, 1, '홍익문화공원 앞', '서교동 359', v_seogyo_dong_id, 'bulletin-board', 5000, 12, '15 days');
    PERFORM insert_mapo_bulletin_board(v_mapo_gu_id, 2, '홍익문화공원 앞', '서교동 359', v_seogyo_dong_id, 'bulletin-board', 5000, 12, '15 days');
    PERFORM insert_mapo_bulletin_board(v_mapo_gu_id, 3, '아현산업정보학교 담장', '아현동 267-9대', v_ahyeon_dong_id, 'bulletin-board', 5000, 12, '15 days');
    PERFORM insert_mapo_bulletin_board(v_mapo_gu_id, 4, '공덕로터리', '공덕동 467-3공', v_gongdeok_dong_id, 'bulletin-board', 5000, 12, '15 days');
    PERFORM insert_mapo_bulletin_board(v_mapo_gu_id, 5, '마포평생학습관 아현분관', '아현동610-1도', v_ahyeon_dong_id, 'bulletin-board', 5000, 12, '15 days');
    PERFORM insert_mapo_bulletin_board(v_mapo_gu_id, 6, '서강대학교 담장', '신수동 1-1학', v_sinsu_dong_id, 'bulletin-board', 5000, 12, '15 days');
    PERFORM insert_mapo_bulletin_board(v_mapo_gu_id, 7, '메세나폴리스 담장', '서교동 419-4 도', v_seogyo_dong_id, 'bulletin-board', 5000, 12, '15 days');
    PERFORM insert_mapo_bulletin_board(v_mapo_gu_id, 8, '성산2동우체국정류장', '성산동 467-2도', v_sangsan_dong_id, 'bulletin-board', 5000, 12, '15 days');
    PERFORM insert_mapo_bulletin_board(v_mapo_gu_id, 9, '성미산입구', '성산동 103-16도', v_sangsan_dong_id, 'bulletin-board', 5000, 12, '15 days');
    PERFORM insert_mapo_bulletin_board(v_mapo_gu_id, 10, '홍익문화공원 계단 옆', '서교동 359', v_seogyo_dong_id, 'bulletin-board', 5000, 12, '15 days');
    PERFORM insert_mapo_bulletin_board(v_mapo_gu_id, 11, '서교동 상상마당 옆', '서교동 367-5', v_seogyo_dong_id, 'bulletin-board', 5000, 12, '15 days');
    PERFORM insert_mapo_bulletin_board(v_mapo_gu_id, 12, '관광안내소 앞', '서교동 348-81', v_seogyo_dong_id, 'bulletin-board', 5000, 12, '15 days');
    PERFORM insert_mapo_bulletin_board(v_mapo_gu_id, 13, '홍대입구사거리', '동교동 155-6도', v_donggyo_dong_id, 'bulletin-board', 5000, 12, '15 days');
    PERFORM insert_mapo_bulletin_board(v_mapo_gu_id, 14, '홍익문화공원 앞', '서교동 359', v_seogyo_dong_id, 'bulletin-board', 5000, 12, '15 days');

END $$; 