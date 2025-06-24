'use client';
import LEDItemList from '@/src/components/ui/ledItemList';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import KakaoMap from '@/src/components/kakaoMap';
import DropdownMenu from '@/src/components/dropdown';
import ViewTypeButton from '@/src/components/viewTypeButton';
import MapPinIcon from '@/src/icons/map-pin.svg';
import GalleryIcon from '@/src/icons/gallery.svg';
import ListIcon from '@/src/icons/list.svg';
import { useState } from 'react';
import { useCart } from '../contexts/cartContext';
import { District, DropdownOption } from '@/src/types/displaydetail';
import { LEDBillboard } from '@/src/types/leddetail';

const fadeInUp = {
  initial: { y: 60, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function LEDDisplayDetailPage({
  district,
  districtObj,
  billboards,
  dropdownOptions,
  defaultView = 'gallery',
}: {
  district: string;
  districtObj: District | undefined;
  billboards: LEDBillboard[];
  dropdownOptions: DropdownOption[];
  defaultView?: 'location' | 'gallery' | 'list';
}) {
  const [selectedOption, setSelectedOption] = useState<{
    id: number;
    option: string;
  } | null>(null);
  const [viewType, setViewType] = useState<'location' | 'gallery' | 'list'>(
    defaultView
  );
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const { dispatch } = useCart();
  const router = useRouter();

  const isAllDistrictsView = district === 'all';

  const filteredByDistrict =
    isAllDistrictsView && selectedOption
      ? billboards.filter((item) => item.district === selectedOption.option)
      : billboards;

  const filteredBillboards = isAllDistrictsView
    ? [...filteredByDistrict].sort((a, b) =>
        a.district.localeCompare(b.district)
      )
    : filteredByDistrict;

  // LED 전용 구분 컬럼에 표시할 값 계산 함수
  const getLEDPanelTypeLabel = (panelType?: string) => {
    if (!panelType) return 'LED전자게시대';
    return 'LED전자게시대';
  };

  const getCartItemName = (item: {
    nickname?: string | null;
    address?: string;
  }) => {
    if (item.nickname && item.address)
      return `${item.nickname} - ${item.address}`;
    if (item.nickname) return item.nickname;
    if (item.address) return item.address;
    return '';
  };

  const handleDropdownChange = (item: { id: number; option: string }) => {
    setSelectedOption(item);
    if (item.option === '전체보기' && !isAllDistrictsView) {
      router.push('/led-display/all');
    }
  };

  const handleItemSelect = (id: number, checked?: boolean) => {
    const alreadySelected = selectedIds.includes(id);
    let newSelectedIds;

    const shouldSelect = checked !== undefined ? checked : !alreadySelected;

    if (!shouldSelect) {
      newSelectedIds = selectedIds.filter((sid) => sid !== id);
      dispatch({ type: 'REMOVE_ITEM', id });
      console.log('🔍 Removed LED item from cart:', id);
    } else {
      newSelectedIds = [...selectedIds, id];
      const item = billboards.find((item) => item.id === id);
      if (item) {
        const priceString = String(item.price || '').replace(/,|원/g, '');
        const priceNumber = parseInt(priceString, 10);

        const priceForCart = !isNaN(priceNumber) ? priceNumber : 0;

        const cartItem = {
          id: item.id,
          type: 'led-display' as const,
          name: getCartItemName(item),
          district: item.district,
          price: priceForCart,
        };

        console.log('🔍 Adding LED item to cart:', cartItem);
        dispatch({
          type: 'ADD_ITEM',
          item: cartItem,
        });
      } else {
        console.error('🔍 LED item not found in billboards:', id);
      }
    }
    setSelectedIds(newSelectedIds);
  };

  const renderGalleryView = () => (
    <div className="grid grid-cols-3 sm:grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-6 ">
      {filteredBillboards.map((item, index) => {
        const isSelected = selectedIds.includes(item.id);
        const uniqueKey = item.id || `led-gallery-${index}`; // fallback key
        return (
          <div
            key={uniqueKey}
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
                src="/images/led-display.jpeg"
                alt={item.name}
                fill
                className={`md:object-cover sm:object-cover `}
              />
            </div>
            <div className="mt-4">
              <div className="flex gap-2 mb-2">
                <span className="px-2 py-1 bg-black text-white text-0.875 rounded-[5rem]">
                  {getLEDPanelTypeLabel(item.panel_type)}
                </span>
                <span className="px-2 py-1 bg-black text-white text-0.875 rounded-[5rem]">
                  {item.district}
                </span>
              </div>
              <h3 className="text-1 font-medium">{item.name}</h3>
              <p className="text-0.875 text-gray-600">{item.neighborhood}</p>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderLocationView = () => (
    <div className="flex gap-8" style={{ height: '700px' }}>
      <div
        className="flex-1 overflow-y-auto pr-2"
        style={{ maxWidth: '40%', maxHeight: '700px' }}
      >
        <div className="flex flex-col gap-6">
          {filteredBillboards.map((item, index) => {
            const isSelected = selectedIds.includes(item.id);
            const uniqueKey = item.id || `led-location-${index}`; // fallback key
            return (
              <div
                key={uniqueKey}
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
                    src="/images/led-display.jpeg"
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex gap-2 mb-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-0.875 rounded">
                      {getLEDPanelTypeLabel(item.panel_type)}
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
      <div className="min-w-0" style={{ width: '60%', minWidth: '500px' }}>
        <div className="sticky top-0">
          <div className="w-full aspect-square min-h-[500px]">
            <KakaoMap
              markers={filteredBillboards
                .filter((b) => b.lat != null && b.lng != null)
                .map((b) => ({
                  id: b.id,
                  title: b.name,
                  lat: b.lat!,
                  lng: b.lng!,
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
      <div className="lg:min-w-[70rem] lg:max-w-[1500px]  mx-auto px-4 pt-[7rem]">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 lg:text-1.125 md:text-1 font-semibold mb-4 text-gray-600"
        >
          <Image
            src="/svg/arrow-left.svg"
            alt="arrow-left"
            width={100}
            height={100}
            className="w-10 h-10 "
          />
          구 목록으로 돌아가기
        </button>
        <div className="mb-8">
          <div className="flex gap-2 items-center">
            {districtObj && (
              <Image
                src={districtObj.icon}
                alt={districtObj.name}
                width={50}
                height={50}
                className="inline-block align-middle mr-2"
              />
            )}
            <h2 className="text-2.25 font-900 font-gmarket inline-block align-middle">
              {districtObj?.name}
            </h2>
          </div>
          {selectedOption && <div>{selectedOption.option}</div>}
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
              title={selectedOption?.option || '전체보기'}
            />
          </div>
        </div>

        {/* Content Section */}
        <motion.div initial="initial" animate="animate" variants={fadeInUp}>
          {viewType === 'location' ? (
            renderLocationView()
          ) : viewType === 'list' ? (
            <LEDItemList
              items={filteredBillboards}
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
