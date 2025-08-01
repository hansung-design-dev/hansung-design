-- API가 실제로 가져오는 가격 데이터 확인 스크립트

-- 1. API 쿼리와 동일한 방식으로 데이터 조회
SELECT 
    'API 쿼리 테스트' as info,
    rg.name as district_name,
    p.panel_code,
    bs.slot_number,
    bsp.price_usage_type,
    bsp.total_price,
    bsp.tax_price,
    bsp.road_usage_fee,
    bsp.advertising_fee
FROM banner_slot_price_policy bsp
JOIN banner_slots bs ON bsp.banner_slot_id = bs.id
JOIN panels p ON bs.panel_id = p.id
JOIN region_gu rg ON p.region_gu_id = rg.id
JOIN display_types dt ON p.display_type_id = dt.id
WHERE dt.name = 'banner_display'
  AND rg.is_active = 'true'
  AND bs.slot_number = 1  -- API에서 사용하는 slot_number = 1
  AND bsp.price_usage_type = 'default'  -- API에서 주로 사용하는 타입
ORDER BY rg.name, p.panel_code;

-- 2. 구별로 올바른 가격과 비교
SELECT 
    '구별 가격 비교' as info,
    rg.name as district_name,
    COUNT(*) as policy_count,
    STRING_AGG(DISTINCT bsp.total_price::text, ', ') as total_prices,
    MIN(bsp.total_price) as min_price,
    MAX(bsp.total_price) as max_price
FROM banner_slot_price_policy bsp
JOIN banner_slots bs ON bsp.banner_slot_id = bs.id
JOIN panels p ON bs.panel_id = p.id
JOIN region_gu rg ON p.region_gu_id = rg.id
JOIN display_types dt ON p.display_type_id = dt.id
WHERE dt.name = 'banner_display'
  AND rg.is_active = 'true'
  AND bs.slot_number = 1
  AND bsp.price_usage_type = 'default'
GROUP BY rg.name
ORDER BY rg.name;

-- 3. 특정 구의 상세 가격 정보 (예: 관악구)
SELECT 
    '관악구 상세 가격' as info,
    p.panel_code,
    bs.slot_number,
    bsp.price_usage_type,
    bsp.total_price,
    CASE 
        WHEN bsp.total_price = 110000 THEN '✅ 올바른 가격'
        WHEN bsp.total_price = 70000 THEN '❌ 잘못된 가격'
        ELSE '⚠️ 기타 가격'
    END as price_status
FROM banner_slot_price_policy bsp
JOIN banner_slots bs ON bsp.banner_slot_id = bs.id
JOIN panels p ON bs.panel_id = p.id
JOIN region_gu rg ON p.region_gu_id = rg.id
WHERE rg.name = '관악구'
  AND bs.slot_number = 1
ORDER BY p.panel_code, bsp.price_usage_type;

-- 4. 송파구 상세 가격 정보
SELECT 
    '송파구 상세 가격' as info,
    p.panel_code,
    bs.slot_number,
    bsp.price_usage_type,
    bsp.total_price,
    CASE 
        WHEN bsp.total_price = 139800 THEN '✅ 올바른 가격'
        WHEN bsp.total_price = 109230 THEN '✅ 올바른 가격 (행정용)'
        ELSE '⚠️ 기타 가격'
    END as price_status
FROM banner_slot_price_policy bsp
JOIN banner_slots bs ON bsp.banner_slot_id = bs.id
JOIN panels p ON bs.panel_id = p.id
JOIN region_gu rg ON p.region_gu_id = rg.id
WHERE rg.name = '송파구'
  AND bs.slot_number = 1
ORDER BY p.panel_code, bsp.price_usage_type;

-- 5. 서대문구 상세 가격 정보
SELECT 
    '서대문구 상세 가격' as info,
    p.panel_code,
    bs.slot_number,
    bsp.price_usage_type,
    bsp.total_price,
    CASE 
        WHEN bsp.total_price = 123000 THEN '✅ 올바른 가격 (상업용)'
        WHEN bsp.total_price = 85000 THEN '✅ 올바른 가격 (행정용)'
        WHEN bsp.total_price = 60000 THEN '✅ 올바른 가격 (행정용)'
        ELSE '⚠️ 기타 가격'
    END as price_status
FROM banner_slot_price_policy bsp
JOIN banner_slots bs ON bsp.banner_slot_id = bs.id
JOIN panels p ON bs.panel_id = p.id
JOIN region_gu rg ON p.region_gu_id = rg.id
WHERE rg.name = '서대문구'
  AND bs.slot_number = 1
ORDER BY p.panel_code, bsp.price_usage_type;

-- 6. 용산구 상세 가격 정보
SELECT 
    '용산구 상세 가격' as info,
    p.panel_code,
    bs.slot_number,
    bsp.price_usage_type,
    bsp.total_price,
    CASE 
        WHEN bsp.total_price = 140000 THEN '✅ 올바른 가격 (상업용)'
        WHEN bsp.total_price = 99000 THEN '✅ 올바른 가격 (행정용)'
        WHEN bsp.total_price = 120000 THEN '✅ 올바른 가격 (상업용)'
        WHEN bsp.total_price = 79000 THEN '✅ 올바른 가격 (행정용)'
        ELSE '⚠️ 기타 가격'
    END as price_status
FROM banner_slot_price_policy bsp
JOIN banner_slots bs ON bsp.banner_slot_id = bs.id
JOIN panels p ON bs.panel_id = p.id
JOIN region_gu rg ON p.region_gu_id = rg.id
WHERE rg.name = '용산구'
  AND bs.slot_number = 1
ORDER BY p.panel_code, bsp.price_usage_type;

-- 7. 마포구 상세 가격 정보
SELECT 
    '마포구 상세 가격' as info,
    p.panel_code,
    p.panel_type,
    bs.slot_number,
    bsp.price_usage_type,
    bsp.total_price,
    CASE 
        WHEN bsp.total_price = 130000 AND p.panel_type = 'multi_panel' THEN '✅ 올바른 가격 (연립형 상업용)'
        WHEN bsp.total_price = 93600 AND p.panel_type = 'multi_panel' THEN '✅ 올바른 가격 (연립형 행정용)'
        WHEN bsp.total_price = 100000 AND p.panel_type = 'lower_panel' THEN '✅ 올바른 가격 (저단형 상업용)'
        WHEN bsp.total_price = 70000 AND p.panel_type = 'lower_panel' THEN '✅ 올바른 가격 (저단형 행정용)'
        WHEN bsp.total_price = 0 AND p.panel_type = 'lower_panel' THEN '✅ 올바른 가격 (저단형 자리대여)'
        ELSE '⚠️ 기타 가격'
    END as price_status
FROM banner_slot_price_policy bsp
JOIN banner_slots bs ON bsp.banner_slot_id = bs.id
JOIN panels p ON bs.panel_id = p.id
JOIN region_gu rg ON p.region_gu_id = rg.id
WHERE rg.name = '마포구'
  AND bs.slot_number = 1
ORDER BY p.panel_code, bsp.price_usage_type;

-- 8. 잘못된 가격이 있는지 확인
SELECT 
    '잘못된 가격 확인' as info,
    rg.name as district_name,
    p.panel_code,
    bsp.price_usage_type,
    bsp.total_price,
    '❌ 의심스러운 가격' as status
FROM banner_slot_price_policy bsp
JOIN banner_slots bs ON bsp.banner_slot_id = bs.id
JOIN panels p ON bs.panel_id = p.id
JOIN region_gu rg ON p.region_gu_id = rg.id
WHERE bsp.total_price IN (110000, 70000)  -- 의심스러운 가격
  AND bs.slot_number = 1
ORDER BY rg.name, p.panel_code; 