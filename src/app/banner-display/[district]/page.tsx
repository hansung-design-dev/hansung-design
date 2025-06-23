'use client';
import DisplayDetailPage from '@/src/components/displayDetailPage';
import SkeletonLoader from '@/src/components/layouts/skeletonLoader';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import districts from '@/src/mock/banner-district';
import { getBannerDisplaysByDistrict } from '@/lib/api/banner-display';
//import { testSupabaseConnection } from '@/lib/api/test-connection';
import { testBasicDataFetch } from '@/lib/api/banner-display';
import { BannerDisplayData } from '@/lib/supabase';

const dropdownOptions = [
  { id: 1, option: '전체보기' },
  { id: 2, option: '보기1' },
  { id: 3, option: '보기2' },
];

const defaultMenuName = '현수막게시대';

export default function BannerDisplayPage() {
  const params = useParams();
  const encodedDistrict = params.district as string;
  const district = decodeURIComponent(encodedDistrict);
  const districtObj = districts.find((d) => d.code === district);

  console.log(
    'district',
    districts.find((d) => d.code === district)
  );
  console.log('🔍 District code from URL:', district);
  console.log('🔍 District object found:', districtObj);
  console.log('🔍 District name to pass to API:', districtObj?.name);

  const [bannerData, setBannerData] = useState<BannerDisplayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [testResult, setTestResult] = useState<{
  //   success: boolean;
  //   error?: string;
  //   data?: {
  //     displayTypes: number;
  //     panelInfo: number;
  //     bannerDetails: number;
  //     regions: number;
  //   };
  //   message?: string;
  // } | null>(null);

  useEffect(() => {
    async function fetchBannerData() {
      try {
        setLoading(true);

        // 먼저 연결 테스트 실행
        console.log('🔍 Testing Supabase connection...');
        // const testResult = await testSupabaseConnection();
        // setTestResult(testResult);
        //console.log('Test result:', testResult);

        // if (!testResult.success) {
        //   throw new Error(`Connection test failed: ${testResult.error}`);
        // }

        // 기본 데이터 테스트 실행
        console.log('🔍 Testing basic data fetch...');
        const basicTestResult = await testBasicDataFetch();
        console.log('Basic test result:', basicTestResult);

        console.log('🔍 Fetching banner data for district:', district);
        console.log('🔍 Using district name for API:', districtObj?.name);
        const data = await getBannerDisplaysByDistrict(
          districtObj?.name || district
        );

        setBannerData(data);
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
  }, [district]);

  // Supabase 데이터를 컴포넌트에서 사용할 수 있는 형태로 변환
  const transformedBillboards =
    bannerData?.map((item, index) => {
      console.log('Processing item:', item);
      // console.log('Nickname value:', item.nickname);
      // console.log('Nickname type:', typeof item.nickname);

      const displayName =
        item.address && item.address.trim() !== ''
          ? item.address
          : item.address;

      // 가격 정보: banner_slot_info의 첫 번째 슬롯의 base_price 사용
      const price =
        item.banner_slot_info && item.banner_slot_info.length > 0
          ? `${item.banner_slot_info[0].base_price?.toLocaleString()}원`
          : '문의';

      return {
        id: index + 1, // 단순한 인덱스 사용
        type: 'banner',
        district: item.region_gu.name,
        name: displayName,
        address: item.address,
        nickname: item.nickname,
        neighborhood: item.region_dong.name,
        period: '상시',
        price: price,
        size:
          `${item.banner_panel_details.panel_width}x${item.banner_panel_details.panel_height}` ||
          'no size',
        faces: item.banner_panel_details.max_banners,
        lat: 37.5665, // 실제 좌표로 교체 필요
        lng: 126.978,
        panel_width: item.banner_panel_details.panel_width,
        panel_height: item.banner_panel_details.panel_height,
      };
    }) || [];

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
          {/* {error}
          {testResult && (
            <div className="mt-4 text-sm">
              <pre>{JSON.stringify(testResult, null, 2)}</pre>
            </div>
          )} */}
        </div>
      </div>
    );
  }

  return (
    <DisplayDetailPage
      district={district}
      districtObj={districtObj}
      billboards={transformedBillboards}
      dropdownOptions={dropdownOptions}
      defaultMenuName={defaultMenuName}
      defaultView="list"
    />
  );
}
