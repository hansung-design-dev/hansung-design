import { supabase, BannerDisplayData } from '../supabase';

// 특정 구의 현수막 게시대 데이터 조회
export async function getBannerDisplaysByDistrict(districtName: string) {
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
export async function getBannerDisplayTypeId() {
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
export async function getAllBannerDisplays() {
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
export async function getBannerDisplayCountsByDistrict() {
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

    // 실제 데이터 구조 확인
    console.log('🔍 Count data structure:', data);
    console.log('🔍 First item:', data?.[0]);
    console.log('🔍 Data type:', typeof data);
    console.log('🔍 Is array:', Array.isArray(data));

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

// 간단한 테스트 함수 - 기본 데이터 조회
export async function testBasicDataFetch() {
  try {
    console.log('🔍 Testing basic data fetch...');

    // 1. region_gu 테이블에서 관악구 확인
    const { data: regionData, error: regionError } = await supabase
      .from('region_gu')
      .select('*')
      .eq('name', '관악구');

    console.log('Region data:', regionData);
    console.log('Region error:', regionError);

    // 2. display_types 테이블에서 banner_display 확인
    const { data: displayData, error: displayError } = await supabase
      .from('display_types')
      .select('*')
      .eq('name', 'banner_display');

    console.log('Display data:', displayData);
    console.log('Display error:', displayError);

    // 3. panel_info 테이블에서 기본 데이터 확인
    const { data: panelData, error: panelError } = await supabase
      .from('panel_info')
      .select('*')
      .limit(5);

    console.log('Panel data:', panelData);
    console.log('Panel error:', panelError);

    return {
      regionData,
      displayData,
      panelData,
      errors: { regionError, displayError, panelError },
    };
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  }
}
