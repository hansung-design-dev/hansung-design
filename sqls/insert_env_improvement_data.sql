-- 환경개선 프로젝트 데이터 삽입

-- 1. 강동 강일교
INSERT INTO public.public_design_contents (
  id,
  project_category,
  design_contents_type,
  title,
  location,
  display_order,
  is_active,
  image_urls
) VALUES (
  gen_random_uuid(),
  'env_improvement',
  'list',
  '환경개선',
  '강동 강일교',
  20,
  true,
  ARRAY['env_improvement/gangdong_gangil/list/01.jpg', 'env_improvement/gangdong_gangil/list/02.jpg']
);

-- 2. 구월3동 로데오광장
INSERT INTO public.public_design_contents (
  id,
  project_category,
  design_contents_type,
  title,
  location,
  display_order,
  is_active,
  image_urls
) VALUES (
  gen_random_uuid(),
  'env_improvement',
  'list',
  '환경개선',
  '구월3동 로데오광장',
  21,
  true,
  ARRAY['env_improvement/guwol3_rodeo/list/01.jpg', 'env_improvement/guwol3_rodeo/list/02.jpg']
);

-- 3. 대화동 도시재생
INSERT INTO public.public_design_contents (
  id,
  project_category,
  design_contents_type,
  title,
  location,
  display_order,
  is_active,
  image_urls
) VALUES (
  gen_random_uuid(),
  'env_improvement',
  'list',
  '환경개선',
  '대화동 도시재생',
  22,
  true,
  ARRAY['env_improvement/daehwa_urban/list/01.jpg', 'env_improvement/daehwa_urban/list/02.jpg']
);

-- 4. 동작구 수혜예방
INSERT INTO public.public_design_contents (
  id,
  project_category,
  design_contents_type,
  title,
  location,
  display_order,
  is_active,
  image_urls
) VALUES (
  gen_random_uuid(),
  'env_improvement',
  'list',
  '환경개선',
  '동작구 수혜예방',
  23,
  true,
  ARRAY['env_improvement/dongjak_benefit/list/01.jpg', 'env_improvement/dongjak_benefit/list/02.jpg']
);

-- 5. 동작구 틈새예방
INSERT INTO public.public_design_contents (
  id,
  project_category,
  design_contents_type,
  title,
  location,
  display_order,
  is_active,
  image_urls
) VALUES (
  gen_random_uuid(),
  'env_improvement',
  'list',
  '환경개선',
  '동작구 틈새예방',
  24,
  true,
  ARRAY['env_improvement/dongjak_gap/list/01.jpg', 'env_improvement/dongjak_gap/list/02.jpg']
);

-- 6. 사당4동 가로환경개선
INSERT INTO public.public_design_contents (
  id,
  project_category,
  design_contents_type,
  title,
  location,
  display_order,
  is_active,
  image_urls
) VALUES (
  gen_random_uuid(),
  'env_improvement',
  'list',
  '환경개선',
  '사당4동 가로환경개선',
  25,
  true,
  ARRAY['env_improvement/sadang4_street/list/01.jpg', 'env_improvement/sadang4_street/list/02.jpg']
);

-- 7. 서촌 테마별 거리
INSERT INTO public.public_design_contents (
  id,
  project_category,
  design_contents_type,
  title,
  location,
  display_order,
  is_active,
  image_urls
) VALUES (
  gen_random_uuid(),
  'env_improvement',
  'list',
  '환경개선',
  '서촌 테마별 거리',
  26,
  true,
  ARRAY['env_improvement/seochon_theme/list/01.jpg', 'env_improvement/seochon_theme/list/02.jpg']
);

-- 8. 양주경로당
INSERT INTO public.public_design_contents (
  id,
  project_category,
  design_contents_type,
  title,
  location,
  display_order,
  is_active,
  image_urls
) VALUES (
  gen_random_uuid(),
  'env_improvement',
  'list',
  '환경개선',
  '양주경로당',
  27,
  true,
  ARRAY['env_improvement/yangju_senior/list/01.jpg', 'env_improvement/yangju_senior/list/02.jpg']
);

-- 9. 중랑구 범죄예방
INSERT INTO public.public_design_contents (
  id,
  project_category,
  design_contents_type,
  title,
  location,
  display_order,
  is_active,
  image_urls
) VALUES (
  gen_random_uuid(),
  'env_improvement',
  'list',
  '환경개선',
  '중랑구 범죄예방',
  28,
  true,
  ARRAY['env_improvement/jungnang_crime/list/01.jpg', 'env_improvement/jungnang_crime/list/02.jpg']
);

-- 데이터 확인
SELECT 
  id,
  project_category,
  design_contents_type,
  title,
  location,
  display_order,
  is_active,
  image_urls
FROM public.public_design_contents 
WHERE project_category = 'env_improvement' 
  AND design_contents_type = 'list'
  AND is_active = true
ORDER BY display_order; 