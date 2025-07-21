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

    // 먼저 구 이름이나 코드로 region_gu 찾기
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
      .from('panel_info')
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
        region_gu: item.region_gu,
        region_dong: item.region_dong,
        led_panel_details: item.led_panel_details?.[0] || {
          id: '',
          exposure_count: 0,
          max_banners: 0,
          panel_width: 0,
          panel_height: 0,
        },
        led_slot_info: item.led_slot_info || [],
      })) || [];

    return NextResponse.json({
      success: true,
      data: transformedData as LEDDisplayData[],
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
      .from('panel_info')
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
        led_panel_details (
          id,
          exposure_count,
          max_banners,
          panel_width,
          panel_height
        ),
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
        led_slot_info: item.led_slot_info || [],
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

    // LED 전자게시대 구 목록 (정상 운영 + 준비중)
    const ledDistrictNames = [
      '광진구',
      '강동구',
      '동대문구',
      '강북구',
      '관악구',
      '동작구',
      '마포구',
      '영등포구',
      '용산구',
      '도봉구',
    ];

    const { data, error } = await supabase
      .from('region_gu')
      .select('id, name, code')
      .in('name', ledDistrictNames)
      .order('name');

    if (error) {
      console.error('❌ Error fetching available districts:', error);
      throw error;
    }

    // 각 구의 패널 상태 확인
    const { data: panelStatusData, error: panelStatusError } = await supabase
      .from('panel_info')
      .select(
        `
        region_gu!inner(
          id,
          name
        ),
        panel_status
      `
      )
      .eq('display_type_id', (await getLEDDisplayTypeId()).id)
      .in('region_gu.name', ledDistrictNames)
      .in('panel_status', ['active', 'maintenance']);

    if (panelStatusError) {
      console.error('❌ Error fetching panel status data:', panelStatusError);
      throw panelStatusError;
    }

    // 구별 maintenance 상태 확인
    const maintenanceMap: Record<string, boolean> = {};
    panelStatusData?.forEach((item: any) => {
      if (item.panel_status === 'maintenance') {
        maintenanceMap[item.region_gu.name] = true;
      }
    });

    const districts =
      data?.map((district) => ({
        id: district.id,
        name: district.name,
        code: district.code,
        panel_status: maintenanceMap[district.name] ? 'maintenance' : 'active',
      })) || [];

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

    // 1. LED 전자게시대 구 목록 (정상 운영 + 준비중)
    const ledDistrictNames = [
      '광진구',
      '강동구',
      '동대문구',
      '강북구',
      '관악구',
      '동작구',
      '마포구',
      '영등포구',
      '용산구',
      '도봉구',
    ];

    // LED 전자게시대 구 정보만 가져오기
    const { data: allDistricts, error: districtsError } = await supabase
      .from('region_gu')
      .select('id, name, code, logo_image_url')
      .in('name', ledDistrictNames)
      .order('name');

    if (districtsError) {
      console.error('❌ Error fetching districts data:', districtsError);
      throw districtsError;
    }

    // 2. LED 전자게시대 데이터 가져오기
    const { data: panelData, error: panelError } = await supabase
      .from('panel_info')
      .select(
        `
        region_gu!inner(
          id,
          name,
          code,
          logo_image_url
        ),
        panel_status
      `
      )
      .eq('display_type_id', (await getLEDDisplayTypeId()).id)
      .in('panel_status', ['active', 'maintenance']);

    if (panelError) {
      console.error('❌ Error fetching panel data:', panelError);
      throw panelError;
    }

    // 3. 카운트 집계 및 패널 상태 확인
    const countMap: Record<string, number> = {};
    const maintenanceMap: Record<string, boolean> = {};
    const districtsMap: Record<
      string,
      {
        id: string;
        name: string;
        code: string;
        logo_image_url: string | null;
        panel_status: string;
      }
    > = {};

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    panelData?.forEach((item: any) => {
      const districtName = item.region_gu.name;
      countMap[districtName] = (countMap[districtName] || 0) + 1;

      // maintenance 상태인 패널이 하나라도 있으면 해당 구는 maintenance
      if (item.panel_status === 'maintenance') {
        maintenanceMap[districtName] = true;
      }
    });

    // 4. 모든 구에 대해 데이터 설정 (LED 데이터가 없어도 구는 표시)
    allDistricts?.forEach((district) => {
      const hasActivePanels = countMap[district.name] > 0;
      const hasMaintenancePanels = maintenanceMap[district.name] === true;

      let panel_status = 'maintenance'; // 기본값
      if (hasActivePanels && !hasMaintenancePanels) {
        panel_status = 'active';
      } else if (hasActivePanels && hasMaintenancePanels) {
        panel_status = 'maintenance'; // maintenance 패널이 있으면 maintenance
      }

      districtsMap[district.name] = {
        id: district.id,
        name: district.name,
        code: district.code,
        logo_image_url: district.logo_image_url,
        panel_status: panel_status,
      };
    });

    // 5. LED 전자게시대 하드코딩된 계좌번호 정보
    const ledBankInfo = {
      강동구: {
        bank_name: '우리',
        account_number: '1005-602-397672',
        depositor: '(주)한성디자인기획',
      },
      강북구: {
        bank_name: '기업',
        account_number: '049-039964-04-104',
        depositor: '(주)한성디자인기획',
      },
      광진구: {
        bank_name: '기업',
        account_number: '049-039964-04-103',
        depositor: '(주)한성디자인기획',
      },
      관악구: {
        bank_name: '기업',
        account_number: '049-039964-04-150',
        depositor: '(주)한성디자인기획',
      },
      동작구: {
        bank_name: '기업',
        account_number: '049-039964-04-111',
        depositor: '(주)한성디자인기획',
      },
      동대문구: {
        bank_name: '기업',
        account_number: '049-039964-04-167',
        depositor: '(주)한성디자인기획',
      },
      마포구: {
        bank_name: '기업',
        account_number: '049-039964-04-105',
        depositor: '(주)한성디자인기획',
      },
      서대문구: {
        bank_name: '기업',
        account_number: '049-039964-04-106',
        depositor: '(주)한성디자인기획',
      },
      송파구: {
        bank_name: '기업',
        account_number: '049-039964-04-107',
        depositor: '(주)한성디자인기획',
      },
      용산구: {
        bank_name: '기업',
        account_number: '049-039964-04-108',
        depositor: '(주)한성디자인기획',
      },
    };

    // 4. 기본 구 목록 생성
    const basicDistricts = Object.values(districtsMap);

    // 5. LED 전자게시대는 상시접수이므로 period는 null, 계좌번호는 하드코딩
    const processedDistricts = basicDistricts.map((district) => ({
      id: district.id,
      name: district.name,
      code: district.code,
      logo_image_url: district.logo_image_url,
      panel_status: district.panel_status,
      period: null, // LED 전자게시대는 상시접수
      bank_info: ledBankInfo[district.name as keyof typeof ledBankInfo]
        ? {
            bank_name:
              ledBankInfo[district.name as keyof typeof ledBankInfo].bank_name,
            account_number:
              ledBankInfo[district.name as keyof typeof ledBankInfo]
                .account_number,
            depositor:
              ledBankInfo[district.name as keyof typeof ledBankInfo].depositor,
            region_gu: {
              id: district.id,
              name: district.name,
            },
            display_types: {
              id: '',
              name: 'led_display',
            },
          }
        : null,
    }));

    console.log('🔍 Processed LED districts data:', processedDistricts);
    console.log('🔍 LED counts data:', countMap);

    return NextResponse.json({
      success: true,
      data: {
        districts: processedDistricts,
        counts: countMap,
      },
    });
  } catch (error) {
    console.error('❌ Error in getAllDistrictsData:', error);
    throw error;
  }
}
