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
  max_banner: number; // panels에서 가져오는 max_banner
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
  };
  banner_panel_details: {
    id: string;
    is_for_admin: boolean;
  };
  banner_slots: {
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
    // 슬롯별 개별 재고 정보 추가
    slot_inventory?: {
      is_available: boolean;
      is_closed: boolean;
      period?: string;
      year_month?: string;
    }[];
  }[];
  // 기존 패널 레벨 재고 정보 (하위 호환성 유지)
  banner_slot_inventory?: BannerSlotInventory[];
  inventory_data?: {
    current_period: {
      total_slots: number;
      available_slots: number;
      closed_slots: number;
      period: string | undefined;
      year_month: string | undefined;
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

// 추가 타입 정의들
interface RegionGuDisplayPeriod {
  id: string;
  year_month: string;
  period: string;
  period_from: string;
  period_to: string;
}

interface BannerSlotInventory {
  id: string;
  total_slots: number;
  available_slots: number;
  closed_slots: number;
  region_gu_display_periods?: RegionGuDisplayPeriod;
}

interface PanelWithSlots {
  id: string;
  panel_type: string;
  banner_slots: {
    slot_number: number;
    banner_slot_price_policy: {
      id: string;
      price_usage_type: string;
      tax_price: number;
      road_usage_fee: number;
      advertising_fee: number;
      total_price: number;
    }[];
  }[];
}

interface BankData {
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

interface ProcessedDistrictData {
  id: string;
  name: string;
  code: string;
  logo_image_url: string | null;
  phone_number?: string;
  display_type_id: string;
  panel_status: string;
  period: {
    first_half_from: string;
    first_half_to: string;
    second_half_from: string | null;
    second_half_to: string | null;
  } | null;
  bank_accounts: BankData | null;
  pricePolicies: {
    id: string;
    price_usage_type: string;
    tax_price: number;
    road_usage_fee: number;
    advertising_fee: number;
    total_price: number;
    displayName?: string;
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
    // 동적으로 현재 날짜 기준으로 대상 월 계산
    const now = new Date();
    const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const currentYear = koreaTime.getFullYear();
    const currentMonth = koreaTime.getMonth() + 1;
    const currentDay = koreaTime.getDate();

    // 현재 날짜에 따라 신청 가능한 기간 계산
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

    const targetYearMonth = `${targetYear}년 ${targetMonth}월`;
    console.log('🔍 Target year/month for district:', targetYearMonth);

    // 먼저 해당 구의 region_gu_id를 찾기
    const { data: regionData, error: regionError } = await supabase
      .from('region_gu')
      .select('id')
      .eq('name', districtName)
      .eq('display_type_id', (await getBannerDisplayTypeId()).id)
      .eq('is_active', 'true')
      .single();

    if (regionError || !regionData) {
      throw new Error(`구를 찾을 수 없습니다: ${districtName}`);
    }

    const query = supabase
      .from('panels')
      .select(
        `
        *,
        banner_panel_details (
          id,
          is_for_admin
        ),
        banner_slots (
          id,
          slot_number,
          slot_name,
          max_width,
          max_height,
          banner_type,
          price_unit,
          panel_slot_status,
          banner_slot_price_policy!banner_slot_price_policy_banner_slot_id_fkey (
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
          name
        )
      `
      )
      .eq('region_gu_id', regionData.id)
      .eq('display_type_id', (await getBannerDisplayTypeId()).id)
      .eq('panel_status', 'active');

    const { data, error } = await query.order('panel_code', {
      ascending: true,
    });

    if (error) {
      throw error;
    }

    // 슬롯별 개별 재고 정보 조회 (banner_slots와 직접 연결)
    let slotInventoryData = null;
    let slotInventoryError = null;

    if (data && data.length > 0) {
      // banner_slot_id 목록 추출
      const bannerSlotIds = data.flatMap(
        (item) =>
          item.banner_slots?.map((slot: { id: string }) => slot.id) || []
      );

      if (bannerSlotIds.length > 0) {
        const slotInventoryQuery = supabase
          .from('banner_slot_inventory')
          .select(
            `
            banner_slot_id,
            is_available,
            is_closed,
            region_gu_display_periods (
              id,
              year_month,
              period,
              period_from,
              period_to
            )
          `
          )
          .in('banner_slot_id', bannerSlotIds)
          .eq('region_gu_display_periods.year_month', targetYearMonth);

        const result = await slotInventoryQuery;
        slotInventoryData = result.data;
        slotInventoryError = result.error;
      }
    }

    if (slotInventoryError) {
      console.error('슬롯별 재고 조회 오류:', slotInventoryError);
    }

    // 슬롯별 재고 정보를 banner_slot_id별로 그룹화
    const slotInventoryByBannerSlot =
      slotInventoryData?.reduce(
        (acc, item) => {
          acc[item.banner_slot_id] = {
            is_available: item.is_available,
            is_closed: item.is_closed,
            period: item.region_gu_display_periods?.[0]?.period,
            year_month: item.region_gu_display_periods?.[0]?.year_month,
          };
          return acc;
        },
        {} as Record<
          string,
          {
            is_available: boolean;
            is_closed: boolean;
            period?: string;
            year_month?: string;
          }
        >
      ) || {};

    const dataWithInventory = data?.map((item: BannerDisplayData) => {
      // 슬롯별 개별 재고 정보 추가
      return {
        ...item,
        banner_slots: item.banner_slots?.map((slot) => ({
          ...slot,
          slot_inventory: slotInventoryByBannerSlot[slot.id]
            ? [slotInventoryByBannerSlot[slot.id]]
            : [],
        })),
        inventory_data: {
          current_period: null,
          first_half: null,
          second_half: null,
        },
      };
    });

    // 가격정책 데이터 검증 및 로깅
    console.log('🔍 조회 결과:', {
      district: districtName,
      totalCount: dataWithInventory?.length || 0,
      targetYearMonth,
      panelTypes:
        dataWithInventory?.map((item: BannerDisplayData) => ({
          panel_code: item.panel_code,
          panel_type: item.panel_type,
          nickname: item.nickname,
          banner_slot_info_count: item.banner_slots?.length || 0,
          price_policies_count:
            item.banner_slots?.reduce(
              (sum, slot) => sum + (slot.price_policies?.length || 0),
              0
            ) || 0,
          inventory_data: item.inventory_data,
          slot_inventory_count:
            item.banner_slots?.reduce(
              (sum, slot) => sum + (slot.slot_inventory?.length || 0),
              0
            ) || 0,
        })) || [],
    });

    // 가격정책 데이터 상세 로깅
    dataWithInventory?.forEach((item: BannerDisplayData) => {
      item.banner_slots?.forEach((slot) => {
        if (slot.price_policies && slot.price_policies.length > 0) {
          console.log(
            `🔍 ${districtName} - Panel ${item.panel_code} Slot ${slot.slot_number} 가격정책:`,
            {
              panel_code: item.panel_code,
              slot_number: slot.slot_number,
              price_policies: slot.price_policies.map(
                (policy: {
                  price_usage_type: string;
                  total_price: number;
                  tax_price: number;
                  road_usage_fee: number;
                  advertising_fee: number;
                }) => ({
                  price_usage_type: policy.price_usage_type,
                  total_price: policy.total_price,
                  tax_price: policy.tax_price,
                  road_usage_fee: policy.road_usage_fee,
                  advertising_fee: policy.advertising_fee,
                })
              ),
            }
          );
        }
      });
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
      .from('panels')
      .select(
        `
        *,
        banner_panel_details (
          id,
          is_for_admin
        ),
        banner_slots (
          id,
          slot_number,
          slot_name,
          max_width,
          max_height,
          banner_type,
          price_unit,
          panel_slot_status,
          banner_slot_price_policy!banner_slot_price_policy_banner_slot_id_fkey (
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
      data: data as BannerDisplayData[],
    });
  } catch (error) {
    throw error;
  }
}

// 구별 현수막 게시대 개수 조회 (새로운 region_gu_display_types 테이블 활용)
async function getBannerDisplayCountsByDistrict() {
  try {
    const { data, error } = await supabase
      .from('active_region_gu_display_types')
      .select('region_name, region_code')
      .eq('display_type_name', 'banner_display');

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
        .eq('display_type_id', (await getBannerDisplayTypeId()).id)
        .eq('panel_status', 'active');

      counts[region.region_name] = count || 0;
    }

    return NextResponse.json({ success: true, data: counts });
  } catch (error) {
    throw error;
  }
}

// 가격정책 데이터 조회 API 추가
async function getBannerDisplayPricePolicies() {
  try {
    console.log('🔍 Fetching banner display price policies...');

    // 모든 구의 가격정책 데이터 조회
    const { data: pricePolicyData, error: priceError } = await supabase
      .from('banner_slot_price_policy')
      .select(
        `
        id,
        price_usage_type,
        tax_price,
        road_usage_fee,
        advertising_fee,
        total_price,
        banner_slots!inner (
          slot_number,
          panels!inner (
            region_gu_id,
            panel_type,
            display_type_id,
            region_gu!inner (
              id,
              name,
              code
            )
          )
        )
      `
      )
      .eq(
        'banner_slots.panels.display_type_id',
        '8178084e-1f13-40bc-8b90-7b8ddc58bf64'
      )
      .eq('banner_slots.slot_number', 1)
      .order('banner_slots.panels.region_gu.name', { ascending: true })
      .order('price_usage_type', { ascending: true });

    if (priceError) {
      console.error('❌ 가격정책 조회 오류:', priceError);
      throw priceError;
    }

    console.log('🔍 가격정책 데이터:', pricePolicyData?.length || 0);

    // 구별로 가격정책 그룹화
    const districtPricePolicies: Record<
      string,
      {
        id: string;
        name: string;
        code: string;
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

    if (pricePolicyData) {
      for (const policy of pricePolicyData) {
        // banner_slots는 배열이므로 첫 번째 요소 사용
        const bannerSlot = Array.isArray(policy.banner_slots)
          ? policy.banner_slots[0]
          : policy.banner_slots;
        const panel = Array.isArray(bannerSlot?.panels)
          ? bannerSlot.panels[0]
          : bannerSlot?.panels;
        const regionGu = Array.isArray(panel?.region_gu)
          ? panel.region_gu[0]
          : panel?.region_gu;

        const districtName = regionGu?.name;
        const districtCode = regionGu?.code;
        const districtId = regionGu?.id;

        if (!districtPricePolicies[districtName]) {
          districtPricePolicies[districtName] = {
            id: districtId,
            name: districtName,
            code: districtCode,
            pricePolicies: [],
          };
        }

        // 중복 제거 (같은 price_usage_type은 하나만)
        const existingPolicy = districtPricePolicies[
          districtName
        ].pricePolicies.find(
          (p) => p.price_usage_type === policy.price_usage_type
        );

        if (!existingPolicy) {
          districtPricePolicies[districtName].pricePolicies.push({
            id: policy.id,
            price_usage_type: policy.price_usage_type,
            tax_price: policy.tax_price,
            road_usage_fee: policy.road_usage_fee,
            advertising_fee: policy.advertising_fee,
            total_price: policy.total_price,
          });
        }
      }
    }

    // 구별 순서 정렬
    const orderMap: Record<string, number> = {
      관악구: 1,
      마포구: 2,
      서대문구: 3,
      송파구: 4,
      용산구: 5,
      강북구: 6,
    };

    const sortedDistricts = Object.values(districtPricePolicies).sort(
      (a, b) => {
        const orderA = orderMap[a.name] || 999;
        const orderB = orderMap[b.name] || 999;
        return orderA - orderB;
      }
    );

    console.log(
      '🔍 구별 가격정책:',
      sortedDistricts.map((d) => ({
        name: d.name,
        policyCount: d.pricePolicies.length,
        policies: d.pricePolicies.map((p) => ({
          type: p.price_usage_type,
          total_price: p.total_price,
        })),
      }))
    );

    return NextResponse.json({
      success: true,
      data: sortedDistricts,
    });
  } catch (error) {
    console.error('❌ Error in getBannerDisplayPricePolicies:', error);
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
      case 'getOptimizedDistrictsData':
        return await getOptimizedDistrictsData();
      case 'getCounts':
        return await getBannerDisplayCountsByDistrict();
      case 'getByDistrict':
        return await getBannerDisplaysByDistrict(district!);
      case 'getAll':
        return await getAllBannerDisplays();
      case 'getPricePolicies':
        return await getBannerDisplayPricePolicies();
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

// 새로운 통합 API - 모든 구 데이터를 한번에 가져오기 (최적화된 버전)
async function getAllDistrictsData() {
  try {
    console.log(
      '🔍 Fetching all districts data for banner display (current table structure)...'
    );

    // 동적으로 현재 날짜 기준으로 대상 월 계산
    const now = new Date();
    const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const currentYear = koreaTime.getFullYear();
    const currentMonth = koreaTime.getMonth() + 1;
    const currentDay = koreaTime.getDate();

    // 현재 날짜에 따라 신청 가능한 기간 계산
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

    const targetYearMonth = `${targetYear}년 ${targetMonth}월`;
    console.log('🔍 Target year/month:', targetYearMonth);

    // 1. region_gu 테이블에서 banner_display가 활성화된 구 목록 가져오기
    // region_gu 테이블이 직접 구 정보를 가지고 있는 구조
    const { data: activeRegions, error: regionError } = await supabase
      .from('region_gu')
      .select('*')
      .eq('display_type_id', '8178084e-1f13-40bc-8b90-7b8ddc58bf64')
      .eq('is_active', 'true');

    if (regionError) {
      console.error('❌ Error fetching active regions:', regionError);
      throw regionError;
    }

    // 2. regions 데이터 변환 - region_gu 테이블이 직접 구 정보를 가지고 있음
    const regions = (activeRegions || []).map((region) => ({
      id: region.id,
      name: region.name,
      code: region.code,
      logo_image_url: region.logo_image_url,
      phone_number: region.phone_number,
      display_type_id: region.display_type_id,
      is_active: region.is_active,
    }));

    // 3. 구별 카드 순서 변경: 관악구, 마포구, 서대문구, 송파구, 용산구, 강북구 순서로 정렬
    const sortedRegions = regions.sort((a, b) => {
      const orderMap: Record<string, number> = {
        관악구: 1,
        마포구: 2,
        서대문구: 3,
        송파구: 4,
        용산구: 5,
        강북구: 6,
      };

      const orderA = orderMap[a.name] || 999;
      const orderB = orderMap[b.name] || 999;

      return orderA - orderB;
    });

    console.log('🔍 Active regions found:', sortedRegions?.length || 0);

    // 4. 각 활성화된 구별로 데이터 처리
    const processedDistricts = await Promise.all(
      sortedRegions.map(async (region): Promise<ProcessedDistrictData> => {
        // 새로운 패널 타입 기반 가격 정책 조회
        const pricePoliciesData = await getPricePoliciesByPanelType(
          region.id,
          region.name
        );

        console.log(`🔍 ${region.name} 가격 정책 데이터:`, pricePoliciesData);

        // 기존 형식에 맞게 변환 (displayName 포함)
        let pricePolicies = pricePoliciesData.map((policy) => ({
          id: policy.id,
          price_usage_type: policy.price_usage_type,
          tax_price: policy.tax_price,
          road_usage_fee: policy.road_usage_fee,
          advertising_fee: policy.advertising_fee,
          total_price: policy.total_price,
          displayName: policy.displayName,
        }));

        console.log(`🔍 ${region.name} 최종 가격 정책:`, pricePolicies);

        // 기존 방식도 백업으로 유지 (가격정책이 없을 경우)
        if (pricePolicies.length === 0) {
          console.log(`🔍 ${region.name} 백업 방식으로 패널 데이터 조회...`);

          const { data: panelList } = await supabase
            .from('panels')
            .select(
              `id, panel_type, banner_slots (slot_number, banner_slot_price_policy (*))`
            )
            .eq('region_gu_id', region.id)
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
            .limit(20);

          console.log(`🔍 ${region.name} 패널 목록:`, panelList?.length || 0);

          if (panelList && panelList.length > 0) {
            // slot_number=1인 banner_slots만 추출
            const slotData = panelList.flatMap((panel: PanelWithSlots) =>
              (panel.banner_slots || []).filter(
                (slot) => slot.slot_number === 1
              )
            );

            console.log(`🔍 ${region.name} 슬롯 데이터:`, slotData.length);

            // 모든 슬롯의 price_policy를 합쳐서 unique하게
            const allPolicies = slotData.flatMap(
              (slot) => slot.banner_slot_price_policy || []
            );

            console.log(
              `🔍 ${region.name} 전체 가격 정책:`,
              allPolicies.length
            );

            // price_usage_type별로 첫 번째만 남기기
            const uniquePolicies: Record<
              string,
              {
                id: string;
                price_usage_type: string;
                tax_price: number;
                road_usage_fee: number;
                advertising_fee: number;
                total_price: number;
              }
            > = {};

            for (const policy of allPolicies) {
              if (!uniquePolicies[policy.price_usage_type]) {
                uniquePolicies[policy.price_usage_type] = policy;
              }
            }
            pricePolicies = Object.values(uniquePolicies);

            console.log(
              `🔍 ${region.name} 백업 최종 가격 정책:`,
              pricePolicies.length,
              pricePolicies
            );
          } else {
            console.log(`🔍 ${region.name} 패널 데이터 없음`);
          }
        }

        // 기간 정보 가져오기 - 새로운 region_gu 구조에 맞게 수정
        const { data: periodDataList, error: periodError } = await supabase
          .from('region_gu_display_periods')
          .select('*')
          .eq('region_gu_id', region.id)
          .eq('display_type_id', (await getBannerDisplayTypeId()).id)
          .eq('year_month', targetYearMonth)
          .order('period_from', { ascending: true });

        let currentPeriodData: {
          first_half_from: string;
          first_half_to: string;
          second_half_from: string | null;
          second_half_to: string | null;
        } | null = null;

        if (periodDataList && periodDataList.length > 0 && !periodError) {
          const periods = periodDataList.map((p: RegionGuDisplayPeriod) => ({
            period_from: p.period_from,
            period_to: p.period_to,
            period: p.period,
            year_month: p.year_month,
          }));

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

        // 계좌번호 정보 가져오기 - region_gu 테이블 직접 사용
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
          .eq('display_types.name', 'banner_display')
          .single();

        return {
          id: region.id,
          name: region.name,
          code: region.code,
          logo_image_url: region.logo_image_url,
          phone_number: region.phone_number,
          display_type_id: (await getBannerDisplayTypeId()).id,
          panel_status: 'active',
          period: currentPeriodData,
          bank_accounts: bankData as BankData | null,
          pricePolicies: pricePolicies,
        };
      })
    );

    // 5. 카운트 정보 가져오기 - aggregate 함수 에러 방지
    const countMap: Record<string, number> = {};
    for (const region of sortedRegions) {
      try {
        const { data: panelData, error: countError } = await supabase
          .from('panels')
          .select('id')
          .eq('region_gu_id', region.id)
          .eq('display_type_id', (await getBannerDisplayTypeId()).id)
          .eq('panel_status', 'active');

        if (countError) {
          console.error(`❌ ${region.name} 카운트 조회 오류:`, countError);
          countMap[region.name] = 0;
        } else {
          countMap[region.name] = panelData?.length || 0;
        }
      } catch (error) {
        console.error(`❌ ${region.name} 카운트 조회 예외:`, error);
        countMap[region.name] = 0;
      }
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

// 새로운 가격 정책 조회 함수 (패널 타입과 배너 타입 기반)
async function getPricePoliciesByPanelType(
  regionId: string,
  regionName: string
) {
  try {
    console.log(`🔍 ${regionName} 패널 타입별 가격 정책 조회 시작...`);

    // 패널 타입별로 가격 정책 조회
    const { data: panelData, error: panelError } = await supabase
      .from('panels')
      .select(
        `
        id,
        panel_type,
        panel_code,
        banner_slots!inner (
          id,
          slot_number,
          banner_type,
          banner_slot_price_policy!banner_slot_price_policy_banner_slot_id_fkey (
            id,
            price_usage_type,
            total_price,
            tax_price,
            road_usage_fee,
            advertising_fee
          )
        )
      `
      )
      .eq('region_gu_id', regionId)
      .eq('display_type_id', (await getBannerDisplayTypeId()).id)
      .eq('panel_status', 'active')
      .eq('banner_slots.slot_number', 1);

    if (panelError) {
      console.error(`❌ ${regionName} 패널 데이터 조회 오류:`, panelError);
      return [];
    }

    console.log(`🔍 ${regionName} 패널 데이터:`, panelData?.length || 0);

    // 구별 로직에 따라 가격 정책 정리
    const pricePolicies: Array<{
      id: string;
      displayName: string;
      price_usage_type: string;
      total_price: number;
      tax_price: number;
      road_usage_fee: number;
      advertising_fee: number;
    }> = [];

    if (panelData && panelData.length > 0) {
      switch (regionName) {
        case '관악구':
          // 관악구: panel_type = panel인 것만 (상업용, 자체제작)
          const gwanakPanels = panelData.filter(
            (p) => p.panel_type === 'panel'
          );
          gwanakPanels.forEach((panel) => {
            panel.banner_slots?.forEach((slot) => {
              slot.banner_slot_price_policy?.forEach((policy) => {
                if (policy.price_usage_type === 'default') {
                  pricePolicies.push({
                    ...policy,
                    displayName: '상업용',
                  });
                } else if (policy.price_usage_type === 'self_install') {
                  pricePolicies.push({
                    ...policy,
                    displayName: '자체제작',
                  });
                }
              });
            });
          });
          break;

        case '용산구':
          // 용산구: panel_type = semi_auto & panel_code = 11,17,19 => 상업용(패널형), 행정용
          // 나머지는 상업용(현수막), 행정용(현수막)
          panelData.forEach((panel) => {
            panel.banner_slots?.forEach((slot) => {
              slot.banner_slot_price_policy?.forEach((policy) => {
                if (
                  panel.panel_type === 'semi_auto' &&
                  [11, 17, 19].includes(panel.panel_code)
                ) {
                  if (policy.price_usage_type === 'default') {
                    pricePolicies.push({
                      ...policy,
                      displayName: '상업용(패널형)',
                    });
                  } else if (policy.price_usage_type === 'public_institution') {
                    pricePolicies.push({
                      ...policy,
                      displayName: '행정용(패널형)',
                    });
                  }
                } else {
                  if (policy.price_usage_type === 'default') {
                    pricePolicies.push({
                      ...policy,
                      displayName: '상업용(현수막)',
                    });
                  } else if (policy.price_usage_type === 'public_institution') {
                    pricePolicies.push({
                      ...policy,
                      displayName: '행정용(현수막)',
                    });
                  }
                }
              });
            });
          });
          break;

        case '마포구':
          // 마포구: panel_type = multi_panel 상업용,행정용 / panel_type = lower_panel 저단형상업용,저단형행정용
          panelData.forEach((panel) => {
            panel.banner_slots?.forEach((slot) => {
              slot.banner_slot_price_policy?.forEach((policy) => {
                if (panel.panel_type === 'multi_panel') {
                  if (policy.price_usage_type === 'default') {
                    pricePolicies.push({
                      ...policy,
                      displayName: '상업용',
                    });
                  } else if (policy.price_usage_type === 'public_institution') {
                    pricePolicies.push({
                      ...policy,
                      displayName: '행정용',
                    });
                  }
                } else if (panel.panel_type === 'lower_panel') {
                  if (policy.price_usage_type === 'default') {
                    pricePolicies.push({
                      ...policy,
                      displayName: '저단형상업용',
                    });
                  } else if (policy.price_usage_type === 'public_institution') {
                    pricePolicies.push({
                      ...policy,
                      displayName: '저단형행정용',
                    });
                  }
                }
              });
            });
          });
          break;

        case '서대문구':
          // 서대문구: panel_code = 1-5, panel_type = panel 행정용(패널형) / panel_code = 6-16, panel_type = semi_auto 행정용(현수막) / panel_code = 1-5,17-24 상업용
          panelData.forEach((panel) => {
            panel.banner_slots?.forEach((slot) => {
              slot.banner_slot_price_policy?.forEach((policy) => {
                if (
                  [1, 2, 3, 4, 5].includes(panel.panel_code) &&
                  panel.panel_type === 'panel' &&
                  policy.price_usage_type === 'public_institution'
                ) {
                  pricePolicies.push({
                    ...policy,
                    displayName: '행정용(패널형)',
                  });
                } else if (
                  [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].includes(
                    panel.panel_code
                  ) &&
                  panel.panel_type === 'semi_auto' &&
                  policy.price_usage_type === 'public_institution'
                ) {
                  pricePolicies.push({
                    ...policy,
                    displayName: '행정용(현수막)',
                  });
                } else if (
                  [1, 2, 3, 4, 5, 17, 18, 19, 20, 21, 22, 23, 24].includes(
                    panel.panel_code
                  ) &&
                  policy.price_usage_type === 'default'
                ) {
                  pricePolicies.push({
                    ...policy,
                    displayName: '상업용',
                  });
                }
              });
            });
          });
          break;

        case '송파구':
          // 송파구: panel_type = panel 상업용, 행정용
          const songpaPanels = panelData.filter(
            (p) => p.panel_type === 'panel'
          );
          songpaPanels.forEach((panel) => {
            panel.banner_slots?.forEach((slot) => {
              slot.banner_slot_price_policy?.forEach((policy) => {
                if (policy.price_usage_type === 'default') {
                  pricePolicies.push({
                    ...policy,
                    displayName: '상업용',
                  });
                } else if (policy.price_usage_type === 'public_institution') {
                  pricePolicies.push({
                    ...policy,
                    displayName: '행정용',
                  });
                }
              });
            });
          });
          break;

        default:
          // 기본: 모든 가격 정책 표시
          panelData.forEach((panel) => {
            panel.banner_slots?.forEach((slot) => {
              slot.banner_slot_price_policy?.forEach((policy) => {
                pricePolicies.push({
                  ...policy,
                  displayName: getUsageDisplayName(policy.price_usage_type),
                });
              });
            });
          });
      }
    }

    // 중복 제거 (같은 displayName과 total_price를 가진 정책은 하나만)
    const uniquePolicies = pricePolicies.filter(
      (policy, index, self) =>
        index ===
        self.findIndex(
          (p) =>
            p.displayName === policy.displayName &&
            p.total_price === policy.total_price
        )
    );

    console.log(`🔍 ${regionName} 최종 가격 정책:`, uniquePolicies);
    return uniquePolicies;
  } catch (error) {
    console.error(`❌ ${regionName} 가격 정책 조회 오류:`, error);
    return [];
  }
}

// 용도별 표시명 매핑 함수
function getUsageDisplayName(usageType: string): string {
  switch (usageType) {
    case 'default':
      return '상업용';
    case 'public_institution':
      return '행정용';
    case 're_order':
      return '재사용';
    case 'self_install':
      return '자체제작';
    case 'reduction_by_admin':
      return '관리자할인';
    case 'rent_place':
      return '자리대여';
    default:
      return usageType;
  }
}

// 최적화된 구별 데이터 조회 (DB View 사용)
async function getOptimizedDistrictsData() {
  try {
    console.log('🔍 Fetching optimized districts data using DB view...');

    // DB View에서 한 번에 모든 데이터 가져오기
    const { data: viewData, error: viewError } = await supabase
      .from('banner_display_summary')
      .select('*');

    if (viewError) {
      console.error('❌ DB View 조회 오류:', viewError);
      throw viewError;
    }

    console.log('🔍 DB View 데이터:', viewData?.length || 0);

    // 뷰 데이터를 프론트엔드 형식으로 변환
    const processedDistricts = (viewData || []).map((item) => {
      // 가격 정책 파싱
      const pricePolicies = item.price_summary
        ? item.price_summary.split(', ').map((priceStr) => {
            const [displayName, totalPrice] = priceStr.split(':');
            return {
              id: `temp_${displayName}`,
              price_usage_type: 'default', // 임시값
              tax_price: 0,
              road_usage_fee: 0,
              advertising_fee: 0,
              total_price: parseInt(totalPrice) || 0,
              displayName: displayName.trim(),
            };
          })
        : [];

      // 기간 정보 파싱
      let periodData = null;
      if (item.period_summary) {
        const periods = item.period_summary.split(', ');
        if (periods.length >= 1) {
          const [firstFrom, firstTo] = periods[0].split('~');
          periodData = {
            first_half_from: firstFrom,
            first_half_to: firstTo,
            second_half_from:
              periods.length >= 2 ? periods[1].split('~')[0] : null,
            second_half_to:
              periods.length >= 2 ? periods[1].split('~')[1] : null,
          };
        }
      }

      // 은행 정보
      const bankData = item.bank_name
        ? {
            id: `temp_bank_${item.region_id}`,
            bank_name: item.bank_name,
            account_number: item.account_number,
            depositor: item.depositor,
            region_gu: {
              id: item.region_id,
              name: item.region_name,
            },
            display_types: {
              id: '8178084e-1f13-40bc-8b90-7b8ddc58bf64',
              name: 'banner_display',
            },
          }
        : null;

      return {
        id: item.region_id,
        name: item.region_name,
        code: item.region_code,
        logo_image_url: item.logo_image_url,
        phone_number: item.phone_number,
        display_type_id: '8178084e-1f13-40bc-8b90-7b8ddc58bf64',
        panel_status: 'active',
        period: periodData,
        bank_accounts: bankData,
        pricePolicies: pricePolicies,
      };
    });

    // 카운트 정보 (이미 뷰에 포함됨)
    const countMap: Record<string, number> = {};
    processedDistricts.forEach((district) => {
      countMap[district.name] = parseInt(
        district.panel_count?.toString() || '0'
      );
    });

    console.log('🔍 Optimized districts data:', processedDistricts.length);
    console.log('🔍 Counts data:', countMap);

    return NextResponse.json({
      success: true,
      data: {
        districts: processedDistricts,
        counts: countMap,
      },
    });
  } catch (error) {
    console.error('❌ Error in getOptimizedDistrictsData:', error);
    throw error;
  }
}
