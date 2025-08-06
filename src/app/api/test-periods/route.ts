import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET() {
  try {
    console.log('🔍 Checking all periods for 관악구...');

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

    // 2. 관악구의 region_gu_id 찾기 (banner_display용)
    const { data: guData, error: guError } = await supabase
      .from('region_gu')
      .select('id, name')
      .eq('name', '관악구')
      .eq('display_type_id', typeData.id)
      .single();

    if (guError || !guData) {
      console.error('❌ Error finding 관악구:', guError);
      return NextResponse.json(
        { success: false, error: '관악구를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    console.log('✅ 관악구 found:', guData);

    // 3. 관악구의 모든 기간 데이터 조회 (필터 없이)
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

    console.log('✅ All periods for 관악구:', allPeriods);

    // 4. 현재 날짜 기준으로 7일 후 계산
    const now = new Date();
    const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const sevenDaysLater = new Date(
      koreaTime.getTime() + 7 * 24 * 60 * 60 * 1000
    );

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    console.log('🔍 Current date (Korea):', formatDate(koreaTime));
    console.log('🔍 7 days later:', formatDate(sevenDaysLater));

    // 5. 7일 후부터 시작하는 기간들만 필터링
    const availablePeriods =
      allPeriods?.filter(
        (period) => period.period_from >= formatDate(sevenDaysLater)
      ) || [];

    console.log('🔍 Available periods (7+ days away):', availablePeriods);

    return NextResponse.json({
      success: true,
      data: {
        guData,
        typeData,
        allPeriods,
        currentDate: formatDate(koreaTime),
        sevenDaysLater: formatDate(sevenDaysLater),
        availablePeriods,
      },
    });
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
