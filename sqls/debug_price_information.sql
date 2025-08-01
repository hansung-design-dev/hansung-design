-- 현수막게시대 가격 정보 디버깅 스크립트

-- 1. 현재 가격 정책 데이터 현황
SELECT 
    '가격 정책 전체 현황' as info,
    COUNT(*) as total_policies,
    COUNT(DISTINCT banner_slot_id) as unique_banner_slots,
    COUNT(DISTINCT price_usage_type) as unique_usage_types
FROM banner_slot_price_policy;

-- 2. 구별 가격 정책 현황
SELECT 
    '구별 가격 정책 현황' as info,
    rg.name as district_name,
    COUNT(*) as total_policies,
    COUNT(DISTINCT bsp.banner_slot_id) as unique_slots,
    COUNT(DISTINCT bsp.price_usage_type) as usage_types,
    MIN(bsp.total_price) as min_price,
    MAX(bsp.total_price) as max_price,
    AVG(bsp.total_price) as avg_price
FROM banner_slot_price_policy bsp
JOIN banner_slots bs ON bsp.banner_slot_id = bs.id
JOIN panels p ON bs.panel_id = p.id
JOIN region_gu rg ON p.region_gu_id = rg.id
JOIN display_types dt ON p.display_type_id = dt.id
WHERE dt.name = 'banner_display'
  AND rg.is_active = 'true'
GROUP BY rg.id, rg.name
ORDER BY rg.name;

-- 3. 가격 정책 상세 정보 (구별)
SELECT 
    '가격 정책 상세 정보' as info,
    rg.name as district_name,
    p.panel_code,
    p.panel_type,
    bs.slot_number,
    bsp.price_usage_type,
    bsp.tax_price,
    bsp.road_usage_fee,
    bsp.advertising_fee,
    bsp.total_price,
    bsp.created_at
FROM banner_slot_price_policy bsp
JOIN banner_slots bs ON bsp.banner_slot_id = bs.id
JOIN panels p ON bs.panel_id = p.id
JOIN region_gu rg ON p.region_gu_id = rg.id
JOIN display_types dt ON p.display_type_id = dt.id
WHERE dt.name = 'banner_display'
  AND rg.is_active = 'true'
ORDER BY rg.name, p.panel_code, bs.slot_number, bsp.price_usage_type;

-- 4. API에서 사용하는 가격 정보 조회 방식 확인
SELECT 
    'API 가격 정보 조회 테스트' as info,
    rg.name as district_name,
    p.panel_code,
    bs.slot_number,
    bsp.price_usage_type,
    bsp.total_price
FROM banner_slot_price_policy bsp
JOIN banner_slots bs ON bsp.banner_slot_id = bs.id
JOIN panels p ON bs.panel_id = p.id
JOIN region_gu rg ON p.region_gu_id = rg.id
JOIN display_types dt ON p.display_type_id = dt.id
WHERE dt.name = 'banner_display'
  AND rg.is_active = 'true'
  AND bs.slot_number = 1  -- API에서 주로 사용하는 slot_number = 1
  AND bsp.price_usage_type = 'default'  -- API에서 주로 사용하는 타입
ORDER BY rg.name, p.panel_code;

-- 5. 특정 가격값 (110,000, 70,000) 검색
SELECT 
    '특정 가격값 검색' as info,
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
WHERE bsp.total_price IN (110000, 70000)
ORDER BY bsp.total_price, rg.name, p.panel_code;

-- 6. API 코드에서 사용하는 쿼리와 동일한 방식으로 테스트
SELECT 
    'API 쿼리 테스트' as info,
    rg.name as district_name,
    COUNT(DISTINCT p.id) as panel_count,
    COUNT(DISTINCT bs.id) as slot_count,
    COUNT(DISTINCT bsp.id) as policy_count,
    STRING_AGG(DISTINCT bsp.price_usage_type, ', ') as usage_types,
    STRING_AGG(DISTINCT bsp.total_price::text, ', ') as total_prices
FROM panels p
JOIN region_gu rg ON p.region_gu_id = rg.id
JOIN display_types dt ON p.display_type_id = dt.id
JOIN banner_slots bs ON p.id = bs.panel_id
JOIN banner_slot_price_policy bsp ON bs.id = bsp.banner_slot_id
WHERE dt.name = 'banner_display'
  AND rg.is_active = 'true'
  AND bs.slot_number = 1
GROUP BY rg.id, rg.name
ORDER BY rg.name;

-- 7. 프론트엔드에서 표시되는 가격 정보 확인
SELECT 
    '프론트엔드 가격 정보' as info,
    rg.name as district_name,
    p.panel_code,
    bs.slot_number,
    bsp.price_usage_type,
    bsp.total_price,
    CASE 
        WHEN bsp.total_price = 110000 THEN '110,000원 (의심스러운 값)'
        WHEN bsp.total_price = 70000 THEN '70,000원 (의심스러운 값)'
        ELSE bsp.total_price::text || '원'
    END as price_display
FROM banner_slot_price_policy bsp
JOIN banner_slots bs ON bsp.banner_slot_id = bs.id
JOIN panels p ON bs.panel_id = p.id
JOIN region_gu rg ON p.region_gu_id = rg.id
JOIN display_types dt ON p.display_type_id = dt.id
WHERE dt.name = 'banner_display'
  AND rg.is_active = 'true'
  AND bs.slot_number = 1
ORDER BY rg.name, p.panel_code, bsp.price_usage_type;

-- 8. 가격 정책 생성 이력 확인
SELECT 
    '가격 정책 생성 이력' as info,
    DATE(created_at) as created_date,
    COUNT(*) as policies_created,
    COUNT(DISTINCT banner_slot_id) as unique_slots,
    MIN(total_price) as min_price,
    MAX(total_price) as max_price
FROM banner_slot_price_policy
GROUP BY DATE(created_at)
ORDER BY created_date DESC
LIMIT 10; 