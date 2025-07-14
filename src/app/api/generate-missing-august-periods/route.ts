import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function POST() {
  try {
    console.log('🔧 Generating missing August 2025 periods...');

    // 1. banner_display 타입 ID 가져오기
    const { data: displayType, error: displayTypeError } = await supabase
      .from('display_types')
      .select('id')
      .eq('name', 'banner_display')
      .single();

    if (displayTypeError || !displayType) {
      throw new Error('Banner display type not found');
    }

    // 2. 누락된 구들 (송파구, 서대문구, 용산구)
    const missingRegions = [
      { code: 'songpa', name: '송파구' },
      { code: 'seodaemun', name: '서대문구' },
      { code: 'yongsan', name: '용산구' },
    ];

    // 3. 각 구의 ID 가져오기
    const { data: regions, error: regionsError } = await supabase
      .from('region_gu')
      .select('id, name, code')
      .in(
        'code',
        missingRegions.map((r) => r.code)
      );

    if (regionsError) {
      throw new Error('Failed to fetch regions');
    }

    console.log('🔍 Found regions:', regions);

    // 4. 각 구별로 8월 기간 생성
    const periodsToInsert = [];

    for (const region of regions) {
      // 송파구, 용산구: 일반적인 1일-15일 상반기, 16일-31일 하반기
      if (region.code === 'songpa' || region.code === 'yongsan') {
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
      } else if (region.code === 'seodaemun') {
        // 서대문구: 일반적인 1일-15일 상반기, 16일-31일 하반기
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
      '✅ Missing August 2025 periods generated successfully:',
      insertedPeriods
    );

    return NextResponse.json({
      success: true,
      message: 'Missing August 2025 periods generated successfully',
      data: {
        insertedCount: insertedPeriods?.length || 0,
        periods: insertedPeriods,
      },
    });
  } catch (error) {
    console.error('❌ Error generating missing August periods:', error);
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
