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

    const { data: profiles, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_auth_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('프로필 조회 에러:', error);
      return NextResponse.json(
        { success: false, error: '프로필 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

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
