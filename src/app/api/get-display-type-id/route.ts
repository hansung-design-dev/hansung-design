import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name) {
      return NextResponse.json(
        { error: 'name 파라미터가 필요합니다.' },
        { status: 400 }
      );
    }

    const { data: displayType, error } = await supabase
      .from('display_types')
      .select('id, name')
      .eq('name', name)
      .single();

    if (error) {
      console.error('display_type 조회 오류:', error);
      return NextResponse.json(
        { error: 'display_type 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ displayType });
  } catch (error) {
    console.error('display_type 조회 중 예외 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
