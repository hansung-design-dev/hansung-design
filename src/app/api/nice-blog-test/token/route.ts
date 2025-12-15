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
    const wantsDebug = request.nextUrl.searchParams.get('debug') === '1';
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
      if (isNiceDebugEnabled()) {
        const egress = await resolveEgressIpForDebug();
        const debug = {
          egress,
          env: getNiceEnvSnapshot({
            scope: 'api/nice-blog-test/token:missing-returnUrl',
            clientId,
            clientSecret,
            productId,
            accessToken,
            accessTokenError,
            returnUrl: null,
            registeredReturnUrl,
          }),
        };
        return NextResponse.json(
          { error: 'returnUrl이 누락되었습니다.', debug },
          { status: 400 }
        );
      }
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

    if (isNiceDebugEnabled() && wantsDebug) {
      const egress = await resolveEgressIpForDebug();
      const debug = {
        egress,
        env: getNiceEnvSnapshot({
          scope: 'api/nice-blog-test/token:success',
          clientId,
          clientSecret,
          productId,
          accessToken,
          accessTokenError,
          returnUrl,
          registeredReturnUrl,
        }),
      };
      // 기존 응답 스키마 유지 + debug만 추가
      return NextResponse.json(
        {
          enc_data: encData,
          token_version_id: tokenVersionId,
          integrity_value: integrityValue,
          debug,
        },
        { status: 200 }
      );
    }

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
