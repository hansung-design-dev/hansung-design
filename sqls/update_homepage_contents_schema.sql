-- 홈페이지 컨텐츠 테이블 스키마 업데이트
-- 1. 새로운 enum 타입 생성 (page 컬럼용)
CREATE TYPE homepage_menu_enum AS ENUM ('main', 'banner_display', 'led_display', 'public_design', 'digital_signage');

-- 2. homepage_contents 테이블에 page 컬럼 추가
ALTER TABLE public.homepage_contents 
ADD COLUMN page homepage_menu_enum;

-- 3. 인덱스 추가 (성능 최적화)
CREATE INDEX idx_homepage_contents_page ON public.homepage_contents(page);
CREATE INDEX idx_homepage_contents_homepage_menu_types ON public.homepage_contents(homepage_menu_types);

-- 4. 샘플 데이터 삽입 (테스트용) - 랜딩페이지 섹션들
INSERT INTO public.homepage_contents (
  page, 
  homepage_menu_types, 
  title, 
  subtitle, 
  description, 
  main_image_url
) VALUES 
('main', (SELECT id FROM public.homepage_menu_types WHERE name = 'main'), '한성디스플레이', '전문 디스플레이 솔루션', '다양한 디스플레이 솔루션으로 효과적인 마케팅을 도와드립니다.', '/images/landing/banner-part.png'),
('main', (SELECT id FROM public.homepage_menu_types WHERE name = 'banner_display'), '배너 디스플레이', '전통적인 배너 광고', '전통적이면서도 효과적인 배너 디스플레이 서비스를 제공합니다.', '/images/banner-display/landing.png'),
('main', (SELECT id FROM public.homepage_menu_types WHERE name = 'led_display'), 'LED 디스플레이', '고화질 LED 솔루션', '고화질 LED 디스플레이로 눈에 띄는 광고를 만들어보세요.', '/images/led/landing.png'),
('main', (SELECT id FROM public.homepage_menu_types WHERE name = 'public_design'), '공공디자인', '창의적인 공공디자인', '창의적이고 아름다운 공공디자인 프로젝트를 진행합니다.', '/images/public-design/landing.png'),
('main', (SELECT id FROM public.homepage_menu_types WHERE name = 'digital_signage'), '디지털 사이니지', '최신 디지털 디스플레이 솔루션', '효과적인 디지털 마케팅을 위한 최신 디지털 사이니지 서비스를 제공합니다.', '/images/digital-sianage/landing.png')
ON CONFLICT DO NOTHING; 