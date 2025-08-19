import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { yearMonth } = body;

    if (!yearMonth) {
      return NextResponse.json(
        { success: false, error: 'yearMonth parameter is required' },
        { status: 400 }
      );
    }

    console.log(`🔧 Deleting periods for yearMonth: ${yearMonth}`);

    // 1. banner_display 타입 ID 가져오기
    const { data: displayType, error: displayTypeError } = await supabase
      .from('display_types')
      .select('id')
      .eq('name', 'banner_display')
      .single();

    if (displayTypeError || !displayType) {
      throw new Error('Banner display type not found');
    }

    // 2. 삭제 전 해당 년월의 데이터 개수 확인
    const { data: countData, error: countError } = await supabase
      .from('region_gu_display_periods')
      .select('id', { count: 'exact' })
      .eq('year_month', yearMonth)
      .eq('display_type_id', displayType.id);

    if (countError) {
      throw new Error('Failed to count periods');
    }

    const periodCount = countData?.length || 0;

    // 3. 해당 년월의 기간 데이터 삭제
    const { error: deleteError } = await supabase
      .from('region_gu_display_periods')
      .delete()
      .eq('year_month', yearMonth)
      .eq('display_type_id', displayType.id);

    if (deleteError) {
      console.error('❌ Error deleting periods:', deleteError);
      throw new Error('Failed to delete periods');
    }

    console.log(`✅ Successfully deleted ${periodCount} periods for ${yearMonth}`);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${periodCount} periods for ${yearMonth}`,
      data: {
        deletedCount: periodCount,
        yearMonth: yearMonth,
      },
    });
  } catch (error) {
    console.error('❌ Error deleting periods by yearMonth:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
