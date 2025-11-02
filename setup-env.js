#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envContent = `# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 토스페이먼츠 설정
TOSS_PAYMENTS_SECRET_KEY=your_toss_secret_key
NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY=your_toss_client_key

# 카카오페이 설정
KAKAO_PAY_ADMIN_KEY=your_kakao_pay_admin_key
NEXT_PUBLIC_KAKAO_PAY_CID=your_kakao_pay_cid

# 네이버페이 설정
NAVER_PAY_CLIENT_ID=your_naver_pay_client_id
NAVER_PAY_CLIENT_SECRET=your_naver_pay_client_secret

# 카카오맵 설정 - 실제 카카오맵 JavaScript API 키를 입력하세요
NEXT_PUBLIC_KAKAO_KEY=your_kakao_map_javascript_key

# 기본 URL 설정
NEXT_PUBLIC_BASE_URL=http://localhost:3000
`;

const envPath = path.join(__dirname, '.env.local');

if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local 파일이 이미 존재합니다.');
  console.log('📝 기존 파일을 백업하고 새로 생성합니다...');

  const backupPath = path.join(__dirname, '.env.local.backup');
  fs.copyFileSync(envPath, backupPath);
  console.log(`✅ 기존 파일을 ${backupPath}로 백업했습니다.`);
}

fs.writeFileSync(envPath, envContent);
console.log('✅ .env.local 파일이 생성되었습니다.');
console.log('');
console.log('🔧 다음 단계:');
console.log('1. .env.local 파일을 열어서 실제 API 키들을 입력하세요');
console.log(
  '2. 특히 NEXT_PUBLIC_KAKAO_KEY에 카카오맵 JavaScript API 키를 입력하세요'
);
console.log('3. npm run dev로 개발 서버를 재시작하세요');
console.log('');
console.log('📖 카카오맵 API 키 발급 방법:');
console.log('1. https://developers.kakao.com/ 접속');
console.log('2. 애플리케이션 생성 또는 기존 애플리케이션 선택');
console.log('3. 플랫폼 설정에서 Web 플랫폼 추가');
console.log('4. 사이트 도메인 등록: http://localhost:3000');
console.log('5. JavaScript 키 복사하여 NEXT_PUBLIC_KAKAO_KEY에 설정');
