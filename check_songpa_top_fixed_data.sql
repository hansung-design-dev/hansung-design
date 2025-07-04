-- 송파구 상단광고 데이터 확인
SELECT 
    pi.id,
    pi.panel_code,
    pi.nickname,
    pi.address,
    pi.panel_type,
    pi.max_banner,
    pi.panel_status,
    rg.name as region_name,
    rd.name as dong_name
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
JOIN region_dong rd ON pi.region_dong_id = rd.id
WHERE rg.name = '송파구' 
AND pi.panel_type = 'top_fixed'
AND pi.display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'
ORDER BY pi.panel_code;

-- banner_slot_info도 확인
SELECT 
    bsi.id,
    bsi.panel_info_id,
    bsi.slot_number,
    bsi.max_width,
    bsi.max_height,
    bsi.total_price,
    bsi.banner_type,
    pi.panel_code,
    pi.panel_type,
    rg.name as region_name
FROM banner_slot_info bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '송파구' 
AND pi.panel_type = 'top_fixed'
ORDER BY pi.panel_code, bsi.slot_number; 