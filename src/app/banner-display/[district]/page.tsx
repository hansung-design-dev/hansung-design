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
  max_banner?: number; // panels에서 가져오는 max_banner
  photo_url?: string; // 사진 URL 추가
  latitude?: number; // 위도 추가
  longitude?: number; // 경도 추가
  maintenance_notes?: string; // 유지보수 노트 추가
  created_at: string;
  updated_at: string;
  banner_panel_details: {
    id: string;
    panel_id: string;
    is_for_admin?: boolean;
    created_at: string;
    updated_at: string;
  };
  banner_slots: {
    id: string;
    panel_id: string;
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
      period?: string;
      year_month?: string;
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
    const apiUrl = `/api/banner-display?action=getByDistrict&district=${encodeURIComponent(
      districtName
    )}`;
    console.log('🔍 Fetching banner displays for district:', districtName);
    console.log('🔍 API URL:', apiUrl);
    console.log('🔍 API 호출 시작 시간:', new Date().toISOString());

    const response = await fetch(apiUrl);
    console.log('🔍 API 응답 상태:', response.status, response.statusText);

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

// 송파구, 용산구용 slot_type별 API 함수
async function getBannerDisplaysByDistrictWithSlotType(
  districtName: string,
  slotType: 'banner' | 'top_ad'
): Promise<BannerDisplayData[]> {
  try {
    console.log(`🔍 Fetching ${districtName} ${slotType} displays...`);
    const url = `/api/banner-display?action=getByDistrictWithSlotType&district=${encodeURIComponent(
      districtName
    )}&slot_type=${slotType}`;
    console.log(`🔍 API URL:`, url);
    console.log(`🔍 API 호출 시작 시간:`, new Date().toISOString());

    const response = await fetch(url);
    console.log(`🔍 Response status:`, response.status, response.statusText);

    const result = await response.json();
    console.log(`🔍 ${slotType} API response:`, result);

    if (result.success) {
      console.log(
        `🔍 ${slotType} API success, data length:`,
        result.data?.length || 0
      );
      return result.data;
    } else {
      console.error(`🔍 ${slotType} API error:`, result.error);
      throw new Error(result.error);
    }
  } catch (error) {
    console.error(`❌ Error fetching ${slotType} displays:`, error);
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
  const [districtData, setDistrictData] = useState<{
    id: string;
    name: string;
    code: string;
    logo_image_url?: string;
    panel_status?: string;
    phone_number?: string;
  } | null>(null);

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

      // URL 파라미터에서 기간 데이터 파싱 - 디버깅 로그 추가
      if (periodParam) {
        try {
          console.log('🔍 Raw period param:', periodParam);
          const decodedPeriodParam = decodeURIComponent(periodParam);
          console.log('🔍 Decoded period param:', decodedPeriodParam);
          const periodData = JSON.parse(decodedPeriodParam);
          setPeriod(periodData);
          console.log('🔍 Period data from URL (parsed):', periodData);
        } catch (error) {
          console.error('Failed to parse period data from URL:', error);
          console.error('Raw period param:', periodParam);
        }
      } else {
        console.log('🔍 No period param in URL');
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

  // 구 정보 가져오기 함수 (로고 + 계좌번호 포함) - 캐시 테이블 사용
  async function getDistrictData(districtName: string) {
    try {
      const apiUrl = `/api/banner-display?action=getDistrictData&district=${encodeURIComponent(
        districtName
      )}`;
      console.log('🔍 getDistrictData 호출:', apiUrl);
      console.log('🔍 getDistrictData 시작 시간:', new Date().toISOString());

      // banner_display_cache 테이블에서 해당 구의 정보 가져오기
      const response = await fetch(apiUrl);
      console.log(
        '🔍 getDistrictData 응답 상태:',
        response.status,
        response.statusText
      );

      const result = await response.json();
      console.log('🔍 getDistrictData 응답:', result);
      return result.success ? result.data : null;
    } catch (err) {
      console.error(
        `❌ Failed to fetch district data for ${districtName}:`,
        err
      );
      return null;
    }
  }

  useEffect(() => {
    // 디버깅: useEffect 실행 확인
    console.log('🔍 useEffect 실행됨:', {
      district,
      districtObj: districtObj
        ? { name: districtObj.name, code: districtObj.code }
        : null,
      panelTypeFilter,
      hasDistrict: !!district,
      hasDistrictObj: !!districtObj,
    });

    async function fetchBannerData() {
      try {
        setLoading(true);
        console.log('🔍 Starting to fetch banner data...');
        console.log('🔍 districtObj?.name:', districtObj?.name);
        console.log('🔍 district:', district);

        // 1. 현수막 데이터 가져오기
        let data: BannerDisplayData[];
        const districtName = districtObj?.name || district;

        // districtName이 없으면 API 호출 중단
        if (!districtName || districtName.trim() === '') {
          console.error('❌ districtName이 없어서 API 호출을 중단합니다:', {
            district,
            districtObj: districtObj?.name,
            districtName,
          });
          setError('구 정보를 찾을 수 없습니다.');
          setLoading(false);
          return;
        }

        console.log('✅ districtName 확인됨:', districtName);

        // 송파구, 용산구는 slot_type별로 API 호출
        if (districtName === '송파구' || districtName === '용산구') {
          const slotType =
            panelTypeFilter === 'top_fixed' ? 'top_ad' : 'banner';
          console.log(`🔍 ${districtName} ${slotType} 데이터 요청 중...`);
          console.log(`🔍 현재 panelTypeFilter:`, panelTypeFilter);
          console.log(`🔍 API 호출 전 상태:`, {
            districtName,
            slotType,
            panelTypeFilter,
          });
          data = await getBannerDisplaysByDistrictWithSlotType(
            districtName,
            slotType
          );
          console.log(`🔍 ${districtName} ${slotType} 데이터 받음:`, {
            dataLength: data?.length || 0,
            data: data,
            panelTypeFilter,
            slotType,
          });

          // 상단광고 탭인 경우 더 자세한 로그
          if (slotType === 'top_ad') {
            console.log(
              `🔍 ${districtName} 상단광고 원본 데이터 상세:`,
              data?.map((item) => ({
                panel_code: item.panel_code,
                nickname: item.nickname,
                banner_slots: item.banner_slots?.map((slot) => ({
                  slot_number: slot.slot_number,
                  banner_type: slot.banner_type,
                  price_unit: slot.price_unit,
                  slot_name: slot.slot_name,
                })),
              }))
            );
          }
        } else {
          data = await getBannerDisplaysByDistrict(districtName);
        }

        // 2. 기간 데이터 가져오기 (URL 파라미터에 없으면 API에서 가져오기)
        if (!period && districtObj?.name) {
          console.log(
            '🔍 Period not found in URL, fetching from API for:',
            districtObj.name
          );
          try {
            const response = await fetch(
              `/api/display-period?district=${encodeURIComponent(
                districtObj.name
              )}&display_type=banner_display`
            );
            const result = await response.json();
            if (result.success) {
              setPeriod(result.data);
              console.log('🔍 Period data from API:', result.data);
            } else {
              console.warn('🔍 Failed to fetch period data:', result.error);
            }
          } catch (err) {
            console.warn(
              `Failed to fetch period for ${districtObj.name}:`,
              err
            );
          }
        } else if (period) {
          console.log('🔍 Period data already available from URL:', period);
        } else {
          // URL 파라미터에도 없고, districtObj도 없는 경우에도 API에서 가져오기 시도
          console.log(
            '🔍 No period data available, attempting to fetch from API for district:',
            district
          );
          try {
            const response = await fetch(
              `/api/display-period?district=${encodeURIComponent(
                district
              )}&display_type=banner_display`
            );
            const result = await response.json();
            if (result.success) {
              setPeriod(result.data);
              console.log('🔍 Period data from API (fallback):', result.data);
            } else {
              console.warn(
                '🔍 Failed to fetch period data (fallback):',
                result.error
              );
            }
          } catch (err) {
            console.warn(
              `Failed to fetch period for ${district} (fallback):`,
              err
            );
          }
        }

        console.log('🔍 Fetched data:', data);
        console.log(
          '🔍 Panel types in data:',
          data?.map((item) => ({
            panel_code: item.panel_code,
            panel_type: item.panel_type,
            nickname: item.nickname,
          }))
        );

        console.log(
          `🔍 ${districtName} ${panelTypeFilter} - 데이터 변환 시작:`,
          {
            dataLength: data?.length || 0,
            hasData: !!(data && data.length > 0),
          }
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

              // banner_slots에서 slot_number에 따라 적절한 슬롯 찾기
              const findSlotByType = () => {
                if (!item.banner_slots || item.banner_slots.length === 0) {
                  return null;
                }

                // 디버깅: 모든 슬롯 정보 출력
                console.log(
                  `🔍 ${districtName} ${panelTypeFilter} - 모든 슬롯:`,
                  item.banner_slots.map((slot) => ({
                    slot_number: slot.slot_number,
                    banner_type: slot.banner_type,
                    price_unit: slot.price_unit,
                    total_price: slot.total_price,
                  }))
                );

                // 상단광고 슬롯 찾기 (slot_number로 구분)
                const topFixedSlot = item.banner_slots.find(
                  (slot) => slot.slot_number === 0
                );

                // 현수막게시대 슬롯 찾기 (slot_number로 구분)
                const panelSlot = item.banner_slots.find(
                  (slot) => slot.slot_number > 0
                );

                console.log(
                  `🔍 ${districtName} ${panelTypeFilter} - 슬롯 찾기 결과:`,
                  {
                    panelCode: item.panel_code,
                    topFixedSlot: topFixedSlot
                      ? {
                          slot_number: topFixedSlot.slot_number,
                          banner_type: topFixedSlot.banner_type,
                          price_unit: topFixedSlot.price_unit,
                        }
                      : null,
                    panelSlot: panelSlot
                      ? {
                          slot_number: panelSlot.slot_number,
                          banner_type: panelSlot.banner_type,
                          price_unit: panelSlot.price_unit,
                        }
                      : null,
                  }
                );

                return { topFixedSlot, panelSlot };
              };

              const slots = findSlotByType();
              // 실제 슬롯 데이터를 기반으로 상단광고 여부 판단
              const isTopFixed = slots?.topFixedSlot !== undefined;
              console.log(
                'isTopFixed',
                isTopFixed,
                'panelTypeFilter',
                panelTypeFilter
              );

              // // 디버깅 로그 추가
              // console.log('🔍 슬롯 정보:', {
              //   panelCode: item.panel_code,
              //   nickname: item.nickname,
              //   district: item.region_gu.name,
              //   photo_url: item.photo_url, // 사진 URL 로그 추가
              //   bannerSlotInfo: item.banner_slots?.map((slot) => ({
              //     slot_number: slot.slot_number,
              //     banner_type: slot.banner_type,
              //     total_price: slot.total_price,
              //     max_width: slot.max_width,
              //     max_height: slot.max_height,
              //     price_policies: slot.banner_slot_price_policy,
              //   })),
              //   foundSlots: slots,
              //   isTopFixed,
              // });

              // 가격 계산 로직 수정 - banner_slot_price_policy 사용
              let price = '문의';
              let totalPrice = 0;

              if (isTopFixed && slots?.topFixedSlot) {
                // 상단광고인 경우
                price = '상담문의';
                totalPrice = 0; // 상단광고는 상담신청으로 처리
              } else if (slots?.panelSlot) {
                // 현수막게시대인 경우
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
                  // 기존 로직 (banner_slots의 total_price 사용)
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
                : slots?.panelSlot?.banner_type || 'panel';

              // 상하반기별 마감수 정보 (panels에서 가져오기)
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

              // panels에서 max_banner 가져오기
              const maxBanners = item.max_banner || 0;

              // banner_slots에서 적절한 슬롯의 크기 정보 가져오기
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

              // 재고 정보 계산
              // - faces: 총 면수 (total_slots 또는 maxBanners)
              // - available_faces: 남은 면수(가용 재고)
              let totalFaces = maxBanners;
              let availableFaces = maxBanners;

              if (item.inventory_info) {
                // 현재 기간의 총/가용 재고가 있으면 사용
                if (item.inventory_info.current_period) {
                  totalFaces = item.inventory_info.current_period.total_slots;
                  availableFaces =
                    item.inventory_info.current_period.available_slots;
                } else if (item.inventory_info.first_half) {
                  // 첫 번째 반기가 있으면 사용
                  totalFaces = item.inventory_info.first_half.total_slots;
                  availableFaces =
                    item.inventory_info.first_half.available_slots;
                } else if (item.inventory_info.second_half) {
                  // 두 번째 반기가 있으면 사용
                  totalFaces = item.inventory_info.second_half.total_slots;
                  availableFaces =
                    item.inventory_info.second_half.available_slots;
                }
              }

              return {
                id: combinedId, // "gwanak-01-uuid123", "mapo-01-uuid456" 등
                type: 'banner',
                district: item.region_gu.name,
                name: displayName,
                address: item.address,
                nickname: item.nickname,
                neighborhood: item.region_dong.name,
                period: '',
                price: price,
                total_price: totalPrice,
                size: `${slotWidth}x${slotHeight}` || 'no size',
                faces: totalFaces, // 총 면수
                available_faces: availableFaces, // 남은 수량(가용 재고)
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
                panel_id: item.id, // 원본 panels UUID
                photo_url: item.photo_url, // 사진 URL 추가
                maintenance_notes: item.maintenance_notes, // 유지보수 노트 추가
                banner_slots: item.banner_slots, // banner_slots 보존
                inventory_info: item.inventory_info, // 실시간 재고 정보 추가
              };
            }
          );

          console.log(
            `🔍 ${districtName} ${panelTypeFilter} - 변환된 데이터:`,
            {
              transformedLength: transformed.length,
              transformed: transformed,
            }
          );

          // 상단광고 탭인 경우 변환된 데이터 상세 로그
          if (panelTypeFilter === 'top_fixed') {
            console.log(
              `🔍 ${districtName} 상단광고 변환된 데이터 상세:`,
              transformed.map((item) => ({
                id: item.id,
                name: item.name,
                nickname: item.nickname,
                banner_type: item.banner_type,
                price: item.price,
                period: item.period,
              }))
            );
          }

          // 관악구인 경우 마감된 게시대를 하드코딩으로 추가
          let finalBillboards = transformed as BannerBillboard[];

          if (district === 'gwanak') {
            const closedItem: BannerBillboard = {
              id: '0',
              type: 'banner',
              district: '관악구',
              name: '마감된 게시대 (데모)',
              address: '관악구 봉천동 123-45',
              nickname: '마감데모',
              neighborhood: '봉천동',
              period: '',
              price: '50,000원',
              total_price: 50000,
              size: '300x200',
              faces: 1,
              lat: 37.4784,
              lng: 126.9516,
              panel_width: 300,
              panel_height: 200,
              is_for_admin: false,
              status: 'inactive', // 마감 상태
              panel_code: 0,
              banner_type: 'panel',
              panel_type: 'panel',
              first_half_closure_quantity: 1, // 마감된 수량
              second_half_closure_quantity: 1,
              panel_id: 'closed-demo-panel-id',
              photo_url: '/images/banner-display/panel_photos/gwanak/1.jpg',
              banner_slots: [],
              inventory_info: {
                current_period: {
                  total_slots: 1,
                  available_slots: 0, // 사용 가능한 슬롯 0개
                  closed_slots: 1, // 마감된 슬롯 1개
                  period: '2024-01',
                  year_month: '2024-01',
                },
                first_half: {
                  total_slots: 1,
                  available_slots: 0,
                  closed_slots: 1,
                },
                second_half: {
                  total_slots: 1,
                  available_slots: 0,
                  closed_slots: 1,
                },
              },
              is_closed: true, // 마감 상태 플래그
            };

            // 마감된 아이템을 맨 앞에 추가
            finalBillboards = [closedItem, ...finalBillboards];
          }

          console.log(
            `🔍 ${districtName} ${panelTypeFilter} - 최종 설정할 데이터:`,
            {
              finalBillboardsLength: finalBillboards.length,
              finalBillboards: finalBillboards,
            }
          );

          // 상단광고 탭인 경우 최종 데이터 상세 로그
          if (panelTypeFilter === 'top_fixed') {
            console.log(
              `🔍 ${districtName} 상단광고 최종 설정 데이터:`,
              finalBillboards.map((item) => ({
                id: item.id,
                name: item.name,
                nickname: item.nickname,
                banner_type: item.banner_type,
                price: item.price,
                period: item.period,
              }))
            );
          }

          console.log(
            `🔍 ${districtName} ${panelTypeFilter} - setBillboards 호출 직전:`,
            {
              finalBillboardsLength: finalBillboards.length,
              finalBillboards: finalBillboards,
            }
          );
          setBillboards(finalBillboards);
          console.log(
            `🔍 ${districtName} ${panelTypeFilter} - setBillboards 호출 완료`
          );
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
          console.log(
            '🔍 🔍 🔍 BANNER - Fetching district data for:',
            districtObj.name
          );
          const districtDataResult = await getDistrictData(districtObj.name);
          console.log(
            '🔍 🔍 🔍 BANNER - District data result:',
            districtDataResult
          );

          if (districtDataResult) {
            console.log(
              '🔍 🔍 🔍 BANNER - Setting district data with logo:',
              districtDataResult.logo_image_url
            );
            setDistrictData({
              id: districtDataResult.id,
              name: districtDataResult.name,
              code: districtDataResult.code,
              logo_image_url: districtDataResult.logo_image_url,
              panel_status: 'active',
              phone_number: districtDataResult.phone_number,
            });
            setBankInfo(districtDataResult.bank_accounts);
          }
        }
      } catch (err) {
        console.error('❌ Error fetching banner data:', err);
        setError(`데이터를 불러오는 중 오류가 발생했습니다: ${err}`);
      } finally {
        setLoading(false);
      }
    }

    // district 또는 districtObj가 있을 때만 API 호출
    if (district || districtObj) {
      console.log('✅ fetchBannerData 실행 조건 만족:', {
        district,
        districtObj: districtObj?.name,
      });
      fetchBannerData();
    } else {
      console.warn('⚠️ fetchBannerData 실행 조건 불만족:', {
        district,
        districtObj,
      });
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
      districtData={districtData}
    />
  );
}
