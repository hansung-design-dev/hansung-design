-- 송파구 가격 정책 데이터 입력
-- 현수막게시대와 상단광고 가격 정책 적용

-- 1. 현수막게시대 default 타입 가격 (banner_type = 'panel', slot_number >= 1)
INSERT INTO banner_slot_price_policy (
    id,
    banner_slot_info_id,
    price_usage_type,
    total_price,
    tax_price,
    road_usage_fee,
    advertising_fee
)
SELECT 
    gen_random_uuid(),
    bsi.id,
    'default'::price_usage_type as price_usage_type,
    139800 as total_price,
    10000 as tax_price,
    20570 as road_usage_fee,
    109230 as advertising_fee
FROM banner_slot_info bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '송파구'
  AND bsi.banner_type = 'panel'
  AND bsi.slot_number >= 1
ON CONFLICT (banner_slot_info_id, price_usage_type) DO NOTHING;

-- 2. 현수막게시대 public-institution 타입 가격 (banner_type = 'panel', slot_number >= 1)
INSERT INTO banner_slot_price_policy (
    id,
    banner_slot_info_id,
    price_usage_type,
    total_price,
    tax_price,
    road_usage_fee,
    advertising_fee
)
SELECT 
    gen_random_uuid(),
    bsi.id,
    'public-institution'::price_usage_type as price_usage_type,
    139800 as total_price,
    0 as tax_price,
    0 as road_usage_fee,
    139800 as advertising_fee
FROM banner_slot_info bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '송파구'
  AND bsi.banner_type = 'panel'
  AND bsi.slot_number >= 1
ON CONFLICT (banner_slot_info_id, price_usage_type) DO NOTHING;

-- 3. 상단광고 default 타입 가격 (banner_type = 'top-fixed', slot_number = 0, price_unit = '1 year')
INSERT INTO banner_slot_price_policy (
    id,
    banner_slot_info_id,
    price_usage_type,
    total_price,
    tax_price,
    road_usage_fee,
    advertising_fee
)
SELECT 
    gen_random_uuid(),
    bsi.id,
    'default'::price_usage_type as price_usage_type,
    139800 as total_price,
    0 as tax_price,
    0 as road_usage_fee,
    0 as advertising_fee
FROM banner_slot_info bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '송파구'
  AND bsi.banner_type = 'top-fixed'
  AND bsi.slot_number = 0
  AND bsi.price_unit = '1 year'
ON CONFLICT (banner_slot_info_id, price_usage_type) DO NOTHING;

-- 4. 입력된 데이터 확인
SELECT 
    rg.name as region_name,
    pi.panel_type,
    pi.panel_code,
    pi.nickname,
    bsi.slot_number,
    bsi.banner_type,
    bsi.price_unit,
    bspp.price_usage_type,
    bspp.total_price,
    bspp.tax_price,
    bspp.road_usage_fee,
    bspp.advertising_fee
FROM banner_slot_price_policy bspp
JOIN banner_slot_info bsi ON bspp.banner_slot_info_id = bsi.id
JOIN panel_info pi ON bsi.panel_info_id = pi.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '송파구'
ORDER BY 
    bsi.banner_type,
    pi.panel_code,
    bsi.slot_number,
    bspp.price_usage_type;

-- 5. 요약 통계
SELECT 
    rg.name as region_name,
    bsi.banner_type,
    bspp.price_usage_type,
    COUNT(*) as total_slots,
    AVG(bspp.total_price) as avg_total_price,
    AVG(bspp.tax_price) as avg_tax_price,
    AVG(bspp.road_usage_fee) as avg_road_usage_fee,
    AVG(bspp.advertising_fee) as avg_advertising_fee
FROM banner_slot_price_policy bspp
JOIN banner_slot_info bsi ON bspp.banner_slot_info_id = bsi.id
JOIN panel_info pi ON bsi.panel_info_id = pi.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '송파구'
GROUP BY 
    rg.name,
    bsi.banner_type,
    bspp.price_usage_type
ORDER BY 
    bsi.banner_type,
    bspp.price_usage_type; 