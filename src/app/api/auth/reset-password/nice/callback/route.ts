import { NextRequest, NextResponse } from 'next/server';
import { NiceAuthHandler } from '@/src/lib/NiceAuthHandler';
import { loadNiceKey, saveNiceKey } from '@/src/lib/niceAuthKeyStore';
import {
  issuePhoneVerificationReference,
  type PhoneVerificationPurpose,
} from '@/src/lib/phoneVerification';
import { normalizePhone } from '@/src/lib/utils';

export const runtime = 'nodejs';

const COOKIE_PREFIX = 'nice_reset_pw_key_';

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
  enc_data: string | null;
  token_version_id: string | null;
  integrity_value: string | null;
  source: 'GET' | 'POST';
}) {
  const { request, enc_data, token_version_id, integrity_value } = params;

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
  const phoneRaw = extractPhoneFromNice(decData as Record<string, unknown>);
  const phone = phoneRaw ? normalizePhone(phoneRaw) : '';

  const redirectUrl = new URL('/reset-password/nice/certify', request.url);
  if (reqNo) redirectUrl.searchParams.set('reqNo', String(reqNo));

  // reset-password 목적의 phoneVerificationReference 발급(성공으로 간주되는 경우)
  if (phone) {
    try {
      const issued = await issuePhoneVerificationReference({
        phone,
        purpose: 'reset_password' as PhoneVerificationPurpose,
        requestno: typeof reqNo === 'string' ? reqNo : null,
      });
      redirectUrl.searchParams.set('phone', issued.phone);
      redirectUrl.searchParams.set(
        'phoneVerificationReference',
        issued.verificationId
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : '인증 reference 발급 실패';
      console.error('[reset-password nice callback] issue ref error', msg);
      redirectUrl.searchParams.set('error', msg);
    }
  } else {
    redirectUrl.searchParams.set(
      'error',
      '인증된 휴대폰 번호를 확인할 수 없습니다.'
    );
  }

  // 블로그 예제 흐름과 동일하게 302
  return NextResponse.redirect(redirectUrl, 302);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const enc_data = searchParams.get('enc_data');
  const token_version_id = searchParams.get('token_version_id');
  const integrity_value = searchParams.get('integrity_value');

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
    console.error('[reset-password nice callback POST] error', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to handle nice callback',
      },
      { status: 500 }
    );
  }
}


