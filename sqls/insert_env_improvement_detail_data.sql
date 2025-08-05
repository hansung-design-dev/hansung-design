-- 환경개선 프로젝트 상세 데이터 삽입

-- 1. 강동 강일교 상세
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
  'detail',
  '환경개선',
  '강동 강일교',
  29,
  true,
  ARRAY['env_improvement/gangdong_gangil/detail/01.jpg', 'env_improvement/gangdong_gangil/detail/02.jpg', 'env_improvement/gangdong_gangil/detail/03.jpg']
);

-- 2. 구월3동 로데오광장 상세
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
  'detail',
  '환경개선',
  '구월3동 로데오광장',
  30,
  true,
  ARRAY['env_improvement/guwol3_rodeo/detail/01.jpg', 'env_improvement/guwol3_rodeo/detail/02.jpg', 'env_improvement/guwol3_rodeo/detail/03.jpg']
);

-- 3. 대화동 도시재생 상세
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
  'detail',
  '환경개선',
  '대화동 도시재생',
  31,
  true,
  ARRAY['env_improvement/daehwa_urban/detail/01.jpg', 'env_improvement/daehwa_urban/detail/02.jpg', 'env_improvement/daehwa_urban/detail/03.jpg']
);

-- 4. 동작구 수혜예방 상세
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
  'detail',
  '환경개선',
  '동작구 수혜예방',
  32,
  true,
  ARRAY['env_improvement/dongjak_benefit/detail/01.jpg', 'env_improvement/dongjak_benefit/detail/02.jpg', 'env_improvement/dongjak_benefit/detail/03.jpg']
);

-- 5. 동작구 틈새예방 상세
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
  'detail',
  '환경개선',
  '동작구 틈새예방',
  33,
  true,
  ARRAY['env_improvement/dongjak_gap/detail/01.jpg', 'env_improvement/dongjak_gap/detail/02.jpg', 'env_improvement/dongjak_gap/detail/03.jpg']
);

-- 6. 사당4동 가로환경개선 상세
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
  'detail',
  '환경개선',
  '사당4동 가로환경개선',
  34,
  true,
  ARRAY['env_improvement/sadang4_street/detail/01.jpg', 'env_improvement/sadang4_street/detail/02.jpg', 'env_improvement/sadang4_street/detail/03.jpg']
);

-- 7. 서촌 테마별 거리 상세
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
  'detail',
  '환경개선',
  '서촌 테마별 거리',
  35,
  true,
  ARRAY['env_improvement/seochon_theme/detail/01.jpg', 'env_improvement/seochon_theme/detail/02.jpg', 'env_improvement/seochon_theme/detail/03.jpg']
);

-- 8. 양주경로당 상세
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
  'detail',
  '환경개선',
  '양주경로당',
  36,
  true,
  ARRAY['env_improvement/yangju_senior/detail/01.jpg', 'env_improvement/yangju_senior/detail/02.jpg', 'env_improvement/yangju_senior/detail/03.jpg']
);

-- 9. 중랑구 범죄예방 상세
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
  'detail',
  '환경개선',
  '중랑구 범죄예방',
  37,
  true,
  ARRAY['env_improvement/jungnang_crime/detail/01.jpg', 'env_improvement/jungnang_crime/detail/02.jpg', 'env_improvement/jungnang_crime/detail/03.jpg']
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
  AND design_contents_type = 'detail'
  AND is_active = true
ORDER BY display_order; 