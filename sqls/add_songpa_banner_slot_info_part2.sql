-- 송파구 panel 타입의 banner_slot_info 데이터 추가 (11-20번)
-- 각 게시대당 5개의 면(slot_number: 1,2,3,4,5) 생성

-- 11-20번 panel_info에 대한 banner_slot_info 추가
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
    70 as max_height,
    139800 as total_price,
    10000 as tax_price,
    'panel' as banner_type,
    '15 days' as price_unit,
    FALSE as is_premium,
    'available' as panel_slot_status,
    '' as notes,
    20570 as road_usage_fee,
    109230 as advertising_fee
FROM panel_info pi
CROSS JOIN (VALUES (1), (2), (3), (4), (5)) AS slot_num(slot_number)
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '송파구' 
AND pi.panel_type = 'panel'
AND pi.panel_code BETWEEN 11 AND 20
AND pi.display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'
ORDER BY pi.panel_code, slot_num.slot_number;

-- 삽입된 데이터 확인 (11-20번)
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
    rg.name as region_name
FROM banner_slot_info bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '송파구' 
AND pi.panel_type = 'panel'
AND pi.panel_code BETWEEN 11 AND 20
ORDER BY pi.panel_code, bsi.slot_number; 