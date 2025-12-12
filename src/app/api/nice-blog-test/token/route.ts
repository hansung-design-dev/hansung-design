import { NextRequest, NextResponse } from 'next/server';
import { NiceAuthHandler } from '@/src/lib/NiceAuthHandler';
import { saveNiceKey } from '@/src/lib/niceAuthKeyStore';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';

const COOKIE_PREFIX = 'nice_blog_test_key_';

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


