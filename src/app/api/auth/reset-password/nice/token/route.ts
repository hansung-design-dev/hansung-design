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

const COOKIE_PREFIX = 'nice_reset_pw_key_';

async function handle(request: NextRequest) {
  // Used in debug output across try/catch scopes (build was failing when this was defined only inside try)
  const registeredReturnUrl = process.env.NICE_CONSOLE_RETURN_URL ?? null;
  const wantsDebug = request.nextUrl.searchParams.get('debug') === '1';

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

    const { searchParams } = new URL(request.url);
    const body =
      request.method === 'POST' ? await request.json().catch(() => ({})) : {};

    const returnUrl =
      searchParams.get('returnUrl') ??
      (body as Record<string, string>).returnUrl;

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
            scope: 'api/auth/reset-password/nice/token:missing-returnUrl',
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

    // 배포 환경에서 env/returnUrl이 실제로 어떻게 읽히는지 확인용(민감정보 마스킹)
    logNiceEnvDebug({
      scope: 'api/auth/reset-password/nice/token',
      clientId,
      clientSecret,
      productId,
      accessToken,
      accessTokenError,
      returnUrl,
      registeredReturnUrl,
    });

    const niceAuthHandler = new NiceAuthHandler(
      clientId,
      accessToken ?? '',
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

    saveNiceKey(tokenVersionId, key, iv, hmacKey);

    const response = NextResponse.json({
      enc_data: encData,
      token_version_id: tokenVersionId,
      integrity_value: integrityValue,
    });

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

    if (isNiceDebugEnabled() && wantsDebug) {
      const egress = await resolveEgressIpForDebug();
      const debug = {
        egress,
        env: getNiceEnvSnapshot({
          scope: 'api/auth/reset-password/nice/token:success',
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
    console.error('[reset-password nice token] error', error);
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
      const debug = {
        egress,
        env: getNiceEnvSnapshot({
          scope: 'api/auth/reset-password/nice/token:error',
          clientId,
          clientSecret,
          productId,
          accessToken,
          accessTokenError,
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
