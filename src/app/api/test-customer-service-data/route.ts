import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('=== customer_service 데이터 테스트 ===');

    // 1. customer_service 테이블 존재 여부 확인
    const { data: tableExists, error: tableError } = await supabase
      .from('customer_service')
      .select('count(*)')
      .limit(1);

    console.log('테이블 존재 여부:', tableExists !== null);
    console.log('테이블 에러:', tableError);

    // 2. 전체 데이터 조회
    const { data: allData, error: allError } = await supabase
      .from('customer_service')
      .select('*');

    console.log('전체 데이터 개수:', allData?.length || 0);
    console.log('전체 데이터 에러:', allError);

    // 3. frequent_questions 카테고리만 조회
    const { data: faqData, error: faqError } = await supabase
      .from('customer_service')
      .select('*')
      .eq('cs_categories', 'frequent_questions');

    console.log('FAQ 데이터 개수:', faqData?.length || 0);
    console.log('FAQ 데이터 에러:', faqError);

    // 4. answered 상태만 조회
    const { data: answeredData, error: answeredError } = await supabase
      .from('customer_service')
      .select('*')
      .eq('status', 'answered');

    console.log('answered 데이터 개수:', answeredData?.length || 0);
    console.log('answered 데이터 에러:', answeredError);

    // 5. 실제 데이터 샘플
    const { data: sampleData, error: sampleError } = await supabase
      .from('customer_service')
      .select('id, title, status, cs_categories')
      .limit(5);

    console.log('샘플 데이터:', sampleData);
    console.log('샘플 데이터 에러:', sampleError);

    return NextResponse.json({
      tableExists: tableExists !== null,
      allDataCount: allData?.length || 0,
      faqDataCount: faqData?.length || 0,
      answeredDataCount: answeredData?.length || 0,
      sampleData: sampleData,
      errors: {
        tableError,
        allError,
        faqError,
        answeredError,
        sampleError,
      },
    });
  } catch (error) {
    console.error('테스트 중 예외 발생:', error);
    return NextResponse.json(
      { error: '테스트 중 서버 오류가 발생했습니다.', details: error },
      { status: 500 }
    );
  }
}
