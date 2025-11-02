-- ====================================
-- 디지털 미디어 및 공공디자인 테이블 생성 쿼리
-- ====================================

-- 1. 디지털 전광판 테이블 (Digital Media Billboards)
-- 구월로데오광장, 별빛프로포즈탐방로, 병점광장 등의 대형 전광판 정보
CREATE TABLE IF NOT EXISTS public.digital_media_billboards (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  district_code character varying NOT NULL UNIQUE,
  title character varying NOT NULL,
  main_image_url text NOT NULL,
  image_urls text[] DEFAULT '{}'::text[],
  operating_lineup text,
  model_name text,
  product_size text,
  resolution_brightness text,
  key_features text,
  usage text,
  installation_method text,
  inquiry_phone character varying,
  description text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT digital_media_billboards_pkey PRIMARY KEY (id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_digital_media_billboards_district_code 
  ON public.digital_media_billboards(district_code);
CREATE INDEX IF NOT EXISTS idx_digital_media_billboards_is_active 
  ON public.digital_media_billboards(is_active);
CREATE INDEX IF NOT EXISTS idx_digital_media_billboards_display_order 
  ON public.digital_media_billboards(display_order);

-- 2. 디지털 사이니지 제품 테이블 (Digital Signage Products)
-- 삼성, LG 등의 디지털 사이니지 제품 정보
CREATE TABLE IF NOT EXISTS public.digital_signage_products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_code character varying NOT NULL UNIQUE,
  title character varying NOT NULL,
  main_image_url text NOT NULL,
  image_urls text[] DEFAULT '{}'::text[],
  product_type character varying NOT NULL,
  series_name character varying,
  model_name character varying NOT NULL,
  brand character varying,
  inch_size character varying,
  physical_size character varying,
  resolution character varying,
  brightness character varying,
  specifications text,
  usage text,
  installation_method text,
  vesa_hole character varying,
  price character varying,
  special_features text,
  description text,
  bracket_note text,
  contact_info character varying,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT digital_signage_products_pkey PRIMARY KEY (id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_digital_signage_products_product_code 
  ON public.digital_signage_products(product_code);
CREATE INDEX IF NOT EXISTS idx_digital_signage_products_product_type 
  ON public.digital_signage_products(product_type);
CREATE INDEX IF NOT EXISTS idx_digital_signage_products_brand 
  ON public.digital_signage_products(brand);
CREATE INDEX IF NOT EXISTS idx_digital_signage_products_is_active 
  ON public.digital_signage_products(is_active);
CREATE INDEX IF NOT EXISTS idx_digital_signage_products_display_order 
  ON public.digital_signage_products(display_order);

-- 3. 미디어 경관 디스플레이 테이블 (Media Landscape Displays)
-- 간송미술관, 레드로드, 백년시장 등의 미디어 경관 프로젝트 정보
CREATE TABLE IF NOT EXISTS public.media_landscape_displays (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_code character varying NOT NULL UNIQUE,
  title character varying NOT NULL,
  main_image_url text NOT NULL,
  image_urls text[] DEFAULT '{}'::text[],
  operating_lineup text,
  model_name text,
  product_size text,
  resolution_brightness text,
  key_features text,
  usage text,
  installation_method text,
  inquiry_phone character varying,
  description text,
  location text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT media_landscape_displays_pkey PRIMARY KEY (id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_media_landscape_displays_project_code 
  ON public.media_landscape_displays(project_code);
CREATE INDEX IF NOT EXISTS idx_media_landscape_displays_is_active 
  ON public.media_landscape_displays(is_active);
CREATE INDEX IF NOT EXISTS idx_media_landscape_displays_display_order 
  ON public.media_landscape_displays(display_order);

-- 코멘트 추가
COMMENT ON TABLE public.digital_media_billboards IS '디지털 전광판 정보 테이블 - 지역별 대형 전광판 설치 정보';
COMMENT ON TABLE public.digital_signage_products IS '디지털 사이니지 제품 테이블 - 삼성, LG 등 제조사별 사이니지 제품 정보';
COMMENT ON TABLE public.media_landscape_displays IS '미디어 경관 디스플레이 테이블 - 문화시설 및 공공장소의 미디어 디스플레이 프로젝트 정보';


