-- region_gu 테이블의 모든 구 이름 확인
SELECT 
    id,
    code,
    name
FROM region_gu
ORDER BY name;

-- panel_code 17-24이 속한 구 확인
SELECT DISTINCT
    pi.panel_code,
    rg.id as region_gu_id,
    rg.name as region_name
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE pi.panel_code IN ('17', '18', '19', '20', '21', '22', '23', '24')
ORDER BY pi.panel_code; 