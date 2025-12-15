import { NextRequest, NextResponse } from 'next/server';
import { NiceAuthHandler } from '@/src/lib/NiceAuthHandler';
import { saveNiceKey } from '@/src/lib/niceAuthKeyStore';
import { v4 as uuidv4 } from 'uuid';
import { getNiceAccessToken } from '@/src/lib/niceAccessToken';
import {
  getNiceEnvSnapshot,
  isNiceDebugEnabled,
  logNiceEnvDebug,
  resolveEgressIpForDebug,
} from '@/src/lib/niceDebug';

export const runtime = 'nodejs';

const COOKIE_PREFIX = 'nice_blog_test_key_';

async function handle(request: NextRequest) {
  try {
    const clientId = process.env.NICE_CLIENT_ID;
    const clientSecret = process.env.NICE_CLIENT_SECRET;
    let accessToken: string | null = null;
    let accessTokenError: string | null = null;
    try {
      accessToken = await getNiceAccessToken();
    } catch (e) {
      accessTokenError = e instanceof Error ? e.message : String(e);
      accessToken = null;
    }
    const productId = process.env.NICE_PRODUCT_ID;
    const registeredReturnUrl = process.env.NICE_CONSOLE_RETURN_URL;

    const { searchParams } = new URL(request.url);
    const body =
      request.method === 'POST' ? await request.json().catch(() => ({})) : {};

    const returnUrl =
      searchParams.get('returnUrl') ??
      (body as Record<string, string>).returnUrl;

    logNiceEnvDebug({
      scope: 'api/nice-blog-test/token',
      clientId,
      clientSecret,
      productId,
      accessToken,
      accessTokenError,
      returnUrl,
      registeredReturnUrl,
    });

    if (!clientId || !productId || !accessToken) {
      const missing: string[] = [];
      if (!clientId) missing.push('NICE_CLIENT_ID');
      if (!productId) missing.push('NICE_PRODUCT_ID');
      if (!accessToken) missing.push('NICE_ACCESS_TOKEN or NICE_CLIENT_SECRET');
      return NextResponse.json(
        { error: 'NICE 환경변수가 부족합니다.', missing },
        { status: 500 }
      );
    }

    if (!returnUrl) {
      return NextResponse.json(
        { error: 'returnUrl이 누락되었습니다.' },
        { status: 400 }
      );
    }

    const niceAuthHandler = new NiceAuthHandler(
      clientId,
      accessToken,
      productId
    );
    const nowDate = new Date();
    const reqDtim = niceAuthHandler.formatDate(nowDate);
    const currentTimestamp = Math.floor(nowDate.getTime() / 1000);
    const reqNo = uuidv4().replace(/-/g, '').substring(0, 30);

    const { siteCode, tokenVal, tokenVersionId } =
      await niceAuthHandler.getEncryptionToken(
        reqDtim,
        currentTimestamp,
        reqNo
      );

    const { key, iv, hmacKey } = niceAuthHandler.generateSymmetricKey(
      reqDtim,
      reqNo,
      tokenVal
    );

    // 블로그 예제 플로우: returnUrl로 결과 전달
    const requestno = reqNo;
    const methodtype = returnUrl.startsWith('https://') ? 'post' : 'get';
    const requestPayload = {
      requestno,
      returnurl: returnUrl,
      sitecode: siteCode,
      authtype: '',
      methodtype,
      popupyn: 'Y',
      receivedata: '',
    };

    const encData = niceAuthHandler.encryptData(requestPayload, key, iv);
    const integrityValue = niceAuthHandler.hmac256(encData, hmacKey);

    // callback에서 복호화하기 위한 대칭키 저장
    saveNiceKey(tokenVersionId, key, iv, hmacKey);

    // 블로그 예제와 동일한 snake_case로 반환
    // NOTE: dev/테스트 환경에서 서버 리로드(HMR)로 in-memory Map이 초기화되면 callback에서 키를 못찾는 문제가 있어
    //       tokenVersionId 별로 HttpOnly 쿠키에도 저장해둔다.
    const response = NextResponse.json({
      enc_data: encData,
      token_version_id: tokenVersionId,
      integrity_value: integrityValue,
    });

    response.cookies.set({
      name: `${COOKIE_PREFIX}${tokenVersionId}`,
      value: JSON.stringify({
        key,
        iv,
        hmacKey,
        expiresAt: Date.now() + 15 * 60 * 1000,
      }),
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60,
    });

    return response;
  } catch (error: unknown) {
    console.error('[nice-blog-test token] error', error);
    // 배포 디버깅용: NICE_DEBUG=1일 때만 egress ip + env snapshot을 응답에 포함(민감정보 제외)
    if (isNiceDebugEnabled()) {
      const egress = await resolveEgressIpForDebug();
      const clientId = process.env.NICE_CLIENT_ID ?? null;
      const clientSecret = process.env.NICE_CLIENT_SECRET ?? null;
      const productId = process.env.NICE_PRODUCT_ID ?? null;
      let accessToken: string | null = null;
      let accessTokenError: string | null = null;
      try {
        accessToken = await getNiceAccessToken();
      } catch (e) {
        accessTokenError = e instanceof Error ? e.message : String(e);
        accessToken = null;
      }
      const { searchParams } = new URL(request.url);
      const returnUrl = searchParams.get('returnUrl');
      const registeredReturnUrl = process.env.NICE_CONSOLE_RETURN_URL ?? null;

      const debug = {
        egress,
        env: getNiceEnvSnapshot({
          scope: 'api/nice-blog-test/token:error',
          clientId,
          clientSecret,
          productId,
          accessToken,
          accessTokenError,
          returnUrl,
          registeredReturnUrl,
        }),
      };

      // #region agent log (hypothesis A/B/C)
      fetch(
        'http://127.0.0.1:7242/ingest/de0826ba-4e91-43eb-b001-5614ace69b75',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'src/app/api/nice-blog-test/token/route.ts:catch',
            message: 'token route failed (with debug snapshot)',
            data: {
              egressOk: debug.egress.ok,
              egressIp: debug.egress.ip,
              gwErrorMsg:
                error instanceof Error
                  ? String(error.message).slice(0, 180)
                  : null,
            },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'pre-fix',
            hypothesisId: 'A/B/C',
          }),
        }
      ).catch(() => {});
      // #endregion

      return NextResponse.json(
        {
          error:
            error instanceof Error ? error.message : 'Internal Server Error',
          debug,
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
