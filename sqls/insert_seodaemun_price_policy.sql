-- 서대문구 panel_code 17-24에 대한 가격 정책 추가
-- 가격: total_price = 123000, tax_price = 10000, road_usage_fee = 22600, advertising_fee = 90400
-- price_unit: 15 days

-- panel_code 17-24의 모든 banner_slot_info에 대해 가격 정책 추가
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
AND bsi.banner_type = 'panel'
AND bsi.slot_number >= 1;

-- 생성된 가격 정책 확인
SELECT 
    pi.panel_code,
    bsi.slot_number,
    bsi.banner_type,
    bspp.price_usage_type,
    bspp.total_price,
    bspp.tax_price,
    bspp.road_usage_fee,
    bspp.advertising_fee
FROM banner_slot_price_policy bspp
JOIN banner_slot_info bsi ON bspp.banner_slot_info_id = bsi.id
JOIN panel_info pi ON bsi.panel_info_id = pi.id
WHERE pi.panel_code IN ('17', '18', '19', '20', '21', '22', '23', '24')
ORDER BY pi.panel_code, bsi.slot_number;

-- 요약 통계
SELECT 
    pi.panel_code,
    pi.max_banner,
    COUNT(bsi.id) as total_slots,
    COUNT(bspp.id) as price_policies
FROM panel_info pi
LEFT JOIN banner_slot_info bsi ON pi.id = bsi.panel_info_id
LEFT JOIN banner_slot_price_policy bspp ON bsi.id = bspp.banner_slot_info_id
WHERE pi.panel_code IN ('17', '18', '19', '20', '21', '22', '23', '24')
GROUP BY pi.panel_code, pi.max_banner
ORDER BY pi.panel_code; 