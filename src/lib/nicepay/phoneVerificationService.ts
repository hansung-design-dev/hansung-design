const CLIENT_ID =
  process.env.NICEPAY_CLIENT_ID ||
  process.env.NEXT_PUBLIC_NICE_CLIENT_ID ||
  process.env.NEXT_PUCLIC_NICE_CLIENT_ID;
const CLIENT_SECRET =
  process.env.NICEPAY_CLIENT_SECRET ||
  process.env.NEXT_PUBLIC_NICE_CLIENT_SECRET ||
  process.env.NEXT_PUCLIC_NICE_CLIENT_SECRET;
const MOCK_MODE =
  (
    process.env.NICEPAY_MOCK_MODE ??
    process.env.NEXT_PUBLIC_NICEPAY_MOCK_MODE ??
    ''
  ).toLowerCase() !== 'false';

const DEFAULT_EXPIRY_MS = 5 * 60 * 1000;

const sanitizePhone = (phone: string) => {
  return phone.replace(/\D/g, '');
};

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.warn(
    '[NicePay] 클라이언트 ID/SECRET이 설정되어 있지 않습니다. 테스트 모드에서만 동작합니다.'
  );
}

// interface RequestResult {
//   requestId: string;
//   expiresAt: string;
//   phone: string;
// }

// interface ConfirmResult {
//   verificationId: string;
//   verifiedAt: string;
//   phone: string;
// }

export async function requestPhoneVerification(phone: string) {
  const sanitizedPhone = sanitizePhone(phone);
  if (!sanitizedPhone) {
    throw new Error('휴대폰 번호를 입력해주세요.');
  }

  if (MOCK_MODE) {
    const requestId = `mock-${sanitizedPhone}-${Date.now()}`;
    return {
      requestId,
      expiresAt: new Date(Date.now() + DEFAULT_EXPIRY_MS).toISOString(),
      phone: sanitizedPhone,
    };
  }

  // 실제 나이스페이 연동을 위해 여기를 구현하세요.
  // 필요한 엔드포인트/파라미터는 나이스페이 개발자 가이드에서 확인하고,
  // 클라이언트 ID/SECRET을 요청 헤더 또는 payload에 포함시켜 호출합니다.
  throw new Error(
    'Nicepay /phone-verification/request 호출은 아직 구현되지 않았습니다.'
  );
}

export async function confirmPhoneVerification({
  phone,
  requestId,
  code,
}: {
  phone: string;
  requestId: string;
  code: string;
}) {
  const sanitizedPhone = sanitizePhone(phone);
  if (!sanitizedPhone) {
    throw new Error('휴대폰 번호가 유효하지 않습니다.');
  }

  if (!requestId) {
    throw new Error('인증 요청 ID가 누락되었습니다.');
  }

  if (!code) {
    throw new Error('인증번호를 입력해주세요.');
  }

  if (MOCK_MODE) {
    const verificationId = `mock-verification-${requestId}`;
    return {
      verificationId,
      verifiedAt: new Date().toISOString(),
      phone: sanitizedPhone,
    };
  }

  throw new Error(
    'Nicepay /phone-verification/confirm 호출은 아직 구현되지 않았습니다.'
  );
}
