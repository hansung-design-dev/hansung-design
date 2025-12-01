# API 디버깅 가이드

## 🚨 기본적인 것부터 확인하기

### 1단계: API 호출이 발생하는지 확인

#### 브라우저 콘솔에서 확인:

```javascript
// 콘솔에 이런 로그가 보여야 합니다:
🔍 useEffect 실행됨
✅ fetchBannerData 실행 조건 만족
🔍 Starting to fetch banner data...
🔍 API URL: /api/banner-display?action=...
🔍 API 호출 시작 시간: ...
```

#### 브라우저 Network 탭에서 확인:

1. 개발자 도구 열기 (F12)
2. Network 탭 선택
3. 페이지 새로고침 (F5)
4. 다음 요청을 찾아보세요:
   - `/api/banner-display?action=...`
   - `/api/display-period?district=...`

**문제**: Network 탭에 아무 요청도 안 보이면?
→ API 호출 함수가 실행되지 않는 것입니다.
→ 브라우저 콘솔의 `🔍 useEffect 실행됨` 로그를 확인하세요.

---

### 2단계: API 라우트가 호출되는지 확인

#### 서버 콘솔에서 확인 (터미널):

```bash
# Next.js 서버를 실행한 터미널에서 이런 로그가 보여야 합니다:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 Banner Display API 호출됨
📍 URL: http://localhost:3000/api/banner-display?action=...
📍 Action: getByDistrict
📍 District: 서대문구
📍 Timestamp: ...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Supabase 클라이언트 확인됨
🔍 Action "getByDistrict" 처리 시작...
```

**문제**: 서버 콘솔에 로그가 안 보이면?
→ API 라우트가 호출되지 않는 것입니다.
→ 브라우저 Network 탭에서 요청이 실제로 전송되었는지 확인하세요.

---

### 3단계: Supabase 연결 확인

#### 서버 콘솔에서 확인:

```bash
🔍 Supabase URL: Set
🔍 Supabase Key: Set
🔍 Supabase Service Key: Set
✅ Supabase 클라이언트 확인됨
```

**문제**: "Supabase URL이 설정되지 않았거나 유효하지 않습니다" 에러가 나면?
→ `.env.local` 파일을 확인하세요:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**문제**: "Supabase 클라이언트가 없습니다!" 에러가 나면?
→ `src/lib/supabase.ts` 파일을 확인하세요.

---

### 4단계: 함수가 실행되는지 확인

#### 서버 콘솔에서 확인:

```bash
# getBannerDisplaysByDistrict 함수의 경우:
🔍 getBannerDisplaysByDistrict 함수 시작
📍 District Name: 서대문구
📍 Timestamp: ...

# getDistrictDataFromCache 함수의 경우:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 getDistrictDataFromCache 함수 시작
📍 District Name: 서대문구
📍 Timestamp: ...
🔍 Supabase 쿼리 시작: banner_display_cache 테이블 조회
🔍 Supabase 쿼리 완료: { hasData: true, hasError: false }
```

**문제**: 함수 시작 로그는 보이는데 쿼리 완료 로그가 안 보이면?
→ Supabase 쿼리가 실행 중이거나 타임아웃된 것입니다.
→ Supabase 대시보드에서 연결 상태를 확인하세요.

---

### 5단계: 에러 확인

#### 서버 콘솔에서 에러 확인:

```bash
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ Banner Display API 에러 발생!
📍 Action: getByDistrict
📍 District: 서대문구
📍 Error: ...
📍 Error message: ...
📍 Error stack: ...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### 브라우저 콘솔에서 에러 확인:

```javascript
❌ Error fetching banner data: ...
🔍 API 응답 상태: 500 Internal Server Error
```

---

## 🛠️ 단계별 문제 해결

### 문제 1: API 호출이 아예 발생하지 않음

**증상**: 브라우저 Network 탭에 아무 요청도 안 보임

**확인사항**:

1. 브라우저 콘솔에 `🔍 useEffect 실행됨` 로그가 있는지 확인
2. `district` 또는 `districtObj` 값이 있는지 확인
3. `fetchBannerData 실행 조건 만족` 로그가 있는지 확인

**해결방법**:

- `src/app/banner-display/[district]/page.tsx` 파일의 `useEffect` 확인
- URL 파라미터가 올바르게 전달되는지 확인

---

### 문제 2: API 라우트가 호출되지 않음

**증상**: 브라우저 Network 탭에 요청은 보이는데 서버 콘솔에 로그가 안 보임

**확인사항**:

1. Next.js 서버가 실행 중인지 확인
2. 요청 URL이 올바른지 확인 (`/api/banner-display?action=...`)
3. 요청 메서드가 GET인지 확인

**해결방법**:

- Next.js 서버 재시작
- 브라우저 캐시 클리어 (Ctrl+Shift+R)

---

### 문제 3: Supabase 연결 실패

**증상**: "Supabase URL이 설정되지 않았거나 유효하지 않습니다" 에러

**확인사항**:

1. `.env.local` 파일이 프로젝트 루트에 있는지 확인
2. 환경 변수 값이 올바른지 확인
3. Next.js 서버를 재시작했는지 확인 (환경 변수 변경 후 필수)

**해결방법**:

```bash
# .env.local 파일 확인
cat .env.local

# Next.js 서버 재시작
npm run dev
```

---

### 문제 4: 함수는 실행되는데 데이터가 안 옴

**증상**: 함수 시작 로그는 보이는데 쿼리 완료 로그가 안 보이거나 에러 발생

**확인사항**:

1. Supabase 대시보드에서 테이블이 존재하는지 확인
2. 테이블에 데이터가 있는지 확인
3. RLS (Row Level Security) 정책 확인

**해결방법**:

- Supabase 대시보드에서 직접 쿼리 실행해보기
- RLS 정책 확인 및 수정

---

## 🔍 빠른 진단 체크리스트

다음을 순서대로 확인하세요:

- [ ] 1. Next.js 서버가 실행 중인가요?
- [ ] 2. 브라우저 콘솔에 `🔍 useEffect 실행됨` 로그가 보이나요?
- [ ] 3. 브라우저 Network 탭에 `/api/banner-display` 요청이 보이나요?
- [ ] 4. 서버 콘솔에 `🔍 Banner Display API 호출됨` 로그가 보이나요?
- [ ] 5. 서버 콘솔에 `✅ Supabase 클라이언트 확인됨` 로그가 보이나요?
- [ ] 6. 함수 시작 로그가 보이나요? (예: `🔍 getDistrictDataFromCache 함수 시작`)
- [ ] 7. 쿼리 완료 로그가 보이나요? (예: `🔍 Supabase 쿼리 완료`)
- [ ] 8. 에러 로그가 있나요? (`❌`로 시작하는 로그)

---

## 📝 로그 예시

### 정상 작동 시 로그:

#### 브라우저 콘솔:

```
🔍 useEffect 실행됨: { district: 'seodaemun', ... }
✅ fetchBannerData 실행 조건 만족
🔍 Starting to fetch banner data...
🔍 API URL: /api/banner-display?action=getByDistrict&district=서대문구
🔍 API 호출 시작 시간: 2025-01-XX...
🔍 API 응답 상태: 200 OK
```

#### 서버 콘솔:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 Banner Display API 호출됨
📍 URL: http://localhost:3000/api/banner-display?action=getByDistrict&district=서대문구
📍 Action: getByDistrict
📍 District: 서대문구
✅ Supabase 클라이언트 확인됨
🔍 Action "getByDistrict" 처리 시작...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 getBannerDisplaysByDistrict 함수 시작
📍 District Name: 서대문구
...
```

---

## 🆘 여전히 문제가 해결되지 않으면

1. **전체 로그를 복사**해서 공유해주세요:

   - 브라우저 콘솔 로그
   - 서버 콘솔 로그
   - Network 탭 스크린샷 (요청/응답)

2. **어느 단계에서 멈추는지** 알려주세요:

   - API 호출 자체가 안 됨
   - API 라우트는 호출되지만 함수 실행 안 됨
   - 함수는 실행되지만 데이터 안 옴
   - 데이터는 오는데 화면에 안 보임

3. **환경 정보**도 알려주세요:
   - Next.js 버전
   - Node.js 버전
   - 브라우저 종류 및 버전
