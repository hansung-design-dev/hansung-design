-- ====================================
-- 공공디자인 샘플 데이터 삽입 쿼리
-- ====================================

-- 1. 간판개선사업 (Banner Improvement) 프로젝트들

-- 2018년 당진
INSERT INTO public.public_design_contents (
  design_contents_type, title, location, description, year, project_code,
  list_image_urls, detail_image_urls, project_category, display_order, is_active
) VALUES (
  'list',
  '당진 간판개선사업',
  '당진',
  '도시 경관을 아름답게 만드는 간판 개선 프로젝트',
  2018,
  'banner_2018_dangjin',
  ARRAY[
    '/images/public-design/banner_improvment/2018/dangjin/list/02.jpg',
    '/images/public-design/banner_improvment/2018/dangjin/list/04.jpg'
  ],
  ARRAY[
    '/images/public-design/banner_improvment/2018/dangjin/detail/01.jpg',
    '/images/public-design/banner_improvment/2018/dangjin/detail/02.jpg',
    '/images/public-design/banner_improvment/2018/dangjin/detail/03.jpg',
    '/images/public-design/banner_improvment/2018/dangjin/detail/04.jpg',
    '/images/public-design/banner_improvment/2018/dangjin/detail/05.jpg'
  ],
  'banner_improvement',
  1,
  true
);

-- 2020년 사당
INSERT INTO public.public_design_contents (
  design_contents_type, title, location, description, year, project_code,
  list_image_urls, detail_image_urls, project_category, display_order, is_active
) VALUES (
  'list',
  '사당 간판개선사업',
  '서울시 동작구 사당동',
  '지역 상권 활성화를 위한 간판 디자인 개선',
  2020,
  'banner_2020_sadang',
  ARRAY[
    '/images/public-design/banner_improvment/2020/sadang/list/03.jpg',
    '/images/public-design/banner_improvment/2020/sadang/list/05.jpg'
  ],
  ARRAY[
    '/images/public-design/banner_improvment/2020/sadang/detail/01.jpg',
    '/images/public-design/banner_improvment/2020/sadang/detail/02.jpg',
    '/images/public-design/banner_improvment/2020/sadang/detail/03.jpg',
    '/images/public-design/banner_improvment/2020/sadang/detail/04.jpg',
    '/images/public-design/banner_improvment/2020/sadang/detail/05.jpg'
  ],
  'banner_improvement',
  2,
  true
);

-- 2020년 서부시장
INSERT INTO public.public_design_contents (
  design_contents_type, title, location, description, year, project_code,
  list_image_urls, detail_image_urls, project_category, display_order, is_active
) VALUES (
  'list',
  '서부시장 간판개선사업',
  '서부시장',
  '전통시장 활성화를 위한 상점 간판 디자인 개선',
  2020,
  'banner_2020_seobusijang',
  ARRAY[
    '/images/public-design/banner_improvment/2020/seobusijang/list/03.jpg',
    '/images/public-design/banner_improvment/2020/seobusijang/list/04.jpg'
  ],
  ARRAY[
    '/images/public-design/banner_improvment/2020/seobusijang/detail/01.jpg',
    '/images/public-design/banner_improvment/2020/seobusijang/detail/02.jpg',
    '/images/public-design/banner_improvment/2020/seobusijang/detail/03.jpg',
    '/images/public-design/banner_improvment/2020/seobusijang/detail/04.jpg',
    '/images/public-design/banner_improvment/2020/seobusijang/detail/05.jpg'
  ],
  'banner_improvement',
  3,
  true
);

-- 2021년 고양
INSERT INTO public.public_design_contents (
  design_contents_type, title, location, description, year, project_code,
  list_image_urls, detail_image_urls, project_category, display_order, is_active
) VALUES (
  'list',
  '고양 간판개선사업',
  '경기도 고양시',
  '고양시 상업지구 간판 통합 디자인 프로젝트',
  2021,
  'banner_2021_goyang',
  ARRAY[
    '/images/public-design/banner_improvment/2021/goyang/list/02.jpg',
    '/images/public-design/banner_improvment/2021/goyang/list/04.jpg'
  ],
  ARRAY[
    '/images/public-design/banner_improvment/2021/goyang/detail/01.jpg',
    '/images/public-design/banner_improvment/2021/goyang/detail/02.jpg',
    '/images/public-design/banner_improvment/2021/goyang/detail/03.jpg',
    '/images/public-design/banner_improvment/2021/goyang/detail/04.jpg',
    '/images/public-design/banner_improvment/2021/goyang/detail/05.jpg',
    '/images/public-design/banner_improvment/2021/goyang/detail/06.jpg'
  ],
  'banner_improvement',
  4,
  true
);

-- 2021년 구로
INSERT INTO public.public_design_contents (
  design_contents_type, title, location, description, year, project_code,
  list_image_urls, detail_image_urls, project_category, display_order, is_active
) VALUES (
  'list',
  '구로 간판개선사업',
  '서울시 구로구',
  '구로구 상권 활성화를 위한 간판 개선',
  2021,
  'banner_2021_guro',
  ARRAY[
    '/images/public-design/banner_improvment/2021/guro/list/04.jpg',
    '/images/public-design/banner_improvment/2021/guro/list/05.jpg'
  ],
  ARRAY[
    '/images/public-design/banner_improvment/2021/guro/detail/01.jpg',
    '/images/public-design/banner_improvment/2021/guro/detail/02.jpg',
    '/images/public-design/banner_improvment/2021/guro/detail/03.jpg',
    '/images/public-design/banner_improvment/2021/guro/detail/04.jpg',
    '/images/public-design/banner_improvment/2021/guro/detail/05.jpg'
  ],
  'banner_improvement',
  5,
  true
);

-- 2021년 새금정
INSERT INTO public.public_design_contents (
  design_contents_type, title, location, description, year, project_code,
  list_image_urls, detail_image_urls, project_category, display_order, is_active
) VALUES (
  'list',
  '새금정 간판개선사업',
  '서울시 새금정',
  '새금정역 주변 상권 간판 디자인 개선',
  2021,
  'banner_2021_saegumjung',
  ARRAY[
    '/images/public-design/banner_improvment/2021/saegumjung/list/03.jpg',
    '/images/public-design/banner_improvment/2021/saegumjung/list/06.jpg'
  ],
  ARRAY[
    '/images/public-design/banner_improvment/2021/saegumjung/detail/01.jpg',
    '/images/public-design/banner_improvment/2021/saegumjung/detail/02.jpg',
    '/images/public-design/banner_improvment/2021/saegumjung/detail/03.jpg',
    '/images/public-design/banner_improvment/2021/saegumjung/detail/04.jpg',
    '/images/public-design/banner_improvment/2021/saegumjung/detail/05.jpg',
    '/images/public-design/banner_improvment/2021/saegumjung/detail/06.jpg'
  ],
  'banner_improvement',
  6,
  true
);

-- 2022년 구로
INSERT INTO public.public_design_contents (
  design_contents_type, title, location, description, year, project_code,
  list_image_urls, detail_image_urls, project_category, display_order, is_active
) VALUES (
  'list',
  '구로 간판개선사업 2022',
  '서울시 구로구',
  '구로구 2차 간판 개선 프로젝트',
  2022,
  'banner_2022_guro',
  ARRAY[
    '/images/public-design/banner_improvment/2022/guro/list/03.jpg',
    '/images/public-design/banner_improvment/2022/guro/list/05.jpg'
  ],
  ARRAY[
    '/images/public-design/banner_improvment/2022/guro/detail/01.jpg',
    '/images/public-design/banner_improvment/2022/guro/detail/02.jpg',
    '/images/public-design/banner_improvment/2022/guro/detail/03.jpg',
    '/images/public-design/banner_improvment/2022/guro/detail/04.jpg',
    '/images/public-design/banner_improvment/2022/guro/detail/05.jpg',
    '/images/public-design/banner_improvment/2022/guro/detail/06.jpg'
  ],
  'banner_improvement',
  7,
  true
);

-- 2022년 관악
INSERT INTO public.public_design_contents (
  design_contents_type, title, location, description, year, project_code,
  list_image_urls, detail_image_urls, project_category, display_order, is_active
) VALUES (
  'list',
  '관악 간판개선사업',
  '서울시 관악구',
  '관악구 상권 간판 통합 디자인',
  2022,
  'banner_2022_gwanak',
  ARRAY[
    '/images/public-design/banner_improvment/2022/gwanak/list/04.jpg',
    '/images/public-design/banner_improvment/2022/gwanak/list/05.jpg'
  ],
  ARRAY[
    '/images/public-design/banner_improvment/2022/gwanak/detail/01.jpg',
    '/images/public-design/banner_improvment/2022/gwanak/detail/02.jpg',
    '/images/public-design/banner_improvment/2022/gwanak/detail/03.jpg',
    '/images/public-design/banner_improvment/2022/gwanak/detail/04.jpg',
    '/images/public-design/banner_improvment/2022/gwanak/detail/05.jpg',
    '/images/public-design/banner_improvment/2022/gwanak/detail/06.jpg'
  ],
  'banner_improvement',
  8,
  true
);

-- 2022년 모래내
INSERT INTO public.public_design_contents (
  design_contents_type, title, location, description, year, project_code,
  list_image_urls, detail_image_urls, project_category, display_order, is_active
) VALUES (
  'list',
  '모래내 간판개선사업',
  '서울시 모래내',
  '모래내 상권 간판 디자인 개선',
  2022,
  'banner_2022_moraenae',
  ARRAY[
    '/images/public-design/banner_improvment/2022/moraenae/list/04.jpg',
    '/images/public-design/banner_improvment/2022/moraenae/list/05.jpg'
  ],
  ARRAY[
    '/images/public-design/banner_improvment/2022/moraenae/detail/01.jpg',
    '/images/public-design/banner_improvment/2022/moraenae/detail/02.jpg',
    '/images/public-design/banner_improvment/2022/moraenae/detail/04.jpg',
    '/images/public-design/banner_improvment/2022/moraenae/detail/05.jpg',
    '/images/public-design/banner_improvment/2022/moraenae/detail/06.jpg',
    '/images/public-design/banner_improvment/2022/moraenae/detail/07.jpg'
  ],
  'banner_improvement',
  9,
  true
);

-- 2022년 새금정
INSERT INTO public.public_design_contents (
  design_contents_type, title, location, description, year, project_code,
  list_image_urls, detail_image_urls, project_category, display_order, is_active
) VALUES (
  'list',
  '새금정 간판개선사업 2022',
  '서울시 새금정',
  '새금정 2차 간판 개선 프로젝트',
  2022,
  'banner_2022_saegumjung',
  ARRAY[
    '/images/public-design/banner_improvment/2022/saegumjung/list/04.jpg',
    '/images/public-design/banner_improvment/2022/saegumjung/list/06.jpg'
  ],
  ARRAY[
    '/images/public-design/banner_improvment/2022/saegumjung/detail/01.jpg',
    '/images/public-design/banner_improvment/2022/saegumjung/detail/02.jpg',
    '/images/public-design/banner_improvment/2022/saegumjung/detail/03.jpg',
    '/images/public-design/banner_improvment/2022/saegumjung/detail/04.jpg',
    '/images/public-design/banner_improvment/2022/saegumjung/detail/05.jpg',
    '/images/public-design/banner_improvment/2022/saegumjung/detail/06.jpg'
  ],
  'banner_improvement',
  10,
  true
);

-- 2023년 금천
INSERT INTO public.public_design_contents (
  design_contents_type, title, location, description, year, project_code,
  list_image_urls, detail_image_urls, project_category, display_order, is_active
) VALUES (
  'list',
  '금천 간판개선사업',
  '서울시 금천구',
  '금천구 상권 간판 디자인 혁신',
  2023,
  'banner_2023_geumcheon',
  ARRAY[
    '/images/public-design/banner_improvment/2023/geumcheon/list/03.jpg',
    '/images/public-design/banner_improvment/2023/geumcheon/list/05.jpg',
    '/images/public-design/banner_improvment/2023/geumcheon/list/07.jpg'
  ],
  ARRAY[
    '/images/public-design/banner_improvment/2023/geumcheon/detail/01.jpg',
    '/images/public-design/banner_improvment/2023/geumcheon/detail/02.jpg',
    '/images/public-design/banner_improvment/2023/geumcheon/detail/03.jpg',
    '/images/public-design/banner_improvment/2023/geumcheon/detail/04.jpg',
    '/images/public-design/banner_improvment/2023/geumcheon/detail/05.jpg',
    '/images/public-design/banner_improvment/2023/geumcheon/detail/06.jpg',
    '/images/public-design/banner_improvment/2023/geumcheon/detail/07.jpg'
  ],
  'banner_improvement',
  11,
  true
);

-- 2023년 관악
INSERT INTO public.public_design_contents (
  design_contents_type, title, location, description, year, project_code,
  list_image_urls, detail_image_urls, project_category, display_order, is_active
) VALUES (
  'list',
  '관악 간판개선사업 2023',
  '서울시 관악구',
  '관악구 2차 간판 개선 프로젝트',
  2023,
  'banner_2023_gwanak',
  ARRAY[
    '/images/public-design/banner_improvment/2023/gwanak/list/04.jpg',
    '/images/public-design/banner_improvment/2023/gwanak/list/05.jpg'
  ],
  ARRAY[
    '/images/public-design/banner_improvment/2023/gwanak/detail/01.jpg',
    '/images/public-design/banner_improvment/2023/gwanak/detail/02.jpg',
    '/images/public-design/banner_improvment/2023/gwanak/detail/03.jpg',
    '/images/public-design/banner_improvment/2023/gwanak/detail/04.jpg',
    '/images/public-design/banner_improvment/2023/gwanak/detail/05.jpg',
    '/images/public-design/banner_improvment/2023/gwanak/detail/06.jpg'
  ],
  'banner_improvement',
  12,
  true
);

-- 2023년 중구
INSERT INTO public.public_design_contents (
  design_contents_type, title, location, description, year, project_code,
  list_image_urls, detail_image_urls, project_category, display_order, is_active
) VALUES (
  'list',
  '중구 간판개선사업',
  '서울시 중구',
  '중구 상업지구 간판 통합 디자인',
  2023,
  'banner_2023_junggu',
  ARRAY[
    '/images/public-design/banner_improvment/2023/junggu/list/05.jpg',
    '/images/public-design/banner_improvment/2023/junggu/list/07.jpg',
    '/images/public-design/banner_improvment/2023/junggu/list/08.jpg'
  ],
  ARRAY[
    '/images/public-design/banner_improvment/2023/junggu/detail/01.jpg',
    '/images/public-design/banner_improvment/2023/junggu/detail/02.jpg',
    '/images/public-design/banner_improvment/2023/junggu/detail/03.jpg',
    '/images/public-design/banner_improvment/2023/junggu/detail/04.jpg',
    '/images/public-design/banner_improvment/2023/junggu/detail/05.jpg',
    '/images/public-design/banner_improvment/2023/junggu/detail/06.jpg',
    '/images/public-design/banner_improvment/2023/junggu/detail/07.jpg',
    '/images/public-design/banner_improvment/2023/junggu/detail/08.jpg'
  ],
  'banner_improvement',
  13,
  true
);

-- 2024년 관악
INSERT INTO public.public_design_contents (
  design_contents_type, title, location, description, year, project_code,
  list_image_urls, detail_image_urls, project_category, display_order, is_active
) VALUES (
  'list',
  '관악 간판개선사업 2024',
  '서울시 관악구',
  '관악구 3차 간판 개선 프로젝트',
  2024,
  'banner_2024_gwanak',
  ARRAY[
    '/images/public-design/banner_improvment/2024/gwanak/list/01.jpg',
    '/images/public-design/banner_improvment/2024/gwanak/list/02.jpg'
  ],
  ARRAY[
    '/images/public-design/banner_improvment/2024/gwanak/detail/01.jpg',
    '/images/public-design/banner_improvment/2024/gwanak/detail/02.jpg',
    '/images/public-design/banner_improvment/2024/gwanak/detail/03.jpg',
    '/images/public-design/banner_improvment/2024/gwanak/detail/04.jpg',
    '/images/public-design/banner_improvment/2024/gwanak/detail/05.jpg'
  ],
  'banner_improvement',
  14,
  true
);

-- 2024년 횡성
INSERT INTO public.public_design_contents (
  design_contents_type, title, location, description, year, project_code,
  list_image_urls, detail_image_urls, project_category, display_order, is_active
) VALUES (
  'list',
  '횡성 간판개선사업',
  '강원도 횡성군',
  '횡성군 상권 간판 디자인 개선',
  2024,
  'banner_2024_hoengseong',
  ARRAY[
    '/images/public-design/banner_improvment/2024/hoengseong/list/01.jpg',
    '/images/public-design/banner_improvment/2024/hoengseong/list/02.jpg'
  ],
  ARRAY[
    '/images/public-design/banner_improvment/2024/hoengseong/detail/01.jpg',
    '/images/public-design/banner_improvment/2024/hoengseong/detail/02.jpg',
    '/images/public-design/banner_improvment/2024/hoengseong/detail/03.jpg',
    '/images/public-design/banner_improvment/2024/hoengseong/detail/04.jpg',
    '/images/public-design/banner_improvment/2024/hoengseong/detail/05.jpg',
    '/images/public-design/banner_improvment/2024/hoengseong/detail/06.jpg',
    '/images/public-design/banner_improvment/2024/hoengseong/detail/07.jpg',
    '/images/public-design/banner_improvment/2024/hoengseong/detail/08.jpg',
    '/images/public-design/banner_improvment/2024/hoengseong/detail/09.jpg'
  ],
  'banner_improvement',
  15,
  true
);

-- 2024년 노원
INSERT INTO public.public_design_contents (
  design_contents_type, title, location, description, year, project_code,
  list_image_urls, detail_image_urls, project_category, display_order, is_active
) VALUES (
  'list',
  '노원 간판개선사업',
  '서울시 노원구',
  '노원구 상권 간판 디자인 개선',
  2024,
  'banner_2024_nowon',
  ARRAY[
    '/images/public-design/banner_improvment/2024/nowon/list/01.jpg',
    '/images/public-design/banner_improvment/2024/nowon/list/02.jpg',
    '/images/public-design/banner_improvment/2024/nowon/list/03.jpg'
  ],
  ARRAY[
    '/images/public-design/banner_improvment/2024/nowon/detail/01.jpg',
    '/images/public-design/banner_improvment/2024/nowon/detail/02.jpg',
    '/images/public-design/banner_improvment/2024/nowon/detail/03.jpg',
    '/images/public-design/banner_improvment/2024/nowon/detail/04.jpg',
    '/images/public-design/banner_improvment/2024/nowon/detail/05.jpg',
    '/images/public-design/banner_improvment/2024/nowon/detail/06.jpg',
    '/images/public-design/banner_improvment/2024/nowon/detail/07.jpg',
    '/images/public-design/banner_improvment/2024/nowon/detail/08.jpg'
  ],
  'banner_improvement',
  16,
  true
);

-- 2024년 송파
INSERT INTO public.public_design_contents (
  design_contents_type, title, location, description, year, project_code,
  list_image_urls, detail_image_urls, project_category, display_order, is_active
) VALUES (
  'list',
  '송파 간판개선사업',
  '서울시 송파구',
  '송파구 상권 간판 디자인 개선',
  2024,
  'banner_2024_songpa',
  ARRAY[
    '/images/public-design/banner_improvment/2024/songpa/list/01.jpg',
    '/images/public-design/banner_improvment/2024/songpa/list/02.jpg',
    '/images/public-design/banner_improvment/2024/songpa/list/03.jpg'
  ],
  ARRAY[
    '/images/public-design/banner_improvment/2024/songpa/detail/01.jpg',
    '/images/public-design/banner_improvment/2024/songpa/detail/02.jpg',
    '/images/public-design/banner_improvment/2024/songpa/detail/03.jpg',
    '/images/public-design/banner_improvment/2024/songpa/detail/04.jpg',
    '/images/public-design/banner_improvment/2024/songpa/detail/05.jpg',
    '/images/public-design/banner_improvment/2024/songpa/detail/06.jpg',
    '/images/public-design/banner_improvment/2024/songpa/detail/07.jpg',
    '/images/public-design/banner_improvment/2024/songpa/detail/08.jpg'
  ],
  'banner_improvement',
  17,
  true
);

-- 2024년 연수구
INSERT INTO public.public_design_contents (
  design_contents_type, title, location, description, year, project_code,
  list_image_urls, detail_image_urls, project_category, display_order, is_active
) VALUES (
  'list',
  '연수구 간판개선사업',
  '인천시 연수구',
  '연수구 상권 간판 디자인 개선',
  2024,
  'banner_2024_yeonsugu',
  ARRAY[
    '/images/public-design/banner_improvment/2024/yeonsugu/list/01.jpg',
    '/images/public-design/banner_improvment/2024/yeonsugu/list/02.jpg'
  ],
  ARRAY[
    '/images/public-design/banner_improvment/2024/yeonsugu/detail/01.jpg',
    '/images/public-design/banner_improvment/2024/yeonsugu/detail/02.jpg',
    '/images/public-design/banner_improvment/2024/yeonsugu/detail/03.jpg',
    '/images/public-design/banner_improvment/2024/yeonsugu/detail/04.jpg',
    '/images/public-design/banner_improvment/2024/yeonsugu/detail/05.jpg',
    '/images/public-design/banner_improvment/2024/yeonsugu/detail/06.jpg',
    '/images/public-design/banner_improvment/2024/yeonsugu/detail/07.jpg',
    '/images/public-design/banner_improvment/2024/yeonsugu/detail/08.jpg'
  ],
  'banner_improvement',
  18,
  true
);

-- 2. 환경개선사업 (Environment Improvement) 프로젝트들

-- 사당4동 가로환경개선
INSERT INTO public.public_design_contents (
  design_contents_type, title, location, description, year, project_code,
  list_image_urls, detail_image_urls, project_category, display_order, is_active
) VALUES (
  'list',
  '사당4동 가로환경개선',
  '서울시 동작구 사당4동',
  '보행자 중심의 안전하고 쾌적한 가로환경 조성',
  2020,
  'env_sadang4',
  ARRAY[
    '/images/public-design/env_improvememt/streetImprovement_sadang/03.jpg',
    '/images/public-design/env_improvememt/streetImprovement_sadang/05.jpg'
  ],
  ARRAY[
    '/images/public-design/env_improvememt/streetImprovement_sadang/01.jpg',
    '/images/public-design/env_improvememt/streetImprovement_sadang/02.jpg',
    '/images/public-design/env_improvememt/streetImprovement_sadang/03.jpg',
    '/images/public-design/env_improvememt/streetImprovement_sadang/04.jpg',
    '/images/public-design/env_improvememt/streetImprovement_sadang/05.jpg',
    '/images/public-design/env_improvememt/streetImprovement_sadang/06.jpg'
  ],
  'env_improvement',
  101,
  true
);

-- 강동 강일교
INSERT INTO public.public_design_contents (
  design_contents_type, title, location, description, year, project_code,
  list_image_urls, detail_image_urls, project_category, display_order, is_active
) VALUES (
  'list',
  '강동 강일교 환경개선',
  '서울시 강동구',
  '강일교 주변 환경 개선 및 경관 조성',
  2021,
  'env_gangilgyo',
  ARRAY[
    '/images/public-design/env_improvememt/gangilGyo_gangdong/01.jpg',
    '/images/public-design/env_improvememt/gangilGyo_gangdong/03.jpg'
  ],
  ARRAY[
    '/images/public-design/env_improvememt/gangilGyo_gangdong/01.jpg',
    '/images/public-design/env_improvememt/gangilGyo_gangdong/02.jpg',
    '/images/public-design/env_improvememt/gangilGyo_gangdong/03.jpg',
    '/images/public-design/env_improvememt/gangilGyo_gangdong/04.jpg',
    '/images/public-design/env_improvememt/gangilGyo_gangdong/05.jpg',
    '/images/public-design/env_improvememt/gangilGyo_gangdong/06.jpg',
    '/images/public-design/env_improvememt/gangilGyo_gangdong/07.jpg',
    '/images/public-design/env_improvememt/gangilGyo_gangdong/08.jpg'
  ],
  'env_improvement',
  102,
  true
);

-- 구월3동 로데오광장
INSERT INTO public.public_design_contents (
  design_contents_type, title, location, description, year, project_code,
  list_image_urls, detail_image_urls, project_category, display_order, is_active
) VALUES (
  'list',
  '구월3동 로데오광장 환경개선',
  '인천시 남동구 구월3동',
  '로데오광장 환경 개선 및 문화 공간 조성',
  2021,
  'env_rodeo',
  ARRAY[
    '/images/public-design/env_improvememt/rodeoSquare_guwol3dong/01.jpg',
    '/images/public-design/env_improvememt/rodeoSquare_guwol3dong/03.jpg'
  ],
  ARRAY[
    '/images/public-design/env_improvememt/rodeoSquare_guwol3dong/01.jpg',
    '/images/public-design/env_improvememt/rodeoSquare_guwol3dong/02.jpg',
    '/images/public-design/env_improvememt/rodeoSquare_guwol3dong/03.jpg',
    '/images/public-design/env_improvememt/rodeoSquare_guwol3dong/04.jpg',
    '/images/public-design/env_improvememt/rodeoSquare_guwol3dong/05.jpg',
    '/images/public-design/env_improvememt/rodeoSquare_guwol3dong/06.jpg',
    '/images/public-design/env_improvememt/rodeoSquare_guwol3dong/2-1.jpg',
    '/images/public-design/env_improvememt/rodeoSquare_guwol3dong/2-2.jpg'
  ],
  'env_improvement',
  103,
  true
);

-- 대화동 도시재생
INSERT INTO public.public_design_contents (
  design_contents_type, title, location, description, year, project_code,
  list_image_urls, detail_image_urls, project_category, display_order, is_active
) VALUES (
  'list',
  '대화동 도시재생',
  '경기도 고양시 대화동',
  '도시재생을 통한 주거환경 개선',
  2021,
  'env_daehwa',
  ARRAY[
    '/images/public-design/env_improvememt/cityImprovement_daewhadong/01.jpg',
    '/images/public-design/env_improvememt/cityImprovement_daewhadong/03.jpg'
  ],
  ARRAY[
    '/images/public-design/env_improvememt/cityImprovement_daewhadong/01.jpg',
    '/images/public-design/env_improvememt/cityImprovement_daewhadong/02.jpg',
    '/images/public-design/env_improvememt/cityImprovement_daewhadong/03.jpg',
    '/images/public-design/env_improvememt/cityImprovement_daewhadong/04.jpg',
    '/images/public-design/env_improvememt/cityImprovement_daewhadong/05.jpg',
    '/images/public-design/env_improvememt/cityImprovement_daewhadong/06.jpg',
    '/images/public-design/env_improvememt/cityImprovement_daewhadong/07.jpg'
  ],
  'env_improvement',
  104,
  true
);

-- 동작구 수해예방
INSERT INTO public.public_design_contents (
  design_contents_type, title, location, description, year, project_code,
  list_image_urls, detail_image_urls, project_category, display_order, is_active
) VALUES (
  'list',
  '동작구 수해예방 환경개선',
  '서울시 동작구',
  '수해 예방을 위한 도시 환경 개선',
  2021,
  'env_suhae',
  ARRAY[
    '/images/public-design/env_improvememt/flood_dongjak/01.jpg',
    '/images/public-design/env_improvememt/flood_dongjak/03.jpg'
  ],
  ARRAY[
    '/images/public-design/env_improvememt/flood_dongjak/01.jpg',
    '/images/public-design/env_improvememt/flood_dongjak/02-1.jpg',
    '/images/public-design/env_improvememt/flood_dongjak/02.jpg',
    '/images/public-design/env_improvememt/flood_dongjak/03.jpg',
    '/images/public-design/env_improvememt/flood_dongjak/04.jpg',
    '/images/public-design/env_improvememt/flood_dongjak/05.jpg',
    '/images/public-design/env_improvememt/flood_dongjak/06.jpg',
    '/images/public-design/env_improvememt/flood_dongjak/07.jpg'
  ],
  'env_improvement',
  105,
  true
);

-- 동작구 틈새예방
INSERT INTO public.public_design_contents (
  design_contents_type, title, location, description, year, project_code,
  list_image_urls, detail_image_urls, project_category, display_order, is_active
) VALUES (
  'list',
  '동작구 틈새예방 환경개선',
  '서울시 동작구',
  '틈새공간 활용을 통한 도시 환경 개선',
  2021,
  'env_teumsae',
  ARRAY[
    '/images/public-design/env_improvememt/crack_dongjak/01.jpg',
    '/images/public-design/env_improvememt/crack_dongjak/03.jpg'
  ],
  ARRAY[
    '/images/public-design/env_improvememt/crack_dongjak/01.jpg',
    '/images/public-design/env_improvememt/crack_dongjak/02.jpg',
    '/images/public-design/env_improvememt/crack_dongjak/03.jpg',
    '/images/public-design/env_improvememt/crack_dongjak/04.jpg',
    '/images/public-design/env_improvememt/crack_dongjak/05.jpg',
    '/images/public-design/env_improvememt/crack_dongjak/06.jpg',
    '/images/public-design/env_improvememt/crack_dongjak/07.jpg',
    '/images/public-design/env_improvememt/crack_dongjak/08.jpg'
  ],
  'env_improvement',
  106,
  true
);

-- 서촌 테마별거리
INSERT INTO public.public_design_contents (
  design_contents_type, title, location, description, year, project_code,
  list_image_urls, detail_image_urls, project_category, display_order, is_active
) VALUES (
  'list',
  '서촌 테마별거리 조성',
  '서울시 종로구 서촌',
  '서촌 테마거리 조성을 통한 문화 환경 개선',
  2021,
  'env_seochon',
  ARRAY[
    '/images/public-design/env_improvememt/themeStreet_seochon/01.jpg',
    '/images/public-design/env_improvememt/themeStreet_seochon/03.jpg'
  ],
  ARRAY[
    '/images/public-design/env_improvememt/themeStreet_seochon/01.jpg',
    '/images/public-design/env_improvememt/themeStreet_seochon/02.jpg',
    '/images/public-design/env_improvememt/themeStreet_seochon/03.jpg',
    '/images/public-design/env_improvememt/themeStreet_seochon/04.jpg',
    '/images/public-design/env_improvememt/themeStreet_seochon/05.jpg',
    '/images/public-design/env_improvememt/themeStreet_seochon/06.jpg',
    '/images/public-design/env_improvememt/themeStreet_seochon/07.jpg',
    '/images/public-design/env_improvememt/themeStreet_seochon/08.jpg'
  ],
  'env_improvement',
  107,
  true
);

-- 양주경로당
INSERT INTO public.public_design_contents (
  design_contents_type, title, location, description, year, project_code,
  list_image_urls, detail_image_urls, project_category, display_order, is_active
) VALUES (
  'list',
  '양주 경로당 환경개선',
  '경기도 양주시',
  '경로당 시설 개선을 통한 노인 복지 환경 향상',
  2021,
  'env_yangju',
  ARRAY[
    '/images/public-design/env_improvememt/seniorCenter_yangju/01.jpg',
    '/images/public-design/env_improvememt/seniorCenter_yangju/03.jpg'
  ],
  ARRAY[
    '/images/public-design/env_improvememt/seniorCenter_yangju/01.jpg',
    '/images/public-design/env_improvememt/seniorCenter_yangju/02.jpg',
    '/images/public-design/env_improvememt/seniorCenter_yangju/03.jpg',
    '/images/public-design/env_improvememt/seniorCenter_yangju/04.jpg',
    '/images/public-design/env_improvememt/seniorCenter_yangju/05.jpg',
    '/images/public-design/env_improvememt/seniorCenter_yangju/06.jpg',
    '/images/public-design/env_improvememt/seniorCenter_yangju/07.jpg',
    '/images/public-design/env_improvememt/seniorCenter_yangju/08.jpg',
    '/images/public-design/env_improvememt/seniorCenter_yangju/09.jpg'
  ],
  'env_improvement',
  108,
  true
);

-- 중랑구 범죄예방
INSERT INTO public.public_design_contents (
  design_contents_type, title, location, description, year, project_code,
  list_image_urls, detail_image_urls, project_category, display_order, is_active
) VALUES (
  'list',
  '중랑구 범죄예방 환경개선',
  '서울시 중랑구',
  '범죄 예방을 위한 환경 디자인 개선 (셉테드)',
  2021,
  'env_jungnang',
  ARRAY[
    '/images/public-design/env_improvememt/preventCrime_junglang/01.jpg',
    '/images/public-design/env_improvememt/preventCrime_junglang/03.jpg'
  ],
  ARRAY[
    '/images/public-design/env_improvememt/preventCrime_junglang/01.jpg',
    '/images/public-design/env_improvememt/preventCrime_junglang/02.jpg',
    '/images/public-design/env_improvememt/preventCrime_junglang/03.jpg',
    '/images/public-design/env_improvememt/preventCrime_junglang/04.jpg',
    '/images/public-design/env_improvememt/preventCrime_junglang/05.jpg',
    '/images/public-design/env_improvememt/preventCrime_junglang/06.jpg'
  ],
  'env_improvement',
  109,
  true
);

-- 3. 공공디자인 일반 프로젝트

-- 김포 공공디자인
INSERT INTO public.public_design_contents (
  design_contents_type, title, location, description, year, project_code,
  list_image_urls, detail_image_urls, project_category, display_order, is_active
) VALUES (
  'list',
  '김포 공공디자인',
  '경기도 김포시',
  '김포시 공공 공간 디자인 개선',
  2022,
  'public_gimpo',
  ARRAY[
    '/images/public-design/public_design/gimpo/list/01.jpg',
    '/images/public-design/public_design/gimpo/list/05.jpg'
  ],
  ARRAY[
    '/images/public-design/public_design/gimpo/detail/01.jpg',
    '/images/public-design/public_design/gimpo/detail/02.jpg',
    '/images/public-design/public_design/gimpo/detail/03.jpg',
    '/images/public-design/public_design/gimpo/detail/04.jpg'
  ],
  'public_design',
  201,
  true
);

-- 완료 메시지
SELECT 'Public design tables created and sample data inserted successfully!' as status;

