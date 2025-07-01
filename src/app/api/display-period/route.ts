import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/app/api/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district');
    const displayTypeParam =
      searchParams.get('display_type') || 'banner_display';
    if (!district) {
      return NextResponse.json(
        { success: false, error: 'district parameter is required' },
        { status: 400 }
      );
    }

    // region_gu_id 찾기
    const { data: guData, error: guError } = await supabase
      .from('region_gu')
      .select('id')
      .eq('name', district)
      .single();
    if (guError || !guData) {
      return NextResponse.json(
        { success: false, error: '구 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // display_type_id 찾기
    const { data: typeData, error: typeError } = await supabase
      .from('display_types')
      .select('id')
      .eq('name', displayTypeParam)
      .single();
    if (typeError || !typeData) {
      return NextResponse.json(
        { success: false, error: 'display_type 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 신청기간 조회
    const { data: periodData, error: periodError } = await supabase
      .from('region_gu_display_periods')
      .select(
        'first_half_from, first_half_to, second_half_from, second_half_to'
      )
      .eq('region_gu_id', guData.id)
      .eq('display_type_id', typeData.id)
      .single();
    if (periodError || !periodData) {
      return NextResponse.json(
        { success: false, error: '신청기간 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 이번달 전/하반기 계산
    const now = new Date();

    // 상반기: 1일 ~ 15일
    const firstHalfStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstHalfEnd = new Date(now.getFullYear(), now.getMonth(), 15);

    // 하반기: 16일 ~ 말일
    const secondHalfStart = new Date(now.getFullYear(), now.getMonth(), 16);
    const secondHalfEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // 날짜를 YYYY-MM-DD 형식으로 변환
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    const currentPeriodData = {
      first_half_from: formatDate(firstHalfStart),
      first_half_to: formatDate(firstHalfEnd),
      second_half_from: formatDate(secondHalfStart),
      second_half_to: formatDate(secondHalfEnd),
    };

    return NextResponse.json({ success: true, data: currentPeriodData });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
