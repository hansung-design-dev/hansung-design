import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET() {
  try {
    console.log('🔍 Checking region_gu table data...');

    // region_gu 테이블의 모든 데이터 조회
    const { data: regions, error } = await supabase
      .from('region_gu')
      .select('id, name, code, is_active, display_type_id')
      .eq('is_active', 'true');

    if (error) {
      console.error('❌ Error fetching regions:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch regions' },
        { status: 500 }
      );
    }

    console.log('✅ Regions found:', regions);

    return NextResponse.json({
      success: true,
      data: regions,
    });
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
