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
  maintenance_notes?: string; // 유지보수 노트 추가
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

    if (!response.ok) {
      console.error(
        `❌ API 응답 오류: ${response.status} ${response.statusText}`
      );
      return [];
    }

    const result = await response.json();

    if (result.success) {
      return result.data || [];
    } else {
      console.error('❌ API 응답 오류:', result.error);
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching LED displays by district:', error);
    return [];
  }
}

async function getAllLEDDisplays(): Promise<LEDDisplayData[]> {
  try {
    console.log('🔍 getAllLEDDisplays 호출 시작');
    const response = await fetch('/api/led-display?action=getAll');

    if (!response.ok) {
      console.error(
        `❌ API 응답 오류: ${response.status} ${response.statusText}`
      );
      return [];
    }

    const result = await response.json();
    console.log('🔍 getAllLEDDisplays API 응답:', {
      success: result.success,
      dataLength: result.data?.length || 0,
    });

    if (result.success) {
      console.log(
        '✅ getAllLEDDisplays 성공, 데이터 개수:',
        result.data?.length || 0
      );
      return result.data || [];
    } else {
      console.error('❌ API 응답 오류:', result.error);
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching all LED displays:', error);
    return [];
  }
}

export default function LEDDisplayPage() {
  const params = useParams();
  const encodedDistrict = params.district as string;
  const district = decodeURIComponent(encodedDistrict);

  const districtObj = useMemo(
    () => bannerDistricts.find((d) => d.code === district),
    [district]
  );

  const [billboards, setBillboards] = useState<LEDBillboard[]>([]);
  const [loading, setLoading] = useState(false); // 초기값을 false로 변경
  const [error, setError] = useState<string | null>(null);
  // LED 전자게시대는 항상 상시접수이므로 period 상태 불필요
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [districtData, setDistrictData] = useState<{
    id: string;
    name: string;
    code: string;
    logo_image_url?: string;
    panel_status?: string;
    phone_number?: string;
  } | null>(null);

  const [dropdownOptions, setDropdownOptions] = useState<DropdownOption[]>([
    { id: 1, option: '관악구' },
    { id: 2, option: '마포구' },
  ]);

  // LEDDisplayData를 LEDBillboard로 변환하는 함수
  function transformLEDData(ledData: LEDDisplayData[]): LEDBillboard[] {
    console.log('🔄 transformLEDData 시작, 입력 데이터 개수:', ledData.length);
    if (!ledData || ledData.length === 0) {
      console.warn('⚠️ transformLEDData: 빈 데이터');
      return [];
    }

    // 구별 가나다순 정렬
    const sortedData = [...ledData].sort((a, b) => {
      const districtCompare = a.region_gu.name.localeCompare(b.region_gu.name);
      if (districtCompare !== 0) return districtCompare;

      // 같은 구 내에서는 panel_code로 정렬
      const aCode = a.panel_code || 0;
      const bCode = b.panel_code || 0;
      return aCode - bCode;
    });

    const transformed = sortedData.map((item) => {
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
        type: 'led' as const,
        district: item.region_gu.name,
        name: item.nickname || item.address,
        address: item.address,
        nickname: item.nickname,
        neighborhood: item.region_dong?.name || '',
        period: '상시',
        price: price,
        size: item.led_panel_details
          ? `${item.led_panel_details.panel_width}x${item.led_panel_details.panel_height}`
          : '0x0',
        faces: item.led_panel_details?.max_banners || 0,
        latitude: item.latitude || 37.5665, // API에서 받아온 실제 좌표 사용
        longitude: item.longitude || 126.978,
        photo_url: item.photo_url,
        status: item.panel_status,
        panel_width: item.led_panel_details?.panel_width || 0,
        panel_height: item.led_panel_details?.panel_height || 0,
        panel_code: item.panel_code,
        panel_type: item.panel_type,
        exposure_count: item.led_panel_details?.exposure_count || 0,
        max_banners: item.led_panel_details?.max_banners || 0,
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
        maintenance_notes: item.maintenance_notes, // 유지보수 노트 추가
      };
    });

    console.log(
      '✅ transformLEDData 완료, 변환된 데이터 개수:',
      transformed.length
    );
    return transformed;
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
          // 전체보기 옵션을 맨 앞에 추가
          const options = [
            { id: 0, option: '전체보기' },
            ...result.data.map((district: { name: string }, index: number) => ({
              id: index + 1,
              option: district.name,
            })),
          ];
          setDropdownOptions(options);
        }
      } catch (error) {
        console.error('Failed to fetch available districts:', error);
        // 에러가 발생해도 기본 옵션 설정 (전체보기 포함)
        setDropdownOptions([
          { id: 0, option: '전체보기' },
          { id: 1, option: '관악구' },
          { id: 2, option: '마포구' },
        ]);
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

      if (!response.ok) {
        console.warn(`API 응답 오류: ${response.status}`);
        return null;
      }

      const result = await response.json();
      return result.success ? result.data : null;
    } catch (err) {
      console.warn(`Failed to fetch district data for ${districtName}:`, err);
      return null;
    }
  }

  useEffect(() => {
    // district가 없으면 즉시 종료
    if (!district || district.trim() === '') {
      console.warn('⚠️ district가 없습니다.');
      setLoading(false);
      setBillboards([]);
      setDistrictData({
        id: '0',
        name: '알 수 없음',
        code: '',
        logo_image_url: '/images/no_image.png',
        panel_status: 'active',
      });
      return;
    }

    // 전체보기 처리
    const isAllDistricts = district === 'all';

    let cancelled = false; // 취소 플래그
    let loadingSet = false; // 로딩 상태가 설정되었는지 추적

    async function fetchLEDData() {
      try {
        loadingSet = true;
        setLoading(true);
        setError(null);
        console.log('🔄 데이터 로딩 시작:', district);

        const currentDistrictObj = bannerDistricts.find(
          (d) => d.code === district
        );

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
          currentDistrictObj?.name || getDistrictNameFromCode(district);
        console.log(
          '🔍 Using district name:',
          districtName,
          'district:',
          district,
          'isAllDistricts:',
          isAllDistricts
        );

        // 1. LED 데이터 가져오기 (타임아웃 3초)
        const ledDataPromise = (async () => {
          if (cancelled) return [];
          try {
            if (isAllDistricts) {
              console.log('🔍 전체 LED 데이터 조회 시작');
              return await getAllLEDDisplays();
            } else if (districtName) {
              console.log('🔍 구별 LED 데이터 조회 시작:', districtName);
              return await getLEDDisplaysByDistrict(districtName);
            }
            return [];
          } catch (error) {
            console.error('❌ Failed to fetch LED data:', error);
            return [];
          }
        })();

        const ledDataTimeout = new Promise<LEDDisplayData[]>((resolve) =>
          setTimeout(() => {
            console.warn('⏱️ LED 데이터 타임아웃 (15초)');
            resolve([]);
          }, 15000)
        );

        const data = await Promise.race([ledDataPromise, ledDataTimeout]);

        if (cancelled) return;

        console.log('🔍 LED 데이터 로드 결과:', {
          isAllDistricts,
          districtName,
          dataLength: data?.length || 0,
          data: data?.slice(0, 2), // 처음 2개만 로그로 확인
        });

        if (data && data.length > 0) {
          console.log('✅ 데이터 변환 시작, 원본 데이터 개수:', data.length);
          const transformed = transformLEDData(data);
          console.log(
            '✅ 데이터 변환 완료, 변환된 데이터 개수:',
            transformed.length
          );
          setBillboards(transformed);
          console.log('✅ billboards 상태 업데이트 완료');
        } else {
          console.warn('⚠️ 데이터가 없거나 빈 배열입니다.');
          setBillboards([]);
        }

        // 2. 구 정보 설정
        if (isAllDistricts) {
          // 전체보기인 경우 기본 정보만 설정
          setDistrictData({
            id: '0',
            name: '전체보기',
            code: 'all',
            logo_image_url: '/svg/all.svg',
            panel_status: 'active',
            phone_number: undefined,
          });
          setBankInfo(null);
        } else {
          // 구별 정보 설정
          // 기본 정보 즉시 설정
          const defaultLogoUrl = `/images/district-icon/${district}-gu.png`;
          setDistrictData({
            id: '0',
            name: districtName || district,
            code: district,
            logo_image_url: defaultLogoUrl,
            panel_status: 'active',
            phone_number: undefined,
          });
          setBankInfo(null);

          // 구 정보는 백그라운드에서 가져오기 (타임아웃 2초)
          if (districtName) {
            Promise.race([
              getDistrictData(districtName),
              new Promise<null>((resolve) =>
                setTimeout(() => {
                  console.warn('⏱️ getDistrictData 타임아웃 (2초)');
                  resolve(null);
                }, 2000)
              ),
            ]).then((districtDataResult) => {
              if (cancelled) return;
              if (districtDataResult) {
                setDistrictData({
                  id: districtDataResult.id,
                  name: districtDataResult.name,
                  code: districtDataResult.code,
                  logo_image_url:
                    districtDataResult.logo_image_url || defaultLogoUrl,
                  panel_status: 'active',
                  phone_number: districtDataResult.phone_number,
                });
                setBankInfo(districtDataResult.bank_accounts);
              }
            });
          }
        }
      } catch (err) {
        console.error('❌ Error fetching LED data:', err);
        setError(`데이터를 불러오는 중 오류가 발생했습니다: ${err}`);
        // 에러 발생 시 즉시 로딩 해제
        if (!cancelled && loadingSet) {
          setLoading(false);
          console.log('✅ 에러 발생 - 로딩 해제');
        }
      } finally {
        if (!cancelled && loadingSet) {
          setLoading(false);
          console.log('✅ 로딩 완료');
        }
      }
    }

    // 안전장치: 15초 후에도 로딩이 true이면 강제로 해제
    const safetyTimeout = setTimeout(() => {
      if (!cancelled && loadingSet) {
        console.warn('⚠️ 15초 안전장치 - 강제로 로딩 상태 해제');
        setLoading(false);
      }
    }, 15000);

    fetchLEDData();

    return () => {
      cancelled = true;
      loadingSet = false;
      clearTimeout(safetyTimeout);
      // cleanup 시에도 로딩 해제
      setLoading(false);
    };
  }, [district]); // district 변경 시에만 실행

  // billboards 상태가 변경될 때마다 panel_status 업데이트
  useEffect(() => {
    if (districtData) {
      const hasLEDData = billboards.length > 0;
      const newStatus = hasLEDData ? 'active' : 'maintenance';
      // panel_status가 실제로 변경될 때만 업데이트
      setDistrictData((prev) => {
        if (!prev || prev.panel_status === newStatus) {
          return prev; // 변경사항이 없으면 그대로 반환
        }
        return {
          ...prev,
          panel_status: newStatus,
        };
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billboards.length, districtData?.id]); // districtData.id만 의존성에 포함 (무한 루프 방지)

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

  if (error && billboards.length === 0) {
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
              count: billboards.length,
              logo:
                districtData.logo_image_url ||
                (district === 'all'
                  ? '/svg/all.svg'
                  : `/images/district-icon/${districtData.code}-gu.png`),
              src: '/images/led/landing.png',
              phone_number: districtData.phone_number,
            }
          : {
              id: 0,
              name: district,
              code: district,
              description: `${district} LED 전자게시대`,
              count: billboards.length,
              logo:
                district === 'all'
                  ? '/svg/all.svg'
                  : `/images/district-icon/${district}-gu.png`,
              src: '/images/led/landing.png',
              phone_number: undefined,
            }
      }
      billboards={billboards}
      dropdownOptions={
        dropdownOptions.length > 0
          ? dropdownOptions
          : [
              { id: 0, option: '전체보기' },
              { id: 1, option: '관악구' },
              { id: 2, option: '마포구' },
            ]
      }
      defaultView="gallery"
      districtData={
        districtData || {
          id: '0',
          name: district,
          code: district,
          logo_image_url: `/images/district-icon/${district}-gu.png`,
          panel_status: 'active',
          phone_number: undefined,
        }
      }
      bankInfo={bankInfo || null}
      pricePolicies={[]}
    />
  );
}
