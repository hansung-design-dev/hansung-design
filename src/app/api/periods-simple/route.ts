import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 periods-simple API called');
    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district');
    const displayTypeParam = searchParams.get('display_type') || 'banner_display';
    
    console.log('🔍 Parameters:', { district, displayTypeParam });
    
    if (!district) {
      return NextResponse.json(
        { success: false, error: 'district parameter is required' },
        { status: 400 }
      );
    }

    // 1. display_type_id 찾기
    const { data: typeData, error: typeError } = await supabase
      .from('display_types')
      .select('id')
      .eq('name', displayTypeParam)
      .single();
    
    if (typeError || !typeData) {
      console.log('❌ Display type not found:', typeError);
      return NextResponse.json(
        { success: false, error: 'display_type 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 2. region_gu_id 찾기
    const { data: guData, error: guError } = await supabase
      .from('region_gu')
      .select('id')
      .eq('name', district)
      .single();
    
    if (guError || !guData) {
      console.log('❌ District not found:', guError);
      return NextResponse.json(
        { success: false, error: '구 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 3. 현재 날짜 기준으로 신청 가능한 기간 조회
    const now = new Date();
    const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000); // UTC+9 (한국시간)
    
    console.log('🔍 Current date (Korea time):', koreaTime);

    // 날짜를 YYYY-MM-DD 형식으로 변환
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // 현재 날짜 이후의 모든 기간 조회
    const { data: allPeriods, error: periodError } = await supabase
      .from('region_gu_display_periods')
      .select('period_from, period_to, period, year_month')
      .eq('region_gu_id', guData.id)
      .eq('display_type_id', typeData.id)
      .gte('period_from', formatDate(koreaTime)) // 현재 날짜 이후부터 시작하는 기간들
      .order('period_from', { ascending: true });

    console.log(`🔍 All available periods for ${district}:`, {
      allPeriods,
      periodError,
      currentDate: formatDate(koreaTime),
    });

    if (periodError || !allPeriods) {
      return NextResponse.json(
        { success: false, error: '기간 데이터를 가져올 수 없습니다.' },
        { status: 500 }
      );
    }

    // 4. 7일 전 마감 로직: 게시 시작일 기준 7일 전까지 신청 가능
    const availablePeriods = allPeriods.filter((period) => {
      const periodStart = new Date(period.period_from);
      const daysUntilPeriod = Math.ceil(
        (periodStart.getTime() - koreaTime.getTime()) / (1000 * 60 * 60 * 24)
      );

      console.log(
        `🔍 Period ${period.period_from} - ${period.period_to}: ${daysUntilPeriod} days until start`
      );

      // 7일 이상 남았으면 신청 가능
      return daysUntilPeriod >= 7;
    });

    console.log(`🔍 Available periods after 7-day filter:`, {
      availablePeriods,
      currentDate: formatDate(koreaTime),
    });

    // 5. 최대 2개의 신청 가능한 기간만 반환
    const selectedPeriods = availablePeriods.slice(0, 2);

    if (selectedPeriods.length === 0) {
      // 신청 가능한 기간이 없으면 빈 데이터 반환
      const emptyPeriodData = {
        first_half_from: '',
        first_half_to: '',
        second_half_from: '',
        second_half_to: '',
        available_periods: [],
      };
      return NextResponse.json({ success: true, data: emptyPeriodData });
    }

    // 6. 기존 형식과 호환되도록 데이터 변환
    const currentPeriodData = {
      first_half_from: selectedPeriods[0]?.period_from || '',
      first_half_to: selectedPeriods[0]?.period_to || '',
      second_half_from: selectedPeriods[1]?.period_from || '',
      second_half_to: selectedPeriods[1]?.period_to || '',
      available_periods: selectedPeriods.map((period) => ({
        period_from: period.period_from,
        period_to: period.period_to,
        period: period.period,
        year_month: period.year_month,
      })),
    };

    console.log(`🔍 Final period data for ${district}:`, currentPeriodData);

    return NextResponse.json({ success: true, data: currentPeriodData });
  } catch (error) {
    console.error('❌ Error in periods-simple API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
