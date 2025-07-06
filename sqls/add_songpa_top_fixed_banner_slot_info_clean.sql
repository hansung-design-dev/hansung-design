-- 송파구 상단광고 banner_slot_info 데이터 추가 (깔끔한 버전)
-- 20개 패널, 각각 3개 슬롯 (6 months, 1 year, 3 years)

-- 1. 기존 송파구 상단광고 banner_slot_info 모두 삭제
DELETE FROM banner_slot_info 
WHERE panel_info_id IN (
    SELECT pi.id 
    FROM panel_info pi
    JOIN region_gu rg ON pi.region_gu_id = rg.id
    WHERE rg.name = '송파구' 
    AND pi.panel_type = 'top-fixed'
    AND pi.display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'
);

-- 2. 새로운 banner_slot_info 데이터 추가
-- 각 패널당 3개 슬롯: 6 months, 1 year, 3 years
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
        WHEN slot_num.price_unit = '1 year'::price_unit_enum THEN 5000000
        ELSE 0 -- 6 months, 3 years는 상담문의
    END as total_price,
    0 as tax_price,
    'top-fixed' as banner_type,
    slot_num.price_unit,
    FALSE as is_premium,
    'available' as panel_slot_status,
    '' as notes,
    0 as road_usage_fee,
    0 as advertising_fee
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

-- 3. 결과 확인
SELECT 
    pi.panel_code,
    pi.nickname,
    bsi.slot_number,
    bsi.price_unit,
    bsi.total_price,
    bsi.max_width,
    bsi.max_height,
    bsi.banner_type
FROM banner_slot_info bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '송파구' 
AND pi.panel_type = 'top-fixed'
ORDER BY pi.panel_code, bsi.slot_number;

-- 4. 총 슬롯 수 확인
SELECT 
    COUNT(*) as total_slots,
    COUNT(DISTINCT pi.panel_code) as total_panels
FROM banner_slot_info bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '송파구' 
AND pi.panel_type = 'top-fixed'; 