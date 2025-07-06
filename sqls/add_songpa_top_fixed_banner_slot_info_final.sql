-- 송파구 상단광고 banner_slot_info 데이터 추가
-- 20개 패널, 사이즈: 500x100, price_unit: 6 months, 1 year, 3 years

-- 1. 먼저 송파구 상단광고 패널 확인
SELECT 
    pi.id,
    pi.panel_code,
    pi.nickname,
    pi.address,
    pi.panel_type,
    pi.max_banner
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '송파구' 
AND pi.panel_type = 'top-fixed'
AND pi.display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'
ORDER BY pi.panel_code;

-- 2. banner_slot_info 데이터 추가
-- 6 months, 1 year, 3 years 각각에 대해 슬롯 생성
INSERT INTO banner_slot_info (
    id,
    panel_info_id,
    slot_number,
    slot_name,
    max_width,
    max_height,
    total_price,
    tax_price,
    banner_type,
    price_unit,
    is_premium,
    panel_slot_status,
    notes,
    road_usage_fee,
    advertising_fee
)
SELECT 
    gen_random_uuid(),
    pi.id as panel_info_id,
    slot_num.slot_number,
    '' as slot_name,
    500 as max_width,
    100 as max_height,
    CASE 
        WHEN slot_num.price_unit = '1 year' THEN 5000000
        ELSE 0 -- 6 months, 3 years는 상담문의
    END as total_price,
    0 as tax_price, -- 모든 경우 0
    'top-fixed' as banner_type,
    slot_num.price_unit,
    FALSE as is_premium,
    'available' as panel_slot_status,
    '' as notes,
    0 as road_usage_fee, -- 모든 경우 0
    0 as advertising_fee -- 모든 경우 0
FROM panel_info pi
CROSS JOIN (VALUES 
    (1, '6 months'::price_unit_enum),
    (2, '1 year'::price_unit_enum),
    (3, '3 years'::price_unit_enum)
) AS slot_num(slot_number, price_unit)
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '송파구' 
AND pi.panel_type = 'top-fixed'
AND pi.display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'
ORDER BY pi.panel_code, slot_num.slot_number;

-- 3. 삽입된 데이터 확인
SELECT 
    bsi.id,
    bsi.panel_info_id,
    bsi.slot_number,
    bsi.max_width,
    bsi.max_height,
    bsi.total_price,
    bsi.tax_price,
    bsi.banner_type,
    bsi.price_unit,
    bsi.road_usage_fee,
    bsi.advertising_fee,
    pi.nickname,
    pi.panel_code,
    pi.max_banner,
    pi.panel_type,
    rg.name as region_name
FROM banner_slot_info bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '송파구' 
AND pi.panel_type = 'top-fixed'
ORDER BY pi.panel_code, bsi.slot_number; 