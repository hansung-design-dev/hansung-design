'use client';
import DisplayDetailPage from '@/src/components/displayDetailPage';
import { useParams } from 'next/navigation';
import districts from '@/src/mock/district';
import { bannerItems } from '@/src/mock/billboards';

const districtItems = Array(12)
  .fill(null)
  .map((_, index) => ({
    id: index + 1,
    title: '관악IC 만남의 광장',
    subtitle: '(관악산입구 건너편)',
    image: '/images/led-display.jpeg',
    tags: ['현수막게시대', '관악구'],
    location: '관악구',
    status: '진행중',
    spots: index < 4 ? 12 - index * 3 : '-',
  }));

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

  return (
    <DisplayDetailPage
      district={district}
      districtObj={districtObj}
      districtItems={districtItems}
      billboards={bannerItems
        .filter((b) => b.location.split(' ')[0] === district)
        .map((item) => ({
          id: Number(item.id),
          type: 'banner',
          district: item.location.split(' ')[0],
          name: item.title,
          neighborhood: item.location.split(' ')[1],
          period: '상시',
          price: item.price.toString(),
          size: `${item.width}x${item.height}`,
          faces: item.slots,
          lat: 37.5665, // 실제 좌표로 교체 가능
          lng: 126.978,
        }))}
      dropdownOptions={dropdownOptions}
      defaultMenuName={defaultMenuName}
      defaultView="list"
    />
  );
}
