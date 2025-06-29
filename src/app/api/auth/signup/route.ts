import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, username, phone, agreements } =
      await request.json();

    // 필수 필드 검증
    if (!email || !password || !name || !username || !phone) {
      return NextResponse.json(
        { success: false, error: '모든 필수 정보를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 약관 동의 확인
    if (
      !agreements.terms ||
      !agreements.privacy ||
      !agreements.collection ||
      !agreements.thirdParty
    ) {
      return NextResponse.json(
        { success: false, error: '모든 필수 약관에 동의해주세요.' },
        { status: 400 }
      );
    }

    // 사용자 생성 (비밀번호 평문 저장)
    const { data: user, error: createError } = await supabase
      .from('user_auth')
      .insert({
        username,
        email,
        password, // 평문으로 저장
        name,
        phone,
        terms_agreed: agreements.terms,
        privacy_agreed: agreements.privacy,
        collection_agreed: agreements.collection,
        third_party_agreed: agreements.thirdParty,
        agreed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) {
      console.error('User creation error:', createError);

      // 중복 에러 처리
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
