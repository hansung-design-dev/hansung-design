# NicePay 휴대폰 인증 도입 가이드

이 문서는 현재 프로젝트에 도입된 NicePay 모바일 본인인증 기능의 구조와 실제 연동 시 구현해야 하는 지점을 정리합니다.

## 목표

- 회원가입 폼과 `간편정보관리` 모달에서 휴대폰 인증 버튼을 눌렀을 때 NicePay API를 호출하여 `인증 요청` → `인증 확인`을 수행한다.
- `phoneVerificationReference` (또는 `verificationId`)가 있어야만 회원가입/저장이 진행되도록 서버/클라이언트 단에서 검증한다.
- 현재는 `NICEPAY_MOCK_MODE`를 통한 모킹 코드를 탑재해 두었으며, 실서비스에서는 해당 모드를 꺼두고 NicePay 실제 API를 호출해야 한다.

## 관련 구성요소

| 위치                                                                       | 설명                                                                                                                         |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/nicepay/phoneVerificationService.ts`                              | NicePay 호출을 담당하는 서비스. 현재 모드에 따라 mock 혹은 실제 NicePay 엔드포인트로 요청할 수 있게 구조화.                  |
| `src/lib/hooks/usePhoneVerification.ts`                                    | 인증 요청/확인 흐름을 캡슐화한 훅. 상태·메시지·code 값을 관리하고, UI 컴포넌트가 이 훅을 사용하여 버튼/입력과 연결.          |
| `src/app/api/auth/phone-verification/route.ts`                             | 클라이언트 요청을 받아 `requestPhoneVerification`/`confirmPhoneVerification` 호출 후 결과 반환하는 API.                      |
| `src/app/signup/page.tsx` <br> `src/components/modal/UserProfileModal.tsx` | 각각 회원가입 페이지와 간편정보 모달에서 버튼·입력 UI를 제공하고, 인증 완료(verification reference)가 있어야 작업 허용.      |
| `src/contexts/authContext.tsx` <br> `src/app/api/auth/signup/route.ts`     | 가입 API에 `phoneVerificationReference`를 전달하고, 서버에서도 없으면 가입을 막으며 `user_auth.is_verified`를 `true`로 표시. |

## 환경 변수

`.env.local` 기준으로 다음 변수들을 채워야 합니다.

```env
NICEPAY_CLIENT_ID=<NicePay 발급 Client ID>
NICEPAY_CLIENT_SECRET=<NicePay Client Secret>
NEXT_PUBLIC_NICE_CLIENT_ID=<클라이언트 렌더링에서 노출 가능한 경우 동일값>
NEXT_PUBLIC_NICE_CLIENT_SECRET=<클라이언트 렌더링에서 노출 가능한 경우 동일값>
NICEPAY_API_BASE_URL=https://sandbox-api.nicepay.co.kr/v1
NICEPAY_TOKEN_PATH=/access-token
NICEPAY_TOKEN_SCOPE=default
NICEPAY_PHONE_VERIFICATION_REQUEST_PATH=/authn/mobile
NICEPAY_PHONE_VERIFICATION_CONFIRM_PATH=/authn/mobile/confirm
NICEPAY_PHONE_VERIFICATION_RETURN_URL=https://localhost:3000/phone-verification/callback
NICEPAY_PHONE_VERIFICATION_CANCEL_URL=https://localhost:3000/phone-verification/cancel
NICEPAY_MOCK_MODE=false
```

- `NICEPAY_CLIENT_ID`/`NICEPAY_CLIENT_SECRET`는 서버에서만 사용하는 민감 정보이며, `NEXT_PUBLIC_` 접두어가 붙은 변수는 필요 시(예: 브라우저 스크립트가 직접 필요할 경우) 노출 가능하게 설정.
- `NICEPAY_API_BASE_URL`과 `TOKEN_PATH`/`TOKEN_SCOPE`/`REQUEST_PATH`/`CONFIRM_PATH`를 NicePay 문서에 따라 실제 엔드포인트로 맞추고, `RETURN_URL`/`CANCEL_URL`은 인증창 결과를 받는 URL입니다.
- `NICEPAY_MOCK_MODE=false`로 두면 `phoneVerificationService.ts` 내부에서 토큰을 발급받고 인증 요청/확인을 NicePay에 직접 전달합니다.

## 테스트 시나리오

1. `.env.local`에 실제 NicePay 자격증명을 채우고 `NICEPAY_MOCK_MODE=false`로 설정.
2. `npm run dev` 등으로 로컬 서버 실행.
3. 회원가입 폼에서 휴대폰 번호 입력 → `인증번호 받기` 클릭 → SMS 수신 확인 → 코드 입력 → `확인` → 인증 상태 메시지 확인.
4. 인증이 완료된 상태에서 `회원가입` 버튼 클릭 → `/api/auth/signup`에 `phoneVerificationReference` 포함된 요청이 들어갔는지 브라우저의 Network 탭/서버 로그 확인.
5. 로그인 후 `간편정보관리` 모달을 열고 유사한 흐름으로 인증 → 인증 완료 후 `저장` 버튼 클릭.

> 참고: 기존 회원 마이그레이션에서는 휴대폰 번호가 없는 상태이므로, 인증이 요구되는 시점(예: 간편정보 저장)에서 사용자가 번호를 입력하고 인증을 순차적으로 완료하도록 안내합니다.

## NicePay REST API 연결 위치

`phoneVerificationService.ts`의 TODO 부분을 다음과 같이 채웁니다.

1. **인증 요청** (`requestPhoneVerification`)

   - NicePay 인증 요청 엔드포인트 예시(문서에 따라 정확한 URL/파라미터 사용).
   - HTTP 헤더에 `Client-ID`, `Client-Secret`, `Content-Type: application/json` 등 필요 정보 삽입.
   - 요청 바디에는 `requestId`, `phoneNumber`, `serviceName`, `returnUrl`, `cancelUrl` 등 문서에서 요구하는 필드 사용.
   - 응답에서 `requestId`/유효기간 등을 받아 클라이언트에 전달.

2. **인증 확인** (`confirmPhoneVerification`)

   - `code`(사용자가 입력한 인증번호)와 `requestId`를 NicePay API에 전달하여 검증.
   - 성공 시 `verificationId`/`verifiedAt` 등을 받아 반환.
   - 실패 시 에러 메시지를 클라이언트로 그대로 전달해줄 것.

## 에러 대응

- NicePay API가 실패하면 `route.ts`에서 에러 메시지를 클라이언트에 넘겨주므로, `usePhoneVerification` 훅에서 `onError` 콜백을 통해 `setError`하거나 UI에 노출하면 됩니다.
- `phoneVerificationService.ts`에서 HTTP 상태 코드 및 바디를 로깅하고, 재시도 가능 여부를 판단해 `options?.onError`에 적절한 메시지를 전달하십시오.

## 마무리

- 기능이 완전히 구현되면 `.env.local`에서 mock 모드를 끄고 실제 SMS를 발송해 RFC와 CSR 요구사항을 만족하는지 테스트하세요.
- NicePay에서 제공하는 “인증 결과 콜백”을 받을 경우에는 필요한 경우 서버 쪽에 webhook 엔드포인트도 추가로 구현하면 좋습니다. </docs/nicepay-phone-auth-integration.md>
