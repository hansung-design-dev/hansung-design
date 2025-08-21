import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET() {
  try {
    console.log('=== FAQ API 호출 ===');

    // 모든 FAQ 데이터 조회 (카테고리 필터링 없이)
    const query = supabase
      .from('frequent_questions')
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
      .eq('cs_categories', 'frequent_questions')
      .order('created_at', {
        ascending: false,
      });

    const { data: faqs, error } = await query;

    console.log('FAQ 쿼리 결과:', faqs);
    console.log('FAQ 개수:', faqs?.length || 0);
    console.log('쿼리 에러:', error);

    if (error) {
      console.error('FAQ 조회 오류:', error);
      return NextResponse.json(
        { error: 'FAQ 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ faqs });
  } catch (error) {
    console.error('FAQ 조회 중 예외 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
