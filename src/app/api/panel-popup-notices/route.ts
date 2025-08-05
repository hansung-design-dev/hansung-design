import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const displayCategoryId = searchParams.get('display_category_id');
    const regionGuId = searchParams.get('region_gu_id');
    const userId = searchParams.get('user_id');
    const limit = searchParams.get('limit')
      ? parseInt(searchParams.get('limit')!)
      : 10;

    let query = supabase.from('panel_popup_notices').select('*');

    // display_category_id 필터링
    if (displayCategoryId) {
      query = query.eq('display_category_id', displayCategoryId);
    }

    // region_gu_id 필터링
    if (regionGuId) {
      query = query.eq('region_gu_id', regionGuId);
    }

    // 현재 날짜가 start_date와 end_date 사이에 있는지 확인
    const today = new Date().toISOString().split('T')[0];
    query = query.lte('start_date', today).gte('end_date', today);

    // 최신순으로 정렬하고 limit 적용
    const { data: notices, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('팝업 공지사항 조회 오류:', error);
      return NextResponse.json(
        { error: '팝업 공지사항 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // 사용자가 로그인한 경우 숨김 설정 필터링
    if (userId && notices && notices.length > 0) {
      try {
        // 사용자의 숨김 설정 조회
        const { data: preferences } = await supabase
          .from('notice_user_preferences')
          .select('notice_id, hide_until_date, hide_permanently')
          .eq('user_id', userId);

        if (preferences) {
          const today = new Date().toISOString().split('T')[0];
          const hiddenNoticeIds = preferences
            .filter(
              (pref) =>
                pref.hide_permanently ||
                (pref.hide_until_date && pref.hide_until_date > today)
            )
            .map((pref) => pref.notice_id);

          // 숨겨진 공지사항 제외
          const filteredNotices = notices.filter(
            (notice) => !hiddenNoticeIds.includes(notice.id)
          );

          return NextResponse.json({ notices: filteredNotices });
        }
      } catch (error) {
        console.error('사용자 숨김 설정 조회 오류:', error);
      }
    }

    return NextResponse.json({ notices });
  } catch (error) {
    console.error('팝업 공지사항 조회 중 예외 발생:', error);
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
      display_category_id,
      title,
      content,
      image_url,
      start_date,
      end_date,
      region_gu_id,
      notice_categories_id,
      hide_oneday = false,
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: '제목과 내용은 필수입니다.' },
        { status: 400 }
      );
    }

    // 날짜 검증
    if (start_date && end_date && start_date > end_date) {
      return NextResponse.json(
        { error: '시작일은 종료일보다 이전이어야 합니다.' },
        { status: 400 }
      );
    }

    const { data: notice, error } = await supabase
      .from('panel_popup_notices')
      .insert([
        {
          display_category_id,
          title,
          content,
          image_url,
          start_date,
          end_date,
          region_gu_id,
          notice_categories_id,
          hide_oneday,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('팝업 공지사항 생성 오류:', error);
      return NextResponse.json(
        { error: '팝업 공지사항 생성 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ notice });
  } catch (error) {
    console.error('팝업 공지사항 생성 중 예외 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
