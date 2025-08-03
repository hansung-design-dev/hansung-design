-- 상단광고 재고 테이블 데이터 추가
-- top_fixed 타입의 배너 슬롯들에 대한 재고 정보를 생성

-- 1. 상단광고 슬롯들의 재고 정보 생성
INSERT INTO top_fixed_banner_inventory (
  panel_id,
  region_gu_display_period_id,
  total_slots,
  available_slots,
  closed_faces,
  banner_slot_id
)
SELECT 
  p.id as panel_id,
  rgdp.id as region_gu_display_period_id,
  1 as total_slots,
  1 as available_slots,
  0 as closed_faces,
  bs.id as banner_slot_id
FROM panels p
JOIN banner_slots bs ON p.id = bs.panel_id
JOIN region_gu_display_periods rgdp ON p.region_gu_id = rgdp.region_gu_id
WHERE bs.banner_type = 'top_fixed'
  AND p.panel_status = 'active'
  AND rgdp.year_month >= '2024-01'
  AND rgdp.year_month <= '2024-12'
ON CONFLICT (panel_id, region_gu_display_period_id, banner_slot_id) DO NOTHING;

-- 2. 2025년도 상단광고 재고 정보 생성
INSERT INTO top_fixed_banner_inventory (
  panel_id,
  region_gu_display_period_id,
  total_slots,
  available_slots,
  closed_faces,
  banner_slot_id
)
SELECT 
  p.id as panel_id,
  rgdp.id as region_gu_display_period_id,
  1 as total_slots,
  1 as available_slots,
  0 as closed_faces,
  bs.id as banner_slot_id
FROM panels p
JOIN banner_slots bs ON p.id = bs.panel_id
JOIN region_gu_display_periods rgdp ON p.region_gu_id = rgdp.region_gu_id
WHERE bs.banner_type = 'top_fixed'
  AND p.panel_status = 'active'
  AND rgdp.year_month >= '2025-01'
  AND rgdp.year_month <= '2025-12'
ON CONFLICT (panel_id, region_gu_display_period_id, banner_slot_id) DO NOTHING; 