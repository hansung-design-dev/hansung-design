import { NextRequest, NextResponse } from 'next/server';
import { supabase, BannerDisplayData } from '@/src/lib/supabase';

// 특정 구의 현수막 게시대 데이터 조회
async function getBannerDisplaysByDistrict(districtName: string) {
  try {
    const { data, error } = await supabase
      .from('panel_info')
      .select(
        `
        *,
        banner_panel_details (*),
        banner_slot_info (
          id,
          slot_number,
          slot_name,
          max_width,
          max_height,
          total_price,
          tax_price,
          banner_type,
          price_unit,
          is_premium,
          panel_slot_status,
          notes
        ),
        region_gu!inner (
          id,
          name,
          code
        ),
        region_dong!inner (
          id,
          name,
          district_code
        )
      `
      )
      .eq('region_gu.name', districtName)
      .eq('display_type_id', (await getBannerDisplayTypeId()).id)
      .eq('panel_status', 'active')
      .order('panel_code', { ascending: true });

    if (error) {
      console.error('Error fetching banner displays:', error);
      throw error;
    }

    return data as BannerDisplayData[];
  } catch (error) {
    console.error('Error in getBannerDisplaysByDistrict:', error);
    throw error;
  }
}

// 현수막 디스플레이 타입 ID 조회
async function getBannerDisplayTypeId() {
  const { data, error } = await supabase
    .from('display_types')
    .select('id')
    .eq('name', 'banner_display')
    .single();

  if (error) {
    console.error('Error fetching banner display type:', error);
    throw error;
  }

  return data;
}

// 모든 구의 현수막 게시대 데이터 조회
async function getAllBannerDisplays() {
  try {
    const { data, error } = await supabase
      .from('panel_info')
      .select(
        `
        *,
        banner_panel_details (*),
        banner_slot_info (
          id,
          slot_number,
          slot_name,
          max_width,
          max_height,
          total_price,
          tax_price,
          banner_type,
          price_unit,
          is_premium,
          panel_slot_status,
          notes
        ),
        region_gu!inner (
          id,
          name,
          code
        ),
        region_dong!inner (
          id,
          name,
          district_code
        )
      `
      )
      .eq('display_type_id', (await getBannerDisplayTypeId()).id)
      .eq('panel_status', 'active')
      .order('panel_code', { ascending: true });

    if (error) {
      console.error('Error fetching all banner displays:', error);
      throw error;
    }

    return data as BannerDisplayData[];
  } catch (error) {
    console.error('Error in getAllBannerDisplays:', error);
    throw error;
  }
}

// 구별 현수막 게시대 개수 조회
async function getBannerDisplayCountsByDistrict() {
  try {
    const { data, error } = await supabase
      .from('panel_info')
      .select(
        `
        region_gu!inner (
          id,
          name,
          code
        )
      `
      )
      .eq('display_type_id', (await getBannerDisplayTypeId()).id)
      .eq('panel_status', 'active');

    if (error) {
      console.error('Error fetching banner display counts:', error);
      throw error;
    }

    // 구별 개수 집계
    const counts: Record<string, number> = {};

    (data as unknown as { region_gu: { name: string } }[])?.forEach((item) => {
      const districtName = item.region_gu.name;
      counts[districtName] = (counts[districtName] || 0) + 1;
    });

    return counts;
  } catch (error) {
    console.error('Error in getBannerDisplayCountsByDistrict:', error);
    throw error;
  }
}

// GET 요청 처리
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const district = searchParams.get('district');

    console.log(
      '🔍 Banner Display API called with action:',
      action,
      'district:',
      district
    );

    switch (action) {
      case 'getAll':
        const allData = await getAllBannerDisplays();
        return NextResponse.json({ success: true, data: allData });

      case 'getByDistrict':
        if (!district) {
          return NextResponse.json(
            { success: false, error: 'District parameter is required' },
            { status: 400 }
          );
        }
        const districtData = await getBannerDisplaysByDistrict(district);
        return NextResponse.json({ success: true, data: districtData });

      case 'getCounts':
        const counts = await getBannerDisplayCountsByDistrict();
        return NextResponse.json({ success: true, data: counts });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Banner Display API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
