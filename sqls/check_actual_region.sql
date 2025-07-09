-- panel_code 17-24이 실제로 어떤 구에 속하는지 확인
SELECT 
    pi.panel_code,
    pi.region_gu_id,
    rg.name as region_name,
    pi.nickname
FROM panel_info pi
LEFT JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE pi.panel_code IN ('17', '18', '19', '20', '21', '22', '23', '24')
ORDER BY pi.panel_code; 