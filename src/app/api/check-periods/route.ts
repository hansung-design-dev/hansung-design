import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET() {
  try {
    console.log('🔍 Checking periods for 2025-12 and 2026-01...');

    // 1. banner_display 타입 ID 가져오기
    const { data: displayType, error: displayTypeError } = await supabase
      .from('display_types')
      .select('id')
      .eq('name', 'banner_display')
      .single();

    if (displayTypeError || !displayType) {
      throw new Error('Banner display type not found');
    }

    // 2. 2025-12와 2026-01 기간 데이터 조회
    const { data: periods, error: periodsError } = await supabase
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
      .eq('display_type_id', displayType.id)
      .in('year_month', ['2025-12', '2026-01'])
      .in('period', ['first_half', 'second_half'])
      .order('year_month', { ascending: true })
      .order('region_gu_id', { ascending: true })
      .order('period', { ascending: true });

    if (periodsError) {
      throw new Error('Failed to fetch periods');
    }

    // 3. 구별로 그룹화
    const groupedByYearMonth: Record<string, any[]> = {};
    periods?.forEach((period) => {
      const key = period.year_month;
      if (!groupedByYearMonth[key]) {
        groupedByYearMonth[key] = [];
      }
      groupedByYearMonth[key].push(period);
    });

    // 4. 활성화된 구들 조회
    const { data: regions, error: regionsError } = await supabase
      .from('region_gu')
      .select('id, name, code')
      .eq('is_active', true);

    if (regionsError) {
      throw new Error('Failed to fetch regions');
    }

    console.log('🔍 Periods found:', periods);
    console.log('🔍 Active regions:', regions);

    return NextResponse.json({
      success: true,
      data: {
        periods: periods || [],
        groupedByYearMonth,
        activeRegions: regions || [],
        displayTypeId: displayType.id,
        summary: {
          '2025-12': {
            total: groupedByYearMonth['2025-12']?.length || 0,
            firstHalf: groupedByYearMonth['2025-12']?.filter((p) => p.period === 'first_half').length || 0,
            secondHalf: groupedByYearMonth['2025-12']?.filter((p) => p.period === 'second_half').length || 0,
          },
          '2026-01': {
            total: groupedByYearMonth['2026-01']?.length || 0,
            firstHalf: groupedByYearMonth['2026-01']?.filter((p) => p.period === 'first_half').length || 0,
            secondHalf: groupedByYearMonth['2026-01']?.filter((p) => p.period === 'second_half').length || 0,
          },
        },
      },
    });
  } catch (error) {
    console.error('❌ Error checking periods:', error);
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

