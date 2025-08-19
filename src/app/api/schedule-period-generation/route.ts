import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function POST() {
  try {
    console.log('🔧 Scheduled period generation started...');

    // 1. banner_display 타입 ID 가져오기
    const { data: displayType, error: displayTypeError } = await supabase
      .from('display_types')
      .select('id')
      .eq('name', 'banner_display')
      .single();

    if (displayTypeError || !displayType) {
      throw new Error('Banner display type not found');
    }

    // 2. 활성화된 구들 가져오기
    const { data: regions, error: regionsError } = await supabase
      .from('region_gu')
      .select('id, name, code')
      .eq('is_active', true);

    if (regionsError) {
      throw new Error('Failed to fetch regions');
    }

    // 3. 다음 달 계산
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextYear = nextMonth.getFullYear();
    const nextMonthNum = nextMonth.getMonth() + 1;
    const yearMonth = `${nextYear}-${nextMonthNum.toString().padStart(2, '0')}`;

    console.log(`🔍 Generating periods for ${yearMonth}`);

    // 4. 이미 존재하는지 확인
    const { data: existingPeriods, error: checkError } = await supabase
      .from('region_gu_display_periods')
      .select('id')
      .eq('year_month', yearMonth)
      .eq('display_type_id', displayType.id)
      .limit(1);

    if (checkError) {
      throw new Error('Failed to check existing periods');
    }

    if (existingPeriods && existingPeriods.length > 0) {
      console.log(`✅ Periods for ${yearMonth} already exist, skipping generation`);
      return NextResponse.json({
        success: true,
        message: `Periods for ${yearMonth} already exist`,
        data: {
          yearMonth,
          skipped: true,
        },
      });
    }

    // 5. 다음 달 기간 생성
    const periodsToInsert = [];

    for (const region of regions) {
      // 마포구 특별 처리
      if (region.name === '마포구') {
        // 마포구: 5일-19일 상반기, 20일-다음달 4일 하반기
        periodsToInsert.push({
          region_gu_id: region.id,
          display_type_id: displayType.id,
          year_month: yearMonth,
          period: 'first_half',
          period_from: `${nextYear}-${nextMonthNum.toString().padStart(2, '0')}-05`,
          period_to: `${nextYear}-${nextMonthNum.toString().padStart(2, '0')}-19`,
        });

        // 하반기 (20일-다음달 4일)
        const nextNextMonth = nextMonthNum === 12 ? 1 : nextMonthNum + 1;
        const nextNextYear = nextMonthNum === 12 ? nextYear + 1 : nextYear;
        periodsToInsert.push({
          region_gu_id: region.id,
          display_type_id: displayType.id,
          year_month: yearMonth,
          period: 'second_half',
          period_from: `${nextYear}-${nextMonthNum.toString().padStart(2, '0')}-20`,
          period_to: `${nextNextYear}-${nextNextMonth.toString().padStart(2, '0')}-04`,
        });
      } else {
        // 일반 구: 1일-15일 상반기, 16일-31일 하반기
        periodsToInsert.push({
          region_gu_id: region.id,
          display_type_id: displayType.id,
          year_month: yearMonth,
          period: 'first_half',
          period_from: `${nextYear}-${nextMonthNum.toString().padStart(2, '0')}-01`,
          period_to: `${nextYear}-${nextMonthNum.toString().padStart(2, '0')}-15`,
        });

        // 하반기 (16일-31일)
        const lastDay = new Date(nextYear, nextMonthNum, 0).getDate();
        periodsToInsert.push({
          region_gu_id: region.id,
          display_type_id: displayType.id,
          year_month: yearMonth,
          period: 'second_half',
          period_from: `${nextYear}-${nextMonthNum.toString().padStart(2, '0')}-16`,
          period_to: `${nextYear}-${nextMonthNum.toString().padStart(2, '0')}-${lastDay}`,
        });
      }
    }

    // 6. 기간 데이터 삽입
    const { data: insertedPeriods, error: insertError } = await supabase
      .from('region_gu_display_periods')
      .insert(periodsToInsert)
      .select();

    if (insertError) {
      console.error('❌ Error inserting periods:', insertError);
      throw new Error('Failed to insert periods');
    }

    console.log(`✅ Successfully generated ${insertedPeriods?.length || 0} periods for ${yearMonth}`);

    return NextResponse.json({
      success: true,
      message: `Successfully generated periods for ${yearMonth}`,
      data: {
        yearMonth,
        insertedCount: insertedPeriods?.length || 0,
        regions: regions.length,
        periods: insertedPeriods,
      },
    });
  } catch (error) {
    console.error('❌ Error in scheduled period generation:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
