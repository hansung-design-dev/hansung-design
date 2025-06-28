import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Auth signout error:', error);
      return NextResponse.json(
        { success: false, error: '로그아웃 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '로그아웃이 완료되었습니다.',
    });
  } catch (error) {
    console.error('Signout API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
