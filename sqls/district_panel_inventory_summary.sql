-- 구별 총 패널 수와 각 패널당 재고 개수 표

-- 1. 구별 패널 수와 재고 현황 (기본)
SELECT 
  rgu.name as 구,
  COUNT(DISTINCT pi.id) as 총패널수,
  SUM(bsi.total_slots) as 총재고수,
  SUM(bsi.available_slots) as 총가용재고,
  SUM(bsi.closed_slots) as 총사용중재고,
  ROUND(AVG(bsi.total_slots), 1) as 패널당평균재고,
  ROUND(AVG(bsi.available_slots), 1) as 패널당평균가용재고,
  ROUND((SUM(bsi.available_slots)::DECIMAL / SUM(bsi.total_slots)) * 100, 1) as 전체가용률
FROM region_gu rgu
LEFT JOIN panel_info pi ON pi.region_gu_id = rgu.id 
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
LEFT JOIN banner_slot_inventory bsi ON bsi.panel_info_id = pi.id
LEFT JOIN region_gu_display_periods rgdp ON rgdp.id = bsi.region_gu_display_period_id
  AND rgdp.year_month = '2025-08'
GROUP BY rgu.name
ORDER BY 총패널수 DESC, rgu.name;

-- 2. 구별 패널 상세 정보 (2025년 8월)
SELECT 
  rgu.name as 구,
  pi.nickname as 패널명,
  pi.address as 주소,
  bsi.total_slots as 총재고,
  bsi.available_slots as 가용재고,
  bsi.closed_slots as 사용중재고,
  rgdp.period as 기간,
  CASE 
    WHEN bsi.available_slots = 0 THEN '매진'
    WHEN bsi.available_slots <= bsi.total_slots * 0.2 THEN '재고부족'
    ELSE '재고있음'
  END as 재고상태
FROM region_gu rgu
JOIN panel_info pi ON pi.region_gu_id = rgu.id
JOIN banner_slot_inventory bsi ON bsi.panel_info_id = pi.id
JOIN region_gu_display_periods rgdp ON rgdp.id = bsi.region_gu_display_period_id
WHERE pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgdp.year_month = '2025-08'
ORDER BY rgu.name, pi.nickname, rgdp.period;

-- 3. 구별 기간별 재고 요약 (2025년 8월)
SELECT 
  rgu.name as 구,
  rgdp.period as 기간,
  COUNT(DISTINCT pi.id) as 패널수,
  SUM(bsi.total_slots) as 총재고수,
  SUM(bsi.available_slots) as 총가용재고,
  SUM(bsi.closed_slots) as 총사용중재고,
  ROUND(AVG(bsi.total_slots), 1) as 패널당평균재고,
  ROUND(AVG(bsi.available_slots), 1) as 패널당평균가용재고,
  ROUND((SUM(bsi.available_slots)::DECIMAL / SUM(bsi.total_slots)) * 100, 1) as 가용률,
  COUNT(CASE WHEN bsi.available_slots = 0 THEN 1 END) as 매진패널수,
  COUNT(CASE WHEN bsi.available_slots > 0 AND bsi.available_slots <= bsi.total_slots * 0.2 THEN 1 END) as 재고부족패널수
FROM region_gu rgu
JOIN panel_info pi ON pi.region_gu_id = rgu.id
JOIN banner_slot_inventory bsi ON bsi.panel_info_id = pi.id
JOIN region_gu_display_periods rgdp ON rgdp.id = bsi.region_gu_display_period_id
WHERE pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgdp.year_month = '2025-08'
GROUP BY rgu.name, rgdp.period
ORDER BY rgu.name, rgdp.period;

-- 4. 구별 패널 수와 재고 현황 (전체 기간)
SELECT 
  rgu.name as 구,
  COUNT(DISTINCT pi.id) as 총패널수,
  COUNT(bsi.id) as 재고기록수,
  SUM(bsi.total_slots) as 총재고수,
  SUM(bsi.available_slots) as 총가용재고,
  SUM(bsi.closed_slots) as 총사용중재고,
  ROUND(AVG(bsi.total_slots), 1) as 패널당평균재고,
  ROUND(AVG(bsi.available_slots), 1) as 패널당평균가용재고,
  ROUND((SUM(bsi.available_slots)::DECIMAL / SUM(bsi.total_slots)) * 100, 1) as 전체가용률,
  COUNT(DISTINCT rgdp.year_month) as 등록된월수
FROM region_gu rgu
LEFT JOIN panel_info pi ON pi.region_gu_id = rgu.id 
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
LEFT JOIN banner_slot_inventory bsi ON bsi.panel_info_id = pi.id
LEFT JOIN region_gu_display_periods rgdp ON rgdp.id = bsi.region_gu_display_period_id
GROUP BY rgu.name
ORDER BY 총패널수 DESC, rgu.name;

-- 5. 구별 패널당 재고 분포 (2025년 8월)
SELECT 
  rgu.name as 구,
  rgdp.period as 기간,
  COUNT(DISTINCT pi.id) as 패널수,
  MIN(bsi.total_slots) as 최소재고,
  MAX(bsi.total_slots) as 최대재고,
  ROUND(AVG(bsi.total_slots), 1) as 평균재고,
  ROUND(STDDEV(bsi.total_slots), 1) as 재고표준편차,
  COUNT(CASE WHEN bsi.total_slots = 1 THEN 1 END) as "1개재고패널",
  COUNT(CASE WHEN bsi.total_slots = 2 THEN 1 END) as "2개재고패널",
  COUNT(CASE WHEN bsi.total_slots = 3 THEN 1 END) as "3개재고패널",
  COUNT(CASE WHEN bsi.total_slots >= 4 THEN 1 END) as "4개이상재고패널"
FROM region_gu rgu
JOIN panel_info pi ON pi.region_gu_id = rgu.id
JOIN banner_slot_inventory bsi ON bsi.panel_info_id = pi.id
JOIN region_gu_display_periods rgdp ON rgdp.id = bsi.region_gu_display_period_id
WHERE pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgdp.year_month = '2025-08'
GROUP BY rgu.name, rgdp.period
ORDER BY rgu.name, rgdp.period;

-- 6. 구별 재고 상태별 패널 수 (2025년 8월)
SELECT 
  rgu.name as 구,
  rgdp.period as 기간,
  COUNT(DISTINCT pi.id) as 총패널수,
  COUNT(CASE WHEN bsi.available_slots = 0 THEN 1 END) as 매진패널수,
  COUNT(CASE WHEN bsi.available_slots > 0 AND bsi.available_slots <= bsi.total_slots * 0.2 THEN 1 END) as 재고부족패널수,
  COUNT(CASE WHEN bsi.available_slots > bsi.total_slots * 0.2 AND bsi.available_slots < bsi.total_slots THEN 1 END) as 재고보통패널수,
  COUNT(CASE WHEN bsi.available_slots = bsi.total_slots THEN 1 END) as 재고충분패널수,
  ROUND((COUNT(CASE WHEN bsi.available_slots = 0 THEN 1 END)::DECIMAL / COUNT(DISTINCT pi.id)) * 100, 1) as 매진률,
  ROUND((COUNT(CASE WHEN bsi.available_slots > 0 THEN 1 END)::DECIMAL / COUNT(DISTINCT pi.id)) * 100, 1) as 가용률
FROM region_gu rgu
JOIN panel_info pi ON pi.region_gu_id = rgu.id
JOIN banner_slot_inventory bsi ON bsi.panel_info_id = pi.id
JOIN region_gu_display_periods rgdp ON rgdp.id = bsi.region_gu_display_period_id
WHERE pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgdp.year_month = '2025-08'
GROUP BY rgu.name, rgdp.period
ORDER BY rgu.name, rgdp.period;

-- 7. 구별 패널 수와 재고 현황 (간단 버전)
SELECT 
  rgu.name as 구,
  COUNT(DISTINCT pi.id) as "총 패널 수",
  ROUND(AVG(bsi.total_slots), 1) as "패널당 평균 재고",
  SUM(bsi.total_slots) as "총 재고 수",
  SUM(bsi.available_slots) as "총 가용 재고",
  SUM(bsi.closed_slots) as "총 사용중 재고",
  ROUND((SUM(bsi.available_slots)::DECIMAL / SUM(bsi.total_slots)) * 100, 1) as "가용률(%)"
FROM region_gu rgu
LEFT JOIN panel_info pi ON pi.region_gu_id = rgu.id 
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
LEFT JOIN banner_slot_inventory bsi ON bsi.panel_info_id = pi.id
LEFT JOIN region_gu_display_periods rgdp ON rgdp.id = bsi.region_gu_display_period_id
  AND rgdp.year_month = '2025-08'
GROUP BY rgu.name
ORDER BY "총 패널 수" DESC, rgu.name;

-- 8. 구별 패널 상세 목록 (2025년 8월)
SELECT 
  rgu.name as 구,
  pi.nickname as 패널명,
  pi.address as 주소,
  rgdp.period as 기간,
  bsi.total_slots as "패널당 총 재고",
  bsi.available_slots as "패널당 가용 재고",
  bsi.closed_slots as "패널당 사용중 재고",
  ROUND((bsi.available_slots::DECIMAL / bsi.total_slots) * 100, 1) as "패널 가용률(%)",
  CASE 
    WHEN bsi.available_slots = 0 THEN '매진'
    WHEN bsi.available_slots <= bsi.total_slots * 0.2 THEN '재고부족'
    WHEN bsi.available_slots <= bsi.total_slots * 0.5 THEN '재고보통'
    ELSE '재고충분'
  END as 재고상태
FROM region_gu rgu
JOIN panel_info pi ON pi.region_gu_id = rgu.id
JOIN banner_slot_inventory bsi ON bsi.panel_info_id = pi.id
JOIN region_gu_display_periods rgdp ON rgdp.id = bsi.region_gu_display_period_id
WHERE pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgdp.year_month = '2025-08'
ORDER BY rgu.name, pi.nickname, rgdp.period;

-- 9. 구별 재고 통계 요약 (2025년 8월)
SELECT 
  rgu.name as 구,
  COUNT(DISTINCT pi.id) as "총 패널 수",
  COUNT(bsi.id) as "재고 기록 수",
  SUM(bsi.total_slots) as "총 재고 수",
  SUM(bsi.available_slots) as "총 가용 재고",
  SUM(bsi.closed_slots) as "총 사용중 재고",
  ROUND(AVG(bsi.total_slots), 1) as "패널당 평균 재고",
  ROUND(AVG(bsi.available_slots), 1) as "패널당 평균 가용 재고",
  ROUND((SUM(bsi.available_slots)::DECIMAL / SUM(bsi.total_slots)) * 100, 1) as "전체 가용률(%)",
  COUNT(CASE WHEN bsi.available_slots = 0 THEN 1 END) as "매진 패널 수",
  COUNT(CASE WHEN bsi.available_slots > 0 THEN 1 END) as "가용 패널 수"
FROM region_gu rgu
LEFT JOIN panel_info pi ON pi.region_gu_id = rgu.id 
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
LEFT JOIN banner_slot_inventory bsi ON bsi.panel_info_id = pi.id
LEFT JOIN region_gu_display_periods rgdp ON rgdp.id = bsi.region_gu_display_period_id
  AND rgdp.year_month = '2025-08'
GROUP BY rgu.name
ORDER BY "총 패널 수" DESC, rgu.name; 