import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit')
      ? parseInt(searchParams.get('limit')!)
      : 10;
    const offset = searchParams.get('offset')
      ? parseInt(searchParams.get('offset')!)
      : 0;

    // important 우선순위 공지사항 먼저 가져오기
    const { data: importantNotices, error: importantError } = await supabase
      .from('homepage_notice')
      .select('*')
      .eq('is_active', true)
      .eq('priority', 'important')
      .order('created_at', { ascending: false });

    if (importantError) {
      console.error('중요 공지사항 조회 오류:', importantError);
      return NextResponse.json(
        { error: '공지사항 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // 일반 공지사항 가져오기
    const { data: normalNotices, error: normalError } = await supabase
      .from('homepage_notice')
      .select('*')
      .eq('is_active', true)
      .neq('priority', 'important')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (normalError) {
      console.error('일반 공지사항 조회 오류:', normalError);
      return NextResponse.json(
        { error: '공지사항 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // important 공지사항을 먼저, 그 다음 일반 공지사항 순으로 합치기
    const notices = [...importantNotices, ...normalNotices];

    return NextResponse.json({ notices });
  } catch (error) {
    console.error('공지사항 조회 중 예외 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, priority = 'normal' } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: '제목과 내용은 필수입니다.' },
        { status: 400 }
      );
    }

    const { data: notice, error } = await supabase
      .from('homepage_notice')
      .insert([
        {
          title,
          content,
          priority,
          is_active: true,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('공지사항 생성 오류:', error);
      return NextResponse.json(
        { error: '공지사항 생성 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ notice });
  } catch (error) {
    console.error('공지사항 생성 중 예외 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
