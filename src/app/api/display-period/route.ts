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

    // 신청기간 조회 (DB에 없어도 이번달 기간으로 계산)
    const { data: periodData, error: periodError } = await supabase
      .from('region_gu_display_periods')
      .select(
        'first_half_from, first_half_to, second_half_from, second_half_to'
      )
      .eq('region_gu_id', guData.id)
      .eq('display_type_id', typeData.id)
      .single();

    // DB에 데이터가 없어도 에러를 반환하지 않고 이번달 기간으로 계산
    console.log(`🔍 Period data for ${district}:`, { periodData, periodError });

    // 이번달 16일~말일 계산 (2차는 항상 고정)
    const now = new Date();
    console.log('🔍 Current date:', now);
    console.log('🔍 Current year:', now.getFullYear());
    console.log('🔍 Current month:', now.getMonth() + 1); // 1-based (1=January, 7=July)

    const secondHalfStart = new Date(now.getFullYear(), now.getMonth(), 16);
    const secondHalfEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // 날짜를 YYYY-MM-DD 형식으로 변환 (로컬 시간 기준)
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    let currentPeriodData;

    if (periodData && !periodError) {
      // DB에 데이터가 있으면 1차는 DB값 사용, 2차는 이번달 16일~말일 고정
      currentPeriodData = {
        first_half_from: periodData.first_half_from,
        first_half_to: periodData.first_half_to,
        second_half_from: formatDate(secondHalfStart),
        second_half_to: formatDate(secondHalfEnd),
      };
    } else {
      // DB에 데이터가 없으면 둘 다 이번달 계산값 사용
      const firstHalfStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstHalfEnd = new Date(now.getFullYear(), now.getMonth(), 15);

      currentPeriodData = {
        first_half_from: formatDate(firstHalfStart),
        first_half_to: formatDate(firstHalfEnd),
        second_half_from: formatDate(secondHalfStart),
        second_half_to: formatDate(secondHalfEnd),
      };
    }

    return NextResponse.json({ success: true, data: currentPeriodData });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
