import ItemList from '@/src/components/ui/itemlist';
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
import {
  District,
  DropdownOption,
  DisplayBillboard,
  PanelGuideline,
  BannerBillboard,
} from '@/src/types/displaydetail';
import DistrictInfo from './districtInfo';
import HalfPeriodTabs from './ui/HalfPeriodTabs';
import GuidelineSection from './guidelineSection';

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
  defaultView = 'gallery',
  period,
  bankInfo,
  panelTypeFilter,
  setPanelTypeFilter,
}: {
  district: string;
  districtObj: District | undefined;
  billboards: DisplayBillboard[];
  dropdownOptions: DropdownOption[];
  defaultView?: 'location' | 'gallery' | 'list';
  period?: {
    first_half_from: string;
    first_half_to: string;
    second_half_from: string;
    second_half_to: string;
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
  panelTypeFilter?: 'panel' | 'top_fixed';
  setPanelTypeFilter?: React.Dispatch<
    React.SetStateAction<'panel' | 'top_fixed'>
  >;
}) {
  const [selectedOption, setSelectedOption] = useState<{
    id: number;
    option: string;
  } | null>(null);
  const [viewType, setViewType] = useState<'location' | 'gallery' | 'list'>(
    defaultView
  );
  const [mapoFilter, setMapoFilter] = useState<'yeollip' | 'jeodan' | 'simin'>(
    'yeollip'
  );
  const [selectedHalfPeriod, setSelectedHalfPeriod] = useState<
    'first_half' | 'second_half'
  >('first_half');

  // 상반기/하반기 탭별로 선택 상태 분리
  const [selectedIdsFirstHalf, setSelectedIdsFirstHalf] = useState<string[]>(
    []
  );
  const [selectedIdsSecondHalf, setSelectedIdsSecondHalf] = useState<string[]>(
    []
  );

  // 현재 선택된 상하반기에 따른 선택 상태
  const selectedIds =
    selectedHalfPeriod === 'first_half'
      ? selectedIdsFirstHalf
      : selectedIdsSecondHalf;
  const setSelectedIds =
    selectedHalfPeriod === 'first_half'
      ? setSelectedIdsFirstHalf
      : setSelectedIdsSecondHalf;
  const [selectedDistrictPeriod, setSelectedDistrictPeriod] = useState<{
    first_half_from: string;
    first_half_to: string;
    second_half_from: string;
    second_half_to: string;
  } | null>(null);

  // 송파구, 용산구 탭 필터 추가
  const [internalPanelTypeFilter, setInternalPanelTypeFilter] = useState<
    'panel' | 'top_fixed' | 'semi_auto'
  >('panel');

  // 가이드라인 상태 추가
  const [guidelines, setGuidelines] = useState<PanelGuideline[]>([]);

  // props로 받은 panelTypeFilter가 있으면 사용, 없으면 내부 상태 사용
  const currentPanelTypeFilter = panelTypeFilter || internalPanelTypeFilter;
  const currentSetPanelTypeFilter =
    setPanelTypeFilter || setInternalPanelTypeFilter;

  const { dispatch } = useCart();
  const router = useRouter();

  // 가이드라인 가져오기 함수
  const fetchGuidelines = async (districtName: string) => {
    try {
      // 구별로 가이드라인 타입 결정
      let guidelineTypes: string[] = [];

      switch (districtName) {
        case '서대문구':
          guidelineTypes = ['admin', 'commercial'];
          break;
        case '마포구':
          guidelineTypes = ['banner', 'bulletin_board'];
          break;
        case '용산구':
        case '송파구':
          guidelineTypes = ['banner', 'top_fixed'];
          break;
        default:
          guidelineTypes = ['banner'];
          break;
      }

      // 모든 가이드라인 타입을 병렬로 가져오기
      const guidelinePromises = guidelineTypes.map(async (type) => {
        try {
          const response = await fetch(
            `/api/panel-guideline?district=${encodeURIComponent(
              districtName
            )}&guideline_type=${type}`
          );
          const result = await response.json();
          return result.success ? result.data : null;
        } catch (error) {
          console.warn(`${type} 가이드라인 가져오기 실패:`, error);
          return null;
        }
      });

      const guidelineResults = await Promise.all(guidelinePromises);
      const validGuidelines = guidelineResults.filter(
        Boolean
      ) as PanelGuideline[];

      setGuidelines(validGuidelines);
    } catch (error) {
      console.error('가이드라인 가져오기 오류:', error);
      setGuidelines([]);
    }
  };

  const isAllDistrictsView = district === 'all';

  // 가이드라인 가져오기
  useEffect(() => {
    if (districtObj?.name && !isAllDistrictsView) {
      fetchGuidelines(districtObj.name);
    }
  }, [districtObj?.name, isAllDistrictsView]);

  // 상하반기 탭 변경 시 선택 상태 초기화 (선택적)
  // useEffect(() => {
  //   // 상하반기 탭을 변경할 때마다 선택 상태를 초기화하고 싶다면 주석 해제
  //   setSelectedIdsFirstHalf([]);
  //   setSelectedIdsSecondHalf([]);
  // }, [selectedHalfPeriod]);
  // 마포구인지 확인
  const isMapoDistrict = districtObj?.code === 'mapo';
  // 송파구, 용산구, 서대문구인지 확인
  const isSongpaOrYongsan =
    districtObj?.code === 'songpa' ||
    districtObj?.code === 'yongsan' ||
    districtObj?.code === 'seodaemun';

  // 마포구 필터에 따른 데이터 필터링
  const filteredByMapo = isMapoDistrict
    ? billboards.filter((item) => {
        if (mapoFilter === 'yeollip') {
          return item.panel_type === 'multi_panel';
        } else if (mapoFilter === 'jeodan') {
          return item.panel_type === 'lower_panel';
        } else if (mapoFilter === 'simin') {
          return (
            item.panel_type === 'bulletin_board' ||
            item.panel_type === 'citizen_board'
          );
        }
        return true;
      })
    : billboards;

  // 송파구, 용산구, 서대문구 필터에 따른 데이터 필터링 (banner_slot_info의 banner_type 사용)
  const filteredByPanelType = isSongpaOrYongsan
    ? filteredByMapo.filter((item) => {
        // banner_slot_info에서 banner_type 확인
        if (item.type === 'banner' && item.banner_slot_info) {
          if (currentPanelTypeFilter === 'top_fixed') {
            // 상단광고 탭: banner_type이 'top_fixed'인 슬롯이 있는 아이템만
            return item.banner_slot_info.some(
              (slot) => slot.banner_type === 'top_fixed'
            );
          } else if (currentPanelTypeFilter === 'panel') {
            // 현수막게시대 탭: banner_type이 'panel' 또는 'semi_auto'인 슬롯이 있는 아이템 (서대문구 포함)
            return item.banner_slot_info.some(
              (slot) =>
                slot.banner_type === 'panel' || slot.banner_type === 'semi_auto'
            );
          } else if (currentPanelTypeFilter === 'semi_auto') {
            return item.banner_slot_info.some(
              (slot) => slot.banner_type === 'semi_auto'
            );
          }
        }
        return true;
      })
    : filteredByMapo;

  // 서대문구 필터링 디버깅
  if (districtObj?.name === '서대문구') {
    console.log('🔍 서대문구 필터링 과정:', {
      currentPanelTypeFilter,
      filteredByMapoCount: filteredByMapo.length,
      filteredByPanelTypeCount: filteredByPanelType.length,
      filteredItems: filteredByPanelType.map((item) => ({
        panel_code: item.panel_code,
        panel_type: item.panel_type,
        banner_slot_info:
          item.type === 'banner'
            ? item.banner_slot_info?.map((slot) => ({
                banner_type: slot.banner_type,
                slot_number: slot.slot_number,
              }))
            : 'N/A',
      })),
    });
  }

  // 디버깅: 필터링 결과 확인
  if (isSongpaOrYongsan) {
    console.log('🔍 필터링 결과:', {
      district: districtObj?.name,
      panelTypeFilter: currentPanelTypeFilter,
      originalCount: filteredByMapo.length,
      filteredCount: filteredByPanelType.length,
      filteredItems: filteredByPanelType.map((item) => ({
        panel_code: item.panel_code,
        panel_type: item.panel_type,
        banner_type: item.type === 'banner' ? item.banner_type : 'N/A',
        nickname: item.nickname,
      })),
    });

    // 모든 아이템의 banner_slot_info 확인
    console.log(
      '🔍 모든 아이템의 banner_slot_info:',
      filteredByMapo.map((item) => ({
        panel_code: item.panel_code,
        panel_type: item.panel_type,
        banner_slot_info:
          item.type === 'banner'
            ? item.banner_slot_info?.map((slot) => ({
                banner_type: slot.banner_type,
                slot_number: slot.slot_number,
              }))
            : 'N/A',
        nickname: item.nickname,
      }))
    );

    // 서대문구 6-16번 패널 특별 디버깅
    if (districtObj?.name === '서대문구') {
      const panels6to16 = filteredByMapo.filter(
        (item) =>
          item.panel_code && item.panel_code >= 6 && item.panel_code <= 16
      );
      console.log('🔍 서대문구 6-16번 패널들:', {
        totalCount: panels6to16.length,
        panels: panels6to16.map((item) => ({
          panel_code: item.panel_code,
          panel_type: item.panel_type,
          type: item.type,
          banner_slot_info:
            item.type === 'banner' ? item.banner_slot_info : 'N/A',
          nickname: item.nickname,
        })),
      });
    }
  }

  const filteredByDistrict =
    isAllDistrictsView && selectedOption
      ? filteredByPanelType.filter(
          (item) => item.district === selectedOption.option
        )
      : filteredByPanelType;

  // 상하반기에 따른 필터링
  const filteredByHalfPeriod = filteredByDistrict.map((item) => ({
    ...item,
    // 선택된 상하반기에 따른 마감수 표시
    faces:
      selectedHalfPeriod === 'first_half'
        ? item.first_half_closure_quantity || item.faces
        : item.second_half_closure_quantity || item.faces,
  }));

  const filteredBillboards = isAllDistrictsView
    ? [...filteredByHalfPeriod].sort((a, b) =>
        a.district.localeCompare(b.district)
      )
    : filteredByHalfPeriod;

  // 구분 컬럼에 표시할 값 계산 함수 (탭에 따라 다른 로직 적용)
  const getPanelTypeLabel = (item: DisplayBillboard) => {
    // 서대문구 panel_type 디버깅
    if (districtObj?.code === 'seodaemun') {
      console.log('🔍 서대문구 panel_type 디버깅:', {
        itemId: item.id,
        itemName: item.name,
        panelType: item.panel_type,
        itemType: item.type,
        bannerSlotInfo:
          item.type === 'banner' && 'banner_slot_info' in item
            ? (item as BannerBillboard).banner_slot_info?.map((slot) => ({
                banner_type: slot.banner_type,
                slot_number: slot.slot_number,
                max_width: slot.max_width,
                max_height: slot.max_height,
                total_price: slot.total_price,
              }))
            : 'N/A',
      });
    }

    // 송파구, 용산구, 서대문구의 경우 탭에 따라 다른 로직 적용
    if (isSongpaOrYongsan && item.type === 'banner') {
      // 서대문구는 banner_slot_info의 banner_type을 우선적으로 확인
      if (districtObj?.code === 'seodaemun') {
        // banner_slot_info에서 banner_type 확인
        if (item.banner_slot_info && item.banner_slot_info.length > 0) {
          const slot = item.banner_slot_info.find(
            (s) => s.banner_type === 'semi_auto' || s.banner_type === 'panel'
          );
          if (slot) {
            switch (slot.banner_type) {
              case 'semi_auto':
                return '반자동';
              case 'panel':
                return '패널형';
              default:
                return '?';
            }
          }
        }

        // fallback: panel_info의 panel_type 확인
        const panelType = item.panel_type;
        if (!panelType) return '현수막게시대';

        switch (panelType) {
          case 'with_lighting':
            return '조명형';
          case 'no_lighting':
            return '비조명형';
          case 'semi_auto':
            return '반자동';
          case 'panel':
            return '패널형';
          default:
            return '현수막게시대';
        }
      }

      if (currentPanelTypeFilter === 'top_fixed') {
        // 상단광고 탭: banner_type에서 값 가져오기
        if (item.banner_slot_info && item.banner_slot_info.length > 0) {
          const topFixedSlot = item.banner_slot_info.find(
            (slot) => slot.banner_type === 'top_fixed'
          );
          if (topFixedSlot) {
            return '상단광고';
          }
        }
        return '상단광고';
      } else {
        // 현수막게시대 탭: panel_type에서 값 가져오기
        const panelType = item.panel_type;
        if (!panelType) return '현수막게시대';

        switch (panelType) {
          case 'with_lighting':
            return '조명형';
          case 'no_lighting':
            return '비조명형';
          case 'semi_auto':
            return '반자동';
          case 'panel':
            return '패널형';
          default:
            return '현수막게시대';
        }
      }
    }

    // 다른 구들은 기존 panel_type 사용
    const panelType = item.panel_type;
    if (!panelType) return '현수막게시대';

    switch (panelType) {
      case 'multi_panel':
        return '연립형';
      case 'lower_panel':
        return '저단형';
      case 'bulletin_board':
        return '시민게시대';
      case 'citizen_board':
        return '시민/문화게시대';
      case 'with_lighting':
        return '조명형';
      case 'no_lighting':
        return '비조명형';
      case 'semi_auto':
        return '반자동';
      case 'panel':
        return '패널형';
      case 'top_fixed':
        return '상단광고';
      default:
        return '현수막게시대';
    }
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
    setSelectedOption(item);
    if (item.option === '전체보기' && !isAllDistrictsView) {
      router.push('/banner-display/all');
    }

    // 전체보기에서 특정 구를 선택했을 때 해당 구의 상하반기 기간 가져오기
    if (isAllDistrictsView && item.option !== '전체') {
      try {
        const response = await fetch(
          `/api/display-period?district=${encodeURIComponent(
            item.option
          )}&display_type=banner_display`
        );
        const result = await response.json();
        if (result.success) {
          setSelectedDistrictPeriod(result.data);
          console.log('Selected district period:', result.data);
        }
      } catch (err) {
        console.warn(`Failed to fetch period for ${item.option}:`, err);
      }
    } else if (isAllDistrictsView && item.option === '전체') {
      // 전체로 돌아갈 때 상하반기 기간 초기화하고 selectedOption도 null로 설정
      setSelectedDistrictPeriod(null);
      setSelectedOption(null);
    }
  };

  const handleItemSelect = (id: string, checked?: boolean) => {
    console.log('🔍 handleItemSelect called with id:', id, 'checked:', checked);

    // 지도 뷰에서는 선택만 하고 장바구니에는 추가하지 않음
    if (viewType === 'location') {
      console.log('🔍 Location view - only selection, no cart addition');
      const alreadySelected = selectedIds.includes(id);
      const shouldSelect = checked !== undefined ? checked : !alreadySelected;

      if (!shouldSelect) {
        const newSelectedIds = selectedIds.filter((sid) => sid !== id);
        setSelectedIds(newSelectedIds);
      } else {
        const newSelectedIds = [...selectedIds, id];
        setSelectedIds(newSelectedIds);
      }
      return;
    }

    // 갤러리와 목록 뷰에서는 기존 로직 유지 (선택 시 장바구니에 추가)
    const alreadySelected = selectedIds.includes(id);
    let newSelectedIds;

    // checked 파라미터가 있으면 그 값을 사용, 없으면 기존 로직 사용
    const shouldSelect = checked !== undefined ? checked : !alreadySelected;

    if (!shouldSelect) {
      newSelectedIds = selectedIds.filter((sid) => sid !== id);
      // 상반기/하반기 정보를 포함한 ID로 장바구니에서 제거
      const uniqueCartItemId = `${id}-${selectedHalfPeriod}`;
      dispatch({ type: 'REMOVE_ITEM', id: uniqueCartItemId });
      console.log('🔍 Removed item from cart:', uniqueCartItemId);
    } else {
      newSelectedIds = [...selectedIds, id];
      // billboards에서 아이템 찾기
      const item = billboards.find((item) => item.id === id);
      console.log('🔍 Item found in billboards:', item ? 'YES' : 'NO');
      if (item) {
        // 리스트에 표시된 가격 그대로 사용
        const priceForCart = item.total_price || 0;
        let panelSlotSnapshot = null;

        console.log('🔍 Item selected:', {
          district: item.district,
          itemId: item.id,
          itemName: item.name,
          itemTotalPrice: item.total_price,
          itemPrice: item.price,
        });

        // banner_slot_info에서 가격 정보 가져오기 (snapshot용) - BannerBillboard 타입인 경우만
        if (
          item.type === 'banner' &&
          'banner_slot_info' in item &&
          item.banner_slot_info &&
          item.banner_slot_info.length > 0
        ) {
          console.log('🔍 Creating panel_slot_snapshot for item:', {
            itemId: item.id,
            itemName: item.name,
            bannerSlotInfo: item.banner_slot_info.map((slot) => ({
              banner_type: slot.banner_type,
              slot_number: slot.slot_number,
              total_price: slot.total_price,
              hasPricePolicy: !!slot.banner_slot_price_policy?.length,
              pricePolicies: slot.banner_slot_price_policy?.map((p) => ({
                price_usage_type: p.price_usage_type,
                total_price: p.total_price,
                advertising_fee: p.advertising_fee,
                tax_price: p.tax_price,
                road_usage_fee: p.road_usage_fee,
              })),
            })),
          });

          // 현수막게시대 슬롯 찾기 (상단광고가 아닌 모든 슬롯)
          // 'top_fixed'가 아닌 슬롯을 우선적으로 찾기
          let slotInfo = item.banner_slot_info.find(
            (slot) => slot.banner_type !== 'top_fixed' && slot.slot_number > 0
          );

          console.log('🔍 Looking for banner slot (non-top_fixed):', {
            foundBannerSlot: !!slotInfo,
            allSlots: item.banner_slot_info.map((slot) => ({
              banner_type: slot.banner_type,
              slot_number: slot.slot_number,
              hasPricePolicy: !!slot.banner_slot_price_policy?.length,
            })),
          });

          if (!slotInfo) {
            // 현수막게시대 슬롯이 없으면 첫 번째 슬롯 사용
            slotInfo = item.banner_slot_info[0];
            console.log('🔍 No banner slot found, using first slot');
          } else {
            console.log('🔍 Found banner slot, using it');
          }

          console.log('🔍 Selected slot for snapshot:', {
            banner_type: slotInfo.banner_type,
            slot_number: slotInfo.slot_number,
            total_price: slotInfo.total_price,
            pricePolicies: slotInfo.banner_slot_price_policy?.map((p) => ({
              price_usage_type: p.price_usage_type,
              total_price: p.total_price,
              advertising_fee: p.advertising_fee,
              tax_price: p.tax_price,
              road_usage_fee: p.road_usage_fee,
            })),
          });

          if (
            slotInfo.banner_slot_price_policy &&
            slotInfo.banner_slot_price_policy.length > 0
          ) {
            // 기본적으로 'default' 타입 사용
            const defaultPolicy = slotInfo.banner_slot_price_policy.find(
              (p: { price_usage_type: string }) =>
                p.price_usage_type === 'default'
            );
            if (defaultPolicy) {
              panelSlotSnapshot = {
                id: slotInfo.id,
                notes: slotInfo.notes,
                max_width: slotInfo.max_width,
                slot_name: slotInfo.slot_name,
                tax_price: defaultPolicy.tax_price,
                created_at: slotInfo.created_at,

                max_height: slotInfo.max_height,
                price_unit: slotInfo.price_unit || null,
                updated_at: slotInfo.updated_at,
                banner_type: slotInfo.banner_type,
                slot_number: slotInfo.slot_number,
                total_price: defaultPolicy.total_price,
                panel_info_id: slotInfo.panel_info_id,
                road_usage_fee: defaultPolicy.road_usage_fee,
                advertising_fee: defaultPolicy.advertising_fee,
                panel_slot_status: slotInfo.panel_slot_status,
              } as {
                id: string | null;
                notes: string | null;
                max_width: number | null;
                slot_name: string | null;
                tax_price: number | null;
                created_at: string | null;
                is_premium: boolean | null;
                max_height: number | null;
                price_unit: string | null;
                updated_at: string | null;
                banner_type: string | null;
                slot_number: number | null;
                total_price: number | null;
                panel_info_id: string | null;
                road_usage_fee: number | null;
                advertising_fee: number | null;
                panel_slot_status: string | null;
              };
              console.log(
                '🔍 Created panel_slot_snapshot with default policy:',
                panelSlotSnapshot
              );
            } else {
              // default가 없으면 첫 번째 정책 사용
              const firstPolicy = slotInfo.banner_slot_price_policy[0];
              panelSlotSnapshot = {
                id: slotInfo.id,
                notes: slotInfo.notes,
                max_width: slotInfo.max_width,
                slot_name: slotInfo.slot_name,
                tax_price: firstPolicy.tax_price,
                created_at: slotInfo.created_at,

                max_height: slotInfo.max_height,
                price_unit: slotInfo.price_unit || null,
                updated_at: slotInfo.updated_at,
                banner_type: slotInfo.banner_type,
                slot_number: slotInfo.slot_number,
                total_price: firstPolicy.total_price,
                panel_info_id: slotInfo.panel_info_id,
                road_usage_fee: firstPolicy.road_usage_fee,
                advertising_fee: firstPolicy.advertising_fee,
                panel_slot_status: slotInfo.panel_slot_status,
              } as {
                id: string | null;
                notes: string | null;
                max_width: number | null;
                slot_name: string | null;
                tax_price: number | null;
                created_at: string | null;
                is_premium: boolean | null;
                max_height: number | null;
                price_unit: string | null;
                updated_at: string | null;
                banner_type: string | null;
                slot_number: number | null;
                total_price: number | null;
                panel_info_id: string | null;
                road_usage_fee: number | null;
                advertising_fee: number | null;
                panel_slot_status: string | null;
              };
              console.log(
                '🔍 Created panel_slot_snapshot with first policy:',
                panelSlotSnapshot
              );
            }
          } else {
            // 기존 로직 (banner_slot_info의 total_price 사용)
            panelSlotSnapshot = {
              id: slotInfo.id,
              notes: slotInfo.notes,
              max_width: slotInfo.max_width,
              slot_name: slotInfo.slot_name,
              tax_price: slotInfo.tax_price || 0,
              created_at: slotInfo.created_at,

              max_height: slotInfo.max_height,
              price_unit: slotInfo.price_unit || null,
              updated_at: slotInfo.updated_at,
              banner_type: slotInfo.banner_type,
              slot_number: slotInfo.slot_number,
              total_price: slotInfo.total_price || 0,
              panel_info_id: slotInfo.panel_info_id,
              road_usage_fee: slotInfo.road_usage_fee || 0,
              advertising_fee: slotInfo.advertising_fee || 0,
              panel_slot_status: slotInfo.panel_slot_status,
            } as {
              id: string | null;
              notes: string | null;
              max_width: number | null;
              slot_name: string | null;
              tax_price: number | null;
              created_at: string | null;
              is_premium: boolean | null;
              max_height: number | null;
              price_unit: string | null;
              updated_at: string | null;
              banner_type: string | null;
              slot_number: number | null;
              total_price: number | null;
              panel_info_id: string | null;
              road_usage_fee: number | null;
              advertising_fee: number | null;
              panel_slot_status: string | null;
            };
            console.log(
              '🔍 Created panel_slot_snapshot with slot info:',
              panelSlotSnapshot
            );
          }
        } else {
          console.log('🔍 No banner_slot_info found for item:', {
            itemId: item.id,
            itemType: item.type,
            hasBannerSlotInfo: 'banner_slot_info' in item,
            bannerSlotInfoLength:
              'banner_slot_info' in item
                ? item.banner_slot_info?.length
                : 'N/A',
          });
        }

        // 상반기/하반기 정보를 포함한 고유한 ID 생성
        const uniqueCartItemId = `${item.id}-${selectedHalfPeriod}`;

        const cartItem = {
          id: uniqueCartItemId, // 상반기/하반기 정보를 포함한 고유 ID
          type: 'banner-display' as const,
          name: getCartItemName(item),
          district: item.district,
          price: priceForCart,
          halfPeriod: selectedHalfPeriod,
          // 기본 기간 설정: 다음달
          selectedYear: new Date().getFullYear(),
          selectedMonth: new Date().getMonth() + 2, // 다음달
          panel_type: item.panel_type,
          panel_info_id: item.panel_info_id, // 원본 UUID
          isTopFixed: item.panel_type === 'top_fixed', // 상단광고 여부 (하이픈으로 수정)
          ...(panelSlotSnapshot && { panel_slot_snapshot: panelSlotSnapshot }), // 가격 상세 정보 추가
          panel_code: item.panel_code?.toString(),
        };

        console.log('🔍 Final cart item with snapshot:', {
          itemId: cartItem.id,
          itemName: cartItem.name,
          price: cartItem.price,
          hasSnapshot: !!cartItem.panel_slot_snapshot,
          snapshot: cartItem.panel_slot_snapshot,
        });

        console.log('🔍 Adding item to cart:', cartItem);
        console.log('🔍 상하반기 정보:', {
          halfPeriod: cartItem.halfPeriod,
          selectedYear: cartItem.selectedYear,
          selectedMonth: cartItem.selectedMonth,
          displayPeriod: `${cartItem.selectedYear}년 ${
            cartItem.selectedMonth
          }월 ${cartItem.halfPeriod === 'first_half' ? '상반기' : '하반기'}`,
        });
        dispatch({
          type: 'ADD_ITEM',
          item: cartItem,
        });
      } else {
        console.error('🔍 Item not found in billboards:', id);
      }
    }
    setSelectedIds(newSelectedIds);
  };

  const renderGalleryView = () => (
    <div className="grid grid-cols-3 sm:grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-6 ">
      {filteredBillboards.map((item, index) => {
        return (
          <div
            key={index}
            className={`flex flex-col cursor-pointer `}
            onClick={() => handleItemSelect(item.id)}
          >
            <div className="relative aspect-[1/1] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/banner-display/landing.png"
                alt={item.name}
                fill
                className={`md:object-cover sm:object-cover `}
              />
            </div>
            <div className="mt-4">
              <div className="flex gap-2 mb-2">
                <span className="px-2 py-1 bg-black text-white text-0.875 rounded-[5rem]">
                  {getPanelTypeLabel(item)}
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

  const renderLocationView = () => {
    // 지도 뷰에서는 단일 선택만 가능하므로 첫 번째 선택된 아이템만 사용
    const selectedItem =
      selectedIds.length > 0
        ? filteredBillboards.find((b) => b.id === selectedIds[0])
        : null;

    // 선택된 아이템만 지도에 표시 (단일 선택)
    const mapMarkers =
      selectedItem && selectedItem.lat != null && selectedItem.lng != null
        ? [
            {
              id: selectedItem.id,
              title: selectedItem.name,
              lat: selectedItem.lat!,
              lng: selectedItem.lng!,
              type: selectedItem.type,
              isSelected: true,
            },
          ]
        : [];

    // 지도 중심점: 선택된 아이템이 있으면 해당 위치, 없으면 모든 아이템의 중심
    const mapCenter =
      selectedItem && selectedItem.lat != null && selectedItem.lng != null
        ? { lat: selectedItem.lat, lng: selectedItem.lng }
        : filteredBillboards.length > 0
        ? {
            lat:
              filteredBillboards.reduce((sum, b) => sum + (b.lat || 0), 0) /
              filteredBillboards.length,
            lng:
              filteredBillboards.reduce((sum, b) => sum + (b.lng || 0), 0) /
              filteredBillboards.length,
          }
        : { lat: 37.5665, lng: 126.978 };

    // 디버깅 로그 주석 처리
    // console.log('🔍 선택된 아이템:', selectedItem);
    // console.log('🔍 지도 마커 데이터:', mapMarkers);
    // console.log('🔍 지도 중심점:', mapCenter);

    return (
      <div className="flex gap-8" style={{ height: '700px' }}>
        <div
          className="flex-1 overflow-y-auto pr-2"
          style={{ maxWidth: '40%', maxHeight: '700px' }}
        >
          <div className="flex flex-col gap-6">
            {filteredBillboards.map((item, index) => {
              const isSelected = selectedIds.includes(item.id);
              const uniqueKey = item.id || `banner-location-${index}`; // fallback key

              // 디버깅 로그 주석 처리
              // console.log('🔍 렌더링 아이템:', {
              //   id: item.id,
              //   isSelected,
              //   selectedIds,
              // });

              return (
                <div
                  key={uniqueKey}
                  className={`flex flex-col rounded-lg transition-colors p-2 cursor-pointer ${
                    isSelected ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    // 디버깅 로그 주석 처리
                    // console.log('🔍 아이템 클릭:', item.id);
                    // console.log('🔍 전체 아이템 데이터:', item);
                    // console.log('🔍 선택한 아이템 정보:', {
                    //   id: item.id,
                    //   name: item.name,
                    //   latitude: item.lat,
                    //   longitude: item.lng,
                    //   district: item.district,
                    //   address: item.address,
                    // });
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
                      src="/images/banner-display/landing.png"
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex gap-2 mb-2">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-0.875 rounded">
                        {getPanelTypeLabel(item)}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-0.875 rounded">
                        {item.district}
                      </span>
                    </div>
                    <h3 className="text-1 font-medium">{item.name}</h3>
                    <p className="text-0.875 text-gray-600">
                      {item.neighborhood}
                    </p>
                    {/* 지도 뷰에서만 장바구니 담기 버튼 표시 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleItemSelect(item.id, true);
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
                src={districtObj.logo}
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
          {/* {selectedOption && <div>{selectedOption.option}</div>} */}

          <DistrictInfo period={period} bankInfo={bankInfo} flexRow={true} />
        </div>
        {/* 마포구 전용 filter */}
        {isMapoDistrict && (
          <div className="mb-8">
            <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
              <button
                onClick={() => setMapoFilter('yeollip')}
                className={`lg:text-1 md:text-0.75 transition-colors duration-100 py-2 px-6 font-medium ${
                  mapoFilter === 'yeollip'
                    ? 'text-white bg-black rounded-full '
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                연립형
              </button>
              <button
                onClick={() => setMapoFilter('jeodan')}
                className={`lg:text-1 md:text-0.75 transition-colors duration-100 py-2 px-6 font-medium ${
                  mapoFilter === 'jeodan'
                    ? 'text-white bg-black rounded-full '
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                저단형
              </button>
              <button
                onClick={() => setMapoFilter('simin')}
                className={`lg:text-1 md:text-0.75 transition-colors duration-100 py-2 px-6 font-medium ${
                  mapoFilter === 'simin'
                    ? 'text-white bg-black rounded-full '
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                시민게시대
              </button>
            </div>
          </div>
        )}
        {mapoFilter === 'simin' && (
          <div className="mb-8">
            <div className="flex items-center gap-4  pb-4 text-blue-700 text-1 line-height-[1.5rem]">
              시민 게시대는 게첨일기준 매월1일에 포스터 직접 가지고 사무실로
              직접내방하여 신청해주세요. <br /> 아래 가이드라인을 참고해주세요
            </div>
          </div>
        )}

        {/* 송파구, 용산구 전용 filter */}
        {isSongpaOrYongsan && (
          <div className="mb-8">
            <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
              <button
                onClick={() => currentSetPanelTypeFilter('panel')}
                className={`lg:text-1 md:text-0.75 transition-colors duration-100 py-2 px-6 font-medium ${
                  currentPanelTypeFilter === 'panel'
                    ? 'text-white bg-black rounded-full '
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                현수막게시대
              </button>
              <button
                onClick={() => currentSetPanelTypeFilter('top_fixed')}
                className={`lg:text-1 md:text-0.75 transition-colors duration-100 py-2 px-6 font-medium ${
                  currentPanelTypeFilter === 'top_fixed'
                    ? 'text-white bg-black rounded-full '
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                상단광고
              </button>
            </div>
          </div>
        )}
        {/* 상하반기 탭 - 개별 구 페이지에서만 표시하거나, 전체보기에서 특정 구를 선택했을 때만 표시 */}
        {/* 상단광고 탭에서는 상하반기 탭 숨김 */}
        {((period && !isAllDistrictsView) ||
          (isAllDistrictsView &&
            selectedOption &&
            selectedOption.option !== '전체' &&
            selectedDistrictPeriod)) &&
          !(isSongpaOrYongsan && currentPanelTypeFilter === 'top_fixed') && (
            <HalfPeriodTabs
              selectedPeriod={selectedHalfPeriod}
              onPeriodChange={setSelectedHalfPeriod}
              firstHalfFrom={
                selectedDistrictPeriod?.first_half_from ||
                period?.first_half_from ||
                ''
              }
              firstHalfTo={
                selectedDistrictPeriod?.first_half_to ||
                period?.first_half_to ||
                ''
              }
              secondHalfFrom={
                selectedDistrictPeriod?.second_half_from ||
                period?.second_half_from ||
                ''
              }
              secondHalfTo={
                selectedDistrictPeriod?.second_half_to ||
                period?.second_half_to ||
                ''
              }
              year={2025}
            />
          )}
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
          {billboards.length === 0 ? (
            // 준비 중인 경우 메시지 표시
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
            <>
              <ItemList
                items={filteredBillboards}
                showHeader
                showCheckbox={
                  !isAllDistrictsView ||
                  !!(selectedOption && selectedOption.option !== '전체')
                }
                selectedIds={selectedIds}
                onItemSelect={(id, checked) => handleItemSelect(id, checked)}
                enableRowClick={false}
                hideQuantityColumns={
                  isSongpaOrYongsan && currentPanelTypeFilter === 'top_fixed'
                }
              />

              {/* 가이드라인 섹션 */}
              <GuidelineSection
                guidelines={guidelines}
                districtName={districtObj?.name || ''}
                isAllDistrictsView={isAllDistrictsView}
              />
            </>
          ) : (
            renderGalleryView()
          )}
        </motion.div>
      </div>
    </main>
  );
}
