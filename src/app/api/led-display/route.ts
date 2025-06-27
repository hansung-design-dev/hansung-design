import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

// LED 디스플레이 타입 정의
export interface LEDDisplayData {
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
  led_panel_details: {
    id: string;
    exposure_count: number;
    max_banners: number;
    panel_width: number;
    panel_height: number;
  };
  led_slot_info: {
    id: string;
    slot_number: number;
    slot_width_px: number;
    slot_height_px: number;
    position_x: number;
    position_y: number;
    total_price: number;
    tax_price: number;
    advertising_fee: number;
    road_usage_fee: number;
    administrative_fee: number;
    price_unit: string;
    panel_slot_status: string;
  }[];
}

// LED 디스플레이 타입 ID 조회
async function getLEDDisplayTypeId() {
  try {
    console.log('🔍 API: Getting LED display type ID...');

    const { data, error } = await supabase
      .from('display_types')
      .select('id')
      .eq('name', 'led_display')
      .single();

    console.log('🔍 API: Display type query result:', { data, error });

    if (error) {
      console.error('Error fetching LED display type:', error);
      throw error;
    }

    if (!data) {
      console.error('No LED display type found in database');
      throw new Error('LED display type not found');
    }

    console.log('🔍 API: Found LED display type ID:', data.id);
    return data;
  } catch (error) {
    console.error('Error in getLEDDisplayTypeId:', error);
    throw error;
  }
}

// 특정 구의 LED 전자게시대 데이터 조회
async function getLEDDisplaysByDistrict(districtName: string) {
  try {
    console.log('🔍 API: Fetching LED displays for district:', districtName);

    const { data, error } = await supabase
      .from('panel_info')
      .select(
        `
        *,
        led_panel_details (*),
        led_slot_info (
          id,
          slot_number,
          slot_width_px,
          slot_height_px,
          position_x,
          position_y,
          total_price,
          tax_price,
          advertising_fee,
          road_usage_fee,
          administrative_fee,
          price_unit,
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
      .eq('display_type_id', (await getLEDDisplayTypeId()).id)
      .eq('panel_status', 'active')
      .order('panel_code', { ascending: true });

    console.log('🔍 API: Supabase response data:', data);
    console.log('🔍 API: Supabase error:', error);

    if (error) {
      console.error('Error fetching LED displays:', error);
      throw error;
    }

    return data as LEDDisplayData[];
  } catch (error) {
    console.error('Error in getLEDDisplaysByDistrict:', error);
    throw error;
  }
}

// 모든 구의 LED 전자게시대 데이터 조회
async function getAllLEDDisplays() {
  try {
    console.log('🔍 API: Starting getAllLEDDisplays...');

    // display_type_id 가져오기
    const displayType = await getLEDDisplayTypeId();
    console.log('🔍 API: Display type ID:', displayType?.id);

    const { data, error } = await supabase
      .from('panel_info')
      .select(
        `
        *,
        led_panel_details (*),
        led_slot_info (
          id,
          slot_number,
          slot_width_px,
          slot_height_px,
          position_x,
          position_y,
          total_price,
          tax_price,
          advertising_fee,
          road_usage_fee,
          administrative_fee,
          price_unit,
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

    console.log('🔍 API: getAllLEDDisplays - Raw data:', data);
    console.log('🔍 API: getAllLEDDisplays - Error:', error);
    console.log('🔍 API: getAllLEDDisplays - Data length:', data?.length);

    if (error) {
      console.error('Error fetching all LED displays:', error);
      throw error;
    }

    return data as LEDDisplayData[];
  } catch (error) {
    console.error('Error in getAllLEDDisplays:', error);
    throw error;
  }
}

// 구별 LED 전자게시대 개수 조회
async function getLEDDisplayCountsByDistrict() {
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
      .eq('display_type_id', (await getLEDDisplayTypeId()).id)
      .eq('panel_status', 'active');

    if (error) {
      console.error('Error fetching LED display counts:', error);
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
    console.error('Error in getLEDDisplayCountsByDistrict:', error);
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
      '🔍 LED Display API called with action:',
      action,
      'district:',
      district
    );

    switch (action) {
      case 'getAll':
        const allData = await getAllLEDDisplays();
        return NextResponse.json({ success: true, data: allData });

      case 'getByDistrict':
        if (!district) {
          return NextResponse.json(
            { success: false, error: 'District parameter is required' },
            { status: 400 }
          );
        }
        const districtData = await getLEDDisplaysByDistrict(district);
        return NextResponse.json({ success: true, data: districtData });

      case 'getCounts':
        const counts = await getLEDDisplayCountsByDistrict();
        return NextResponse.json({ success: true, data: counts });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('LED Display API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
