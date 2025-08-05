import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET() {
  try {
    console.log('=== 데이터베이스 연결 테스트 ===');

    // 1. 기본 연결 테스트
    const { data: testData, error: testError } = await supabase
      .from('panels')
      .select('id')
      .limit(1);

    console.log('연결 테스트 결과:', { testData, testError });

    // 2. user_auth 테이블 존재 확인
    const { data: userAuthData, error: userAuthError } = await supabase
      .from('user_auth')
      .select('id')
      .limit(1);

    console.log('user_auth 테이블 확인:', { userAuthData, userAuthError });

    // 3. 다른 테이블들 확인
    const tables = ['panels', 'orders', 'customer_service', 'region_gu'];
    const tableResults: Record<string, { data: unknown; error: unknown }> = {};

    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('id').limit(1);

      tableResults[table] = { data, error };
    }

    console.log('다른 테이블들 확인:', tableResults);

    return NextResponse.json({
      success: true,
      connectionTest: { testData, testError },
      userAuthTable: { userAuthData, userAuthError },
      otherTables: tableResults,
    });
  } catch (error) {
    console.error('데이터베이스 테스트 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
