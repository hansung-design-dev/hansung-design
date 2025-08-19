import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function POST() {
  try {
    console.log('🔧 Generating test periods for September and October 2025...');

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

    console.log('🔍 Found regions:', regions);

    // 3. 9월과 10월 기간만 생성
    const periodsToInsert = [];
    const months = [9, 10]; // 9월, 10월만

    for (const region of regions) {
      for (const month of months) {
        const year = 2025;
        const yearMonth = `${year}-${month.toString().padStart(2, '0')}`;

        // 마포구 특별 처리
        if (region.name === '마포구') {
          // 마포구: 5일-19일 상반기, 20일-다음달 4일 하반기
          periodsToInsert.push({
            region_gu_id: region.id,
            display_type_id: displayType.id,
            year_month: yearMonth,
            period: 'first_half',
            period_from: `${year}-${month.toString().padStart(2, '0')}-05`,
            period_to: `${year}-${month.toString().padStart(2, '0')}-19`,
          });

          // 하반기 (20일-다음달 4일)
          const nextMonth = month === 12 ? 1 : month + 1;
          const nextYear = month === 12 ? year + 1 : year;
          periodsToInsert.push({
            region_gu_id: region.id,
            display_type_id: displayType.id,
            year_month: yearMonth,
            period: 'second_half',
            period_from: `${year}-${month.toString().padStart(2, '0')}-20`,
            period_to: `${nextYear}-${nextMonth
              .toString()
              .padStart(2, '0')}-04`,
          });
        } else {
          // 일반 구: 1일-15일 상반기, 16일-31일 하반기
          periodsToInsert.push({
            region_gu_id: region.id,
            display_type_id: displayType.id,
            year_month: yearMonth,
            period: 'first_half',
            period_from: `${year}-${month.toString().padStart(2, '0')}-01`,
            period_to: `${year}-${month.toString().padStart(2, '0')}-15`,
          });

          // 하반기 (16일-31일)
          const lastDay = new Date(year, month, 0).getDate();
          periodsToInsert.push({
            region_gu_id: region.id,
            display_type_id: displayType.id,
            year_month: yearMonth,
            period: 'second_half',
            period_from: `${year}-${month.toString().padStart(2, '0')}-16`,
            period_to: `${year}-${month
              .toString()
              .padStart(2, '0')}-${lastDay}`,
          });
        }
      }
    }

    console.log(
      `🔍 Generated ${periodsToInsert.length} periods for ${regions.length} regions`
    );

    // 4. 기존 9월, 10월 데이터 삭제 (중복 방지)
    const { error: deleteError } = await supabase
      .from('region_gu_display_periods')
      .delete()
      .in('year_month', ['2025-09', '2025-10'])
      .eq('display_type_id', displayType.id);

    if (deleteError) {
      console.error('❌ Error deleting existing periods:', deleteError);
    }

    // 5. 새로운 기간 데이터 삽입
    const { data: insertedPeriods, error: insertError } = await supabase
      .from('region_gu_display_periods')
      .insert(periodsToInsert)
      .select();

    if (insertError) {
      console.error('❌ Error inserting periods:', insertError);
      throw new Error(`Failed to insert periods: ${insertError.message}`);
    }

    console.log('✅ Test periods generated successfully:', {
      totalInserted: insertedPeriods?.length || 0,
      regions: regions.length,
      months: months.length,
    });

    return NextResponse.json({
      success: true,
      message:
        'Test periods for September and October 2025 generated successfully',
      data: {
        insertedCount: insertedPeriods?.length || 0,
        regions: regions.length,
        months: months.length,
        samplePeriods: insertedPeriods?.slice(0, 10) || [],
      },
    });
  } catch (error) {
    console.error('❌ Error generating test periods:', error);
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
