import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const districtName = searchParams.get('district');
    const guidelineType = searchParams.get('guideline_type') || 'panel';

    if (!districtName) {
      return NextResponse.json(
        { success: false, error: 'District parameter is required' },
        { status: 400 }
      );
    }

    // 먼저 구 정보를 가져와서 region_gu_id를 얻습니다
    const { data: regionData, error: regionError } = await supabase
      .from('region_gu')
      .select('id')
      .eq('name', districtName)
      .single();

    if (regionError || !regionData) {
      return NextResponse.json(
        { success: false, error: 'District not found' },
        { status: 404 }
      );
    }

    // 가이드라인 데이터를 가져옵니다
    const { data: guidelineData, error: guidelineError } = await supabase
      .from('panel_guideline')
      .select('*')
      .eq('region_gu_id', regionData.id)
      .eq('guideline_type', guidelineType)
      .single();

    if (guidelineError) {
      console.error('Guideline fetch error:', guidelineError);
      return NextResponse.json(
        { success: false, error: 'Guideline not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: guidelineData,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
