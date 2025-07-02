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

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data: data as LEDDisplayData[] });
  } catch (error) {
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

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data: data as LEDDisplayData[] });
  } catch (error) {
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

// 새로운 통합 API - 모든 구 데이터를 한번에 가져오기
async function getAllDistrictsData() {
  try {
    console.log('🔍 Fetching all districts data for LED display...');

    // 1. 기본 구 정보와 카운트를 한번에 가져오기
    const { data: panelData, error: panelError } = await supabase
      .from('panel_info')
      .select(
        `
        region_gu!inner(
          id,
          name,
          code,
          logo_image_url
        )
      `
      )
      .eq('display_type_id', (await getLEDDisplayTypeId()).id)
      .eq('panel_status', 'active');

    if (panelError) {
      console.error('❌ Error fetching panel data:', panelError);
      throw panelError;
    }

    // 2. 카운트 집계
    const countMap: Record<string, number> = {};
    const districtsMap: Record<
      string,
      {
        id: string;
        name: string;
        code: string;
        logo_image_url: string | null;
      }
    > = {};

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    panelData?.forEach((item: any) => {
      const districtName = item.region_gu.name;
      countMap[districtName] = (countMap[districtName] || 0) + 1;

      if (!districtsMap[districtName]) {
        districtsMap[districtName] = {
          id: item.region_gu.id,
          name: item.region_gu.name,
          code: item.region_gu.code,
          logo_image_url: item.region_gu.logo_image_url,
        };
      }
    });

    // 3. LED 전자게시대 하드코딩된 계좌번호 정보
    const ledBankInfo = {
      강동구: {
        bank_name: '우리',
        account_number: '1005-602-397672',
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
    };

    // 4. 기본 구 목록 생성
    const basicDistricts = Object.values(districtsMap);

    // 5. LED 전자게시대는 상시접수이므로 period는 null, 계좌번호는 하드코딩
    const processedDistricts = basicDistricts.map((district) => ({
      id: district.id,
      name: district.name,
      code: district.code,
      logo_image_url: district.logo_image_url,
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
