-- 🎯 현수막게시대 재고 통계 뷰 생성
-- 현재 구조를 유지하면서 재고 통계를 쉽게 볼 수 있도록 함

-- 1. 구별 현수막게시대 재고 통계 뷰
CREATE OR REPLACE VIEW banner_display_inventory_summary AS
SELECT 
  rg.name as district_name,
  p.panel_code,
  p.nickname as panel_name,
  COUNT(bs.id) as total_faces,
  COUNT(CASE WHEN bsi.is_available = true AND bsi.is_closed = false THEN 1 END) as available_faces,
  COUNT(CASE WHEN bsi.is_closed = true THEN 1 END) as closed_faces,
  COUNT(CASE WHEN bsi.is_available = false AND bsi.is_closed = false THEN 1 END) as occupied_faces,
  COUNT(CASE WHEN psu.is_active = true THEN 1 END) as active_orders
FROM panels p
JOIN region_gu rg ON p.region_gu_id = rg.id
JOIN display_types dt ON p.display_type_id = dt.id
LEFT JOIN banner_slots bs ON p.id = bs.panel_id
LEFT JOIN banner_slot_inventory bsi ON bs.id = bsi.banner_slot_id
LEFT JOIN panel_slot_usage psu ON bs.id = psu.banner_slot_id
WHERE dt.name = 'banner_display'
  AND p.panel_status = 'active'
GROUP BY rg.name, p.panel_code, p.nickname
ORDER BY rg.name, p.panel_code;

-- 2. 구별 현수막게시대 재고 요약 뷰
CREATE OR REPLACE VIEW banner_display_district_summary AS
SELECT 
  district_name,
  COUNT(DISTINCT panel_code) as total_panels,
  SUM(total_faces) as total_faces,
  SUM(available_faces) as total_available_faces,
  SUM(closed_faces) as total_closed_faces,
  SUM(occupied_faces) as total_occupied_faces,
  SUM(active_orders) as total_active_orders,
  ROUND((SUM(available_faces)::numeric / SUM(total_faces) * 100), 2) as availability_rate
FROM banner_display_inventory_summary
GROUP BY district_name
ORDER BY district_name;

-- 3. 현수막게시대 면별 상세 상태 뷰
CREATE OR REPLACE VIEW banner_slot_detailed_status AS
SELECT 
  rg.name as district_name,
  p.panel_code,
  bs.slot_number as face_number,
  bs.banner_type,
  bs.panel_slot_status,
  bsi.is_available,
  bsi.is_closed,
  psu.is_active as has_active_order,
  psu.attach_date_from,
  psu.attach_date_from + INTERVAL '15 days' as expected_end_date,
  o.order_number,
  o.order_status
FROM panels p
JOIN region_gu rg ON p.region_gu_id = rg.id
JOIN display_types dt ON p.display_type_id = dt.id
JOIN banner_slots bs ON p.id = bs.panel_id
LEFT JOIN banner_slot_inventory bsi ON bs.id = bsi.banner_slot_id
LEFT JOIN panel_slot_usage psu ON bs.id = psu.banner_slot_id
LEFT JOIN order_details od ON psu.id = od.panel_slot_usage_id
LEFT JOIN orders o ON od.order_id = o.id
WHERE dt.name = 'banner_display'
  AND p.panel_status = 'active'
ORDER BY rg.name, p.panel_code, bs.slot_number;

-- 4. 사용 예시 쿼리들

-- 4-1. 관악구 현수막게시대 재고 현황
-- SELECT * FROM banner_display_inventory_summary WHERE district_name = '관악구';

-- 4-2. 모든 구별 재고 요약
-- SELECT * FROM banner_display_district_summary;

-- 4-3. 특정 게시대의 면별 상태
-- SELECT * FROM banner_slot_detailed_status WHERE district_name = '관악구' AND panel_code = 1;

-- 4-4. 사용 가능한 면 찾기 (주문 시)
-- SELECT * FROM banner_slot_detailed_status 
-- WHERE district_name = '관악구' 
--   AND is_available = true 
--   AND is_closed = false 
--   AND has_active_order IS NULL
-- ORDER BY panel_code, face_number;

-- 5. 뷰 삭제 (필요시)
-- DROP VIEW IF EXISTS banner_display_inventory_summary;
-- DROP VIEW IF EXISTS banner_display_district_summary;
-- DROP VIEW IF EXISTS banner_slot_detailed_status; 