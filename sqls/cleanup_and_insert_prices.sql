-- panel_code 17-24의 기존 가격 정책 삭제
DELETE FROM banner_slot_price_policy 
WHERE banner_slot_info_id IN (
    SELECT bsi.id 
    FROM banner_slot_info bsi
    JOIN panel_info pi ON bsi.panel_info_id = pi.id
    WHERE pi.panel_code IN ('17', '18', '19', '20', '21', '22', '23', '24')
);

-- 새로운 가격 정책 추가
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