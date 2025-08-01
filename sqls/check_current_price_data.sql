-- 현재 가격 데이터 상태 확인

-- 1. 전체 가격 정책 현황
SELECT 
    '전체 가격 정책 현황' as info,
    COUNT(*) as total_policies,
    COUNT(DISTINCT banner_slot_id) as unique_slots,
    COUNT(DISTINCT price_usage_type) as unique_types
FROM banner_slot_price_policy;

-- 2. 구별 패널 타입별 가격 정책 확인
SELECT 
    '구별 패널 타입별 가격 정책' as info,
    rg.name as district_name,
    p.panel_type,
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
  AND bs.slot_number = 1
ORDER BY rg.name, p.panel_type, p.panel_code, bsp.price_usage_type;

-- 3. 관악구 상세 확인
SELECT 
    '관악구 상세' as info,
    p.panel_type,
    p.panel_code,
    bsp.price_usage_type,
    bsp.total_price
FROM banner_slot_price_policy bsp
JOIN banner_slots bs ON bsp.banner_slot_id = bs.id
JOIN panels p ON bs.panel_id = p.id
JOIN region_gu rg ON p.region_gu_id = rg.id
WHERE rg.name = '관악구'
  AND bs.slot_number = 1
ORDER BY p.panel_code, bsp.price_usage_type;

-- 4. 용산구 상세 확인
SELECT 
    '용산구 상세' as info,
    p.panel_type,
    p.panel_code,
    bsp.price_usage_type,
    bsp.total_price
FROM banner_slot_price_policy bsp
JOIN banner_slots bs ON bsp.banner_slot_id = bs.id
JOIN panels p ON bs.panel_id = p.id
JOIN region_gu rg ON p.region_gu_id = rg.id
WHERE rg.name = '용산구'
  AND bs.slot_number = 1
ORDER BY p.panel_code, bsp.price_usage_type;

-- 5. 마포구 상세 확인
SELECT 
    '마포구 상세' as info,
    p.panel_type,
    p.panel_code,
    bsp.price_usage_type,
    bsp.total_price
FROM banner_slot_price_policy bsp
JOIN banner_slots bs ON bsp.banner_slot_id = bs.id
JOIN panels p ON bs.panel_id = p.id
JOIN region_gu rg ON p.region_gu_id = rg.id
WHERE rg.name = '마포구'
  AND bs.slot_number = 1
ORDER BY p.panel_code, bsp.price_usage_type;

-- 6. 서대문구 상세 확인
SELECT 
    '서대문구 상세' as info,
    p.panel_type,
    p.panel_code,
    bsp.price_usage_type,
    bsp.total_price
FROM banner_slot_price_policy bsp
JOIN banner_slots bs ON bsp.banner_slot_id = bs.id
JOIN panels p ON bs.panel_id = p.id
JOIN region_gu rg ON p.region_gu_id = rg.id
WHERE rg.name = '서대문구'
  AND bs.slot_number = 1
ORDER BY p.panel_code, bsp.price_usage_type;

-- 7. 송파구 상세 확인
SELECT 
    '송파구 상세' as info,
    p.panel_type,
    p.panel_code,
    bsp.price_usage_type,
    bsp.total_price
FROM banner_slot_price_policy bsp
JOIN banner_slots bs ON bsp.banner_slot_id = bs.id
JOIN panels p ON bs.panel_id = p.id
JOIN region_gu rg ON p.region_gu_id = rg.id
WHERE rg.name = '송파구'
  AND bs.slot_number = 1
ORDER BY p.panel_code, bsp.price_usage_type; 