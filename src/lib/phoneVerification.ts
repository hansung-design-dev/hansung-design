import { supabaseAdmin } from '@/src/lib/supabase';
import { normalizePhone } from '@/src/lib/utils';

// NOTE: DB enum(phone_verification_purpose_enum)과 반드시 동일해야 함
export type PhoneVerificationPurpose =
  | 'signup'
  | 'reset_password'
  | 'add_profile';

export type PhoneVerificationRecord = {
  id: string;
  phone: string;
  purpose: string;
  requestno: string | null;
  verified_at: string;
  expires_at: string;
  revoked_at: string | null;
};

export async function issuePhoneVerificationReference(params: {
  phone: string;
  purpose: PhoneVerificationPurpose;
  requestno?: string | null;
  userAuthId?: string | null;
  userProfileId?: string | null;
  ttlMs?: number;
}) {
  const ttlMs = params.ttlMs ?? 60 * 60 * 1000; // default 1 hour
  const phone = normalizePhone(params.phone);
  const now = Date.now();
  const expiresAtIso = new Date(now + ttlMs).toISOString();

  const { data, error } = await supabaseAdmin
    .from('phone_verifications')
    .insert({
      user_auth_id: params.userAuthId ?? null,
      user_profile_id: params.userProfileId ?? null,
      phone,
      purpose: params.purpose,
      requestno: params.requestno ?? null,
      verified_at: new Date(now).toISOString(),
      expires_at: expiresAtIso,
      created_at: new Date(now).toISOString(),
      revoked_at: null,
    })
    .select()
    .single();

  if (error || !data?.id) {
    throw new Error(error?.message || '휴대폰 인증 reference 발급에 실패했습니다.');
  }

  return {
    verificationId: String(data.id),
    phone,
    verifiedAt: String(data.verified_at ?? new Date(now).toISOString()),
    expiresAt: String(data.expires_at ?? expiresAtIso),
  };
}

export async function assertValidPhoneVerificationReference(params: {
  reference: string;
  phone: string;
  purpose?: PhoneVerificationPurpose;
}) {
  const reference = params.reference;
  const phone = normalizePhone(params.phone);

  const { data, error } = await supabaseAdmin
    .from('phone_verifications')
    .select('*')
    .eq('id', reference)
    .maybeSingle();

  if (error || !data) {
    throw new Error('휴대폰 인증 정보를 확인할 수 없습니다.');
  }

  const record = data as PhoneVerificationRecord;

  if (record.revoked_at) {
    throw new Error('휴대폰 인증이 만료(폐기)되었습니다. 다시 인증해주세요.');
  }

  if (record.phone !== phone) {
    throw new Error('휴대폰 인증 번호와 입력한 번호가 일치하지 않습니다.');
  }

  if (params.purpose && record.purpose !== params.purpose) {
    throw new Error('휴대폰 인증 목적이 일치하지 않습니다. 다시 인증해주세요.');
  }

  const expiresAtMs = Date.parse(record.expires_at);
  if (!Number.isFinite(expiresAtMs) || Date.now() > expiresAtMs) {
    throw new Error('휴대폰 인증 유효기간이 만료되었습니다. 다시 인증해주세요.');
  }

  return {
    id: String(record.id),
    phone: String(record.phone),
    purpose: String(record.purpose),
    verifiedAt: String(record.verified_at),
    expiresAt: String(record.expires_at),
  };
}


