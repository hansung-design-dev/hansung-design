'use client';
import DisplayDetailPage from '@/src/components/displayDetailPage';
import { useParams } from 'next/navigation';
import districts from '@/src/mock/banner-district';
import { ledItems } from '@/src/mock/billboards';
import type { BannerBillboard } from '@/src/types/displaydetail';
import { useEffect, useState } from 'react';
import SkeletonLoader from '@/src/components/layouts/skeletonLoader';

// const districtItems = Array(12)
//   .fill(null)
//   .map((_, index) => ({
//     id: index + 1,
//     title: '울림픽대교 남단사거리 앞',
//     subtitle: '(남단 유수지앞)',
//     image: '/images/led-display.jpeg',
//     tags: ['LED전자게시대', '방이동'],
//     location: '방이동',
//     status: '진행중',
//     spots: index < 4 ? 12 - index * 3 : '-',
//   }));

const dropdownOptions = [
  { id: 1, option: '전체보기' },
  { id: 2, option: '보기1' },
  { id: 3, option: '보기2' },
];

const defaultMenuName = 'LED전자게시대';

export default function LedDisplayPage() {
  const params = useParams();
  const encodedDistrict = params.district as string;
  const district = decodeURIComponent(encodedDistrict);
  const districtObj = districts.find((d) => d.code === district);

  const [billboards, setBillboards] = useState<BannerBillboard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Simulate data fetching
    const filteredData = ledItems
      .filter((b) => b.location.split(' ')[0] === district)
      .map(
        (item): BannerBillboard => ({
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
        })
      );
    // Simulate async loading
    setTimeout(() => {
      setBillboards(filteredData);
      setLoading(false);
    }, 500); // 0.5초 딜레이
  }, [district]);

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

  return (
    <DisplayDetailPage
      district={district}
      districtObj={districtObj}
      billboards={billboards}
      dropdownOptions={dropdownOptions}
      defaultMenuName={defaultMenuName}
    />
  );
}
