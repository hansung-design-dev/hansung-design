import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('=== 마이그레이션 시작 ===');

    // 1. 현재 customer_service 테이블 상태 확인
    const { data: currentData, error: currentError } = await supabase
      .from('customer_service')
      .select('*');

    console.log('현재 customer_service 데이터 개수:', currentData?.length || 0);
    console.log('현재 데이터 에러:', currentError);

    // 2. 마이그레이션 SQL 실행
    const migrationSteps = [
      // 테이블명 변경
      'ALTER TABLE customer_service RENAME TO frequent_questions;',

      // 외래키 제약조건 제거
      'ALTER TABLE frequent_questions DROP CONSTRAINT IF EXISTS customer_service_homepage_menu_type_fkey;',
      'ALTER TABLE frequent_questions DROP CONSTRAINT IF EXISTS customer_service_user_id_fkey;',

      // user_id 컬럼 제거
      'ALTER TABLE frequent_questions DROP COLUMN IF EXISTS user_id;',

      // homepage_menu_type을 display_type_id로 변경
      'ALTER TABLE frequent_questions RENAME COLUMN homepage_menu_type TO display_type_id;',

      // cs_categories 컬럼 제거
      'ALTER TABLE frequent_questions DROP COLUMN IF EXISTS cs_categories;',

      // status 기본값 변경
      "ALTER TABLE frequent_questions ALTER COLUMN status SET DEFAULT 'active';",

      // answered를 active로 변경
      "UPDATE frequent_questions SET status = 'active' WHERE status = 'answered';",
    ];

    for (const step of migrationSteps) {
      console.log('실행 중:', step);
      const { error } = await supabase.rpc('exec_sql', { sql: step });
      if (error) {
        console.error('마이그레이션 단계 오류:', error);
        return NextResponse.json(
          { error: '마이그레이션 중 오류가 발생했습니다.', details: error },
          { status: 500 }
        );
      }
    }

    // 3. 마이그레이션 후 상태 확인
    const { data: migratedData, error: migratedError } = await supabase
      .from('frequent_questions')
      .select('*');

    console.log(
      '마이그레이션 후 frequent_questions 데이터 개수:',
      migratedData?.length || 0
    );
    console.log('마이그레이션 후 에러:', migratedError);

    return NextResponse.json({
      success: true,
      message: '마이그레이션이 성공적으로 완료되었습니다.',
      beforeCount: currentData?.length || 0,
      afterCount: migratedData?.length || 0,
      migratedData: migratedData,
    });
  } catch (error) {
    console.error('마이그레이션 중 예외 발생:', error);
    return NextResponse.json(
      { error: '마이그레이션 중 서버 오류가 발생했습니다.', details: error },
      { status: 500 }
    );
  }
}
