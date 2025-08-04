-- 상단광고 데이터 중복 문제 디버깅 및 수정

-- 1. 현재 데이터 확인
SELECT 
  COUNT(*) as total_records,
  COUNT(DISTINCT panel_id) as unique_panels,
  COUNT(DISTINCT region_gu_display_period_id) as unique_periods
FROM top_fixed_banner_inventory;

-- 2. 구별 상단광고 게시대 수 확인
SELECT 
  rg.name as region_name,
  COUNT(DISTINCT p.id) as panel_count
FROM panels p
JOIN region_gu rg ON p.region_gu_id = rg.id
WHERE p.panel_status = 'active'
  AND rg.name IN ('용산구', '송파구')
  AND EXISTS (
    SELECT 1 FROM banner_slots bs 
    WHERE bs.panel_id = p.id 
    AND bs.banner_type = 'top_fixed'
    AND bs.slot_number = 0
  )
GROUP BY rg.name, rg.id;

-- 3. 기간별 레코드 수 확인
SELECT 
  rg.name as region_name,
  rgdp.year_month,
  COUNT(*) as period_records
FROM panels p
JOIN region_gu rg ON p.region_gu_id = rg.id
JOIN region_gu_display_periods rgdp ON p.region_gu_id = rgdp.region_gu_id
WHERE p.panel_status = 'active'
  AND rg.name IN ('용산구', '송파구')
  AND EXISTS (
    SELECT 1 FROM banner_slots bs 
    WHERE bs.panel_id = p.id 
    AND bs.banner_type = 'top_fixed'
    AND bs.slot_number = 0
  )
  AND rgdp.year_month >= '2025-01'
  AND rgdp.year_month <= '2025-12'
GROUP BY rg.name, rgdp.year_month
ORDER BY rg.name, rgdp.year_month;

-- 4. 수정된 데이터 삽입 (중복 제거)
DELETE FROM top_fixed_banner_inventory;

INSERT INTO top_fixed_banner_inventory (
  panel_id,
  region_gu_display_period_id,
  is_occupied,
  occupied_slot_id,
  occupied_until,
  occupied_from
)
SELECT DISTINCT
  p.id as panel_id,
  rgdp.id as region_gu_display_period_id,
  false as is_occupied,
  null as occupied_slot_id,
  null as occupied_until,
  null as occupied_from
FROM panels p
JOIN region_gu rg ON p.region_gu_id = rg.id
JOIN region_gu_display_periods rgdp ON p.region_gu_id = rgdp.region_gu_id
WHERE p.panel_status = 'active'
  AND rg.name IN ('용산구', '송파구')
  AND EXISTS (
    SELECT 1 FROM banner_slots bs 
    WHERE bs.panel_id = p.id 
    AND bs.banner_type = 'top_fixed'
    AND bs.slot_number = 0
  )
  AND rgdp.year_month >= '2025-01'
  AND rgdp.year_month <= '2025-12'
ON CONFLICT (panel_id, region_gu_display_period_id) DO NOTHING;

-- 5. 수정 후 데이터 확인
SELECT 
  COUNT(*) as total_records,
  COUNT(DISTINCT panel_id) as unique_panels,
  COUNT(DISTINCT region_gu_display_period_id) as unique_periods
FROM top_fixed_banner_inventory; 