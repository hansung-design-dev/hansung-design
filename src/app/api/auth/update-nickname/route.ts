import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase';

export async function PUT(request: NextRequest) {
  try {
    const { userId, newNickname } = await request.json();

    if (!userId || !newNickname) {
      return NextResponse.json(
        {
          success: false,
          error: '사용자 ID와 새로운 닉네임이 필요합니다.',
        },
        { status: 400 }
      );
    }

    const trimmedNickname = newNickname.trim();
    if (!trimmedNickname) {
      return NextResponse.json(
        { success: false, error: '유효한 닉네임을 입력해주세요.' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('user_auth')
      .update({
        username: trimmedNickname,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('닉네임 업데이트 에러:', error);
      return NextResponse.json(
        { success: false, error: '닉네임을 변경할 수 없습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('닉네임 업데이트 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}


