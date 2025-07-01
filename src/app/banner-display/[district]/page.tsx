'use client';
import DisplayDetailPage from '@/src/components/displayDetailPage';
import SkeletonLoader from '@/src/components/layouts/skeletonLoader';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import districts from '@/src/mock/banner-district';
import { BannerBillboard } from '@/src/types/displaydetail';
import { ledItems } from '@/src/mock/billboards';

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
  created_at: string;
  updated_at: string;
  banner_panel_details: {
    id: string;
    panel_info_id: string;
    max_banners: number;
    panel_height: number;
    panel_width: number;
    is_for_admin?: boolean;
    created_at: string;
    updated_at: string;
    panel_code?: number;
    address: string;
    nickname?: string;
    panel_status: string;
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
    banner_type: '일반형' | '돌출형' | '지정게시대' | '자율게시대';
    price_unit?: '15 days' | 'month';
    is_premium: boolean;
    panel_slot_status: string;
    notes: string;
    created_at: string;
    updated_at: string;
    first_half_closure_quantity?: number;
    second_half_closure_quantity?: number;
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
}

// BankInfo 타입 정의
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

async function getAllBannerDisplays(): Promise<BannerDisplayData[]> {
  try {
    const response = await fetch('/api/banner-display?action=getAll');
    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Error fetching all banner displays:', error);
    throw error;
  }
}

const dropdownOptions = [
  { id: 1, option: '전체' },
  { id: 2, option: '보기1' },
  { id: 3, option: '보기2' },
];

export default function BannerDisplayPage() {
  const params = useParams();
  const encodedDistrict = params.district as string;
  const district = decodeURIComponent(encodedDistrict);
  const isAllDistricts = district === 'all';
  const districtObj = isAllDistricts
    ? {
        id: 0,
        name: '전체 보기',
        code: 'all',
        icon: '/images/district-icon/all.svg',
        description: '모든 자치구',
        count: 0,
        logo: '/images/district-icon/all.svg',
        src: '',
      }
    : districts.find((d) => d.code === district);

  const pageDropdownOptions = isAllDistricts
    ? districts.slice(0, 5).map((d, i) => ({ id: i + 1, option: d.name }))
    : dropdownOptions;

  console.log('🔍 District code from URL:', district);
  console.log('🔍 District object found:', districtObj);
  console.log('🔍 District name to pass to API:', districtObj?.name);

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
    logo_image_url: string | null;
  } | null>(null);

  // 신청기간 가져오기 함수
  async function getDisplayPeriod(districtName: string) {
    try {
      const response = await fetch(
        `/api/display-period?district=${encodeURIComponent(
          districtName
        )}&display_type=banner_display`
      );
      const result = await response.json();
      return result.success ? result.data : null;
    } catch (err) {
      console.warn(`Failed to fetch period for ${districtName}:`, err);
      return null;
    }
  }

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
        console.log('🔍 isAllDistricts:', isAllDistricts);
        console.log('🔍 districtObj?.name:', districtObj?.name);
        console.log('🔍 district:', district);

        // 1. 현수막 데이터 가져오기
        const data = isAllDistricts
          ? await getAllBannerDisplays()
          : await getBannerDisplaysByDistrict(districtObj?.name || district);

        console.log('🔍 Fetched data:', data);

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

              const price =
                item.banner_slot_info && item.banner_slot_info.length > 0
                  ? `${item.banner_slot_info[0].total_price?.toLocaleString()}원`
                  : '문의';

              const totalPrice =
                item.banner_slot_info && item.banner_slot_info.length > 0
                  ? item.banner_slot_info[0].total_price
                  : 0;

              const bannerType =
                item.banner_slot_info && item.banner_slot_info.length > 0
                  ? item.banner_slot_info[0].banner_type
                  : undefined;

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
                size:
                  `${item.banner_panel_details.panel_width}x${item.banner_panel_details.panel_height}` ||
                  'no size',
                faces: item.banner_panel_details.max_banners,
                lat: 37.5665, // 실제 좌표로 교체 필요
                lng: 126.978,
                panel_width: item.banner_panel_details.panel_width,
                panel_height: item.banner_panel_details.panel_height,
                is_for_admin: item.banner_panel_details.is_for_admin,
                status: item.panel_status,
                panel_code: item.panel_code,
                banner_type: bannerType,
                panel_type: item.panel_type,
                first_half_closure_quantity: firstHalfClosureQuantity,
                second_half_closure_quantity: secondHalfClosureQuantity,
                panel_info_id: item.id, // 원본 panel_info UUID
              };
            }
          );
          setBillboards(transformed as BannerBillboard[]);
        } else if (isAllDistricts) {
          setBillboards([]);
        } else {
          // DB에 데이터가 없으면 목업 데이터를 사용
          console.log(
            '🔍 No data found, using mock data for district:',
            district
          );
          // const mockBillboards = ledItems
          //   .filter((b) => b.location.split(' ')[0] === district)
          //   .map(
          //     (item): BannerBillboard => ({
          //       id: `${district}-${item.id.toString().padStart(2, '0')}`, // string으로 변경
          //       type: 'banner', // 타입을 'banner'로 설정
          //       district: item.location.split(' ')[0],
          //       name: item.title,
          //       address: item.title,
          //       nickname: item.location.split(' ')[1],
          //       neighborhood: item.location.split(' ')[1],
          //       period: '상시',
          //       price: item.price.toString(),
          //       size: `${item.width}x${item.height}`,
          //       faces: item.slots,
          //       lat: 37.5665, // Default coordinates
          //       lng: 126.978,
          //       status: '진행중',
          //       panel_width: item.width,
          //       panel_height: item.height,
          //     })
          //   );
          // setBillboards(mockBillboards);
        }

        // 2. 신청기간 가져오기 (전체보기가 아닌 경우에만)
        if (!isAllDistricts && districtObj?.name) {
          const periodData = await getDisplayPeriod(districtObj.name);
          setPeriod(periodData);
        }

        // 3. 구 정보와 계좌번호 정보 가져오기 (전체보기가 아닌 경우에만)
        if (!isAllDistricts && districtObj?.name) {
          const districtDataResult = await getDistrictData(districtObj.name);
          if (districtDataResult) {
            setDistrictData({
              id: districtDataResult.id,
              name: districtDataResult.name,
              code: districtDataResult.code,
              logo_image_url: districtDataResult.logo_image_url,
            });
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
  }, [district, districtObj?.name, isAllDistricts]);

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
          <SkeletonLoader itemCount={8} showHeader={true} showCheckbox={true} />
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
      districtObj={
        districtData
          ? {
              id: parseInt(districtData.id),
              name: districtData.name,
              code: districtData.code,
              description: districtObj?.description || '',
              count: districtObj?.count || 0,
              logo:
                districtData.logo_image_url ||
                districtObj?.icon ||
                '/images/district-icon/default.svg',
              src: districtObj?.src || '',
            }
          : districtObj
      }
      billboards={billboards}
      dropdownOptions={pageDropdownOptions}
      defaultView="list"
      period={period}
      bankInfo={bankInfo}
    />
  );
}
