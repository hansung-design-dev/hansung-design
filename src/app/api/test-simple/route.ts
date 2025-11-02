import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET() {
  try {
    console.log('🔍 Simple test API started...');

    // 1. display_types 확인
    const { data: displayTypes, error: displayError } = await supabase
      .from('display_types')
      .select('*');

    console.log('Display types:', displayTypes, displayError);

    // 2. region_gu 확인
    const { data: regions, error: regionError } = await supabase
      .from('region_gu')
      .select('*')
      .limit(5);

    console.log('Regions:', regions, regionError);

    // 3. 기간 데이터 확인
    const { data: periods, error: periodError } = await supabase
      .from('region_gu_display_periods')
      .select('*')
      .limit(5);

    console.log('Periods:', periods, periodError);

    return NextResponse.json({
      success: true,
      data: {
        displayTypes,
        regions,
        periods,
        errors: {
          displayError,
          regionError,
          periodError,
        },
      },
    });
  } catch (error) {
    console.error('❌ Error in simple test API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
