import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET() {
  try {
    console.log('🔍 Checking all periods for 마포구...');

    // 1. banner_display의 display_type_id 찾기
    const { data: typeData, error: typeError } = await supabase
      .from('display_types')
      .select('id, name')
      .eq('name', 'banner_display')
      .single();

    if (typeError || !typeData) {
      console.error('❌ Error finding banner_display type:', typeError);
      return NextResponse.json(
        { success: false, error: 'banner_display 타입을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    console.log('✅ banner_display type found:', typeData);

    // 2. 마포구의 region_gu_id 찾기 (banner_display용)
    const { data: guData, error: guError } = await supabase
      .from('region_gu')
      .select('id, name')
      .eq('name', '마포구')
      .eq('display_type_id', typeData.id)
      .single();

    if (guError || !guData) {
      console.error('❌ Error finding 마포구:', guError);
      return NextResponse.json(
        { success: false, error: '마포구를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    console.log('✅ 마포구 found:', guData);

    // 3. 마포구의 모든 기간 데이터 조회 (필터 없이)
    const { data: allPeriods, error: periodError } = await supabase
      .from('region_gu_display_periods')
      .select('*')
      .eq('region_gu_id', guData.id)
      .eq('display_type_id', typeData.id)
      .order('period_from', { ascending: true });

    if (periodError) {
      console.error('❌ Error fetching periods:', periodError);
      return NextResponse.json(
        { success: false, error: '기간 데이터를 가져올 수 없습니다.' },
        { status: 500 }
      );
    }

    console.log('✅ All periods for 마포구:', allPeriods);

    // 4. 현재 날짜 기준으로 7일 후 계산
    const now = new Date();
    const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const currentDate = koreaTime.toISOString().split('T')[0];

    // 7일 후 날짜 계산
    const sevenDaysLater = new Date(
      koreaTime.getTime() + 7 * 24 * 60 * 60 * 1000
    );
    const sevenDaysLaterStr = sevenDaysLater.toISOString().split('T')[0];

    console.log('🔍 Current date (Korea time):', currentDate);
    console.log('🔍 Seven days later:', sevenDaysLaterStr);

    // 5. 7일 전 마감 로직 적용
    const availablePeriods =
      allPeriods?.filter((period) => {
        const periodStart = new Date(period.period_from);
        const daysUntilPeriod = Math.ceil(
          (periodStart.getTime() - koreaTime.getTime()) / (1000 * 60 * 60 * 24)
        );

        console.log(
          `🔍 Period ${period.period_from} - ${period.period_to}: ${daysUntilPeriod} days until start`
        );

        // 7일 이상 남았으면 신청 가능
        return daysUntilPeriod >= 7;
      }) || [];

    console.log('✅ Available periods after 7-day filter:', availablePeriods);

    // 6. 최대 2개 기간 선택
    const selectedPeriods = availablePeriods.slice(0, 2);

    return NextResponse.json({
      success: true,
      data: {
        guData,
        typeData,
        allPeriods,
        currentDate,
        sevenDaysLater: sevenDaysLaterStr,
        availablePeriods,
        selectedPeriods,
      },
    });
  } catch (error) {
    console.error('❌ Error in test-mapo-periods API:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
