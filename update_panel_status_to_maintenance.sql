-- 용산구, 영등포구, 도봉구의 panel_status를 maintenance로 변경하는 SQL

-- 배너 디스플레이용
UPDATE panel_info 
SET panel_status = 'maintenance' 
WHERE region_gu_id IN (
  SELECT id FROM region_gu WHERE name IN ('용산구', '영등포구', '도봉구')
) 
AND display_type_id IN (
  SELECT id FROM display_types WHERE name = 'banner_display'
);

-- LED 전자게시대용
UPDATE panel_info 
SET panel_status = 'maintenance' 
WHERE region_gu_id IN (
  SELECT id FROM region_gu WHERE name IN ('용산구', '영등포구', '도봉구')
) 
AND display_type_id IN (
  SELECT id FROM display_types WHERE name = 'led_display'
);

-- 변경된 데이터 확인
SELECT 
  pi.panel_status,
  rg.name as region_name,
  dt.name as display_type
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
JOIN display_types dt ON pi.display_type_id = dt.id
WHERE rg.name IN ('용산구', '영등포구', '도봉구')
ORDER BY rg.name, dt.name;

-- 다시 active로 되돌리려면:
-- UPDATE panel_info 
-- SET panel_status = 'active' 
-- WHERE region_gu_id IN (
--   SELECT id FROM region_gu WHERE name IN ('용산구', '영등포구', '도봉구')
-- ); 