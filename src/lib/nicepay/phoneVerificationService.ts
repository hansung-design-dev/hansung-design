const CLIENT_ID =
  process.env.NICEPAY_CLIENT_ID ||
  process.env.NEXT_PUBLIC_NICE_CLIENT_ID ||
  process.env.NEXT_PUCLIC_NICE_CLIENT_ID;
const CLIENT_SECRET =
  process.env.NICEPAY_CLIENT_SECRET ||
  process.env.NEXT_PUBLIC_NICE_CLIENT_SECRET ||
  process.env.NEXT_PUCLIC_NICE_CLIENT_SECRET;
const BASE_URL =
  process.env.NICEPAY_API_BASE_URL ??
  process.env.NEXT_PUBLIC_NICEPAY_API_BASE_URL ??
  'https://sandbox-api.nicepay.co.kr/v1';
const ACCESS_TOKEN_PATH = process.env.NICEPAY_TOKEN_PATH ?? '/access-token';
const ACCESS_TOKEN_SCOPE =
  process.env.NICEPAY_TOKEN_SCOPE ??
  process.env.NEXT_PUBLIC_NICEPAY_TOKEN_SCOPE ??
  'default';
const PHONE_VERIFICATION_REQUEST_PATH =
  process.env.NICEPAY_PHONE_VERIFICATION_REQUEST_PATH ?? '/authn/mobile';
const PHONE_VERIFICATION_CONFIRM_PATH =
  process.env.NICEPAY_PHONE_VERIFICATION_CONFIRM_PATH ??
  '/authn/mobile/confirm';
const MOCK_MODE =
  (
    process.env.NICEPAY_MOCK_MODE ??
    process.env.NEXT_PUBLIC_NICEPAY_MOCK_MODE ??
    ''
  ).toLowerCase() !== 'false';

const sanitizePhone = (phone: string) => phone.replace(/\D/g, '');

interface RequestResult {
  requestId: string;
  expiresAt: string;
  phone: string;
}

interface ConfirmResult {
  verificationId: string;
  verifiedAt: string;
  phone: string;
}

interface AccessTokenResponse {
  access_token: string;
  expires_in: number;
}

let cachedAccessToken: {
  token: string;
  expiresAt: number;
} | null = null;

const ensureAccessToken = async () => {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('NicePay Client ID/Secret이 설정되어 있지 않습니다.');
  }

  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now()) {
    return cachedAccessToken.token;
  }

  const response = await fetch(`${BASE_URL}${ACCESS_TOKEN_PATH}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      Authorization: `Basic ${Buffer.from(
        `${CLIENT_ID}:${CLIENT_SECRET}`
      ).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      scope: ACCESS_TOKEN_SCOPE,
    }).toString(),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `NicePay access token 발급 실패: ${response.status} ${response.statusText} (${errorBody})`
    );
  }

  const data = (await response.json()) as AccessTokenResponse;
  const expiresAt = Date.now() + (data.expires_in - 60) * 1000;
  cachedAccessToken = { token: data.access_token, expiresAt };
  return data.access_token;
};

const requestWithToken = async (url: string, body: Record<string, unknown>) => {
  const token = await ensureAccessToken();
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `NicePay API 요청 실패: ${response.status} ${response.statusText} (${errorBody})`
    );
  }

  return response.json();
};

const ensureEnvWarning = () => {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.warn(
      '[NicePay] 클라이언트 ID/SECRET이 설정되지 않아 실제 NicePay 호출을 수행할 수 없습니다.'
    );
  }
};

export async function requestPhoneVerification(phone: string) {
  const sanitizedPhone = sanitizePhone(phone);
  if (!sanitizedPhone) {
    throw new Error('휴대폰 번호를 입력해주세요.');
  }

  ensureEnvWarning();

  if (MOCK_MODE) {
    const requestId = `mock-${sanitizedPhone}-${Date.now()}`;
    return {
      requestId,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      phone: sanitizedPhone,
    };
  }

  const payload = {
    phoneNumber: sanitizedPhone,
    requestId: `req-${Date.now()}`,
    callbackUrl: process.env.NICEPAY_PHONE_VERIFICATION_RETURN_URL ?? '',
    cancelUrl: process.env.NICEPAY_PHONE_VERIFICATION_CANCEL_URL ?? '',
  };

  const result = (await requestWithToken(
    `${BASE_URL}${PHONE_VERIFICATION_REQUEST_PATH}`,
    payload
  )) as Partial<RequestResult>;

  if (!result.requestId) {
    throw new Error('NicePay가 요청 ID를 반환하지 않았습니다.');
  }

  return {
    requestId: result.requestId,
    expiresAt:
      result.expiresAt ?? new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    phone: sanitizedPhone,
  };
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

  ensureEnvWarning();

  if (MOCK_MODE) {
    return {
      verificationId: `mock-verification-${requestId}`,
      verifiedAt: new Date().toISOString(),
      phone: sanitizedPhone,
    };
  }

  const payload = {
    requestId,
    verificationCode: code,
    phoneNumber: sanitizedPhone,
  };

  const result = (await requestWithToken(
    `${BASE_URL}${PHONE_VERIFICATION_CONFIRM_PATH}`,
    payload
  )) as Partial<ConfirmResult>;

  if (!result.verificationId) {
    throw new Error('NicePay가 인증 결과를 반환하지 않았습니다.');
  }

  return {
    verificationId: result.verificationId,
    verifiedAt: result.verifiedAt ?? new Date().toISOString(),
    phone: sanitizedPhone,
  };
}
