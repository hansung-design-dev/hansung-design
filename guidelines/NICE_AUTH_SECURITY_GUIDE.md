# 나이스 본인확인 보안 가이드

## ⚠️ 중요: CI/DI 평문 노출 방지

### 취약점 사례

- Hidden tag를 이용하여 A페이지에서 B페이지로 데이터 전달 시 CI/DI, CP코드 등이 평문으로 노출
- 회원가입에 필요한 정보뿐만 아니라 불필요한 중요정보가 평문으로 노출됨
- 타 서비스 부정가입 및 명의 도용 등 피해 발생 가능

---

## ✅ 올바른 구현 방법

### 1. 나이스 인증 결과 처리 플로우

```
[클라이언트]                    [서버]                      [나이스]
    |                              |                           |
    |-- 1. 인증 요청 ------------->|                           |
    |                              |-- 2. 인증 요청 ---------->|
    |                              |<-- 3. 인증 결과 (암호화) --|
    |<-- 4. 인증 세션 ID만 전달 ---|                           |
    |                              |                           |
    |-- 5. 회원가입 (세션 ID) ---->|                           |
    |                              |-- 6. 세션으로 인증 확인 -->|
    |                              |-- 7. CI/DI 복호화 (서버)   |
    |                              |-- 8. 회원가입 처리         |
    |<-- 9. 회원가입 완료 ---------|                           |
```

### 2. 절대 하지 말아야 할 것 (❌)

#### ❌ Hidden Input 사용 금지

```html
<!-- 절대 이렇게 하지 마세요! -->
<form>
  <input type="hidden" name="CI" value="암호화된_CI값" />
  <input type="hidden" name="DI" value="암호화된_DI값" />
  <input type="hidden" name="CPCODE" value="CP코드" />
  <!-- 이런 식으로 하면 개발자 도구에서 모두 노출됨 -->
</form>
```

#### ❌ 클라이언트에 CI/DI 전달 금지

```javascript
// 절대 이렇게 하지 마세요!
const authResult = {
  name: '홍길동',
  birthDate: '19900101',
  phone: '01012345678',
  CI: '암호화된_CI값', // ❌ 클라이언트에 노출되면 안됨
  DI: '암호화된_DI값', // ❌ 클라이언트에 노출되면 안됨
  CPCODE: 'CP코드', // ❌ 클라이언트에 노출되면 안됨
};
```

#### ❌ URL 파라미터로 전달 금지

```javascript
// 절대 이렇게 하지 마세요!
router.push(`/signup?CI=${encryptedCI}&DI=${encryptedDI}`);
```

#### ❌ localStorage/sessionStorage에 저장 금지

```javascript
// 절대 이렇게 하지 마세요!
localStorage.setItem('CI', encryptedCI);
localStorage.setItem('DI', encryptedDI);
```

### 3. 올바른 구현 방법 (✅)

#### ✅ 서버에서만 CI/DI 처리

**1단계: 나이스 인증 API 생성**

```typescript
// src/app/api/auth/nice-verify/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { encryptedData, transactionId } = await request.json();

    // 서버에서만 나이스 복호화 수행
    const decryptedData = await decryptNiceData(encryptedData);

    // CI/DI는 서버에서만 처리하고 클라이언트로 전달하지 않음
    const { name, birthDate, phone, CI, DI } = decryptedData;

    // 세션에 인증 정보 저장 (CI/DI 포함, 서버에만 존재)
    const sessionId = await createAuthSession({
      name,
      birthDate,
      phone,
      CI, // 서버 세션에만 저장
      DI, // 서버 세션에만 저장
      transactionId,
      verifiedAt: new Date(),
    });

    // 클라이언트에는 세션 ID만 전달
    return NextResponse.json({
      success: true,
      sessionId, // ✅ 세션 ID만 전달
      // CI, DI는 절대 포함하지 않음
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '인증 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
```

**2단계: 회원가입 시 세션 검증**

```typescript
// src/app/api/auth/signup/route.ts
export async function POST(request: NextRequest) {
  try {
    const {
      email,
      password,
      name,
      username,
      phone,
      agreements,
      authSessionId, // ✅ 세션 ID만 받음
    } = await request.json();

    // 세션에서 인증 정보 조회 (서버에서만)
    const authSession = await getAuthSession(authSessionId);
    if (!authSession || !authSession.verified) {
      return NextResponse.json(
        { success: false, error: '본인확인이 필요합니다.' },
        { status: 400 }
      );
    }

    // ✅ 입력값과 인증값 일치 검증
    if (authSession.name !== name) {
      return NextResponse.json(
        {
          success: false,
          error: '입력하신 이름이 인증 정보와 일치하지 않습니다.',
        },
        { status: 400 }
      );
    }

    if (authSession.phone !== phone.replace(/\D/g, '')) {
      return NextResponse.json(
        {
          success: false,
          error: '입력하신 전화번호가 인증 정보와 일치하지 않습니다.',
        },
        { status: 400 }
      );
    }

    // ✅ CI/DI는 서버에서만 사용 (중복 가입 방지 등)
    const existingUser = await checkDuplicateByCI(authSession.CI);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: '이미 가입된 사용자입니다.' },
        { status: 400 }
      );
    }

    // 회원가입 처리
    const user = await createUser({
      email,
      password,
      name,
      username,
      phone,
      agreements,
      // CI/DI는 DB에만 저장 (선택사항, 필요시에만)
      ci: authSession.CI,
      di: authSession.DI,
    });

    // 세션 삭제 (일회성 보장)
    await deleteAuthSession(authSessionId);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        phone: user.phone,
        // CI/DI는 절대 응답에 포함하지 않음
      },
    });
  } catch (error) {
    console.error('Signup API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
```

**3단계: 클라이언트 구현**

```typescript
// src/app/signup/page.tsx
const handlePhoneVerification = async () => {
  // 나이스 인증 팝업 호출
  const niceAuthResult = await openNiceAuthPopup();

  // 나이스에서 받은 암호화 데이터를 서버로 전송
  const response = await fetch('/api/auth/nice-verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      encryptedData: niceAuthResult.encryptedData,
      transactionId: niceAuthResult.transactionId,
    }),
  });

  const data = await response.json();

  if (data.success) {
    // ✅ 세션 ID만 저장 (CI/DI는 저장하지 않음)
    setAuthSessionId(data.sessionId);
    setIsPhoneVerified(true);

    // ✅ 인증된 이름/전화번호는 사용자 입력값과 비교용으로만 사용
    // (서버에서 최종 검증)
  }
};

const handleSignup = async () => {
  const result = await signUp(
    formData.email,
    formData.password,
    formData.name,
    formData.id,
    formData.phone,
    agreements,
    authSessionId // ✅ 세션 ID만 전달
  );
};
```

---

## 🔒 보안 체크리스트

### ✅ 구현 시 확인사항

1. **CI/DI 클라이언트 노출 방지**

   - [ ] CI/DI가 HTML에 포함되지 않음 (Hidden input 없음)
   - [ ] CI/DI가 URL 파라미터에 포함되지 않음
   - [ ] CI/DI가 localStorage/sessionStorage에 저장되지 않음
   - [ ] CI/DI가 API 응답에 포함되지 않음
   - [ ] CI/DI가 console.log에 출력되지 않음

2. **서버에서만 처리**

   - [ ] 나이스 복호화는 서버에서만 수행
   - [ ] CI/DI는 서버 세션에만 저장
   - [ ] 클라이언트에는 세션 ID만 전달

3. **입력값 검증**

   - [ ] 사용자 입력값과 인증값 일치 검증 (서버에서)
   - [ ] 이름 일치 검증
   - [ ] 전화번호 일치 검증
   - [ ] 생년월일 일치 검증 (필요시)

4. **일회성 보장**

   - [ ] 인증 세션은 일회성 사용 후 삭제
   - [ ] 거래번호(transactionId) 재사용 방지
   - [ ] 세션 만료 시간 설정 (예: 10분)

5. **데이터 재사용 방지**
   - [ ] 동일 거래번호 재사용 불가
   - [ ] 동일 세션 ID 재사용 불가
   - [ ] 인증 완료 후 세션 즉시 삭제

---

## 📝 구현 예시 코드 구조

### 세션 관리 유틸리티

```typescript
// src/lib/nice-auth-session.ts
interface AuthSession {
  name: string;
  birthDate: string;
  phone: string;
  CI: string; // 서버에만 존재
  DI: string; // 서버에만 존재
  transactionId: string;
  verifiedAt: Date;
}

// Redis 또는 DB를 사용한 세션 저장
export async function createAuthSession(data: AuthSession): Promise<string> {
  const sessionId = generateSecureSessionId();
  await redis.setex(
    `auth:${sessionId}`,
    600, // 10분 만료
    JSON.stringify(data)
  );
  return sessionId;
}

export async function getAuthSession(
  sessionId: string
): Promise<AuthSession | null> {
  const data = await redis.get(`auth:${sessionId}`);
  if (!data) return null;
  return JSON.parse(data);
}

export async function deleteAuthSession(sessionId: string): Promise<void> {
  await redis.del(`auth:${sessionId}`);
}
```

---

## ⚠️ 주의사항

1. **개발 환경에서도 CI/DI 노출 금지**

   - 개발자 도구에서 확인 가능한 모든 곳에서 제거
   - 테스트 코드에도 실제 CI/DI 사용 금지

2. **로그에 CI/DI 기록 금지**

   - 서버 로그에도 CI/DI 평문 기록 금지
   - 필요시 마스킹 처리 (예: CI\*\*\*)

3. **에러 메시지에 정보 노출 금지**

   - 에러 응답에 CI/DI 관련 정보 포함 금지

4. **데이터베이스 저장**
   - CI/DI를 DB에 저장할 경우 암호화 저장 고려
   - 개인정보보호법 준수

---

## 🔍 검증 방법

### 개발자 도구로 확인

1. 브라우저 개발자 도구 열기 (F12)
2. Elements 탭에서 Hidden input 확인
3. Network 탭에서 API 요청/응답 확인
4. Application 탭에서 localStorage/sessionStorage 확인
5. Console에서 로그 확인

**모든 곳에서 CI/DI가 보이지 않아야 함!**

### 코드 리뷰 체크리스트

- [ ] 클라이언트 코드에 CI/DI 변수명 검색 결과 없음
- [ ] API 응답에 CI/DI 필드 없음
- [ ] 로그에 CI/DI 출력 없음
- [ ] 세션 ID만 클라이언트로 전달됨
