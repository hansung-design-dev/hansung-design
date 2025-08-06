import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET() {
  try {
    console.log('🔍 Checking display_types table data...');

    // display_types 테이블의 모든 데이터 조회
    const { data: displayTypes, error } = await supabase
      .from('display_types')
      .select('*');

    if (error) {
      console.error('❌ Error fetching display types:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch display types' },
        { status: 500 }
      );
    }

    console.log('✅ Display types found:', displayTypes);

    return NextResponse.json({
      success: true,
      data: displayTypes,
    });
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 