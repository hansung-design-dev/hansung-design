'use client';
import DisplayDetailPage from '@/src/components/displayDetailPage';
import { useParams } from 'next/navigation';
import districts from '@/src/mock/district';
import { billboards } from '@/src/mock/billboards';

const districtItems = Array(12)
  .fill(null)
  .map((_, index) => ({
    id: index + 1,
    title: '울림픽대교 남단사거리 앞',
    subtitle: '(남단 유수지앞)',
    image: '/images/led-display.jpeg',
    tags: ['LED전자게시대', '방이동'],
    location: '방이동',
    status: '진행중',
    spots: index < 4 ? 12 - index * 3 : '-',
  }));

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
  const districtObj = districts.find((d) => d.name === district);

  return (
    <DisplayDetailPage
      district={district}
      districtObj={districtObj}
      districtItems={districtItems}
      billboards={billboards.filter(
        (b) => b.district === district && b.type === 'led'
      )}
      dropdownOptions={dropdownOptions}
      defaultMenuName={defaultMenuName}
    />
  );
}
