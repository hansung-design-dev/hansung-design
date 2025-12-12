import { NextRequest, NextResponse } from 'next/server';
import { NiceAuthHandler } from '@/src/lib/NiceAuthHandler';
import { v4 as uuidv4 } from 'uuid';
import { saveNiceKey } from '@/src/lib/niceAuthKeyStore';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.NICE_CLIENT_ID;
    const clientSecret = process.env.NICE_CLIENT_SECRET;
    const accessToken = process.env.NICE_ACCESS_TOKEN;
    const productId = process.env.NICE_PRODUCT_ID;
    const returnUrl = process.env.NICE_RETURN_URL;
    const defaultReturnPath = '/api/auth/nice/callback';
    const resolvedReturnUrl = returnUrl?.trim()
      ? returnUrl.trim()
      : defaultReturnPath;

    const absoluteReturnUrl = (() => {
      // 1) 상대경로면 현재 요청 origin 기준으로 절대 URL 생성 (http/https 자동 정렬)
      if (resolvedReturnUrl.startsWith('/')) {
        return new URL(resolvedReturnUrl, request.nextUrl.origin).toString();
      }

      // 2) 절대 URL인데, 현재 요청의 프로토콜/호스트와 다르면(예: http로 띄웠는데 env는 https)
      //    현재 origin 기준으로 path/query만 유지해서 다시 만들어준다.
      try {
        const envUrl = new URL(resolvedReturnUrl);
        const originUrl = new URL(request.nextUrl.origin);
        if (envUrl.origin !== originUrl.origin) {
          const rebuilt = new URL(
            envUrl.pathname + envUrl.search + envUrl.hash,
            originUrl.origin
          );
          return rebuilt.toString();
        }
        return envUrl.toString();
      } catch {
        // 3) 파싱 불가하면(잘못된 값) default path로 처리
        return new URL(defaultReturnPath, request.nextUrl.origin).toString();
      }
    })();

    const purpose = request.nextUrl.searchParams.get('purpose')?.trim() || '';
    const finalReturnUrl = (() => {
      try {
        const u = new URL(absoluteReturnUrl);
        if (purpose) u.searchParams.set('purpose', purpose);
        return u.toString();
      } catch {
        return absoluteReturnUrl;
      }
    })();
    if (
      !clientId ||
      !clientSecret ||
      !accessToken ||
      !productId ||
      !finalReturnUrl
    ) {
      return NextResponse.json(
        { error: 'NICE 환경변수가 부족합니다.' },
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
    const methodtype = finalReturnUrl.startsWith('https://') ? 'post' : 'get';
    const requestPayload = {
      requestno,
      returnurl: finalReturnUrl,
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
      tokenVersionId: tokenVersionId,
      encData,
      integrityValue,
      requestno,
    });

    // dev/테스트용 fallback (HMR/재기동 시 in-memory store 유실 대비)
    response.cookies.set({
      name: `nice_auth_key_${tokenVersionId}`,
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
    console.error('[Nice auth] error', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
