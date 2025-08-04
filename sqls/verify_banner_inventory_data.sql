-- 🔍 banner_slot_inventory 테이블 데이터 검증 스크립트
-- 3,198개 로우가 정확한지 확인

-- 1. 전체 데이터 개수 확인
SELECT 
  'banner_slot_inventory 전체 개수' as check_type,
  COUNT(*) as total_count
FROM banner_slot_inventory;

-- 2. 구별 데이터 분포 확인
SELECT 
  rg.name as district_name,
  COUNT(bsi.id) as inventory_count,
  COUNT(DISTINCT p.panel_code) as panel_count,
  COUNT(bs.id) as slot_count
FROM banner_slot_inventory bsi
JOIN banner_slots bs ON bsi.banner_slot_id = bs.id
JOIN panels p ON bs.panel_id = p.id
JOIN region_gu rg ON p.region_gu_id = rg.id
JOIN display_types dt ON p.display_type_id = dt.id
WHERE dt.name = 'banner_display'
GROUP BY rg.name
ORDER BY rg.name;

-- 3. 게시대별 면 수 확인
SELECT 
  rg.name as district_name,
  p.panel_code,
  p.nickname as panel_name,
  COUNT(bs.id) as total_slots,
  COUNT(bsi.id) as inventory_records
FROM panels p
JOIN region_gu rg ON p.region_gu_id = rg.id
JOIN display_types dt ON p.display_type_id = dt.id
LEFT JOIN banner_slots bs ON p.id = bs.panel_id
LEFT JOIN banner_slot_inventory bsi ON bs.id = bsi.banner_slot_id
WHERE dt.name = 'banner_display'
  AND p.panel_status = 'active'
GROUP BY rg.name, p.panel_code, p.nickname
ORDER BY rg.name, p.panel_code;

-- 4. 중복 데이터 확인
SELECT 
  '중복 banner_slot_id 확인' as check_type,
  banner_slot_id,
  COUNT(*) as duplicate_count
FROM banner_slot_inventory
GROUP BY banner_slot_id
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- 5. banner_slots와 banner_slot_inventory 매칭 확인
SELECT 
  'banner_slots vs banner_slot_inventory 매칭' as check_type,
  COUNT(bs.id) as total_banner_slots,
  COUNT(bsi.id) as total_inventory_records,
  COUNT(bs.id) - COUNT(bsi.id) as missing_inventory
FROM banner_slots bs
JOIN panels p ON bs.panel_id = p.id
JOIN display_types dt ON p.display_type_id = dt.id
LEFT JOIN banner_slot_inventory bsi ON bs.id = bsi.banner_slot_id
WHERE dt.name = 'banner_display';

-- 6. 구별 상세 분석
WITH district_analysis AS (
  SELECT 
    rg.name as district_name,
    COUNT(DISTINCT p.id) as total_panels,
    COUNT(bs.id) as total_slots,
    COUNT(bsi.id) as total_inventory_records,
    COUNT(CASE WHEN bsi.is_available = true THEN 1 END) as available_faces,
    COUNT(CASE WHEN bsi.is_available = false THEN 1 END) as occupied_faces,
    COUNT(CASE WHEN bsi.is_closed = true THEN 1 END) as closed_faces
  FROM region_gu rg
  JOIN panels p ON rg.id = p.region_gu_id
  JOIN display_types dt ON p.display_type_id = dt.id
  LEFT JOIN banner_slots bs ON p.id = bs.panel_id
  LEFT JOIN banner_slot_inventory bsi ON bs.id = bsi.banner_slot_id
  WHERE dt.name = 'banner_display'
    AND p.panel_status = 'active'
  GROUP BY rg.name
)
SELECT 
  district_name,
  total_panels,
  total_slots,
  total_inventory_records,
  available_faces,
  occupied_faces,
  closed_faces,
  CASE 
    WHEN total_slots > 0 THEN ROUND((available_faces::numeric / total_slots * 100), 2)
    ELSE 0 
  END as availability_rate
FROM district_analysis
ORDER BY district_name;

-- 7. 예상 데이터 개수 계산
SELECT 
  '예상 데이터 개수 계산' as check_type,
  SUM(expected_slots) as expected_total_slots
FROM (
  SELECT 
    rg.name as district_name,
    COUNT(DISTINCT p.panel_code) as panel_count,
    -- 각 게시대당 2개 면 (slot_number 1, 2)
    COUNT(DISTINCT p.panel_code) * 2 as expected_slots
  FROM panels p
  JOIN region_gu rg ON p.region_gu_id = rg.id
  JOIN display_types dt ON p.display_type_id = dt.id
  WHERE dt.name = 'banner_display'
    AND p.panel_status = 'active'
  GROUP BY rg.name
) subquery;

-- 8. 실제 vs 예상 데이터 비교
WITH actual_data AS (
  SELECT COUNT(*) as actual_count
  FROM banner_slot_inventory
),
expected_data AS (
  SELECT 
    SUM(expected_slots) as expected_count
  FROM (
    SELECT 
      COUNT(DISTINCT p.panel_code) * 2 as expected_slots
    FROM panels p
    JOIN region_gu rg ON p.region_gu_id = rg.id
    JOIN display_types dt ON p.display_type_id = dt.id
    WHERE dt.name = 'banner_display'
      AND p.panel_status = 'active'
    GROUP BY rg.name
  ) subquery
)
SELECT 
  '실제 vs 예상 데이터 비교' as check_type,
  ad.actual_count as actual_inventory_records,
  ed.expected_count as expected_slots,
  ad.actual_count - ed.expected_count as difference,
  CASE 
    WHEN ad.actual_count = ed.expected_count THEN '정확함'
    WHEN ad.actual_count > ed.expected_count THEN '초과 데이터 있음'
    ELSE '부족한 데이터 있음'
  END as status
FROM actual_data ad, expected_data ed; 