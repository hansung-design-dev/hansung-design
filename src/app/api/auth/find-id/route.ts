import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase';
import { normalizePhone } from '@/src/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone } = body as { name?: string; phone?: string };

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: '이름과 휴대폰 번호를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhone(phone);

    const { data: user, error } = await supabaseAdmin
      .from('user_auth')
      .select('username')
      .eq('name', name)
      .eq('phone', normalizedPhone)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: '일치하는 회원 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const username: string = user.username;
    // 아이디 마스킹: 앞 2글자 + *** + 마지막 2글자 (길이에 따라 조정)
    let masked = username;
    if (username.length <= 2) {
      masked = username[0] + '*';
    } else if (username.length === 3) {
      masked = username[0] + '*' + username[2];
    } else {
      const first = username.slice(0, 2);
      const last = username.slice(-2);
      masked = `${first}***${last}`;
    }

    return NextResponse.json({
      success: true,
      usernameMasked: masked,
    });
  } catch (error) {
    console.error('아이디 찾기 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}



