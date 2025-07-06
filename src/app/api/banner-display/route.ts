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
  max_banner: number; // panel_info에서 가져오는 max_banner
  latitude?: number; // 위도 추가
  longitude?: number; // 경도 추가
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
    console.log('🔍 조회 중인 구:', districtName);

    let query = supabase
      .from('panel_info')
      .select(
        `
        *,
        banner_panel_details (
          id,
          is_for_admin
        ),
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
      .eq('panel_status', 'active');

    // 송파구: panel_type = 'panel'인 것만 조회
    if (districtName === '송파구') {
      query = query.eq('panel_type', 'panel');
    }
    // 용산구: panel_type = 'with_lighting', 'no_lighting', 'semi-auto', 'panel'인 것만 조회
    else if (districtName === '용산구') {
      query = query.in('panel_type', [
        'with_lighting',
        'no_lighting',
        'semi-auto',
      ]);
    }

    const { data, error } = await query.order('panel_code', {
      ascending: true,
    });

    if (error) {
      throw error;
    }

    console.log('🔍 조회 결과:', {
      district: districtName,
      totalCount: data?.length || 0,
      panelTypes:
        data?.map((item) => ({
          panel_code: item.panel_code,
          panel_type: item.panel_type,
          nickname: item.nickname,
        })) || [],
    });

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
        banner_panel_details (
          id,
          is_for_admin
        ),
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
        ),
        panel_status
      `
      )
      .eq('display_type_id', (await getBannerDisplayTypeId()).id)
      .in('panel_status', ['active', 'maintenance']); // active와 maintenance 상태 모두 포함

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
        panel_status: string;
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
          panel_status: item.panel_status,
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
        panel_status: 'active',
      };
    }

    // 4. 기본 구 목록 생성
    const basicDistricts = Object.values(districtsMap);

    // 5. 각 구별로 신청기간과 계좌번호 정보를 가져와서 조합
    const processedDistricts = await Promise.all(
      basicDistricts.map(async (district) => {
        // 신청기간 가져오기 (DB에 없어도 이번달 기간으로 계산)
        const { data: periodData, error: periodError } = await supabase
          .from('region_gu_display_periods')
          .select('*')
          .eq('region_gu_id', district.id)
          .eq('display_type_id', (await getBannerDisplayTypeId()).id)
          .single();

        // DB에 데이터가 없어도 에러를 반환하지 않고 이번달 기간으로 계산
        console.log(`🔍 Period data for ${district.name}:`, {
          periodData,
          periodError,
        });

        // 이번달 16일~말일 계산 (2차는 항상 고정)
        const now = new Date();
        const secondHalfStart = new Date(now.getFullYear(), now.getMonth(), 16);
        const secondHalfEnd = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0
        );

        // 날짜를 YYYY-MM-DD 형식으로 변환 (로컬 시간 기준)
        const formatDate = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        let currentPeriodData;

        if (periodData && !periodError) {
          // DB에 데이터가 있으면 1차는 DB값 사용, 2차는 이번달 16일~말일 고정
          currentPeriodData = {
            first_half_from: periodData.first_half_from,
            first_half_to: periodData.first_half_to,
            second_half_from: formatDate(secondHalfStart),
            second_half_to: formatDate(secondHalfEnd),
          };
        } else {
          // DB에 데이터가 없으면 둘 다 이번달 계산값 사용
          const firstHalfStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const firstHalfEnd = new Date(now.getFullYear(), now.getMonth(), 15);

          currentPeriodData = {
            first_half_from: formatDate(firstHalfStart),
            first_half_to: formatDate(firstHalfEnd),
            second_half_from: formatDate(secondHalfStart),
            second_half_to: formatDate(secondHalfEnd),
          };
        }

        // 계좌번호 정보 가져오기
        const { data: bankData } = await supabase
          .from('bank_info')
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
          .eq('region_gu_id', district.id)
          .eq('display_types.name', 'banner_display')
          .single();

        return {
          id: district.id,
          name: district.name,
          code: district.code,
          logo_image_url: district.logo_image_url,
          panel_status: district.panel_status,
          period: currentPeriodData || null,
          bank_info: bankData || null,
        };
      })
    );

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
