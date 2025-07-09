-- 서대문구 찾기
SELECT 
    rg.id as region_gu_id,
    rg.name as region_name
FROM region_gu rg
WHERE rg.name LIKE '%서대문%';

-- 서대문구의 panel_code 17-18 확인
SELECT 
    pi.id as panel_info_id,
    pi.panel_code,
    pi.region_gu_id,
    pi.max_banner,
    pi.nickname,
    rg.name as region_name
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE pi.panel_code IN ('17', '18')
AND rg.name LIKE '%서대문%'
ORDER BY pi.panel_code; 