import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET() {
  try {
    console.log('🔍 Checking August 2025 periods...');

    // 1. banner_display 타입 ID 가져오기
    const { data: displayType, error: displayTypeError } = await supabase
      .from('display_types')
      .select('id')
      .eq('name', 'banner_display')
      .single();

    if (displayTypeError || !displayType) {
      throw new Error('Banner display type not found');
    }

    // 2. 8월 기간 데이터 조회
    const { data: augustPeriods, error: periodsError } = await supabase
      .from('region_gu_display_periods')
      .select(
        `
        *,
        region_gu (
          id,
          name,
          code
        )
      `
      )
      .eq('year_month', '2025-08')
      .eq('display_type_id', displayType.id);

    if (periodsError) {
      throw new Error('Failed to fetch August periods');
    }

    // 3. 활성화된 구들 조회
    const { data: regions, error: regionsError } = await supabase
      .from('region_gu')
      .select('id, name, code')
      .eq('is_active', true);

    if (regionsError) {
      throw new Error('Failed to fetch regions');
    }

    console.log('🔍 August periods found:', augustPeriods);
    console.log('🔍 Active regions:', regions);

    return NextResponse.json({
      success: true,
      data: {
        augustPeriods: augustPeriods || [],
        activeRegions: regions || [],
        displayTypeId: displayType.id,
      },
    });
  } catch (error) {
    console.error('❌ Error checking August periods:', error);
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
