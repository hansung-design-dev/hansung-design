# Vercel 환경 변수 설정 가이드

## 테스트용 0원 결제 기능 환경 변수 설정

이 가이드는 Vercel에 배포할 때 테스트용 0원 결제 기능을 위한 환경 변수를 설정하는 방법을 설명합니다.

---

## 📋 환경 변수 목록

### 테스트용 0원 결제 설정

- **`ENABLE_TEST_FREE_PAYMENT`**

  - 설명: 테스트용 0원 결제 기능 활성화 여부
  - 값: `true` (활성화) 또는 `false` (비활성화)
  - 기본값: `false` (설정하지 않으면 비활성화)

- **`TEST_FREE_PAYMENT_USER_ID`**
  - 설명: 0원 결제가 적용될 테스트 계정 ID
  - 값: 테스트 계정 ID (예: `testsung`)
  - 기본값: `testsung`

---

## 🚀 Vercel 대시보드에서 설정하는 방법

### 1. Vercel 프로젝트 접속

1. [Vercel 대시보드](https://vercel.com/dashboard)에 로그인
2. 해당 프로젝트 선택

### 2. 환경 변수 추가

1. 프로젝트 설정 페이지로 이동
   - 프로젝트 이름 클릭 → **Settings** 탭
2. **Environment Variables** 섹션으로 이동
3. **Add New** 버튼 클릭

### 3. 환경별 설정 (중요!)

Vercel은 **환경별로 다른 환경 변수를 설정**할 수 있습니다:

#### ✅ 개발/프리뷰 환경 (Development / Preview)

테스트용 0원 결제를 **활성화**하려면:

```
ENABLE_TEST_FREE_PAYMENT = true
TEST_FREE_PAYMENT_USER_ID = testsung
```

**설정 방법:**

- **Environment** 드롭다운에서 **Development** 또는 **Preview** 선택
- 위 환경 변수들을 추가

#### ❌ 프로덕션 환경 (Production)

프로덕션에서는 **반드시 비활성화**해야 합니다:

```
ENABLE_TEST_FREE_PAYMENT = false
```

또는 **설정하지 않음** (기본값이 `false`이므로)

**설정 방법:**

- **Environment** 드롭다운에서 **Production** 선택
- `ENABLE_TEST_FREE_PAYMENT = false` 설정
- 또는 아예 설정하지 않음

---

## 🔒 보안 주의사항

### ⚠️ 프로덕션 환경에서는 절대 활성화하지 마세요!

- 프로덕션 환경에서 `ENABLE_TEST_FREE_PAYMENT=true`로 설정하면
- `testsung` 계정으로 실제 결제가 0원으로 처리될 수 있습니다
- 이는 **심각한 보안 문제**를 야기할 수 있습니다

### ✅ 안전장치

코드에는 다음 안전장치가 포함되어 있습니다:

1. **프로덕션 환경 자동 차단**

   ```ts
   const isProd = process.env.NODE_ENV === 'production';
   if (
     !isProd &&
     isTestFreePaymentEnabled &&
     userId === testFreePaymentUserId
   ) {
     // 0원 결제 적용
   }
   ```

   - `NODE_ENV=production`이면 **무조건 비활성화**

2. **특정 계정만 적용**
   - `TEST_FREE_PAYMENT_USER_ID`로 지정된 계정에만 적용
   - 기본값: `testsung`

---

## 📝 설정 예시

### 개발 환경 (로컬)

`.env.local` 파일:

```bash
ENABLE_TEST_FREE_PAYMENT=true
TEST_FREE_PAYMENT_USER_ID=testsung
```

### Vercel 프리뷰 환경

Vercel 대시보드에서:

- Environment: **Preview**
- `ENABLE_TEST_FREE_PAYMENT` = `true`
- `TEST_FREE_PAYMENT_USER_ID` = `testsung`

### Vercel 프로덕션 환경

Vercel 대시보드에서:

- Environment: **Production**
- `ENABLE_TEST_FREE_PAYMENT` = `false` (또는 설정하지 않음)

---

## 🧪 테스트 방법

### 1. 환경 변수 확인

배포 후 다음을 확인하세요:

1. Vercel 대시보드 → 프로젝트 → **Settings** → **Environment Variables**
2. 각 환경(Development/Preview/Production)별로 올바르게 설정되었는지 확인

### 2. 기능 테스트

1. **프리뷰/개발 환경**에서:

   - `testsung` 계정으로 로그인
   - 상품을 장바구니에 담고 결제 진행
   - 결제 금액이 **0원**으로 처리되는지 확인

2. **프로덕션 환경**에서:
   - `testsung` 계정으로 로그인
   - 상품을 장바구니에 담고 결제 진행
   - 결제 금액이 **정상 금액**으로 처리되는지 확인 (0원이 아님)

---

## 🔄 테스트 완료 후 되돌리기

테스트가 완료되면 다음 단계를 수행하세요:

### 1. 환경 변수 비활성화

Vercel 대시보드에서:

- 모든 환경에서 `ENABLE_TEST_FREE_PAYMENT` = `false`로 변경
- 또는 환경 변수 삭제

### 2. 코드 정리 (선택사항)

나중에 코드에서 테스트용 로직을 완전히 제거하려면:

1. 다음 파일에서 테스트용 코드 제거:

   - `src/app/api/payment/toss/confirm/route.ts`
   - `src/app/api/payment/naver/approve/route.ts`

2. `TODO: 테스트 완료 후 0원 결제 로직 제거` 주석이 있는 부분 찾아서 삭제

### 3. 검증

- 일반 유저 결제 플로우 정상 작동 확인
- `testsung` 계정으로도 정상적인 유료 결제가 이뤄지는지 확인

---

## 📚 관련 파일

- `env.example` - 환경 변수 예시 파일
- `src/app/api/payment/toss/confirm/route.ts` - 토스페이먼츠 결제 API
- `src/app/api/payment/naver/approve/route.ts` - 네이버페이 결제 API

---

## ❓ FAQ

### Q: Vercel에서 환경 변수를 수정하면 자동으로 재배포되나요?

A: 아니요. 환경 변수를 수정한 후에는 **수동으로 재배포**해야 합니다.

- Vercel 대시보드 → 프로젝트 → **Deployments** 탭
- 최신 배포의 **⋯** 메뉴 → **Redeploy**

### Q: 여러 환경(Development/Preview/Production)에 각각 설정해야 하나요?

A: 네, 각 환경별로 독립적으로 설정할 수 있습니다. 프로덕션에서는 반드시 `false`로 설정하세요.

### Q: 환경 변수를 설정했는데 작동하지 않아요.

A: 다음을 확인하세요:

1. 환경 변수 이름이 정확한지 확인 (`ENABLE_TEST_FREE_PAYMENT`)
2. 값이 정확한지 확인 (`true` 또는 `false`)
3. 올바른 환경(Development/Preview/Production)에 설정했는지 확인
4. 재배포를 했는지 확인
5. `NODE_ENV`가 `production`이 아닌지 확인

---

## 🔗 참고 자료

- [Vercel 환경 변수 문서](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js 환경 변수 문서](https://nextjs.org/docs/basic-features/environment-variables)
