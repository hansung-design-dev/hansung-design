import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { user_id, notice_id, hide_type } = await request.json();

    if (!user_id || !notice_id || !hide_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['oneday', 'permanent'].includes(hide_type)) {
      return NextResponse.json(
        { error: 'Invalid hide_type. Must be "oneday" or "permanent"' },
        { status: 400 }
      );
    }

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const preferenceData = {
      user_id,
      notice_id,
      hide_until_date:
        hide_type === 'oneday' ? tomorrow.toISOString().split('T')[0] : null,
      hide_permanently: hide_type === 'permanent',
      updated_at: new Date().toISOString(),
    };

    // UPSERT: 기존 설정이 있으면 업데이트, 없으면 새로 생성
    const { data, error } = await supabase
      .from('notice_user_preferences')
      .upsert(preferenceData, {
        onConflict: 'user_id,notice_id',
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving notice preference:', error);
      return NextResponse.json(
        { error: 'Failed to save notice preference' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message:
        hide_type === 'oneday'
          ? '공지사항을 하루 동안 숨겼습니다.'
          : '공지사항을 다시 보이지 않도록 설정했습니다.',
    });
  } catch (error) {
    console.error('Error in notice hide API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const notice_id = searchParams.get('notice_id');

    if (!user_id || !notice_id) {
      return NextResponse.json(
        { error: 'Missing user_id or notice_id' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('notice_user_preferences')
      .select('*')
      .eq('user_id', user_id)
      .eq('notice_id', notice_id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116는 데이터가 없는 경우
      console.error('Error fetching notice preference:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notice preference' },
        { status: 500 }
      );
    }

    // 숨김 여부 확인 로직
    const today = new Date().toISOString().split('T')[0];
    const isHidden = data
      ? data.hide_permanently ||
        (data.hide_until_date && data.hide_until_date > today)
      : false;

    return NextResponse.json({
      success: true,
      isHidden,
      preference: data || null,
    });
  } catch (error) {
    console.error('Error in notice preference check API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
