import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/src/lib/supabase';
import { assertValidPhoneVerificationReference } from '@/src/lib/phoneVerification';
import { normalizePhone } from '@/src/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🔍 회원가입 요청 데이터:', body);

    const {
      email,
      password,
      name,
      username,
      phone,
      agreements,
      phoneVerificationReference,
    } = body;

    console.log('🔍 필수 필드 검증:', {
      email: !!email,
      password: !!password,
      name: !!name,
      username: !!username,
      phone: !!phone,
      agreements: agreements,
    });

    // 필수 필드 검증
    if (!email || !password || !name || !username || !phone) {
      console.log('🔍 필수 필드 누락:', {
        email: !!email,
        password: !!password,
        name: !!name,
        username: !!username,
        phone: !!phone,
      });
      return NextResponse.json(
        { success: false, error: '모든 필수 정보를 입력해주세요.' },
        { status: 400 }
      );
    }

    console.log('🔍 약관 동의 확인:', {
      terms: agreements?.terms,
      privacy: agreements?.privacy,
      collection: agreements?.collection,
      thirdParty: agreements?.thirdParty,
    });

    // 약관 동의 확인
    if (
      !agreements?.terms ||
      !agreements?.privacy ||
      !agreements?.collection ||
      !agreements?.thirdParty
    ) {
      console.log('🔍 약관 동의 누락');
      return NextResponse.json(
        { success: false, error: '모든 필수 약관에 동의해주세요.' },
        { status: 400 }
      );
    }

    if (!phoneVerificationReference) {
      console.log('🔍 휴대폰 인증 누락');
      return NextResponse.json(
        { success: false, error: '휴대폰 인증을 완료해주세요.' },
        { status: 400 }
      );
    }

    // 휴대폰 인증 reference 검증 (유효기간/번호/목적)
    try {
      await assertValidPhoneVerificationReference({
        reference: phoneVerificationReference,
        phone,
        purpose: 'signup',
      });
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : '휴대폰 인증 검증에 실패했습니다.';
      return NextResponse.json({ success: false, error: msg }, { status: 400 });
    }

    const normalizedPhone = normalizePhone(phone);

    // 1) (선택) Supabase Auth 가입 시도
    // NOTE: 현재 서비스는 user_auth 테이블 기반으로 로그인/권한을 처리하고 있어
    // Supabase Auth signUp 실패가 전체 회원가입을 막지 않도록 "best-effort"로 처리한다.
    // (배포 환경에서 email_address_invalid 등으로 자주 실패하는 케이스 대응)
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            username,
            phone: normalizedPhone,
          },
        },
      });

      if (signUpError) {
        console.warn('[signup] Supabase Auth signUp failed (ignored)', {
          message: signUpError.message,
          code: (signUpError as { code?: string } | null)?.code,
          status: (signUpError as { status?: number } | null)?.status,
        });
      }
    } catch (e) {
      console.warn('[signup] Supabase Auth signUp threw (ignored)', e);
    }

    // 2) 기존처럼 user_auth 테이블에 프로필/약관 정보 저장
    const { data: user, error: createError } = await supabaseAdmin
      .from('user_auth')
      .insert({
        username,
        email,
        password, // 현재 스키마 유지: 평문 저장 (나중에 제거 예정)
        name,
        phone: normalizedPhone,
        terms_agreed: agreements.terms,
        privacy_agreed: agreements.privacy,
        collection_agreed: agreements.collection,
        third_party_agreed: agreements.thirdParty,
        agreed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_verified: true,
      })
      .select()
      .single();

    if (createError) {
      console.error('User creation error:', createError);

      // 중복 에러 처리 (username/email UNIQUE)
      if (createError.code === '23505') {
        if (createError.message.includes('username')) {
          return NextResponse.json(
            { success: false, error: '이미 사용 중인 아이디입니다.' },
            { status: 400 }
          );
        }
        if (createError.message.includes('email')) {
          return NextResponse.json(
            { success: false, error: '이미 사용 중인 이메일입니다.' },
            { status: 400 }
          );
        }
      }

      return NextResponse.json(
        { success: false, error: '회원가입에 실패했습니다.' },
        { status: 500 }
      );
    }

    // phone_verifications 레코드에 user_auth_id 연결 (테이블 확인/추적용)
    // NOTE: NICE 콜백 시점엔 user_auth_id를 모르기 때문에 여기서 backfill 한다.
    try {
      await supabaseAdmin
        .from('phone_verifications')
        .update({ user_auth_id: user.id })
        .eq('id', phoneVerificationReference);
    } catch (e) {
      console.warn(
        '[signup] failed to link phone_verification to user_auth',
        e
      );
    }

    // 기본프로필 자동 생성 + 인증완료 상태 저장
    // - 회원가입 시 휴대폰 인증(purpose=signup)이 필수이므로, 기본프로필은 인증완료로 시작해야 UX가 맞다.
    // - 주문/시안 등에서 user_profile_id를 참조하므로, 기본프로필은 가능한 한 일관되게 존재하도록 한다.
    const nowIso = new Date().toISOString();
    try {
      const { data: existingDefault } = await supabaseAdmin
        .from('user_profiles')
        .select('id')
        .eq('user_auth_id', user.id)
        .eq('is_default', true)
        .maybeSingle();

      if (!existingDefault?.id) {
        // 최신 스키마(is_phone_verified, phone_verified_at) 우선 시도
        const insertPayload = {
          user_auth_id: user.id,
          profile_title: '기본 프로필',
          company_name: null,
          business_registration_file: null,
          phone: normalizedPhone,
          email,
          contact_person_name: name,
          fax_number: null,
          is_default: true,
          is_public_institution: false,
          is_company: false,
          is_approved: false,
          created_at: nowIso,
          updated_at: nowIso,
          is_phone_verified: true,
          phone_verified_at: nowIso,
        };

        let createdProfile = await supabaseAdmin
          .from('user_profiles')
          .insert(insertPayload)
          .select('id')
          .single();

        // 컬럼이 아직 없는 DB(마이그레이션 미적용) 대비 fallback
        if (
          createdProfile.error &&
          createdProfile.error.message?.includes('is_phone_verified')
        ) {
          const fallbackPayload = {
            ...(insertPayload as Record<string, unknown>),
          };
          delete fallbackPayload.is_phone_verified;
          delete fallbackPayload.phone_verified_at;
          createdProfile = await supabaseAdmin
            .from('user_profiles')
            .insert(fallbackPayload)
            .select('id')
            .single();
        }

        const createdProfileId = createdProfile.data?.id;
        if (createdProfileId) {
          // phone_verifications 레코드에도 user_profile_id까지 연결(추적용)
          try {
            await supabaseAdmin
              .from('phone_verifications')
              .update({ user_profile_id: createdProfileId })
              .eq('id', phoneVerificationReference);
          } catch (e) {
            console.warn(
              '[signup] failed to link phone_verification to user_profile',
              e
            );
          }
        } else if (createdProfile.error) {
          console.warn('[signup] failed to create default user_profile', {
            message: createdProfile.error.message,
            code: createdProfile.error.code,
          });
        }
      }
    } catch (e) {
      console.warn('[signup] default profile ensure failed', e);
    }

    return NextResponse.json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Signup API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
