import { NextRequest, NextResponse } from 'next/server';
import { NiceAuthHandler } from '@/lib/NiceAuthHandler';
import { v4 as uuidv4 } from 'uuid';
import { saveNiceKey } from '@/lib/niceAuthKeyStore';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.NICE_CLIENT_ID;
    const clientSecret = process.env.NICE_CLIENT_SECRET;
    const accessToken = process.env.NICE_ACCESS_TOKEN;
    const productId = process.env.NICE_PRODUCT_ID;
    const returnUrl = process.env.NICE_RETURN_URL;

    if (
      !clientId ||
      !clientSecret ||
      !accessToken ||
      !productId ||
      !returnUrl
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

    console.log('[Nice auth] begin', {
      reqNo,
      reqDtim,
      currentTimestamp,
      clientId,
      productId,
    });
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
    const requestPayload = {
      requestno,
      returnurl: returnUrl,
      sitecode: siteCode,
      authtype: '',
      methodtype: 'get',
      popupyn: 'Y',
      receivedata: '',
    };

    const encData = niceAuthHandler.encryptData(requestPayload, key, iv);
    const integrityValue = niceAuthHandler.hmac256(encData, hmacKey);

    saveNiceKey(reqNo, key, iv, hmacKey);

    console.log('[Nice auth] response', {
      tokenVersionId,
      requestno,
      siteCode,
      encDataSample: encData.slice(0, 20),
    });

    return NextResponse.json({
      tokenVersionId: tokenVersionId,
      encData,
      integrityValue,
      requestno,
    });
  } catch (error: any) {
    console.error('[Nice auth] error', error);
    return NextResponse.json(
      { error: error?.message ?? 'Internal Server Error' },
      { status: 500 }
    );
  }
}
