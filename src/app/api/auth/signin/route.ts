import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    console.log('=== 로그인 시도 ===');
    console.log('입력된 아이디(이메일):', username);
    console.log('입력된 비밀번호:', password);

    // 필수 필드 검증
    if (!username || !password) {
      console.log('필수 필드 누락');
      return NextResponse.json(
        { success: false, error: '아이디와 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 사용자 조회 (Service Role Key 사용)
    console.log('DB에서 사용자 조회 중...');
    const { data: user, error: fetchError } = await supabaseAdmin
      .from('user_auth')
      .select(
        'id, username, email, name, phone, password, is_active, is_verified'
      )
      .eq('email', username) // username 대신 email로 조회
      .single();

    if (fetchError) {
      console.log('사용자 조회 에러:', fetchError);
      return NextResponse.json(
        { success: false, error: '아이디 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    if (!user) {
      console.log('사용자를 찾을 수 없음');
      return NextResponse.json(
        { success: false, error: '아이디 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    console.log('=== 사용자 정보 ===');
    console.log('사용자 ID:', user.id);
    console.log('사용자명:', user.username);
    console.log('이메일:', user.email);
    console.log('이름:', user.name);
    console.log('전화번호:', user.phone);
    console.log('저장된 비밀번호:', user.password);
    console.log('계정 활성화:', user.is_active);

    // 계정 활성화 확인
    if (!user.is_active) {
      console.log('계정이 비활성화됨');
      return NextResponse.json(
        { success: false, error: '비활성화된 계정입니다.' },
        { status: 401 }
      );
    }

    // 비밀번호 확인 (평문 비교)
    console.log('=== 비밀번호 비교 ===');
    console.log('저장된 비밀번호:', user.password);
    console.log('입력된 비밀번호:', password);
    console.log('비밀번호 일치:', user.password === password);
    console.log('저장된 비밀번호 길이:', user.password?.length);
    console.log('입력된 비밀번호 길이:', password?.length);

    if (user.password !== password) {
      console.log('비밀번호 불일치');
      return NextResponse.json(
        { success: false, error: '아이디 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    console.log('로그인 성공!');

    // 마지막 로그인 시간 업데이트
    await supabaseAdmin
      .from('user_auth')
      .update({
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    return NextResponse.json({
      success: true,
      message: '로그인이 완료되었습니다.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        phone: user.phone,
        is_verified: user.is_verified,
      },
    });
  } catch (error) {
    console.error('로그인 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
