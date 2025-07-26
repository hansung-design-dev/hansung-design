-- 각 페이지의 메인 컨텐츠 데이터 삽입

-- 각 페이지의 메인 컨텐츠 데이터 삽입
INSERT INTO public.homepage_contents (
  page, 
  homepage_menu_types,
  title,
  subtitle,
  description,
  main_image_url
) VALUES 
-- LED 디스플레이 페이지 메인
('led_display', (SELECT id FROM public.homepage_menu_types WHERE name = 'led_display'), 'LED 디스플레이', '고화질 LED 솔루션', '최신 LED 기술을 활용한 고화질 디스플레이 솔루션을 제공합니다.', '/images/led/landing.png'),

-- 배너 디스플레이 페이지 메인
('banner_display', (SELECT id FROM public.homepage_menu_types WHERE name = 'banner_display'), '배너 디스플레이', '전통적인 배너 광고', '전통적인 배너 디스플레이의 장점을 살린 효과적인 광고 솔루션을 제공합니다.', '/images/banner-display/landing.png'),

-- 디지털 사이니지 페이지 메인
('digital_signage', (SELECT id FROM public.homepage_menu_types WHERE name = 'digital_signage'), '디지털 사이니지', '최신 디지털 디스플레이 솔루션', '효과적인 디지털 마케팅을 위한 최신 디지털 사이니지 서비스를 제공합니다.', '/images/digital-sianage/landing.png'),

-- 공공디자인 페이지 메인
('public_design', (SELECT id FROM public.homepage_menu_types WHERE name = 'public_design'), '공공디자인', '창의적이고 아름다운 공공디자인', '창의적이고 아름다운 공공디자인 프로젝트를 진행합니다.', '/images/public-design/landing.png')
ON CONFLICT DO NOTHING;

-- 3. 기존 랜딩페이지 섹션 데이터 확인 (이미 존재하는 경우)
-- 랜딩페이지의 각 섹션은 이미 insert_homepage_contents_schema.sql에서 생성됨
-- main, banner_display_part, led_display_part, public_design_part, digital_signage_part

-- 4. 데이터 확인 쿼리
-- SELECT 
--   hc.page,
--   hc.title,
--   hc.subtitle,
--   hc.main_image_url,
--   hmt.section_type
-- FROM homepage_contents hc
-- JOIN homepage_menu_types hmt ON hc.homepage_menu_types = hmt.id
-- ORDER BY hc.page, hmt.section_type; 