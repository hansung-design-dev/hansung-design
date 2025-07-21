-- is_active 컬럼을 완전히 새로 생성 (ENUM 타입)
-- 1단계: ENUM 타입 생성
CREATE TYPE district_status_enum AS ENUM ('true', 'false', 'maintenance');

-- 2단계: 기존 is_active 컬럼 삭제
ALTER TABLE region_gu DROP COLUMN is_active;

-- 3단계: 새로운 is_active 컬럼 생성 (ENUM 타입)
ALTER TABLE region_gu ADD COLUMN is_active district_status_enum DEFAULT 'false';

-- 4단계: 데이터 확인
SELECT name, is_active FROM region_gu ORDER BY name; 