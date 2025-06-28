import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const districtName = searchParams.get('district');

    if (action === 'getLogos') {
      // 모든 구의 로고 정보 가져오기
      const { data, error } = await supabase
        .from('region_gu')
        .select('id, name, logo_image_url')
        .not('logo_image_url', 'is', null);

      if (error) {
        console.error('Error fetching region logos:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to fetch region logos' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: data || [],
      });
    }

    if (action === 'getLogo' && districtName) {
      // 특정 구의 로고 정보 가져오기
      const { data, error } = await supabase
        .from('region_gu')
        .select('id, name, logo_image_url')
        .eq('name', districtName)
        .single();

      if (error) {
        console.error('Error fetching region logo:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to fetch region logo' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: data,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
