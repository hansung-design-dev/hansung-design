-- 공공디자인 테스트 데이터 삽입 (실제 데이터)

-- 간판개선사업 2018 - 당진
-- list 타입
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
  'banner_improvement',
  'list',
  '간판개선사업 2018',
  '당진',
  1,
  true,
  ARRAY['/images/public-design/banner_improvment/2018/당진/list/02.jpg']
);

-- detail 타입
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
  'banner_improvement',
  'detail',
  '간판개선사업 2018',
  '당진',
  2,
  true,
  ARRAY['/images/public-design/banner_improvment/2018/당진/detail/01.jpg', '/images/public-design/banner_improvment/2018/당진/detail/03.jpg', '/images/public-design/banner_improvment/2018/당진/detail/05.jpg']
);

-- 간판개선사업 2020 - 사당1동
-- list 타입
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
  'banner_improvement',
  'list',
  '간판개선사업 2020',
  '사당1동',
  3,
  true,
  ARRAY['/images/public-design/banner_improvment/2020/sadang/list/01.jpg']
);

-- detail 타입
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
  'banner_improvement',
  'detail',
  '간판개선사업 2020',
  '사당1동',
  4,
  true,
  ARRAY['/images/public-design/banner_improvment/2020/sadang/detail/01.jpg', '/images/public-design/banner_improvment/2020/sadang/detail/02.jpg']
);

-- 간판개선사업 2020 - 서부시장
-- list 타입
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
  'banner_improvement',
  'list',
  '간판개선사업 2020',
  '서부시장',
  5,
  true,
  ARRAY['/images/public-design/banner_improvment/2020/seobu/list/01.jpg']
);

-- detail 타입
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
  'banner_improvement',
  'detail',
  '간판개선사업 2020',
  '서부시장',
  6,
  true,
  ARRAY['/images/public-design/banner_improvment/2020/seobu/detail/01.jpg', '/images/public-design/banner_improvment/2020/seobu/detail/02.jpg']
);

-- 간판개선사업 2021 - 고양후곡4단지
-- list 타입
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
  'banner_improvement',
  'list',
  '간판개선사업 2021',
  '고양후곡4단지',
  7,
  true,
  ARRAY['/images/public-design/banner_improvment/2021/goyang/list/01.jpg']
);

-- detail 타입
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
  'banner_improvement',
  'detail',
  '간판개선사업 2021',
  '고양후곡4단지',
  8,
  true,
  ARRAY['/images/public-design/banner_improvment/2021/goyang/detail/01.jpg', '/images/public-design/banner_improvment/2021/goyang/detail/02.jpg']
);

-- 간판개선사업 2021 - 구로
-- list 타입
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
  'banner_improvement',
  'list',
  '간판개선사업 2021',
  '구로',
  9,
  true,
  ARRAY['/images/public-design/banner_improvment/2021/guro/list/01.jpg']
);

-- detail 타입
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
  'banner_improvement',
  'detail',
  '간판개선사업 2021',
  '구로',
  10,
  true,
  ARRAY['/images/public-design/banner_improvment/2021/guro/detail/01.jpg', '/images/public-design/banner_improvment/2021/guro/detail/02.jpg']
);

-- 간판개선사업 2021 - 세검정로
-- list 타입
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
  'banner_improvement',
  'list',
  '간판개선사업 2021',
  '세검정로',
  11,
  true,
  ARRAY['/images/public-design/banner_improvment/2021/saegumjung/list/01.jpg']
);

-- detail 타입
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
  'banner_improvement',
  'detail',
  '간판개선사업 2021',
  '세검정로',
  12,
  true,
  ARRAY['/images/public-design/banner_improvment/2021/saegumjung/detail/01.jpg', '/images/public-design/banner_improvment/2021/saegumjung/detail/02.jpg']
);

-- 간판개선사업 2022 - 관악
-- list 타입
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
  'banner_improvement',
  'list',
  '간판개선사업 2022',
  '관악',
  13,
  true,
  ARRAY['/images/public-design/banner_improvment/2022/gwanak/list/01.jpg']
);

-- detail 타입
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
  'banner_improvement',
  'detail',
  '간판개선사업 2022',
  '관악',
  14,
  true,
  ARRAY['/images/public-design/banner_improvment/2022/gwanak/detail/01.jpg', '/images/public-design/banner_improvment/2022/gwanak/detail/02.jpg']
);

-- 간판개선사업 2022 - 구로
-- list 타입
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
  'banner_improvement',
  'list',
  '간판개선사업 2022',
  '구로',
  15,
  true,
  ARRAY['/images/public-design/banner_improvment/2022/guro/list/01.jpg']
);

-- detail 타입
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
  'banner_improvement',
  'detail',
  '간판개선사업 2022',
  '구로',
  16,
  true,
  ARRAY['/images/public-design/banner_improvment/2022/guro/detail/01.jpg', '/images/public-design/banner_improvment/2022/guro/detail/02.jpg']
);

-- 간판개선사업 2022 - 모래내
-- list 타입
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
  'banner_improvement',
  'list',
  '간판개선사업 2022',
  '모래내',
  17,
  true,
  ARRAY['/images/public-design/banner_improvment/2022/moraenae/list/01.jpg']
);

-- detail 타입
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
  'banner_improvement',
  'detail',
  '간판개선사업 2022',
  '모래내',
  18,
  true,
  ARRAY['/images/public-design/banner_improvment/2022/moraenae/detail/01.jpg', '/images/public-design/banner_improvment/2022/moraenae/detail/02.jpg']
);

-- 간판개선사업 2022 - 세검정로
-- list 타입
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
  'banner_improvement',
  'list',
  '간판개선사업 2022',
  '세검정로',
  19,
  true,
  ARRAY['/images/public-design/banner_improvment/2022/saegumjung/list/01.jpg']
);

-- detail 타입
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
  'banner_improvement',
  'detail',
  '간판개선사업 2022',
  '세검정로',
  20,
  true,
  ARRAY['/images/public-design/banner_improvment/2022/saegumjung/detail/01.jpg', '/images/public-design/banner_improvment/2022/saegumjung/detail/02.jpg']
);

-- 간판개선사업 2023 - 관악구 전통시장 안내사인
-- list 타입
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
  'banner_improvement',
  'list',
  '간판개선사업 2023',
  '관악구 전통시장 안내사인',
  21,
  true,
  ARRAY['/images/public-design/banner_improvment/2023/gwanak/list/01.jpg']
);

-- detail 타입
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
  'banner_improvement',
  'detail',
  '간판개선사업 2023',
  '관악구 전통시장 안내사인',
  22,
  true,
  ARRAY['/images/public-design/banner_improvment/2023/gwanak/detail/01.jpg', '/images/public-design/banner_improvment/2023/gwanak/detail/02.jpg']
);

-- 간판개선사업 2023 - 금천구
-- list 타입
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
  'banner_improvement',
  'list',
  '간판개선사업 2023',
  '금천구',
  23,
  true,
  ARRAY['/images/public-design/banner_improvment/2023/geumcheon/list/01.jpg']
);

-- detail 타입
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
  'banner_improvement',
  'detail',
  '간판개선사업 2023',
  '금천구',
  24,
  true,
  ARRAY['/images/public-design/banner_improvment/2023/geumcheon/detail/01.jpg', '/images/public-design/banner_improvment/2023/geumcheon/detail/02.jpg']
);

-- 간판개선사업 2023 - 중구
-- list 타입
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
  'banner_improvement',
  'list',
  '간판개선사업 2023',
  '중구',
  25,
  true,
  ARRAY['/images/public-design/banner_improvment/2023/junggu/list/01.jpg']
);

-- detail 타입
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
  'banner_improvement',
  'detail',
  '간판개선사업 2023',
  '중구',
  26,
  true,
  ARRAY['/images/public-design/banner_improvment/2023/junggu/detail/01.jpg', '/images/public-design/banner_improvment/2023/junggu/detail/02.jpg']
);

-- 간판개선사업 2024 - 관악 골목상점가
-- list 타입
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
  'banner_improvement',
  'list',
  '간판개선사업 2024',
  '관악 골목상점가',
  27,
  true,
  ARRAY['/images/public-design/banner_improvment/2024/gwanak/list/01.jpg']
);

-- detail 타입
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
  'banner_improvement',
  'detail',
  '간판개선사업 2024',
  '관악 골목상점가',
  28,
  true,
  ARRAY['/images/public-design/banner_improvment/2024/gwanak/detail/01.jpg', '/images/public-design/banner_improvment/2024/gwanak/detail/02.jpg']
);

-- 간판개선사업 2024 - 노원구
-- list 타입
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
  'banner_improvement',
  'list',
  '간판개선사업 2024',
  '노원구',
  29,
  true,
  ARRAY['/images/public-design/banner_improvment/2024/nowon/list/01.jpg']
);

-- detail 타입
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
  'banner_improvement',
  'detail',
  '간판개선사업 2024',
  '노원구',
  30,
  true,
  ARRAY['/images/public-design/banner_improvment/2024/nowon/detail/01.jpg', '/images/public-design/banner_improvment/2024/nowon/detail/02.jpg']
);

-- 간판개선사업 2024 - 송파 핵심특화가로
-- list 타입
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
  'banner_improvement',
  'list',
  '간판개선사업 2024',
  '송파 핵심특화가로',
  31,
  true,
  ARRAY['/images/public-design/banner_improvment/2024/songpa/list/01.jpg']
);

-- detail 타입
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
  'banner_improvement',
  'detail',
  '간판개선사업 2024',
  '송파 핵심특화가로',
  32,
  true,
  ARRAY['/images/public-design/banner_improvment/2024/songpa/detail/01.jpg', '/images/public-design/banner_improvment/2024/songpa/detail/02.jpg']
);

-- 간판개선사업 2024 - 연수구
-- list 타입
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
  'banner_improvement',
  'list',
  '간판개선사업 2024',
  '연수구',
  33,
  true,
  ARRAY['/images/public-design/banner_improvment/2024/yeonsugu/list/01.jpg']
);

-- detail 타입
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
  'banner_improvement',
  'detail',
  '간판개선사업 2024',
  '연수구',
  34,
  true,
  ARRAY['/images/public-design/banner_improvment/2024/yeonsugu/detail/01.jpg', '/images/public-design/banner_improvment/2024/yeonsugu/detail/02.jpg']
);

-- 간판개선사업 2024 - 횡성둔내면
-- list 타입
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
  'banner_improvement',
  'list',
  '간판개선사업 2024',
  '횡성둔내면',
  35,
  true,
  ARRAY['/images/public-design/banner_improvment/2024/hoengseong/list/01.jpg']
);

-- detail 타입
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
  'banner_improvement',
  'detail',
  '간판개선사업 2024',
  '횡성둔내면',
  36,
  true,
  ARRAY['/images/public-design/banner_improvment/2024/hoengseong/detail/01.jpg', '/images/public-design/banner_improvment/2024/hoengseong/detail/02.jpg']
);

-- 환경개선사업들 (총 9개)

-- 1. 강동 강일교
-- list 타입
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
  37,
  true,
  ARRAY['/images/public-design/env_improvememt/강동 강일교/01.jpg']
);

-- detail 타입
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
  38,
  true,
  ARRAY['/images/public-design/env_improvememt/강동 강일교/02.jpg', '/images/public-design/env_improvememt/강동 강일교/03.jpg']
);

-- 2. 구월3동 로데오광장
-- list 타입
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
  39,
  true,
  ARRAY['/images/public-design/env_improvememt/구월3동 로데오광장/01.jpg']
);

-- detail 타입
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
  40,
  true,
  ARRAY['/images/public-design/env_improvememt/구월3동 로데오광장/02.jpg', '/images/public-design/env_improvememt/구월3동 로데오광장/03.jpg']
);

-- 3. 대화동 도시재생
-- list 타입
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
  41,
  true,
  ARRAY['/images/public-design/env_improvememt/대화동 도시재생/01.jpg']
);

-- detail 타입
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
  42,
  true,
  ARRAY['/images/public-design/env_improvememt/대화동 도시재생/02.jpg', '/images/public-design/env_improvememt/대화동 도시재생/03.jpg']
);

-- 4. 동작구 수해예방
-- list 타입
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
  '동작구 수해예방',
  43,
  true,
  ARRAY['/images/public-design/env_improvememt/동작구 수해예방/01.jpg']
);

-- detail 타입
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
  '동작구 수해예방',
  44,
  true,
  ARRAY['/images/public-design/env_improvememt/동작구 수해예방/02.jpg', '/images/public-design/env_improvememt/동작구 수해예방/03.jpg']
);

-- 5. 동작구 틈새예방
-- list 타입
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
  45,
  true,
  ARRAY['/images/public-design/env_improvememt/동작구 틈새예방/01.jpg']
);

-- detail 타입
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
  46,
  true,
  ARRAY['/images/public-design/env_improvememt/동작구 틈새예방/02.jpg', '/images/public-design/env_improvememt/동작구 틈새예방/03.jpg']
);

-- 6. 사당4동 가로환경개선
-- list 타입
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
  47,
  true,
  ARRAY['/images/public-design/env_improvememt/사당4동 가로환경개선/03.jpg']
);

-- detail 타입
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
  48,
  true,
  ARRAY['/images/public-design/env_improvememt/사당4동 가로환경개선/01.jpg', '/images/public-design/env_improvememt/사당4동 가로환경개선/02.jpg']
);

-- 7. 서촌 테마별거리
-- list 타입
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
  '서촌 테마별거리',
  49,
  true,
  ARRAY['/images/public-design/env_improvememt/서촌 테마별거리/01.jpg']
);

-- detail 타입
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
  '서촌 테마별거리',
  50,
  true,
  ARRAY['/images/public-design/env_improvememt/서촌 테마별거리/02.jpg', '/images/public-design/env_improvememt/서촌 테마별거리/03.jpg']
);

-- 8. 양주경로당
-- list 타입
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
  51,
  true,
  ARRAY['/images/public-design/env_improvememt/양주경로당/01.jpg']
);

-- detail 타입
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
  52,
  true,
  ARRAY['/images/public-design/env_improvememt/양주경로당/02.jpg', '/images/public-design/env_improvememt/양주경로당/03.jpg']
);

-- 9. 중랑구 범죄예방
-- list 타입
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
  53,
  true,
  ARRAY['/images/public-design/env_improvememt/중랑구 범죄예방/01.jpg']
);

-- detail 타입
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
  54,
  true,
  ARRAY['/images/public-design/env_improvememt/중랑구 범죄예방/02.jpg', '/images/public-design/env_improvememt/중랑구 범죄예방/03.jpg']
); 