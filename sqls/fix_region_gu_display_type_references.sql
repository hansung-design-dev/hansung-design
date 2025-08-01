-- region_gu_display_type 참조를 region_gu로 수정하는 스크립트
-- 
-- 주의사항:
-- - region_gu_display_type 테이블의 데이터를 region_gu로 이동하지 않습니다
-- - region_gu 테이블에 이미 필요한 모든 데이터가 있으므로 추가 마이그레이션이 불필요합니다
-- - 이 스크립트는 뷰와 인덱스만 수정하여 region_gu 테이블을 직접 사용하도록 합니다

-- 1. region_gu 테이블 구조 확인
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'region_gu'
ORDER BY ordinal_position;

-- 2. region_gu 테이블 데이터 확인 (이미 필요한 모든 데이터가 있음)
SELECT * FROM region_gu LIMIT 5;

-- 3. active_region_gu_by_display_type 뷰 확인
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE viewname = 'active_region_gu_by_display_type'
    AND schemaname = 'public';

-- 4. 현재 뷰 삭제
DROP VIEW IF EXISTS active_region_gu_by_display_type;

-- 5. 새로운 뷰 생성 (region_gu 테이블 직접 사용, region_gu_display_type 데이터 이동 없음)
CREATE OR REPLACE VIEW active_region_gu_by_display_type AS
SELECT 
    rg.id,
    rg.display_type_id,
    rg.is_active,
    rg.created_at,
    rg.updated_at,
    rg.name as region_name,
    rg.code as region_code,
    rg.logo_image_url,
    rg.phone_number,
    dt.name as display_type_name
FROM region_gu rg
JOIN display_types dt ON rg.display_type_id = dt.id
WHERE rg.is_active = 'true';

-- 6. 뷰 권한 설정
GRANT SELECT ON active_region_gu_by_display_type TO authenticated;
GRANT SELECT ON active_region_gu_by_display_type TO anon;

-- 7. 새로운 뷰 확인
SELECT * FROM active_region_gu_by_display_type ORDER BY region_name;

-- 8. 인덱스 추가 (성능 향상)
-- region_gu 테이블에 필요한 인덱스만 추가 (데이터 이동 없음)
CREATE INDEX IF NOT EXISTS idx_region_gu_display_type_id ON region_gu(display_type_id);
CREATE INDEX IF NOT EXISTS idx_region_gu_is_active ON region_gu(is_active);
CREATE INDEX IF NOT EXISTS idx_region_gu_name ON region_gu(name);

-- 9. 인덱스 확인
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'region_gu'
    AND schemaname = 'public'
ORDER BY indexname; 