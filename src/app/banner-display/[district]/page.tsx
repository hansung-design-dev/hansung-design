'use client';
import DisplayDetailPage from '@/src/components/displayDetailPage';
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
  const districtObj = districts.find((d) => d.name === district);

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
        const data = await getBannerDisplaysByDistrict(district);
        console.log('📊 Banner data received:', data);
        console.log('📊 Banner data type:', typeof data);
        console.log('📊 Banner data length:', data?.length);
        console.log('📊 Banner data structure:', JSON.stringify(data, null, 2));
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
      console.log('Nickname value:', item.nickname);
      console.log('Nickname type:', typeof item.nickname);

      const displayName =
        item.address && item.address.trim() !== ''
          ? item.address
          : item.address;

      return {
        id: index + 1, // 단순한 인덱스 사용
        type: 'banner',
        district: item.region_gu.name,
        name: displayName,
        neighborhood: item.region_dong.name,
        period: '상시',
        price: '문의', // 가격 정보가 없으므로 기본값
        size: `${item.banner_panel_details.panel_width}x${item.banner_panel_details.panel_height}`,
        faces: item.banner_panel_details.max_banners,
        lat: 37.5665, // 실제 좌표로 교체 필요
        lng: 126.978,
      };
    }) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">
          로딩 중...
          {/* {testResult && (
            <div className="mt-4 text-sm text-gray-600">
              <pre>{JSON.stringify(testResult, null, 2)}</pre>
            </div>
          )} */}
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
