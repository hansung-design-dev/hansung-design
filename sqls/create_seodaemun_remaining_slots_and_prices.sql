-- 서대문구 panel_code 6-16에 대한 banner_slot_info 생성 (max_width = 600, max_height = 70)
INSERT INTO banner_slot_info (panel_info_id, slot_number, banner_type, max_width, max_height, created_at, updated_at)
SELECT 
    pi.id as panel_info_id,
    generate_series(1, pi.max_banner) as slot_number,
    'panel' as banner_type,
    600 as max_width,
    70 as max_height,
    NOW() as created_at,
    NOW() as updated_at
FROM panel_info pi
WHERE pi.panel_code IN ('6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16')
AND pi.region_gu_id = '55ff1814-90a7-4a65-8887-e8993e90da49';

-- 서대문구 panel_code 1-5에 대한 banner_slot_info 생성 (max_width = 490, max_height = 70)
INSERT INTO banner_slot_info (panel_info_id, slot_number, banner_type, max_width, max_height, created_at, updated_at)
SELECT 
    pi.id as panel_info_id,
    generate_series(1, pi.max_banner) as slot_number,
    'panel' as banner_type,
    490 as max_width,
    70 as max_height,
    NOW() as created_at,
    NOW() as updated_at
FROM panel_info pi
WHERE pi.panel_code IN ('1', '2', '3', '4', '5')
AND pi.region_gu_id = '55ff1814-90a7-4a65-8887-e8993e90da49';

-- 서대문구 panel_code 6-16에 대한 가격 정책 추가 (public-institution)
INSERT INTO banner_slot_price_policy (
    id,
    banner_slot_info_id, 
    price_usage_type, 
    total_price, 
    tax_price, 
    road_usage_fee, 
    advertising_fee, 
    created_at, 
    updated_at
)
SELECT 
    gen_random_uuid() as id,
    bsi.id as banner_slot_info_id,
    'public-institution' as price_usage_type,
    60000 as total_price,
    0 as tax_price,
    0 as road_usage_fee,
    60000 as advertising_fee,
    NOW() as created_at,
    NOW() as updated_at
FROM banner_slot_info bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
WHERE pi.panel_code IN ('6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16')
AND pi.region_gu_id = '55ff1814-90a7-4a65-8887-e8993e90da49'
AND bsi.banner_type = 'panel'
AND bsi.slot_number >= 1;

-- 서대문구 panel_code 1-5에 대한 가격 정책 추가 (public-institution)
INSERT INTO banner_slot_price_policy (
    id,
    banner_slot_info_id, 
    price_usage_type, 
    total_price, 
    tax_price, 
    road_usage_fee, 
    advertising_fee, 
    created_at, 
    updated_at
)
SELECT 
    gen_random_uuid() as id,
    bsi.id as banner_slot_info_id,
    'public-institution' as price_usage_type,
    85000 as total_price,
    0 as tax_price,
    0 as road_usage_fee,
    85000 as advertising_fee,
    NOW() as created_at,
    NOW() as updated_at
FROM banner_slot_info bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
WHERE pi.panel_code IN ('1', '2', '3', '4', '5')
AND pi.region_gu_id = '55ff1814-90a7-4a65-8887-e8993e90da49'
AND bsi.banner_type = 'panel'
AND bsi.slot_number >= 1;

-- 생성된 banner_slot_info 확인
SELECT 
    pi.panel_code,
    pi.max_banner,
    COUNT(bsi.id) as created_slots,
    bsi.max_width,
    bsi.max_height
FROM panel_info pi
LEFT JOIN banner_slot_info bsi ON pi.id = bsi.panel_info_id
WHERE pi.panel_code IN ('1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16')
AND pi.region_gu_id = '55ff1814-90a7-4a65-8887-e8993e90da49'
GROUP BY pi.panel_code, pi.max_banner, bsi.max_width, bsi.max_height
ORDER BY pi.panel_code;

-- 생성된 가격 정책 확인
SELECT 
    pi.panel_code,
    bsi.slot_number,
    bspp.price_usage_type,
    bspp.total_price,
    bspp.tax_price,
    bspp.road_usage_fee,
    bspp.advertising_fee
FROM banner_slot_price_policy bspp
JOIN banner_slot_info bsi ON bspp.banner_slot_info_id = bsi.id
JOIN panel_info pi ON bsi.panel_info_id = pi.id
WHERE pi.panel_code IN ('1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16')
AND pi.region_gu_id = '55ff1814-90a7-4a65-8887-e8993e90da49'
ORDER BY pi.panel_code, bsi.slot_number; 