'use client';
import DisplayDetailPage from '@/src/components/displayDetailPage';
import { useParams } from 'next/navigation';
import districts from '@/src/mock/banner-district';
import { ledItems } from '@/src/mock/billboards';
import type { Billboard } from '@/src/types/displaydetail';

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

  return (
    <DisplayDetailPage
      district={district}
      districtObj={districtObj}
      //districtItems={districtItems}
      billboards={ledItems
        .filter((b) => b.location.split(' ')[0] === district)
        .map(
          (item): Billboard => ({
            id: Number(item.id),
            type: 'led',
            district: item.location.split(' ')[0],
            name: item.title,
            neighborhood: item.location.split(' ')[1],
            period: '상시',
            price: item.price.toString(),
            size: `${item.width}x${item.height}`,
            faces: item.slots,
            lat: 37.5665, // Default coordinates
            lng: 126.978,
          })
        )}
      dropdownOptions={dropdownOptions}
      defaultMenuName={defaultMenuName}
    />
  );
}
