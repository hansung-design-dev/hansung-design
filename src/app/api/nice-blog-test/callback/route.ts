import { NextRequest, NextResponse } from 'next/server';
import { NiceAuthHandler } from '@/src/lib/NiceAuthHandler';
import { loadNiceKey, saveNiceKey } from '@/src/lib/niceAuthKeyStore';

export const runtime = 'nodejs';

const COOKIE_PREFIX = 'nice_blog_test_key_';

async function handleCallback(params: {
  request: NextRequest;
  enc_data: string | null;
  token_version_id: string | null;
  integrity_value: string | null;
  source: 'GET' | 'POST';
}) {
  const { request, enc_data, token_version_id, integrity_value, source } = params;

  console.log(`[nice-blog-test callback ${source}] begin`, {
    method: request.method,
    contentType: request.headers.get('content-type'),
    hasEncData: Boolean(enc_data),
    hasTokenVersionId: Boolean(token_version_id),
    hasIntegrityValue: Boolean(integrity_value),
    encDataLen: enc_data?.length ?? 0,
  });

  if (!enc_data || !token_version_id) {
    return NextResponse.json(
      { error: 'enc_data 또는 token_version_id가 누락되었습니다.' },
      { status: 400 }
    );
  }

  const keysFromStore = loadNiceKey(token_version_id);
  const keys =
    keysFromStore ??
    (() => {
      // dev/테스트: 서버 리로드로 in-memory store가 비면 쿠키에서 복구
      const raw = request.cookies.get(`${COOKIE_PREFIX}${token_version_id}`)?.value;
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw) as {
          key: string;
          iv: string;
          hmacKey: string;
          expiresAt?: number;
        };
        if (
          !parsed?.key ||
          !parsed?.iv ||
          !parsed?.hmacKey ||
          (parsed.expiresAt && Date.now() > parsed.expiresAt)
        ) {
          return null;
        }
        // store에 다시 적재
        saveNiceKey(token_version_id, parsed.key, parsed.iv, parsed.hmacKey);
        return { key: parsed.key, iv: parsed.iv, hmacKey: parsed.hmacKey };
      } catch {
        return null;
      }
    })();

  if (!keys) {
    return NextResponse.json(
      {
        error:
          '세션에서 대칭키를 찾을 수 없습니다. (token_version_id로 저장/조회되는지 확인)',
      },
      { status: 400 }
    );
  }

  const niceAuthHandler = new NiceAuthHandler(
    process.env.NICE_CLIENT_ID ?? '',
    process.env.NICE_ACCESS_TOKEN ?? '',
    process.env.NICE_PRODUCT_ID ?? ''
  );

  // 무결성 검증(HMAC) - 실패 시 중단
  if (integrity_value) {
    const computed = niceAuthHandler.hmac256(enc_data, keys.hmacKey);
    if (computed !== integrity_value) {
      return NextResponse.json(
        { error: '무결성(integrity_value) 검증에 실패했습니다.' },
        { status: 400 }
      );
    }
  }

  const decData = niceAuthHandler.decryptData(enc_data, keys.key, keys.iv);
  const reqNo = decData?.requestno;

  const redirectUrl = new URL('/nice-blog-test/certify', request.url);
  if (reqNo) redirectUrl.searchParams.set('reqNo', String(reqNo));

  // 블로그 예제: res.redirect(302, `/certify/?reqNo=...`)
  return NextResponse.redirect(redirectUrl, 302);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const enc_data = searchParams.get('enc_data');
  const token_version_id = searchParams.get('token_version_id');
  const integrity_value = searchParams.get('integrity_value');

  // 콜백이 아니라 직접 접근이면 안내만
  if (!enc_data && !token_version_id && !integrity_value) {
    return NextResponse.json(
      { message: 'NICE 콜백은 보통 POST(form-data)로 호출됩니다.' },
      { status: 200 }
    );
  }

  return handleCallback({
    request,
    enc_data,
    token_version_id,
    integrity_value,
    source: 'GET',
  });
}

export async function POST(request: NextRequest) {
  try {
    // 모바일은 body(form-data)로 들어오는 케이스가 많음 (블로그 설명과 동일)
    const formData = await request.formData();
    const enc_data = formData.get('enc_data')?.toString() ?? null;
    const token_version_id = formData.get('token_version_id')?.toString() ?? null;
    const integrity_value = formData.get('integrity_value')?.toString() ?? null;

    return handleCallback({
      request,
      enc_data,
      token_version_id,
      integrity_value,
      source: 'POST',
    });
  } catch (error: unknown) {
    console.error('[nice-blog-test callback POST] error', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to handle nice callback',
      },
      { status: 500 }
    );
  }
}


