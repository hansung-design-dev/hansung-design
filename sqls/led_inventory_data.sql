-- LED 재고 테이블 데이터 추가
-- 기존 LED 패널들에 대한 재고 정보를 생성

-- 1. LED 패널들의 재고 정보 생성
INSERT INTO led_display_inventory (
  panel_id,
  region_gu_display_period_id,
  total_faces,
  available_faces,
  closed_faces
)
SELECT 
  p.id as panel_id,
  rgdp.id as region_gu_display_period_id,
  COALESCE(lpd.max_banners, 20) as total_faces,
  COALESCE(lpd.max_banners, 20) as available_faces,
  0 as closed_faces
FROM panels p
JOIN region_gu_display_periods rgdp ON p.region_gu_id = rgdp.region_gu_id
LEFT JOIN led_panel_details lpd ON p.id = lpd.panel_id
WHERE p.panel_type = 'led'
  AND p.panel_status = 'active'
  AND rgdp.year_month >= '2024-01'
  AND rgdp.year_month <= '2024-12'
ON CONFLICT (panel_id, region_gu_display_period_id) DO NOTHING;

-- 2. 2025년도 LED 재고 정보 생성
INSERT INTO led_display_inventory (
  panel_id,
  region_gu_display_period_id,
  total_faces,
  available_faces,
  closed_faces
)
SELECT 
  p.id as panel_id,
  rgdp.id as region_gu_display_period_id,
  COALESCE(lpd.max_banners, 20) as total_faces,
  COALESCE(lpd.max_banners, 20) as available_faces,
  0 as closed_faces
FROM panels p
JOIN region_gu_display_periods rgdp ON p.region_gu_id = rgdp.region_gu_id
LEFT JOIN led_panel_details lpd ON p.id = lpd.panel_id
WHERE p.panel_type = 'led'
  AND p.panel_status = 'active'
  AND rgdp.year_month >= '2025-01'
  AND rgdp.year_month <= '2025-12'
ON CONFLICT (panel_id, region_gu_display_period_id) DO NOTHING; 