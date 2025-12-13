import axios from 'axios';

type CachedToken = {
  token: string;
  expiresAt: number;
};

let cached: CachedToken | null = null;

async function issueNiceAccessToken(params: {
  clientId: string;
  clientSecret: string;
}) {
  const authorization = Buffer.from(
    `${params.clientId}:${params.clientSecret}`
  ).toString('base64');

  const dataBody = new URLSearchParams({
    scope: 'default',
    grant_type: 'client_credentials',
  }).toString();

  const response = await axios({
    method: 'POST',
    url: 'https://svc.niceapi.co.kr:22001/digital/niceid/oauth/oauth/token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${authorization}`,
    },
    data: dataBody,
  });

  const token = response.data?.dataBody?.access_token as string | undefined;
  const expiresIn = response.data?.dataBody?.expires_in as number | undefined;
  if (!token) {
    throw new Error('NICE access token 발급 응답에서 access_token을 찾을 수 없습니다.');
  }

  // expires_in 이 없으면 보수적으로 50분 정도로 캐싱
  const ttlMs =
    typeof expiresIn === 'number' && Number.isFinite(expiresIn)
      ? Math.max(60, expiresIn - 60) * 1000
      : 50 * 60 * 1000;

  return { token, expiresAt: Date.now() + ttlMs };
}

export async function getNiceAccessToken(options?: { force?: boolean }) {
  const force = options?.force ?? false;

  // env로 고정 토큰을 넣은 경우에도, 만료가 잦아 배포에서 깨질 수 있어
  // 이 함수는 "자동 발급"을 우선으로 사용한다.
  if (!force && cached && cached.expiresAt > Date.now()) {
    return cached.token;
  }

  const clientId = process.env.NICE_CLIENT_ID?.trim();
  const clientSecret = process.env.NICE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    // fallback: 예전 방식(고정 토큰)이 있다면 그걸 반환
    const envToken = process.env.NICE_ACCESS_TOKEN?.trim();
    if (envToken) return envToken;
    throw new Error('NICE_CLIENT_ID / NICE_CLIENT_SECRET 환경변수가 필요합니다.');
  }

  cached = await issueNiceAccessToken({ clientId, clientSecret });
  return cached.token;
}


