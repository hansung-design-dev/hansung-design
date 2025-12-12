import { NextRequest, NextResponse } from 'next/server';
import { NiceAuthHandler } from '@/src/lib/NiceAuthHandler';
import { saveNiceKey } from '@/src/lib/niceAuthKeyStore';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';

const COOKIE_PREFIX = 'nice_reset_pw_key_';

async function handle(request: NextRequest) {
  try {
    const clientId = process.env.NICE_CLIENT_ID;
    const accessToken = process.env.NICE_ACCESS_TOKEN;
    const productId = process.env.NICE_PRODUCT_ID;

    const { searchParams } = new URL(request.url);
    const body =
      request.method === 'POST' ? await request.json().catch(() => ({})) : {};

    const returnUrl =
      searchParams.get('returnUrl') ?? (body as Record<string, string>).returnUrl;

    if (!clientId || !accessToken || !productId) {
      return NextResponse.json(
        { error: 'NICE 환경변수가 부족합니다.' },
        { status: 500 }
      );
    }

    if (!returnUrl) {
      return NextResponse.json(
        { error: 'returnUrl이 누락되었습니다.' },
        { status: 400 }
      );
    }

    const niceAuthHandler = new NiceAuthHandler(clientId, accessToken, productId);
    const nowDate = new Date();
    const reqDtim = niceAuthHandler.formatDate(nowDate);
    const currentTimestamp = Math.floor(nowDate.getTime() / 1000);
    const reqNo = uuidv4().replace(/-/g, '').substring(0, 30);

    const { siteCode, tokenVal, tokenVersionId } =
      await niceAuthHandler.getEncryptionToken(reqDtim, currentTimestamp, reqNo);

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

    return response;
  } catch (error: unknown) {
    console.error('[reset-password nice token] error', error);
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


