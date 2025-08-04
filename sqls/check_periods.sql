-- region_gu_display_periods 테이블의 2025년 데이터 확인

-- 1. 2025년 기간 데이터 확인
SELECT 
  year_month,
  COUNT(*) as period_count
FROM region_gu_display_periods
WHERE year_month >= '2025-01' 
  AND year_month <= '2025-12'
GROUP BY year_month
ORDER BY year_month;

-- 2. 용산구, 송파구의 2025년 기간 데이터 확인
SELECT 
  rg.name as region_name,
  rgdp.year_month,
  COUNT(*) as period_count
FROM region_gu_display_periods rgdp
JOIN region_gu rg ON rgdp.region_gu_id = rg.id
WHERE rg.name IN ('용산구', '송파구')
  AND rgdp.year_month >= '2025-01' 
  AND rgdp.year_month <= '2025-12'
GROUP BY rg.name, rgdp.year_month
ORDER BY rg.name, rgdp.year_month;

-- 3. 상단광고 게시대별 기간 매칭 확인
SELECT 
  rg.name as region_name,
  p.id as panel_id,
  COUNT(rgdp.id) as available_periods
FROM panels p
JOIN region_gu rg ON p.region_gu_id = rg.id
LEFT JOIN region_gu_display_periods rgdp ON p.region_gu_id = rgdp.region_gu_id
  AND rgdp.year_month >= '2025-01' 
  AND rgdp.year_month <= '2025-12'
WHERE p.panel_status = 'active'
  AND rg.name IN ('용산구', '송파구')
  AND EXISTS (
    SELECT 1 FROM banner_slots bs 
    WHERE bs.panel_id = p.id 
    AND bs.banner_type = 'top_fixed'
    AND bs.slot_number = 0
  )
GROUP BY rg.name, p.id
ORDER BY rg.name, p.id; 