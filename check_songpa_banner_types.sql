-- 송파구 banner_type 상태 확인

-- 1. 송파구 모든 패널의 banner_slot_info 확인
SELECT 
    pi.panel_code,
    pi.nickname,
    pi.panel_type,
    bsi.banner_type,
    bsi.price_unit,
    bsi.slot_number,
    bsi.total_price
FROM panel_info pi
JOIN banner_slot_info bsi ON pi.id = bsi.panel_info_id
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '송파구' 
AND pi.display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'
ORDER BY pi.panel_code, bsi.slot_number;

-- 2. banner_type별 개수 확인
SELECT 
    bsi.banner_type,
    COUNT(*) as count
FROM banner_slot_info bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '송파구' 
AND pi.display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'
GROUP BY bsi.banner_type
ORDER BY bsi.banner_type;

-- 3. price_unit별 banner_type 확인
SELECT 
    bsi.price_unit,
    bsi.banner_type,
    COUNT(*) as count
FROM banner_slot_info bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '송파구' 
AND pi.display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'
GROUP BY bsi.price_unit, bsi.banner_type
ORDER BY bsi.price_unit, bsi.banner_type; 