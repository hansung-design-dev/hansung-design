import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
    const { data: profiles, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_auth_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    // is_default = true인 프로필만 별도로 조회 (확인용)
    const { data: defaultProfile, error: defaultProfileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_auth_id', userId)
      .eq('is_default', true)
      .maybeSingle();

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
      data: profiles || [],
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
        phone,
        email,
        contact_person_name,
        fax_number,
        is_default,
        is_public_institution,
        is_company,
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
