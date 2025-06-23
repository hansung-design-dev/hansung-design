'use client';
import DisplayDetailPage from '@/src/components/displayDetailPage';
import SkeletonLoader from '@/src/components/layouts/skeletonLoader';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import districts from '@/src/mock/banner-district';
import { getBannerDisplaysByDistrict } from '@/lib/api/banner-display';
//import { testSupabaseConnection } from '@/lib/api/test-connection';
import { BannerBillboard } from '@/src/types/displaydetail';
import { ledItems } from '@/src/mock/billboards';

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

  const [billboards, setBillboards] = useState<BannerBillboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBannerData() {
      try {
        setLoading(true);

        const data = await getBannerDisplaysByDistrict(
          districtObj?.name || district
        );

        if (data && data.length > 0) {
          const transformed = data.map((item, index) => {
            const displayName =
              item.address && item.address.trim() !== ''
                ? item.address
                : item.address;

            const price =
              item.banner_slot_info && item.banner_slot_info.length > 0
                ? `${item.banner_slot_info[0].total_price?.toLocaleString()}원`
                : '문의';

            const bannerType =
              item.banner_slot_info && item.banner_slot_info.length > 0
                ? item.banner_slot_info[0].banner_type
                : undefined;

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
              is_for_admin: item.banner_panel_details.is_for_admin,
              status: item.panel_status,
              panel_code: item.panel_code,
              banner_type: bannerType,
            };
          });
          setBillboards(transformed);
        } else {
          // DB에 데이터가 없으면 목업 데이터를 사용
          const mockBillboards = ledItems
            .filter((b) => b.location.split(' ')[0] === district)
            .map(
              (item): BannerBillboard => ({
                id: Number(item.id),
                type: 'banner', // 타입을 'banner'로 설정
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
              })
            );
          setBillboards(mockBillboards);
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
  }, [district, districtObj?.name]);

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
      districtObj={districtObj}
      billboards={billboards}
      dropdownOptions={dropdownOptions}
      defaultMenuName={defaultMenuName}
      defaultView="list"
    />
  );
}
