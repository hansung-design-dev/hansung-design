import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // 카테고리별 homepage_menu_type 매핑
    const categoryMapping: { [key: string]: string } = {
      디지털미디어: 'digital_signage',
      공공디자인: 'public_design',
      LED전자게시대: 'led_display',
      현수막게시대: 'banner_display',
    };

    const menuType = categoryMapping[category || ''];

    console.log('=== FAQ 디버깅 시작 ===');
    console.log('요청된 카테고리:', category);
    console.log('매핑된 메뉴 타입:', menuType);

    // 1. customer_service 테이블 전체 데이터 확인
    const { data: allCustomerService, error: allError } = await supabase
      .from('customer_service')
      .select('*');

    console.log('customer_service 테이블 전체 데이터:', allCustomerService);
    console.log('전체 데이터 개수:', allCustomerService?.length || 0);

    // 2. cs_categories가 frequent_questions인 데이터만 확인
    const { data: frequentQuestions, error: frequentError } = await supabase
      .from('customer_service')
      .select('*')
      .eq('cs_categories', 'frequent_questions');

    console.log('frequent_questions 카테고리 데이터:', frequentQuestions);
    console.log('frequent_questions 개수:', frequentQuestions?.length || 0);

    // 3. status가 answered인 데이터만 확인
    const { data: answeredData, error: answeredError } = await supabase
      .from('customer_service')
      .select('*')
      .eq('status', 'answered');

    console.log('answered 상태 데이터:', answeredData);
    console.log('answered 개수:', answeredData?.length || 0);

    // 4. homepage_menu_types 테이블 확인
    const { data: menuTypes, error: menuTypesError } = await supabase
      .from('homepage_menu_types')
      .select('*');

    console.log('homepage_menu_types 테이블:', menuTypes);

    // 5. 실제 FAQ 쿼리 실행
    let query = supabase
      .from('customer_service')
      .select(
        `
        id,
        title,
        content,
        status,
        answer,
        answered_at,
        created_at,
        homepage_menu_types!inner(name)
      `
      )
      .eq('status', 'answered')
      .eq('cs_categories', 'frequent_questions');

    if (menuType) {
      query = query.eq('homepage_menu_types.name', menuType);
    }

    const { data: faqs, error } = await query.order('created_at', {
      ascending: false,
    });

    console.log('최종 FAQ 쿼리 결과:', faqs);
    console.log('최종 FAQ 개수:', faqs?.length || 0);
    console.log('쿼리 에러:', error);

    // 6. 각 조건별 개별 확인
    const { data: statusAnswered, error: statusError } = await supabase
      .from('customer_service')
      .select('*')
      .eq('status', 'answered')
      .eq('cs_categories', 'frequent_questions');

    console.log(
      'status=answered AND cs_categories=frequent_questions:',
      statusAnswered
    );
    console.log('조합 조건 개수:', statusAnswered?.length || 0);

    // 7. frequent_questions 테이블 존재 여부 확인
    const { data: frequentTableExists, error: frequentTableError } =
      await supabase.from('frequent_questions').select('*').limit(1);

    console.log(
      'frequent_questions 테이블 존재 여부:',
      frequentTableExists !== null
    );
    console.log('frequent_questions 테이블 에러:', frequentTableError);

    return NextResponse.json({
      debug: {
        allCustomerService: allCustomerService?.length || 0,
        frequentQuestions: frequentQuestions?.length || 0,
        answeredData: answeredData?.length || 0,
        menuTypes: menuTypes,
        finalFaqs: faqs?.length || 0,
        statusAnswered: statusAnswered?.length || 0,
        frequentTableExists: frequentTableExists !== null,
        errors: {
          allError,
          frequentError,
          answeredError,
          menuTypesError,
          statusError,
          finalError: error,
          frequentTableError,
        },
        // 실제 데이터도 포함
        allCustomerServiceData: allCustomerService,
        frequentQuestionsData: frequentQuestions,
        answeredDataData: answeredData,
        finalFaqsData: faqs,
      },
      faqs: faqs || [],
    });
  } catch (error) {
    console.error('FAQ 디버깅 중 예외 발생:', error);
    return NextResponse.json(
      { error: '디버깅 중 서버 오류가 발생했습니다.', details: error },
      { status: 500 }
    );
  }
}
