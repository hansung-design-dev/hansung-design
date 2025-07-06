-- =================================================================
-- 마포구 저단형 데이터 삽입 (1-15번)
-- =================================================================

-- 마포구 저단형 데이터 삽입 함수
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
-- 데이터 삽입 실행 (1-15번)
-- =================================================================
DO $$
DECLARE
    v_mapo_gu_id UUID;
    v_mapo_gu_code TEXT;
    v_ahyeon_dong_id UUID;
    v_daeheung_dong_id UUID;
    v_gongdeok_dong_id UUID;
    v_dohwa_dong_id UUID;
    v_yonggang_dong_id UUID;
    v_yeomri_dong_id UUID;
BEGIN
    -- 1. Get region_gu id and code for Mapo-gu
    SELECT id, code INTO v_mapo_gu_id, v_mapo_gu_code FROM region_gu WHERE name = '마포구' LIMIT 1;

    -- 2. Insert region_dong entries if not exists
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '아현동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '아현동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '대흥동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '대흥동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '공덕동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '공덕동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '도화동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '도화동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '용강동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '용강동' AND district_code = v_mapo_gu_code);
    INSERT INTO region_dong (district_code, name) SELECT v_mapo_gu_code, '염리동' WHERE NOT EXISTS (SELECT 1 FROM region_dong WHERE name = '염리동' AND district_code = v_mapo_gu_code);

    -- 3. Get region_dong_id variables
    SELECT id INTO v_ahyeon_dong_id FROM region_dong WHERE name = '아현동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_daeheung_dong_id FROM region_dong WHERE name = '대흥동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_gongdeok_dong_id FROM region_dong WHERE name = '공덕동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_dohwa_dong_id FROM region_dong WHERE name = '도화동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_yonggang_dong_id FROM region_dong WHERE name = '용강동' AND district_code = v_mapo_gu_code LIMIT 1;
    SELECT id INTO v_yeomri_dong_id FROM region_dong WHERE name = '염리동' AND district_code = v_mapo_gu_code LIMIT 1;

    -- 4. Call the function to insert data for lower-panel billboards (1-15번)
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 1, 'B01.아현동267-1 (아현역3번출구앞.아현산업정보고앞) 구.37', '아현동 267-1', v_ahyeon_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 2, 'B02.굴레방로 6 (아현초 담장 대로변) 구7', '아현동 굴레방로 6', v_ahyeon_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 3, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 3, 'B03.마포대로 224 (마포평생학습관 아현분관앞) 구62', '아현동 마포대로 224', v_ahyeon_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 3, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 4, 'B04.신촌로210 (아현어린이집 앞) 구1', '아현동 신촌로 210', v_ahyeon_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 5, 'B05.대흥동12-2 (이대역5번출구 건너편/U+앞) 구17', '대흥동 12-2', v_daeheung_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 6, 'B06.마포대로 212-1 (애오개역 4번출구) 구3', '공덕동 마포대로 212-1', v_gongdeok_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 7, 'B07.마포대로 213 (애오개역 1번 출구)구4', '공덕동 마포대로 213', v_gongdeok_dong_id, 'panel', 100000, 10000, 72000, 18000, 500, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 8, 'B08.마포대로 163 (IBK기업은행 공덕동지점 앞/서울서부지방법원건너편)구5', '공덕동 마포대로 163', v_gongdeok_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 9, 'B09.효창목길6 (한겨레신문사사거리 벽화담장길 앞)-2단형 구66', '공덕동 효창목길 6', v_gongdeok_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 10, 'B10.만리재로 14 (공덕치안센터와 수협은행사이)구2', '공덕동 만리재로 14', v_gongdeok_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 11, 'B11.마포구 공덕동 (공덕역2번출구.롯데캐슬앞)구8', '공덕동', v_gongdeok_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 12, 'B12.백범로 178 (공덕역8번출구 맞은편 지하철환기구근처)구6', '공덕동 백범로 178', v_gongdeok_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 13, 'B13.새창로 36 (경의선숲길공원관리사무소 앞 도로변)공덕동10번출구쪽 구9', '도화동 새창로 36', v_dohwa_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 3, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 14, 'B14.마포대로 44 (마포역 3번 출구)구10', '도화동 마포대로 44', v_dohwa_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');
    PERFORM insert_mapo_lower_panel(v_mapo_gu_id, 15, 'B15.마포대로 33 (마포역 2번출구 앞)구12', '도화동 마포대로 33', v_dohwa_dong_id, 'panel', 100000, 10000, 72000, 18000, 600, 70, 2, '15 days');

    RAISE NOTICE '마포구 저단형 1-15번 데이터 삽입 완료!';
END $$; 