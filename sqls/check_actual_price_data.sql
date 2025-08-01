-- 실제 가격 데이터 확인 스크립트

-- 1. 서대문구 실제 가격 정책 확인
SELECT 
    '서대문구 실제 가격 정책' as info,
    p.panel_code,
    bs.slot_number,
    bsp.price_usage_type,
    bsp.total_price,
    bsp.created_at
FROM banner_slot_price_policy bsp
JOIN banner_slots bs ON bsp.banner_slot_id = bs.id
JOIN panels p ON bs.panel_id = p.id
JOIN region_gu rg ON p.region_gu_id = rg.id
WHERE rg.name = '서대문구'
  AND bs.slot_number = 1
ORDER BY p.panel_code, bsp.price_usage_type;

-- 2. 관악구 실제 가격 정책 확인
SELECT 
    '관악구 실제 가격 정책' as info,
    p.panel_code,
    bs.slot_number,
    bsp.price_usage_type,
    bsp.total_price,
    bsp.created_at
FROM banner_slot_price_policy bsp
JOIN banner_slots bs ON bsp.banner_slot_id = bs.id
JOIN panels p ON bs.panel_id = p.id
JOIN region_gu rg ON p.region_gu_id = rg.id
WHERE rg.name = '관악구'
  AND bs.slot_number = 1
ORDER BY p.panel_code, bsp.price_usage_type;

-- 3. 각 구별 price_usage_type 개수 확인
SELECT 
    '구별 price_usage_type 개수' as info,
    rg.name as district_name,
    bsp.price_usage_type,
    COUNT(*) as count,
    STRING_AGG(DISTINCT bsp.total_price::text, ', ') as prices
FROM banner_slot_price_policy bsp
JOIN banner_slots bs ON bsp.banner_slot_id = bs.id
JOIN panels p ON bs.panel_id = p.id
JOIN region_gu rg ON p.region_gu_id = rg.id
WHERE bs.slot_number = 1
GROUP BY rg.name, bsp.price_usage_type
ORDER BY rg.name, bsp.price_usage_type;

-- 4. API가 가져와야 할 데이터 (slot_number = 1, default 타입만)
SELECT 
    'API가 가져와야 할 데이터' as info,
    rg.name as district_name,
    COUNT(*) as policy_count,
    STRING_AGG(DISTINCT bsp.total_price::text, ', ') as prices
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

-- 5. 프론트엔드가 기대하는 데이터 vs 실제 데이터 비교
SELECT 
    '프론트엔드 vs 실제 데이터 비교' as info,
    rg.name as district_name,
    CASE 
        WHEN rg.name = '서대문구' THEN '상업용(123000), 행정용(85000/60000)'
        WHEN rg.name = '관악구' THEN '상업용(110000), 자체제작(78000)'
        WHEN rg.name = '송파구' THEN '상업용(139800), 행정용(109230)'
        WHEN rg.name = '용산구' THEN '상업용(140000/120000), 행정용(99000/79000)'
        WHEN rg.name = '마포구' THEN '상업용(130000/100000), 행정용(93600/70000)'
        ELSE '기타'
    END as expected_prices,
    STRING_AGG(DISTINCT bsp.price_usage_type || '(' || bsp.total_price::text || ')', ', ') as actual_prices
FROM banner_slot_price_policy bsp
JOIN banner_slots bs ON bsp.banner_slot_id = bs.id
JOIN panels p ON bs.panel_id = p.id
JOIN region_gu rg ON p.region_gu_id = rg.id
WHERE bs.slot_number = 1
GROUP BY rg.name
ORDER BY rg.name; 