import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase';

export async function POST(request: NextRequest) {
  console.log('=== 로그인 API 시작 ===');

  try {
    // Supabase 연결 확인
    console.log('환경 변수 확인 중...');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey =
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

    console.log('Supabase URL 존재:', !!supabaseUrl);
    console.log('Service Key 존재:', !!supabaseServiceKey);

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase 환경 변수가 설정되지 않았습니다.');
      return NextResponse.json(
        { success: false, error: '서버 설정 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    console.log('Supabase 클라이언트 초기화 완료');

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('요청 본문 파싱 에러:', parseError);
      return NextResponse.json(
        { success: false, error: '잘못된 요청 형식입니다.' },
        { status: 400 }
      );
    }

    const { username, password } = body;

    console.log('=== 로그인 시도 ===');
    console.log('입력된 아이디:', username);
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
    console.log('조회할 아이디(username):', username);

    try {
      const { data: user, error: fetchError } = await supabaseAdmin
        .from('user_auth')
        .select(
          'id, username, email, name, phone, password, is_active, is_verified'
        )
        .eq('username', username) // 아이디(username) 기준으로 조회
        .single();

      console.log('쿼리 결과 - 데이터:', user ? '존재' : '없음');
      console.log('쿼리 결과 - 에러:', fetchError);

      if (fetchError) {
        console.error('사용자 조회 에러 상세:', {
          message: fetchError.message,
          code: fetchError.code,
          details: fetchError.details,
          hint: fetchError.hint,
        });
        return NextResponse.json(
          {
            success: false,
            error: '아이디 또는 비밀번호가 올바르지 않습니다.',
          },
          { status: 401 }
        );
      }

      if (!user) {
        console.log('사용자를 찾을 수 없음');
        return NextResponse.json(
          {
            success: false,
            error: '아이디 또는 비밀번호가 올바르지 않습니다.',
          },
          { status: 401 }
        );
      }

      console.log('사용자 조회 성공');

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
          {
            success: false,
            error: '아이디 또는 비밀번호가 올바르지 않습니다.',
          },
          { status: 401 }
        );
      }

      console.log('로그인 성공!');

      // 마지막 로그인 시간 업데이트
      console.log('마지막 로그인 시간 업데이트 중...');
      try {
        const { error: updateError } = await supabaseAdmin
          .from('user_auth')
          .update({
            last_login: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('로그인 시간 업데이트 에러:', updateError);
          // 에러가 발생해도 로그인은 성공으로 처리
        } else {
          console.log('로그인 시간 업데이트 완료');
        }
      } catch (updateErr) {
        console.error('로그인 시간 업데이트 중 예외:', updateErr);
      }

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
    } catch (dbError) {
      console.error('데이터베이스 쿼리 중 예외 발생:', dbError);
      throw dbError; // 상위 catch로 전달
    }
  } catch (error) {
    console.error('로그인 API 에러:', error);
    console.error(
      '에러 상세:',
      error instanceof Error ? error.message : String(error)
    );
    console.error(
      '에러 스택:',
      error instanceof Error ? error.stack : 'No stack trace'
    );
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : '서버 오류가 발생했습니다.',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
