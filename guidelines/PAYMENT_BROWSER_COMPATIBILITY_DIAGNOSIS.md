# 결제 신청 브라우저 호환성 진단 가이드

## 문제 상황
- ✅ 맥북 크롬: 결제 신청 정상 작동
- ❌ 윈도우 크롬: 결제 신청 실패

## 진단 체크리스트

### 1. 브라우저 콘솔 에러 확인 (가장 중요)

윈도우 크롬에서 결제 페이지를 열고 **개발자 도구 (F12) > Console 탭**에서 다음을 확인하세요:

#### 확인할 에러 유형:

1. **localStorage 접근 에러**
   ```
   ❌ Uncaught DOMException: Failed to read the 'localStorage' property from 'Window'
   ❌ Uncaught SecurityError: The operation is insecure
   ```
   - **원인**: 쿠키/로컬스토리지 차단 설정 또는 시크릿 모드
   - **해결**: 브라우저 설정에서 쿠키/로컬스토리지 허용 확인

2. **동적 import 실패**
   ```
   ❌ Failed to fetch dynamically imported module
   ❌ Error loading module '@tosspayments/payment-sdk'
   ```
   - **원인**: 네트워크 문제, CORS 문제, 또는 모듈 로딩 실패
   - **확인**: Network 탭에서 `@tosspayments/payment-sdk` 요청 상태 확인

3. **토스 SDK 초기화 실패**
   ```
   ❌ 토스 SDK가 초기화되지 않음
   ❌ loadTossPayments is not a function
   ```
   - **원인**: SDK 로딩 실패 또는 버전 호환성 문제
   - **확인**: `🔍 [통합결제창] ✅ 토스페이먼츠 SDK 로드 성공` 로그가 있는지 확인

4. **환경 변수 누락**
   ```
   ❌ 토스페이먼츠 클라이언트 키가 설정되지 않았습니다
   ❌ Missing NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY
   ```
   - **원인**: 환경 변수가 제대로 로드되지 않음
   - **확인**: `🔍 [로컬 디버깅] 토스페이먼츠 초기화 시작` 로그에서 `hasClientKey: true` 확인

5. **이벤트 리스너 등록 실패**
   ```
   ❌ Cannot read property 'addEventListener' of null
   ❌ paymentButton is null
   ```
   - **원인**: DOM 요소를 찾지 못함
   - **확인**: `toss-payment-button` 요소가 존재하는지 확인

### 2. Network 탭 확인

**개발자 도구 > Network 탭**에서 다음 요청들을 확인하세요:

1. **토스 SDK 로딩**
   - 필터: `tosspayments` 또는 `payment-sdk`
   - 상태 코드가 `200`인지 확인
   - 실패 시: CORS 에러 또는 네트워크 문제

2. **주문 생성 API 호출**
   - 필터: `/api/orders`
   - 결제 버튼 클릭 시 이 요청이 발생하는지 확인
   - 요청이 없다면: JavaScript 에러로 인해 요청이 차단됨

3. **결제 확인 API 호출**
   - 필터: `/api/payment/toss/confirm`
   - 결제 완료 후 이 요청이 발생하는지 확인

### 3. Application 탭 확인 (localStorage)

**개발자 도구 > Application 탭 > Local Storage**에서 다음 키들이 있는지 확인:

- `hansung_cart`: 장바구니 데이터
- `hansung_profiles_user_id`: 기본 프로필 ID
- `pending_order_data`: 주문 대기 데이터

**문제 발견 시:**
- 키가 없으면: localStorage 접근 권한 문제
- 값이 비어있으면: 데이터 저장 실패

### 4. 코드에서 확인할 핵심 부분

#### 4.1 localStorage 접근 (payment/page.tsx)

```typescript
// 여러 곳에서 localStorage 사용
localStorage.getItem('hansung_cart')
localStorage.getItem('hansung_profiles_user_id')
localStorage.getItem('pending_order_data')
```

**윈도우에서 문제가 될 수 있는 경우:**
- 시크릿 모드에서 localStorage 차단
- 브라우저 보안 설정으로 인한 차단
- 쿠키 차단 설정

#### 4.2 동적 import (payment/page.tsx:1432)

```typescript
const { loadTossPayments } = await import('@tosspayments/payment-sdk');
```

**윈도우에서 문제가 될 수 있는 경우:**
- 네트워크 문제로 모듈 로딩 실패
- CORS 정책 차단
- 브라우저 확장 프로그램 간섭

#### 4.3 토스 SDK 초기화 (payment/page.tsx:1480)

```typescript
const tossPayments = await loadTossPayments(clientKey);
```

**윈도우에서 문제가 될 수 있는 경우:**
- clientKey가 undefined 또는 null
- SDK 로딩 실패
- 브라우저 호환성 문제

#### 4.4 이벤트 리스너 등록 (payment/page.tsx:1497)

```typescript
paymentButton.addEventListener('click', async () => {
  // 결제 처리 로직
});
```

**윈도우에서 문제가 될 수 있는 경우:**
- `paymentButton`이 null (DOM 요소를 찾지 못함)
- 이벤트 리스너가 등록되지 않음
- React와 vanilla JS 이벤트 충돌

### 5. 단계별 디버깅 방법

#### Step 1: 콘솔 로그 확인

윈도우 크롬에서 결제 페이지를 열고 다음 로그들이 순서대로 나타나는지 확인:

1. `🔍 [Payment 페이지] 초기 로드:` - 페이지 로드 확인
2. `🔍 [로컬 디버깅] 토스페이먼츠 초기화 시작:` - SDK 초기화 시작
3. `🔍 [통합결제창] 토스페이먼츠 SDK 로드 시작...` - SDK 로딩 시작
4. `🔍 [통합결제창] ✅ 토스페이먼츠 SDK 로드 성공` - SDK 로딩 성공
5. 결제 버튼 클릭 시: `🔍 [통합결제창] 결제 버튼 클릭됨:` - 버튼 클릭 감지
6. `🔍 [통합결제창] 결제 요청 시작:` - 결제 요청 시작

**어느 단계에서 멈추는지 확인하세요.**

#### Step 2: 수동 테스트

브라우저 콘솔에서 다음을 직접 실행해보세요:

```javascript
// 1. localStorage 접근 테스트
try {
  localStorage.setItem('test', 'value');
  console.log('✅ localStorage 접근 가능');
  localStorage.removeItem('test');
} catch (e) {
  console.error('❌ localStorage 접근 불가:', e);
}

// 2. 토스 SDK 동적 import 테스트
try {
  const { loadTossPayments } = await import('@tosspayments/payment-sdk');
  console.log('✅ 토스 SDK import 성공');
} catch (e) {
  console.error('❌ 토스 SDK import 실패:', e);
}

// 3. 환경 변수 확인
console.log('Client Key:', process.env.NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY ? '있음' : '없음');

// 4. DOM 요소 확인
const button = document.getElementById('toss-payment-button');
console.log('결제 버튼 요소:', button ? '찾음' : '없음');
```

#### Step 3: 네트워크 상태 확인

1. **개발자 도구 > Network 탭 > Disable cache 체크**
2. 페이지 새로고침
3. `tosspayments` 관련 요청이 모두 성공하는지 확인

#### Step 4: 브라우저 설정 확인

윈도우 크롬에서 다음을 확인:

1. **쿠키 및 사이트 데이터**
   - 설정 > 개인정보 및 보안 > 쿠키 및 기타 사이트 데이터
   - "모든 쿠키 허용" 또는 해당 사이트 허용 확인

2. **JavaScript 활성화**
   - 설정 > 개인정보 및 보안 > 사이트 설정 > JavaScript
   - JavaScript가 활성화되어 있는지 확인

3. **확장 프로그램 비활성화**
   - 시크릿 모드로 테스트하거나 확장 프로그램 비활성화
   - 광고 차단기, 보안 확장 프로그램이 간섭할 수 있음

### 6. 가능한 원인별 해결 방법

#### 원인 1: localStorage 접근 차단

**증상:**
- 콘솔에 `SecurityError` 또는 `DOMException` 에러
- `localStorage.getItem()` 호출 시 에러

**해결:**
1. 브라우저 설정에서 쿠키/로컬스토리지 허용
2. 시크릿 모드가 아닌 일반 모드에서 테스트
3. 브라우저 확장 프로그램 비활성화

#### 원인 2: 토스 SDK 로딩 실패

**증상:**
- `Failed to fetch dynamically imported module` 에러
- `loadTossPayments is not a function` 에러
- Network 탭에서 SDK 요청 실패

**해결:**
1. 네트워크 연결 확인
2. 방화벽/보안 프로그램이 차단하는지 확인
3. CORS 에러인 경우 서버 설정 확인
4. 브라우저 캐시 삭제 후 재시도

#### 원인 3: 환경 변수 누락

**증상:**
- `토스페이먼츠 클라이언트 키가 설정되지 않았습니다` 메시지
- `hasClientKey: false` 로그

**해결:**
1. `.env.local` 파일에 `NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY` 확인
2. Next.js 재시작 (환경 변수 변경 후 반드시 재시작 필요)
3. 빌드된 파일이 최신인지 확인

#### 원인 4: 이벤트 리스너 미등록

**증상:**
- 결제 버튼 클릭 시 아무 반응 없음
- `🔍 [통합결제창] 결제 버튼 클릭됨:` 로그가 없음

**해결:**
1. DOM 요소가 제대로 렌더링되었는지 확인
2. React와 vanilla JS 이벤트 충돌 확인
3. `toss-payment-button` 요소가 존재하는지 확인

#### 원인 5: 브라우저 호환성 문제

**증상:**
- 특정 브라우저에서만 발생
- 최신 JavaScript 기능 사용으로 인한 호환성 문제

**해결:**
1. 크롬 버전 확인 (최신 버전 권장)
2. 다른 브라우저에서 테스트 (Edge, Firefox)
3. Polyfill 필요 여부 확인

### 7. 추가 진단 코드

결제 페이지에 다음 디버깅 코드를 추가하여 문제를 진단할 수 있습니다:

```typescript
// payment/page.tsx의 useEffect 내부에 추가
useEffect(() => {
  // 브라우저 정보 로깅
  console.log('🔍 [브라우저 진단]', {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    localStorageAvailable: typeof Storage !== 'undefined',
    windowLocation: window.location.href,
    timestamp: new Date().toISOString(),
  });

  // localStorage 테스트
  try {
    localStorage.setItem('__test__', 'test');
    localStorage.removeItem('__test__');
    console.log('✅ localStorage 접근 가능');
  } catch (e) {
    console.error('❌ localStorage 접근 불가:', e);
  }

  // 환경 변수 확인
  console.log('🔍 [환경 변수]', {
    hasClientKey: !!process.env.NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY,
    clientKeyPrefix: process.env.NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY?.substring(0, 10),
  });
}, []);
```

### 8. 체크리스트 요약

윈도우 크롬에서 결제 신청이 안 될 때 확인할 사항:

- [ ] 브라우저 콘솔에 에러가 있는가?
- [ ] Network 탭에서 토스 SDK 요청이 성공하는가?
- [ ] localStorage에 필요한 데이터가 있는가?
- [ ] 환경 변수 `NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY`가 설정되어 있는가?
- [ ] 결제 버튼 요소(`toss-payment-button`)가 DOM에 존재하는가?
- [ ] 쿠키/로컬스토리지 접근이 허용되어 있는가?
- [ ] 시크릿 모드가 아닌가?
- [ ] 브라우저 확장 프로그램이 간섭하지 않는가?
- [ ] 네트워크 연결이 정상인가?
- [ ] 크롬 버전이 최신인가?

### 9. 로그 수집 방법

문제 재현 시 다음 정보를 수집하세요:

1. **브라우저 콘솔 로그 전체** (에러 포함)
2. **Network 탭 스크린샷** (특히 실패한 요청)
3. **Application 탭 > Local Storage 스크린샷**
4. **브라우저 정보**: 크롬 버전, OS 버전
5. **에러 발생 시점**: 어떤 단계에서 멈추는지

이 정보들을 바탕으로 정확한 원인을 파악할 수 있습니다.

