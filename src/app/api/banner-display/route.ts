import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

// 현수막 게시대 타입 정의
export interface BannerDisplayData {
  id: string;
  panel_code: number;
  nickname: string | null;
  address: string;
  panel_status: string;
  panel_type: string;
  region_gu: {
    id: string;
    name: string;
    code: string;
  };
  region_dong: {
    id: string;
    name: string;
    district_code: string;
  };
  banner_panel_details: {
    id: string;
    max_banners: number;
    panel_width: number;
    panel_height: number;
    is_for_admin: boolean;
  };
  banner_slot_info: {
    id: string;
    slot_number: number;
    slot_name: string;
    max_width: number;
    max_height: number;
    total_price: number;
    tax_price: number;
    advertising_fee: number;
    road_usage_fee: number;
    banner_type: string;
    price_unit: string;
    is_premium: boolean;
    panel_slot_status: string;
  }[];
}

// 현수막 게시대 타입 ID 조회
async function getBannerDisplayTypeId() {
  try {
    console.log('🔍 API: Getting banner display type ID...');

    const { data, error } = await supabase
      .from('display_types')
      .select('id')
      .eq('name', 'banner_display')
      .single();

    console.log('🔍 API: Display type query result:', { data, error });

    if (error) {
      console.error('Error fetching banner display type:', error);
      throw error;
    }

    if (!data) {
      console.error('No banner display type found in database');
      throw new Error('Banner display type not found');
    }

    console.log('🔍 API: Found banner display type ID:', data.id);
    return data;
  } catch (error) {
    console.error('Error in getBannerDisplayTypeId:', error);
    throw error;
  }
}

// 특정 구의 현수막 게시대 데이터 조회
async function getBannerDisplaysByDistrict(districtName: string) {
  try {
    console.log('🔍 API: Fetching banner displays for district:', districtName);

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
          advertising_fee,
          road_usage_fee,
          banner_type,
          price_unit,
          is_premium,
          panel_slot_status
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

    console.log('🔍 API: Supabase response data:', data);
    console.log('🔍 API: Supabase error:', error);

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

// 모든 구의 현수막 게시대 데이터 조회
async function getAllBannerDisplays() {
  try {
    console.log('🔍 API: Starting getAllBannerDisplays...');

    // display_type_id 가져오기
    const displayType = await getBannerDisplayTypeId();
    console.log('🔍 API: Display type ID:', displayType?.id);

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
          advertising_fee,
          road_usage_fee,
          banner_type,
          price_unit,
          is_premium,
          panel_slot_status
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
      .eq('display_type_id', displayType.id)
      .eq('panel_status', 'active')
      .order('panel_code', { ascending: true });

    console.log('🔍 API: getAllBannerDisplays - Raw data:', data);
    console.log('🔍 API: getAllBannerDisplays - Error:', error);
    console.log('🔍 API: getAllBannerDisplays - Data length:', data?.length);

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
