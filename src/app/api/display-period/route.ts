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

    // 현재 월 계산
    const currentDate = new Date();
    const currentYearMonth = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, '0')}`;

    // 신청기간 조회 (현재 월 데이터 - 상반기와 하반기 모두)
    const { data: periodDataList, error: periodError } = await supabase
      .from('region_gu_display_periods')
      .select('period_from, period_to, half_period')
      .eq('region_gu_id', guData.id)
      .eq('display_type_id', typeData.id)
      .eq('year_month', currentYearMonth);

    console.log(`🔍 Period data for ${district}:`, {
      periodDataList,
      periodError,
    });
    console.log(`🔍 Current year-month: ${currentYearMonth}`);

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

    if (periodDataList && periodDataList.length > 0 && !periodError) {
      // DB에서 상반기와 하반기 데이터 찾기
      const firstHalfData = periodDataList.find(
        (p) => p.half_period === 'first_half'
      );
      const secondHalfData = periodDataList.find(
        (p) => p.half_period === 'second_half'
      );

      currentPeriodData = {
        first_half_from:
          firstHalfData?.period_from ||
          formatDate(new Date(now.getFullYear(), now.getMonth(), 1)),
        first_half_to:
          firstHalfData?.period_to ||
          formatDate(new Date(now.getFullYear(), now.getMonth(), 15)),
        second_half_from:
          secondHalfData?.period_from || formatDate(secondHalfStart),
        second_half_to: secondHalfData?.period_to || formatDate(secondHalfEnd),
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
