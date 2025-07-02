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
    const { data, error } = await supabase
      .from('display_types')
      .select('id')
      .eq('name', 'banner_display')
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error('Banner display type not found');
    }

    return data;
  } catch (error) {
    throw error;
  }
}

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

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: data as BannerDisplayData[],
    });
  } catch (error) {
    throw error;
  }
}

// 모든 구의 현수막 게시대 데이터 조회
async function getAllBannerDisplays() {
  try {
    // display_type_id 가져오기
    const displayType = await getBannerDisplayTypeId();

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

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: data as BannerDisplayData[],
    });
  } catch (error) {
    throw error;
  }
}

// 구별 현수막 게시대 개수 조회 (is_active인 구만)
async function getBannerDisplayCountsByDistrict() {
  try {
    const { data, error } = await supabase
      .from('panel_info')
      .select(
        `
        region_gu!inner (
          id,
          name,
          code,
          is_active
        )
      `
      )
      .eq('display_type_id', (await getBannerDisplayTypeId()).id)
      .eq('panel_status', 'active')
      .eq('region_gu.is_active', true);

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

  console.log('🔍 Banner Display API called with action:', action);

  try {
    switch (action) {
      case 'getAllDistrictsData':
        return await getAllDistrictsData();
      case 'getCounts':
        return await getBannerDisplayCountsByDistrict();
      case 'getByDistrict':
        return await getBannerDisplaysByDistrict(district!);
      case 'getAll':
        return await getAllBannerDisplays();
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ Banner Display API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 새로운 통합 API - 모든 구 데이터를 한번에 가져오기
async function getAllDistrictsData() {
  try {
    console.log('🔍 Fetching all districts data for banner display...');

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
      .eq('display_type_id', (await getBannerDisplayTypeId()).id)
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

    // 3. 강북구 추가 (데이터가 없어도 카드로 표시)
    if (!districtsMap['강북구']) {
      districtsMap['강북구'] = {
        id: 'gangbuk-placeholder',
        name: '강북구',
        code: 'gangbuk',
        logo_image_url: null,
      };
    }

    // 4. 현수막게시대 하드코딩된 신청기간과 계좌번호 정보
    const bannerPeriodInfo = {
      마포구: {
        first_half_from: '2025-07-05',
        first_half_to: '2025-07-20',
        second_half_from: '2025-07-21',
        second_half_to: '2025-08-04',
      },
      관악구: {
        first_half_from: '2025-07-01',
        first_half_to: '2025-07-15',
        second_half_from: '2025-07-16',
        second_half_to: '2025-07-31',
      },
      송파구: {
        first_half_from: '2025-07-01',
        first_half_to: '2025-07-15',
        second_half_from: '2025-07-16',
        second_half_to: '2025-07-31',
      },
      서대문구: {
        first_half_from: '2025-07-01',
        first_half_to: '2025-07-15',
        second_half_from: '2025-07-16',
        second_half_to: '2025-07-31',
      },
      용산구: {
        first_half_from: '2025-07-01',
        first_half_to: '2025-07-15',
        second_half_from: '2025-07-16',
        second_half_to: '2025-07-31',
      },
    };

    const bannerBankInfo = {
      관악구: {
        bank_name: '우리',
        account_number: '1005-103-367439',
        depositor: '(주)한성디자인기획',
      },
      송파구: {
        bank_name: '우리',
        account_number: '1005-303-618971',
        depositor: '(주)한성디자인기획',
      },
      서대문구: {
        bank_name: '기업',
        account_number: '049-039964-01-096',
        depositor: '(주)한성디자인기획',
      },
      용산구: {
        bank_name: '기업',
        account_number: '049-039964-04-128',
        depositor: '(주)한성디자인기획',
      },
      마포구: {
        bank_name: '기업',
        account_number: '049-039964-04-135',
        depositor: '(주)한성디자인기획',
      },
    };

    // 5. 기본 구 목록 생성
    const basicDistricts = Object.values(districtsMap);

    // 6. 하드코딩된 신청기간과 계좌번호 정보 추가
    const processedDistricts = basicDistricts.map((district) => ({
      id: district.id,
      name: district.name,
      code: district.code,
      logo_image_url: district.logo_image_url,
      period:
        bannerPeriodInfo[district.name as keyof typeof bannerPeriodInfo] ||
        null,
      bank_info: bannerBankInfo[district.name as keyof typeof bannerBankInfo]
        ? {
            bank_name:
              bannerBankInfo[district.name as keyof typeof bannerBankInfo]
                .bank_name,
            account_number:
              bannerBankInfo[district.name as keyof typeof bannerBankInfo]
                .account_number,
            depositor:
              bannerBankInfo[district.name as keyof typeof bannerBankInfo]
                .depositor,
            region_gu: {
              id: district.id,
              name: district.name,
            },
            display_types: {
              id: '',
              name: 'banner_display',
            },
          }
        : null,
    }));

    console.log('🔍 Processed districts data:', processedDistricts);
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
