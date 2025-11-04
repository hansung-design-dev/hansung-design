-- 🧪 재고 트리거 실제 동작 테스트 쿼리

-- ============================================
-- 테스트 전: 현재 재고 상태 확인
-- ============================================
SELECT 
  '테스트 전 재고 상태' as test_phase,
  bsi.id,
  bs.slot_name,
  bs.panel_id,
  bsi.is_available,
  bsi.is_closed,
  bsi.updated_at
FROM banner_slot_inventory bsi
JOIN banner_slots bs ON bsi.banner_slot_id = bs.id
WHERE bsi.updated_at >= NOW() - INTERVAL '1 day'
ORDER BY bsi.updated_at DESC
LIMIT 5;

-- ============================================
-- 최근 주문에서 재고가 제대로 업데이트되었는지 확인
-- ============================================
WITH recent_orders AS (
  SELECT 
    od.id as order_detail_id,
    od.order_id,
    od.panel_id,
    od.panel_slot_usage_id,
    od.slot_order_quantity,
    od.display_start_date,
    od.display_end_date,
    od.created_at,
    -- panel_slot_usage에서 banner_slot_id 조회
    psu.banner_slot_id
  FROM order_details od
  LEFT JOIN panel_slot_usage psu ON od.panel_slot_usage_id = psu.id
  WHERE od.created_at >= NOW() - INTERVAL '7 days'
  ORDER BY od.created_at DESC
  LIMIT 5
)
SELECT 
  '주문-재고 연결 확인' as check_type,
  ro.order_detail_id,
  ro.order_id,
  ro.panel_id,
  ro.banner_slot_id,
  ro.created_at as order_created_at,
  -- 해당 기간 찾기
  rgdp.id as period_id,
  rgdp.period_from,
  rgdp.period_to,
  -- 재고 상태
  bsi.id as inventory_id,
  bsi.is_available,
  bsi.is_closed,
  bsi.updated_at as inventory_updated_at,
  -- 트리거 동작 확인
  CASE 
    WHEN bsi.id IS NULL THEN '❌ 재고 레코드 없음 - 트리거가 실행되지 않았을 수 있음'
    WHEN bsi.is_closed = false THEN '⚠️ 재고가 닫히지 않음 - 트리거가 제대로 작동하지 않았을 수 있음'
    WHEN bsi.is_closed = true AND bsi.updated_at >= ro.created_at THEN '✅ 재고가 정상적으로 업데이트됨'
    WHEN bsi.is_closed = true AND bsi.updated_at < ro.created_at THEN '⚠️ 재고가 닫혔지만 업데이트 시간이 주문 시간보다 이전'
    ELSE '❓ 상태 불명'
  END as trigger_status
FROM recent_orders ro
LEFT JOIN panels pi ON ro.panel_id = pi.id
LEFT JOIN region_gu_display_periods rgdp ON pi.region_gu_id = rgdp.region_gu_id
  AND rgdp.display_type_id = pi.display_type_id
  AND (
    (ro.display_start_date >= rgdp.period_from AND ro.display_end_date <= rgdp.period_to)
    OR
    (ro.display_start_date <= rgdp.period_to AND ro.display_end_date >= rgdp.period_from)
  )
LEFT JOIN banner_slot_inventory bsi ON ro.banner_slot_id = bsi.banner_slot_id
  AND bsi.region_gu_display_period_id = rgdp.id
ORDER BY ro.created_at DESC;

-- ============================================
-- 트리거 실행 통계 (트리거가 얼마나 실행되었는지 확인)
-- ============================================
-- 주의: PostgreSQL은 기본적으로 트리거 실행 횟수를 기록하지 않습니다.
-- 하지만 최근 주문과 재고 업데이트 시간을 비교하여 추정할 수 있습니다.

SELECT 
  '트리거 동작 통계' as check_type,
  COUNT(DISTINCT od.id) as total_recent_orders,
  COUNT(DISTINCT bsi.id) as inventory_records_updated,
  COUNT(DISTINCT CASE 
    WHEN bsi.is_closed = true AND bsi.updated_at >= od.created_at 
    THEN bsi.id 
  END) as properly_updated_inventory,
  ROUND(
    COUNT(DISTINCT CASE 
      WHEN bsi.is_closed = true AND bsi.updated_at >= od.created_at 
      THEN bsi.id 
    END)::numeric / 
    NULLIF(COUNT(DISTINCT od.id), 0) * 100, 
    2
  ) as success_rate_percent
FROM order_details od
LEFT JOIN panel_slot_usage psu ON od.panel_slot_usage_id = psu.id
LEFT JOIN banner_slot_inventory bsi ON psu.banner_slot_id = bsi.banner_slot_id
  AND bsi.region_gu_display_period_id IN (
    SELECT rgdp.id
    FROM region_gu_display_periods rgdp
    JOIN panels pi ON pi.region_gu_id = rgdp.region_gu_id
    WHERE pi.id = od.panel_id
      AND rgdp.display_type_id = pi.display_type_id
      AND (
        (od.display_start_date >= rgdp.period_from AND od.display_end_date <= rgdp.period_to)
        OR
        (od.display_start_date <= rgdp.period_to AND od.display_end_date >= rgdp.period_from)
      )
  )
WHERE od.created_at >= NOW() - INTERVAL '7 days';

-- ============================================
-- 문제가 있는 주문 찾기 (트리거가 실행되지 않은 것 같음)
-- ============================================
SELECT 
  '문제 있는 주문' as check_type,
  od.id as order_detail_id,
  od.order_id,
  od.panel_id,
  od.created_at,
  CASE 
    WHEN psu.banner_slot_id IS NULL THEN '❌ panel_slot_usage_id가 없거나 banner_slot_id를 찾을 수 없음'
    WHEN rgdp.id IS NULL THEN '❌ 해당 기간(period)을 찾을 수 없음'
    WHEN bsi.id IS NULL THEN '❌ 재고 레코드가 없음 - 트리거가 실행되지 않았을 가능성'
    WHEN bsi.is_closed = false THEN '⚠️ 재고가 닫히지 않음'
    ELSE '✅ 정상'
  END as issue
FROM order_details od
LEFT JOIN panel_slot_usage psu ON od.panel_slot_usage_id = psu.id
LEFT JOIN panels pi ON od.panel_id = pi.id
LEFT JOIN region_gu_display_periods rgdp ON pi.region_gu_id = rgdp.region_gu_id
  AND rgdp.display_type_id = pi.display_type_id
  AND (
    (od.display_start_date >= rgdp.period_from AND od.display_end_date <= rgdp.period_to)
    OR
    (od.display_start_date <= rgdp.period_to AND od.display_end_date >= rgdp.period_from)
  )
LEFT JOIN banner_slot_inventory bsi ON psu.banner_slot_id = bsi.banner_slot_id
  AND bsi.region_gu_display_period_id = rgdp.id
WHERE od.created_at >= NOW() - INTERVAL '7 days'
  AND (
    psu.banner_slot_id IS NULL 
    OR rgdp.id IS NULL 
    OR bsi.id IS NULL 
    OR bsi.is_closed = false
  )
ORDER BY od.created_at DESC;

