-- 🔍 재고가 리스트에 반영되지 않는 문제 디버깅 쿼리

-- ============================================
-- 1. 최근 주문으로 인해 닫힌 재고 확인
-- ============================================
SELECT 
  '닫힌 재고 확인' as check_type,
  bsi.id as inventory_id,
  bsi.banner_slot_id,
  bsi.is_available,
  bsi.is_closed,
  bsi.updated_at,
  bs.slot_number,
  bs.slot_name,
  bs.panel_id,
  pi.panel_code,
  pi.nickname,
  rgdp.year_month,
  rgdp.period,
  rgdp.period_from,
  rgdp.period_to,
  -- 관련 주문 확인
  od.id as order_detail_id,
  od.order_id,
  od.display_start_date,
  od.display_end_date,
  od.created_at as order_created_at
FROM banner_slot_inventory bsi
JOIN banner_slots bs ON bsi.banner_slot_id = bs.id
JOIN panels pi ON bs.panel_id = pi.id
LEFT JOIN region_gu_display_periods rgdp ON bsi.region_gu_display_period_id = rgdp.id
LEFT JOIN panel_slot_usage psu ON bs.id = psu.banner_slot_id
LEFT JOIN order_details od ON psu.id = od.panel_slot_usage_id
  AND od.display_start_date >= rgdp.period_from 
  AND od.display_end_date <= rgdp.period_to
WHERE bsi.is_closed = true
  AND bsi.updated_at >= NOW() - INTERVAL '7 days'
ORDER BY bsi.updated_at DESC
LIMIT 20;

-- ============================================
-- 2. 특정 구의 모든 재고 상태 확인 (예: 관악구)
-- ============================================
-- 아래 '관악구'를 원하는 구 이름으로 변경하세요
SELECT 
  '구별 재고 상태' as check_type,
  rg.name as district_name,
  pi.panel_code,
  pi.nickname,
  bs.slot_number,
  bs.slot_name,
  rgdp.year_month,
  rgdp.period,
  bsi.is_available,
  bsi.is_closed,
  bsi.updated_at,
  CASE 
    WHEN bsi.is_closed = true THEN '❌ 닫힘'
    WHEN bsi.is_available = true THEN '✅ 사용 가능'
    WHEN bsi.is_available = false AND bsi.is_closed = false THEN '⚠️ 사용 불가'
    ELSE '❓ 상태 불명'
  END as status
FROM banner_slot_inventory bsi
JOIN banner_slots bs ON bsi.banner_slot_id = bs.id
JOIN panels pi ON bs.panel_id = pi.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
LEFT JOIN region_gu_display_periods rgdp ON bsi.region_gu_display_period_id = rgdp.id
WHERE rg.name = '관악구'  -- 여기를 원하는 구 이름으로 변경
  AND rgdp.year_month >= '2025-11'  -- 현재 조회하려는 월
ORDER BY pi.panel_code, bs.slot_number, rgdp.year_month DESC;

-- ============================================
-- 3. API에서 조회하는 방식과 동일하게 재고 조회 테스트
-- ============================================
-- 특정 구의 banner_slot_id 목록 추출
WITH district_banner_slots AS (
  SELECT bs.id as banner_slot_id
  FROM banner_slots bs
  JOIN panels pi ON bs.panel_id = pi.id
  JOIN region_gu rg ON pi.region_gu_id = rg.id
  WHERE rg.name = '관악구'  -- 여기를 원하는 구 이름으로 변경
)
-- 재고 조회 (API와 동일한 방식)
SELECT 
  'API 조회 방식 테스트' as check_type,
  bsi.banner_slot_id,
  bsi.is_available,
  bsi.is_closed,
  rgdp.id as period_id,
  rgdp.year_month,
  rgdp.period,
  rgdp.period_from,
  rgdp.period_to,
  -- banner_slot 정보
  bs.slot_number,
  bs.slot_name,
  pi.panel_code,
  pi.nickname
FROM banner_slot_inventory bsi
JOIN district_banner_slots dbs ON bsi.banner_slot_id = dbs.banner_slot_id
JOIN region_gu_display_periods rgdp ON bsi.region_gu_display_period_id = rgdp.id
JOIN banner_slots bs ON bsi.banner_slot_id = bs.id
JOIN panels pi ON bs.panel_id = pi.id
WHERE rgdp.year_month IN ('2025-11', '2025-12')  -- targetMonths와 동일하게 설정
ORDER BY pi.panel_code, bs.slot_number, rgdp.year_month DESC;

-- ============================================
-- 4. 문제 진단: 재고는 있지만 조회되지 않는 경우
-- ============================================
SELECT 
  '재고 조회 문제 진단' as check_type,
  bs.id as banner_slot_id,
  bs.panel_id,
  bs.slot_number,
  pi.panel_code,
  rg.name as district_name,
  -- 재고가 있지만 year_month가 없는 경우
  COUNT(CASE WHEN bsi.id IS NOT NULL AND rgdp.year_month IS NULL THEN 1 END) as inventory_without_period,
  -- 재고가 있지만 targetMonths에 없는 경우
  COUNT(CASE WHEN bsi.id IS NOT NULL AND rgdp.year_month NOT IN ('2025-11', '2025-12') THEN 1 END) as inventory_wrong_month,
  -- 재고가 있는 경우
  COUNT(bsi.id) as total_inventory_count,
  -- 닫힌 재고 수
  COUNT(CASE WHEN bsi.is_closed = true THEN 1 END) as closed_inventory_count
FROM banner_slots bs
JOIN panels pi ON bs.panel_id = pi.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
LEFT JOIN banner_slot_inventory bsi ON bs.id = bsi.banner_slot_id
LEFT JOIN region_gu_display_periods rgdp ON bsi.region_gu_display_period_id = rgdp.id
WHERE rg.name = '관악구'  -- 여기를 원하는 구 이름으로 변경
GROUP BY bs.id, bs.panel_id, bs.slot_number, pi.panel_code, rg.name
HAVING COUNT(bsi.id) > 0
ORDER BY pi.panel_code, bs.slot_number;

-- ============================================
-- 5. API 쿼리와 실제 데이터 비교
-- ============================================
-- API에서는 다음과 같이 조회합니다:
-- .in('banner_slot_id', bannerSlotIds)
-- .in('region_gu_display_periods.year_month', targetMonths)
-- 
-- 하지만 Supabase의 nested filter는 제대로 작동하지 않을 수 있습니다.
-- 아래 쿼리는 실제로 조회되는 데이터를 확인합니다.

SELECT 
  'API 실제 조회 결과' as check_type,
  bsi.banner_slot_id,
  bsi.is_available,
  bsi.is_closed,
  rgdp.year_month,
  rgdp.period,
  bs.slot_number,
  pi.panel_code,
  rg.name as district_name
FROM banner_slot_inventory bsi
JOIN banner_slots bs ON bsi.banner_slot_id = bs.id
JOIN panels pi ON bs.panel_id = pi.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
JOIN region_gu_display_periods rgdp ON bsi.region_gu_display_period_id = rgdp.id
WHERE rg.name = '관악구'  -- 여기를 원하는 구 이름으로 변경
  AND bs.id IN (
    -- 실제 API에서 사용하는 banner_slot_id 목록 (예시)
    SELECT bs2.id
    FROM banner_slots bs2
    JOIN panels pi2 ON bs2.panel_id = pi2.id
    JOIN region_gu rg2 ON pi2.region_gu_id = rg2.id
    WHERE rg2.name = '관악구'
    LIMIT 10  -- 테스트용으로 제한
  )
  AND rgdp.year_month IN ('2025-11', '2025-12')  -- targetMonths
ORDER BY pi.panel_code, bs.slot_number;

