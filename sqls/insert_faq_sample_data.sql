-- FAQ 목데이터 삽입
-- 각 메뉴별로 자주 묻는 질문 데이터를 생성합니다.

-- 1. 디지털사이니지 FAQ
INSERT INTO customer_service (user_id, title, content, status, answer, answered_at, homepage_menu_type, cs_categories) VALUES
(
  NULL, -- FAQ는 user_id 없음
  '디지털사이니지란 무엇인가요?',
  '디지털사이니지에 대해 궁금합니다.',
  'answered',
  '디지털사이니지는 디지털 기술을 활용한 전자 디스플레이 시스템입니다.

**주요 특징:**
■ 실시간 콘텐츠 업데이트 가능
■ 다양한 미디어 형식 지원 (이미지, 동영상, 텍스트)
■ 원격 관리 및 모니터링
■ 에너지 효율적인 LED 기술 사용

**적용 분야:**
■ 공공기관 안내 시스템
■ 상업시설 광고 디스플레이
■ 교통정보 안내판
■ 기업 홍보 및 정보 전달

더 자세한 정보는 고객센터로 문의해주세요.',
  NOW() - INTERVAL '2 days',
  (SELECT id FROM homepage_menu_types WHERE name = 'digital_signage'),
  'frequent_questions'
),
(
  NULL,
  '디지털사이니지 설치 비용은 얼마인가요?',
  '디지털사이니지 설치 비용이 궁금합니다.',
  'answered',
  '디지털사이니지 설치 비용은 여러 요소에 따라 달라집니다.

**비용 구성 요소:**
■ 디스플레이 패널 크기 및 해상도
■ 설치 위치 및 난이도
■ 콘텐츠 관리 시스템 (CMS)
■ 네트워크 연결 및 유지보수

**예상 비용 범위:**
■ 소형 (32인치): 200만원 ~ 500만원
■ 중형 (55인치): 500만원 ~ 1,000만원
■ 대형 (75인치 이상): 1,000만원 ~ 3,000만원

정확한 견적은 설치 환경과 요구사항을 확인 후 제공해드립니다.',
  NOW() - INTERVAL '5 days',
  (SELECT id FROM homepage_menu_types WHERE name = 'digital_signage'),
  'frequent_questions'
),
(
  NULL,
  '디지털사이니지 콘텐츠는 어떻게 관리하나요?',
  '콘텐츠 관리 방법이 궁금합니다.',
  'answered',
  '디지털사이니지 콘텐츠는 웹 기반 관리 시스템을 통해 관리합니다.

**관리 시스템 기능:**
■ 실시간 콘텐츠 업데이트
■ 스케줄링 기능 (시간별, 요일별)
■ 템플릿 기반 디자인
■ 다중 디스플레이 동시 관리

**지원 파일 형식:**
■ 이미지: JPG, PNG, GIF
■ 동영상: MP4, AVI, MOV
■ 문서: PDF, PPT

관리 시스템 사용법은 설치 후 교육을 제공해드립니다.',
  NOW() - INTERVAL '1 week',
  (SELECT id FROM homepage_menu_types WHERE name = 'digital_signage'),
  'frequent_questions'
);

-- 2. 공공디자인 FAQ
INSERT INTO customer_service (user_id, title, content, status, answer, answered_at, homepage_menu_type, cs_categories) VALUES
(
  NULL,
  '공공디자인 서비스는 어떤 것들이 있나요?',
  '공공디자인 서비스 종류가 궁금합니다.',
  'answered',
  '공공디자인 서비스는 공공기관을 위한 다양한 디자인 솔루션을 제공합니다.

**주요 서비스:**
■ 공공기관 브랜딩 및 CI/BI 디자인
■ 공간 디자인 및 환경 그래픽
■ 정보 디자인 및 안내 시스템
■ 웹사이트 및 모바일 앱 디자인
■ 인쇄물 및 홍보물 디자인

**특별 혜택:**
■ 공공기관 할인 적용
■ 장기 계약 시 추가 할인
■ 전문 디자이너 배정
■ 24시간 긴급 지원

공공기관 전용 견적 및 상담을 제공해드립니다.',
  NOW() - INTERVAL '3 days',
  (SELECT id FROM homepage_menu_types WHERE name = 'public_design'),
  'frequent_questions'
),
(
  NULL,
  '공공기관 디자인 프로젝트 기간은 얼마나 걸리나요?',
  '프로젝트 진행 기간이 궁금합니다.',
  'answered',
  '공공기관 디자인 프로젝트 기간은 프로젝트 규모와 복잡도에 따라 달라집니다.

**일반적인 프로젝트 기간:**
■ 브랜딩 프로젝트: 2-3개월
■ 공간 디자인: 3-6개월
■ 웹사이트 디자인: 1-2개월
■ 인쇄물 디자인: 2-4주

**프로젝트 단계:**
1. 요구사항 분석 및 기획 (1-2주)
2. 디자인 컨셉 개발 (2-3주)
3. 디자인 작업 및 수정 (3-4주)
4. 최종 제작 및 설치 (1-2주)

정확한 일정은 프로젝트 상담 후 제공해드립니다.',
  NOW() - INTERVAL '1 week',
  (SELECT id FROM homepage_menu_types WHERE name = 'public_design'),
  'frequent_questions'
),
(
  NULL,
  '공공기관 전용 할인 혜택이 있나요?',
  '할인 혜택에 대해 궁금합니다.',
  'answered',
  '네, 공공기관을 위한 특별 할인 혜택을 제공합니다.

**공공기관 할인 혜택:**
■ 기본 할인율: 15% 할인
■ 연간 계약 시: 추가 10% 할인
■ 대량 프로젝트: 추가 협의 가능
■ 장기 파트너십: 특별 할인 적용

**적용 대상:**
■ 중앙정부 기관
■ 지방자치단체
■ 공공기관 및 공기업
■ 교육기관 (국공립)

**신청 방법:**
■ 사업자등록증 또는 기관 증명서 제출
■ 공공기관 인증 후 할인 적용
■ 견적서에 할인 내역 명시

자세한 할인 정책은 상담 시 안내해드립니다.',
  NOW() - INTERVAL '4 days',
  (SELECT id FROM homepage_menu_types WHERE name = 'public_design'),
  'frequent_questions'
);

-- 3. LED전자게시대 FAQ
INSERT INTO customer_service (user_id, title, content, status, answer, answered_at, homepage_menu_type, cs_categories) VALUES
(
  NULL,
  'LED전자게시대는 어떤 종류가 있나요?',
  'LED전자게시대 종류가 궁금합니다.',
  'answered',
  'LED전자게시대는 다양한 종류와 크기로 제공됩니다.

**LED전자게시대 종류:**
■ **실내용 LED**: 회의실, 로비, 매장 내부
■ **실외용 LED**: 건물 외벽, 광장, 도로변
■ **휴대용 LED**: 이벤트, 전시회, 임시 설치

**크기별 분류:**
■ 소형 (1-3㎡): 실내 안내용
■ 중형 (3-10㎡): 매장 광고용
■ 대형 (10㎡ 이상): 건물 외벽용

**해상도 옵션:**
■ P2.5: 고해상도 실내용
■ P4: 일반 실내용
■ P6: 실외용
■ P8: 대형 실외용

각 용도에 맞는 최적의 LED전자게시대를 추천해드립니다.',
  NOW() - INTERVAL '2 days',
  (SELECT id FROM homepage_menu_types WHERE name = 'led_display'),
  'frequent_questions'
),
(
  NULL,
  'LED전자게시대 전력 소비량은 얼마인가요?',
  '전력 소비량이 궁금합니다.',
  'answered',
  'LED전자게시대의 전력 소비량은 크기와 밝기에 따라 달라집니다.

**일반적인 전력 소비량:**
■ 소형 (1㎡): 200-500W
■ 중형 (5㎡): 1,000-2,500W
■ 대형 (10㎡): 2,000-5,000W

**에너지 절약 기능:**
■ 자동 밝기 조절 (주간/야간)
■ 모션 센서 연동
■ 스케줄링 기능
■ 대기 모드 지원

**월 전기료 예상:**
■ 소형: 5-15만원
■ 중형: 15-40만원
■ 대형: 30-80만원

정확한 전력 소비량은 설치 환경과 사용 패턴에 따라 달라집니다.',
  NOW() - INTERVAL '6 days',
  (SELECT id FROM homepage_menu_types WHERE name = 'led_display'),
  'frequent_questions'
),
(
  NULL,
  'LED전자게시대 수명은 얼마나 되나요?',
  '수명에 대해 궁금합니다.',
  'answered',
  'LED전자게시대의 수명은 사용 환경과 관리 상태에 따라 달라집니다.

**일반적인 수명:**
■ LED 모듈: 50,000-100,000시간 (5-10년)
■ 전원 공급장치: 30,000-50,000시간 (3-5년)
■ 전체 시스템: 8-12년

**수명 연장 방법:**
■ 정기적인 청소 및 점검
■ 적절한 온도 및 습도 관리
■ 과부하 방지
■ 전문 유지보수 서비스

**보증 기간:**
■ 기본 보증: 2년
■ 연장 보증: 최대 5년
■ 부품별 차등 보증

정기 유지보수를 통해 수명을 크게 연장할 수 있습니다.',
  NOW() - INTERVAL '1 week',
  (SELECT id FROM homepage_menu_types WHERE name = 'led_display'),
  'frequent_questions'
);

-- 4. 현수막게시대 FAQ
INSERT INTO customer_service (user_id, title, content, status, answer, answered_at, homepage_menu_type, cs_categories) VALUES
(
  NULL,
  '현수막게시대 신청 방법은 어떻게 되나요?',
  '신청 방법이 궁금합니다.',
  'answered',
  '현수막게시대 신청은 온라인과 오프라인 모두 가능합니다.

**온라인 신청 방법:**
1. 원하는 구의 현수막게시대 페이지 접속
2. 원하는 게시대 선택 (지도 또는 목록에서)
3. 기간 선택 (상반기/하반기)
4. 장바구니에 담기
5. 결제 및 신청 완료

**오프라인 신청 방법:**
■ 고객센터 방문: 1533-0570
■ 팩스 신청: 02-719-0084
■ 이메일 신청: info@hansungweb.com

**필요 서류:**
■ 신청서 (온라인 자동 생성)
■ 신분증 사본
■ 사업자등록증 (기업의 경우)

신청 후 3일 이내에 승인 여부를 알려드립니다.',
  NOW() - INTERVAL '3 days',
  (SELECT id FROM homepage_menu_types WHERE name = 'banner_display'),
  'frequent_questions'
),
(
  NULL,
  '현수막게시대 가격은 어떻게 책정되나요?',
  '가격 책정 기준이 궁금합니다.',
  'answered',
  '현수막게시대 가격은 여러 요소를 종합하여 책정됩니다.

**가격 구성 요소:**
■ 게시대 크기 및 위치
■ 게시 기간 (상반기/하반기)
■ 구별 차등 가격
■ 사용자 유형 (개인/기업/공공기관)

**일반적인 가격 범위:**
■ 소형 (3x1.5m): 50-100만원
■ 중형 (6x2m): 100-200만원
■ 대형 (9x3m): 200-400만원

**할인 혜택:**
■ 공공기관: 15% 할인
■ 기업 대량 신청: 10% 할인
■ 연간 계약: 20% 할인

정확한 견적은 선택한 게시대와 기간에 따라 제공됩니다.',
  NOW() - INTERVAL '5 days',
  (SELECT id FROM homepage_menu_types WHERE name = 'banner_display'),
  'frequent_questions'
),
(
  NULL,
  '현수막 제작은 별도로 해야 하나요?',
  '현수막 제작에 대해 궁금합니다.',
  'answered',
  '현수막 제작은 별도로 진행하셔야 합니다.

**현수막 제작 방법:**
1. **자체 제작**: 디자인 파일을 인쇄업체에 전달
2. **디자인 의뾀**: 한성웹 디자인팀에 의뾀
3. **제작업체 추천**: 협력업체를 통한 제작

**제작 규격:**
■ 파일 형식: AI, PDF, JPG (고해상도)
■ 해상도: 300DPI 이상
■ 색상 모드: CMYK
■ 여백: 각 변 5cm 이상

**제작 기간:**
■ 일반 제작: 3-5일
■ 긴급 제작: 1-2일 (추가 비용)
■ 대량 제작: 7-10일

**주의사항:**
■ 게시 시작일 3일 전까지 제작 완료
■ 날씨에 강한 소재 사용 권장
■ 정확한 규격 확인 필수

제작 관련 문의는 고객센터로 연락해주세요.',
  NOW() - INTERVAL '2 days',
  (SELECT id FROM homepage_menu_types WHERE name = 'banner_display'),
  'frequent_questions'
); 