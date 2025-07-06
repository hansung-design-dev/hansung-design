-- 상담신청 테스트 데이터 생성
-- 먼저 테스트 사용자 ID를 위한 임시 auth_users 레코드 생성 (실제로는 인증 시스템에서 생성됨)
INSERT INTO auth_users (id, email, phone, created_at, updated_at) 
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'test@example.com',
  '010-1234-5678',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- 상담신청 테스트 데이터 삽입
INSERT INTO customer_inquiries (
  user_auth_id,
  title,
  content,
  product_name,
  inquiry_status,
  answer_content,
  created_at,
  updated_at,
  answered_at
) VALUES 
-- 답변 대기중인 문의
(
  '00000000-0000-0000-0000-000000000000',
  '마포구 시민게시대 상담문의',
  '마포구 시민게시대 이용에 대해 문의드립니다. 포스터 크기와 게시 기간에 대해 알려주세요.',
  'mapo-1',
  'pending',
  NULL,
  now() - interval '2 days',
  now() - interval '2 days',
  NULL
),
-- 답변 완료된 문의
(
  '00000000-0000-0000-0000-000000000000',
  '송파구 LED전자게시대 상담문의',
  '송파구 LED전자게시대 가격과 이용 방법에 대해 문의드립니다.',
  'songpa-1',
  'answered',
  '안녕하세요. 송파구 LED전자게시대에 대한 답변드립니다.\n\n가격: 월 500,000원\n이용방법: 온라인 신청 후 계약서 작성\n게시기간: 최소 1개월부터 가능\n\n추가 문의사항이 있으시면 언제든 연락주세요.',
  now() - interval '5 days',
  now() - interval '5 days',
  now() - interval '3 days'
),
-- 답변 완료된 문의 (다른 상품)
(
  '00000000-0000-0000-0000-000000000000',
  '용산구 현수막게시대 상담문의',
  '용산구 현수막게시대 설치 위치와 가격을 알려주세요.',
  'yongsan-1',
  'answered',
  '용산구 현수막게시대 안내드립니다.\n\n설치위치: 용산구 주요 도로변\n가격: 월 300,000원\n크기: 3m x 1.5m\n\n현장 확인 후 정확한 견적을 제공해드리겠습니다.',
  now() - interval '7 days',
  now() - interval '7 days',
  now() - interval '4 days'
);

-- 테스트 데이터 확인
SELECT 
  id,
  title,
  product_name,
  inquiry_status,
  CASE 
    WHEN answer_content IS NOT NULL THEN '답변완료'
    WHEN inquiry_status = 'pending' THEN '답변대기중'
    ELSE '기타'
  END as status_display,
  created_at,
  answered_at
FROM customer_inquiries 
WHERE user_auth_id = '00000000-0000-0000-0000-000000000000'
ORDER BY created_at DESC; 