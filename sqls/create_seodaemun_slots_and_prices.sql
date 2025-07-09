-- 서대문구 panel_code 17-24에 대한 banner_slot_info 생성
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
WHERE pi.panel_code IN ('17', '18', '19', '20', '21', '22', '23', '24')
AND pi.region_gu_id = '55ff1814-90a7-4a65-8887-e8993e90da49';

-- 서대문구 panel_code 17-24에 대한 가격 정책 추가
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
    'default' as price_usage_type,
    123000 as total_price,
    10000 as tax_price,
    22600 as road_usage_fee,
    90400 as advertising_fee,
    NOW() as created_at,
    NOW() as updated_at
FROM banner_slot_info bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
WHERE pi.panel_code IN ('17', '18', '19', '20', '21', '22', '23', '24')
AND pi.region_gu_id = '55ff1814-90a7-4a65-8887-e8993e90da49'
AND bsi.banner_type = 'panel'
AND bsi.slot_number >= 1;

-- 생성된 banner_slot_info 확인
SELECT 
    pi.panel_code,
    pi.max_banner,
    COUNT(bsi.id) as created_slots
FROM panel_info pi
LEFT JOIN banner_slot_info bsi ON pi.id = bsi.panel_info_id
WHERE pi.panel_code IN ('17', '18', '19', '20', '21', '22', '23', '24')
AND pi.region_gu_id = '55ff1814-90a7-4a65-8887-e8993e90da49'
GROUP BY pi.panel_code, pi.max_banner
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
WHERE pi.panel_code IN ('17', '18', '19', '20', '21', '22', '23', '24')
AND pi.region_gu_id = '55ff1814-90a7-4a65-8887-e8993e90da49'
ORDER BY pi.panel_code, bsi.slot_number; 