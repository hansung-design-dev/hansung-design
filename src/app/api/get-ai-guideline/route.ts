import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district');
    const guidelineType = searchParams.get('guideline_type') || 'banner';

    if (!district) {
      return NextResponse.json(
        { success: false, error: 'District parameter is required' },
        { status: 400 }
      );
    }

    // 구 코드를 구 이름으로 변환
    const districtCodeToNameMap: { [key: string]: string } = {
      songpa: '송파구',
      seodaemun: '서대문구',
      mapo: '마포구',
      yongsan: '용산구',
      gwanak: '관악구',
      gwangjin: '광진구',
      dobong: '도봉구',
      dongjak: '동작구',
      yeongdeungpo: '영등포구',
      gangbuk: '강북구',
      gangdong: '강동구',
    };

    const actualDistrictName = districtCodeToNameMap[district] || district;

    // 먼저 display_types 테이블에서 banner_display의 ID를 찾습니다
    const { data: displayTypeData, error: displayTypeError } = await supabase
      .from('display_types')
      .select('id')
      .eq('name', 'banner_display')
      .single();

    if (displayTypeError || !displayTypeData) {
      console.error('Display type fetch error:', displayTypeError);
      return NextResponse.json(
        { success: false, error: 'Display type not found' },
        { status: 404 }
      );
    }

    // region_gu 테이블에서 해당 구를 조회
    const { data: regionData, error: regionError } = await supabase
      .from('region_gu')
      .select('id')
      .eq('display_type_id', displayTypeData.id)
      .eq('is_active', 'true')
      .eq('name', actualDistrictName)
      .single();

    if (regionError || !regionData) {
      console.error('Region fetch error:', regionError);
      return NextResponse.json(
        { success: false, error: 'District not found' },
        { status: 404 }
      );
    }

    // region_gu_guideline 테이블에서 AI 파일 URL을 가져옵니다
    const { data: guidelineData, error: guidelineError } = await supabase
      .from('region_gu_guideline')
      .select('ai_image_url')
      .eq('region_gu_id', regionData.id)
      .eq('guideline_type', guidelineType)
      .maybeSingle();

    // 데이터가 없거나 AI 파일 URL이 없는 경우
    if (guidelineError || !guidelineData || !guidelineData.ai_image_url) {
      console.log(
        `No AI guideline found for ${actualDistrictName} - ${guidelineType}`
      );
      return NextResponse.json(
        {
          success: false,
          error: 'AI 가이드라인 파일이 준비되지 않았습니다.',
          district: actualDistrictName,
          guidelineType,
        },
        { status: 200 } // 404 대신 200으로 반환하여 에러가 아닌 정상 응답으로 처리
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        aiFileUrl: guidelineData.ai_image_url,
        district: actualDistrictName,
        guidelineType,
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
