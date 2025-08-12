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
import { useState, useEffect } from 'react';
import { useCart } from '../contexts/cartContext';
import { useProfile } from '../contexts/profileContext';
import { useAuth } from '../contexts/authContext';
import { District, DropdownOption } from '@/src/types/displaydetail';
import { LEDBillboard } from '@/src/types/leddetail';
import DistrictInfo from './districtInfo';
//import HalfPeriodTabs from './ui/HalfPeriodTabs';

const fadeInUp = {
  initial: { y: 60, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6 },
  },
};

export default function LEDDisplayDetailPage({
  district,
  districtObj,
  billboards,
  dropdownOptions,
  defaultView = 'gallery',
  districtData,
  bankInfo,
  pricePolicies,
}: {
  district: string;
  districtObj: District | undefined;
  billboards: LEDBillboard[];
  dropdownOptions: DropdownOption[];
  defaultView?: 'location' | 'gallery' | 'list';
  districtData?: {
    id: string;
    name: string;
    code: string;
    logo_image_url?: string;
    panel_status?: string;
  } | null;
  bankInfo?: {
    id: string;
    bank_name: string;
    account_number: string;
    depositor: string;
    region_gu: {
      id: string;
      name: string;
    };
    display_types: {
      id: string;
      name: string;
    };
  } | null;
  pricePolicies?: {
    id: string;
    price_usage_type:
      | 'default'
      | 'public_institution'
      | 're_order'
      | 'self_install'
      | 'reduction_by_admin'
      | 'rent-place';
    tax_price: number;
    road_usage_fee: number;
    advertising_fee: number;
    total_price: number;
    displayName?: string;
  }[];
}) {
  const isAllDistrictsView = district === 'all';

  const [selectedOption, setSelectedOption] = useState<{
    id: number;
    option: string;
    panel_status?: string;
  } | null>(() => {
    // 현재 구에 해당하는 옵션 찾기
    if (districtObj?.name) {
      const matchingOption = dropdownOptions.find(
        (option) => option.option === districtObj.name
      );
      return matchingOption || null;
    }
    // 전체보기 페이지인 경우 기본값 설정
    if (isAllDistrictsView) {
      return { id: 0, option: '전체보기' };
    }
    return null;
  });
  const [viewType, setViewType] = useState<'location' | 'gallery' | 'list'>(
    defaultView
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // const [selectedHalfPeriod, setSelectedHalfPeriod] = useState<
  //   'first_half' | 'second_half'
  // >('first_half');
  const { dispatch } = useCart();
  const { profiles } = useProfile();
  const { user } = useAuth();
  const router = useRouter();

  // dropdownOptions가 변경될 때 selectedOption 업데이트
  useEffect(() => {
    console.log('🔍 LED Detail - districtObj:', districtObj);
    console.log('🔍 LED Detail - dropdownOptions:', dropdownOptions);
    console.log('🔍 LED Detail - selectedOption:', selectedOption);

    if (dropdownOptions.length > 0) {
      let matchingOption = null;

      // 전체보기 페이지인 경우
      if (isAllDistrictsView) {
        matchingOption = dropdownOptions.find(
          (option) => option.option === '전체보기'
        );
      } else if (districtObj?.name) {
        // 특정 구 페이지인 경우
        matchingOption = dropdownOptions.find(
          (option) => option.option === districtObj.name
        );
      }

      console.log('🔍 LED Detail - matchingOption:', matchingOption);

      if (
        matchingOption &&
        (!selectedOption || selectedOption.option !== matchingOption.option)
      ) {
        console.log(
          '🔍 LED Detail - setting selectedOption to:',
          matchingOption
        );
        setSelectedOption(matchingOption);
      }
    }
  }, [
    dropdownOptions,
    districtObj?.name,
    selectedOption,
    districtObj,
    isAllDistrictsView,
  ]);

  // selectedIds 상태 변화 추적 (디버깅용 - 주석 처리)
  // useEffect(() => {
  //   console.log('🔍 selectedIds 상태 변경:', selectedIds);

  //   // 선택된 아이템들의 상세 정보 출력
  //   if (selectedIds.length > 0) {
  //     const selectedItems = billboards.filter((item) =>
  //       selectedIds.includes(item.id)
  //     );
  //     console.log(
  //       '🔍 현재 선택된 아이템들:',
  //       selectedItems.map((item) => ({
  //         id: item.id,
  //         name: item.name,
  //         latitude: item.latitude,
  //         longitude: item.longitude,
  //         district: item.district,
  //         address: item.address,
  //       }))
  //     );
  //   } else {
  //     console.log('🔍 선택된 아이템 없음');
  //   }
  // }, [selectedIds, billboards]);

  // 구 이름을 코드로 변환하는 함수
  const getDistrictCode = (districtName: string): string => {
    const districtMap: Record<string, string> = {
      강남구: 'gangnam',
      강동구: 'gangdong',
      강북구: 'gangbuk',
      강서구: 'gangseo',
      관악구: 'gwanak',
      광진구: 'gwangjin',
      구로구: 'guro',
      금천구: 'geumcheon',
      노원구: 'nowon',
      도봉구: 'dobong',
      동대문구: 'dongdaemun',
      동작구: 'dongjak',
      마포구: 'mapo',
      서대문구: 'seodaemun',
      서초구: 'seocho',
      성동구: 'seongdong',
      성북구: 'seongbuk',
      송파구: 'songpa',
      양천구: 'yangcheon',
      영등포구: 'yeongdeungpo',
      용산구: 'yongsan',
      은평구: 'eunpyeong',
      종로구: 'jongno',
      중구: 'jung',
      중랑구: 'jungnang',
    };
    const result = districtMap[districtName] || districtName.replace('구', '');
    console.log('🔍 getDistrictCode - input:', districtName, 'output:', result);
    return result;
  };

  const filteredByDistrict =
    isAllDistrictsView && selectedOption && selectedOption.option !== '전체보기'
      ? billboards.filter((item) => item.district === selectedOption.option)
      : billboards;

  // 디버깅: 원본 데이터 확인
  console.log('🔍 원본 billboards 데이터:', billboards);
  console.log('🔍 isAllDistrictsView:', isAllDistrictsView);
  console.log('🔍 selectedOption:', selectedOption);
  console.log('🔍 filteredByDistrict:', filteredByDistrict);

  // 상하반기에 따른 필터링
  const filteredByHalfPeriod = filteredByDistrict.map((item) => ({
    ...item,
    // LED는 상하반기 구분이 없으므로 기본값 사용
    faces: item.faces,
  }));

  const filteredBillboards = isAllDistrictsView
    ? [...filteredByHalfPeriod].sort((a, b) =>
        a.district.localeCompare(b.district)
      )
    : filteredByHalfPeriod;

  console.log('🔍 filteredBillboards:', filteredBillboards);

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

  const handleDropdownChange = async (item: { id: number; option: string }) => {
    console.log('🔍 handleDropdownChange called with:', item);
    setSelectedOption(item);

    if (item.option === '전체보기') {
      console.log('🔍 Navigating to all districts');
      router.push('/led-display/all');
      return;
    }

    // 구 이름 그대로 사용 (이미 (준비 중) 텍스트가 제거됨)
    const districtName = item.option;
    console.log('🔍 Selected district name:', districtName);

    // 구를 선택했을 때 해당 구의 페이지로 이동
    if (item.option !== '전체보기') {
      const districtCode = getDistrictCode(districtName);
      console.log(
        '🔍 Converting district name to code:',
        districtName,
        '->',
        districtCode
      );
      console.log('🔍 Navigating to:', `/led-display/${districtCode}`);
      router.push(`/led-display/${districtCode}`);
    }
  };

  const handleItemSelect = (id: string, checked?: boolean) => {
    console.log('🔍 handleItemSelect called:', { id, checked, viewType });

    // 지도 뷰에서는 선택만 하고 장바구니에는 추가하지 않음
    if (viewType === 'location') {
      const alreadySelected = selectedIds.includes(id);
      const shouldSelect = checked !== undefined ? checked : !alreadySelected;

      console.log('🔍 지도 뷰 선택 처리:', { alreadySelected, shouldSelect });

      if (!shouldSelect) {
        const newSelectedIds = selectedIds.filter((sid) => sid !== id);
        console.log('🔍 선택 해제:', id, '새로운 selectedIds:', newSelectedIds);
        setSelectedIds(newSelectedIds);
      } else {
        const newSelectedIds = [...selectedIds, id];
        console.log('🔍 선택 추가:', id, '새로운 selectedIds:', newSelectedIds);
        setSelectedIds(newSelectedIds);
      }
      return;
    }

    // 갤러리와 목록 뷰에서는 기존 로직 유지 (선택 시 장바구니에 추가)
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
        // total_price가 있으면 사용, 없으면 기존 로직 사용
        const priceForCart =
          item.total_price !== undefined
            ? item.total_price
            : (() => {
                const priceString = String(item.price || '').replace(
                  /,|원/g,
                  ''
                );
                const priceNumber = parseInt(priceString, 10);
                return !isNaN(priceNumber) ? priceNumber : 0;
              })();

        // 기본 프로필 정보 가져오기
        const defaultProfile = profiles.find((profile) => profile.is_default);

        const cartItem = {
          id: item.id, // 복합 ID (gwanak-03-uuid)
          type: 'led-display' as const,
          name: getCartItemName(item),
          district: item.district,
          price: priceForCart,
          // LED 전자게시대는 상시접수이므로 상하반기 정보 제거
          panel_type: item.panel_type,
          panel_id: item.panel_id, // 원본 UUID
          panel_code: item.panel_code?.toString(),
          photo_url: item.photo_url || undefined, // 게시대 사진 URL 추가
          // 사용자 프로필 정보 추가
          contact_person_name: defaultProfile?.contact_person_name,
          phone: defaultProfile?.phone,
          company_name: defaultProfile?.company_name,
          email: defaultProfile?.email,
          user_profile_id: defaultProfile?.id,
          user_auth_id: defaultProfile?.user_auth_id || user?.id,
        };

        console.log('🔍 Adding LED item to cart:', cartItem);
        console.log('🔍 LED 상담신청 아이템:', {
          name: cartItem.name,
          district: cartItem.district,
          price: cartItem.price,
          type: cartItem.type,
          photo_url: cartItem.photo_url,
          hasPhotoUrl: !!cartItem.photo_url,
        });
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

  const handleAddToCart = (id: string) => {
    const item = billboards.find((item) => item.id === id);
    if (item) {
      // total_price가 있으면 사용, 없으면 기존 로직 사용
      const priceForCart =
        item.total_price !== undefined
          ? item.total_price
          : (() => {
              const priceString = String(item.price || '').replace(/,|원/g, '');
              const priceNumber = parseInt(priceString, 10);
              return !isNaN(priceNumber) ? priceNumber : 0;
            })();

      // 기본 프로필 정보 가져오기
      const defaultProfile = profiles.find((profile) => profile.is_default);

      const cartItem = {
        id: item.id, // 복합 ID (gwanak-03-uuid)
        type: 'led-display' as const,
        name: getCartItemName(item),
        district: item.district,
        price: priceForCart,
        // LED 전자게시대는 상시접수이므로 상하반기 정보 제거
        panel_type: item.panel_type,
        panel_id: item.panel_id, // 원본 UUID
        panel_code: item.panel_code?.toString(),
        photo_url: item.photo_url || undefined, // 게시대 사진 URL 추가
        // 사용자 프로필 정보 추가
        contact_person_name: defaultProfile?.contact_person_name,
        phone: defaultProfile?.phone,
        company_name: defaultProfile?.company_name,
        email: defaultProfile?.email,
        user_profile_id: defaultProfile?.id,
        user_auth_id: defaultProfile?.user_auth_id || user?.id,
      };

      console.log('🔍 Adding LED item to cart:', cartItem);
      console.log('🔍 LED 상담신청 아이템:', {
        name: cartItem.name,
        district: cartItem.district,
        price: cartItem.price,
        type: cartItem.type,
        photo_url: cartItem.photo_url,
        hasPhotoUrl: !!cartItem.photo_url,
      });
      dispatch({
        type: 'ADD_ITEM',
        item: cartItem,
      });
    } else {
      console.error('🔍 LED item not found in billboards:', id);
    }
  };

  const handleRowClick = (e: React.MouseEvent, itemId: string) => {
    if ((e.target as HTMLElement).tagName === 'INPUT') {
      return;
    }

    // 아이콘 버튼 영역 클릭 시 아이템 선택 방지
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.tagName === 'BUTTON') {
      return;
    }

    handleItemSelect(itemId, true);
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
            onClick={(e) => handleRowClick(e, item.id)}
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
                src={item.photo_url || '/images/led-display.jpeg'}
                alt={item.name}
                fill
                className={`md:object-cover sm:object-cover `}
              />
            </div>
            <div className="mt-4">
              <h3 className="text-1 font-medium">{item.name}</h3>
              <p className="text-0.875 text-gray-600">{item.neighborhood}</p>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderLocationView = () => {
    // 지도 뷰에서는 단일 선택만 가능하므로 첫 번째 선택된 아이템만 사용
    const selectedItem =
      selectedIds.length > 0
        ? filteredBillboards.find((b) => b.id === selectedIds[0])
        : null;

    // 선택된 아이템만 지도에 표시 (단일 선택)
    const mapMarkers =
      selectedItem &&
      selectedItem.latitude != null &&
      selectedItem.longitude != null
        ? [
            {
              id: selectedItem.id,
              title: selectedItem.name,
              lat: selectedItem.latitude!,
              lng: selectedItem.longitude!,
              type: selectedItem.type,
              isSelected: true,
            },
          ]
        : [];

    // 지도 중심점: 선택된 아이템이 있으면 해당 위치, 없으면 모든 아이템의 중심
    const mapCenter =
      selectedItem &&
      selectedItem.latitude != null &&
      selectedItem.longitude != null
        ? { lat: selectedItem.latitude, lng: selectedItem.longitude }
        : filteredBillboards.length > 0
        ? {
            lat:
              filteredBillboards.reduce(
                (sum, b) => sum + (b.latitude || 0),
                0
              ) / filteredBillboards.length,
            lng:
              filteredBillboards.reduce(
                (sum, b) => sum + (b.longitude || 0),
                0
              ) / filteredBillboards.length,
          }
        : { lat: 37.5665, lng: 126.978 };

    console.log('🔍 선택된 아이템:', selectedItem);
    console.log('🔍 지도 마커 데이터:', mapMarkers);
    console.log('🔍 지도 중심점:', mapCenter);

    return (
      <div className="flex gap-8" style={{ height: '700px' }}>
        <div
          className="flex-1 overflow-y-auto pr-2"
          style={{ maxWidth: '40%', maxHeight: '700px' }}
        >
          <div className="flex flex-col gap-6">
            {filteredBillboards.map((item, index) => {
              const isSelected = selectedIds.includes(item.id);
              const uniqueKey = item.id || `led-location-${index}`; // fallback key

              console.log('🔍 렌더링 아이템:', {
                id: item.id,
                isSelected,
                selectedIds,
              });

              return (
                <div
                  key={uniqueKey}
                  className={`flex flex-col rounded-lg transition-colors p-2 cursor-pointer ${
                    isSelected ? 'bg-blue-50 border-2 border-blue-300' : ''
                  }`}
                  onClick={() => {
                    console.log('🔍 아이템 클릭:', item.id);
                    console.log('🔍 전체 아이템 데이터:', item);
                    console.log('🔍 선택한 아이템 정보:', {
                      id: item.id,
                      name: item.name,
                      latitude: item.latitude,
                      longitude: item.longitude,
                      district: item.district,
                      address: item.address,
                    });
                    // 지도 뷰에서는 단일 선택만 가능
                    if (isSelected) {
                      // 이미 선택된 아이템을 클릭하면 선택 해제
                      setSelectedIds([]);
                    } else {
                      // 새로운 아이템을 선택하면 이전 선택을 모두 해제하고 새 아이템만 선택
                      setSelectedIds([item.id]);
                    }
                  }}
                >
                  <div className="relative aspect-[1/1] w-full overflow-hidden rounded-lg">
                    <Image
                      src={item.photo_url || '/images/led-display.jpeg'}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex gap-2 mb-2"></div>
                    <h3 className="text-1 font-medium">{item.name}</h3>
                    <p className="text-0.875 text-gray-600">
                      {item.neighborhood}
                    </p>
                    {/* 지도 뷰에서만 장바구니 담기 버튼 표시 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(item.id);
                      }}
                      className="mt-3 w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      장바구니 담기
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="min-w-0" style={{ width: '60%', minWidth: '500px' }}>
          <div className="sticky top-0">
            <div className="w-full h-[700px]">
              <KakaoMap
                markers={mapMarkers}
                selectedIds={selectedIds}
                center={mapCenter}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen flex flex-col bg-white pb-10">
      <div className="lg:min-w-[70rem] lg:max-w-[1500px]  mx-auto px-4 pt-[7rem]">
        <button
          onClick={() => router.push('/led-display')}
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
            {(districtObj || selectedOption || districtData) && (
              <Image
                src={
                  selectedOption?.option === '전체보기' ||
                  districtObj?.name === '전체보기'
                    ? '/svg/all.svg'
                    : districtData?.logo_image_url ||
                      districtObj?.logo ||
                      `/images/district-icon/${district}-gu.png`
                }
                alt={
                  districtData?.name ||
                  selectedOption?.option ||
                  districtObj?.name ||
                  '구 로고'
                }
                width={50}
                height={50}
                className="inline-block align-middle mr-2"
              />
            )}
            <h2 className="text-2.25 font-900 font-gmarket inline-block align-middle">
              {selectedOption?.option === '전체보기' ||
              districtObj?.name === '전체보기'
                ? '전체보기'
                : districtData?.name ||
                  selectedOption?.option ||
                  districtObj?.name ||
                  '도봉구'}
            </h2>
          </div>

          <DistrictInfo
            bankInfo={bankInfo}
            districtName={districtObj?.name}
            flexRow={true}
            isLEDDisplay={true}
            pricePolicies={pricePolicies}
            phoneNumber={districtObj?.phone_number}
          />
        </div>
        {/* 상하반기 탭 - 개별 구 페이지에서만 표시
        {period && !isAllDistrictsView && (
          <HalfPeriodTabs
            selectedPeriod={selectedHalfPeriod}
            onPeriodChange={setSelectedHalfPeriod}
            firstHalfFrom={period.first_half_from}
            firstHalfTo={period.first_half_to}
            secondHalfFrom={period.second_half_from}
            secondHalfTo={period.second_half_to}
            year={2025}
          />
        )} */}
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
              selectedOption={selectedOption}
            />
          </div>
        </div>
        {/* Content Section */}
        <motion.div initial="initial" animate="animate" variants={fadeInUp}>
          {billboards.length === 0 ? (
            // 데이터가 없는 경우 메시지 표시
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-2xl font-bold text-gray-600 mb-4">
                현재 준비 중입니다
              </div>
              <div className="text-gray-500 text-center">
                서비스 준비 중입니다. <br />
                조금만 기다려 주세요.
              </div>
            </div>
          ) : viewType === 'location' ? (
            renderLocationView()
          ) : viewType === 'list' ? (
            <LEDItemList
              items={filteredBillboards}
              showHeader
              showCheckbox
              selectedIds={selectedIds}
              onItemSelect={(id, checked) => handleItemSelect(id, checked)}
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
