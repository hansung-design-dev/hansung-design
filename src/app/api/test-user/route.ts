import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    console.log('=== 데이터베이스 연결 테스트 ===');

    // 환경 변수 확인
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log(
      'Supabase Key:',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '설정됨' : '설정되지 않음'
    );

    // 간단한 연결 테스트
    console.log('연결 테스트 중...');
    const { data: testData, error: testError } = await supabase
      .from('user_auth')
      .select('count')
      .limit(1);

    console.log('연결 테스트 결과:', { data: testData, error: testError });

    // 테이블 목록 확인
    console.log('테이블 목록 조회 중...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    console.log('=== 사용 가능한 테이블 목록 ===');
    if (tablesError) {
      console.log('테이블 목록 조회 에러:', tablesError);
    } else {
      console.log(
        '테이블 목록:',
        tables?.map((t) => t.table_name)
      );
    }

    // user_auth 테이블의 모든 사용자 조회
    console.log('user_auth 테이블 조회 중...');
    const { data: allUsers, error: allUsersError } = await supabase
      .from('user_auth')
      .select('*');

    if (allUsersError) {
      console.log('전체 사용자 조회 에러:', allUsersError);
      return NextResponse.json(
        {
          success: false,
          error: '사용자 조회 중 오류가 발생했습니다.',
          details: allUsersError,
        },
        { status: 500 }
      );
    }

    console.log('=== 전체 사용자 목록 ===');
    console.log('총 사용자 수:', allUsers?.length || 0);
    allUsers?.forEach((user, index) => {
      console.log(
        `${index + 1}. ID: ${user.id}, Email: ${user.email}, Username: ${
          user.username
        }, Active: ${user.is_active}`
      );
    });

    if (email) {
      // 특정 이메일로 조회
      console.log('특정 이메일 조회 중:', email);
      const { data: user, error: fetchError } = await supabase
        .from('user_auth')
        .select('*')
        .eq('email', email);

      if (fetchError) {
        console.log('특정 사용자 조회 에러:', fetchError);
        return NextResponse.json(
          {
            success: false,
            error: '사용자 조회 중 오류가 발생했습니다.',
            details: fetchError,
          },
          { status: 500 }
        );
      }

      console.log('=== 특정 사용자 조회 결과 ===');
      console.log('조회된 사용자 수:', user?.length || 0);
      console.log('사용자 데이터:', user);

      return NextResponse.json({
        success: true,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        tables: tables?.map((t) => t.table_name),
        allUsers: allUsers,
        targetUser: user,
        targetEmail: email,
        connectionTest: { data: testData, error: testError },
      });
    }

    return NextResponse.json({
      success: true,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      tables: tables?.map((t) => t.table_name),
      allUsers: allUsers,
      userCount: allUsers?.length || 0,
      connectionTest: { data: testData, error: testError },
    });
  } catch (error) {
    console.error('테스트 API 에러:', error);
    return NextResponse.json(
      {
        success: false,
        error: '서버 오류가 발생했습니다.',
        details: error,
      },
      { status: 500 }
    );
  }
}
