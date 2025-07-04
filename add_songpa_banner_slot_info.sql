-- 송파구 panel 타입의 banner_slot_info 데이터 추가
-- panel_info에 추가된 송파구 panel 타입 20개에 대한 slot 정보 추가

-- 먼저 송파구 panel 타입의 panel_info_id들을 가져와서 banner_slot_info에 추가
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
    1 as slot_number,
    '' as slot_name,
    500 as max_width,
    70 as max_height,
    139800 as total_price,
    10000 as tax_price,
    '일반형' as banner_type, -- panel 타입에 맞게 일반형으로 설정
    '2w 1d' as price_unit,
    FALSE as is_premium,
    'available' as panel_slot_status,
    '' as notes,
    20570 as road_usage_fee,
    109230 as advertising_fee
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '송파구' 
AND pi.panel_type = 'panel'
AND pi.display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'
ORDER BY pi.panel_code;

-- 삽입된 데이터 확인
SELECT 
    bsi.id,
    bsi.panel_info_id,
    bsi.slot_number,
    bsi.slot_name,
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
ORDER BY pi.panel_code; 