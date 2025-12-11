import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
      const { data: currentProfile } = await supabase
        .from('user_profiles')
        .select('user_auth_id')
        .eq('id', id)
        .single();

      if (currentProfile) {
        await supabase
          .from('user_profiles')
          .update({ is_default: false })
          .eq('user_auth_id', currentProfile.user_auth_id)
          .eq('is_default', true);
      }
    }

    // 프로필 수정
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .update({
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
        updated_at: new Date().toISOString(),
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

    return NextResponse.json({
      success: true,
      data: profile,
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

    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', id);

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
