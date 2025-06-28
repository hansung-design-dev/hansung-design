'use client';
import LEDDisplayDetailPage from '@/src/components/ledDisplayDetailPage';
import SkeletonLoader from '@/src/components/layouts/skeletonLoader';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import bannerDistricts from '@/src/mock/banner-district';
import { LEDBillboard } from '@/src/types/leddetail';
import { ledItems } from '@/src/mock/billboards';

// LEDDisplayData 타입 정의
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
async function getLEDDisplaysByDistrict(
  districtName: string
): Promise<LEDDisplayData[]> {
  try {
    const response = await fetch(
      `/api/led-display?action=getByDistrict&district=${encodeURIComponent(
        districtName
      )}`
    );
    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Error fetching LED displays by district:', error);
    throw error;
  }
}

async function getAllLEDDisplays(): Promise<LEDDisplayData[]> {
  try {
    const response = await fetch('/api/led-display?action=getAll');
    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Error fetching all LED displays:', error);
    throw error;
  }
}

const dropdownOptions = [
  { id: 1, option: '전체' },
  { id: 2, option: '보기1' },
  { id: 3, option: '보기2' },
];

export default function LEDDisplayPage() {
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
        size: '',
        led_count: 0,
        banner_count: 0,
        sizeOfPeople: '',
        logo: '/images/district-icon/all.svg',
        src: '',
      }
    : bannerDistricts.find((d) => d.code === district);

  const [billboards, setBillboards] = useState<LEDBillboard[]>([]);
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

  // LEDDisplayData를 LEDBillboard로 변환하는 함수
  function transformLEDData(ledData: LEDDisplayData[]): LEDBillboard[] {
    return ledData.map((item) => {
      const firstSlot = item.led_slot_info[0];
      return {
        id: parseInt(item.id),
        type: 'led',
        district: item.region_gu.name,
        name: item.nickname || item.address,
        address: item.address,
        nickname: item.nickname,
        neighborhood: item.region_dong.name,
        period: '상시',
        price: firstSlot?.total_price?.toString() || '0',
        size: `${item.led_panel_details.panel_width}x${item.led_panel_details.panel_height}`,
        faces: item.led_panel_details.max_banners,
        lat: 37.5665, // 기본 좌표 (실제 데이터가 있다면 사용)
        lng: 126.978,
        status: item.panel_status,
        panel_width: item.led_panel_details.panel_width,
        panel_height: item.led_panel_details.panel_height,
        panel_code: item.panel_code,
        panel_type: item.panel_type,
        exposure_count: item.led_panel_details.exposure_count,
        max_banners: item.led_panel_details.max_banners,
        slot_width_px: firstSlot?.slot_width_px || 0,
        slot_height_px: firstSlot?.slot_height_px || 0,
        total_price: firstSlot?.total_price || 0,
        tax_price: firstSlot?.tax_price || 0,
        advertising_fee: firstSlot?.advertising_fee || 0,
        road_usage_fee: firstSlot?.road_usage_fee || 0,
        administrative_fee: firstSlot?.administrative_fee || 0,
        price_unit: firstSlot?.price_unit || '',
        panel_slot_status: firstSlot?.panel_slot_status || '',
      };
    });
  }

  // 드롭다운 옵션 생성 함수
  const generateDropdownOptions = (ledBillboards: LEDBillboard[]) => {
    if (isAllDistricts) {
      // 전체보기인 경우 실제 LED 데이터에서 구별 옵션 생성
      const districts = Array.from(
        new Set(ledBillboards.map((b) => b.district))
      ).sort();
      return [
        { id: 0, option: '전체보기' },
        ...districts.map((districtName, index) => ({
          id: index + 1,
          option: districtName,
        })),
      ];
    } else {
      // 개별 구인 경우 기본 옵션
      return dropdownOptions;
    }
  };

  const pageDropdownOptions = generateDropdownOptions(billboards);

  console.log('🔍 District code from URL:', district);
  console.log('🔍 District object found:', districtObj);
  console.log('🔍 District name to pass to API:', districtObj?.name);

  // 신청기간 가져오기 함수
  async function getDisplayPeriod(districtName: string) {
    try {
      const response = await fetch(
        `/api/display-period?district=${encodeURIComponent(
          districtName
        )}&display_type=led_display`
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
        )}&displayType=led_display`
      );
      const result = await response.json();
      return result.success ? result.data : null;
    } catch (err) {
      console.warn(`Failed to fetch district data for ${districtName}:`, err);
      return null;
    }
  }

  useEffect(() => {
    async function fetchLEDData() {
      try {
        setLoading(true);

        // 1. LED 데이터 가져오기
        const data = isAllDistricts
          ? await getAllLEDDisplays()
          : await getLEDDisplaysByDistrict(districtObj?.name || district);

        if (data && data.length > 0) {
          const transformed = transformLEDData(data);
          setBillboards(transformed);
        } else if (isAllDistricts) {
          setBillboards([]);
        } else {
          // DB에 데이터가 없으면 목업 데이터를 사용
          const mockBillboards = ledItems
            .filter((b) => b.location.split(' ')[0] === district)
            .map(
              (item): LEDBillboard => ({
                id: Number(item.id),
                type: 'led',
                district: item.location.split(' ')[0],
                name: item.title,
                address: item.title,
                nickname: item.location.split(' ')[1],
                neighborhood: item.location.split(' ')[1],
                period: '상시',
                price: item.price.toString(),
                size: `${item.width}x${item.height}`,
                faces: item.slots,
                lat: 37.5665, // Default coordinates
                lng: 126.978,
                status: '진행중',
                panel_width: item.width,
                panel_height: item.height,
                panel_code: Number(item.id),
                panel_type: 'led',
                exposure_count: 50000,
                max_banners: item.slots,
                slot_width_px: item.width,
                slot_height_px: item.height,
                total_price: item.price,
                tax_price: Math.floor(item.price * 0.1),
                advertising_fee: Math.floor(item.price * 0.8),
                road_usage_fee: Math.floor(item.price * 0.05),
                administrative_fee: Math.floor(item.price * 0.05),
                price_unit: '1 month',
                panel_slot_status: 'available',
              })
            );
          setBillboards(mockBillboards);
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
        console.error('❌ Error fetching LED data:', err);
        setError(`데이터를 불러오는 중 오류가 발생했습니다: ${err}`);
      } finally {
        setLoading(false);
      }
    }

    if (district) {
      fetchLEDData();
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
    <LEDDisplayDetailPage
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
      defaultView="gallery"
      period={period}
      bankInfo={bankInfo}
    />
  );
}
