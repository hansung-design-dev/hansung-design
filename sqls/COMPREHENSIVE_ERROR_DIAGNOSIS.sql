-- 🔍 종합 에러 진단 스크립트
-- 모든 트리거 비활성화 후에도 에러 발생 시 실행하세요

-- ============================================
-- 1단계: order_details 트리거 상태 확인
-- ============================================
SELECT 
  '=== order_details 트리거 상태 ===' as section;

SELECT 
  tgname as trigger_name,
  tgenabled as is_enabled,
  CASE tgenabled
    WHEN 'O' THEN '✅ 활성화됨'
    WHEN 'D' THEN '❌ 비활성화됨'
    WHEN 'R' THEN '⚠️ 복제로 비활성화됨'
    WHEN 'A' THEN '⚠️ 항상 활성화'
    ELSE '❓ 알 수 없음: ' || tgenabled::text
  END as status,
  pg_get_triggerdef(oid::oid) as trigger_definition
FROM pg_trigger
WHERE tgrelid = 'order_details'::regclass
  AND NOT tgisinternal
ORDER BY tgname;

-- ============================================
-- 2단계: fill_panel_slot_snapshot 함수 확인
-- ============================================
SELECT 
  '=== fill_panel_slot_snapshot 함수 확인 ===' as section;

SELECT 
  proname,
  CASE 
    WHEN prosrc LIKE '%NEW.banner_slot_id%' OR prosrc LIKE '%OLD.banner_slot_id%' THEN '❌ NEW.banner_slot_id 또는 OLD.banner_slot_id 참조 발견!'
    ELSE '✅ banner_slot_id 직접 참조 없음'
  END as status,
  -- 주석 제거 후 실제 코드 확인을 위한 간단한 체크
  LENGTH(prosrc) as code_length
FROM pg_proc
WHERE proname = 'fill_panel_slot_snapshot_after_order_details';

-- 실제 함수 코드 확인 (주석 포함)
SELECT 
  '=== fill_panel_slot_snapshot 실제 코드 ===' as section,
  prosrc as full_code
FROM pg_proc
WHERE proname = 'fill_panel_slot_snapshot_after_order_details';

-- ============================================
-- 3단계: panel_slot_usage 트리거 확인
-- ============================================
-- ⚠️ 중요: order_details INSERT 전에 panel_slot_usage를 생성하는데,
-- 그때 실행되는 트리거가 간접적으로 order_details에 영향을 줄 수 있음

SELECT 
  '=== panel_slot_usage 트리거 상태 ===' as section;

SELECT 
  tgname as trigger_name,
  tgenabled as is_enabled,
  CASE tgenabled
    WHEN 'O' THEN '✅ 활성화됨'
    WHEN 'D' THEN '❌ 비활성화됨'
    ELSE '❓ 알 수 없음: ' || tgenabled::text
  END as status,
  pg_get_triggerdef(oid::oid) as trigger_definition
FROM pg_trigger
WHERE tgrelid = 'panel_slot_usage'::regclass
  AND NOT tgisinternal
ORDER BY tgname;

-- ============================================
-- 4단계: 모든 order 관련 함수에서 NEW.banner_slot_id 사용 여부 확인
-- ============================================
SELECT 
  '=== 모든 order 관련 함수에서 NEW.banner_slot_id 사용 여부 ===' as section;

SELECT 
  proname as function_name,
  CASE 
    WHEN prosrc LIKE '%NEW.banner_slot_id%' THEN '❌ NEW.banner_slot_id 참조!'
    WHEN prosrc LIKE '%OLD.banner_slot_id%' THEN '⚠️ OLD.banner_slot_id 참조 (UPDATE/DELETE는 괜찮음)'
    ELSE '✅ 직접 참조 없음'
  END as status
FROM pg_proc
WHERE proname LIKE '%order%'
  AND (prosrc LIKE '%NEW.banner_slot_id%' OR prosrc LIKE '%OLD.banner_slot_id%')
ORDER BY proname;

-- ============================================
-- 5단계: 모든 트리거 함수 일괄 확인
-- ============================================
SELECT 
  '=== 모든 트리거 함수에서 NEW.banner_slot_id 사용 여부 ===' as section;

SELECT 
  p.proname as function_name,
  CASE 
    WHEN p.prosrc LIKE '%NEW.banner_slot_id%' THEN '❌ NEW.banner_slot_id 참조!'
    WHEN p.prosrc LIKE '%OLD.banner_slot_id%' THEN '⚠️ OLD.banner_slot_id 참조'
    ELSE '✅ 직접 참조 없음'
  END as status,
  string_agg(DISTINCT t.tgname, ', ') as related_triggers
FROM pg_proc p
LEFT JOIN pg_trigger t ON t.tgfoid = p.oid AND NOT t.tgisinternal
WHERE p.prorettype = 'trigger'::regtype
  AND (p.prosrc LIKE '%NEW.banner_slot_id%' OR p.prosrc LIKE '%OLD.banner_slot_id%')
GROUP BY p.proname, p.prosrc
ORDER BY p.proname;

