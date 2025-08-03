import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

// LED Display 타입 정의
export interface LEDDisplayData {
  id: string;
  panel_code: number;
  nickname: string | null;
  address: string;
  panel_status: string;
  panel_type: string;
  photo_url?: string;
  latitude?: number;
  longitude?: number;
  region_gu: {
    id: string;
    name: string;
    code: string;
  };
  region_dong: {
    id: string;
    name: string;
  };
  led_panel_details: {
    id: string;
    exposure_count: number;
    panel_width: number;
    panel_height: number;
    max_banners: number;
  };
  led_slots: {
    id: string;
    slot_number: number;
    slot_name: string;
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
    notes: string;
  }[];
}

// LED Display 타입 ID 조회
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

// 특정 구의 LED Display 데이터 조회
async function getLEDDisplaysByDistrict(districtName: string) {
  try {
    console.log('🔍 LED Display 조회 중인 구:', districtName);

    const query = supabase
      .from('panels')
      .select(
        `
        *,
        led_panel_details (
          id,
          exposure_count,
          panel_width,
          panel_height,
          max_banners
        ),
        led_slots (
          id,
          slot_number,
          slot_name,
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
          name
        )
      `
      )
      .eq('region_gu.name', districtName)
      .eq('display_type_id', (await getLEDDisplayTypeId()).id)
      .eq('panel_status', 'active');

    const { data, error } = await query.order('panel_code', {
      ascending: true,
    });

    if (error) {
      throw error;
    }

    console.log('🔍 LED Display 조회 결과:', {
      district: districtName,
      totalCount: data?.length || 0,
    });

    return NextResponse.json({
      success: true,
      data: data as LEDDisplayData[],
    });
  } catch (error) {
    throw error;
  }
}

// 모든 구의 LED Display 데이터 조회
async function getAllLEDDisplays() {
  try {
    const displayType = await getLEDDisplayTypeId();

    const { data, error } = await supabase
      .from('panels')
      .select(
        `
        *,
        led_panel_details (
          id,
          exposure_count,
          panel_width,
          panel_height,
          max_banners
        ),
        led_slots (
          id,
          slot_number,
          slot_name,
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
          name
        )
      `
      )
      .eq('display_type_id', displayType.id)
      .eq('panel_status', 'active')
      .order('panel_code', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: data as LEDDisplayData[],
    });
  } catch (error) {
    throw error;
  }
}

// 구별 LED Display 개수 조회 (새로운 region_gu_display_types 테이블 활용)
async function getLEDDisplayCountsByDistrict() {
  try {
    const { data, error } = await supabase
      .from('active_region_gu_display_types')
      .select('region_name, region_code')
      .eq('display_type_name', 'led_display');

    if (error) {
      throw error;
    }

    // 구별 개수 집계 (panels 테이블에서 실제 개수 가져오기)
    const counts: Record<string, number> = {};

    for (const region of data || []) {
      const { count } = await supabase
        .from('panels')
        .select('*', { count: 'exact', head: true })
        .eq('region_gu.name', region.region_name)
        .eq('display_type_id', (await getLEDDisplayTypeId()).id)
        .eq('panel_status', 'active');

      counts[region.region_name] = count || 0;
    }

    return NextResponse.json({ success: true, data: counts });
  } catch (error) {
    throw error;
  }
}

// 사용 가능한 구 목록 조회
async function getAvailableDistricts() {
  try {
    const { data, error } = await supabase
      .from('region_gu')
      .select('name')
      .eq('display_type_id', '3119f6ed-81e4-4d62-b785-6a33bc7928f9')
      .in('is_active', ['true', 'maintenance'])
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error('❌ Error in getAvailableDistricts:', error);
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

// 새로운 통합 API - 모든 구 데이터를 한번에 가져오기 (최적화된 버전)
async function getAllDistrictsData() {
  try {
    console.log(
      '🔍 Fetching all districts data for LED display (new table structure)...'
    );

    // 1. region_gu 테이블에서 led_display가 활성화된 구와 준비중인 구 목록 가져오기
    const { data: activeRegions, error: regionError } = await supabase
      .from('region_gu')
      .select('*')
      .eq('display_type_id', '3119f6ed-81e4-4d62-b785-6a33bc7928f9')
      .in('is_active', ['true', 'maintenance']);

    if (regionError) {
      console.error('❌ Error fetching active regions:', regionError);
      throw regionError;
    }

    // 2. regions 데이터
    const regions = activeRegions || [];

    // 3. 구별 카드 순서 변경: 가나다순 정렬 (LED는 모든 구가 포함되므로 가나다순 유지)
    const sortedRegions = regions.sort((a, b) => {
      // 먼저 상태별로 정렬 (true -> maintenance)
      if (a.is_active !== b.is_active) {
        return a.is_active === 'true' ? -1 : 1;
      }
      // 같은 상태 내에서는 가나다순
      return a.name.localeCompare(b.name);
    });

    console.log('🔍 Active regions found:', sortedRegions?.length || 0);

    // 4. 각 활성화된 구별로 데이터 처리
    const processedDistricts = await Promise.all(
      sortedRegions.map(async (region) => {
        // 가격 정책 정보 조회 (해당 구의 LED 패널에서 가격 정보 가져오기)
        let pricePolicies: {
          id: string;
          price_usage_type: string;
          tax_price: number;
          road_usage_fee: number;
          advertising_fee: number;
          total_price: number;
        }[] = [];

        // 해당 구의 LED 패널들의 가격 정보를 가져옴
        const { data: ledPricePolicies } = await supabase
          .from('led_display_price_policy')
          .select('*')
          .in(
            'panel_id',
            (
              await supabase
                .from('panels')
                .select('id')
                .eq('region_gu_id', region.id)
                .eq('display_type_id', '3119f6ed-81e4-4d62-b785-6a33bc7928f9')
                .eq('panel_status', 'active')
            ).data?.map((p) => p.id) || []
          );

        if (ledPricePolicies && ledPricePolicies.length > 0) {
          // default 타입의 가격 정책을 우선적으로 사용
          const defaultPolicy =
            ledPricePolicies.find((p) => p.price_usage_type === 'default') ||
            ledPricePolicies[0];
          pricePolicies = [
            {
              id: defaultPolicy.id,
              price_usage_type: defaultPolicy.price_usage_type,
              tax_price: defaultPolicy.tax_price,
              road_usage_fee: defaultPolicy.road_usage_fee,
              advertising_fee: defaultPolicy.advertising_fee,
              total_price: defaultPolicy.total_price,
            },
          ];
        }

        // 계좌번호 정보 가져오기
        const { data: bankData } = await supabase
          .from('bank_accounts')
          .select(
            `
            *,
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
          .eq('region_gu_id', region.id)
          .eq('display_types.name', 'led_display')
          .single();

        return {
          id: region.id,
          name: region.name,
          code: region.code,
          logo_image_url: region.logo_image_url,
          panel_status:
            region.is_active === 'maintenance' ? 'maintenance' : 'active',
          bank_accounts: bankData,
          pricePolicies: pricePolicies,
          period: {
            first_half_from: '2024-01-01',
            first_half_to: '2024-12-31',
            second_half_from: '2024-01-01',
            second_half_to: '2024-12-31',
          },
        };
      })
    );

    // 5. 카운트 정보 가져오기
    const countMap: Record<string, number> = {};
    for (const region of sortedRegions) {
      const { count } = await supabase
        .from('panels')
        .select('*', { count: 'exact', head: true })
        .eq('region_gu_id', region.id)
        .eq('display_type_id', '3119f6ed-81e4-4d62-b785-6a33bc7928f9')
        .eq('panel_status', 'active');

      countMap[region.name] = count || 0;
    }

    console.log('🔍 Processed districts data:', processedDistricts.length);
    console.log('🔍 Counts data:', countMap);

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
