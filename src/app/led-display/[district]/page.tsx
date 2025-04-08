'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Nav from '../../../components/Nav';
import ItemList from '../../../components/ItemList';
import { useParams } from 'next/navigation';
import { useState } from 'react';

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

const ViewTypeButton = ({
  icon,
  label,
  isActive,
  onClick,
}: {
  icon: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded ${
      isActive ? 'bg-black text-white' : 'text-gray-600'
    }`}
  >
    <Image
      src={icon}
      alt={label}
      width={20}
      height={20}
      className={isActive ? 'invert' : ''}
    />
    <span>{label}</span>
  </button>
);

export default function DistrictPage() {
  const params = useParams();
  const district = params.district as string;
  const [viewType, setViewType] = useState<'location' | 'gallery' | 'list'>(
    'gallery'
  );

  const handleItemSelect = (selectedItems: number[]) => {
    console.log('Selected items:', selectedItems);
  };

  const renderGalleryView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {districtItems.map((item, index) => (
        <div key={index} className="flex flex-col">
          <div className="relative aspect-[1/1] w-full overflow-hidden rounded-lg">
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="mt-4">
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
  );

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Nav variant="default" />

      <div className="container mx-auto px-4 pt-[7rem]">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <span>LED 전자게시대</span>
            <span>/</span>
            <span>{district}</span>
          </div>
          <h2 className="text-2.25 font-bold">{district}</h2>
          <p className="text-gray-600 mt-4">전화번호: 0000-000-0000</p>
          <p className="text-gray-600">주소: 서울특별시 강동구 000-0</p>
          <p className="text-gray-600">노선위치번호:</p>
        </div>

        {/* View Type Selector */}
        <div className="flex items-center gap-4 mb-8 border-b border-gray-200 pb-4">
          <ViewTypeButton
            icon="/svg/map-pin.svg"
            label="지도로 보기"
            isActive={viewType === 'location'}
            onClick={() => setViewType('location')}
          />
          <ViewTypeButton
            icon="/svg/gallery.svg"
            label="갤러리로 보기"
            isActive={viewType === 'gallery'}
            onClick={() => setViewType('gallery')}
          />
          <ViewTypeButton
            icon="/svg/list.svg"
            label="목록으로 보기"
            isActive={viewType === 'list'}
            onClick={() => setViewType('list')}
          />
          <div className="ml-auto">
            <select className="border border-gray-200 rounded-lg px-4 py-2">
              <option>전체보기</option>
            </select>
          </div>
        </div>

        {/* Content Section */}
        <motion.div initial="initial" animate="animate" variants={fadeInUp}>
          {viewType === 'list' ? (
            <ItemList
              items={districtItems}
              onItemSelect={handleItemSelect}
              showFooterInfo={true}
            />
          ) : (
            renderGalleryView()
          )}
        </motion.div>
      </div>
    </main>
  );
}
