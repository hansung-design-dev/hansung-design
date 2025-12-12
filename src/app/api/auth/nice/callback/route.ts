import { NextRequest, NextResponse } from 'next/server';
import { NiceAuthHandler } from '@/src/lib/NiceAuthHandler';
import { loadNiceKey } from '@/src/lib/niceAuthKeyStore';

export const runtime = 'nodejs';

async function handleCallback(params: {
  request: NextRequest;
  encData: string | null;
  tokenVersionId: string | null;
  integrityValue: string | null;
  source: 'GET' | 'POST';
}) {
  const { request, encData, tokenVersionId, integrityValue, source } = params;

  console.log(`[Nice callback ${source}] begin`, {
    method: request.method,
    contentType: request.headers.get('content-type'),
    hasEncData: Boolean(encData),
    hasTokenVersionId: Boolean(tokenVersionId),
    hasIntegrityValue: Boolean(integrityValue),
    encDataLen: encData?.length ?? 0,
  });

  if (!encData || !tokenVersionId) {
    return NextResponse.json(
      { error: 'enc_data 또는 token_version_id가 누락되었습니다.' },
      { status: 400 }
    );
  }

  const keys = loadNiceKey(tokenVersionId);
  if (!keys) {
    return NextResponse.json(
      {
        error:
          '세션에서 대칭키를 찾을 수 없습니다. (token_version_id로 저장/조회되는지 확인)',
      },
      { status: 400 }
    );
  }

  // 무결성 검증(HMAC) - 실패 시 바로 중단
  if (integrityValue) {
    const niceAuthHandlerForHmac = new NiceAuthHandler(
      process.env.NICE_CLIENT_ID ?? '',
      process.env.NICE_ACCESS_TOKEN ?? '',
      process.env.NICE_PRODUCT_ID ?? ''
    );
    const computed = niceAuthHandlerForHmac.hmac256(encData, keys.hmacKey);
    const ok = computed === integrityValue;
    console.log(`[Nice callback ${source}] integrity`, {
      ok,
      computedSample: computed.slice(0, 12),
      receivedSample: integrityValue.slice(0, 12),
    });
    if (!ok) {
      return NextResponse.json(
        { error: '무결성(integrity_value) 검증에 실패했습니다.' },
        { status: 400 }
      );
    }
  } else {
    console.warn(`[Nice callback ${source}] integrity_value is missing`);
  }

  const niceAuthHandler = new NiceAuthHandler(
    process.env.NICE_CLIENT_ID ?? '',
    process.env.NICE_ACCESS_TOKEN ?? '',
    process.env.NICE_PRODUCT_ID ?? ''
  );

  const decData = niceAuthHandler.decryptData(encData, keys.key, keys.iv);
  const requestno = decData?.requestno;
  const resultcode = decData?.resultcode ?? '0000';

  console.log(`[Nice callback ${source}] decrypted`, {
    resultcode,
    requestno,
  });

  const redirectUrl = new URL('/auth/nice/result', request.url);
  redirectUrl.searchParams.set('resultcode', resultcode);
  if (requestno) redirectUrl.searchParams.set('requestno', requestno);

  // POST callback -> 결과 페이지는 GET으로 전환 (303)
  return NextResponse.redirect(redirectUrl, 303);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const encData = searchParams.get('enc_data');
  const tokenVersionId = searchParams.get('token_version_id');
  const integrityValue = searchParams.get('integrity_value');

  // GET 콜백이 아닌 단순 접근이면 안내만
  if (!encData && !tokenVersionId && !integrityValue) {
    return NextResponse.json(
      { message: 'NICE 콜백은 보통 POST(form-data)로 호출됩니다.' },
      { status: 200 }
    );
  }

  return handleCallback({
    request,
    encData,
    tokenVersionId,
    integrityValue,
    source: 'GET',
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const encData = formData.get('enc_data')?.toString();
    const tokenVersionId = formData.get('token_version_id')?.toString();
    const integrityValue = formData.get('integrity_value')?.toString();

    return handleCallback({
      request,
      encData: encData ?? null,
      tokenVersionId: tokenVersionId ?? null,
      integrityValue: integrityValue ?? null,
      source: 'POST',
    });
  } catch (error: unknown) {
    console.error('[Nice callback POST] error', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to handle nice callback',
      },
      { status: 500 }
    );
  }
}
