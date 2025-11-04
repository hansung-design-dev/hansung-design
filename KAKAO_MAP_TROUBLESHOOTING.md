# 카카오맵 SDK 로드 실패 문제 해결 가이드

## 🚨 현재 에러 상황

```
❌ 카카오맵 SDK 스크립트 로드 실패 (onerror 이벤트)
```

이 에러는 카카오맵 SDK 스크립트를 로드할 수 없을 때 발생합니다.

---

## 📋 단계별 확인 및 해결 방법

### 1단계: Network 탭에서 실제 에러 확인

**가장 중요합니다!** 실제로 어떤 에러가 발생하는지 확인해야 합니다.

#### 확인 방법:

1. 브라우저 개발자 도구 열기 (F12)
2. **Network 탭** 클릭
3. 페이지 새로고침 (F5)
4. 필터에 `dapi.kakao.com` 입력
5. `dapi.kakao.com`로 시작하는 요청 찾기
6. 해당 요청 클릭하여 확인:

#### 확인할 내용:

**a) Status Code 확인:**

- **200 OK**: 스크립트는 로드되었지만 실행 중 에러 발생
- **403 Forbidden**: **도메인 미등록** 또는 **API 키 오류** (가장 흔한 원인)
- **404 Not Found**: 잘못된 URL 또는 API 키
- **CORS 에러**: 브라우저 콘솔에 CORS 관련 에러 표시

**b) Response 탭 확인:**

- Response 탭을 클릭하여 응답 내용 확인
- HTML 에러 페이지가 보이면 그 내용 확인
- JSON 에러 메시지가 보이면 그 내용 확인

**c) Headers 탭 확인:**

- Request URL이 올바른지 확인
- `appkey` 파라미터가 포함되어 있는지 확인

---

### 2단계: 카카오 개발자 콘솔 설정 확인

#### 필수 체크리스트:

1. **애플리케이션 생성 확인**

   - [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
   - 내 애플리케이션 목록에 새로 만든 앱이 있는지 확인

2. **JavaScript 키 확인**

   - 애플리케이션 선택 → **앱 키** 메뉴 클릭
   - **JavaScript 키** 복사
   - `.env.local` 파일의 `NEXT_PUBLIC_KAKAO_KEY`와 일치하는지 확인

3. **Web 플랫폼 추가 확인** ⚠️ **가장 중요!**

   - 애플리케이션 선택 → **플랫폼** 메뉴 클릭
   - **Web 플랫폼 등록** 버튼이 있으면 클릭
   - 이미 등록되어 있으면 **수정** 버튼 클릭
   - **사이트 도메인** 확인:
     ```
     http://localhost:3000
     ```
   - 정확히 입력했는지 확인 (대소문자, 슬래시, 포트 번호 포함)

4. **저장 확인**
   - 설정 변경 후 **저장** 버튼 클릭
   - 몇 분 정도 기다리기 (설정 적용 시간 필요)

---

### 3단계: 환경 변수 확인

#### `.env.local` 파일 확인:

```bash
# 프로젝트 루트에서 확인
cat .env.local | grep KAKAO
```

다음이 설정되어 있어야 합니다:

```bash
NEXT_PUBLIC_KAKAO_KEY=실제_JavaScript_키_32자리
```

#### 확인 사항:

- [ ] `your_kakao_map_javascript_key` 같은 placeholder 값이 아닌지 확인
- [ ] JavaScript 키가 정확히 32자리인지 확인
- [ ] 공백이나 줄바꿈이 없는지 확인

#### Next.js 서버 재시작:

```bash
# 환경 변수 변경 후 반드시 재시작!
# 터미널에서 Ctrl+C로 서버 중지 후
npm run dev
```

---

### 4단계: 실제 에러 메시지 분석

Network 탭에서 확인한 Status Code에 따라 해결 방법이 다릅니다.

#### Case 1: 403 Forbidden

**원인**: 도메인 미등록 또는 API 키 오류

**해결 방법**:

1. 카카오 개발자 콘솔 → 플랫폼 → Web 플랫폼 확인
2. 사이트 도메인에 `http://localhost:3000` 정확히 등록
3. JavaScript 키가 올바른지 확인
4. 설정 저장 후 5-10분 대기

#### Case 2: 404 Not Found

**원인**: 잘못된 API 키 또는 URL

**해결 방법**:

1. `.env.local`의 `NEXT_PUBLIC_KAKAO_KEY` 확인
2. 카카오 개발자 콘솔의 JavaScript 키와 비교
3. Next.js 서버 재시작

#### Case 3: CORS 에러

**원인**: CSP 설정 문제

**해결 방법**:

1. `next.config.ts`의 CSP 설정 확인
2. 카카오 도메인이 허용되어 있는지 확인

#### Case 4: 스크립트는 로드되지만 실행 에러

**원인**: SDK 초기화 문제

**해결 방법**:

1. 브라우저 콘솔에서 실제 JavaScript 에러 확인
2. `window.kakao` 객체가 존재하는지 확인

---

### 5단계: 브라우저 콘솔에서 추가 정보 확인

#### 확인할 로그:

```javascript
// 콘솔에서 다음을 확인:
🔍 시도한 스크립트 URL: //dapi.kakao.com/v2/maps/sdk.js?appkey=...
🔍 API 키 상태: 설정됨 (길이: 32)
🔍 API 키 앞 4자리 (확인용): xxxx...
```

#### API 키 확인:

- API 키 앞 4자리가 카카오 개발자 콘솔의 JavaScript 키 앞 4자리와 일치하는지 확인
- 길이가 32자인지 확인

---

## 🛠️ 빠른 해결 체크리스트

다음을 순서대로 확인하세요:

- [ ] 1. 브라우저 Network 탭에서 `dapi.kakao.com` 요청의 Status Code 확인
- [ ] 2. 카카오 개발자 콘솔에서 Web 플랫폼이 등록되어 있는지 확인
- [ ] 3. 사이트 도메인에 `http://localhost:3000` 정확히 등록되어 있는지 확인
- [ ] 4. JavaScript 키가 `.env.local`의 `NEXT_PUBLIC_KAKAO_KEY`와 일치하는지 확인
- [ ] 5. `.env.local` 파일에 placeholder 값이 아닌 실제 키가 있는지 확인
- [ ] 6. Next.js 서버를 재시작했는지 확인
- [ ] 7. 브라우저 캐시를 클리어했는지 확인 (Ctrl+Shift+R)
- [ ] 8. 설정 변경 후 5-10분 기다렸는지 확인

---

## 📸 스크린샷으로 확인하기

### 카카오 개발자 콘솔 설정 확인:

1. **플랫폼 설정**:

   ```
   카카오 개발자 콘솔 → 내 애플리케이션 → [앱 선택] → 플랫폼
   ```

   - Web 플랫폼이 등록되어 있어야 함
   - 사이트 도메인에 `http://localhost:3000` 표시되어야 함

2. **앱 키 확인**:
   ```
   카카오 개발자 콘솔 → 내 애플리케이션 → [앱 선택] → 앱 키
   ```
   - JavaScript 키 복사
   - `.env.local`의 `NEXT_PUBLIC_KAKAO_KEY`와 비교

---

## 🔍 디버깅 명령어

### 환경 변수 확인:

```bash
# 프로젝트 루트에서 실행
node -e "console.log(process.env.NEXT_PUBLIC_KAKAO_KEY)"
```

### 브라우저 콘솔에서 확인:

```javascript
// 브라우저 콘솔에서 실행
console.log('API Key length:', process.env.NEXT_PUBLIC_KAKAO_KEY?.length);
console.log(
  'API Key first 4:',
  process.env.NEXT_PUBLIC_KAKAO_KEY?.substring(0, 4)
);
```

---

## 🆘 여전히 해결되지 않으면

다음 정보를 함께 공유해주세요:

1. **Network 탭 스크린샷**:

   - `dapi.kakao.com` 요청의 Status Code
   - Response 탭 내용
   - Headers 탭의 Request URL

2. **브라우저 콘솔 로그**:

   - 전체 에러 메시지
   - `🔍 시도한 스크립트 URL:` 로그
   - `🔍 API 키 상태:` 로그

3. **카카오 개발자 콘솔 설정**:

   - Web 플랫폼이 등록되어 있는지 (스크린샷)
   - 사이트 도메인이 등록되어 있는지 (스크린샷)
   - JavaScript 키 앞 4자리 (보안을 위해 앞 4자리만)

4. **환경 정보**:
   - Next.js 버전
   - Node.js 버전
   - 브라우저 종류 및 버전

---

## 💡 일반적인 실수들

1. **도메인 등록 누락**: Web 플랫폼을 추가했지만 사이트 도메인을 등록하지 않음
2. **도메인 오타**: `localhost:3000` (프로토콜 없음) 또는 `http://localhost` (포트 번호 없음)
3. **환경 변수 미반영**: `.env.local` 수정 후 Next.js 서버 재시작 안 함
4. **잘못된 키 사용**: REST API 키나 Admin 키를 사용 (JavaScript 키를 사용해야 함)
5. **설정 적용 대기 시간**: 설정 변경 후 바로 테스트 (5-10분 기다려야 함)

---

## ✅ 정상 작동 시 확인 사항

모든 설정이 올바르면 다음이 확인되어야 합니다:

1. **브라우저 콘솔**:

   ```
   🔍 카카오맵 SDK 로드 시도: //dapi.kakao.com/v2/maps/sdk.js?appkey=...
   ```

2. **Network 탭**:

   - `dapi.kakao.com` 요청의 Status Code: **200 OK**
   - Response 탭에 JavaScript 코드가 표시됨

3. **브라우저 콘솔**:

   ```javascript
   // 다음을 실행했을 때 객체가 출력되어야 함
   console.log(window.kakao);
   ```

4. **지도 표시**:
   - 페이지에 카카오맵이 정상적으로 표시됨
