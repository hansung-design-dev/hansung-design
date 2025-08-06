import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function POST() {
  try {
    console.log('🔧 Inserting August 2025 periods...');

    // 1. 기존 8월 데이터 삭제
    const { error: deleteError } = await supabase
      .from('region_gu_display_periods')
      .delete()
      .eq('year_month', '2025-08')
      .eq('display_type_id', '8178084e-1f13-40bc-8b90-7b8ddc58bf64');

    if (deleteError) {
      console.error('❌ Error deleting existing August periods:', deleteError);
    }

    // 2. 8월 기간 데이터 삽입 (필요한 구만)
    const periodsToInsert = [
      // 관악구 (1일-15일, 16일-31일)
      {
        region_gu_id: '1a283b3d-bccd-4cb4-ba9c-ad7dcb8cbf3f',
        display_type_id: '8178084e-1f13-40bc-8b90-7b8ddc58bf64',
        year_month: '2025-08',
        period: 'first_half',
        period_from: '2025-08-01',
        period_to: '2025-08-15',
      },
      {
        region_gu_id: '1a283b3d-bccd-4cb4-ba9c-ad7dcb8cbf3f',
        display_type_id: '8178084e-1f13-40bc-8b90-7b8ddc58bf64',
        year_month: '2025-08',
        period: 'second_half',
        period_from: '2025-08-16',
        period_to: '2025-08-31',
      },

      // 마포구 (5일-19일, 20일-9월 4일)
      {
        region_gu_id: '9a54ff6f-17f7-4820-bd55-27df6b4decd3',
        display_type_id: '8178084e-1f13-40bc-8b90-7b8ddc58bf64',
        year_month: '2025-08',
        period: 'first_half',
        period_from: '2025-08-05',
        period_to: '2025-08-19',
      },
      {
        region_gu_id: '9a54ff6f-17f7-4820-bd55-27df6b4decd3',
        display_type_id: '8178084e-1f13-40bc-8b90-7b8ddc58bf64',
        year_month: '2025-08',
        period: 'second_half',
        period_from: '2025-08-20',
        period_to: '2025-09-04',
      },

      // 서대문구 (1일-15일, 16일-31일)
      {
        region_gu_id: '420414cb-6545-4306-8bdb-f0a3d454314c',
        display_type_id: '8178084e-1f13-40bc-8b90-7b8ddc58bf64',
        year_month: '2025-08',
        period: 'first_half',
        period_from: '2025-08-01',
        period_to: '2025-08-15',
      },
      {
        region_gu_id: '420414cb-6545-4306-8bdb-f0a3d454314c',
        display_type_id: '8178084e-1f13-40bc-8b90-7b8ddc58bf64',
        year_month: '2025-08',
        period: 'second_half',
        period_from: '2025-08-16',
        period_to: '2025-08-31',
      },

      // 송파구 (1일-15일, 16일-31일)
      {
        region_gu_id: '9927c1ea-1644-43fd-bb67-92f1c0b772f2',
        display_type_id: '8178084e-1f13-40bc-8b90-7b8ddc58bf64',
        year_month: '2025-08',
        period: 'first_half',
        period_from: '2025-08-01',
        period_to: '2025-08-15',
      },
      {
        region_gu_id: '9927c1ea-1644-43fd-bb67-92f1c0b772f2',
        display_type_id: '8178084e-1f13-40bc-8b90-7b8ddc58bf64',
        year_month: '2025-08',
        period: 'second_half',
        period_from: '2025-08-16',
        period_to: '2025-08-31',
      },

      // 용산구 (1일-15일, 16일-31일)
      {
        region_gu_id: '29a2b772-2cc5-453d-8a5a-bbb8126d71f6',
        display_type_id: '8178084e-1f13-40bc-8b90-7b8ddc58bf64',
        year_month: '2025-08',
        period: 'first_half',
        period_from: '2025-08-01',
        period_to: '2025-08-15',
      },
      {
        region_gu_id: '29a2b772-2cc5-453d-8a5a-bbb8126d71f6',
        display_type_id: '8178084e-1f13-40bc-8b90-7b8ddc58bf64',
        year_month: '2025-08',
        period: 'second_half',
        period_from: '2025-08-16',
        period_to: '2025-08-31',
      },

      // 강북구 (5일-19일, 20일-9월 4일)
      {
        region_gu_id: 'c58063a8-a2a7-4266-9228-b5eaa7cb3ddc',
        display_type_id: '8178084e-1f13-40bc-8b90-7b8ddc58bf64',
        year_month: '2025-08',
        period: 'first_half',
        period_from: '2025-08-05',
        period_to: '2025-08-19',
      },
      {
        region_gu_id: 'c58063a8-a2a7-4266-9228-b5eaa7cb3ddc',
        display_type_id: '8178084e-1f13-40bc-8b90-7b8ddc58bf64',
        year_month: '2025-08',
        period: 'second_half',
        period_from: '2025-08-20',
        period_to: '2025-09-04',
      },
    ];

    const { data: insertedPeriods, error: insertError } = await supabase
      .from('region_gu_display_periods')
      .insert(periodsToInsert)
      .select();

    if (insertError) {
      console.error('❌ Error inserting August periods:', insertError);
      throw new Error('Failed to insert August periods');
    }

    console.log(
      '✅ August 2025 periods inserted successfully:',
      insertedPeriods
    );

    return NextResponse.json({
      success: true,
      message: 'August 2025 periods inserted successfully',
      data: {
        insertedCount: insertedPeriods?.length || 0,
        periods: insertedPeriods,
      },
    });
  } catch (error) {
    console.error('❌ Error inserting August periods:', error);
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
