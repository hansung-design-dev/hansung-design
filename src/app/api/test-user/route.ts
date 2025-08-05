import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    console.log('=== 사용자 테스트 ===');
    console.log('조회할 이메일:', email);

    // 테이블 목록 확인 (PostgreSQL 시스템 테이블 조회)
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    console.log('=== 사용 가능한 테이블 목록 ===');
    if (tablesError) {
      console.log('테이블 목록 조회 에러:', tablesError);
    } else {
      console.log('테이블 목록:', tables?.map(t => t.table_name));
    }

    if (!email) {
      return NextResponse.json(
        { success: false, error: '이메일 파라미터가 필요합니다.' },
        { status: 400 }
      );
    }

    // 전체 사용자 조회 (디버깅용)
    const { data: allUsers, error: allUsersError } = await supabase
      .from('user_auth')
      .select('id, username, email, name, is_active');

    if (allUsersError) {
      console.log('전체 사용자 조회 에러:', allUsersError);
      return NextResponse.json(
        { success: false, error: '사용자 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    console.log('=== 전체 사용자 목록 ===');
    console.log('총 사용자 수:', allUsers?.length || 0);
    allUsers?.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}, Email: ${user.email}, Username: ${user.username}, Active: ${user.is_active}`);
    });

    // 특정 이메일로 조회
    const { data: user, error: fetchError } = await supabase
      .from('user_auth')
      .select('id, username, email, name, phone, password, is_active, is_verified')
      .eq('email', email);

    if (fetchError) {
      console.log('특정 사용자 조회 에러:', fetchError);
      return NextResponse.json(
        { success: false, error: '사용자 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    console.log('=== 특정 사용자 조회 결과 ===');
    console.log('조회된 사용자 수:', user?.length || 0);
    console.log('사용자 데이터:', user);

    return NextResponse.json({
      success: true,
      tables: tables?.map(t => t.table_name),
      allUsers: allUsers,
      targetUser: user,
      targetEmail: email,
    });
  } catch (error) {
    console.error('테스트 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 