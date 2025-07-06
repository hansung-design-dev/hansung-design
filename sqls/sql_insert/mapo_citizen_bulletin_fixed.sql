-- =================================================================
-- 마포구 시민게시대 데이터 삽입 (완전 수정 버전)
-- =================================================================

-- 1. slot_number CHECK 제약조건 제거
ALTER TABLE banner_slot_info 
DROP CONSTRAINT IF EXISTS banner_slot_info_slot_number_check;

-- 2. slot_number를 numeric으로 변경
ALTER TABLE banner_slot_info 
ALTER COLUMN slot_number TYPE NUMERIC(10,0);

-- 3. banner_type_enum_v2에 'bulletin-board' 추가 (안전하게)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'bulletin-board' AND enumtypid = 'banner_type_enum_v2'::regtype) THEN
        ALTER TYPE banner_type_enum_v2 ADD VALUE 'bulletin-board';
    END IF;
END $$;

-- 4. panel_type_enum_v2에 'citizen-board' 추가 (안전하게)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'citizen-board' AND enumtypid = 'panel_type_enum_v2'::regtype) THEN
        ALTER TYPE panel_type_enum_v2 ADD VALUE 'citizen-board';
    END IF;
END $$;

-- 5. price_unit_enum에 '15 days' 추가 (안전하게)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = '15 days' AND enumtypid = 'price_unit_enum'::regtype) THEN
        ALTER TYPE price_unit_enum ADD VALUE '15 days';
    END IF;
END $$;

-- =================================================================
-- 마포구 시민게시대 데이터 삽입 함수
-- =================================================================

CREATE OR REPLACE FUNCTION insert_mapo_citizen_bulletin(
    p_gu_id UUID,
    p_panel_code INTEGER,
    p_nickname VARCHAR(255),
    p_address VARCHAR(255),
    p_region_dong_id UUID,
    p_banner_type banner_type_enum_v2,
    p_total_price DECIMAL(10, 2),
    p_tax_price DECIMAL(10, 2),
    p_advertising_fee DECIMAL(10, 2),
    p_road_usage_fee DECIMAL(10, 2),
    p_width DECIMAL(5, 2),
    p_height DECIMAL(5, 2),
    p_max_banners INT,
    p_price_unit price_unit_enum,
    p_panel_type panel_type_enum_v2
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
        p_panel_type
    )
    RETURNING id INTO new_panel_id;

    -- Step 2: Insert into banner_panel_details
    INSERT INTO banner_panel_details (
        panel_info_id,
        max_banners,
        panel_width,
        panel_height,
        is_for_admin
    )
    VALUES (
        new_panel_id,
        p_max_banners,
        p_width,
        p_height,
        FALSE 
    );

    -- Step 3: Insert into banner_slot_info, create slots based on max_banners
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
-- 마포구 시민게시대 데이터 삽입 실행
-- =================================================================

DO $$
DECLARE
    v_mapo_gu_id UUID;
    v_mapo_gu_code TEXT;
    v_seogyo_dong_id UUID;
    v_ahyeon_dong_id UUID;
    v_gongdeok_dong_id UUID;
    v_sinsu_dong_id UUID;
    v_seongsan_dong_id UUID;
    v_donggyo_dong_id UUID;
BEGIN
    -- 1. Get region_gu id and code for Mapo-gu
    SELECT id, code INTO v_mapo_gu_id, v_mapo_gu_code FROM region_gu WHERE name = '마포구' LIMIT 1;

    -- 2. Insert region_dong entries if not exists
    INSERT INTO region_dong (district_code, name) 
    SELECT v_mapo_gu_code, '서교동' 
    WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '서교동' AND district_code = v_mapo_gu_code);
    
    INSERT INTO region_dong (district_code, name) 
    SELECT v_mapo_gu_code, '아현동' 
    WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '아현동' AND district_code = v_mapo_gu_code);
    
    INSERT INTO region_dong (district_code, name) 
    SELECT v_mapo_gu_code, '공덕동' 
    WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '공덕동' AND district_code = v_mapo_gu_code);
    
    INSERT INTO region_dong (district_code, name) 
    SELECT v_mapo_gu_code, '신수동' 
    WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '신수동' AND district_code = v_mapo_gu_code);
    
    INSERT INTO region_dong (district_code, name) 
    SELECT v_mapo_gu_code, '성산동' 
    WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '성산동' AND district_code = v_mapo_gu_code);
    
    INSERT INTO region_dong (district_code, name) 
    SELECT v_mapo_gu_code, '동교동' 
    WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '동교동' AND district_code = v_mapo_gu_code);

    -- 3. Get region_dong_id variables
    SELECT id INTO v_seogyo_dong_id FROM region_dong WHERE name = '서교동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_ahyeon_dong_id FROM region_dong WHERE name = '아현동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_gongdeok_dong_id FROM region_dong WHERE name = '공덕동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_sinsu_dong_id FROM region_dong WHERE name = '신수동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_seongsan_dong_id FROM region_dong WHERE name = '성산동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_donggyo_dong_id FROM region_dong WHERE name = '동교동' AND district_code = v_mapo_gu_code LIMIT 1;

    -- 4. Insert citizen bulletin board data (시민게시판 - bulletin-board)
    PERFORM insert_mapo_citizen_bulletin(v_mapo_gu_id, 1, '홍익문화공원 앞 (1)', '서교동 359', v_seogyo_dong_id, 'bulletin-board', 0, 0, 0, 0, 600, 70, 12, '15 days', 'bulletin-board');
    PERFORM insert_mapo_citizen_bulletin(v_mapo_gu_id, 2, '홍익문화공원 앞 (2)', '서교동 359', v_seogyo_dong_id, 'bulletin-board', 0, 0, 0, 0, 600, 70, 12, '15 days', 'bulletin-board');
    PERFORM insert_mapo_citizen_bulletin(v_mapo_gu_id, 3, '아현산업정보학교 담장', '아현동 267-9대', v_ahyeon_dong_id, 'bulletin-board', 0, 0, 0, 0, 600, 70, 12, '15 days', 'bulletin-board');
    PERFORM insert_mapo_citizen_bulletin(v_mapo_gu_id, 4, '공덕로터리', '공덕동 467-3공', v_gongdeok_dong_id, 'bulletin-board', 0, 0, 0, 0, 600, 70, 12, '15 days', 'bulletin-board');
    PERFORM insert_mapo_citizen_bulletin(v_mapo_gu_id, 5, '마포평생학습관 아현분관', '아현동610-1도', v_ahyeon_dong_id, 'bulletin-board', 0, 0, 0, 0, 600, 70, 12, '15 days', 'bulletin-board');
    PERFORM insert_mapo_citizen_bulletin(v_mapo_gu_id, 6, '서강대학교 담장', '신수동 1-1학', v_sinsu_dong_id, 'bulletin-board', 0, 0, 0, 0, 600, 70, 12, '15 days', 'bulletin-board');
    PERFORM insert_mapo_citizen_bulletin(v_mapo_gu_id, 7, '메세나폴리스 담장', '서교동 419-4 도', v_seogyo_dong_id, 'bulletin-board', 0, 0, 0, 0, 600, 70, 12, '15 days', 'bulletin-board');
    PERFORM insert_mapo_citizen_bulletin(v_mapo_gu_id, 8, '성산2동우체국정류장', '성산동 467-2도', v_seongsan_dong_id, 'bulletin-board', 0, 0, 0, 0, 600, 70, 12, '15 days', 'bulletin-board');
    PERFORM insert_mapo_citizen_bulletin(v_mapo_gu_id, 9, '성미산입구', '성산동 103-16도', v_seongsan_dong_id, 'bulletin-board', 0, 0, 0, 0, 600, 70, 12, '15 days', 'bulletin-board');
    PERFORM insert_mapo_citizen_bulletin(v_mapo_gu_id, 10, '홍익문화공원 계단 옆', '서교동 359', v_seogyo_dong_id, 'bulletin-board', 0, 0, 0, 0, 600, 70, 12, '15 days', 'bulletin-board');
    PERFORM insert_mapo_citizen_bulletin(v_mapo_gu_id, 11, '서교동 상상마당 옆', '서교동 367-5', v_seogyo_dong_id, 'bulletin-board', 0, 0, 0, 0, 600, 70, 12, '15 days', 'bulletin-board');
    
    -- 5. Insert citizen cultural board data (시민문화게시판 - citizen-board)
    PERFORM insert_mapo_citizen_bulletin(v_mapo_gu_id, 12, '관광안내소 앞', '서교동 348-81', v_seogyo_dong_id, 'bulletin-board', 0, 0, 0, 0, 600, 70, 12, '15 days', 'citizen-board');
    PERFORM insert_mapo_citizen_bulletin(v_mapo_gu_id, 13, '홍대입구사거리', '동교동 155-6도', v_donggyo_dong_id, 'bulletin-board', 0, 0, 0, 0, 600, 70, 12, '15 days', 'citizen-board');
    PERFORM insert_mapo_citizen_bulletin(v_mapo_gu_id, 14, '홍익문화공원 앞', '서교동 359', v_seogyo_dong_id, 'bulletin-board', 0, 0, 0, 0, 600, 70, 12, '15 days', 'citizen-board');
END $$; 