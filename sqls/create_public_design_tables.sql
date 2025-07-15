-- 디자인 콘텐츠 타입 enum 생성
CREATE TYPE design_contents_type_enum AS ENUM ('list', 'detail');

-- 공공디자인 콘텐츠 통합 테이블
CREATE TABLE public.public_design_contents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid, -- 프로젝트별 그룹핑용 (브랜드 아이템, 공공디자인 등)
  design_contents_type design_contents_type_enum NOT NULL,
  title text,
  subtitle text,
  description text,
  image_url text,
  alt_text text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT public_design_contents_pkey PRIMARY KEY (id)
);

-- 샘플 데이터 삽입
-- 브랜드 아이템 프로젝트
INSERT INTO public.public_design_contents (project_id, design_contents_type, title, subtitle, description, image_url, display_order) VALUES
(gen_random_uuid(), 'list', '브랜드 아이템', '간판개선사업', '도시의 새로운 경험을 만드는 브랜드', '/images/public-design-image2.jpeg', 1);

-- 첫 번째 프로젝트의 상세 이미지들 (같은 project_id 사용)
WITH first_project AS (
  SELECT project_id FROM public.public_design_contents WHERE title = '브랜드 아이템' LIMIT 1
)
INSERT INTO public.public_design_contents (project_id, design_contents_type, title, alt_text, image_url, display_order)
SELECT 
  fp.project_id,
  'detail',
  '디자인 구성도',
  '디자인 구성도',
  '/images/publicdesign-detailpage-image.png',
  1
FROM first_project fp;

WITH first_project AS (
  SELECT project_id FROM public.public_design_contents WHERE title = '브랜드 아이템' LIMIT 1
)
INSERT INTO public.public_design_contents (project_id, design_contents_type, title, alt_text, image_url, display_order)
SELECT 
  fp.project_id,
  'detail',
  '디자인 상세 이미지1',
  '디자인 상세 이미지1',
  '/images/public-design-image2.jpeg',
  2
FROM first_project fp;

WITH first_project AS (
  SELECT project_id FROM public.public_design_contents WHERE title = '브랜드 아이템' LIMIT 1
)
INSERT INTO public.public_design_contents (project_id, design_contents_type, title, alt_text, image_url, display_order)
SELECT 
  fp.project_id,
  'detail',
  '디자인 상세 이미지2',
  '디자인 상세 이미지2',
  '/images/public-design-image2.jpeg',
  3
FROM first_project fp;

-- 나머지 프로젝트들 추가
INSERT INTO public.public_design_contents (project_id, design_contents_type, title, subtitle, description, image_url, display_order) VALUES
(gen_random_uuid(), 'list', '공공디자인', '서브타이틀', '도시 경관을 아름답게 만드는 디자인', '/images/public-design-image2.jpeg', 2),
(gen_random_uuid(), 'list', '공공시설물', '서브타이틀', '도시의 기능을 높이는 시설물', '/images/public-design-image2.jpeg', 3),
(gen_random_uuid(), 'list', '스마트 시티', '서브타이틀', '미래 도시의 새로운 가능성', '/images/public-design-image2.jpeg', 4),
(gen_random_uuid(), 'list', '도시 경관', '서브타이틀', '도시 환경을 개선하는 디자인', '/images/public-design-image2.jpeg', 5),
(gen_random_uuid(), 'list', '환경 친화 디자인', '친환경 솔루션', '지속 가능한 도시 환경을 위한 디자인', '/images/public-design-image2.jpeg', 6),
(gen_random_uuid(), 'list', '문화 공간', '문화시설', '도시의 문화적 가치를 높이는 공간 디자인', '/images/public-design-image2.jpeg', 7),
(gen_random_uuid(), 'list', '교통 인프라', '교통시설', '스마트한 교통 시스템을 위한 디자인', '/images/public-design-image2.jpeg', 8),
(gen_random_uuid(), 'list', '공원 조성', '녹지공간', '도시민을 위한 휴식과 여가 공간', '/images/public-design-image2.jpeg', 9),
(gen_random_uuid(), 'list', '디지털 아트', '미디어아트', '기술과 예술이 결합된 공공미술', '/images/public-design-image2.jpeg', 10);

-- 나머지 프로젝트들도 동일한 패턴으로 상세 이미지 추가
-- (실제로는 각 프로젝트별로 다른 이미지들이 들어갈 예정)

-- 두 번째 프로젝트 상세 이미지들
WITH second_project AS (
  SELECT project_id FROM public.public_design_contents WHERE title = '공공디자인' LIMIT 1
)
INSERT INTO public.public_design_contents (project_id, design_contents_type, title, alt_text, image_url, display_order)
SELECT 
  sp.project_id,
  'detail',
  '디자인 구성도',
  '디자인 구성도',
  '/images/publicdesign-detailpage-image.png',
  1
FROM second_project sp;

WITH second_project AS (
  SELECT project_id FROM public.public_design_contents WHERE title = '공공디자인' LIMIT 1
)
INSERT INTO public.public_design_contents (project_id, design_contents_type, title, alt_text, image_url, display_order)
SELECT 
  sp.project_id,
  'detail',
  '디자인 상세 이미지1',
  '디자인 상세 이미지1',
  '/images/public-design-image2.jpeg',
  2
FROM second_project sp;

-- 세 번째 프로젝트 상세 이미지들
WITH third_project AS (
  SELECT project_id FROM public.public_design_contents WHERE title = '공공시설물' LIMIT 1
)
INSERT INTO public.public_design_contents (project_id, design_contents_type, title, alt_text, image_url, display_order)
SELECT 
  tp.project_id,
  'detail',
  '디자인 구성도',
  '디자인 구성도',
  '/images/publicdesign-detailpage-image.png',
  1
FROM third_project tp;

-- 네 번째 프로젝트 상세 이미지들
WITH fourth_project AS (
  SELECT project_id FROM public.public_design_contents WHERE title = '스마트 시티' LIMIT 1
)
INSERT INTO public.public_design_contents (project_id, design_contents_type, title, alt_text, image_url, display_order)
SELECT 
  fp.project_id,
  'detail',
  '디자인 구성도',
  '디자인 구성도',
  '/images/publicdesign-detailpage-image.png',
  1
FROM fourth_project fp;

-- 다섯 번째 프로젝트 상세 이미지들
WITH fifth_project AS (
  SELECT project_id FROM public.public_design_contents WHERE title = '도시 경관' LIMIT 1
)
INSERT INTO public.public_design_contents (project_id, design_contents_type, title, alt_text, image_url, display_order)
SELECT 
  fp.project_id,
  'detail',
  '디자인 구성도',
  '디자인 구성도',
  '/images/publicdesign-detailpage-image.png',
  1
FROM fifth_project fp; 