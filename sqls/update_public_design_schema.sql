-- 공공디자인 스키마 업데이트

-- 1. project_category enum 타입 생성
CREATE TYPE public_design_category_enum AS ENUM (
  'banner_improvement',
  'env_improvement', 
  'public_design',
  'street_furniture',
  'landscape_design',
  'lighting_design',
  'signage_system',
  'urban_art'
);

-- 2. 기존 테이블에 project_category 컬럼 추가
ALTER TABLE public.public_design_contents 
ADD COLUMN project_category public_design_category_enum;

-- 3. 기존 project_id 데이터를 project_category로 마이그레이션 (필요시)
-- UPDATE public.public_design_contents 
-- SET project_category = 'banner_improvement' 
-- WHERE project_id = '550e8400-e29b-41d4-a716-446655440001';

-- 4. project_id 컬럼 삭제
ALTER TABLE public.public_design_contents 
DROP COLUMN project_id;

-- 5. project_category를 NOT NULL로 설정
ALTER TABLE public.public_design_contents 
ALTER COLUMN project_category SET NOT NULL; 