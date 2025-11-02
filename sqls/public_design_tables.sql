-- ====================================
-- 공공디자인 테이블 생성 쿼리
-- ====================================

-- 공공디자인 프로젝트 카테고리 ENUM 타입 (이미 존재하면 무시)
DO $$ BEGIN
  CREATE TYPE public_design_category_enum AS ENUM (
    'banner_improvement',
    'env_improvement', 
    'public_design',
    'ect'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 디자인 컨텐츠 타입 ENUM (이미 존재하면 무시)
DO $$ BEGIN
  CREATE TYPE design_contents_type_enum AS ENUM (
    'list',
    'detail'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 공공디자인 컨텐츠 테이블
CREATE TABLE IF NOT EXISTS public.public_design_contents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  design_contents_type design_contents_type_enum NOT NULL,
  title text NOT NULL,
  location text,
  description text,
  year integer,
  project_code character varying,
  image_urls text[] DEFAULT '{}'::text[],
  list_image_urls text[] DEFAULT '{}'::text[],
  detail_image_urls text[] DEFAULT '{}'::text[],
  project_category public_design_category_enum NOT NULL,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT public_design_contents_pkey PRIMARY KEY (id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_public_design_contents_project_category 
  ON public.public_design_contents(project_category);
CREATE INDEX IF NOT EXISTS idx_public_design_contents_design_contents_type 
  ON public.public_design_contents(design_contents_type);
CREATE INDEX IF NOT EXISTS idx_public_design_contents_year 
  ON public.public_design_contents(year);
CREATE INDEX IF NOT EXISTS idx_public_design_contents_is_active 
  ON public.public_design_contents(is_active);
CREATE INDEX IF NOT EXISTS idx_public_design_contents_display_order 
  ON public.public_design_contents(display_order);
CREATE INDEX IF NOT EXISTS idx_public_design_contents_project_code 
  ON public.public_design_contents(project_code);

-- 코멘트 추가
COMMENT ON TABLE public.public_design_contents IS '공공디자인 프로젝트 테이블 - 간판개선사업, 환경개선사업, 공공디자인 프로젝트 정보';
COMMENT ON COLUMN public.public_design_contents.design_contents_type IS '컨텐츠 타입 - list: 리스트용 데이터, detail: 상세페이지용 데이터';
COMMENT ON COLUMN public.public_design_contents.project_category IS '프로젝트 카테고리 - banner_improvement: 간판개선, env_improvement: 환경개선, public_design: 공공디자인, ect: 기타';
COMMENT ON COLUMN public.public_design_contents.list_image_urls IS '리스트 페이지 표시용 이미지 배열';
COMMENT ON COLUMN public.public_design_contents.detail_image_urls IS '상세 페이지 표시용 이미지 배열';


