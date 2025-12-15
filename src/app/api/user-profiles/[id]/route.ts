import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { assertValidPhoneVerificationReference } from '@/src/lib/phoneVerification';
import { normalizePhone } from '@/src/lib/utils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// 프로필 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const {
      profile_title,
      company_name,
      business_registration_file,
      phone,
      email,
      contact_person_name,
      fax_number,
      is_default = false,
      is_public_institution = false,
      is_company = false,
      phoneVerificationReference,
    } = await request.json();

    // 필수 필드 검증
    if (!profile_title || !phone || !email || !contact_person_name) {
      return NextResponse.json(
        { success: false, error: '필수 정보를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // 기존 프로필 로드 (phone 변경 여부, 승인 리셋 여부 판단)
    const { data: existing, error: existingError } = await supabase
      .from('user_profiles')
      .select(
        'id,user_auth_id,phone,is_default,is_public_institution,is_company,is_approved,business_registration_file'
      )
      .eq('id', id)
      .maybeSingle();

    if (existingError || !existing) {
      return NextResponse.json(
        { success: false, error: '프로필 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const normalizedPhone = normalizePhone(phone);
    const existingPhone = normalizePhone(String(existing.phone ?? ''));
    const isPhoneChanged =
      Boolean(existingPhone) && normalizedPhone !== existingPhone;

    const nowIso = new Date().toISOString();

    // phone이 변경되는 경우에만 인증 reference 필수
    if (isPhoneChanged) {
      if (!phoneVerificationReference) {
        return NextResponse.json(
          {
            success: false,
            error: '휴대폰 번호 변경을 위해 휴대폰 인증을 완료해주세요.',
          },
          { status: 400 }
        );
      }
      try {
        await assertValidPhoneVerificationReference({
          reference: phoneVerificationReference,
          phone: normalizedPhone,
          purpose: 'add_profile',
        });
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : '휴대폰 인증 검증에 실패했습니다.';
        return NextResponse.json({ success: false, error: msg }, { status: 400 });
      }
    }

    // 기본 프로필로 설정하는 경우, 기존 기본 프로필 해제
    if (is_default) {
      await supabase
        .from('user_profiles')
        .update({ is_default: false })
        .eq('user_auth_id', existing.user_auth_id)
        .eq('is_default', true);
    }

    // 승인 리셋 정책(보수적으로):
    // - 행정용/기업용인 경우, 유형 변경 또는 사업자등록증 변경이 있으면 다시 승인받도록 is_approved=false로 리셋
    const shouldResetApproval =
      (Boolean(is_public_institution) || Boolean(is_company)) &&
      (Boolean(existing.is_public_institution) !== Boolean(is_public_institution) ||
        Boolean(existing.is_company) !== Boolean(is_company) ||
        String(existing.business_registration_file ?? '') !==
          String(business_registration_file ?? ''));

    const nextApproved =
      shouldResetApproval ? false : Boolean(existing.is_approved);

    // 프로필 수정
    const { data: updated, error } = await supabase
      .from('user_profiles')
      .update({
        profile_title,
        company_name,
        business_registration_file,
        phone: normalizedPhone,
        email,
        contact_person_name,
        fax_number,
        is_default,
        is_public_institution,
        is_company,
        is_approved: nextApproved,
        // per-profile verified badge state:
        // - phone unchanged: keep existing values
        // - phone changed (and verified): mark verified now
        ...(isPhoneChanged
          ? { is_phone_verified: true, phone_verified_at: nowIso }
          : {}),
        updated_at: nowIso,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('프로필 수정 에러:', error);
      return NextResponse.json(
        { success: false, error: '프로필 수정에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 인증 reference를 해당 프로필에 연결(추적/감사 목적)
    if (isPhoneChanged && phoneVerificationReference) {
      try {
        await supabase
          .from('phone_verifications')
          .update({
            user_auth_id: existing.user_auth_id,
            user_profile_id: id,
          })
          .eq('id', phoneVerificationReference);
      } catch {
        // ignore
      }
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('프로필 수정 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 프로필 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 기본 프로필은 삭제 불가
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_default')
      .eq('id', id)
      .single();

    if (profile?.is_default) {
      return NextResponse.json(
        { success: false, error: '기본 프로필은 삭제할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 소프트 삭제(아카이브): FK(orders/design_drafts) 보존을 위해 row는 유지
    // NOTE: archived_at 컬럼이 아직 없는 환경에서는 fallback으로 hard delete를 시도한다.
    const archivedAt = new Date().toISOString();
    const softDeleteAttempt = await supabase
      .from('user_profiles')
      .update({ archived_at: archivedAt, updated_at: archivedAt })
      .eq('id', id);

    let error = softDeleteAttempt.error;

    if (error && error.message?.includes('archived_at')) {
      // archived_at column missing -> fallback to hard delete
      const hardDeleteAttempt = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', id);
      error = hardDeleteAttempt.error;
    }

    if (error) {
      console.error('프로필 삭제 에러:', error);
      return NextResponse.json(
        { success: false, error: '프로필 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '프로필이 삭제되었습니다.',
    });
  } catch (error) {
    console.error('프로필 삭제 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
