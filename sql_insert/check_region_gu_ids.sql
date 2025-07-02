-- 용산구와 송파구의 region_gu_id 확인
SELECT 
    id,
    name,
    code
FROM region_gu 
WHERE name IN ('용산구', '송파구')
ORDER BY name;

-- 각 구의 panel_info 개수 확인
SELECT 
    rg.name as region_name,
    rg.id as region_gu_id,
    COUNT(pi.id) as panel_count
FROM region_gu rg
LEFT JOIN panel_info pi ON rg.id = pi.region_gu_id
WHERE rg.name IN ('용산구', '송파구')
GROUP BY rg.id, rg.name
ORDER BY rg.name; 