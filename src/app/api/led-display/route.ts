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
        region_dong (
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
        region_dong (
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

    console.log('🔍 모든 구의 LED Display 조회 결과:', {
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
    const displayTypeId = (await getLEDDisplayTypeId()).id;

    // panels 테이블에서 LED 전자게시대가 있는 구만 조회
    // DISTINCT를 사용하여 중복 제거
    const { data, error } = await supabase
      .from('panels')
      .select('region_gu!inner(id, name, code)')
      .eq('display_type_id', displayTypeId)
      .eq('panel_status', 'active');

    if (error) {
      console.error('❌ Error fetching available districts:', error);
      // 에러 발생 시 빈 배열 반환
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // 중복 제거 및 정렬
    const uniqueDistricts = new Map<string, { name: string }>();
    (data || []).forEach((item) => {
      const regionGu = item.region_gu as unknown as
        | { id: string; name: string; code: string }
        | null
        | undefined;
      if (
        regionGu &&
        typeof regionGu === 'object' &&
        !Array.isArray(regionGu) &&
        regionGu.name
      ) {
        uniqueDistricts.set(regionGu.name, {
          name: regionGu.name,
        });
      }
    });

    const districtNames = Array.from(uniqueDistricts.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    return NextResponse.json({
      success: true,
      data: districtNames,
    });
  } catch (error) {
    console.error('❌ Error in getAvailableDistricts:', error);
    // 에러 발생 시 빈 배열 반환
    return NextResponse.json({
      success: true,
      data: [],
    });
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
    console.log('🔍 Fetching LED display cache data...');

    // 1. 캐시 테이블에서 LED 전자게시대 구별 카드 정보 가져오기
    const { data: cacheData, error: cacheError } = await supabase
      .from('led_display_cache')
      .select('*')
      .order('display_order', { ascending: true });

    if (cacheError) {
      console.error('❌ Error fetching cache data:', cacheError);
      throw cacheError;
    }

    console.log('🔍 Cache data found:', cacheData?.length || 0);

    // 2. 캐시 데이터를 API 응답 형식으로 변환
    const processedDistricts =
      cacheData?.map((cache) => {
        // 가격 정책 정보 변환

        // LED 전자게시대는 모든 구에서 상담신청으로 표시
        const pricePolicies = [
          {
            id: `cache_led_consultation_${cache.region_gu_id}`,
            price_usage_type: 'default' as const,
            tax_price: 0,
            road_usage_fee: 0,
            advertising_fee: 0,
            total_price: 0,
            displayName: '상담문의',
          },
        ];

        // 입금계좌 정보 변환
        const bank_accounts = cache.bank_name
          ? {
              id: `cache-${cache.region_gu_id}`,
              bank_name: cache.bank_name,
              account_number: cache.account_number,
              depositor: cache.depositor,
              region_gu: {
                id: cache.region_gu_id,
                name: cache.region_name,
              },
              display_types: {
                id: '3119f6ed-81e4-4d62-b785-6a33bc7928f9',
                name: 'led_display',
              },
            }
          : null;

        return {
          id: cache.region_gu_id,
          name: cache.region_name,
          code: cache.region_code,
          logo_image_url: cache.logo_image_url,
          image: cache.district_image_url, // 구별 대표이미지
          panel_status: cache.panel_status || 'active', // 캐시에서 panel_status 가져오기
          phone_number: cache.phone_number,
          bank_accounts: bank_accounts,
          pricePolicies: pricePolicies,
          period: {
            first_half_from: '2024-01-01',
            first_half_to: '2024-12-31',
            second_half_from: '2024-01-01',
            second_half_to: '2024-12-31',
          },
        };
      }) || [];

    // 3. 카운트 정보 (캐시에서 panel_count 사용)
    const countMap: Record<string, number> = {};
    cacheData?.forEach((cache) => {
      countMap[cache.region_name] = cache.panel_count || 0;
    });

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
