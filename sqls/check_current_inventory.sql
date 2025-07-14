-- 현재 년월별 재고 확인 쿼리들

-- 1. 전체 재고 현황 (기본)
SELECT 
  pi.nickname as 패널명,
  rgu.name as 구,
  rgdp.year_month as 년월,
  rgdp.period as 기간,
  rgdp.period_from as 시작일,
  rgdp.period_to as 종료일,
  bsi.total_slots as 총슬롯,
  bsi.available_slots as 가용슬롯,
  bsi.closed_slots as 사용중슬롯,
  CASE 
    WHEN bsi.available_slots = 0 THEN '매진'
    WHEN bsi.available_slots <= bsi.total_slots * 0.2 THEN '재고부족'
    ELSE '재고있음'
  END as 재고상태,
  bsi.updated_at as 최종업데이트
FROM banner_slot_inventory bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
JOIN region_gu_display_periods rgdp ON rgdp.id = bsi.region_gu_display_period_id
WHERE pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
ORDER BY rgdp.year_month DESC, rgu.name, rgdp.period;

-- 2. 현재 월 기준 재고 현황 (2025년 8월)
SELECT 
  pi.nickname as 패널명,
  rgu.name as 구,
  rgdp.period as 기간,
  rgdp.period_from as 시작일,
  rgdp.period_to as 종료일,
  bsi.total_slots as 총슬롯,
  bsi.available_slots as 가용슬롯,
  bsi.closed_slots as 사용중슬롯,
  ROUND((bsi.available_slots::DECIMAL / bsi.total_slots) * 100, 1) as 가용률,
  CASE 
    WHEN bsi.available_slots = 0 THEN '매진'
    WHEN bsi.available_slots <= bsi.total_slots * 0.2 THEN '재고부족'
    ELSE '재고있음'
  END as 재고상태
FROM banner_slot_inventory bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
JOIN region_gu_display_periods rgdp ON rgdp.id = bsi.region_gu_display_period_id
WHERE pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND rgdp.year_month = '2025-08'
ORDER BY rgu.name, rgdp.period;

-- 3. 구별 재고 요약 (2025년 8월)
SELECT 
  rgu.name as 구,
  rgdp.period as 기간,
  COUNT(bsi.id) as 패널수,
  SUM(bsi.total_slots) as 총슬롯수,
  SUM(bsi.available_slots) as 총가용슬롯,
  SUM(bsi.closed_slots) as 총사용중슬롯,
  ROUND((SUM(bsi.available_slots)::DECIMAL / SUM(bsi.total_slots)) * 100, 1) as 전체가용률,
  COUNT(CASE WHEN bsi.available_slots = 0 THEN 1 END) as 매진패널수,
  COUNT(CASE WHEN bsi.available_slots > 0 AND bsi.available_slots <= bsi.total_slots * 0.2 THEN 1 END) as 재고부족패널수
FROM banner_slot_inventory bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
JOIN region_gu_display_periods rgdp ON rgdp.id = bsi.region_gu_display_period_id
WHERE pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND rgdp.year_month = '2025-08'
GROUP BY rgu.name, rgdp.period
ORDER BY rgu.name, rgdp.period;

-- 4. 전체 재고 요약 (2025년 8월)
SELECT 
  rgdp.period as 기간,
  COUNT(bsi.id) as 총패널수,
  SUM(bsi.total_slots) as 총슬롯수,
  SUM(bsi.available_slots) as 총가용슬롯,
  SUM(bsi.closed_slots) as 총사용중슬롯,
  ROUND((SUM(bsi.available_slots)::DECIMAL / SUM(bsi.total_slots)) * 100, 1) as 전체가용률,
  COUNT(CASE WHEN bsi.available_slots = 0 THEN 1 END) as 매진패널수,
  COUNT(CASE WHEN bsi.available_slots > 0 AND bsi.available_slots <= bsi.total_slots * 0.2 THEN 1 END) as 재고부족패널수,
  COUNT(CASE WHEN bsi.available_slots > bsi.total_slots * 0.2 THEN 1 END) as 재고충분패널수
FROM banner_slot_inventory bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu_display_periods rgdp ON rgdp.id = bsi.region_gu_display_period_id
WHERE pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND rgdp.year_month = '2025-08'
GROUP BY rgdp.period
ORDER BY rgdp.period;

-- 5. 매진 패널 목록 (2025년 8월)
SELECT 
  pi.nickname as 패널명,
  rgu.name as 구,
  rgdp.period as 기간,
  rgdp.period_from as 시작일,
  rgdp.period_to as 종료일,
  bsi.total_slots as 총슬롯,
  bsi.closed_slots as 사용중슬롯,
  bsi.updated_at as 최종업데이트
FROM banner_slot_inventory bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
JOIN region_gu_display_periods rgdp ON rgdp.id = bsi.region_gu_display_period_id
WHERE pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND rgdp.year_month = '2025-08'
  AND bsi.available_slots = 0
ORDER BY rgu.name, rgdp.period;

-- 6. 재고 부족 패널 목록 (2025년 8월, 20% 이하)
SELECT 
  pi.nickname as 패널명,
  rgu.name as 구,
  rgdp.period as 기간,
  rgdp.period_from as 시작일,
  rgdp.period_to as 종료일,
  bsi.total_slots as 총슬롯,
  bsi.available_slots as 가용슬롯,
  bsi.closed_slots as 사용중슬롯,
  ROUND((bsi.available_slots::DECIMAL / bsi.total_slots) * 100, 1) as 가용률,
  bsi.updated_at as 최종업데이트
FROM banner_slot_inventory bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
JOIN region_gu_display_periods rgdp ON rgdp.id = bsi.region_gu_display_period_id
WHERE pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND rgdp.year_month = '2025-08'
  AND bsi.available_slots > 0 
  AND bsi.available_slots <= bsi.total_slots * 0.2
ORDER BY rgu.name, rgdp.period, 가용률;

-- 7. 최근 업데이트된 재고 (최근 24시간)
SELECT 
  pi.nickname as 패널명,
  rgu.name as 구,
  rgdp.year_month as 년월,
  rgdp.period as 기간,
  bsi.total_slots as 총슬롯,
  bsi.available_slots as 가용슬롯,
  bsi.closed_slots as 사용중슬롯,
  bsi.updated_at as 최종업데이트
FROM banner_slot_inventory bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
JOIN region_gu_display_periods rgdp ON rgdp.id = bsi.region_gu_display_period_id
WHERE pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND bsi.updated_at >= NOW() - INTERVAL '24 hours'
ORDER BY bsi.updated_at DESC;

-- 8. 특정 구의 재고 현황 (예: 마포구)
SELECT 
  pi.nickname as 패널명,
  rgdp.period as 기간,
  rgdp.period_from as 시작일,
  rgdp.period_to as 종료일,
  bsi.total_slots as 총슬롯,
  bsi.available_slots as 가용슬롯,
  bsi.closed_slots as 사용중슬롯,
  ROUND((bsi.available_slots::DECIMAL / bsi.total_slots) * 100, 1) as 가용률,
  CASE 
    WHEN bsi.available_slots = 0 THEN '매진'
    WHEN bsi.available_slots <= bsi.total_slots * 0.2 THEN '재고부족'
    ELSE '재고있음'
  END as 재고상태
FROM banner_slot_inventory bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
JOIN region_gu_display_periods rgdp ON rgdp.id = bsi.region_gu_display_period_id
WHERE pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND rgu.name = '마포구'
  AND rgdp.year_month = '2025-08'
ORDER BY rgdp.period;

-- 9. 재고가 있는 패널만 (2025년 8월)
SELECT 
  pi.nickname as 패널명,
  rgu.name as 구,
  rgdp.period as 기간,
  rgdp.period_from as 시작일,
  rgdp.period_to as 종료일,
  bsi.available_slots as 가용슬롯,
  bsi.total_slots as 총슬롯,
  ROUND((bsi.available_slots::DECIMAL / bsi.total_slots) * 100, 1) as 가용률
FROM banner_slot_inventory bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
JOIN region_gu_display_periods rgdp ON rgdp.id = bsi.region_gu_display_period_id
WHERE pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND rgdp.year_month = '2025-08'
  AND bsi.available_slots > 0
ORDER BY rgu.name, rgdp.period, 가용률 DESC;

-- 10. 월별 재고 통계 (전체)
SELECT 
  rgdp.year_month as 년월,
  rgdp.period as 기간,
  COUNT(bsi.id) as 패널수,
  SUM(bsi.total_slots) as 총슬롯수,
  SUM(bsi.available_slots) as 총가용슬롯,
  SUM(bsi.closed_slots) as 총사용중슬롯,
  ROUND((SUM(bsi.available_slots)::DECIMAL / SUM(bsi.total_slots)) * 100, 1) as 전체가용률,
  COUNT(CASE WHEN bsi.available_slots = 0 THEN 1 END) as 매진패널수,
  COUNT(CASE WHEN bsi.available_slots > 0 AND bsi.available_slots <= bsi.total_slots * 0.2 THEN 1 END) as 재고부족패널수
FROM banner_slot_inventory bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu_display_periods rgdp ON rgdp.id = bsi.region_gu_display_period_id
WHERE pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
GROUP BY rgdp.year_month, rgdp.period
ORDER BY rgdp.year_month DESC, rgdp.period; 