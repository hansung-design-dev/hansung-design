import { supabase } from '../supabase';

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
export async function getLEDDisplayTypeId() {
  const { data, error } = await supabase
    .from('display_types')
    .select('id')
    .eq('name', 'led_display')
    .single();

  if (error) {
    console.error('Error fetching LED display type:', error);
    throw error;
  }

  return data;
}

// 특정 구의 LED 전자게시대 데이터 조회
export async function getLEDDisplaysByDistrict(districtName: string) {
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
export async function getAllLEDDisplays() {
  try {
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
          advertising_price,
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
      .eq('display_type_id', (await getLEDDisplayTypeId()).id)
      .eq('panel_status', 'active')
      .order('panel_code', { ascending: true });

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
export async function getLEDDisplayCountsByDistrict() {
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

// 간단한 테스트 함수 - 기본 데이터 조회
export async function testLEDBasicDataFetch() {
  try {
    console.log('🔍 Testing LED basic data fetch...');

    // 1. region_gu 테이블에서 관악구 확인
    const { data: regionData, error: regionError } = await supabase
      .from('region_gu')
      .select('*')
      .eq('name', '관악구');

    console.log('Region data:', regionData);
    console.log('Region error:', regionError);

    // 2. display_types 테이블에서 led_display 확인
    const { data: displayData, error: displayError } = await supabase
      .from('display_types')
      .select('*')
      .eq('name', 'led_display');

    console.log('Display data:', displayData);
    console.log('Display error:', displayError);

    // 3. panel_info 테이블에서 LED 데이터 확인
    const { data: panelData, error: panelError } = await supabase
      .from('panel_info')
      .select('*')
      .eq('display_type_id', displayData?.[0]?.id)
      .limit(5);

    console.log('Panel data:', panelData);
    console.log('Panel error:', panelError);

    // 4. led_panel_details 테이블 확인
    const { data: ledPanelData, error: ledPanelError } = await supabase
      .from('led_panel_details')
      .select('*')
      .limit(5);

    console.log('LED Panel Details data:', ledPanelData);
    console.log('LED Panel Details error:', ledPanelError);

    // 5. led_slot_info 테이블 확인
    const { data: ledSlotData, error: ledSlotError } = await supabase
      .from('led_slot_info')
      .select('*')
      .limit(5);

    console.log('LED Slot Info data:', ledSlotData);
    console.log('LED Slot Info error:', ledSlotError);

    // 6. 전체 LED 데이터 조회 테스트
    if (displayData && displayData.length > 0) {
      const { data: fullLEDData, error: fullLEDError } = await supabase
        .from('panel_info')
        .select(
          `
          *,
          led_panel_details (*),
          led_slot_info (*),
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
        .eq('display_type_id', displayData[0].id)
        .eq('panel_status', 'active')
        .limit(3);

      console.log('Full LED data:', fullLEDData);
      console.log('Full LED error:', fullLEDError);
    }

    return {
      regionData,
      displayData,
      panelData,
      ledPanelData,
      ledSlotData,
      errors: {
        regionError,
        displayError,
        panelError,
        ledPanelError,
        ledSlotError,
      },
    };
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  }
}
