'use client';

import { useState, useEffect } from 'react';
import DisplayDetailPage from '@/src/components/displayDetailPage';
import TableSkeleton from '@/src/components/skeleton/TableSkeleton';
import districts from '@/src/mock/banner-district';
import { BannerBillboard } from '@/src/types/displaydetail';
// import { useCart } from '@/src/contexts/cartContext';
// import { useRouter } from 'next/navigation';

// BannerDisplayData 타입 정의
interface BannerDisplayData {
  id: string;
  display_type_id: string;
  region_gu_id: string;
  region_dong_id: string;
  address: string;
  nickname?: string;
  panel_status: string;
  panel_code?: number;
  panel_type?: string;
  max_banner?: number; // panel_info에서 가져오는 max_banner
  photo_url?: string; // 사진 URL 추가
  latitude?: number; // 위도 추가
  longitude?: number; // 경도 추가
  created_at: string;
  updated_at: string;
  banner_panel_details: {
    id: string;
    panel_info_id: string;
    is_for_admin?: boolean;
    created_at: string;
    updated_at: string;
  };
  banner_slot_info: {
    id: string;
    panel_info_id: string;
    slot_number: number;
    slot_name: string;
    max_width: number;
    max_height: number;
    total_price?: number;
    tax_price?: number;
    banner_type:
      | '일반형'
      | '돌출형'
      | '지정게시대'
      | '자율게시대'
      | 'top_fixed'
      | 'panel'
      | 'semi_auto';
    price_unit?: '15 days' | 'month';
    panel_slot_status: string;
    notes: string;
    created_at: string;
    updated_at: string;
    first_half_closure_quantity?: number;
    second_half_closure_quantity?: number;
    // banner_slot_price_policy 정보 추가
    banner_slot_price_policy?: {
      id: string;
      price_usage_type: 'default' | 'public_institution' | 'company';
      tax_price: number;
      road_usage_fee: number;
      advertising_fee: number;
      total_price: number;
    }[];
  }[];
  region_gu: {
    id: string;
    name: string;
    code: string;
  };
  region_dong: {
    id: string;
    district_code: string;
    name: string;
  };
  price?: string;
  price_unit?: string;
  panel_width?: number;
  panel_height?: number;
  first_half_closure_quantity?: number;
  second_half_closure_quantity?: number;
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

interface BankInfo {
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

// API 함수들
async function getBannerDisplaysByDistrict(
  districtName: string
): Promise<BannerDisplayData[]> {
  try {
    console.log('🔍 Fetching banner displays for district:', districtName);
    const response = await fetch(
      `/api/banner-display?action=getByDistrict&district=${encodeURIComponent(
        districtName
      )}`
    );
    const result = await response.json();
    console.log('🔍 API response:', result);

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Error fetching banner displays by district:', error);
    throw error;
  }
}

export default function BannerDisplayPage({
  params,
  searchParams,
}: {
  params: Promise<{ district: string }>;
  searchParams: Promise<{ period?: string }>;
}) {
  const [billboards, setBillboards] = useState<BannerBillboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<{
    first_half_from: string;
    first_half_to: string;
    second_half_from: string;
    second_half_to: string;
  } | null>(null);
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);

  // 송파구, 용산구 탭 필터 추가 (DisplayDetailPage에서 사용)
  const [panelTypeFilter, setPanelTypeFilter] = useState<
    'panel' | 'top_fixed' | 'semi_auto'
  >('panel');

  // const { dispatch } = useCart();
  // const router = useRouter();

  const [district, setDistrict] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [districtObj, setDistrictObj] = useState<any>(null);

  // Handle async params
  useEffect(() => {
    const initParams = async () => {
      const { district: encodedDistrict } = await params;
      const { period: periodParam } = await searchParams;
      const decodedDistrict = decodeURIComponent(encodedDistrict);

      setDistrict(decodedDistrict);

      // URL 파라미터에서 기간 데이터 파싱
      if (periodParam) {
        try {
          const periodData = JSON.parse(decodeURIComponent(periodParam));
          setPeriod(periodData);
          console.log('🔍 Period data from URL:', periodData);
        } catch (error) {
          console.error('Failed to parse period data from URL:', error);
        }
      }

      const obj = districts.find((d) => d.code === decodedDistrict);
      setDistrictObj(obj);
    };

    initParams();
  }, [params, searchParams]);

  // 마포구인지 확인
  // const isMapoDistrict = districtObj?.code === 'mapo';
  // 송파구, 용산구인지 확인
  // const isSongpaOrYongsan =
  //   districtObj?.code === 'songpa' || districtObj?.code === 'yongsan';

  const pageDropdownOptions = [
    { id: 1, option: '관악구' },
    { id: 2, option: '마포구' },
    { id: 3, option: '서대문구' },
    { id: 4, option: '송파구' },
    { id: 5, option: '용산구' },
  ];

  console.log('🔍 District code from URL:', district);
  console.log('🔍 District object found:', districtObj);
  console.log('🔍 District name to pass to API:', districtObj?.name);

  // 구 정보 가져오기 함수 (로고 + 계좌번호 포함)
  async function getDistrictData(districtName: string) {
    try {
      const response = await fetch(
        `/api/region-gu?action=getByDistrict&district=${encodeURIComponent(
          districtName
        )}&displayType=banner_display`
      );
      const result = await response.json();
      return result.success ? result.data : null;
    } catch (err) {
      console.warn(`Failed to fetch district data for ${districtName}:`, err);
      return null;
    }
  }

  useEffect(() => {
    async function fetchBannerData() {
      try {
        setLoading(true);
        console.log('🔍 Starting to fetch banner data...');
        console.log('🔍 districtObj?.name:', districtObj?.name);
        console.log('🔍 district:', district);

        // 1. 현수막 데이터 가져오기
        const data = await getBannerDisplaysByDistrict(
          districtObj?.name || district
        );

        console.log('🔍 Fetched data:', data);
        console.log(
          '🔍 Panel types in data:',
          data?.map((item) => ({
            panel_code: item.panel_code,
            panel_type: item.panel_type,
            nickname: item.nickname,
          }))
        );

        if (data && data.length > 0) {
          // 구별 가나다순 정렬
          const sortedData = [...data].sort((a, b) => {
            const districtCompare = a.region_gu.name.localeCompare(
              b.region_gu.name
            );
            if (districtCompare !== 0) return districtCompare;

            // 같은 구 내에서는 panel_code로 정렬
            const aCode = a.panel_code || 0;
            const bCode = b.panel_code || 0;
            return aCode - bCode;
          });

          const transformed = sortedData.map(
            (item: BannerDisplayData, index: number) => {
              const displayName =
                item.address && item.address.trim() !== ''
                  ? item.address
                  : item.address;

              // banner_slot_info에서 slot_number에 따라 적절한 슬롯 찾기
              const findSlotByType = () => {
                if (
                  !item.banner_slot_info ||
                  item.banner_slot_info.length === 0
                ) {
                  return null;
                }

                // 디버깅: 모든 슬롯 정보 출력
                console.log(
                  '🔍 모든 슬롯:',
                  item.banner_slot_info.map((slot) => ({
                    slot_number: slot.slot_number,
                    banner_type: slot.banner_type,
                    total_price: slot.total_price,
                  }))
                );

                // 상단광고 슬롯 찾기 (banner_type으로만 구분)
                const topFixedSlot = item.banner_slot_info.find(
                  (slot) => slot.banner_type === 'top_fixed'
                );

                // 현수막게시대 슬롯 찾기 (banner_type으로만 구분)
                const panelSlot = item.banner_slot_info.find(
                  (slot) =>
                    slot.banner_type === 'panel' ||
                    slot.banner_type === 'semi_auto'
                );

                return { topFixedSlot, panelSlot };
              };

              const slots = findSlotByType();
              // panelTypeFilter가 'top_fixed'인 경우 상단광고로 처리
              const isTopFixed = panelTypeFilter === 'top_fixed';
              console.log('isTopFixed', isTopFixed);

              // 디버깅 로그 추가
              console.log('🔍 슬롯 정보:', {
                panelCode: item.panel_code,
                nickname: item.nickname,
                district: item.region_gu.name,
                photo_url: item.photo_url, // 사진 URL 로그 추가
                bannerSlotInfo: item.banner_slot_info?.map((slot) => ({
                  slot_number: slot.slot_number,
                  banner_type: slot.banner_type,
                  total_price: slot.total_price,
                  max_width: slot.max_width,
                  max_height: slot.max_height,
                  price_policies: slot.banner_slot_price_policy,
                })),
                foundSlots: slots,
                isTopFixed,
              });

              // 가격 계산 로직 수정 - banner_slot_price_policy 사용
              let price = '문의';
              let totalPrice = 0;

              if (isTopFixed) {
                price = '상담문의';
                totalPrice = 0; // 상단광고는 상담신청으로 처리
              } else if (slots?.panelSlot) {
                // banner_slot_price_policy에서 가격 정보 가져오기
                const pricePolicies = slots.panelSlot.banner_slot_price_policy;
                if (pricePolicies && pricePolicies.length > 0) {
                  // 기본적으로 'default' 타입 사용
                  const defaultPolicy = pricePolicies.find(
                    (p: { price_usage_type: string }) =>
                      p.price_usage_type === 'default'
                  );
                  if (defaultPolicy) {
                    totalPrice = defaultPolicy.total_price;
                    price = `${defaultPolicy.total_price?.toLocaleString()}원`;
                  } else {
                    // default가 없으면 첫 번째 정책 사용
                    totalPrice = pricePolicies[0].total_price;
                    price = `${pricePolicies[0].total_price?.toLocaleString()}원`;
                  }
                } else {
                  // 기존 로직 (banner_slot_info의 total_price 사용)
                  totalPrice = slots.panelSlot.total_price || 0;
                  price = `${slots.panelSlot.total_price?.toLocaleString()}원`;
                }
              }

              // 가격 디버깅 로그
              console.log('🔍 가격 정보:', {
                panelCode: item.panel_code,
                nickname: item.nickname,
                isTopFixed,
                panelSlot: slots?.panelSlot,
                panelSlotTotalPrice: slots?.panelSlot?.total_price,
                calculatedPrice: price,
                calculatedTotalPrice: totalPrice,
              });

              // 가격 디버깅 로그
              console.log('🔍 가격 정보:', {
                panelCode: item.panel_code,
                nickname: item.nickname,
                isTopFixed,
                panelSlot: slots?.panelSlot,
                panelSlotTotalPrice: slots?.panelSlot?.total_price,
                calculatedPrice: price,
                calculatedTotalPrice: totalPrice,
              });

              const bannerType = isTopFixed
                ? 'top_fixed'
                : slots?.panelSlot?.banner_type || undefined;

              // 상하반기별 마감수 정보 (panel_info에서 가져오기)
              const firstHalfClosureQuantity = item.first_half_closure_quantity;
              const secondHalfClosureQuantity =
                item.second_half_closure_quantity;

              // 구별 가나다순 ID 조합 (중복 방지)
              const districtCode = item.region_gu.code;
              const panelCode = item.panel_code || index + 1;
              const combinedId = `${districtCode}-${panelCode
                .toString()
                .padStart(2, '0')}-${item.id}`; // UUID 추가로 고유성 보장

              // banner_panel_details에서 is_for_admin만 가져오기
              const isForAdmin =
                item.banner_panel_details?.is_for_admin || false;

              // panel_info에서 max_banner 가져오기
              const maxBanners = item.max_banner || 0;

              // banner_slot_info에서 적절한 슬롯의 크기 정보 가져오기
              const getSlotSize = () => {
                if (isTopFixed && slots?.topFixedSlot) {
                  return {
                    width: slots.topFixedSlot.max_width || 0,
                    height: slots.topFixedSlot.max_height || 0,
                  };
                } else if (slots?.panelSlot) {
                  return {
                    width: slots.panelSlot.max_width || 0,
                    height: slots.panelSlot.max_height || 0,
                  };
                }
                return { width: 0, height: 0 };
              };

              const slotSize = getSlotSize();
              const slotWidth = slotSize.width;
              const slotHeight = slotSize.height;

              return {
                id: combinedId, // "gwanak-01-uuid123", "mapo-01-uuid456" 등
                type: 'banner',
                district: item.region_gu.name,
                name: displayName,
                address: item.address,
                nickname: item.nickname,
                neighborhood: item.region_dong.name,
                period: '상시',
                price: price,
                total_price: totalPrice,
                size: `${slotWidth}x${slotHeight}` || 'no size',
                faces: maxBanners,
                lat: item.latitude || 37.5665, // 실제 데이터베이스 좌표 사용
                lng: item.longitude || 126.978,
                panel_width: slotWidth,
                panel_height: slotHeight,
                is_for_admin: isForAdmin,
                status: item.panel_status,
                panel_code: item.panel_code,
                banner_type: bannerType,
                panel_type: item.panel_type,
                first_half_closure_quantity: firstHalfClosureQuantity,
                second_half_closure_quantity: secondHalfClosureQuantity,
                panel_info_id: item.id, // 원본 panel_info UUID
                photo_url: item.photo_url, // 사진 URL 추가
                banner_slot_info: item.banner_slot_info, // banner_slot_info 보존
                inventory_info: item.inventory_info, // 실시간 재고 정보 추가
              };
            }
          );
          setBillboards(transformed as BannerBillboard[]);
        } else {
          // panel_status가 maintenance인 구들만 준비 중으로 처리
          const isMaintenanceDistrict =
            (districtObj as { panel_status?: string })?.panel_status ===
            'maintenance';

          if (isMaintenanceDistrict) {
            // 준비 중인 구는 빈 배열로 설정 (상세페이지에서 "준비 중" 메시지 표시)
            setBillboards([]);
          } else {
            // DB에 데이터가 없으면 빈 배열로 설정
            console.log('🔍 No data found for district:', district);
            setBillboards([]);
          }
        }

        // 2. 신청기간은 URL 파라미터나 상태로 전달받도록 수정 (DB 재조회 제거)
        // 기간 데이터는 구별 카드에서 이미 가져온 것을 사용

        // 3. 구 정보와 계좌번호 정보 가져오기
        if (districtObj?.name) {
          const districtDataResult = await getDistrictData(districtObj.name);
          if (districtDataResult) {
            setBankInfo(districtDataResult.bank_info);
          }
        }
      } catch (err) {
        console.error('❌ Error fetching banner data:', err);
        setError(`데이터를 불러오는 중 오류가 발생했습니다: ${err}`);
      } finally {
        setLoading(false);
      }
    }

    if (district) {
      fetchBannerData();
    }
  }, [district, districtObj, panelTypeFilter]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white pb-10">
        <div className="lg:min-w-[70rem] lg:max-w-[1500px] mx-auto px-4 pt-[7rem]">
          <div className="mb-8">
            <div className="flex gap-2 items-center">
              {districtObj && (
                <div className="w-[50px] h-[50px] bg-gray-200 rounded mr-2 animate-pulse"></div>
              )}
              <div className="h-9 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-24 mt-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mt-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 mt-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mt-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-40 mt-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mt-2 animate-pulse"></div>
          </div>

          {/* View Type Selector Skeleton */}
          <div className="flex items-center gap-4 mb-8 border-b border-gray-200 pb-4">
            <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="ml-auto">
              <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
            </div>
          </div>

          {/* Skeleton List */}
          <TableSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-500">
          데이터를 불러오지 못했습니다. {error}
        </div>
      </div>
    );
  }

  return (
    <DisplayDetailPage
      district={district}
      districtObj={districtObj}
      billboards={billboards}
      dropdownOptions={pageDropdownOptions}
      defaultView="list"
      period={period}
      bankInfo={bankInfo}
      panelTypeFilter={panelTypeFilter}
      setPanelTypeFilter={setPanelTypeFilter}
    />
  );
}
