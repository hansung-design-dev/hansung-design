import { NextRequest, NextResponse } from 'next/server';
import { NiceAuthHandler } from '@/src/lib/NiceAuthHandler';
import { v4 as uuidv4 } from 'uuid';
import { saveNiceKey } from '@/src/lib/niceAuthKeyStore';
import { getNiceAccessToken } from '@/src/lib/niceAccessToken';
import { logNiceEnvDebug } from '@/src/lib/niceDebug';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
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

    return NextResponse.json({
      tokenVersionId: tokenVersionId,
      encData,
      integrityValue,
      requestno,
    });
  } catch (error: unknown) {
    console.error('[Nice auth] error', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
