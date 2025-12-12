import { NextRequest, NextResponse } from 'next/server';
import { NiceAuthHandler } from '@/src/lib/NiceAuthHandler';
import { loadNiceKey, saveNiceKey } from '@/src/lib/niceAuthKeyStore';
import {
  issuePhoneVerificationReference,
  type PhoneVerificationPurpose,
} from '@/src/lib/phoneVerification';
import { normalizePhone } from '@/src/lib/utils';

export const runtime = 'nodejs';

const COOKIE_PREFIX = 'nice_auth_key_';

function asPurpose(value: string | null): PhoneVerificationPurpose {
  switch ((value ?? '').trim()) {
    // 호환: 예전 클라이언트가 profile로 보내던 케이스도 add_profile로 매핑
    case 'profile':
    case 'add_profile':
      return 'add_profile';
    case 'reset_password':
      return 'reset_password';
    case 'signup':
    default:
      return 'signup';
  }
}

function extractPhoneFromNice(decData: Record<string, unknown>): string | null {
  const candidates = [
    'mobileno',
    'mobileNo',
    'mobile_no',
    'phone',
    'phoneno',
    'phoneNo',
  ];
  for (const key of candidates) {
    const value = decData?.[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

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

  const keysFromStore = loadNiceKey(tokenVersionId);
  const keys =
    keysFromStore ??
    (() => {
      const raw = request.cookies.get(`${COOKIE_PREFIX}${tokenVersionId}`)?.value;
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
        saveNiceKey(tokenVersionId, parsed.key, parsed.iv, parsed.hmacKey);
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
  const requestno = (decData as Record<string, unknown>)?.requestno;
  const resultcodeRaw = (decData as Record<string, unknown>)?.resultcode;
  const resultcode =
    typeof resultcodeRaw === 'string' && resultcodeRaw.trim()
      ? resultcodeRaw.trim()
      : '0000';

  const purpose = asPurpose(request.nextUrl.searchParams.get('purpose'));
  const phoneRaw = extractPhoneFromNice(decData as Record<string, unknown>);
  const phone = phoneRaw ? normalizePhone(phoneRaw) : '';

  console.log(`[Nice callback ${source}] decrypted`, {
    resultcode,
    requestno,
    purpose,
    hasPhone: Boolean(phone),
  });

  const redirectUrl = new URL('/auth/nice/result', request.url);
  redirectUrl.searchParams.set('resultcode', resultcode);
  if (typeof requestno === 'string' && requestno)
    redirectUrl.searchParams.set('requestno', requestno);

  // 성공이면 서버 검증 가능한 phoneVerificationReference 발급
  if (resultcode === '0000') {
    if (phone) {
      try {
        const issued = await issuePhoneVerificationReference({
          phone,
          purpose,
          requestno: typeof requestno === 'string' ? requestno : null,
        });
        redirectUrl.searchParams.set('phone', issued.phone);
        redirectUrl.searchParams.set(
          'phoneVerificationReference',
          issued.verificationId
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : '인증 reference 발급 실패';
        console.error('[Nice callback] issue reference error', msg);
        redirectUrl.searchParams.set('error', msg);
      }
    } else {
      redirectUrl.searchParams.set(
        'error',
        '인증된 휴대폰 번호를 확인할 수 없습니다.'
      );
    }
  }

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
