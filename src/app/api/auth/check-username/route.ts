import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { success: false, error: '아이디를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 아이디 형식 검증 (영문, 숫자, -, _ 조합, 최소 4글자)
    const usernameRegex = /^[a-zA-Z0-9_-]{4,}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        {
          success: false,
          error: '영문, 숫자, -, _ 조합으로 최소 4글자 이상 입력해주세요.',
        },
        { status: 400 }
      );
    }

    // 아이디 중복 확인
    const { data: existingUser, error } = await supabase
      .from('user_auth')
      .select('id')
      .eq('username', username)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116는 결과가 없을 때의 에러 코드
      console.error('Username check error:', error);
      return NextResponse.json(
        { success: false, error: '중복확인 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: '이미 사용 중인 아이디입니다.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '사용 가능한 아이디입니다.',
    });
  } catch (error) {
    console.error('Username check API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
