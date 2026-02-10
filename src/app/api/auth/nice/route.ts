import { NextRequest, NextResponse } from 'next/server';
import { NiceAuthHandler } from '@/src/lib/NiceAuthHandler';
import { v4 as uuidv4 } from 'uuid';
import { saveNiceKey } from '@/src/lib/niceAuthKeyStore';
import { getNiceAccessToken } from '@/src/lib/niceAccessToken';
import {
  getNiceEnvSnapshot,
  isNiceDebugEnabled,
  logNiceEnvDebug,
  resolveEgressIpForDebug,
} from '@/src/lib/niceDebug';

export const runtime = 'nodejs';

// 콜백에서 조회할 쿠키 prefix (callback/route.ts의 COOKIE_PREFIX와 일치해야 함)
const COOKIE_PREFIX = 'nice_auth_key_';

export async function GET(request: NextRequest) {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/de0826ba-4e91-43eb-b001-5614ace69b75', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'src/app/api/auth/nice/route.ts:GET:entry',
        message: '/api/auth/nice invoked',
        data: {
          nodeEnv: process.env.NODE_ENV ?? null,
          vercel: Boolean(process.env.VERCEL),
          vercelRegion: process.env.VERCEL_REGION ?? null,
          hasOauthOverride: Boolean(process.env.NICE_OAUTH_TOKEN_URL?.trim()),
          hasCryptoOverride: Boolean(process.env.NICE_CRYPTO_TOKEN_URL?.trim()),
          purpose: request.nextUrl.searchParams.get('purpose') ?? null,
          origin: request.nextUrl.origin,
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'pre-fix',
        hypothesisId: 'H3',
      }),
    }).catch(() => {});
    // #endregion agent log

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
    const returnUrl = process.env.NICE_RETURN_URL;
    const registeredReturnUrl = process.env.NICE_CONSOLE_RETURN_URL;
    const absoluteReturnUrl = returnUrl
      ? returnUrl.startsWith('/')
        ? new URL(returnUrl, request.nextUrl.origin).toString()
        : returnUrl
      : '';

    // 배포 환경에서 env/returnUrl이 실제로 어떻게 읽히는지 확인용(민감정보 마스킹)
    logNiceEnvDebug({
      scope: 'api/auth/nice',
      clientId,
      clientSecret,
      productId,
      accessToken,
      accessTokenError,
      returnUrl: absoluteReturnUrl,
      registeredReturnUrl,
    });

    if (!clientId || !accessToken || !productId || !absoluteReturnUrl) {
      const missing: string[] = [];
      if (!clientId) missing.push('NICE_CLIENT_ID');
      if (!productId) missing.push('NICE_PRODUCT_ID');
      if (!absoluteReturnUrl) missing.push('NICE_RETURN_URL');
      if (!accessToken) {
        // accessToken은 (1) NICE_CLIENT_ID+NICE_CLIENT_SECRET 또는 (2) NICE_ACCESS_TOKEN 으로 확보 가능
        missing.push('NICE_ACCESS_TOKEN or NICE_CLIENT_SECRET');
      }
      if (isNiceDebugEnabled()) {
        const egress = await resolveEgressIpForDebug();
        const debug = {
          egress,
          env: getNiceEnvSnapshot({
            scope: 'api/auth/nice:missing-env',
            clientId,
            clientSecret,
            productId,
            accessToken,
            accessTokenError,
            returnUrl: absoluteReturnUrl || null,
            registeredReturnUrl,
          }),
        };
        return NextResponse.json(
          { error: 'NICE 환경변수가 부족합니다.', missing, debug },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: 'NICE 환경변수가 부족합니다.', missing },
        { status: 500 }
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

    console.log('[Nice auth] begin', { reqNo, reqDtim, currentTimestamp });
    const { siteCode, tokenVal, tokenVersionId } =
      await niceAuthHandler.getEncryptionToken(
        reqDtim,
        currentTimestamp,
        reqNo
      );
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/de0826ba-4e91-43eb-b001-5614ace69b75', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'src/app/api/auth/nice/route.ts:GET:afterCryptoToken',
        message: '/api/auth/nice got crypto token',
        data: {
          tokenVersionIdPrefix:
            typeof tokenVersionId === 'string'
              ? tokenVersionId.slice(0, 8)
              : null,
          reqNoLen: reqNo.length,
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'pre-fix',
        hypothesisId: 'H3',
      }),
    }).catch(() => {});
    // #endregion agent log

    const { key, iv, hmacKey } = niceAuthHandler.generateSymmetricKey(
      reqDtim,
      reqNo,
      tokenVal
    );

    const requestno = reqNo;
    // HTTPS returnUrl이면 POST 콜백이 안전(권장).
    // HTTP returnUrl로 POST하면(https -> http form submit) 브라우저에서 Mixed Content로 차단될 수 있어
    // 로컬/사설IP(http) 환경에서는 GET 콜백으로 자동 전환한다.
    const methodtype = absoluteReturnUrl.startsWith('https://')
      ? 'post'
      : 'get';
    const requestPayload = {
      requestno,
      returnurl: absoluteReturnUrl,
      sitecode: siteCode,
      authtype: '',
      methodtype,
      popupyn: 'Y',
      receivedata: '',
    };

    const encData = niceAuthHandler.encryptData(requestPayload, key, iv);
    const integrityValue = niceAuthHandler.hmac256(encData, hmacKey);

    saveNiceKey(tokenVersionId, key, iv, hmacKey);

    console.log('[Nice auth] response', {
      tokenVersionId,
      requestno,
      siteCode,
      methodtype,
      encDataSample: encData.slice(0, 20),
    });

    // 응답 생성 헬퍼 (쿠키 설정 포함)
    const createResponse = (body: Record<string, unknown>) => {
      const response = NextResponse.json(body);
      // dev/테스트용 fallback (HMR/재기동 시 in-memory store 유실 대비)
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
    };

    // Optional debug: 성공 응답에 egress ip 포함 (기본 응답 형태는 유지)
    const wantsDebug = request.nextUrl.searchParams.get('debug') === '1';
    if (isNiceDebugEnabled() && wantsDebug) {
      const egress = await resolveEgressIpForDebug();
      const debug = {
        egress,
        env: getNiceEnvSnapshot({
          scope: 'api/auth/nice:success',
          clientId,
          clientSecret,
          productId,
          accessToken,
          accessTokenError,
          returnUrl: absoluteReturnUrl,
          registeredReturnUrl,
        }),
      };
      return createResponse({
        tokenVersionId: tokenVersionId,
        encData,
        integrityValue,
        requestno,
        debug,
      });
    }

    return createResponse({
      tokenVersionId: tokenVersionId,
      encData,
      integrityValue,
      requestno,
    });
  } catch (error: unknown) {
    console.error('[Nice auth] error', error);
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
      const returnUrl = process.env.NICE_RETURN_URL ?? null;
      const registeredReturnUrl = process.env.NICE_CONSOLE_RETURN_URL ?? null;
      const debug = {
        egress,
        env: getNiceEnvSnapshot({
          scope: 'api/auth/nice:error',
          clientId,
          clientSecret,
          productId,
          accessToken,
          accessTokenError,
          returnUrl,
          registeredReturnUrl,
        }),
      };
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
