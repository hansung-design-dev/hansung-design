-- LED 전자게시대 일괄 삽입 스크립트
-- 강동구, 광진구, 관악구, 동작구, 동대문구

-- =================================================================
-- PART 1: LED 전자게시대 데이터 삽입 함수 생성
-- =================================================================
DROP FUNCTION IF EXISTS insert_led_panel_bulk;

CREATE OR REPLACE FUNCTION insert_led_panel_bulk(
    p_gu_id UUID,
    p_panel_code INTEGER,
    p_nickname VARCHAR(255),
    p_address VARCHAR(255),
    p_region_dong_id UUID,
    p_slot_width_px INTEGER,
    p_slot_height_px INTEGER,
    p_total_price DECIMAL(10, 2),
    p_tax_price DECIMAL(10, 2),
    p_advertising_fee DECIMAL(10, 2),
    p_road_usage_fee DECIMAL(10, 2) DEFAULT 0,
    p_administrative_fee DECIMAL(10, 2) DEFAULT 0,
    p_price_unit price_unit_enum DEFAULT '1 month'
) RETURNS VOID AS $$
DECLARE
    new_panel_id UUID;
    v_display_type_id UUID;
BEGIN
    -- Get the display_type_id for 'led_display'
    SELECT id INTO v_display_type_id FROM display_types WHERE name = 'led_display' LIMIT 1;

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
        'led'
    )
    RETURNING id INTO new_panel_id;

    -- Step 2: Insert into led_panel_details
    INSERT INTO led_panel_details (
        panel_info_id,
        exposure_count,
        max_banners,
        panel_width,
        panel_height
    )
    VALUES (
        new_panel_id,
        0,     -- exposure_count를 0으로 설정
        20,    -- max_banners 기본값
        p_slot_width_px,
        p_slot_height_px
    );

    -- Step 3: Insert into led_slot_info
    INSERT INTO led_slot_info (
        panel_info_id,
        slot_number,
        slot_width_px,
        slot_height_px,
        position_x,
        position_y,
        total_price,
        tax_price,
        advertising_fee,
        road_usage_fee,
        administrative_fee,
        price_unit,
        panel_slot_status
    )
    VALUES (
        new_panel_id,
        1,     -- slot_number를 1로 설정
        p_slot_width_px,
        p_slot_height_px,
        0,
        0,
        p_total_price,
        p_tax_price,
        p_advertising_fee,
        p_road_usage_fee,
        p_administrative_fee,
        p_price_unit,
        'available'
    );
END;
$$ LANGUAGE plpgsql;

-- =================================================================
-- PART 2: 동 데이터 삽입 (없는 경우)
-- =================================================================

-- 강동구 동 데이터 삽입
INSERT INTO region_dong (district_code, name) 
SELECT code, '천호동' FROM region_gu WHERE name = '강동구'
ON CONFLICT (district_code, name) DO NOTHING;

INSERT INTO region_dong (district_code, name) 
SELECT code, '길동' FROM region_gu WHERE name = '강동구'
ON CONFLICT (district_code, name) DO NOTHING;

INSERT INTO region_dong (district_code, name) 
SELECT code, '둔촌동' FROM region_gu WHERE name = '강동구'
ON CONFLICT (district_code, name) DO NOTHING;

INSERT INTO region_dong (district_code, name) 
SELECT code, '고덕동' FROM region_gu WHERE name = '강동구'
ON CONFLICT (district_code, name) DO NOTHING;

-- 광진구 동 데이터 삽입
INSERT INTO region_dong (district_code, name) 
SELECT code, '구의동' FROM region_gu WHERE name = '광진구'
ON CONFLICT (district_code, name) DO NOTHING;

INSERT INTO region_dong (district_code, name) 
SELECT code, '자양동' FROM region_gu WHERE name = '광진구'
ON CONFLICT (district_code, name) DO NOTHING;

INSERT INTO region_dong (district_code, name) 
SELECT code, '중곡동' FROM region_gu WHERE name = '광진구'
ON CONFLICT (district_code, name) DO NOTHING;

-- 관악구 동 데이터 삽입
INSERT INTO region_dong (district_code, name) 
SELECT code, '봉천동' FROM region_gu WHERE name = '관악구'
ON CONFLICT (district_code, name) DO NOTHING;

-- 동작구 동 데이터 삽입
INSERT INTO region_dong (district_code, name) 
SELECT code, '본동' FROM region_gu WHERE name = '동작구'
ON CONFLICT (district_code, name) DO NOTHING;

INSERT INTO region_dong (district_code, name) 
SELECT code, '사당동' FROM region_gu WHERE name = '동작구'
ON CONFLICT (district_code, name) DO NOTHING;

-- 동대문구 동 데이터 삽입
INSERT INTO region_dong (district_code, name) 
SELECT code, '전농동' FROM region_gu WHERE name = '동대문구'
ON CONFLICT (district_code, name) DO NOTHING;

-- =================================================================
-- PART 3: LED 전자게시대 데이터 삽입
-- =================================================================

DO $$
DECLARE
    -- 구 ID 변수
    v_gangdong_gu_id UUID;
    v_gwangjin_gu_id UUID;
    v_gwanak_gu_id UUID;
    v_dongjak_gu_id UUID;
    v_dongdaemun_gu_id UUID;
    
    -- 동 ID 변수들
    v_cheonho_dong_id UUID;
    v_gil_dong_id UUID;
    v_dunchon_dong_id UUID;
    v_godeok_dong_id UUID;
    v_gui_dong_id UUID;
    v_jayang_dong_id UUID;
    v_junggok_dong_id UUID;
    v_bongcheon_dong_id UUID;
    v_bon_dong_id UUID;
    v_sadang_dong_id UUID;
    v_jeonnong_dong_id UUID;
    
    panel_counter INTEGER := 1;
BEGIN
    -- Get 구 IDs
    SELECT id INTO v_gangdong_gu_id FROM region_gu WHERE name = '강동구' LIMIT 1;
    SELECT id INTO v_gwangjin_gu_id FROM region_gu WHERE name = '광진구' LIMIT 1;
    SELECT id INTO v_gwanak_gu_id FROM region_gu WHERE name = '관악구' LIMIT 1;
    SELECT id INTO v_dongjak_gu_id FROM region_gu WHERE name = '동작구' LIMIT 1;
    SELECT id INTO v_dongdaemun_gu_id FROM region_gu WHERE name = '동대문구' LIMIT 1;
    
    -- Get 동 IDs
    SELECT id INTO v_cheonho_dong_id FROM region_dong WHERE district_code = (SELECT code FROM region_gu WHERE name = '강동구') AND name = '천호동' LIMIT 1;
    SELECT id INTO v_gil_dong_id FROM region_dong WHERE district_code = (SELECT code FROM region_gu WHERE name = '강동구') AND name = '길동' LIMIT 1;
    SELECT id INTO v_dunchon_dong_id FROM region_dong WHERE district_code = (SELECT code FROM region_gu WHERE name = '강동구') AND name = '둔촌동' LIMIT 1;
    SELECT id INTO v_godeok_dong_id FROM region_dong WHERE district_code = (SELECT code FROM region_gu WHERE name = '강동구') AND name = '고덕동' LIMIT 1;
    
    SELECT id INTO v_gui_dong_id FROM region_dong WHERE district_code = (SELECT code FROM region_gu WHERE name = '광진구') AND name = '구의동' LIMIT 1;
    SELECT id INTO v_jayang_dong_id FROM region_dong WHERE district_code = (SELECT code FROM region_gu WHERE name = '광진구') AND name = '자양동' LIMIT 1;
    SELECT id INTO v_junggok_dong_id FROM region_dong WHERE district_code = (SELECT code FROM region_gu WHERE name = '광진구') AND name = '중곡동' LIMIT 1;
    
    SELECT id INTO v_bongcheon_dong_id FROM region_dong WHERE district_code = (SELECT code FROM region_gu WHERE name = '관악구') AND name = '봉천동' LIMIT 1;
    
    SELECT id INTO v_bon_dong_id FROM region_dong WHERE district_code = (SELECT code FROM region_gu WHERE name = '동작구') AND name = '본동' LIMIT 1;
    SELECT id INTO v_sadang_dong_id FROM region_dong WHERE district_code = (SELECT code FROM region_gu WHERE name = '동작구') AND name = '사당동' LIMIT 1;
    
    SELECT id INTO v_jeonnong_dong_id FROM region_dong WHERE district_code = (SELECT code FROM region_gu WHERE name = '동대문구') AND name = '전농동' LIMIT 1;

    -- =================================================================
    -- 강동구 LED 전자게시대 (800*416 픽셀, 561,000원)
    -- =================================================================
    
    -- 천호동 LED
    PERFORM insert_led_panel_bulk(
        v_gangdong_gu_id,
        panel_counter,
        '천호동 LED',
        '서울 강동구 천호동 123-45',
        v_cheonho_dong_id,
        800,    -- slot_width_px
        416,    -- slot_height_px
        561000, -- total_price
        50000,  -- tax_price
        500000, -- advertising_fee
        0,      -- road_usage_fee
        11000,  -- administrative_fee
        '1 month'
    );
    panel_counter := panel_counter + 1;

    -- 길동 LED
    PERFORM insert_led_panel_bulk(
        v_gangdong_gu_id,
        panel_counter,
        '길동 LED',
        '서울 강동구 길동 234-56',
        v_gil_dong_id,
        800,
        416,
        561000,
        50000,
        500000,
        0,
        11000,
        '1 month'
    );
    panel_counter := panel_counter + 1;

    -- 둔촌동 LED
    PERFORM insert_led_panel_bulk(
        v_gangdong_gu_id,
        panel_counter,
        '둔촌동 LED',
        '서울 강동구 둔촌동 345-67',
        v_dunchon_dong_id,
        800,
        416,
        561000,
        50000,
        500000,
        0,
        11000,
        '1 month'
    );
    panel_counter := panel_counter + 1;

    -- 고덕동 LED
    PERFORM insert_led_panel_bulk(
        v_gangdong_gu_id,
        panel_counter,
        '고덕동 LED',
        '서울 강동구 고덕동 456-78',
        v_godeok_dong_id,
        800,
        416,
        561000,
        50000,
        500000,
        0,
        11000,
        '1 month'
    );
    panel_counter := panel_counter + 1;

    -- 고덕동 LED (굽은다리역 사거리)
    PERFORM insert_led_panel_bulk(
        v_gangdong_gu_id,
        5,      -- panel_code 5로 고정
        NULL,   -- nickname null
        '굽은다리역 사거리',
        v_godeok_dong_id,
        800,    -- 강동구 픽셀 사이즈
        416,
        561000, -- 강동구 가격
        50000,  -- tax_price
        500000, -- advertising_fee
        0,      -- road_usage_fee
        11000,  -- administrative_fee
        '1 month'
    );
    panel_counter := panel_counter + 1;
    

    -- =================================================================
    -- 광진구 LED 전자게시대 (800*416 픽셀, 561,000원)
    -- =================================================================
    
    -- 구의동 LED
    PERFORM insert_led_panel_bulk(
        v_gwangjin_gu_id,
        panel_counter,
        '구의동 LED',
        '서울 광진구 구의동 567-89',
        v_gui_dong_id,
        800,
        416,
        561000,
        50000,
        500000,
        0,
        11000,
        '1 month'
    );
    panel_counter := panel_counter + 1;

    -- 자양동 LED
    PERFORM insert_led_panel_bulk(
        v_gwangjin_gu_id,
        panel_counter,
        '자양동 LED',
        '서울 광진구 자양동 678-90',
        v_jayang_dong_id,
        800,
        416,
        561000,
        50000,
        500000,
        0,
        11000,
        '1 month'
    );
    panel_counter := panel_counter + 1;

    -- 중곡동 LED
    PERFORM insert_led_panel_bulk(
        v_gwangjin_gu_id,
        panel_counter,
        '중곡동 LED',
        '서울 광진구 중곡동 789-01',
        v_junggok_dong_id,
        800,
        416,
        561000,
        50000,
        500000,
        0,
        11000,
        '1 month'
    );
    panel_counter := panel_counter + 1;

    -- =================================================================
    -- 관악구 LED 전자게시대 (368*208 픽셀, 363,000원)
    -- =================================================================
    
    -- 봉천동 LED
    PERFORM insert_led_panel_bulk(
        v_gwanak_gu_id,
        panel_counter,
        '봉천동 LED',
        '서울 관악구 봉천동 890-12',
        v_bongcheon_dong_id,
        368,
        208,
        363000,
        32000,
        320000,
        0,
        11000,
        '1 month'
    );
    panel_counter := panel_counter + 1;

    -- =================================================================
    -- 동작구 LED 전자게시대 (1920*1080 또는 368*208 픽셀, 380,600원)
    -- =================================================================
    
    -- 본동 LED (368*208) - 노들역
    PERFORM insert_led_panel_bulk(
        v_dongjak_gu_id,
        panel_counter,
        '본동 LED',
        '서울 동작구 본동 901-23',
        v_bon_dong_id,
        368,
        208,
        380600,
        34000,
        340000,
        0,
        6600,
        '1 month'
    );
    panel_counter := panel_counter + 1;

    -- 사당동 LED (1920*1080) - 이수역
    PERFORM insert_led_panel_bulk(
        v_dongjak_gu_id,
        panel_counter,
        '사당동 LED',
        '서울 동작구 사당동 012-34',
        v_sadang_dong_id,
        1920,
        1080,
        380600,
        34000,
        340000,
        0,
        6600,
        '1 month'
    );
    panel_counter := panel_counter + 1;

    -- 사당동 LED (1920*1080) - 사당역
    PERFORM insert_led_panel_bulk(
        v_dongjak_gu_id,
        panel_counter,
        '사당동 LED',
        '서울 동작구 사당동 123-45',
        v_sadang_dong_id,
        1920,
        1080,
        380600,
        34000,
        340000,
        0,
        6600,
        '1 month'
    );
    panel_counter := panel_counter + 1;

    -- 소형게시대-2
    PERFORM insert_led_panel_bulk(
        v_dongjak_gu_id,
        panel_counter,
        null,
        '소형게시대-2',
        v_sadang_dong_id,
        1920,
        1080,
        380600,
        34000,
        340000,
        0,
        6600,
        '1 month'
    );
    panel_counter := panel_counter + 1;

    -- 소형게시대-3
    PERFORM insert_led_panel_bulk(
        v_dongjak_gu_id,
        panel_counter,
        null,
        '소형게시대-3',
        v_sadang_dong_id,
        1920,
        1080,
        380600,
        34000,
        340000,
        0,
        6600,
        '1 month'
    );
    panel_counter := panel_counter + 1;

    -- 소형게시대-4
    PERFORM insert_led_panel_bulk(
        v_dongjak_gu_id,
        panel_counter,
        null,
        '소형게시대-4',
        v_sadang_dong_id,
        1920,
        1080,
        380600,
        34000,
        340000,
        0,
        6600,
        '1 month'
    );
    panel_counter := panel_counter + 1;

    -- 소형게시대-5
    PERFORM insert_led_panel_bulk(
        v_dongjak_gu_id,
        panel_counter,
        null,
        '소형게시대-5',
        v_sadang_dong_id,
        1920,
        1080,
        380600,
        34000,
        340000,
        0,
        6600,
        '1 month'
    );
    panel_counter := panel_counter + 1;

    -- 소형게시대-6
    PERFORM insert_led_panel_bulk(
        v_dongjak_gu_id,
        panel_counter,
        null,
        '소형게시대-6',
        v_sadang_dong_id,
        1920,
        1080,
        380600,
        34000,
        340000,
        0,
        6600,
        '1 month'
    );
    panel_counter := panel_counter + 1;

    -- 상도터널 전자게시대
    PERFORM insert_led_panel_bulk(
        v_dongjak_gu_id,
        panel_counter,
        null,
        '상도터널 전자게시대',
        v_sadang_dong_id,
        368,
        208,
        380600,
        34000,
        340000,
        0,
        6600,
        '1 month'
    );
    panel_counter := panel_counter + 1;

    -- =================================================================
    -- 동대문구 LED 전자게시대 (768*384 픽셀, 561,000원)
    -- =================================================================
    
    -- 전농동 LED
    PERFORM insert_led_panel_bulk(
        v_dongdaemun_gu_id,
        panel_counter,
        '전농동 LED',
        '서울 동대문구 전농동 234-56',
        v_jeonnong_dong_id,
        768,
        384,
        561000,
        50000,
        500000,
        0,
        11000,
        '1 month'
    );
    panel_counter := panel_counter + 1;

    RAISE NOTICE 'LED 전자게시대 데이터 삽입 완료: 총 %개 패널', panel_counter - 1;

END $$;

-- =================================================================
-- PART 4: 데이터 검증
-- =================================================================

-- 삽입된 데이터 확인
SELECT 
    pi.panel_code,
    pi.nickname,
    pi.address,
    rg.name as gu_name,
    rd.name as dong_name,
    lpd.panel_width,
    lpd.panel_height,
    lsi.total_price,
    lsi.tax_price,
    lsi.advertising_fee,
    lsi.administrative_fee,
    lsi.price_unit,
    lsi.panel_slot_status
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
JOIN region_dong rd ON pi.region_dong_id = rd.id
JOIN led_panel_details lpd ON pi.id = lpd.panel_info_id
JOIN led_slot_info lsi ON pi.id = lsi.panel_info_id
WHERE pi.panel_type = 'led' AND rg.name IN ('강동구', '광진구', '관악구', '동작구', '동대문구')
ORDER BY rg.name, pi.panel_code;

-- 구별 통계
SELECT 
    rg.name as gu_name,
    COUNT(*) as panel_count,
    AVG(lsi.total_price) as avg_total_price,
    AVG(lsi.advertising_fee) as avg_advertising_fee,
    AVG(lsi.tax_price) as avg_tax_price,
    AVG(lsi.administrative_fee) as avg_administrative_fee
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
JOIN led_slot_info lsi ON pi.id = lsi.panel_info_id
WHERE pi.panel_type = 'led' AND rg.name IN ('강동구', '광진구', '관악구', '동작구', '동대문구')
GROUP BY rg.name
ORDER BY rg.name;

-- =================================================================
-- PART 5: 고덕동 LED 패널 추가 (굽은다리역 사거리)
-- =================================================================

DO $$
DECLARE
    v_gangdong_gu_id UUID;
    v_godeok_dong_id UUID;
BEGIN
    -- Get 구 ID
    SELECT id INTO v_gangdong_gu_id FROM region_gu WHERE name = '강동구' LIMIT 1;
    
    -- Get 동 ID
    SELECT id INTO v_godeok_dong_id FROM region_dong WHERE district_code = (SELECT code FROM region_gu WHERE name = '강동구') AND name = '고덕동' LIMIT 1;

    -- 고덕동 LED (굽은다리역 사거리)
    PERFORM insert_led_panel_bulk(
        v_gangdong_gu_id,
        5,      -- panel_code 5로 고정
        NULL,   -- nickname null
        '굽은다리역 사거리',
        v_godeok_dong_id,
        800,    -- 강동구 픽셀 사이즈
        416,
        561000, -- 강동구 가격
        50000,  -- tax_price
        500000, -- advertising_fee
        0,      -- road_usage_fee
        11000,  -- administrative_fee
        '1 month'
    );

    RAISE NOTICE '고덕동 LED 패널 추가 완료: panel_code 5, 굽은다리역 사거리';
END $$;

-- =================================================================
-- PART 6: 동작구 추가 LED 패널들
-- =================================================================

DO $$
DECLARE
    v_dongjak_gu_id UUID;
    v_sadang_dong_id UUID;
BEGIN
    -- Get 구 ID
    SELECT id INTO v_dongjak_gu_id FROM region_gu WHERE name = '동작구' LIMIT 1;
    
    -- Get 동 ID
    SELECT id INTO v_sadang_dong_id FROM region_dong WHERE district_code = (SELECT code FROM region_gu WHERE name = '동작구') AND name = '사당동' LIMIT 1;

    -- 소형게시대-2
    PERFORM insert_led_panel_bulk(
        v_dongjak_gu_id,
        NULL,   -- panel_code는 자동 생성
        null,
        '소형게시대-2',
        v_sadang_dong_id,
        1920,
        1080,
        380600,
        34000,
        340000,
        0,
        6600,
        '1 month'
    );

    -- 소형게시대-3
    PERFORM insert_led_panel_bulk(
        v_dongjak_gu_id,
        NULL,   -- panel_code는 자동 생성
        null,
        '소형게시대-3',
        v_sadang_dong_id,
        1920,
        1080,
        380600,
        34000,
        340000,
        0,
        6600,
        '1 month'
    );

    -- 소형게시대-4
    PERFORM insert_led_panel_bulk(
        v_dongjak_gu_id,
        NULL,   -- panel_code는 자동 생성
        null,
        '소형게시대-4',
        v_sadang_dong_id,
        1920,
        1080,
        380600,
        34000,
        340000,
        0,
        6600,
        '1 month'
    );

    -- 소형게시대-5
    PERFORM insert_led_panel_bulk(
        v_dongjak_gu_id,
        NULL,   -- panel_code는 자동 생성
        null,
        '소형게시대-5',
        v_sadang_dong_id,
        1920,
        1080,
        380600,
        34000,
        340000,
        0,
        6600,
        '1 month'
    );

    -- 소형게시대-6
    PERFORM insert_led_panel_bulk(
        v_dongjak_gu_id,
        NULL,   -- panel_code는 자동 생성
        null,
        '소형게시대-6',
        v_sadang_dong_id,
        1920,
        1080,
        380600,
        34000,
        340000,
        0,
        6600,
        '1 month'
    );

    -- 상도터널 전자게시대
    PERFORM insert_led_panel_bulk(
        v_dongjak_gu_id,
        NULL,   -- panel_code는 자동 생성
        null,
        '상도터널 전자게시대',
        v_sadang_dong_id,
        368,
        208,
        380600,
        34000,
        340000,
        0,
        6600,
        '1 month'
    );

    RAISE NOTICE '동작구 추가 LED 패널들 삽입 완료: 소형게시대-2~6, 상도터널 전자게시대';
END $$;