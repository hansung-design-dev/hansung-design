import { NextResponse } from 'next/server';
import { supabase } from '@/src/app/api/supabase';

export async function GET() {
  try {
    // 모든 공공디자인 데이터 확인
    const { data: allData, error: allError } = await supabase
      .from('public_design_contents')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (allError) {
      console.error('Error fetching all data:', allError);
      return NextResponse.json(
        { error: 'Failed to fetch data' },
        { status: 500 }
      );
    }

    // list 타입만 확인
    const { data: listData, error: listError } = await supabase
      .from('public_design_contents')
      .select('*')
      .eq('design_contents_type', 'list')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (listError) {
      console.error('Error fetching list data:', listError);
      return NextResponse.json(
        { error: 'Failed to fetch list data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      allData,
      listData,
      summary: {
        totalRecords: allData?.length || 0,
        listRecords: listData?.length || 0,
        categories: listData?.map((item) => item.project_category) || [],
        displayOrders: listData?.map((item) => item.display_order) || [],
      },
    });
  } catch (error) {
    console.error('Error in test API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
