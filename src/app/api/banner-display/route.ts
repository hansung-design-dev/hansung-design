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
  photo_url?: string; // 사진 URL 추가
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
    banner_type: string;
    price_unit: string;
    panel_slot_status: string;
    // banner_slot_price_policy 정보로 가격 정보 대체
    price_policies: {
      id: string;
      price_usage_type: 'default' | 'public_institution' | 'company';
      tax_price: number;
      road_usage_fee: number;
      advertising_fee: number;
      total_price: number;
    }[];
  }[];
  inventory_info?: {
    current_period: {
      total_slots: number;
      available_slots: number;
      closed_slots: number;
      period: string;
      year_month: string;
    } | null;
    first_half: {
      total_slots: number;
      available_slots: number;
      closed_slots: number;
    } | null;
    second_half: {
      total_slots: number;
      available_slots: number;
      closed_slots: number;
    } | null;
  };
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

    // 현재 년월 계산 (한국 시간 기준)
    const now = new Date();
    const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const currentYear = koreaTime.getFullYear();
    const currentMonth = koreaTime.getMonth() + 1;
    const currentDay = koreaTime.getDate();

    // 7일 전까지 신청 가능하므로 6일 전부터는 다음 기간 표시
    let targetYear = currentYear;
    let targetMonth = currentMonth;
    if (currentDay >= 13) {
      if (currentMonth === 12) {
        targetYear = currentYear + 1;
        targetMonth = 1;
      } else {
        targetMonth = currentMonth + 1;
      }
    }

    const targetYearMonth = `${targetYear}-${String(targetMonth).padStart(
      2,
      '0'
    )}`;
    console.log('🔍 Target year month for inventory:', targetYearMonth);

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
          banner_type,
          price_unit,
          panel_slot_status,
          banner_slot_price_policy (
            id,
            price_usage_type,
            tax_price,
            road_usage_fee,
            advertising_fee,
            total_price
          )
        ),
        banner_slot_inventory (
          id,
          total_slots,
          available_slots,
          closed_slots,
          region_gu_display_periods (
            id,
            year_month,
            period,
            period_from,
            period_to
          )
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
    // 용산구: panel_type = 'with_lighting', 'no_lighting', 'semi_auto', 'panel'인 것만 조회
    else if (districtName === '용산구') {
      query = query.in('panel_type', [
        'with_lighting',
        'no_lighting',
        'semi_auto',
        'panel',
      ]);
    }

    const { data, error } = await query.order('panel_code', {
      ascending: true,
    });

    if (error) {
      throw error;
    }

    // 재고 정보를 기간별로 매핑하여 데이터에 추가
    const dataWithInventory = data?.map((item) => {
      // 현재 기간의 재고 정보 찾기
      const currentPeriodInventory = item.banner_slot_inventory?.find(
        (inv: { region_gu_display_periods?: { year_month?: string } }) =>
          inv.region_gu_display_periods?.year_month === targetYearMonth
      );

      // 상하반기별 재고 정보 매핑
      const firstHalfInventory = item.banner_slot_inventory?.find(
        (inv: {
          region_gu_display_periods?: { year_month?: string; period?: string };
        }) =>
          inv.region_gu_display_periods?.year_month === targetYearMonth &&
          inv.region_gu_display_periods?.period === 'first_half'
      );

      const secondHalfInventory = item.banner_slot_inventory?.find(
        (inv: {
          region_gu_display_periods?: { year_month?: string; period?: string };
        }) =>
          inv.region_gu_display_periods?.year_month === targetYearMonth &&
          inv.region_gu_display_periods?.period === 'second_half'
      );

      return {
        ...item,
        inventory_info: {
          current_period: currentPeriodInventory
            ? {
                total_slots: currentPeriodInventory.total_slots,
                available_slots: currentPeriodInventory.available_slots,
                closed_slots: currentPeriodInventory.closed_slots,
                period:
                  currentPeriodInventory.region_gu_display_periods?.period,
                year_month:
                  currentPeriodInventory.region_gu_display_periods?.year_month,
              }
            : null,
          first_half: firstHalfInventory
            ? {
                total_slots: firstHalfInventory.total_slots,
                available_slots: firstHalfInventory.available_slots,
                closed_slots: firstHalfInventory.closed_slots,
              }
            : null,
          second_half: secondHalfInventory
            ? {
                total_slots: secondHalfInventory.total_slots,
                available_slots: secondHalfInventory.available_slots,
                closed_slots: secondHalfInventory.closed_slots,
              }
            : null,
        },
      };
    });

    console.log('🔍 조회 결과:', {
      district: districtName,
      totalCount: dataWithInventory?.length || 0,
      targetYearMonth,
      panelTypes:
        dataWithInventory?.map((item) => ({
          panel_code: item.panel_code,
          panel_type: item.panel_type,
          nickname: item.nickname,
          banner_slot_info_count: item.banner_slot_info?.length || 0,
          inventory_info: item.inventory_info,
        })) || [],
    });

    return NextResponse.json({
      success: true,
      data: dataWithInventory as BannerDisplayData[],
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
          banner_type,
          price_unit,
          panel_slot_status,
          banner_slot_price_policy (
            id,
            price_usage_type,
            tax_price,
            road_usage_fee,
            advertising_fee,
            total_price
          )
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

    // 1. panel_info에서 현수막 게시대 구 목록과 데이터 추출 (두 단계 조건)
    const { data: panelData, error: panelError } = await supabase
      .from('panel_info')
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
      .eq('display_type_id', (await getBannerDisplayTypeId()).id)
      .eq('panel_status', 'active') // 패널이 active인 것만
      .eq('region_gu.is_active', 'true') // 구가 활성화된 것만
      .order('region_gu(name)');

    if (panelError) {
      console.error('❌ Error fetching panel data:', panelError);
      throw panelError;
    }

    // 2. 카운트 집계 및 가격 정보 수집
    const countMap: Record<string, number> = {};
    const districtsMap: Record<
      string,
      {
        id: string;
        name: string;
        code: string;
        logo_image_url: string | null;
        panel_status: string;
        pricePolicies: {
          id: string;
          price_usage_type: string;
          tax_price: number;
          road_usage_fee: number;
          advertising_fee: number;
          total_price: number;
        }[];
      }
    > = {};

    // 3. 카운트 집계 및 데이터 처리 (두 단계 조건 적용)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    panelData?.forEach((item: any) => {
      const districtName = item.region_gu.name;

      // 두 단계 조건 확인: is_active = 'true' && panel_status = 'active'
      if (
        item.region_gu.is_active === 'true' &&
        item.panel_status === 'active'
      ) {
        countMap[districtName] = (countMap[districtName] || 0) + 1;

        // 구별 첫 번째 패널 정보 저장
        if (!districtsMap[districtName]) {
          districtsMap[districtName] = {
            id: item.region_gu.id,
            name: item.region_gu.name,
            code: item.region_gu.code,
            logo_image_url: item.region_gu.logo_image_url,
            panel_status: 'active', // 조건을 통과했으므로 active
            pricePolicies: [],
          };
        }
      }
    });

    // 4. 기본 구 목록 생성
    const basicDistricts = Object.values(districtsMap);

    // 5. 각 구별로 신청기간과 계좌번호 정보를 가져와서 조합
    const processedDistricts = await Promise.all(
      basicDistricts.map(async (district) => {
        // 대표 패널의 가격 정책 정보 조회 (panel, with_lighting, no_lighting, multi_panel, lower_panel, semi_auto, slot_number=1)
        let pricePolicies = [];
        const { data: panelInfoList } = await supabase
          .from('panel_info')
          .select(
            `id, panel_type, banner_slot_info (slot_number, banner_slot_price_policy (*))`
          )
          .eq('region_gu_id', district.id)
          .eq('display_type_id', (await getBannerDisplayTypeId()).id)
          .eq('panel_status', 'active')
          .in('panel_type', [
            'panel',
            'with_lighting',
            'no_lighting',
            'multi_panel',
            'lower_panel',
            'semi_auto',
          ])
          .order('id', { ascending: true })
          .limit(20); // 여러 패널이 있을 수 있으니 20개까지 조회
        if (panelInfoList && panelInfoList.length > 0) {
          // slot_number=1인 banner_slot_info만 추출
          const slotInfos = panelInfoList.flatMap((panel: any) =>
            (panel.banner_slot_info || []).filter(
              (slot: any) => slot.slot_number === 1
            )
          );
          // 모든 슬롯의 price_policy를 합쳐서 unique하게
          const allPolicies = slotInfos.flatMap(
            (slot: any) => slot.banner_slot_price_policy || []
          );
          // price_usage_type별로 첫 번째만 남기기
          const uniquePolicies: Record<string, any> = {};
          for (const policy of allPolicies) {
            if (!uniquePolicies[policy.price_usage_type]) {
              uniquePolicies[policy.price_usage_type] = policy;
            }
          }
          pricePolicies = Object.values(uniquePolicies);
        }

        // 한국 시간대로 현재 날짜 계산
        const now = new Date();
        const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000); // UTC+9 (한국시간)
        const currentYear = koreaTime.getFullYear();
        const currentMonth = koreaTime.getMonth() + 1;
        const currentDay = koreaTime.getDate();

        // 현재 날짜에 따라 신청 가능한 기간 계산
        let targetYear = currentYear;
        let targetMonth = currentMonth;

        // 7일 전까지 신청 가능하므로 6일 전부터는 다음 기간 표시
        // 예: 7월 13일이면 8월 상하반기 신청 가능
        if (currentDay >= 13) {
          // 13일 이후면 다음달로 설정
          if (currentMonth === 12) {
            targetYear = currentYear + 1;
            targetMonth = 1;
          } else {
            targetMonth = currentMonth + 1;
          }
        }

        const targetYearMonth = `${targetYear}-${String(targetMonth).padStart(
          2,
          '0'
        )}`;

        console.log(`🔍 기간 계산 for ${district.name}:`, {
          koreaTime: koreaTime.toISOString().split('T')[0],
          currentYear,
          currentMonth,
          currentDay,
          targetYear,
          targetMonth,
          targetYearMonth,
        });

        const { data: periodDataList, error: periodError } = await supabase
          .from('region_gu_display_periods')
          .select('*')
          .eq('region_gu_id', district.id)
          .eq('display_type_id', (await getBannerDisplayTypeId()).id)
          .eq('year_month', targetYearMonth)
          .order('period_from', { ascending: true });

        console.log(`🔍 Period data for ${district.name}:`, {
          periodDataList,
          periodError,
        });

        let currentPeriodData = null;

        if (periodDataList && periodDataList.length > 0 && !periodError) {
          // DB에서 가져온 기간 데이터 사용
          const periods = periodDataList.map((p) => ({
            period_from: p.period_from,
            period_to: p.period_to,
            period: p.period,
            year_month: p.year_month,
          }));

          // 첫 번째와 두 번째 기간을 상하반기로 매핑
          if (periods.length >= 1) {
            currentPeriodData = {
              first_half_from: periods[0].period_from,
              first_half_to: periods[0].period_to,
              second_half_from:
                periods.length >= 2 ? periods[1].period_from : null,
              second_half_to: periods.length >= 2 ? periods[1].period_to : null,
            };
          }
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
          pricePolicies: pricePolicies,
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
