import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function POST() {
  try {
    console.log('🔧 Generating August 2025 periods...');

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

    // 3. 각 구별로 8월 기간 생성
    const periodsToInsert = [];

    for (const region of regions) {
      // 마포구 특별 처리
      if (region.code === 'mapo') {
        // 마포구: 5일-19일 상반기, 20일-9월 4일 하반기
        periodsToInsert.push({
          region_gu_id: region.id,
          display_type_id: displayType.id,
          year_month: '2025-08',
          period: 'first_half',
          period_from: '2025-08-05',
          period_to: '2025-08-19',
        });

        periodsToInsert.push({
          region_gu_id: region.id,
          display_type_id: displayType.id,
          year_month: '2025-08',
          period: 'second_half',
          period_from: '2025-08-20',
          period_to: '2025-09-04',
        });
      } else {
        // 일반 구: 1일-15일 상반기, 16일-31일 하반기
        periodsToInsert.push({
          region_gu_id: region.id,
          display_type_id: displayType.id,
          year_month: '2025-08',
          period: 'first_half',
          period_from: '2025-08-01',
          period_to: '2025-08-15',
        });

        periodsToInsert.push({
          region_gu_id: region.id,
          display_type_id: displayType.id,
          year_month: '2025-08',
          period: 'second_half',
          period_from: '2025-08-16',
          period_to: '2025-08-31',
        });
      }
    }

    // 4. 기존 8월 데이터 삭제 (중복 방지)
    await supabase
      .from('region_gu_display_periods')
      .delete()
      .eq('year_month', '2025-08')
      .eq('display_type_id', displayType.id);

    // 5. 새로운 8월 기간 데이터 삽입
    const { data: insertedPeriods, error: insertError } = await supabase
      .from('region_gu_display_periods')
      .insert(periodsToInsert)
      .select();

    if (insertError) {
      console.error('❌ Error inserting periods:', insertError);
      throw new Error('Failed to insert periods');
    }

    console.log(
      '✅ August 2025 periods generated successfully:',
      insertedPeriods
    );

    return NextResponse.json({
      success: true,
      message: 'August 2025 periods generated successfully',
      data: {
        insertedCount: insertedPeriods?.length || 0,
        periods: insertedPeriods,
      },
    });
  } catch (error) {
    console.error('❌ Error generating August periods:', error);
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
