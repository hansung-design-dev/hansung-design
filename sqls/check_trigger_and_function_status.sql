-- 🔍 트리거 및 함수 상태 확인 쿼리
-- Supabase SQL Editor에서 실행하세요

-- ============================================
-- 1. order_details 테이블에 연결된 모든 트리거 확인
-- ============================================
SELECT 
  '트리거 상태' as check_type,
  trigger_name as name,
  event_object_table as table_name,
  action_timing as timing, -- BEFORE 또는 AFTER
  event_manipulation as event, -- INSERT, DELETE, UPDATE
  action_statement as function_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_trigger 
      WHERE tgname = trigger_name 
      AND tgenabled = 'O'
    ) THEN '✅ 활성화됨'
    ELSE '❌ 비활성화됨'
  END as status
FROM information_schema.triggers
WHERE event_object_table = 'order_details'
ORDER BY action_timing, trigger_name;

-- ============================================
-- 2. 재고 관련 함수 존재 여부 및 상태 확인
-- ============================================
SELECT 
  '함수 존재 여부' as check_type,
  proname as function_name,
  CASE 
    WHEN proname IS NOT NULL THEN '✅ 존재함'
    ELSE '❌ 존재하지 않음'
  END as status,
  pg_get_functiondef(oid) as function_definition
FROM pg_proc
WHERE proname IN (
  'update_banner_slot_inventory_on_order',
  'check_inventory_before_order',
  'restore_banner_slot_inventory_on_order_delete',
  'update_slot_inventory_on_order',
  'restore_slot_inventory_on_order_delete',
  'fill_panel_slot_snapshot_after_order_details'
)
ORDER BY proname;

-- ============================================
-- 3. 함수가 올바르게 수정되었는지 확인 (NEW.banner_slot_id 직접 참조 체크)
-- ============================================
SELECT 
  '함수 수정 상태' as check_type,
  proname as function_name,
  CASE 
    WHEN prosrc LIKE '%NEW.banner_slot_id%' THEN '❌ NEW.banner_slot_id 직접 참조 발견!'
    WHEN prosrc LIKE '%OLD.banner_slot_id%' THEN '❌ OLD.banner_slot_id 직접 참조 발견!'
    WHEN prosrc LIKE '%panel_slot_usage_id%' THEN '✅ 올바르게 수정됨 (panel_slot_usage_id 사용)'
    ELSE '⚠️ 확인 필요'
  END as status,
  CASE 
    WHEN prosrc LIKE '%NEW.banner_slot_id%' OR prosrc LIKE '%OLD.banner_slot_id%' THEN
      '⚠️ order_details 테이블에는 banner_slot_id 컬럼이 없습니다. panel_slot_usage_id를 통해 조회해야 합니다.'
    ELSE NULL
  END as warning
FROM pg_proc
WHERE proname IN (
  'update_banner_slot_inventory_on_order',
  'check_inventory_before_order',
  'restore_banner_slot_inventory_on_order_delete',
  'update_slot_inventory_on_order',
  'restore_slot_inventory_on_order_delete'
)
ORDER BY proname;

-- ============================================
-- 4. 트리거 활성화 상태 상세 확인 (pg_trigger 사용)
-- ============================================
SELECT 
  '트리거 활성화 상태' as check_type,
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  CASE tgenabled
    WHEN 'O' THEN '✅ 활성화됨'
    WHEN 'D' THEN '❌ 비활성화됨'
    WHEN 'R' THEN '⚠️ 복제용 (비활성화)'
    WHEN 'A' THEN '✅ 항상 활성화'
    ELSE '❓ 알 수 없음'
  END as enabled_status,
  CASE tgtype
    WHEN 2 THEN 'BEFORE INSERT'
    WHEN 4 THEN 'AFTER INSERT'
    WHEN 8 THEN 'BEFORE UPDATE'
    WHEN 16 THEN 'AFTER UPDATE'
    WHEN 32 THEN 'BEFORE DELETE'
    WHEN 64 THEN 'AFTER DELETE'
    ELSE '기타'
  END as trigger_type
FROM pg_trigger
WHERE tgrelid = 'order_details'::regclass
  AND NOT tgisinternal
ORDER BY tgname;

-- ============================================
-- 5. 최근 주문 및 재고 업데이트 확인 (실제 동작 확인)
-- ============================================
SELECT 
  '최근 주문 확인' as check_type,
  od.id as order_detail_id,
  od.order_id,
  od.panel_id,
  od.slot_order_quantity,
  od.display_start_date,
  od.display_end_date,
  od.created_at as order_created_at,
  -- 재고 상태 확인
  bsi.id as inventory_id,
  bsi.is_available,
  bsi.is_closed,
  bsi.updated_at as inventory_updated_at,
  CASE 
    WHEN bsi.id IS NULL THEN '⚠️ 재고 레코드가 없음 (트리거가 실행되지 않았을 수 있음)'
    WHEN bsi.is_closed = false THEN '⚠️ 재고가 닫히지 않음 (트리거가 제대로 작동하지 않았을 수 있음)'
    WHEN bsi.is_closed = true THEN '✅ 재고가 정상적으로 닫힘'
    ELSE '❓ 상태 불명'
  END as inventory_status
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
WHERE od.created_at >= NOW() - INTERVAL '7 days'
ORDER BY od.created_at DESC
LIMIT 10;

-- ============================================
-- 6. 트리거 함수 연결 관계 확인
-- ============================================
SELECT 
  '트리거-함수 연결' as check_type,
  t.tgname as trigger_name,
  t.tgrelid::regclass as table_name,
  p.proname as function_name,
  CASE 
    WHEN p.proname IS NULL THEN '❌ 연결된 함수를 찾을 수 없음'
    ELSE '✅ 연결됨'
  END as connection_status
FROM pg_trigger t
LEFT JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgrelid = 'order_details'::regclass
  AND NOT t.tgisinternal
ORDER BY t.tgname;

-- ============================================
-- 7. 함수 상세 코드 확인 (필요시)
-- ============================================
-- 아래 쿼리를 실행하면 함수의 전체 코드를 볼 수 있습니다
-- SELECT 
--   proname as function_name,
--   pg_get_functiondef(oid) as full_code
-- FROM pg_proc
-- WHERE proname = 'update_banner_slot_inventory_on_order';

