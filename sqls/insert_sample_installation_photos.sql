-- 게첨사진 샘플 데이터 삽입
-- 먼저 display_types 테이블에서 ID를 확인해야 합니다
-- SELECT id, name FROM display_types;

-- 현수막게시대 게첨사진 샘플 데이터 (4개)
INSERT INTO installed_photos (display_type_id, title, content, photo_urls) VALUES
(
  (SELECT id FROM display_types WHERE name = '현수막게시대' LIMIT 1),
  '2024년 1분기 현수막게시대 설치 완료',
  '2024년 1분기 현수막게시대 설치가 완료되었습니다.\n\n■ 설치 지역: 강남구, 서초구, 마포구\n■ 설치 수량: 총 15개소\n■ 설치 완료일: 2024년 3월 31일\n\n모든 설치가 정상적으로 완료되어 광고 게시가 가능합니다.',
  ARRAY['/images/banner-display/landing.png', '/images/banner-display/panel_photos/songpa/1.jpg', '/images/banner-display/panel_photos/songpa/10.jpg']
),
(
  (SELECT id FROM display_types WHERE name = '현수막게시대' LIMIT 1),
  '2024년 2분기 현수막게시대 추가 설치',
  '2024년 2분기 현수막게시대 추가 설치가 완료되었습니다.\n\n■ 추가 설치 지역: 송파구, 강동구\n■ 추가 설치 수량: 총 8개소\n■ 설치 완료일: 2024년 6월 30일\n\n기존 설치소와 함께 총 23개소에서 광고 서비스를 제공합니다.',
  ARRAY['/images/banner-display/panel_photos/songpa/11.jpg', '/images/banner-display/panel_photos/mapo/1.jpg']
),
(
  (SELECT id FROM display_types WHERE name = '현수막게시대' LIMIT 1),
  '2024년 3분기 현수막게시대 확장 설치',
  '2024년 3분기 현수막게시대 확장 설치가 완료되었습니다.\n\n■ 확장 설치 지역: 영등포구, 구로구, 금천구\n■ 확장 설치 수량: 총 12개소\n■ 설치 완료일: 2024년 9월 30일\n\n기존 설치소와 함께 총 35개소에서 광고 서비스를 제공합니다.',
  ARRAY['/images/banner-display/panel_photos/mapo/multi/1.jpg', '/images/banner-display/panel_photos/mapo/multi/10.jpg', '/images/banner-display/panel_photos/mapo/multi/11.jpg']
),
(
  (SELECT id FROM display_types WHERE name = '현수막게시대' LIMIT 1),
  '2024년 4분기 현수막게시대 최종 설치',
  '2024년 4분기 현수막게시대 최종 설치가 완료되었습니다.\n\n■ 최종 설치 지역: 강서구, 양천구, 마포구 추가\n■ 최종 설치 수량: 총 10개소\n■ 설치 완료일: 2024년 12월 31일\n\n2024년 전체 현수막게시대 설치가 완료되어 총 45개소에서 광고 서비스를 제공합니다.',
  ARRAY['/images/banner-display/panel_photos/yongsan/1.jpg', '/images/banner-display/panel_photos/yongsan/10.jpg', '/images/banner-display/panel_photos/yongsan/11.jpg', '/images/banner-display/panel_photos/yongsan/16.jpg']
);

-- LED전자게시대 게첨사진 샘플 데이터 (주석 처리)
-- INSERT INTO installed_photos (display_type_id, title, content, photo_urls) VALUES
-- (
--   (SELECT id FROM display_types WHERE name = 'LED전자게시대' LIMIT 1),
--   '2024년 1분기 LED전자게시대 설치 완료',
--   '2024년 1분기 LED전자게시대 설치가 완료되었습니다.\n\n■ 설치 지역: 종로구, 중구, 용산구\n■ 설치 수량: 총 12개소\n■ 설치 완료일: 2024년 3월 31일\n\n고화질 LED 디스플레이로 선명한 광고 영상을 제공합니다.',
--   ARRAY['/images/led/landing.png', '/images/led-display.jpeg']
-- ),
-- (
--   (SELECT id FROM display_types WHERE name = 'LED전자게시대' LIMIT 1),
--   '2024년 2분기 LED전자게시대 추가 설치',
--   '2024년 2분기 LED전자게시대 추가 설치가 완료되었습니다.\n\n■ 추가 설치 지역: 영등포구, 구로구\n■ 추가 설치 수량: 총 6개소\n■ 설치 완료일: 2024년 6월 30일\n\n기존 설치소와 함께 총 18개소에서 LED 광고 서비스를 제공합니다.',
--   ARRAY['/images/led-display.jpeg', '/images/led/landing.png']
-- );

-- 디지털사이니지 게첨사진 샘플 데이터 (주석 처리)
-- INSERT INTO installed_photos (display_type_id, title, content, photo_urls) VALUES
-- (
--   (SELECT id FROM display_types WHERE name = '디지털사이니지' LIMIT 1),
--   '2024년 1분기 디지털사이니지 설치 완료',
--   '2024년 1분기 디지털사이니지 설치가 완료되었습니다.\n\n■ 설치 지역: 강북구, 도봉구, 노원구\n■ 설치 수량: 총 10개소\n■ 설치 완료일: 2024년 3월 31일\n\n터치스크린과 인터랙티브 기능을 갖춘 디지털사이니지가 설치되었습니다.',
--   ARRAY['/images/digital-sianage/landing.png', '/images/digital-signage-example.jpeg']
-- ),
-- (
--   (SELECT id FROM display_types WHERE name = '디지털사이니지' LIMIT 1),
--   '2024년 2분기 디지털사이니지 추가 설치',
--   '2024년 2분기 디지털사이니지 추가 설치가 완료되었습니다.\n\n■ 추가 설치 지역: 성북구, 중랑구\n■ 추가 설치 수량: 총 5개소\n■ 설치 완료일: 2024년 6월 30일\n\n기존 설치소와 함께 총 15개소에서 디지털사이니지 서비스를 제공합니다.',
--   ARRAY['/images/digital-signage-example.jpeg', '/images/digital-sianage/landing.png']
-- ); 