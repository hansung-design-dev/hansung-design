import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET() {
  try {
    const { data: displayTypes, error } = await supabase
      .from('display_types')
      .select('*')
      .order('name');

    if (error) {
      console.error('display_types 조회 오류:', error);
      return NextResponse.json(
        { error: 'display_types 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ displayTypes });
  } catch (error) {
    console.error('display_types 조회 중 예외 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
