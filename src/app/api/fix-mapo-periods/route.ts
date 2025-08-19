import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function POST() {
  try {
    console.log('🔧 Fixing Mapo-gu periods...');

    // 1. banner_display 타입 ID 가져오기
    const { data: displayType, error: displayTypeError } = await supabase
      .from('display_types')
      .select('id')
      .eq('name', 'banner_display')
      .single();

    if (displayTypeError || !displayType) {
      throw new Error('Banner display type not found');
    }

    // 2. 마포구 ID 찾기
    const { data: mapoGu, error: mapoError } = await supabase
      .from('region_gu')
      .select('id, name')
      .eq('name', '마포구')
      .eq('display_type_id', displayType.id)
      .single();

    if (mapoError || !mapoGu) {
      throw new Error('Mapo-gu not found');
    }

    console.log('✅ Mapo-gu found:', mapoGu);

    // 3. 기존 마포구 9월, 10월 데이터 삭제
    const { error: deleteError } = await supabase
      .from('region_gu_display_periods')
      .delete()
      .eq('region_gu_id', mapoGu.id)
      .in('year_month', ['2025-09', '2025-10'])
      .eq('display_type_id', displayType.id);

    if (deleteError) {
      console.error('❌ Error deleting existing Mapo periods:', deleteError);
    }

    // 4. 마포구 올바른 기간 데이터 생성
    const periodsToInsert = [];

    // 9월 기간
    periodsToInsert.push({
      region_gu_id: mapoGu.id,
      display_type_id: displayType.id,
      year_month: '2025-09',
      period: 'first_half',
      period_from: '2025-09-05',
      period_to: '2025-09-19',
    });

    periodsToInsert.push({
      region_gu_id: mapoGu.id,
      display_type_id: displayType.id,
      year_month: '2025-09',
      period: 'second_half',
      period_from: '2025-09-20',
      period_to: '2025-10-04',
    });

    // 10월 기간
    periodsToInsert.push({
      region_gu_id: mapoGu.id,
      display_type_id: displayType.id,
      year_month: '2025-10',
      period: 'first_half',
      period_from: '2025-10-05',
      period_to: '2025-10-19',
    });

    periodsToInsert.push({
      region_gu_id: mapoGu.id,
      display_type_id: displayType.id,
      year_month: '2025-10',
      period: 'second_half',
      period_from: '2025-10-20',
      period_to: '2025-11-04',
    });

    // 5. 새로운 기간 데이터 삽입
    const { data: insertedPeriods, error: insertError } = await supabase
      .from('region_gu_display_periods')
      .insert(periodsToInsert)
      .select();

    if (insertError) {
      console.error('❌ Error inserting Mapo periods:', insertError);
      throw new Error(`Failed to insert Mapo periods: ${insertError.message}`);
    }

    console.log('✅ Mapo-gu periods fixed successfully:', {
      insertedCount: insertedPeriods?.length || 0,
    });

    return NextResponse.json({
      success: true,
      message: 'Mapo-gu periods fixed successfully',
      data: {
        insertedCount: insertedPeriods?.length || 0,
        periods: insertedPeriods,
      },
    });
  } catch (error) {
    console.error('❌ Error fixing Mapo periods:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
