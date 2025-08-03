-- 🎯 LED 전자게시대 캐시 테이블 생성 및 데이터 삽입 스크립트

-- ============================================
-- LED 전자게시대 캐시 테이블 생성
-- ============================================

-- 0-1. LED 전자게시대 캐시 테이블 업데이트
-- 기존 테이블에 새로운 컬럼들 추가

-- 기존 컬럼이 없는 경우에만 추가
DO $$ 
BEGIN
  -- region_name 컬럼 추가
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'led_display_cache' AND column_name = 'region_name') THEN
    ALTER TABLE led_display_cache ADD COLUMN region_name VARCHAR;
  END IF;
  
  -- region_code 컬럼 추가
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'led_display_cache' AND column_name = 'region_code') THEN
    ALTER TABLE led_display_cache ADD COLUMN region_code VARCHAR;
  END IF;
  
  -- logo_image_url 컬럼 추가
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'led_display_cache' AND column_name = 'logo_image_url') THEN
    ALTER TABLE led_display_cache ADD COLUMN logo_image_url TEXT;
  END IF;
  
  -- district_image_url 컬럼 추가
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'led_display_cache' AND column_name = 'district_image_url') THEN
    ALTER TABLE led_display_cache ADD COLUMN district_image_url TEXT;
  END IF;
  
  -- phone_number 컬럼 추가
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'led_display_cache' AND column_name = 'phone_number') THEN
    ALTER TABLE led_display_cache ADD COLUMN phone_number VARCHAR;
  END IF;
  
  -- panel_count 컬럼 추가
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'led_display_cache' AND column_name = 'panel_count') THEN
    ALTER TABLE led_display_cache ADD COLUMN panel_count INTEGER DEFAULT 0;
  END IF;
  
  -- price_summary 컬럼 추가
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'led_display_cache' AND column_name = 'price_summary') THEN
    ALTER TABLE led_display_cache ADD COLUMN price_summary TEXT;
  END IF;
  
  -- period_summary 컬럼 추가
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'led_display_cache' AND column_name = 'period_summary') THEN
    ALTER TABLE led_display_cache ADD COLUMN period_summary TEXT;
  END IF;
  
  -- bank_name 컬럼 추가
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'led_display_cache' AND column_name = 'bank_name') THEN
    ALTER TABLE led_display_cache ADD COLUMN bank_name VARCHAR;
  END IF;
  
  -- account_number 컬럼 추가
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'led_display_cache' AND column_name = 'account_number') THEN
    ALTER TABLE led_display_cache ADD COLUMN account_number VARCHAR;
  END IF;
  
  -- depositor 컬럼 추가
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'led_display_cache' AND column_name = 'depositor') THEN
    ALTER TABLE led_display_cache ADD COLUMN depositor VARCHAR;
  END IF;
  
  -- display_order 컬럼 추가
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'led_display_cache' AND column_name = 'display_order') THEN
    ALTER TABLE led_display_cache ADD COLUMN display_order INTEGER DEFAULT 999;
  END IF;
  
  -- last_updated 컬럼 추가
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'led_display_cache' AND column_name = 'last_updated') THEN
    ALTER TABLE led_display_cache ADD COLUMN last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  
  -- 기존 컬럼들 제거 (더 이상 필요하지 않은 컬럼들)
  -- total_panels, total_faces, available_faces, closed_faces, used_faces, cache_date, created_at, updated_at, display_type_id
  
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'led_display_cache' AND column_name = 'total_panels') THEN
    ALTER TABLE led_display_cache DROP COLUMN total_panels;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'led_display_cache' AND column_name = 'total_faces') THEN
    ALTER TABLE led_display_cache DROP COLUMN total_faces;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'led_display_cache' AND column_name = 'available_faces') THEN
    ALTER TABLE led_display_cache DROP COLUMN available_faces;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'led_display_cache' AND column_name = 'closed_faces') THEN
    ALTER TABLE led_display_cache DROP COLUMN closed_faces;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'led_display_cache' AND column_name = 'used_faces') THEN
    ALTER TABLE led_display_cache DROP COLUMN used_faces;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'led_display_cache' AND column_name = 'cache_date') THEN
    ALTER TABLE led_display_cache DROP COLUMN cache_date;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'led_display_cache' AND column_name = 'created_at') THEN
    ALTER TABLE led_display_cache DROP COLUMN created_at;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'led_display_cache' AND column_name = 'updated_at') THEN
    ALTER TABLE led_display_cache DROP COLUMN updated_at;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'led_display_cache' AND column_name = 'display_type_id') THEN
    ALTER TABLE led_display_cache DROP COLUMN display_type_id;
  END IF;
  
  -- 유니크 제약조건 업데이트 (기존 복합 유니크 제거 후 단일 유니크 추가)
  BEGIN
    ALTER TABLE led_display_cache DROP CONSTRAINT IF EXISTS led_display_cache_region_gu_id_display_type_id_cache_date_key;
    ALTER TABLE led_display_cache ADD CONSTRAINT led_display_cache_region_gu_id_key UNIQUE (region_gu_id);
  EXCEPTION
    WHEN OTHERS THEN
      -- 제약조건이 이미 존재하거나 없는 경우 무시
      NULL;
  END;
  
END $$;

-- 캐시 테이블 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_led_display_cache_region_gu ON led_display_cache(region_gu_id);
CREATE INDEX IF NOT EXISTS idx_led_display_cache_region_code ON led_display_cache(region_code);
CREATE INDEX IF NOT EXISTS idx_led_display_cache_display_order ON led_display_cache(display_order);

-- 캐시 테이블 생성 확인
SELECT 'led_display_cache 테이블 생성 완료' as status;

-- 0-2. LED 전자게시대 캐시 업데이트 함수 생성
CREATE OR REPLACE FUNCTION update_led_display_cache()
RETURNS void AS $$
BEGIN
  -- 기존 캐시 데이터 삭제
  DELETE FROM led_display_cache;
  
  -- 새로운 캐시 데이터 삽입
  INSERT INTO led_display_cache (
    region_gu_id,
    region_name,
    region_code,
    logo_image_url,
    district_image_url,
    phone_number,
    panel_count,
    price_summary,
    period_summary,
    bank_name,
    account_number,
    depositor,
    display_order,
    last_updated
  )
  SELECT 
    rg.id as region_gu_id,
    rg.name as region_name,
    rg.code as region_code,
    rg.logo_image_url,
    rg.image as district_image_url,
    rg.phone_number,
    COUNT(DISTINCT p.id) as panel_count,
    COALESCE(
      (SELECT STRING_AGG(
        CONCAT('상업용: ', TO_CHAR(ldpp.total_price, 'FM999,999,999'), '원'), 
        ', ' ORDER BY ldpp.total_price
      )
      FROM led_display_price_policy ldpp
      JOIN panels p2 ON ldpp.panel_id = p2.id
      WHERE p2.region_gu_id = rg.id
        AND ldpp.price_usage_type = 'default'
      LIMIT 1), 
      '가격 정보 없음'
    ) as price_summary,
    '상시접수' as period_summary,  -- LED는 상시접수
    ba.bank_name,
    ba.account_number,
    ba.depositor,
    CASE 
      WHEN rg.name = '강북구' THEN 1
      WHEN rg.name = '관악구' THEN 2
      WHEN rg.name = '마포구' THEN 3
      ELSE 999
    END as display_order,
    NOW() as last_updated
  FROM region_gu rg
  LEFT JOIN panels p ON rg.id = p.region_gu_id 
    AND p.display_type_id = '3119f6ed-81e4-4d62-b785-6a33bc7928f9'
    AND p.panel_status = 'active'
  LEFT JOIN bank_accounts ba ON rg.id = ba.region_gu_id 
    AND ba.display_type_id = '3119f6ed-81e4-4d62-b785-6a33bc7928f9'
  WHERE rg.display_type_id = '3119f6ed-81e4-4d62-b785-6a33bc7928f9'
    AND rg.is_active IN ('true', 'maintenance')
  GROUP BY rg.id, rg.name, rg.code, rg.logo_image_url, rg.image, rg.phone_number, 
           ba.bank_name, ba.account_number, ba.depositor
  ON CONFLICT (region_gu_id) DO UPDATE SET
    region_name = EXCLUDED.region_name,
    region_code = EXCLUDED.region_code,
    logo_image_url = EXCLUDED.logo_image_url,
    district_image_url = EXCLUDED.district_image_url,
    phone_number = EXCLUDED.phone_number,
    panel_count = EXCLUDED.panel_count,
    price_summary = EXCLUDED.price_summary,
    period_summary = EXCLUDED.period_summary,
    bank_name = EXCLUDED.bank_name,
    account_number = EXCLUDED.account_number,
    depositor = EXCLUDED.depositor,
    display_order = EXCLUDED.display_order,
    last_updated = NOW();
  
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
  -- 테이블별로 다른 조건 처리
  IF TG_TABLE_NAME = 'panels' THEN
    -- panels 테이블: display_type_id 컬럼 확인
    IF TG_OP = 'INSERT' THEN
      IF NEW.display_type_id = '3119f6ed-81e4-4d62-b785-6a33bc7928f9' THEN
        PERFORM update_led_display_cache();
      END IF;
    ELSIF TG_OP = 'UPDATE' THEN
      IF NEW.display_type_id = '3119f6ed-81e4-4d62-b785-6a33bc7928f9' OR 
         OLD.display_type_id = '3119f6ed-81e4-4d62-b785-6a33bc7928f9' THEN
        PERFORM update_led_display_cache();
      END IF;
    ELSIF TG_OP = 'DELETE' THEN
      IF OLD.display_type_id = '3119f6ed-81e4-4d62-b785-6a33bc7928f9' THEN
        PERFORM update_led_display_cache();
      END IF;
    END IF;

  ELSIF TG_TABLE_NAME = 'region_gu' THEN
    -- region_gu 테이블: display_type_id 컬럼 확인
    IF TG_OP = 'INSERT' THEN
      IF NEW.display_type_id = '3119f6ed-81e4-4d62-b785-6a33bc7928f9' THEN
        PERFORM update_led_display_cache();
      END IF;
    ELSIF TG_OP = 'UPDATE' THEN
      IF NEW.display_type_id = '3119f6ed-81e4-4d62-b785-6a33bc7928f9' OR 
         OLD.display_type_id = '3119f6ed-81e4-4d62-b785-6a33bc7928f9' THEN
        PERFORM update_led_display_cache();
      END IF;
    ELSIF TG_OP = 'DELETE' THEN
      IF OLD.display_type_id = '3119f6ed-81e4-4d62-b785-6a33bc7928f9' THEN
        PERFORM update_led_display_cache();
      END IF;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 기존 트리거 모두 삭제 (안전을 위해)
DROP TRIGGER IF EXISTS trigger_led_cache_on_panels ON panels;
DROP TRIGGER IF EXISTS trigger_led_cache_on_region_gu ON region_gu;

-- panels 테이블에 트리거 추가
CREATE TRIGGER trigger_led_cache_on_panels
  AFTER INSERT OR UPDATE OR DELETE ON panels
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_led_cache();



-- region_gu 테이블 변경 시 캐시 업데이트
CREATE TRIGGER trigger_led_cache_on_region_gu
  AFTER INSERT OR UPDATE OR DELETE ON region_gu
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_led_cache();

-- 트리거 생성 확인
SELECT 'LED 캐시 자동 업데이트 트리거 생성 완료' as status;

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
    COUNT(DISTINCT pi.id) as panel_count
FROM panels pi
JOIN region_gu rgu ON pi.region_gu_id = rgu.id
JOIN display_types dt ON pi.display_type_id = dt.id
WHERE dt.name = 'led_display'
  AND pi.panel_status = 'active'
GROUP BY rgu.name
ORDER BY rgu.name;

-- ============================================
-- LED 전자게시대 캐시 데이터 삽입
-- ============================================

-- ============================================
-- LED 전자게시대 캐시 데이터 삽입
-- ============================================

-- 9. LED 전자게시대 캐시 데이터 삽입
-- 구별 LED 전자게시대 카드 정보를 캐시 테이블에 저장
INSERT INTO led_display_cache (
  region_gu_id,
  region_name,
  region_code,
  logo_image_url,
  district_image_url,
  phone_number,
  panel_count,
  price_summary,
  period_summary,
  bank_name,
  account_number,
  depositor,
  display_order,
  last_updated
)
SELECT 
  rg.id as region_gu_id,
  rg.name as region_name,
  rg.code as region_code,
  rg.logo_image_url,
  rg.image as district_image_url,
  rg.phone_number,
      COUNT(DISTINCT p.id) as panel_count,
    COALESCE(
      (SELECT STRING_AGG(
        CONCAT('상업용: ', TO_CHAR(ldpp.total_price, 'FM999,999,999'), '원'), 
        ', ' ORDER BY ldpp.total_price
      )
      FROM led_display_price_policy ldpp
      JOIN panels p2 ON ldpp.panel_id = p2.id
      WHERE p2.region_gu_id = rg.id
        AND ldpp.price_usage_type = 'default'
      LIMIT 1), 
      '가격 정보 없음'
    ) as price_summary,
    '상시접수' as period_summary,  -- LED는 상시접수
  ba.bank_name,
  ba.account_number,
  ba.depositor,
  CASE 
    WHEN rg.name = '강북구' THEN 1
    WHEN rg.name = '관악구' THEN 2
    WHEN rg.name = '마포구' THEN 3
    ELSE 999
  END as display_order,
  NOW() as last_updated
FROM region_gu rg
LEFT JOIN panels p ON rg.id = p.region_gu_id 
  AND p.display_type_id = '3119f6ed-81e4-4d62-b785-6a33bc7928f9'
  AND p.panel_status = 'active'
  LEFT JOIN bank_accounts ba ON rg.id = ba.region_gu_id 
    AND ba.display_type_id = '3119f6ed-81e4-4d62-b785-6a33bc7928f9'
WHERE rg.display_type_id = '3119f6ed-81e4-4d62-b785-6a33bc7928f9'
  AND rg.is_active IN ('true', 'maintenance')
GROUP BY rg.id, rg.name, rg.code, rg.logo_image_url, rg.image, rg.phone_number, 
         ba.bank_name, ba.account_number, ba.depositor
ON CONFLICT (region_gu_id) DO UPDATE SET
  region_name = EXCLUDED.region_name,
  region_code = EXCLUDED.region_code,
  logo_image_url = EXCLUDED.logo_image_url,
  district_image_url = EXCLUDED.district_image_url,
  phone_number = EXCLUDED.phone_number,
  panel_count = EXCLUDED.panel_count,
  price_summary = EXCLUDED.price_summary,
  period_summary = EXCLUDED.period_summary,
  bank_name = EXCLUDED.bank_name,
  account_number = EXCLUDED.account_number,
  depositor = EXCLUDED.depositor,
  display_order = EXCLUDED.display_order,
  last_updated = NOW();

-- 10. 캐시 데이터 확인
SELECT 
  'LED 캐시 데이터 현황' as check_type,
  COUNT(*) as total_cache_records,
  COUNT(DISTINCT region_gu_id) as unique_regions,
  SUM(panel_count) as total_panels
FROM led_display_cache;

-- 11. 구별 LED 캐시 현황
SELECT 
  ldc.region_name,
  ldc.region_code,
  ldc.panel_count,
  ldc.price_summary,
  ldc.period_summary,
  ldc.phone_number,
  ldc.logo_image_url,
  ldc.district_image_url,
  ldc.bank_name,
  ldc.account_number,
  ldc.depositor,
  ldc.display_order,
  ldc.last_updated
FROM led_display_cache ldc
ORDER BY ldc.display_order, ldc.region_name;

-- ============================================
-- 캐시 테이블 사용 예시
-- ============================================

-- 12. 캐시 테이블에서 빠른 카드 정보 조회 (API에서 사용)
-- 특정 구의 LED 전자게시대 카드 정보 조회
SELECT 
  ldc.region_name,
  ldc.region_code,
  ldc.panel_count,
  ldc.price_summary,
  ldc.period_summary,
  ldc.phone_number,
  ldc.logo_image_url,
  ldc.district_image_url,
  ldc.bank_name,
  ldc.account_number,
  ldc.depositor
FROM led_display_cache ldc
WHERE ldc.region_code = 'gangbuk';  -- 강북구 예시

-- 13. 전체 LED 전자게시대 현황 (대시보드용)
SELECT 
  '전체 LED 전자게시대 현황' as summary,
  COUNT(*) as total_regions,
  SUM(ldc.panel_count) as total_panels,
  STRING_AGG(ldc.region_name, ', ' ORDER BY ldc.display_order) as active_regions
FROM led_display_cache ldc;

-- 14. 수동 캐시 업데이트 실행 (필요시)
-- SELECT update_led_display_cache(); 