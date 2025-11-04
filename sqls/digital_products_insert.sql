-- 디지털 사이니지 제품 데이터 INSERT 쿼리
-- digital_products 테이블에 카테고리별 제품 데이터 입력 (총 18개)
-- 시리즈/모델 상세 정보는 프론트엔드 데이터 파일에서 읽어서 표시

-- ============================================
-- 1. 삼성 싱글 사이니지
-- ============================================
INSERT INTO public.digital_products (
  product_code, title, main_image_url, image_urls, product_type,
  series_name, model_name, brand, inch_size, physical_size,
  resolution, brightness, specifications, usage, installation_method,
  vesa_hole, price, special_features, description, bracket_note,
  contact_info, display_order, is_active
) VALUES
(
  'samsung-single',
  '싱글 사이니지(삼성)',
  '/images/digital-media/digital_signage/1_samsung_singleSignage.jpg',
  ARRAY['/images/digital-media/digital_signage/1_samsung_singleSignage.jpg']::text[],
  '주문 제작형',
  NULL,
  '삼성 사이니지 시리즈',
  '삼성전자',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '상담문의',
  NULL,
  '벽면 설치가 가능한 실내용 디지털 사이니지로, 대형 화면 시청이 가능하며 다양한 공간에 설치할 수 있습니다. 멀티 스크린 기능을 지원합니다.',
  '※ 싱글사이니지 브라켓은 별도 문의',
  '02-711-3737',
  1,
  true
)
ON CONFLICT (product_code) DO UPDATE SET
  title = EXCLUDED.title, main_image_url = EXCLUDED.main_image_url, image_urls = EXCLUDED.image_urls,
  product_type = EXCLUDED.product_type, model_name = EXCLUDED.model_name, brand = EXCLUDED.brand,
  description = EXCLUDED.description, bracket_note = EXCLUDED.bracket_note, contact_info = EXCLUDED.contact_info,
  display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;

-- ============================================
-- 2. LG 싱글 사이니지
-- ============================================
INSERT INTO public.digital_products (
  product_code, title, main_image_url, image_urls, product_type,
  series_name, model_name, brand, inch_size, physical_size,
  resolution, brightness, specifications, usage, installation_method,
  vesa_hole, price, special_features, description, bracket_note,
  contact_info, display_order, is_active
) VALUES
(
  'lg-single',
  '싱글 사이니지(LG)',
  '/images/digital-media/digital_signage/4_LG_signage.jpg',
  ARRAY['/images/digital-media/digital_signage/4_LG_signage.jpg']::text[],
  '주문 제작형',
  NULL,
  'LG 사이니지 시리즈',
  'LG전자',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '상담문의',
  NULL,
  'LG의 고품질 싱글 사이니지로, 다양한 공간에 설치 가능합니다.',
  NULL,
  '02-711-3737',
  2,
  true
)
ON CONFLICT (product_code) DO UPDATE SET
  title = EXCLUDED.title, main_image_url = EXCLUDED.main_image_url, image_urls = EXCLUDED.image_urls,
  product_type = EXCLUDED.product_type, model_name = EXCLUDED.model_name, brand = EXCLUDED.brand,
  description = EXCLUDED.description, bracket_note = EXCLUDED.bracket_note, contact_info = EXCLUDED.contact_info,
  display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;

-- ============================================
-- 3. 스탠드 사이니지(수입)
-- ============================================
INSERT INTO public.digital_products (
  product_code, title, main_image_url, image_urls, product_type,
  series_name, model_name, brand, inch_size, physical_size,
  resolution, brightness, specifications, usage, installation_method,
  vesa_hole, price, special_features, description, bracket_note,
  contact_info, display_order, is_active
) VALUES
(
  'stand-signage',
  '스탠드 사이니지(수입)',
  '/images/digital-media/digital_signage/5_chinese_standard.jpg',
  ARRAY['/images/digital-media/digital_signage/5_chinese_standard.jpg']::text[],
  '주문 제작형',
  NULL,
  '스탠드 사이니지 시리즈',
  '수입',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '상담문의',
  NULL,
  '터치 기능이 있는 스탠드형 디지털 사이니지입니다.',
  NULL,
  '02-711-3737',
  3,
  true
)
ON CONFLICT (product_code) DO UPDATE SET
  title = EXCLUDED.title, main_image_url = EXCLUDED.main_image_url, image_urls = EXCLUDED.image_urls,
  product_type = EXCLUDED.product_type, model_name = EXCLUDED.model_name, brand = EXCLUDED.brand,
  description = EXCLUDED.description, bracket_note = EXCLUDED.bracket_note, contact_info = EXCLUDED.contact_info,
  display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;

-- ============================================
-- 4. 멀티비전(비디오월) - 시스메이트
-- ============================================
INSERT INTO public.digital_products (
  product_code, title, main_image_url, image_urls, product_type,
  series_name, model_name, brand, inch_size, physical_size,
  resolution, brightness, specifications, usage, installation_method,
  vesa_hole, price, special_features, description, bracket_note,
  contact_info, display_order, is_active
) VALUES
(
  'multivision-cismate',
  '멀티비전(비디오월)',
  '/images/digital-media/digital_signage/7_multiVision_1.jpg',
  ARRAY['/images/digital-media/digital_signage/7_multiVision_1.jpg', '/images/digital-media/digital_signage/7_multiVision_2.jpg', '/images/digital-media/digital_signage/7_multiVision_3.jpg']::text[],
  '주문 제작형',
  NULL,
  'VW Series 멀티비전',
  '주식회사 시스메이트',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '상담문의',
  NULL,
  '베젤리스 멀티형 모니터로 대형 디스플레이 구축에 최적화된 제품입니다.',
  NULL,
  '02-711-3737',
  4,
  true
)
ON CONFLICT (product_code) DO UPDATE SET
  title = EXCLUDED.title, main_image_url = EXCLUDED.main_image_url, image_urls = EXCLUDED.image_urls,
  product_type = EXCLUDED.product_type, model_name = EXCLUDED.model_name, brand = EXCLUDED.brand,
  description = EXCLUDED.description, bracket_note = EXCLUDED.bracket_note, contact_info = EXCLUDED.contact_info,
  display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;

-- ============================================
-- 5. 디지털액자
-- ============================================
INSERT INTO public.digital_products (
  product_code, title, main_image_url, image_urls, product_type,
  series_name, model_name, brand, inch_size, physical_size,
  resolution, brightness, specifications, usage, installation_method,
  vesa_hole, price, special_features, description, bracket_note,
  contact_info, display_order, is_active
) VALUES
(
  'digital-frame',
  '디지털액자',
  '/images/digital-media/digital_signage/8_AIDA_digitalFrame.jpg',
  ARRAY['/images/digital-media/digital_signage/8_AIDA_digitalFrame.jpg']::text[],
  '주문 제작형',
  NULL,
  '디지털액자 시리즈',
  '주식회사 시스메이트',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '상담문의',
  NULL,
  '개인 소장용 사진 액자, 홍보용 전자액자, 메뉴보드 등에 활용 가능한 미니 사이니지입니다.',
  NULL,
  '02-711-3737',
  5,
  true
)
ON CONFLICT (product_code) DO UPDATE SET
  title = EXCLUDED.title, main_image_url = EXCLUDED.main_image_url, image_urls = EXCLUDED.image_urls,
  product_type = EXCLUDED.product_type, model_name = EXCLUDED.model_name, brand = EXCLUDED.brand,
  description = EXCLUDED.description, bracket_note = EXCLUDED.bracket_note, contact_info = EXCLUDED.contact_info,
  display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;

-- ============================================
-- 6. 삼성 전자칠판
-- ============================================
INSERT INTO public.digital_products (
  product_code, title, main_image_url, image_urls, product_type,
  series_name, model_name, brand, inch_size, physical_size,
  resolution, brightness, specifications, usage, installation_method,
  vesa_hole, price, special_features, description, bracket_note,
  contact_info, display_order, is_active
) VALUES
(
  'samsung-electronic-board',
  '삼성 전자칠판',
  '/images/digital-media/digital_signage/3_samsung_digitalBoard.jpg',
  ARRAY['/images/digital-media/digital_signage/3_samsung_digitalBoard.jpg']::text[],
  '주문 제작형',
  NULL,
  '삼성 전자칠판 시리즈',
  '삼성전자',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '상담문의',
  NULL,
  '교육, 강의, 회의, 컨퍼런스 등의 스마트 프리젠테이션 활용에 최적화된 전자칠판입니다.',
  NULL,
  '02-711-3737',
  6,
  true
)
ON CONFLICT (product_code) DO UPDATE SET
  title = EXCLUDED.title, main_image_url = EXCLUDED.main_image_url, image_urls = EXCLUDED.image_urls,
  product_type = EXCLUDED.product_type, model_name = EXCLUDED.model_name, brand = EXCLUDED.brand,
  description = EXCLUDED.description, bracket_note = EXCLUDED.bracket_note, contact_info = EXCLUDED.contact_info,
  display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;

-- ============================================
-- 7. 삼성 전자칠판 트레이
-- ============================================
INSERT INTO public.digital_products (
  product_code, title, main_image_url, image_urls, product_type,
  series_name, model_name, brand, inch_size, physical_size,
  resolution, brightness, specifications, usage, installation_method,
  vesa_hole, price, special_features, description, bracket_note,
  contact_info, display_order, is_active
) VALUES
(
  'samsung-electronic-board-tray',
  '삼성 전자칠판 트레이',
  '/images/digital-media/digital_signage/3_samsung_digitalBoard.jpg',
  ARRAY['/images/digital-media/digital_signage/3_samsung_digitalBoard.jpg']::text[],
  '주문 제작형',
  NULL,
  '삼성 전자칠판 트레이 시리즈',
  '삼성전자',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '상담문의',
  NULL,
  '삼성 전자칠판용 트레이 제품입니다.',
  NULL,
  '02-711-3737',
  7,
  true
)
ON CONFLICT (product_code) DO UPDATE SET
  title = EXCLUDED.title, main_image_url = EXCLUDED.main_image_url, image_urls = EXCLUDED.image_urls,
  product_type = EXCLUDED.product_type, model_name = EXCLUDED.model_name, brand = EXCLUDED.brand,
  description = EXCLUDED.description, bracket_note = EXCLUDED.bracket_note, contact_info = EXCLUDED.contact_info,
  display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;

-- ============================================
-- 8. 삼성 전자칠판 브라켓
-- ============================================
INSERT INTO public.digital_products (
  product_code, title, main_image_url, image_urls, product_type,
  series_name, model_name, brand, inch_size, physical_size,
  resolution, brightness, specifications, usage, installation_method,
  vesa_hole, price, special_features, description, bracket_note,
  contact_info, display_order, is_active
) VALUES
(
  'samsung-electronic-board-bracket',
  '삼성 전자칠판 브라켓',
  '/images/digital-media/digital_signage/3_samsung_digitalBoard.jpg',
  ARRAY['/images/digital-media/digital_signage/3_samsung_digitalBoard.jpg']::text[],
  '주문 제작형',
  NULL,
  '삼성 전자칠판 브라켓 시리즈',
  '삼성전자',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '상담문의',
  NULL,
  '삼성 전자칠판용 브라켓 제품들입니다.',
  NULL,
  '02-711-3737',
  8,
  true
)
ON CONFLICT (product_code) DO UPDATE SET
  title = EXCLUDED.title, main_image_url = EXCLUDED.main_image_url, image_urls = EXCLUDED.image_urls,
  product_type = EXCLUDED.product_type, model_name = EXCLUDED.model_name, brand = EXCLUDED.brand,
  description = EXCLUDED.description, bracket_note = EXCLUDED.bracket_note, contact_info = EXCLUDED.contact_info,
  display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;

-- ============================================
-- 9. 삼성 멀티비전
-- ============================================
INSERT INTO public.digital_products (
  product_code, title, main_image_url, image_urls, product_type,
  series_name, model_name, brand, inch_size, physical_size,
  resolution, brightness, specifications, usage, installation_method,
  vesa_hole, price, special_features, description, bracket_note,
  contact_info, display_order, is_active
) VALUES
(
  'samsung-multivision',
  '삼성 멀티비전',
  '/images/digital-media/digital_signage/2_samsung_multiVision.jpg',
  ARRAY['/images/digital-media/digital_signage/2_samsung_multiVision.jpg']::text[],
  '주문 제작형',
  NULL,
  '삼성 멀티비전 시리즈',
  '삼성전자',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '상담문의',
  NULL,
  '베젤리스 멀티형 모니터로 대형 디스플레이 구축에 최적화된 삼성 제품입니다.',
  NULL,
  '02-711-3737',
  9,
  true
)
ON CONFLICT (product_code) DO UPDATE SET
  title = EXCLUDED.title, main_image_url = EXCLUDED.main_image_url, image_urls = EXCLUDED.image_urls,
  product_type = EXCLUDED.product_type, model_name = EXCLUDED.model_name, brand = EXCLUDED.brand,
  description = EXCLUDED.description, bracket_note = EXCLUDED.bracket_note, contact_info = EXCLUDED.contact_info,
  display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;

-- ============================================
-- 10. 더 갤러리
-- ============================================
INSERT INTO public.digital_products (
  product_code, title, main_image_url, image_urls, product_type,
  series_name, model_name, brand, inch_size, physical_size,
  resolution, brightness, specifications, usage, installation_method,
  vesa_hole, price, special_features, description, bracket_note,
  contact_info, display_order, is_active
) VALUES
(
  'the-gallery',
  '더 갤러리',
  '/images/digital-media/digital_signage/10_theGallery.png',
  ARRAY['/images/digital-media/digital_signage/10_theGallery.png']::text[],
  '주문 제작형',
  NULL,
  '더 갤러리 시리즈',
  '삼성전자',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '상담문의',
  NULL,
  '액자형 사이니지로 명화 콘텐츠를 지원하는 고품질 디스플레이입니다.',
  NULL,
  '02-711-3737',
  10,
  true
)
ON CONFLICT (product_code) DO UPDATE SET
  title = EXCLUDED.title, main_image_url = EXCLUDED.main_image_url, image_urls = EXCLUDED.image_urls,
  product_type = EXCLUDED.product_type, model_name = EXCLUDED.model_name, brand = EXCLUDED.brand,
  description = EXCLUDED.description, bracket_note = EXCLUDED.bracket_note, contact_info = EXCLUDED.contact_info,
  display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;

-- ============================================
-- 11. Q시리즈 스탠드 사이니지
-- ============================================
INSERT INTO public.digital_products (
  product_code, title, main_image_url, image_urls, product_type,
  series_name, model_name, brand, inch_size, physical_size,
  resolution, brightness, specifications, usage, installation_method,
  vesa_hole, price, special_features, description, bracket_note,
  contact_info, display_order, is_active
) VALUES
(
  'q-series-stand',
  'Q시리즈 스탠드 사이니지',
  '/images/digital-media/digital_signage/9_standardSignage_pivot.jpg',
  ARRAY['/images/digital-media/digital_signage/9_standardSignage_pivot.jpg']::text[],
  '주문 제작형',
  NULL,
  'Q시리즈 스탠드 사이니지',
  '주식회사 시스메이트 / 삼성전자',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '상담문의',
  NULL,
  'Q시리즈 스탠드 사이니지 제품들입니다.',
  NULL,
  '02-711-3737',
  11,
  true
)
ON CONFLICT (product_code) DO UPDATE SET
  title = EXCLUDED.title, main_image_url = EXCLUDED.main_image_url, image_urls = EXCLUDED.image_urls,
  product_type = EXCLUDED.product_type, model_name = EXCLUDED.model_name, brand = EXCLUDED.brand,
  description = EXCLUDED.description, bracket_note = EXCLUDED.bracket_note, contact_info = EXCLUDED.contact_info,
  display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;

-- ============================================
-- 12. Q시리즈 터치모니터
-- ============================================
INSERT INTO public.digital_products (
  product_code, title, main_image_url, image_urls, product_type,
  series_name, model_name, brand, inch_size, physical_size,
  resolution, brightness, specifications, usage, installation_method,
  vesa_hole, price, special_features, description, bracket_note,
  contact_info, display_order, is_active
) VALUES
(
  'q-series-touch',
  'Q시리즈 터치모니터',
  '/images/digital-media/digital_signage/12_Qseries_touchMonitor.jpg',
  ARRAY['/images/digital-media/digital_signage/12_Qseries_touchMonitor.jpg']::text[],
  '주문 제작형',
  NULL,
  'Q시리즈 터치모니터',
  '주식회사 시스메이트 / 삼성전자',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '상담문의',
  NULL,
  'Q시리즈 터치모니터 제품들입니다.',
  NULL,
  '02-711-3737',
  12,
  true
)
ON CONFLICT (product_code) DO UPDATE SET
  title = EXCLUDED.title, main_image_url = EXCLUDED.main_image_url, image_urls = EXCLUDED.image_urls,
  product_type = EXCLUDED.product_type, model_name = EXCLUDED.model_name, brand = EXCLUDED.brand,
  description = EXCLUDED.description, bracket_note = EXCLUDED.bracket_note, contact_info = EXCLUDED.contact_info,
  display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;

-- ============================================
-- 13. 브라켓
-- ============================================
INSERT INTO public.digital_products (
  product_code, title, main_image_url, image_urls, product_type,
  series_name, model_name, brand, inch_size, physical_size,
  resolution, brightness, specifications, usage, installation_method,
  vesa_hole, price, special_features, description, bracket_note,
  contact_info, display_order, is_active
) VALUES
(
  'bracket',
  '브라켓',
  '/images/digital-media/digital_signage/13_bracket_NSV-01.jpg',
  ARRAY['/images/digital-media/digital_signage/13_bracket_NSV-01.jpg', '/images/digital-media/digital_signage/13_bracket_PV-70.jpg']::text[],
  '주문 제작형',
  NULL,
  '브라켓 시리즈',
  '주식회사 시스메이트',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '상담문의',
  NULL,
  '다양한 브라켓 제품들입니다.',
  NULL,
  '02-711-3737',
  13,
  true
)
ON CONFLICT (product_code) DO UPDATE SET
  title = EXCLUDED.title, main_image_url = EXCLUDED.main_image_url, image_urls = EXCLUDED.image_urls,
  product_type = EXCLUDED.product_type, model_name = EXCLUDED.model_name, brand = EXCLUDED.brand,
  description = EXCLUDED.description, bracket_note = EXCLUDED.bracket_note, contact_info = EXCLUDED.contact_info,
  display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;

-- ============================================
-- 14. 옥외형 벽부타입
-- ============================================
INSERT INTO public.digital_products (
  product_code, title, main_image_url, image_urls, product_type,
  series_name, model_name, brand, inch_size, physical_size,
  resolution, brightness, specifications, usage, installation_method,
  vesa_hole, price, special_features, description, bracket_note,
  contact_info, display_order, is_active
) VALUES
(
  'outdoor-wall',
  '옥외형 벽부타입',
  '/images/digital-media/digital_signage/14_outdoor_wallType.jpg',
  ARRAY['/images/digital-media/digital_signage/14_outdoor_wallType.jpg', '/images/digital-media/digital_signage/14_outdoor_standard2.png']::text[],
  '주문 제작형',
  NULL,
  '옥외형 벽부타입',
  '주식회사 시스메이트',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '상담문의',
  NULL,
  '옥외용 벽부형 디스플레이입니다.',
  NULL,
  '02-711-3737',
  14,
  true
)
ON CONFLICT (product_code) DO UPDATE SET
  title = EXCLUDED.title, main_image_url = EXCLUDED.main_image_url, image_urls = EXCLUDED.image_urls,
  product_type = EXCLUDED.product_type, model_name = EXCLUDED.model_name, brand = EXCLUDED.brand,
  description = EXCLUDED.description, bracket_note = EXCLUDED.bracket_note, contact_info = EXCLUDED.contact_info,
  display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;

-- ============================================
-- 15. 옥외형 스탠드타입
-- ============================================
INSERT INTO public.digital_products (
  product_code, title, main_image_url, image_urls, product_type,
  series_name, model_name, brand, inch_size, physical_size,
  resolution, brightness, specifications, usage, installation_method,
  vesa_hole, price, special_features, description, bracket_note,
  contact_info, display_order, is_active
) VALUES
(
  'outdoor-stand',
  '옥외형 스탠드타입',
  '/images/digital-media/digital_signage/15_outdoor_standard2.jpg',
  ARRAY['/images/digital-media/digital_signage/15_outdoor_standard2.jpg']::text[],
  '주문 제작형',
  NULL,
  '옥외형 스탠드타입',
  '주식회사 시스메이트',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '상담문의',
  NULL,
  '옥외용 스탠드형 디스플레이입니다.',
  NULL,
  '02-711-3737',
  15,
  true
)
ON CONFLICT (product_code) DO UPDATE SET
  title = EXCLUDED.title, main_image_url = EXCLUDED.main_image_url, image_urls = EXCLUDED.image_urls,
  product_type = EXCLUDED.product_type, model_name = EXCLUDED.model_name, brand = EXCLUDED.brand,
  description = EXCLUDED.description, bracket_note = EXCLUDED.bracket_note, contact_info = EXCLUDED.contact_info,
  display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;

-- ============================================
-- 16. LED 디스플레이 시리즈
-- ============================================
INSERT INTO public.digital_products (
  product_code, title, main_image_url, image_urls, product_type,
  series_name, model_name, brand, inch_size, physical_size,
  resolution, brightness, specifications, usage, installation_method,
  vesa_hole, price, special_features, description, bracket_note,
  contact_info, display_order, is_active
) VALUES
(
  'led-display',
  'LED 디스플레이 시리즈',
  '/images/digital-media/digital_signage/16_LEDdisplay.jpg',
  ARRAY['/images/digital-media/digital_signage/16_LEDdisplay.jpg']::text[],
  '주문 제작형',
  NULL,
  'LED 디스플레이 시리즈',
  '주식회사 시스메이트',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '상담문의',
  NULL,
  '실내/실외 대형 디스플레이 구축용 LED 전광판입니다.',
  NULL,
  '02-711-3737',
  16,
  true
)
ON CONFLICT (product_code) DO UPDATE SET
  title = EXCLUDED.title, main_image_url = EXCLUDED.main_image_url, image_urls = EXCLUDED.image_urls,
  product_type = EXCLUDED.product_type, model_name = EXCLUDED.model_name, brand = EXCLUDED.brand,
  description = EXCLUDED.description, bracket_note = EXCLUDED.bracket_note, contact_info = EXCLUDED.contact_info,
  display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;

-- ============================================
-- 17. LED 디스플레이 컨트롤러
-- ============================================
INSERT INTO public.digital_products (
  product_code, title, main_image_url, image_urls, product_type,
  series_name, model_name, brand, inch_size, physical_size,
  resolution, brightness, specifications, usage, installation_method,
  vesa_hole, price, special_features, description, bracket_note,
  contact_info, display_order, is_active
) VALUES
(
  'led-controller',
  'LED 디스플레이 컨트롤러',
  '/images/digital-media/digital_signage/17-1-controller_PC.jpg',
  ARRAY['/images/digital-media/digital_signage/17-1-controller_PC.jpg', '/images/digital-media/digital_signage/17-2_controller_HD.jpg', '/images/digital-media/digital_signage/17-3-controller_FHD.jpg', '/images/digital-media/digital_signage/17-4_controller_FHD.jpg']::text[],
  '주문 제작형',
  NULL,
  'LED 디스플레이 컨트롤러',
  '주식회사 시스메이트',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '상담문의',
  NULL,
  'LED 디스플레이용 컨트롤러 제품들입니다.',
  NULL,
  '02-711-3737',
  17,
  true
)
ON CONFLICT (product_code) DO UPDATE SET
  title = EXCLUDED.title, main_image_url = EXCLUDED.main_image_url, image_urls = EXCLUDED.image_urls,
  product_type = EXCLUDED.product_type, model_name = EXCLUDED.model_name, brand = EXCLUDED.brand,
  description = EXCLUDED.description, bracket_note = EXCLUDED.bracket_note, contact_info = EXCLUDED.contact_info,
  display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;

-- ============================================
-- 18. LED 디스플레이 설치비
-- ============================================
INSERT INTO public.digital_products (
  product_code, title, main_image_url, image_urls, product_type,
  series_name, model_name, brand, inch_size, physical_size,
  resolution, brightness, specifications, usage, installation_method,
  vesa_hole, price, special_features, description, bracket_note,
  contact_info, display_order, is_active
) VALUES
(
  'led-installation',
  'LED 디스플레이 설치비',
  '/images/digital-media/digital_signage/18_LEDdisplay_installation.png',
  ARRAY['/images/digital-media/digital_signage/18_LEDdisplay_installation.png']::text[],
  '주문 제작형',
  NULL,
  'LED 디스플레이 설치비',
  '주식회사 시스메이트',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '상담문의',
  NULL,
  'LED 디스플레이 설치 서비스입니다.',
  NULL,
  '02-711-3737',
  18,
  true
)
ON CONFLICT (product_code) DO UPDATE SET
  title = EXCLUDED.title, main_image_url = EXCLUDED.main_image_url, image_urls = EXCLUDED.image_urls,
  product_type = EXCLUDED.product_type, model_name = EXCLUDED.model_name, brand = EXCLUDED.brand,
  description = EXCLUDED.description, bracket_note = EXCLUDED.bracket_note, contact_info = EXCLUDED.contact_info,
  display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;

-- ============================================
-- 19. 결제키오스크(삼성)
-- ============================================
INSERT INTO public.digital_products (
  product_code, title, main_image_url, image_urls, product_type,
  series_name, model_name, brand, inch_size, physical_size,
  resolution, brightness, specifications, usage, installation_method,
  vesa_hole, price, special_features, description, bracket_note,
  contact_info, display_order, is_active
) VALUES
(
  'kiosk',
  '결제키오스크(삼성)',
  '/images/digital-media/digital_signage/6_samsung_paymentKiosk.jpg',
  ARRAY['/images/digital-media/digital_signage/6_samsung_paymentKiosk.jpg']::text[],
  '주문 제작형',
  NULL,
  '결제키오스크',
  '삼성전자',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '상담문의',
  NULL,
  '삼성전자 결제키오스크 제품입니다.',
  NULL,
  '02-711-3737',
  19,
  true
)
ON CONFLICT (product_code) DO UPDATE SET
  title = EXCLUDED.title, main_image_url = EXCLUDED.main_image_url, image_urls = EXCLUDED.image_urls,
  product_type = EXCLUDED.product_type, model_name = EXCLUDED.model_name, brand = EXCLUDED.brand,
  description = EXCLUDED.description, bracket_note = EXCLUDED.bracket_note, contact_info = EXCLUDED.contact_info,
  display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;
