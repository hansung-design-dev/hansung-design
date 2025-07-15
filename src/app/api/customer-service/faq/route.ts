import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category'); // 디지털사이니지, 공공디자인, LED전자게시대, 현수막게시대

    // 카테고리별 homepage_menu_type 매핑
    const categoryMapping: { [key: string]: string } = {
      디지털사이니지: 'digital_signage',
      공공디자인: 'public_design',
      LED전자게시대: 'led_display',
      현수막게시대: 'banner_display',
    };

    const menuType = categoryMapping[category || ''];

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
      .eq('cs_categories', 'frequent_questions'); // FAQ만 조회

    // 특정 카테고리가 지정된 경우 필터링
    if (menuType) {
      query = query.eq('homepage_menu_types.name', menuType);
    }

    const { data: faqs, error } = await query.order('created_at', {
      ascending: false,
    });

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
