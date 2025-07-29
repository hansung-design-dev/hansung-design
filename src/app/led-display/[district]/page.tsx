'use client';
import LEDDisplayDetailPage from '@/src/components/ledDisplayDetailPage';
import SkeletonLoader from '@/src/components/layouts/skeletonLoader';
import { useParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import bannerDistricts from '@/src/mock/banner-district';
import { LEDBillboard } from '@/src/types/leddetail';

import { DropdownOption } from '@/src/types/displaydetail';

// LEDDisplayData 타입 정의
export interface LEDDisplayData {
  id: string;
  panel_code: number;
  nickname: string | null;
  address: string;
  panel_status: string;
  panel_type: string;
  latitude: number;
  longitude: number;
  photo_url?: string | null;
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
  led_slots: {
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

export default function LEDDisplayPage() {
  const params = useParams();
  const encodedDistrict = params.district as string;
  const district = decodeURIComponent(encodedDistrict);
  const isAllDistricts = district === 'all';
  const districtObj = useMemo(
    () =>
      isAllDistricts
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
        : bannerDistricts.find((d) => d.code === district),
    [isAllDistricts, district]
  );

  const [billboards, setBillboards] = useState<LEDBillboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // LED 전자게시대는 항상 상시접수이므로 period 상태 불필요
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [districtData, setDistrictData] = useState<{
    id: string;
    name: string;
    code: string;
    logo_image_url?: string;
    panel_status?: string;
  } | null>(null);

  const [dropdownOptions, setDropdownOptions] = useState<DropdownOption[]>([
    { id: 0, option: '전체보기' },
    { id: 1, option: '관악구' },
    { id: 2, option: '마포구' },
  ]);

  // LEDDisplayData를 LEDBillboard로 변환하는 함수
  function transformLEDData(ledData: LEDDisplayData[]): LEDBillboard[] {
    // 구별 가나다순 정렬
    const sortedData = [...ledData].sort((a, b) => {
      const districtCompare = a.region_gu.name.localeCompare(b.region_gu.name);
      if (districtCompare !== 0) return districtCompare;

      // 같은 구 내에서는 panel_code로 정렬
      const aCode = a.panel_code || 0;
      const bCode = b.panel_code || 0;
      return aCode - bCode;
    });

    return sortedData.map((item) => {
      const firstSlot = item.led_slots[0];

      // 구별 가나다순 ID 조합 (중복 방지)
      const districtCode = item.region_gu.code;
      const panelCode = item.panel_code || 1;
      const combinedId = `${districtCode}-${panelCode
        .toString()
        .padStart(2, '0')}-${item.id}`; // UUID 추가로 고유성 보장

      const price =
        item.led_slots && item.led_slots.length > 0
          ? `${item.led_slots[0].total_price?.toLocaleString()}원`
          : '문의';

      const totalPrice =
        item.led_slots && item.led_slots.length > 0
          ? item.led_slots[0].total_price
          : 0;

      return {
        id: combinedId, // "gangdong-01-uuid123", "gwanak-01-uuid456" 등
        type: 'led',
        district: item.region_gu.name,
        name: item.nickname || item.address,
        address: item.address,
        nickname: item.nickname,
        neighborhood: item.region_dong.name,
        period: '상시',
        price: price,
        size: `${item.led_panel_details.panel_width}x${item.led_panel_details.panel_height}`,
        faces: item.led_panel_details.max_banners,
        latitude: item.latitude || 37.5665, // API에서 받아온 실제 좌표 사용
        longitude: item.longitude || 126.978,
        photo_url: item.photo_url,
        status: item.panel_status,
        panel_width: item.led_panel_details.panel_width,
        panel_height: item.led_panel_details.panel_height,
        panel_code: item.panel_code,
        panel_type: item.panel_type,
        exposure_count: item.led_panel_details.exposure_count,
        max_banners: item.led_panel_details.max_banners,
        slot_width_px: firstSlot?.slot_width_px || 0,
        slot_height_px: firstSlot?.slot_height_px || 0,
        total_price: totalPrice,
        tax_price: firstSlot?.tax_price || 0,
        advertising_fee: firstSlot?.advertising_fee || 0,
        road_usage_fee: firstSlot?.road_usage_fee || 0,
        administrative_fee: firstSlot?.administrative_fee || 0,
        price_unit: firstSlot?.price_unit || '',
        panel_slot_status: firstSlot?.panel_slot_status || '',
        panel_id: item.id, // 원본 panels UUID
      };
    });
  }

  // 드롭다운 옵션을 실제 데이터베이스에서 가져오기
  useEffect(() => {
    async function fetchDropdownOptions() {
      try {
        const response = await fetch(
          '/api/led-display?action=getAvailableDistricts'
        );
        const result = await response.json();

        if (result.success && result.data) {
          const options = [
            { id: 0, option: '전체보기' },
            ...result.data.map(
              (
                district: { name: string; panel_status?: string },
                index: number
              ) => ({
                id: index + 1,
                option: district.name,
                panel_status: district.panel_status, // 상태 정보를 별도로 저장
              })
            ),
          ];
          setDropdownOptions(options);
        }
      } catch (error) {
        console.error('Failed to fetch available districts:', error);
      }
    }

    fetchDropdownOptions();
  }, []);

  console.log('🔍 District code from URL:', district);
  console.log('🔍 District object found:', districtObj);
  console.log('🔍 District name to pass to API:', districtObj?.name);
  console.log('🔍 District object details:', {
    id: districtObj?.id,
    name: districtObj?.name,
    code: districtObj?.code,
    logo: districtObj?.logo,
    description: districtObj?.description,
  });

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

        // URL에서 구 이름 추출 (dobong -> 도봉구)
        const getDistrictNameFromCode = (code: string): string => {
          const districtMap: Record<string, string> = {
            gangnam: '강남구',
            gangdong: '강동구',
            gangbuk: '강북구',
            gangseo: '강서구',
            gwanak: '관악구',
            gwangjin: '광진구',
            guro: '구로구',
            geumcheon: '금천구',
            nowon: '노원구',
            dobong: '도봉구',
            dongdaemun: '동대문구',
            dongjak: '동작구',
            mapo: '마포구',
            seodaemun: '서대문구',
            seocho: '서초구',
            seongdong: '성동구',
            seongbuk: '성북구',
            songpa: '송파구',
            yangcheon: '양천구',
            yeongdeungpo: '영등포구',
            yongsan: '용산구',
            eunpyeong: '은평구',
            jongno: '종로구',
            jung: '중구',
            jungnang: '중랑구',
          };
          return districtMap[code] || code;
        };

        const districtName =
          districtObj?.name || getDistrictNameFromCode(district);
        console.log('🔍 Using district name:', districtName);

        // 1. LED 데이터 가져오기
        const data = isAllDistricts
          ? await getAllLEDDisplays()
          : await getLEDDisplaysByDistrict(districtName);

        if (data && data.length > 0) {
          const transformed = transformLEDData(data);
          setBillboards(transformed);
        } else if (isAllDistricts) {
          setBillboards([]);
        } else {
          // 실제 데이터가 없으면 준비 중으로 처리
          setBillboards([]);
        }

        // 3. 구 정보와 계좌번호 정보 가져오기 (전체보기가 아닌 경우에만)
        if (!isAllDistricts && districtName) {
          const districtDataResult = await getDistrictData(districtName);
          if (districtDataResult) {
            setDistrictData({
              id: districtDataResult.id,
              name: districtDataResult.name,
              code: districtDataResult.code,
              logo_image_url: districtDataResult.logo_image_url,
              panel_status: districtDataResult.panel_status,
            });
            setBankInfo(districtDataResult.bank_accounts);
          } else {
            // API에서 데이터를 가져오지 못한 경우에도 기본 정보 생성
            setDistrictData({
              id: '0',
              name: districtName,
              code: district,
              logo_image_url: `/images/district-icon/${district}-gu.png`,
              panel_status: 'maintenance', // 기본값으로 maintenance 설정
            });
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
  }, [district, districtObj, isAllDistricts]);

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
              description: `${districtData.name} LED 전자게시대`,
              count: 0,
              logo:
                districtData.logo_image_url ||
                `/images/district-icon/${districtData.code}-gu.png`,
              src: '/images/led/landing.png',
            }
          : districtObj
      }
      billboards={billboards}
      dropdownOptions={dropdownOptions}
      defaultView="gallery"
      districtData={districtData}
      bankInfo={bankInfo}
    />
  );
}
