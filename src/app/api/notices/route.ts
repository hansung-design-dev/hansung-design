import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET() {
  try {
    // display_type 필터링 (필요시 사용)
    // if (displayType) {
    //   // display_type 필터링 로직
    // }

    // 팝업 공지사항 필터링 (필요시 사용)
    // if (isPopup) {
    //   // 팝업 공지사항 필터링 로직
    // }

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
      .eq('priority', 'normal')
      .order('created_at', { ascending: false });

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
    const {
      title,
      content,
      priority = 'normal',
      display_type = 'banner_display',
      is_popup = false,
      popup_start_date,
      popup_end_date,
      popup_width = 400,
      popup_height = 300,
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: '제목과 내용은 필수입니다.' },
        { status: 400 }
      );
    }

    // 팝업 공지사항인 경우 날짜 검증
    if (is_popup) {
      if (!popup_start_date || !popup_end_date) {
        return NextResponse.json(
          { error: '팝업 공지사항은 시작일과 종료일이 필요합니다.' },
          { status: 400 }
        );
      }
      if (popup_start_date > popup_end_date) {
        return NextResponse.json(
          { error: '시작일은 종료일보다 이전이어야 합니다.' },
          { status: 400 }
        );
      }
    }

    const { data: notice, error } = await supabase
      .from('homepage_notice')
      .insert([
        {
          title,
          content,
          priority,
          display_type,
          is_popup,
          popup_start_date: is_popup ? popup_start_date : null,
          popup_end_date: is_popup ? popup_end_date : null,
          popup_width: is_popup ? popup_width : null,
          popup_height: is_popup ? popup_height : null,
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
