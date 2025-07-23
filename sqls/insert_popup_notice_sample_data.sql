-- 팝업 공지사항 목데이터 생성

-- 1. 현수막게시대 팝업 공지사항
INSERT INTO public.homepage_notice (
  title,
  content,
  priority,
  display_type,
  is_popup,
  popup_start_date,
  popup_end_date,
  popup_width,
  popup_height,
  is_active
) VALUES (
  '현수막게시대 신규 오픈 안내',
  '안녕하세요! 🎉\n\n새로운 현수막게시대가 오픈되었습니다.\n\n📍 위치: 강남구 역삼동\n📅 오픈일: 2024년 12월 1일\n💰 특별 할인: 오픈 기념 20% 할인\n\n자세한 내용은 문의해 주세요.\n\n감사합니다.',
  'important',
  'banner_display',
  true,
  '2024-12-01',
  '2024-12-31',
  500,
  400,
  true
);

-- 2. LED 전자게시대 팝업 공지사항
INSERT INTO public.homepage_notice (
  title,
  content,
  priority,
  display_type,
  is_popup,
  popup_start_date,
  popup_end_date,
  popup_width,
  popup_height,
  is_active
) VALUES (
  'LED 전자게시대 시스템 점검 안내',
  '📢 LED 전자게시대 시스템 점검 안내\n\n📅 점검일시: 2024년 12월 15일 (일) 02:00 ~ 06:00\n📍 영향: 모든 LED 전자게시대\n\n점검 시간 동안 광고 송출이 일시 중단됩니다.\n고객님들의 양해 부탁드립니다.\n\n문의: 02-1234-5678',
  'important',
  'led_display',
  true,
  '2024-12-10',
  '2024-12-20',
  450,
  350,
  true
);

-- 3. 디지털사이니지 팝업 공지사항
INSERT INTO public.homepage_notice (
  title,
  content,
  priority,
  display_type,
  is_popup,
  popup_start_date,
  popup_end_date,
  popup_width,
  popup_height,
  is_active
) VALUES (
  '디지털사이니지 신기술 도입',
  '🚀 디지털사이니지 신기술 도입 안내\n\n새로운 4K UHD 디스플레이와\n인터랙티브 터치 기능이 추가되었습니다!\n\n✨ 주요 개선사항:\n• 4K UHD 화질\n• 터치 인터랙션\n• 실시간 콘텐츠 업데이트\n• 에너지 효율성 30% 향상\n\n자세한 사양은 상담을 통해 안내드립니다.',
  'normal',
  'digital_signage',
  true,
  '2024-12-01',
  '2024-12-15',
  600,
  450,
  true
);

-- 4. 공공디자인 팝업 공지사항
INSERT INTO public.homepage_notice (
  title,
  content,
  priority,
  display_type,
  is_popup,
  popup_start_date,
  popup_end_date,
  popup_width,
  popup_height,
  is_active
) VALUES (
  '공공디자인 프로젝트 수주 완료',
  '🏆 공공디자인 프로젝트 수주 완료\n\n서울시 강남구 공공디자인 프로젝트를\n성공적으로 수주했습니다!\n\n📋 프로젝트 내용:\n• 도시 경관 개선\n• 브랜드 아이덴티티 개발\n• 스마트 시티 인프라 구축\n\n프로젝트 진행 상황은\n홈페이지에서 실시간으로 확인하실 수 있습니다.',
  'normal',
  'public_design',
  true,
  '2024-12-05',
  '2024-12-25',
  550,
  400,
  true
);

-- 5. 일반 공지사항 (팝업 아님)
INSERT INTO public.homepage_notice (
  title,
  content,
  priority,
  display_type,
  is_popup,
  is_active
) VALUES 
(
  '연말연시 휴무 안내',
  '2024년 연말연시 휴무 안내드립니다.\n\n📅 휴무일: 2024년 12월 30일 ~ 2025년 1월 1일\n📅 정상업무: 2025년 1월 2일부터\n\n휴무 기간 중 긴급 문의사항은\n이메일로 접수해 주시기 바랍니다.\n\n감사합니다.',
  'normal',
  'banner_display',
  false,
  true
),
(
  '시스템 업그레이드 완료',
  '웹사이트 시스템 업그레이드가 완료되었습니다.\n\n✨ 개선사항:\n• 페이지 로딩 속도 향상\n• 모바일 반응형 개선\n• 보안 강화\n\n더 나은 서비스를 제공하겠습니다.',
  'normal',
  'led_display',
  false,
  true
),
(
  '고객 만족도 조사',
  '고객 만족도 조사에 참여해 주세요!\n\n📊 조사 기간: 2024년 12월 1일 ~ 12월 31일\n🎁 참여 혜택: 다음 주문 시 5% 할인\n\n여러분의 소중한 의견이\n더 나은 서비스 개발에 도움이 됩니다.',
  'normal',
  'digital_signage',
  false,
  true
); 