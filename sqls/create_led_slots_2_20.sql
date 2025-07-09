-- LED 패널의 slot_number 2-20 생성
-- 구별, panel_code별로 다른 크기와 가격 적용

-- 동작구 panel_code 1,2,9 (481x250, 380000원)
INSERT INTO led_slot_info (
    panel_info_id,
    slot_name,
    slot_width_px,
    slot_height_px,
    position_x,
    position_y,
    total_price,
    tax_price,
    price_unit,
    is_premium,
    panel_slot_status,
    notes,
    created_at,
    updated_at,
    advertising_fee,
    road_usage_fee,
    administrative_fee,
    slot_number,
    first_half_closure_quantity,
    second_half_closure_quantity
)
SELECT 
    pi.id as panel_info_id,
    '481x250' as slot_name,
    481 as slot_width_px,
    250 as slot_height_px,
    0 as position_x,
    0 as position_y,
    380000 as total_price,
    34000 as tax_price,
    '1 month' as price_unit,
    FALSE as is_premium,
    'available' as panel_slot_status,
    NULL as notes,
    NOW() as created_at,
    NOW() as updated_at,
    340000 as advertising_fee,
    0 as road_usage_fee,
    6000 as administrative_fee,
    generate_series(2, 20) as slot_number,
    0 as first_half_closure_quantity,
    0 as second_half_closure_quantity
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE pi.panel_type = 'led'
AND rg.name LIKE '%동작%'
AND pi.panel_code IN (1, 2, 9);

-- 동작구 panel_code 3,4,5,6,7,8 (68x121, 72000원)
INSERT INTO led_slot_info (
    panel_info_id,
    slot_name,
    slot_width_px,
    slot_height_px,
    position_x,
    position_y,
    total_price,
    tax_price,
    price_unit,
    is_premium,
    panel_slot_status,
    notes,
    created_at,
    updated_at,
    advertising_fee,
    road_usage_fee,
    administrative_fee,
    slot_number,
    first_half_closure_quantity,
    second_half_closure_quantity
)
SELECT 
    pi.id as panel_info_id,
    '68x121' as slot_name,
    68 as slot_width_px,
    121 as slot_height_px,
    0 as position_x,
    0 as position_y,
    72000 as total_price,
    6400 as tax_price,
    '1 month' as price_unit,
    FALSE as is_premium,
    'available' as panel_slot_status,
    NULL as notes,
    NOW() as created_at,
    NOW() as updated_at,
    64000 as advertising_fee,
    0 as road_usage_fee,
    1600 as administrative_fee,
    generate_series(2, 20) as slot_number,
    0 as first_half_closure_quantity,
    0 as second_half_closure_quantity
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE pi.panel_type = 'led'
AND rg.name LIKE '%동작%'
AND pi.panel_code IN (3, 4, 5, 6, 7, 8);

-- 다른 구들의 slot_number 2-20 생성 (기존 slot 1 정보 기반)
INSERT INTO led_slot_info (
    panel_info_id,
    slot_name,
    slot_width_px,
    slot_height_px,
    position_x,
    position_y,
    total_price,
    tax_price,
    price_unit,
    is_premium,
    panel_slot_status,
    notes,
    created_at,
    updated_at,
    advertising_fee,
    road_usage_fee,
    administrative_fee,
    slot_number,
    first_half_closure_quantity,
    second_half_closure_quantity
)
SELECT 
    pi.id as panel_info_id,
    lsi.slot_name,
    lsi.slot_width_px,
    lsi.slot_height_px,
    lsi.position_x,
    lsi.position_y,
    lsi.total_price,
    lsi.tax_price,
    lsi.price_unit,
    lsi.is_premium,
    lsi.panel_slot_status,
    lsi.notes,
    NOW() as created_at,
    NOW() as updated_at,
    lsi.advertising_fee,
    lsi.road_usage_fee,
    lsi.administrative_fee,
    generate_series(2, 20) as slot_number,
    lsi.first_half_closure_quantity,
    lsi.second_half_closure_quantity
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
JOIN led_slot_info lsi ON pi.id = lsi.panel_info_id
WHERE pi.panel_type = 'led'
AND rg.name NOT LIKE '%동작%'
AND lsi.slot_number = 1;

-- 생성된 slot 확인
SELECT 
    rg.name as region_name,
    pi.panel_code,
    pi.nickname,
    COUNT(lsi.id) as total_slots,
    MIN(lsi.slot_number) as min_slot,
    MAX(lsi.slot_number) as max_slot
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
JOIN led_slot_info lsi ON pi.id = lsi.panel_info_id
WHERE pi.panel_type = 'led'
GROUP BY rg.name, pi.panel_code, pi.nickname
ORDER BY rg.name, pi.panel_code; 