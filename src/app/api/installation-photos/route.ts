import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const displayTypeId = searchParams.get('display_type_id');
    const limit = searchParams.get('limit') || '20';

    let query = supabase
      .from('installed_photos')
      .select(
        `
        *,
        display_types (
          name
        )
      `
      )
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    // 특정 디스플레이 타입으로 필터링
    if (displayTypeId) {
      query = query.eq('display_type_id', displayTypeId);
    }

    const { data: installation_photos, error } = await query;

    if (error) {
      console.error('게첨사진 조회 오류:', error);
      return NextResponse.json(
        { error: '게첨사진 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ installation_photos });
  } catch (error) {
    console.error('게첨사진 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
