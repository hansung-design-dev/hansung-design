-- 🎯 LED 전자게시대 재고 테이블 및 캐시 테이블 생성 및 데이터 삽입 스크립트
-- LED 전자게시대는 한 게시대당 20개 면으로 고정

-- ============================================
-- LED 전자게시대 캐시 테이블 생성
-- ============================================

-- 0-1. LED 전자게시대 캐시 테이블 생성
CREATE TABLE IF NOT EXISTS led_display_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_gu_id UUID NOT NULL REFERENCES region_gu(id) ON DELETE CASCADE,
  display_type_id UUID NOT NULL REFERENCES display_types(id) ON DELETE CASCADE,
  total_panels INTEGER NOT NULL DEFAULT 0,  -- 총 패널 수
  total_faces INTEGER NOT NULL DEFAULT 0,   -- 총 면 수
  available_faces INTEGER NOT NULL DEFAULT 0,  -- 사용 가능한 면 수
  closed_faces INTEGER NOT NULL DEFAULT 0,  -- 폐쇄된 면 수
  used_faces INTEGER NOT NULL DEFAULT 0,    -- 사용 중인 면 수
  cache_date DATE NOT NULL DEFAULT CURRENT_DATE,  -- 캐시 생성 날짜
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 복합 유니크 제약조건: 한 구의 한 디스플레이 타입당 하나의 캐시 기록만 허용
  UNIQUE(region_gu_id, display_type_id, cache_date)
);

-- 캐시 테이블 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_led_display_cache_region_gu ON led_display_cache(region_gu_id);
CREATE INDEX IF NOT EXISTS idx_led_display_cache_display_type ON led_display_cache(display_type_id);
CREATE INDEX IF NOT EXISTS idx_led_display_cache_date ON led_display_cache(cache_date);
CREATE INDEX IF NOT EXISTS idx_led_display_cache_available ON led_display_cache(available_faces);

-- 캐시 테이블 생성 확인
SELECT 'led_display_cache 테이블 생성 완료' as status;

-- 0-2. LED 전자게시대 캐시 업데이트 함수 생성
CREATE OR REPLACE FUNCTION update_led_display_cache()
RETURNS void AS $$
BEGIN
  -- 기존 캐시 데이터 삭제 (오늘 날짜)
  DELETE FROM led_display_cache 
  WHERE cache_date = CURRENT_DATE;
  
  -- 새로운 캐시 데이터 삽입
  INSERT INTO led_display_cache (
    region_gu_id,
    display_type_id,
    total_panels,
    total_faces,
    available_faces,
    closed_faces,
    used_faces,
    cache_date,
    created_at,
    updated_at
  )
  SELECT 
    rg.id as region_gu_id,
    '3119f6ed-81e4-4d62-b785-6a33bc7928f9' as display_type_id,
    COUNT(DISTINCT p.id) as total_panels,
    SUM(COALESCE(ldi.total_faces, 0)) as total_faces,
    SUM(COALESCE(ldi.available_faces, 0)) as available_faces,
    SUM(COALESCE(ldi.closed_faces, 0)) as closed_faces,
    SUM(COALESCE(ldi.total_faces - ldi.available_faces - ldi.closed_faces, 0)) as used_faces,
    CURRENT_DATE as cache_date,
    NOW() as created_at,
    NOW() as updated_at
  FROM region_gu rg
  LEFT JOIN panels p ON rg.id = p.region_gu_id 
    AND p.display_type_id = '3119f6ed-81e4-4d62-b785-6a33bc7928f9'
    AND p.panel_status = 'active'
  LEFT JOIN led_display_inventory ldi ON p.id = ldi.panel_id
  WHERE rg.display_type_id = '3119f6ed-81e4-4d62-b785-6a33bc7928f9'
    AND rg.is_active IN ('true', 'maintenance')
  GROUP BY rg.id, rg.name;
  
  RAISE NOTICE 'LED display cache updated successfully';
END;
$$ LANGUAGE plpgsql;

-- 함수 생성 확인
SELECT 'update_led_display_cache 함수 생성 완료' as status;

-- 0-3. LED 전자게시대 캐시 자동 업데이트 트리거 생성
-- panels 테이블 변경 시 캐시 업데이트
CREATE OR REPLACE FUNCTION trigger_update_led_cache()
RETURNS TRIGGER AS $$
BEGIN
  -- LED 전자게시대 관련 변경사항인 경우에만 캐시 업데이트
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE' OR TG_OP = 'DELETE') AND
     (NEW.display_type_id = '3119f6ed-81e4-4d62-b785-6a33bc7928f9' OR 
      OLD.display_type_id = '3119f6ed-81e4-4d62-b785-6a33bc7928f9') THEN
    PERFORM update_led_display_cache();
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- panels 테이블에 트리거 추가
DROP TRIGGER IF EXISTS trigger_led_cache_on_panels ON panels;
CREATE TRIGGER trigger_led_cache_on_panels
  AFTER INSERT OR UPDATE OR DELETE ON panels
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_led_cache();

-- led_display_inventory 테이블 변경 시 캐시 업데이트
DROP TRIGGER IF EXISTS trigger_led_cache_on_inventory ON led_display_inventory;
CREATE TRIGGER trigger_led_cache_on_inventory
  AFTER INSERT OR UPDATE OR DELETE ON led_display_inventory
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_led_cache();

-- region_gu 테이블 변경 시 캐시 업데이트 (LED 관련 구만)
DROP TRIGGER IF EXISTS trigger_led_cache_on_region_gu ON region_gu;
CREATE TRIGGER trigger_led_cache_on_region_gu
  AFTER INSERT OR UPDATE OR DELETE ON region_gu
  FOR EACH ROW
  WHEN (NEW.display_type_id = '3119f6ed-81e4-4d62-b785-6a33bc7928f9' OR 
        OLD.display_type_id = '3119f6ed-81e4-4d62-b785-6a33bc7928f9')
  EXECUTE FUNCTION trigger_update_led_cache();

-- 트리거 생성 확인
SELECT 'LED 캐시 자동 업데이트 트리거 생성 완료' as status;

-- ============================================
-- LED 전자게시대 재고 테이블 생성
-- ============================================

-- 0. LED 전자게시대 재고 테이블 생성
CREATE TABLE IF NOT EXISTS led_display_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_id UUID NOT NULL REFERENCES panels(id) ON DELETE CASCADE,
  region_gu_display_period_id UUID NOT NULL REFERENCES region_gu_display_periods(id) ON DELETE CASCADE,
  total_faces INTEGER NOT NULL DEFAULT 20,  -- 총 면 수 (LED는 20개 고정)
  available_faces INTEGER NOT NULL DEFAULT 20,  -- 사용 가능한 면 수
  closed_faces INTEGER NOT NULL DEFAULT 0,  -- 폐쇄된 면 수
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 복합 유니크 제약조건: 한 패널의 한 기간당 하나의 재고 기록만 허용
  UNIQUE(panel_id, region_gu_display_period_id)
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_led_display_inventory_panel_id ON led_display_inventory(panel_id);
CREATE INDEX IF NOT EXISTS idx_led_display_inventory_period_id ON led_display_inventory(region_gu_display_period_id);
CREATE INDEX IF NOT EXISTS idx_led_display_inventory_available ON led_display_inventory(available_faces);

-- 테이블 생성 확인
SELECT 'led_display_inventory 테이블 생성 완료' as status;

-- ============================================
-- 데이터 존재 여부 확인 (진단용)
-- ============================================

-- 1. 데이터 존재 여부 확인 (진단용)
-- 1-1. region_gu 테이블 데이터 확인
SELECT 'region_gu 데이터 확인' as check_type, COUNT(*) as count FROM region_gu;
SELECT name, code FROM region_gu ORDER BY name;

-- 1-2. panels 테이블 데이터 확인 (LED 전자게시대)
SELECT 'panels 데이터 확인 (LED)' as check_type, COUNT(*) as count FROM panels 
WHERE display_type_id = '3119f6ed-81e4-4d62-b785-6a33bc7928f9';

SELECT 
    pi.panel_code,
    pi.nickname,
    pi.region_gu_id,
    rgu.name as district_name,
    dt.name as display_type
FROM panels pi
LEFT JOIN region_gu rgu ON pi.region_gu_id = rgu.id
LEFT JOIN display_types dt ON pi.display_type_id = dt.id
WHERE dt.name = 'led_display'
ORDER BY rgu.name, pi.panel_code;

-- 1-3. led_slots 테이블 데이터 확인
SELECT 'led_slots 데이터 확인' as check_type, COUNT(*) as count FROM led_slots;
SELECT 
    ls.slot_number,
    ls.panel_slot_status,
    pi.panel_code,
    rgu.name as district_name
FROM led_slots ls
JOIN panels pi ON ls.panel_id = pi.id
JOIN region_gu rgu ON pi.region_gu_id = rgu.id
JOIN display_types dt ON pi.display_type_id = dt.id
WHERE dt.name = 'led_display'
ORDER BY rgu.name, pi.panel_code, ls.slot_number;

-- 1-4. display_types 테이블 확인
SELECT 'display_types 데이터 확인' as check_type, COUNT(*) as count FROM display_types;
SELECT name, id FROM display_types;

-- 2. 조건에 맞는 데이터 개수 확인
SELECT 
    rgu.name as district_name,
    COUNT(DISTINCT pi.id) as panel_count,
    COUNT(ls.id) as led_slot_count
FROM led_slots ls
JOIN panels pi ON ls.panel_id = pi.id
JOIN region_gu rgu ON pi.region_gu_id = rgu.id
JOIN display_types dt ON pi.display_type_id = dt.id
WHERE dt.name = 'led_display'
GROUP BY rgu.name
ORDER BY rgu.name;

-- ============================================
-- LED 전자게시대 재고 데이터 삽입
-- ============================================

-- 3. LED 전자게시대 재고 데이터 삽입
-- 각 LED 패널당 20개 면으로 설정
INSERT INTO led_display_inventory (
  panel_id,
  region_gu_display_period_id,
  total_faces,
  available_faces,
  closed_faces,
  created_at,
  updated_at
)
SELECT 
  p.id as panel_id,
  rgdp.id as region_gu_display_period_id,
  20 as total_faces,  -- LED 전자게시대는 20개 면 고정
  20 as available_faces,  -- 초기에는 모든 면 사용 가능
  0 as closed_faces,  -- 초기에는 폐쇄 면 없음
  NOW() as created_at,
  NOW() as updated_at
FROM panels p
JOIN region_gu_display_periods rgdp ON p.region_gu_id = rgdp.region_gu_id
WHERE p.display_type_id = '3119f6ed-81e4-4d62-b785-6a33bc7928f9'  -- LED display type ID
  AND p.panel_status = 'active'
  AND rgdp.display_type_id = '3119f6ed-81e4-4d62-b785-6a33bc7928f9'
ON CONFLICT (panel_id, region_gu_display_period_id) DO UPDATE SET
  total_faces = EXCLUDED.total_faces,
  available_faces = EXCLUDED.available_faces,
  closed_faces = EXCLUDED.closed_faces,
  updated_at = NOW();

-- 4. 재고 상태 업데이트 (실제 사용 중인 슬롯 수에 따라)
-- unavailable 상태의 슬롯 수만큼 available_faces에서 차감
UPDATE led_display_inventory 
SET 
  available_faces = (
    SELECT COALESCE(20 - COUNT(*), 20)
    FROM led_slots ls
    WHERE ls.panel_id = led_display_inventory.panel_id
      AND ls.panel_slot_status = 'unavailable'
  ),
  updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM led_slots ls 
  WHERE ls.panel_id = led_display_inventory.panel_id
);

-- 5. 삽입된 재고 데이터 확인
SELECT 
  'LED 재고 데이터 현황' as check_type,
  COUNT(*) as total_inventory_records,
  COUNT(DISTINCT panel_id) as unique_panels,
  SUM(total_faces) as total_faces,
  SUM(available_faces) as total_available_faces,
  SUM(closed_faces) as total_closed_faces
FROM led_display_inventory;

-- 6. 구별 LED 재고 현황
SELECT 
  rg.name as district_name,
  COUNT(ldi.panel_id) as panel_count,
  SUM(ldi.total_faces) as total_faces,
  SUM(ldi.available_faces) as available_faces,
  SUM(ldi.closed_faces) as closed_faces,
  SUM(ldi.total_faces - ldi.available_faces - ldi.closed_faces) as used_faces
FROM led_display_inventory ldi
JOIN panels p ON ldi.panel_id = p.id
JOIN region_gu rg ON p.region_gu_id = rg.id
GROUP BY rg.name
ORDER BY rg.name;

-- 7. 상세 재고 현황 (패널별)
SELECT 
  p.panel_code,
  rg.name as region_name,
  ldi.total_faces,
  ldi.available_faces,
  ldi.closed_faces,
  (ldi.total_faces - ldi.available_faces - ldi.closed_faces) as used_faces,
  ldi.updated_at
FROM led_display_inventory ldi
JOIN panels p ON ldi.panel_id = p.id
JOIN region_gu rg ON p.region_gu_id = rg.id
ORDER BY rg.name, p.panel_code;

-- 8. LED 슬롯 상태별 통계
SELECT 
  rg.name as district_name,
  ls.panel_slot_status,
  COUNT(*) as slot_count
FROM led_slots ls
JOIN panels p ON ls.panel_id = p.id
JOIN region_gu rg ON p.region_gu_id = rg.id
JOIN display_types dt ON p.display_type_id = dt.id
WHERE dt.name = 'led_display'
GROUP BY rg.name, ls.panel_slot_status
ORDER BY rg.name, ls.panel_slot_status;

-- ============================================
-- LED 전자게시대 캐시 데이터 삽입
-- ============================================

-- 9. LED 전자게시대 캐시 데이터 삽입
-- 구별 LED 전자게시대 재고 통계를 캐시 테이블에 저장
INSERT INTO led_display_cache (
  region_gu_id,
  display_type_id,
  total_panels,
  total_faces,
  available_faces,
  closed_faces,
  used_faces,
  cache_date,
  created_at,
  updated_at
)
SELECT 
  rg.id as region_gu_id,
  '3119f6ed-81e4-4d62-b785-6a33bc7928f9' as display_type_id,  -- LED display type ID
  COUNT(DISTINCT p.id) as total_panels,
  SUM(ldi.total_faces) as total_faces,
  SUM(ldi.available_faces) as available_faces,
  SUM(ldi.closed_faces) as closed_faces,
  SUM(ldi.total_faces - ldi.available_faces - ldi.closed_faces) as used_faces,
  CURRENT_DATE as cache_date,
  NOW() as created_at,
  NOW() as updated_at
FROM region_gu rg
LEFT JOIN panels p ON rg.id = p.region_gu_id 
  AND p.display_type_id = '3119f6ed-81e4-4d62-b785-6a33bc7928f9'
  AND p.panel_status = 'active'
LEFT JOIN led_display_inventory ldi ON p.id = ldi.panel_id
WHERE rg.display_type_id = '3119f6ed-81e4-4d62-b785-6a33bc7928f9'
  AND rg.is_active IN ('true', 'maintenance')
GROUP BY rg.id, rg.name
ON CONFLICT (region_gu_id, display_type_id, cache_date) DO UPDATE SET
  total_panels = EXCLUDED.total_panels,
  total_faces = EXCLUDED.total_faces,
  available_faces = EXCLUDED.available_faces,
  closed_faces = EXCLUDED.closed_faces,
  used_faces = EXCLUDED.used_faces,
  updated_at = NOW();

-- 10. 캐시 데이터 확인
SELECT 
  'LED 캐시 데이터 현황' as check_type,
  COUNT(*) as total_cache_records,
  COUNT(DISTINCT region_gu_id) as unique_regions,
  SUM(total_panels) as total_panels,
  SUM(total_faces) as total_faces,
  SUM(available_faces) as total_available_faces,
  SUM(closed_faces) as total_closed_faces,
  SUM(used_faces) as total_used_faces
FROM led_display_cache;

-- 11. 구별 LED 캐시 현황
SELECT 
  rg.name as district_name,
  ldc.total_panels,
  ldc.total_faces,
  ldc.available_faces,
  ldc.closed_faces,
  ldc.used_faces,
  ldc.cache_date,
  ldc.updated_at
FROM led_display_cache ldc
JOIN region_gu rg ON ldc.region_gu_id = rg.id
ORDER BY rg.name;

-- ============================================
-- 캐시 테이블 사용 예시
-- ============================================

-- 12. 캐시 테이블에서 빠른 재고 조회 (API에서 사용)
-- 특정 구의 LED 전자게시대 재고 현황 조회
SELECT 
  rg.name as district_name,
  ldc.total_panels,
  ldc.total_faces,
  ldc.available_faces,
  ldc.closed_faces,
  ldc.used_faces,
  ldc.cache_date
FROM led_display_cache ldc
JOIN region_gu rg ON ldc.region_gu_id = rg.id
WHERE rg.code = 'gangbuk'  -- 강북구 예시
  AND ldc.cache_date = CURRENT_DATE;

-- 13. 전체 LED 전자게시대 재고 현황 (대시보드용)
SELECT 
  '전체 LED 전자게시대 현황' as summary,
  SUM(ldc.total_panels) as total_panels,
  SUM(ldc.total_faces) as total_faces,
  SUM(ldc.available_faces) as total_available_faces,
  SUM(ldc.closed_faces) as total_closed_faces,
  SUM(ldc.used_faces) as total_used_faces,
  ROUND((SUM(ldc.used_faces)::DECIMAL / SUM(ldc.total_faces) * 100), 2) as usage_rate_percent
FROM led_display_cache ldc
WHERE ldc.cache_date = CURRENT_DATE;

-- 14. 수동 캐시 업데이트 실행 (필요시)
-- SELECT update_led_display_cache(); 