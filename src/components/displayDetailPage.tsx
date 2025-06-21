import ItemList from '@/src/components/ui/itemlist';
import { motion } from 'framer-motion';
import Image from 'next/image';
import KakaoMap from '@/src/components/kakaoMap';
import DropdownMenu from '@/src/components/dropdown';
import ViewTypeButton from '@/src/components/viewTypeButton';
import MapPinIcon from '@/src/icons/map-pin.svg';
import GalleryIcon from '@/src/icons/gallery.svg';
import ListIcon from '@/src/icons/list.svg';
import { useState } from 'react';
import { useCart } from '../contexts/cartContext';
import { District, Billboard, DropdownOption } from '@/src/types/displaydetail';

const fadeInUp = {
  initial: { y: 60, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function DisplayDetailPage({
  district,
  districtObj,
  billboards,
  dropdownOptions,
  defaultMenuName,
  defaultView = 'gallery',
}: {
  district: string;
  districtObj: District | undefined;
  billboards: Billboard[];
  dropdownOptions: DropdownOption[];
  defaultMenuName: string;
  defaultView?: 'location' | 'gallery' | 'list';
}) {
  // const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<{
    id: number;
    option: string;
  } | null>(null);
  const [viewType, setViewType] = useState<'location' | 'gallery' | 'list'>(
    defaultView
  );
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const { dispatch } = useCart();

  const handleDropdownChange = (item: { id: number; option: string }) => {
    setSelectedOption(item);
  };

  const handleItemSelect = (id: number, checked?: boolean) => {
    const alreadySelected = selectedIds.includes(id);
    let newSelectedIds;

    // checked 파라미터가 있으면 그 값을 사용, 없으면 기존 로직 사용
    const shouldSelect = checked !== undefined ? checked : !alreadySelected;

    if (!shouldSelect) {
      newSelectedIds = selectedIds.filter((sid) => sid !== id);
      dispatch({ type: 'REMOVE_ITEM', id });
    } else {
      newSelectedIds = [...selectedIds, id];
      // billboards에서 아이템 찾기
      const item = billboards.find((item) => item.id === id);
      if (item) {
        dispatch({
          type: 'ADD_ITEM',
          item: {
            id: item.id,
            type: 'banner-display',
            name: item.address,
            district: item.district,
            price: 100000, // 가격 정보가 있다면 여기에 입력
          },
        });
      }
    }
    setSelectedIds(newSelectedIds);
  };

  const renderGalleryView = () => (
    <div className="grid grid-cols-3 sm:grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-6 ">
      {billboards.map((item, index) => {
        const isSelected = selectedIds.includes(item.id);
        return (
          <div
            key={index}
            className={`flex flex-col cursor-pointer `}
            onClick={() => handleItemSelect(item.id)}
          >
            <div
              className={`relative aspect-[1/1] w-full overflow-hidden rounded-lg ${
                isSelected
                  ? 'border-solid border-[#238CFA] border-[0.3rem]'
                  : ''
              }`}
            >
              {isSelected && (
                <Image
                  src="/images/blue-check.png"
                  alt="선택됨"
                  className="absolute top-2 left-2 w-4 h-4 z-10"
                  width={10}
                  height={10}
                />
              )}
              <Image
                src="/images/led-display.jpeg" // 기본 이미지 사용
                alt={item.name}
                fill
                className={`md:object-cover sm:object-cover `}
              />
            </div>
            <div className="mt-4">
              <div className="flex gap-2 mb-2">
                <span className="px-2 py-1 bg-black text-white text-0.875 rounded-[5rem]">
                  현수막게시대
                </span>
                <span className="px-2 py-1 bg-black text-white text-0.875 rounded-[5rem]">
                  {item.district}
                </span>
              </div>
              <h3 className="text-1 font-medium">{item.address}</h3>
              <p className="text-0.875 text-gray-600">{item.neighborhood}</p>
            </div>
          </div>
        );
      })}
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
          {billboards.map((item, index) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <div
                key={index}
                className={`flex flex-col cursor-pointer `}
                onClick={() => handleItemSelect(item.id)}
              >
                <div
                  className={`relative aspect-[1/1] w-full overflow-hidden rounded-lg ${
                    isSelected
                      ? 'border-solid border-[#238CFA] border-[0.3rem]'
                      : ''
                  }`}
                >
                  {isSelected && (
                    <Image
                      src="/images/blue-check.png"
                      alt="선택됨"
                      className="absolute top-2 left-2 w-4 h-4 z-10"
                      width={10}
                      height={10}
                    />
                  )}
                  <Image
                    src="/images/led-display.jpeg" // 기본 이미지 사용
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex gap-2 mb-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-0.875 rounded">
                      현수막게시대
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-0.875 rounded">
                      {item.district}
                    </span>
                  </div>
                  <h3 className="text-1 font-medium">{item.name}</h3>
                  <p className="text-0.875 text-gray-600">
                    {item.neighborhood}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Right: Map (sticky, 1.5x width of card list) */}
      <div className="min-w-0" style={{ width: '60%', minWidth: '500px' }}>
        <div className="sticky top-0">
          <div className="w-full aspect-square min-h-[500px]">
            <KakaoMap
              markers={billboards.map((b: Billboard) => ({
                id: b.id,
                title: b.name,
                lat: b.lat,
                lng: b.lng,
                type: b.type,
                isSelected: selectedIds.includes(b.id),
              }))}
              selectedIds={selectedIds}
              onSelect={handleItemSelect}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen flex flex-col bg-white pb-10">
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
              items={billboards.map((item) => ({
                id: item.id,
                title: item.name,
                subtitle: item.neighborhood,
                location: item.district,
                status: '진행중', // 기본값, 실제 데이터에서 가져와야 함
                quantity: item.faces,
              }))}
              showHeader
              showCheckbox
              selectedIds={selectedIds}
              onItemSelect={(id) => handleItemSelect(id)}
              enableRowClick={false}
            />
          ) : (
            renderGalleryView()
          )}
        </motion.div>
      </div>
    </main>
  );
}
