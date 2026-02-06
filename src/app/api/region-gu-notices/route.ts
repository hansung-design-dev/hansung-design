import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export interface RegionGuNotice {
  id: string;
  region_gu_id: string;
  notice_type: string;
  title: string;
  items: string[];
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// GET: 구별 유의사항 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const districtName = searchParams.get('district');
    const noticeType = searchParams.get('noticeType');

    if (!districtName) {
      return NextResponse.json(
        { success: false, error: 'district parameter is required' },
        { status: 400 }
      );
    }

    // 구 이름으로 region_gu_id 조회
    const { data: regionData, error: regionError } = await supabase
      .from('region_gu')
      .select('id')
      .eq('name', districtName)
      .limit(1);

    if (regionError || !regionData || regionData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Region not found' },
        { status: 404 }
      );
    }

    const regionGuId = regionData[0].id;

    // 유의사항 조회
    let query = supabase
      .from('region_gu_notices')
      .select('*')
      .eq('region_gu_id', regionGuId)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (noticeType) {
      query = query.eq('notice_type', noticeType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching region_gu_notices:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch notices' },
        { status: 500 }
      );
    }

    // items가 문자열 배열로 저장된 경우 파싱
    const parsedData = (data || []).map((notice) => ({
      ...notice,
      items: Array.isArray(notice.items)
        ? notice.items.map((item: unknown) => {
            if (typeof item === 'string') {
              try {
                return JSON.parse(item);
              } catch {
                return { text: item, important: false };
              }
            }
            return item;
          })
        : [],
    }));

    return NextResponse.json({
      success: true,
      data: parsedData,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
