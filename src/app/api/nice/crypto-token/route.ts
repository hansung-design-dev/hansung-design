import { NextRequest, NextResponse } from 'next/server';
import { NiceAuthHandler } from '@/src/lib/NiceAuthHandler';
import { saveNiceKey } from '@/src/lib/niceAuthKeyStore';
import { v4 as uuidv4 } from 'uuid';
import { getNiceAccessToken } from '@/src/lib/niceAccessToken';
import { logNiceEnvDebug } from '@/src/lib/niceDebug';

export const runtime = 'nodejs';

const COOKIE_PREFIX = 'nice_crypto_token_key_';

export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}

const handleRequest = async (request: NextRequest) => {
  try {
    const clientId = process.env.NICE_CLIENT_ID;
    const accessToken = await getNiceAccessToken().catch(() => null);
    const productId = process.env.NICE_PRODUCT_ID;
    const registeredReturnUrl = process.env.NICE_CONSOLE_RETURN_URL;

    const { searchParams } = new URL(request.url);
    const body =
      request.method === 'POST' ? await request.json().catch(() => ({})) : {};
    const returnUrl =
      searchParams.get('returnUrl') ??
      (body as Record<string, string>).returnUrl;
    const cancelUrl =
      searchParams.get('cancelUrl') ??
      (body as Record<string, string>).cancelUrl;
    void cancelUrl;

    if (!returnUrl) {
      return NextResponse.json(
        { success: false, error: 'returnUrl을 포함하여 호출해주세요.' },
        { status: 400 }
      );
    }

    // 배포 환경에서 env/returnUrl이 실제로 어떻게 읽히는지 확인용(민감정보 마스킹)
    logNiceEnvDebug({
      scope: 'api/nice/crypto-token',
      clientId,
      productId,
      accessToken,
      returnUrl,
      registeredReturnUrl,
    });

    if (!clientId || !productId) {
      return NextResponse.json(
        { success: false, error: 'NICE 환경변수가 부족합니다.' },
        { status: 500 }
      );
    }

    // 기존 NicePay(generateCryptoToken) 의존성을 제거하고,
    // NiceAuthHandler 기반으로 enc_data/token_version_id/integrity_value 를 직접 생성한다.
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

    // 콜백 복호화를 위해 대칭키 저장(+ dev fallback 쿠키)
    saveNiceKey(tokenVersionId, key, iv, hmacKey);

    const tokenPayload = {
      enc_data: encData,
      token_version_id: tokenVersionId,
      integrity_value: integrityValue,
    };

    const response = NextResponse.json({
      success: true,
      data: tokenPayload,
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
  } catch (error) {
    console.error('Nice crypto token API error:', error);
    const message =
      error instanceof Error ? error.message : '토큰 발급에 실패했습니다.';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
};
