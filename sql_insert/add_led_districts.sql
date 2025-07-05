-- LED 전자게시대에 용산구, 영등포구, 도봉구 추가
-- 이 구들은 상세페이지가 없고 "현재 준비 중입니다" 문구만 표시
-- panel_status를 'active'로 설정하여 카드에 표시되도록 함

-- 1. LED 디스플레이 타입 ID 조회
DO $$
DECLARE
    led_display_type_id UUID;
BEGIN
    -- LED 디스플레이 타입 ID 가져오기
    SELECT id INTO led_display_type_id 
    FROM display_types 
    WHERE name = 'led_display';
    
    -- 용산구 LED 패널 추가 (panel_status = 'active'로 설정하여 카드에 표시)
    INSERT INTO panel_info (
        id,
        panel_code,
        nickname,
        address,
        panel_status,
        panel_type,
        display_type_id,
        region_gu_id,
        region_dong_id,
        created_at,
        updated_at
    )
    SELECT 
        gen_random_uuid(),
        1,
        '용산구 LED 전자게시대',
        '서울특별시 용산구',
        'active', -- active 상태로 설정하여 카드에 표시
        'led',
        led_display_type_id,
        rg.id,
        rd.id,
        NOW(),
        NOW()
    FROM region_gu rg
    LEFT JOIN region_dong rd ON rd.district_code = rg.code
    WHERE rg.name = '용산구'
    AND rd.name IS NULL -- 동 정보 없음
    LIMIT 1;

    -- 영등포구 LED 패널 추가 (panel_status = 'active'로 설정하여 카드에 표시)
    INSERT INTO panel_info (
        id,
        panel_code,
        nickname,
        address,
        panel_status,
        panel_type,
        display_type_id,
        region_gu_id,
        region_dong_id,
        created_at,
        updated_at
    )
    SELECT 
        gen_random_uuid(),
        1,
        '영등포구 LED 전자게시대',
        '서울특별시 영등포구',
        'active', -- active 상태로 설정하여 카드에 표시
        'led',
        led_display_type_id,
        rg.id,
        rd.id,
        NOW(),
        NOW()
    FROM region_gu rg
    LEFT JOIN region_dong rd ON rd.district_code = rg.code
    WHERE rg.name = '영등포구'
    AND rd.name IS NULL -- 동 정보 없음
    LIMIT 1;

    -- 도봉구 LED 패널 추가 (panel_status = 'active'로 설정하여 카드에 표시)
    INSERT INTO panel_info (
        id,
        panel_code,
        nickname,
        address,
        panel_status,
        panel_type,
        display_type_id,
        region_gu_id,
        region_dong_id,
        created_at,
        updated_at
    )
    SELECT 
        gen_random_uuid(),
        1,
        '도봉구 LED 전자게시대',
        '서울특별시 도봉구',
        'active', -- active 상태로 설정하여 카드에 표시
        'led',
        led_display_type_id,
        rg.id,
        rd.id,
        NOW(),
        NOW()
    FROM region_gu rg
    LEFT JOIN region_dong rd ON rd.district_code = rg.code
    WHERE rg.name = '도봉구'
    AND rd.name IS NULL -- 동 정보 없음
    LIMIT 1;

    RAISE NOTICE '용산구, 영등포구, 도봉구 LED 전자게시대 패널이 추가되었습니다. (panel_status: active)';
END $$;

-- 2. 추가된 패널 확인
SELECT 
    pi.id,
    pi.panel_code,
    pi.nickname,
    pi.address,
    pi.panel_status,
    pi.panel_type,
    rg.name as region_gu_name,
    dt.name as display_type_name
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
JOIN display_types dt ON pi.display_type_id = dt.id
WHERE rg.name IN ('용산구', '영등포구', '도봉구')
AND dt.name = 'led_display'
ORDER BY rg.name; 