import axios from 'axios';

type CachedToken = {
  token: string;
  expiresAt: number;
};

let cached: CachedToken | null = null;

function getNiceOauthTokenUrl() {
  const override = process.env.NICE_OAUTH_TOKEN_URL?.trim();
  if (override) return override;

  const proxyBase = process.env.NICE_PROXY_URL?.trim();
  if (proxyBase) {
    // Convention: AWS proxy should expose this endpoint.
    // Example: http(s)://nice.yourdomain.com/nice/oauth/token
    return `${proxyBase.replace(/\/+$/, '')}/nice/oauth/token`;
  }

  return 'https://svc.niceapi.co.kr:22001/digital/niceid/oauth/oauth/token';
}

function safeHost(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return 'invalid-url';
  }
}

function getProxyKeyHeaderFor(url: string) {
  const proxyBase = process.env.NICE_PROXY_URL?.trim();
  const proxyKey = process.env.NICE_PROXY_KEY?.trim();
  if (!proxyBase || !proxyKey) return {};
  // Only attach to the proxy host, never to NICE directly.
  if (safeHost(url) !== safeHost(proxyBase)) return {};
  return { 'x-internal-key': proxyKey };
}

function getNested(obj: unknown, path: string[]): unknown {
  let cur: unknown = obj;
  for (const key of path) {
    if (!cur || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return cur;
}

function asNonEmptyString(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t ? t : null;
}

function asFiniteNumber(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

async function issueNiceAccessToken(params: {
  clientId: string;
  clientSecret: string;
}) {
  // #region agent log
  const tokenUrl = getNiceOauthTokenUrl();
  fetch('http://127.0.0.1:7242/ingest/de0826ba-4e91-43eb-b001-5614ace69b75', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'src/lib/niceAccessToken.ts:issueNiceAccessToken:entry',
      message: 'Issuing NICE access token',
      data: {
        urlHost: safeHost(tokenUrl),
        hasOverride: Boolean(process.env.NICE_OAUTH_TOKEN_URL?.trim()),
        hasProxyUrl: Boolean(process.env.NICE_PROXY_URL?.trim()),
        sendsProxyKey: Boolean(
          Object.keys(getProxyKeyHeaderFor(tokenUrl)).length
        ),
        nodeEnv: process.env.NODE_ENV ?? null,
        vercel: Boolean(process.env.VERCEL),
      },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'pre-fix',
      hypothesisId: 'H1',
    }),
  }).catch(() => {});
  // #endregion agent log

  const authorization = Buffer.from(
    `${params.clientId}:${params.clientSecret}`
  ).toString('base64');

  const dataBody = new URLSearchParams({
    scope: 'default',
    grant_type: 'client_credentials',
  }).toString();

  const response = await axios({
    method: 'POST',
    // NOTE: If you must egress from a fixed AWS Elastic IP, point this to your AWS proxy endpoint.
    //       Example: https://your-aws-proxy.example.com/nice/oauth/token
    url: tokenUrl,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${authorization}`,
      ...getProxyKeyHeaderFor(tokenUrl),
    },
    data: dataBody,
  });
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/de0826ba-4e91-43eb-b001-5614ace69b75', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'src/lib/niceAccessToken.ts:issueNiceAccessToken:response',
      message: 'NICE access token response received',
      data: {
        status: response.status,
        urlHost: safeHost(tokenUrl),
      },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'pre-fix',
      hypothesisId: 'H1',
    }),
  }).catch(() => {});
  // #endregion agent log

  // NICE 응답 포맷이 환경/계정/버전에 따라 달라질 수 있어, 가능한 위치를 모두 탐색한다.
  // (민감정보 보호: 토큰 전체는 절대 로깅하지 않는다)
  const data = response.data as unknown;
  const tokenCandidates: Array<unknown> = [
    getNested(data, ['dataBody', 'access_token']),
    getNested(data, ['data_body', 'access_token']),
    getNested(data, ['access_token']),
    getNested(data, ['data', 'access_token']),
    getNested(data, ['result', 'access_token']),
  ];
  const token =
    tokenCandidates.map(asNonEmptyString).find(Boolean) ?? undefined;

  const expiresCandidates: Array<unknown> = [
    getNested(data, ['dataBody', 'expires_in']),
    getNested(data, ['data_body', 'expires_in']),
    getNested(data, ['expires_in']),
    getNested(data, ['data', 'expires_in']),
  ];
  const expiresIn =
    expiresCandidates.map(asFiniteNumber).find((v) => v != null) ?? undefined;
  if (!token) {
    const keys =
      data && typeof data === 'object' ? Object.keys(data as object) : [];
    const header = getNested(data, ['dataHeader']);
    const gwResult = asNonEmptyString(getNested(header, ['GW_RSLT_CD']));
    const gwMessage = asNonEmptyString(getNested(header, ['GW_RSLT_MSG']));
    console.error('[niceAccessToken] unexpected token response shape', {
      topLevelKeys: keys,
      hasDataBody: Boolean(getNested(data, ['dataBody'])),
      hasAccessTokenSomewhere: tokenCandidates
        .map(asNonEmptyString)
        .some(Boolean),
      gwResult: gwResult ?? null,
      gwMessage: gwMessage ?? null,
    });
    throw new Error(
      'NICE access token 발급 응답에서 access_token을 찾을 수 없습니다.'
    );
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

  // 1) 운영에서 고정 토큰을 환경변수로 제공했다면(만료가 매우 길거나, 운영 정책상 고정)
  //    그 값을 우선 사용한다. (단, force=true면 무시하고 재발급 시도)
  const envToken = process.env.NICE_ACCESS_TOKEN?.trim();
  if (!force && envToken) return envToken;

  // 2) 그 외에는 캐시(자동 발급)를 사용한다.
  if (!force && cached && cached.expiresAt > Date.now()) {
    return cached.token;
  }

  const clientId = process.env.NICE_CLIENT_ID?.trim();
  const clientSecret = process.env.NICE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new Error(
      'NICE_CLIENT_ID / NICE_CLIENT_SECRET 환경변수가 필요합니다.'
    );
  }

  cached = await issueNiceAccessToken({ clientId, clientSecret });
  return cached.token;
}
