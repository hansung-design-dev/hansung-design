'use client';

import ItemList from '@/src/components/ui/itemlist';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import KakaoMap from '@/src/components/kakaoMap';
import { billboards } from '@/src/mock/billboards';
import DropdownMenu from '@/src/components/dropdown';
import MapPinIcon from '@/src/icons/map-pin.svg';
import GalleryIcon from '@/src/icons/gallery.svg';
import ListIcon from '@/src/icons/list.svg';
import ViewTypeButton from '@/src/components/viewTypeButton';
import districts from '@/src/mock/district';

const fadeInUp = {
  initial: { y: 60, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

interface DistrictItem {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  tags: string[];
  location: string;
  status: string;
  spots: number | string;
}

const districtItems: DistrictItem[] = Array(12)
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

export default function DistrictPage() {
  const params = useParams();
  const encodedDistrict = params.district as string;
  const district = decodeURIComponent(encodedDistrict);
  const districtObj = districts.find((d) => d.name === district);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<{
    id: number;
    option: string;
  } | null>(null);

  const districtBillboards = billboards.filter(
    (b) => b.district === district && b.type === 'led'
  );
  const [viewType, setViewType] = useState<'location' | 'gallery' | 'list'>(
    'gallery'
  );

  // const handleItemSelect = (selectedItems: number[]) => {
  //   console.log('Selected items:', selectedItems);
  // };

  const renderGalleryView = () => (
    <div className="grid grid-cols-3 sm:grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-6">
      {districtItems.map((item, index) => (
        <div key={index} className="flex flex-col">
          <div className="relative aspect-[1/1] w-full overflow-hidden rounded-lg">
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="md:object-cover sm:object-cover"
            />
          </div>
          <div className="mt-4">
            <div className="flex gap-2 mb-2">
              {item.tags.map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="px-2 py-1 bg-black text-white text-0.875 rounded-[5rem]"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="text-1 font-medium">{item.title}</h3>
            <p className="text-0.875 text-gray-600">{item.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderLocationView = () => (
    <div className="flex gap-8" style={{ height: '700px' }}>
      {/* Left: Card List (scrollable) */}
      <div
        className="flex-1 overflow-y-auto pr-2"
        style={{ maxWidth: '40%', maxHeight: '700px' }}
      >
        <div className="flex flex-col gap-6">
          {districtItems.map((item, index) => (
            <div
              key={index}
              className="flex flex-col cursor-pointer border border-gray-200 rounded-lg overflow-hidden"
              onClick={() => {
                setSelectedId(item.id);
              }}
            >
              <div className="relative aspect-[1/1] w-full overflow-hidden rounded-t-lg">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex gap-2 mb-2">
                  {item.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-0.875 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-1 font-medium">{item.title}</h3>
                <p className="text-0.875 text-gray-600">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Right: Map (sticky, 1.5x width of card list) */}
      <div className="min-w-0" style={{ width: '60%', minWidth: '500px' }}>
        <div className="sticky top-0">
          <div className="w-full aspect-square min-h-[500px]">
            <KakaoMap
              markers={districtBillboards.map((b) => ({
                id: b.id,
                title: b.name,
                lat: b.lat,
                lng: b.lng,
                type: b.type,
              }))}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const handleDropdownChange = (item: { id: number; option: string }) => {
    setSelectedOption(item);
  };

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <div className="container mx-auto px-4 pt-[7rem]">
        <div className="mb-8">
          <div>
            {districtObj && (
              <Image
                src={districtObj.icon}
                alt={districtObj.name}
                width={38}
                height={38}
                className="inline-block align-middle mr-2"
              />
            )}
            <h2 className="text-2.25 font-900 font-gmarket inline-block align-middle">
              {district}
            </h2>
          </div>
          <div>{selectedOption ? selectedOption.option : defaultMenuName}</div>
          <p className="text-gray-600 mt-4">
            2025년 상반기 신청: <span className="text-red"> 상시모집</span>
          </p>
          <p className="text-gray-600">
            입금계좌
            <span className="text-red">
              우리은행 1005-602-397672 (주)한성디자인기획
            </span>
          </p>
          <p className="text-gray-600">송출사이즈 800*416 픽셀</p>
          <p className="text-gray-600">유동인구 : -명</p>
          <p className="text-gray-600">소비자트렌드 : </p>
        </div>

        {/* View Type Selector */}
        <div className="flex items-center gap-4 mb-8 border-b border-gray-200 pb-4">
          <ViewTypeButton
            Icon={MapPinIcon}
            label="지도로 보기"
            isActive={viewType === 'location'}
            onClick={() => setViewType('location')}
          />
          <ViewTypeButton
            Icon={GalleryIcon}
            label="갤러리로 보기"
            isActive={viewType === 'gallery'}
            onClick={() => setViewType('gallery')}
          />
          <ViewTypeButton
            Icon={ListIcon}
            label="목록으로 보기"
            isActive={viewType === 'list'}
            onClick={() => setViewType('list')}
          />
          <div className="ml-auto">
            <DropdownMenu
              data={dropdownOptions}
              onChange={handleDropdownChange}
              title="전체보기"
            />
          </div>
        </div>

        {/* Content Section */}
        <motion.div initial="initial" animate="animate" variants={fadeInUp}>
          {viewType === 'location' ? (
            renderLocationView()
          ) : viewType === 'list' ? (
            <ItemList
              items={districtItems}
              showHeader
              showCheckbox
              onItemSelect={(id, checked) =>
                console.log(`Item ${id} selected: ${checked}`)
              }
            />
          ) : (
            renderGalleryView()
          )}
        </motion.div>
      </div>
    </main>
  );
}
