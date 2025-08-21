import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('=== frequent_questions 테이블 디버깅 ===');

    // 1. frequent_questions 테이블 존재 여부 확인
    const { data: tableExists, error: tableError } = await supabase
      .from('frequent_questions')
      .select('*')
      .limit(1);

    console.log('테이블 존재 여부:', tableExists !== null);
    console.log('테이블 에러:', tableError);

    // 2. 전체 데이터 조회
    const { data: allData, error: allError } = await supabase
      .from('frequent_questions')
      .select('*');

    console.log('전체 데이터 개수:', allData?.length || 0);
    console.log('전체 데이터 에러:', allError);

    // 3. answered 상태만 조회
    const { data: answeredData, error: answeredError } = await supabase
      .from('frequent_questions')
      .select('*')
      .eq('status', 'answered');

    console.log('answered 데이터 개수:', answeredData?.length || 0);
    console.log('answered 데이터 에러:', answeredError);

    // 4. frequent_questions 카테고리만 조회
    const { data: faqData, error: faqError } = await supabase
      .from('frequent_questions')
      .select('*')
      .eq('cs_categories', 'frequent_questions');

    console.log(
      'frequent_questions 카테고리 데이터 개수:',
      faqData?.length || 0
    );
    console.log('frequent_questions 카테고리 에러:', faqError);

    // 5. 데이터 구조 확인 (첫 번째 레코드)
    const { data: sampleData, error: sampleError } = await supabase
      .from('frequent_questions')
      .select('*')
      .limit(1);

    console.log('샘플 데이터 구조:', sampleData);
    console.log('샘플 데이터 에러:', sampleError);

    // 6. homepage_menu_types와의 조인 테스트
    const { data: joinData, error: joinError } = await supabase
      .from('frequent_questions')
      .select(
        `
        id,
        title,
        content,
        status,
        answer,
        homepage_menu_type,
        homepage_menu_types!inner(name)
      `
      )
      .eq('status', 'answered')
      .eq('cs_categories', 'frequent_questions')
      .limit(1);

    console.log('조인 데이터:', joinData);
    console.log('조인 에러:', joinError);

    // 7. homepage_menu_types 테이블 확인
    const { data: menuTypes, error: menuTypesError } = await supabase
      .from('homepage_menu_types')
      .select('*');

    console.log('homepage_menu_types 데이터:', menuTypes);
    console.log('homepage_menu_types 에러:', menuTypesError);

    return NextResponse.json({
      tableExists: tableExists !== null,
      allDataCount: allData?.length || 0,
      answeredDataCount: answeredData?.length || 0,
      faqDataCount: faqData?.length || 0,
      sampleData: sampleData,
      joinData: joinData,
      menuTypes: menuTypes,
      errors: {
        tableError,
        allError,
        answeredError,
        faqError,
        sampleError,
        joinError,
        menuTypesError,
      },
    });
  } catch (error) {
    console.error('디버깅 중 예외 발생:', error);
    return NextResponse.json(
      { error: '디버깅 중 서버 오류가 발생했습니다.', details: error },
      { status: 500 }
    );
  }
}
