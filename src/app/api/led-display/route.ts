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
  latitude: number;
  longitude: number;
  photo_url?: string | null;
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
  led_slots: {
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
    const { data, error } = await supabase
      .from('display_types')
      .select('id')
      .eq('name', 'led_display')
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error('LED display type not found');
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// 특정 구의 LED 전자게시대 데이터 조회
async function getLEDDisplaysByDistrict(districtName: string) {
  try {
    console.log('🔍 조회 중인 구:', districtName);

    // 먼저 구 이름 또는 코드로 region_gu 찾기
    const { data: regionData, error: regionError } = await supabase
      .from('region_gu')
      .select('id, name, code')
      .or(`name.eq.${districtName},code.eq.${districtName}`)
      .single();

    if (regionError || !regionData) {
      console.error('❌ Error finding region:', regionError);
      throw new Error('Region not found');
    }

    console.log('🔍 Found region:', regionData);

    const { data, error } = await supabase
      .from('panels')
      .select(
        `
        id,
        panel_code,
        nickname,
        address,
        panel_status,
        panel_type,
        latitude,
        longitude,
        photo_url,
        region_gu!inner (
          id,
          name,
          code
        ),
        region_dong!inner (
          id,
          name,
          district_code
        ),
        led_panel_details (
          id,
          exposure_count,
          max_banners,
          panel_width,
          panel_height
        ),
        led_slots (
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
        )
      `
      )
      .eq('region_gu.id', regionData.id)
      .eq('display_type_id', (await getLEDDisplayTypeId()).id)
      .in('panel_status', ['active', 'maintenance'])
      .order('panel_code', { ascending: true });

    if (error) {
      console.error('❌ Error fetching LED displays by district:', error);
      throw error;
    }

    console.log('🔍 API 응답 데이터 (첫 번째 아이템):', data?.[0]);
    console.log('🔍 총 데이터 개수:', data?.length);

    // 기본 데이터 구조로 변환
    const transformedData =
      data?.map((item) => ({
        id: item.id,
        panel_code: item.panel_code,
        nickname: item.nickname,
        address: item.address,
        panel_status: item.panel_status,
        panel_type: item.panel_type,
        latitude: item.latitude,
        longitude: item.longitude,
        photo_url: item.photo_url,
        region_gu: item.region_gu,
        region_dong: item.region_dong,
        led_panel_details: item.led_panel_details?.[0] || {
          id: '',
          exposure_count: 0,
          max_banners: 0,
          panel_width: 0,
          panel_height: 0,
        },
        led_slots: item.led_slots || [],
      })) || [];

    return NextResponse.json({
      success: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: transformedData as any,
    });
  } catch (error) {
    console.error('❌ Error in getLEDDisplaysByDistrict:', error);
    throw error;
  }
}

// 모든 구의 LED 전자게시대 데이터 조회
async function getAllLEDDisplays() {
  try {
    // display_type_id 가져오기
    const displayType = await getLEDDisplayTypeId();

    const { data, error } = await supabase
      .from('panels')
      .select(
        `
        id,
        panel_code,
        nickname,
        address,
        panel_status,
        panel_type,
        latitude,
        longitude,
        photo_url,
        led_panel_details (
          id,
          exposure_count,
          max_banners,
          panel_width,
          panel_height
        ),
        led_slots (
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
        )
      `
      )
      .eq('display_type_id', displayType.id)
      .in('panel_status', ['active', 'maintenance'])
      .order('panel_code', { ascending: true });

    if (error) {
      console.error('❌ Error fetching all LED displays:', error);
      throw error;
    }

    console.log('🔍 API 응답 데이터 (첫 번째 아이템):', data?.[0]);
    console.log('🔍 총 데이터 개수:', data?.length);

    // 기본 데이터 구조로 변환
    const transformedData =
      data?.map((item) => ({
        id: item.id,
        panel_code: item.panel_code,
        nickname: item.nickname,
        address: item.address,
        panel_status: item.panel_status,
        panel_type: item.panel_type,
        latitude: item.latitude,
        longitude: item.longitude,
        photo_url: item.photo_url,
        region_gu: item.region_gu,
        region_dong: {
          id: '',
          name: '',
          district_code: '',
        },
        led_panel_details: item.led_panel_details?.[0] || {
          id: '',
          exposure_count: 0,
          max_banners: 0,
          panel_width: 0,
          panel_height: 0,
        },
        led_slots: item.led_slots || [],
      })) || [];

    return NextResponse.json({
      success: true,
      data: transformedData as unknown as LEDDisplayData[],
    });
  } catch (error) {
    console.error('❌ Error in getAllLEDDisplays:', error);
    throw error;
  }
}

// 구별 LED 전자게시대 개수 조회
async function getLEDDisplayCountsByDistrict() {
  try {
    const { data, error } = await supabase
      .from('panels')
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
      throw error;
    }

    // 구별 개수 집계
    const counts: Record<string, number> = {};

    (data as unknown as { region_gu: { name: string } }[])?.forEach((item) => {
      const districtName = item.region_gu.name;
      counts[districtName] = (counts[districtName] || 0) + 1;
    });

    return NextResponse.json({ success: true, data: counts });
  } catch (error) {
    throw error;
  }
}

// GET 요청 처리
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const district = searchParams.get('district');

  console.log('🔍 LED Display API called with action:', action);

  try {
    switch (action) {
      case 'getAllDistrictsData':
        return await getAllDistrictsData();
      case 'getAvailableDistricts':
        return await getAvailableDistricts();
      case 'getCounts':
        return await getLEDDisplayCountsByDistrict();
      case 'getByDistrict':
        return await getLEDDisplaysByDistrict(district!);
      case 'getAll':
        return await getAllLEDDisplays();
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ LED Display API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// LED 전자게시대에서 사용 가능한 구 목록 조회
async function getAvailableDistricts() {
  try {
    console.log('🔍 Fetching available districts for LED display...');

    // panels에서 LED 전자게시대 구 목록과 데이터 추출 (두 단계 조건)
    const { data: panelData, error: panelError } = await supabase
      .from('panels')
      .select(
        `
        region_gu!inner(
          id,
          name,
          code
        ),
        panel_status
      `
      )
      .eq('display_type_id', (await getLEDDisplayTypeId()).id)
      .in('panel_status', ['active', 'maintenance'])
      .eq('region_gu.is_active', 'true')
      .order('region_gu(name)');

    if (panelError) {
      console.error('❌ Error fetching panel data:', panelError);
      throw panelError;
    }

    // 구별 데이터 그룹화
    const districtsMap: Record<
      string,
      {
        id: string;
        name: string;
        code: string;
        panel_status: string;
      }
    > = {};

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    panelData?.forEach((item: any) => {
      const districtName = item.region_gu.name;

      if (!districtsMap[districtName]) {
        districtsMap[districtName] = {
          id: item.region_gu.id,
          name: item.region_gu.name,
          code: item.region_gu.code,
          panel_status: item.panel_status,
        };
      } else {
        // 이미 있는 구라면 maintenance가 하나라도 있으면 maintenance로 설정
        if (item.panel_status === 'maintenance') {
          districtsMap[districtName].panel_status = 'maintenance';
        }
      }
    });

    const districts = Object.values(districtsMap);

    return NextResponse.json({
      success: true,
      data: districts,
    });
  } catch (error) {
    console.error('❌ Error in getAvailableDistricts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch available districts' },
      { status: 500 }
    );
  }
}

// 새로운 통합 API - 모든 구 데이터를 한번에 가져오기
async function getAllDistrictsData() {
  try {
    console.log('🔍 Fetching all districts data for LED display...');

    // 1. panels에서 LED 전자게시대 구 목록과 데이터 추출 (두 단계 조건)
    const { data: panelData, error: panelError } = await supabase
      .from('panels')
      .select(
        `
        region_gu!inner(
          id,
          name,
          code,
          logo_image_url,
          is_active
        ),
        panel_status
      `
      )
      .eq('display_type_id', (await getLEDDisplayTypeId()).id)
      .in('panel_status', ['active', 'maintenance']) // active와 maintenance 모두 포함
      .eq('region_gu.is_active', 'true') // 구가 활성화된 것만
      .order('region_gu(name)');

    if (panelError) {
      console.error('❌ Error fetching panel data:', panelError);
      throw panelError;
    }

    console.log('🔍 Panel data for LED display:', panelData);

    // 2. 구별 데이터 집계
    const countMap: Record<string, number> = {};
    const districtsMap: Record<
      string,
      {
        id: string;
        name: string;
        code: string;
        logo_image_url: string | null;
        panel_status: string;
        address: string;
        nickname: string;
        led_slots: {
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
    > = {};

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    panelData?.forEach((item: any) => {
      const districtName = item.region_gu.name;

      // 두 단계 조건 확인: is_active = 'true' (panel_status는 active/maintenance 모두 허용)
      if (item.region_gu.is_active === 'true') {
        countMap[districtName] = (countMap[districtName] || 0) + 1;

        // 구별 첫 번째 패널 정보 저장 (주소, 닉네임, led_slots)
        if (!districtsMap[districtName]) {
          districtsMap[districtName] = {
            id: item.region_gu.id,
            name: item.region_gu.name,
            code: item.region_gu.code,
            logo_image_url: item.region_gu.logo_image_url,
            panel_status: item.panel_status, // 실제 panel_status 사용
            address: item.address,
            nickname: item.nickname,
            led_slots: item.led_slots || [],
          };
        } else {
          // 이미 있는 구라면 maintenance가 하나라도 있으면 maintenance로 설정
          if (item.panel_status === 'maintenance') {
            districtsMap[districtName].panel_status = 'maintenance';
          }
        }
      }
    });

    // 3. 최종 구 목록 생성 (is_active = 'true'인 구들, panel_status는 실제 값 사용)
    const districts = Object.values(districtsMap).map((district) => ({
      ...district,
      panel_status: district.panel_status, // 실제 panel_status 사용
    }));

    // 4. 구별 은행 정보 가져오기
    const bankDataMap: Record<
      string,
      {
        id: string;
        bank_name: string;
        account_number: string;
        depositor: string;
        region_gu: {
          id: string;
          name: string;
        };
        display_types: {
          id: string;
          name: string;
        };
      }
    > = {};
    for (const district of districts) {
      try {
        const { data: bankData, error: bankError } = await supabase
          .from('bank_accounts')
          .select(
            `
            id,
            bank_name,
            account_number,
            depositor,
            region_gu!inner(
              id,
              name
            ),
            display_types!inner(
              id,
              name
            )
          `
          )
          .eq('region_gu.name', district.name)
          .eq('display_types.name', 'led_display')
          .single();

        if (!bankError && bankData) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          bankDataMap[district.name] = bankData as any;
        }
      } catch (err) {
        console.warn(`Failed to fetch bank info for ${district.name}:`, err);
      }
    }

    // 5. 최종 응답 데이터 구성
    const finalDistricts = districts.map((district) => ({
      id: district.id,
      name: district.name,
      code: district.code,
      logo_image_url: district.logo_image_url,
      panel_status: district.panel_status,
      period: null, // LED 전자게시대는 상시접수
      bank_accounts: bankDataMap[district.name] || null,
    }));

    console.log('🔍 Final LED districts data:', finalDistricts);
    console.log('🔍 LED counts data:', countMap);

    return NextResponse.json({
      success: true,
      data: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        districts: finalDistricts as any,
        counts: countMap,
      },
    });
  } catch (error) {
    console.error('❌ Error in getAllDistrictsData:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch all districts data' },
      { status: 500 }
    );
  }
}
