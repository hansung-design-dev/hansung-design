-- region_gu 테이블에서 구 이름 확인
SELECT 
    id,
    name,
    english_name
FROM region_gu
WHERE id IN (
    SELECT DISTINCT region_gu_id 
    FROM panel_info 
    WHERE panel_code IN ('17', '18', '19', '20', '21', '22', '23', '24')
);

-- panel_code 17-24의 region_gu_id 확인
SELECT 
    panel_code,
    region_gu_id,
    nickname
FROM panel_info 
WHERE panel_code IN ('17', '18', '19', '20', '21', '22', '23', '24')
ORDER BY panel_code; 