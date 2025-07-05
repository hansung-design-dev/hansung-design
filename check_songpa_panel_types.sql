-- 송파구의 모든 panel_type 확인
SELECT 
    pi.panel_type,
    COUNT(*) as count
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '송파구' 
AND pi.display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'
AND pi.panel_status = 'active'
GROUP BY pi.panel_type
ORDER BY pi.panel_type;

-- 송파구의 모든 데이터 샘플 확인 (처음 10개)
SELECT 
    pi.id,
    pi.panel_code,
    pi.nickname,
    pi.address,
    pi.panel_type,
    pi.max_banner,
    pi.panel_status,
    rg.name as region_name
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '송파구' 
AND pi.display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'
AND pi.panel_status = 'active'
ORDER BY pi.panel_code
LIMIT 10; 