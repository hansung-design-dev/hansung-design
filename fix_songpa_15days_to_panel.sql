-- 송파구 15 days 슬롯을 panel로 되돌리기
-- banner_type = 'top_fixed' AND price_unit = '15 days' → banner_type = 'panel'

-- 1. 먼저 현재 상황 확인 (15 days인데 top-fixed인 것들)
SELECT 
    '수정할 대상 (15 days인데 top-fixed)' as table_name,
    pi.panel_code,
    pi.nickname,
    bsi.banner_type,
    bsi.slot_number,
    bsi.price_unit,
    bsi.total_price
FROM banner_slot_info bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '송파구' 
AND pi.panel_type = 'panel'
AND bsi.banner_type = 'top-fixed'
AND bsi.price_unit = '15 days'::price_unit_enum
ORDER BY pi.panel_code, bsi.slot_number;

-- 2. 15 days인데 top-fixed인 것들을 panel로 변경
UPDATE banner_slot_info 
SET banner_type = 'panel'
WHERE panel_info_id IN (
    SELECT pi.id 
    FROM panel_info pi
    JOIN region_gu rg ON pi.region_gu_id = rg.id
    WHERE rg.name = '송파구' 
    AND pi.panel_type = 'panel'
    AND pi.display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'
)
AND banner_type = 'top-fixed'
AND price_unit = '15 days'::price_unit_enum;

-- 3. 수정 후 결과 확인
SELECT 
    '수정 후 결과' as table_name,
    pi.panel_code,
    pi.nickname,
    bsi.banner_type,
    bsi.slot_number,
    bsi.price_unit,
    bsi.total_price
FROM banner_slot_info bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '송파구' 
AND pi.panel_type = 'panel'
AND bsi.price_unit = '15 days'::price_unit_enum
ORDER BY pi.panel_code, bsi.slot_number;

-- 4. 최종 요약
SELECT 
    bsi.banner_type,
    bsi.price_unit,
    COUNT(*) as slot_count,
    '송파구 배너 타입별 슬롯 수' as description
FROM banner_slot_info bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '송파구' 
AND pi.panel_type = 'panel'
GROUP BY bsi.banner_type, bsi.price_unit
ORDER BY bsi.banner_type, bsi.price_unit; 