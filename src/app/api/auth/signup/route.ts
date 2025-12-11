import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/src/lib/supabase';

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

    // 1) Supabase Auth 기준으로 이메일/비밀번호 가입
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email,
        password,
        options: {
          data: {
            name,
            username,
            phone,
          },
        },
      }
    );

    if (signUpError) {
      console.error('Supabase Auth signUp 에러:', signUpError);

      // 이미 가입된 이메일일 때
      if (
        signUpError.message?.includes('registered') ||
        signUpError.message?.includes('already') ||
        signUpError.code === 'user_already_exists'
      ) {
        return NextResponse.json(
          { success: false, error: '이미 사용 중인 이메일입니다.' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, error: '회원가입에 실패했습니다.' },
        { status: 500 }
      );
    }

    const authUser = signUpData.user;
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: '회원가입 처리 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // 2) 기존처럼 user_auth 테이블에 프로필/약관 정보 저장
    const { data: user, error: createError } = await supabaseAdmin
      .from('user_auth')
      .insert({
        username,
        email,
        password, // 현재 스키마 유지: 평문 저장 (나중에 제거 예정)
        name,
        phone,
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
