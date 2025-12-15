import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { assertValidPhoneVerificationReference } from '@/src/lib/phoneVerification';
import { normalizePhone } from '@/src/lib/utils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// 프로필 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('🔍 [API] user-profiles GET 요청:', {
      userId,
      userIdType: typeof userId,
      userIdLength: userId?.length,
    });

    // 전체 프로필 조회
    // NOTE: 소프트 삭제(archived_at) 지원. 아직 DB 마이그레이션이 적용되지 않은 환경에서는
    // archived_at 컬럼이 없어도 동작하도록 fallback 처리한다.
    const runProfilesQuery = async (useArchivedFilter: boolean) => {
      let q = supabase
        .from('user_profiles')
        .select('*')
        .eq('user_auth_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });
      if (useArchivedFilter) q = q.is('archived_at', null);
      return await q;
    };

    let profilesQuery = await runProfilesQuery(true);
    if (
      profilesQuery.error &&
      profilesQuery.error.message?.includes('archived_at')
    ) {
      // column missing -> rerun without filter
      profilesQuery = await runProfilesQuery(false);
    }
    const profiles = profilesQuery.data;
    const error = profilesQuery.error;

    // is_default = true인 프로필만 별도로 조회 (확인용)
    const runDefaultProfileQuery = async (useArchivedFilter: boolean) => {
      let q = supabase
        .from('user_profiles')
        .select('*')
        .eq('user_auth_id', userId)
        .eq('is_default', true);
      if (useArchivedFilter) q = q.is('archived_at', null);
      return await q.maybeSingle();
    };

    let defaultProfileQuery = await runDefaultProfileQuery(true);
    if (
      defaultProfileQuery.error &&
      defaultProfileQuery.error.message?.includes('archived_at')
    ) {
      defaultProfileQuery = await runDefaultProfileQuery(false);
    }
    const defaultProfile = defaultProfileQuery.data;
    const defaultProfileError = defaultProfileQuery.error;

    // 기본프로필 인증완료 처리:
    // - 회원가입 인증은 user_auth.is_verified에 기록되지만, 기본프로필(user_profiles)의 is_phone_verified와는 별개다.
    // - UX 일관성을 위해: 기본프로필이고, user_auth.is_verified=true이며, 휴대폰 번호가 같으면
    //   응답에서 해당 프로필을 "인증완료"로 보정한다. (DB backfill은 별도 배치/마이그레이션으로 처리 가능)
    let userAuthPhone: string | null = null;
    let userAuthIsVerified = false;
    let userAuthVerifiedAt: string | null = null;
    try {
      const userAuthQuery = await supabase
        .from('user_auth')
        .select('phone,is_verified,updated_at')
        .eq('id', userId)
        .maybeSingle();
      if (userAuthQuery.data) {
        userAuthPhone =
          typeof userAuthQuery.data.phone === 'string'
            ? userAuthQuery.data.phone
            : null;
        userAuthIsVerified = Boolean(userAuthQuery.data.is_verified);
        userAuthVerifiedAt =
          typeof userAuthQuery.data.updated_at === 'string'
            ? userAuthQuery.data.updated_at
            : null;
      }
    } catch {
      // ignore: if user_auth read is restricted by RLS, we just skip this enrichment
    }

    const normalizedUserAuthPhone = userAuthPhone
      ? normalizePhone(userAuthPhone)
      : '';
    const enrichedProfiles = (profiles || []).map((p) => {
      const isDefault = Boolean((p as { is_default?: boolean })?.is_default);
      const profilePhone = normalizePhone(String((p as { phone?: string })?.phone ?? ''));
      const inheritedVerified =
        isDefault &&
        userAuthIsVerified &&
        Boolean(normalizedUserAuthPhone) &&
        profilePhone === normalizedUserAuthPhone;

      if (!inheritedVerified) return p;

      // Only enrich fields if they exist in DB schema; otherwise keep original object.
      return {
        ...p,
        is_phone_verified: true,
        phone_verified_at:
          (p as { phone_verified_at?: string | null })?.phone_verified_at ??
          userAuthVerifiedAt ??
          null,
      };
    });

    console.log('🔍 [API] user-profiles 쿼리 결과:', {
      profilesCount: profiles?.length || 0,
      hasError: !!error,
      error: error
        ? {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          }
        : null,
      sampleProfile:
        profiles && profiles.length > 0
          ? {
              id: profiles[0].id,
              user_auth_id: profiles[0].user_auth_id,
              profile_title: profiles[0].profile_title,
              is_default: profiles[0].is_default,
            }
          : null,
      // is_default = true인 프로필 확인
      defaultProfileCheck: {
        found: !!defaultProfile,
        defaultProfileId: defaultProfile?.id,
        defaultProfileTitle: defaultProfile?.profile_title,
        hasError: !!defaultProfileError,
        error: defaultProfileError
          ? {
              message: defaultProfileError.message,
              code: defaultProfileError.code,
            }
          : null,
      },
      allProfilesWithIsDefault: profiles?.map((p) => ({
        id: p.id,
        profile_title: p.profile_title,
        is_default: p.is_default,
        user_auth_id: p.user_auth_id,
      })),
    });

    // 에러가 있으면 상세 로그
    if (error) {
      console.error('🔍 [API] 프로필 조회 에러:', error);
      return NextResponse.json(
        {
          success: false,
          error: '프로필 조회에 실패했습니다.',
          details: error.message,
        },
        { status: 500 }
      );
    }

    // 프로필이 없어도 성공으로 반환 (빈 배열)
    console.log('🔍 [API] user-profiles 응답:', {
      success: true,
      dataLength: profiles?.length || 0,
    });

    return NextResponse.json({
      success: true,
      data: enrichedProfiles,
    });
  } catch (error) {
    console.error('프로필 조회 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 새 프로필 생성
export async function POST(request: NextRequest) {
  try {
    const {
      user_auth_id,
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
    if (
      !user_auth_id ||
      !profile_title ||
      !phone ||
      !email ||
      !contact_person_name
    ) {
      return NextResponse.json(
        { success: false, error: '필수 정보를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    if (!phoneVerificationReference) {
      return NextResponse.json(
        {
          success: false,
          error: '휴대폰 인증을 완료한 후 프로필을 저장해주세요.',
        },
        { status: 400 }
      );
    }

    // 휴대폰 인증 reference 검증 (유효기간/번호/목적)
    try {
      await assertValidPhoneVerificationReference({
        reference: phoneVerificationReference,
        phone,
        purpose: 'add_profile',
      });
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : '휴대폰 인증 검증에 실패했습니다.';
      return NextResponse.json({ success: false, error: msg }, { status: 400 });
    }

    const normalizedPhone = normalizePhone(phone);
    const nowIso = new Date().toISOString();

    // 기본 프로필로 설정하는 경우, 기존 기본 프로필 해제
    if (is_default) {
      await supabase
        .from('user_profiles')
        .update({ is_default: false })
        .eq('user_auth_id', user_auth_id)
        .eq('is_default', true);
    }

    // 새 프로필 생성
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .insert({
        user_auth_id,
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
        // per-profile verified badge state
        is_phone_verified: true,
        phone_verified_at: nowIso,
      })
      .select()
      .single();

    if (error) {
      console.error('프로필 생성 에러:', error);
      return NextResponse.json(
        { success: false, error: '프로필 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 인증 reference를 해당 프로필에 연결(추적/감사 목적)
    // NOTE: phone_verifications 테이블에 user_profile_id 컬럼이 없거나 권한이 제한된 환경에서는 실패할 수 있어 무시한다.
    try {
      await supabase
        .from('phone_verifications')
        .update({
          user_auth_id,
          user_profile_id: profile.id,
        })
        .eq('id', phoneVerificationReference);
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('프로필 생성 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
