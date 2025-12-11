import ItemList from '@/src/components/ui/itemlist';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import KakaoMap, { MapPolygon } from '@/src/components/kakaoMap';
import DropdownMenu from '@/src/components/dropdown';
import ViewTypeButton from '@/src/components/viewTypeButton';
import GuidelineButton from '@/src/components/GuidelineButton';
import MapPinIcon from '@/src/icons/map-pin.svg';
import GalleryIcon from '@/src/icons/gallery.svg';
import ListIcon from '@/src/icons/list.svg';
import DocumentIcon from '@/public/svg/document.svg';
import {
  getPolygonColor,
  DEFAULT_POLYGON_PADDING,
} from '@/src/utils/polygonColors';
import { calculateConvexHull } from '@/src/utils/convexHull';

import { useState, useEffect } from 'react';
import { useCart } from '../contexts/cartContext';
import { useProfile } from '../contexts/profileContext';
import { useAuth } from '../contexts/authContext';
import {
  District,
  DropdownOption,
  DisplayBillboard,
} from '@/src/types/displaydetail';
import DistrictInfo from './districtInfo';
import HalfPeriodTabs from './ui/HalfPeriodTabs';
import BackToListButton from './BackToListButton';
import LoginPromptModal from './modal/LoginPromptModal';

const fadeInUp = {
  initial: { y: 60, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6 },
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
  districtData,
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
  panelTypeFilter?: 'panel' | 'top_fixed' | 'semi_auto';
  setPanelTypeFilter?: React.Dispatch<
    React.SetStateAction<'panel' | 'top_fixed' | 'semi_auto'>
  >;
  districtData?: {
    id: string;
    name: string;
    code: string;
    logo_image_url?: string;
    panel_status?: string;
    phone_number?: string;
  } | null;
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
  // 초기 기간 계산 함수 (HalfPeriodTabs와 동일한 로직)
  const getInitialPeriod = (districtName?: string) => {
    // 한국 시간대(KST, UTC+9) 기준으로 현재 시간 가져오기
    const now = new Date();
    // Intl API를 사용하여 한국 시간대의 시간 정보 가져오기
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const currentYear = parseInt(
      parts.find((p) => p.type === 'year')?.value || '0'
    );
    const currentMonth = parseInt(
      parts.find((p) => p.type === 'month')?.value || '0'
    );
    const currentDay = parseInt(
      parts.find((p) => p.type === 'day')?.value || '0'
    );
    const currentHour = parseInt(
      parts.find((p) => p.type === 'hour')?.value || '0'
    );
    const currentMinute = parseInt(
      parts.find((p) => p.type === 'minute')?.value || '0'
    );

    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

    // 마포구, 강북구: 특별한 기간
    if (districtName === '마포구' || districtName === '강북구') {
      // 5일 9시 이전인지 확인 (5일 9시 0분 0초까지는 9시 이전으로 간주)
      const isBefore9AMOn5th =
        currentDay === 5 &&
        (currentHour < 9 || (currentHour === 9 && currentMinute === 0));

      if (currentDay >= 1 && currentDay <= 4) {
        // 1일~4일: 현재 달 상반기 + 현재 달 하반기
        return {
          period: 'first_half' as const,
          year: currentYear,
          month: currentMonth,
        };
      } else if (currentDay === 5 && isBefore9AMOn5th) {
        // 5일 9시 이전: 현재 달 상반기(비활성화) + 현재 달 하반기(활성화)
        return {
          period: 'first_half' as const,
          year: currentYear,
          month: currentMonth,
        };
      } else if (currentDay >= 5 && currentDay <= 19) {
        // 5일 9시 이후 ~ 19일: 현재 달 하반기 + 다음 달 상반기
        return {
          period: 'second_half' as const,
          year: currentYear,
          month: currentMonth,
        };
      } else {
        // 20일~31일: 다음 달 상하반기
        return {
          period: 'first_half' as const,
          year: nextYear,
          month: nextMonth,
        };
      }
    } else {
      // 일반 구: 1일-15일 상반기, 16일-31일 하반기
      // 9시 0분 이전인지 확인 (9시 0분 0초까지는 9시 이전으로 간주)
      const isBefore9AM =
        currentDay === 1 &&
        (currentHour < 9 || (currentHour === 9 && currentMinute === 0));

      if (currentDay === 1 && isBefore9AM) {
        // 1일 9시 이전: 현재 달 상반기 + 현재 달 하반기
        return {
          period: 'first_half' as const,
          year: currentYear,
          month: currentMonth,
        };
      } else if (currentDay >= 1 && currentDay <= 15) {
        // 1일 9시 이후 ~ 15일: 현재 달 하반기 + 다음 달 상반기
        return {
          period: 'second_half' as const,
          year: currentYear,
          month: currentMonth,
        };
      } else {
        // 16일~31일: 다음 달 상하반기
        return {
          period: 'first_half' as const,
          year: nextYear,
          month: nextMonth,
        };
      }
    }
  };

  const initialPeriod = getInitialPeriod(districtObj?.name);
  const [selectedHalfPeriod, setSelectedHalfPeriod] = useState<
    'first_half' | 'second_half'
  >(initialPeriod.period);
  const [aiDownloadLoading, setAiDownloadLoading] = useState(false);

  // 선택된 기간의 년월 정보 - 초기 기간 계산 결과 사용
  const [selectedPeriodYear, setSelectedPeriodYear] = useState<number>(
    initialPeriod.year
  );
  const [selectedPeriodMonth, setSelectedPeriodMonth] = useState<number>(
    initialPeriod.month
  );

  // districtObj가 변경될 때 초기 기간 재계산
  useEffect(() => {
    if (districtObj?.name) {
      const newInitialPeriod = getInitialPeriod(districtObj.name);
      setSelectedHalfPeriod(newInitialPeriod.period);
      setSelectedPeriodYear(newInitialPeriod.year);
      setSelectedPeriodMonth(newInitialPeriod.month);
    }
  }, [districtObj?.name]);

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
  const [showAllPins, setShowAllPins] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // period prop이 변경될 때 selectedDistrictPeriod 업데이트
  useEffect(() => {
    if (period) {
      setSelectedDistrictPeriod(period);
      console.log('🔍 Period prop updated selectedDistrictPeriod:', period);
    }
  }, [period]);

  // 송파구, 용산구 탭 필터 추가
  const [internalPanelTypeFilter, setInternalPanelTypeFilter] = useState<
    'panel' | 'top_fixed' | 'semi_auto'
  >('panel');

  // 가이드라인 상태 추가
  //const [guidelines, setGuidelines] = useState<PanelGuideline[]>([]);

  // props로 받은 panelTypeFilter가 있으면 사용, 없으면 내부 상태 사용
  const currentPanelTypeFilter = panelTypeFilter || internalPanelTypeFilter;
  const currentSetPanelTypeFilter =
    setPanelTypeFilter || setInternalPanelTypeFilter;

  console.log('🔍 탭 상태 확인:', {
    panelTypeFilter,
    internalPanelTypeFilter,
    currentPanelTypeFilter,
    hasSetPanelTypeFilter: !!setPanelTypeFilter,
    hasSetInternalPanelTypeFilter: !!setInternalPanelTypeFilter,
  });

  const { dispatch } = useCart();
  const { profiles, setProfiles } = useProfile();
  const { user } = useAuth();
  const router = useRouter();

  // 가이드라인 가져오기 함수
  // const fetchGuidelines = async (districtName: string) => {
  //   try {
  //     // 구별로 가이드라인 타입 결정
  //     let guidelineTypes: string[] = [];

  //     switch (districtName) {
  //       case '서대문구':
  //         guidelineTypes = ['admin', 'commercial'];
  //         break;
  //       case '마포구':
  //         guidelineTypes = ['banner', 'bulletin_board'];
  //         break;
  //       case '용산구':
  //         guidelineTypes = ['banner'];
  //         break;
  //       case '송파구':
  //         guidelineTypes = ['banner', 'top_fixed'];
  //         break;
  //       default:
  //         guidelineTypes = ['banner'];
  //         break;
  //     }

  //     // 모든 가이드라인 타입을 병렬로 가져오기
  //     // const guidelinePromises = guidelineTypes.map(async (type) => {
  //     //   try {
  //     //     const response = await fetch(
  //     //       `/api/panel-guideline?district=${encodeURIComponent(
  //     //         districtName
  //     //       )}&guideline_type=${type}`
  //     //     );
  //     //     const result = await response.json();
  //     //     return result.success ? result.data : null;
  //     //   } catch (error) {
  //     //     console.warn(`${type} 가이드라인 가져오기 실패:`, error);
  //     //     return null;
  //     //   }
  //     // });

  //     // const guidelineResults = await Promise.all(guidelinePromises);
  //     // const validGuidelines = guidelineResults.filter(
  //     //   Boolean
  //     // ) as PanelGuideline[];

  //     // setGuidelines(validGuidelines);
  //   } catch (error) {
  //     console.error('가이드라인 가져오기 오류:', error);
  //     setGuidelines([]);
  //   }
  // };

  const isAllDistrictsView = district === 'all';

  // 구 이름을 코드로 변환하는 함수
  const getDistrictCode = (districtName: string): string => {
    const districtMap: Record<string, string> = {
      강동구: 'gangdong',
      관악구: 'gwanak',
      마포구: 'mapo',
      서대문구: 'seodaemun',
      송파구: 'songpa',
      용산구: 'yongsan',
      강북구: 'gangbuk',
      광진구: 'gwangjin',
      동작구: 'dongjak',
      동대문구: 'dongdaemun',
    };
    return districtMap[districtName] || districtName.replace('구', '');
  };

  // // 가이드라인 가져오기
  // useEffect(() => {
  //   if (districtObj?.name && !isAllDistrictsView) {
  //     fetchGuidelines(districtObj.name);
  //   }
  // }, [districtObj?.name, isAllDistrictsView]);

  // 상하반기 탭 변경 시 선택 상태 초기화 (선택적)
  // useEffect(() => {
  //   // 상하반기 탭을 변경할 때마다 선택 상태를 초기화하고 싶다면 주석 해제
  //   setSelectedIdsFirstHalf([]);
  //   setSelectedIdsSecondHalf([]);
  // }, [selectedHalfPeriod]);

  // district가 변경될 때 panelTypeFilter를 'panel'로 리셋 (단, 송파구/용산구는 제외)
  useEffect(() => {
    if (
      currentSetPanelTypeFilter &&
      districtObj?.code !== 'songpa' &&
      districtObj?.code !== 'yongsan'
    ) {
      currentSetPanelTypeFilter('panel');
    }
  }, [district, currentSetPanelTypeFilter, districtObj?.code]);

  // 기간 시작일 2일 전까지 신청 가능 여부 확인
  const isPeriodAvailable = (periodStartDate: string) => {
    // 기간 시작일 설정 (한국 시간대 기준)
    // periodStartDate는 "YYYY-MM-DD" 형식
    const [startYear, startMonth, startDay] = periodStartDate
      .split('-')
      .map(Number);
    const periodStartDateOnly = new Date(
      Date.UTC(startYear, startMonth - 1, startDay)
    );

    // 현재 시간을 한국시간으로 변환
    const now = new Date();
    // Intl API를 사용하여 한국 시간대의 날짜 정보 가져오기
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    const parts = formatter.formatToParts(now);
    const koreaYear = parseInt(
      parts.find((p) => p.type === 'year')?.value || '0'
    );
    const koreaMonth = parseInt(
      parts.find((p) => p.type === 'month')?.value || '0'
    );
    const koreaDay = parseInt(
      parts.find((p) => p.type === 'day')?.value || '0'
    );
    // UTC 기준으로 한국 날짜 생성 (시간대 차이 무시하고 날짜만 비교)
    const koreaDate = new Date(Date.UTC(koreaYear, koreaMonth - 1, koreaDay));

    // 날짜 차이 계산 (일 단위)
    const daysUntilPeriod = Math.ceil(
      (periodStartDateOnly.getTime() - koreaDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // 기간 시작일 2일 전까지 신청 가능 (daysUntilPeriod > 2)
    // 기간 시작일 2일 전부터는 신청 불가 (daysUntilPeriod <= 2)
    const isAvailable = daysUntilPeriod > 2;

    // 디버그 로그 추가
    console.log('🔍 displayDetailPage isPeriodAvailable Debug:', {
      periodStartDate,
      koreaYear,
      koreaMonth,
      koreaDay,
      currentKoreaDate: koreaDate.toISOString(),
      periodStartDateOnly: periodStartDateOnly.toISOString(),
      daysUntilPeriod,
      isAvailable,
      parts: parts.map((p) => `${p.type}:${p.value}`),
    });

    return isAvailable;
  };

  // 아이템이 선택 가능한지 확인하는 함수
  const getAvailableFacesForSelectedHalf = (item: DisplayBillboard) => {
    if (item.inventory_info) {
      if (
        selectedHalfPeriod === 'first_half' &&
        item.inventory_info.first_half
      ) {
        return item.inventory_info.first_half.available_slots;
      }
      if (
        selectedHalfPeriod === 'second_half' &&
        item.inventory_info.second_half
      ) {
        return item.inventory_info.second_half.available_slots;
      }
      if (item.inventory_info.current_period) {
        return item.inventory_info.current_period.available_slots;
      }
    }

    if (typeof item.available_faces === 'number') {
      return item.available_faces;
    }

    if (typeof item.faces === 'number') {
      const closedCount =
        selectedHalfPeriod === 'first_half'
          ? item.first_half_closure_quantity || 0
          : item.second_half_closure_quantity || 0;
      return Math.max(item.faces - closedCount, 0);
    }

    return null;
  };

  const isStockDepleted = (item: DisplayBillboard) => {
    const availableFaces = getAvailableFacesForSelectedHalf(item);
    return typeof availableFaces === 'number' && availableFaces <= 0;
  };

  const isItemSelectable = (item: DisplayBillboard) => {
    // 0. 마감된 게시대인지 확인
    if (item.is_closed) {
      return false;
    }

    // 1. 기한 확인: 현재 선택된 기간이 신청 가능한지 확인 (프론트에서 계산한 날짜 사용)
    const currentPeriodStartDate = getSelectedPeriodStartDate();
    const isPeriodValid = currentPeriodStartDate
      ? isPeriodAvailable(currentPeriodStartDate)
      : true;

    // 2. 재고 확인: 선택된 기간의 재고가 0인지 확인
    const hasStock = !isStockDepleted(item);

    return isPeriodValid && hasStock;
  };

  // 마포구인지 확인
  const isMapoDistrict = districtObj?.code === 'mapo';
  // 송파구, 용산구인지 확인 (서대문구 제외)
  const isSongpaOrYongsan =
    districtObj?.code === 'songpa' || districtObj?.code === 'yongsan';

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
            item.panel_type === 'cultural_board'
          );
        }
        return true;
      })
    : billboards;

  // 송파구, 용산구 필터에 따른 데이터 필터링 (banner_slots의 banner_type 사용)
  const filteredByPanelType = isSongpaOrYongsan
    ? filteredByMapo.filter((item) => {
        // banner_slots에서 slot_number 확인
        if (item.type === 'banner' && item.banner_slots) {
          if (currentPanelTypeFilter === 'top_fixed') {
            // 상단광고 탭: slot_number가 0이고 price_unit이 '1 year'인 슬롯이 있는 아이템
            const hasTopFixedSlot = item.banner_slots.some(
              (slot) => slot.slot_number === 0 && slot.price_unit === '1 year'
            );
            if (hasTopFixedSlot) {
              console.log(`🔍 상단광고 아이템: ${item.name}`, {
                panelCode: item.panel_code,
                slots: item.banner_slots.map((slot) => ({
                  slot_number: slot.slot_number,
                  banner_type: slot.banner_type,
                  price_unit: slot.price_unit,
                })),
              });
            }
            return hasTopFixedSlot;
          } else if (currentPanelTypeFilter === 'panel') {
            // 현수막게시대 탭: slot_number가 0보다 큰 슬롯이 있는 아이템
            return item.banner_slots.some((slot) => slot.slot_number > 0);
          } else if (currentPanelTypeFilter === 'semi_auto') {
            // 반자동 탭: banner_type이 'semi_auto'인 슬롯이 있는 아이템 (용산구만)
            return item.banner_slots.some(
              (slot) => slot.banner_type === 'semi_auto'
            );
          }
        }
        return true;
      })
    : filteredByMapo;

  if (currentPanelTypeFilter === 'top_fixed') {
    console.log(`🔍 ${district} 상단광고 탭 결과:`, {
      총_아이템_개수: filteredByPanelType.length,
      상단광고_아이템들: filteredByPanelType.map((item) => ({
        name: item.name,
        panelCode: item.panel_code,
        banner_type: item.banner_type,
        price: item.price,
      })),
    });
    console.log(`🔍 ${district} 상단광고 필터링 전 원본 데이터:`, {
      원본_개수: billboards.length,
      원본_데이터: billboards.map((item) => ({
        name: item.name,
        panelCode: item.panel_code,
        banner_type: item.banner_type,
        banner_slots: item.banner_slots,
      })),
    });
  }

  const filteredByDistrict =
    isAllDistrictsView && selectedOption
      ? filteredByPanelType.filter(
          (item) => item.district === selectedOption.option
        )
      : filteredByPanelType;

  // 선택된 기간이 마감인지 확인 (프론트에서 계산한 날짜 사용)
  const getSelectedPeriodStartDate = () => {
    if (!selectedPeriodYear || !selectedPeriodMonth) return null;

    const monthStr = String(selectedPeriodMonth).padStart(2, '0');

    if (selectedHalfPeriod === 'first_half') {
      // 마포구/강북구는 5일부터, 일반 구는 1일부터
      const startDay =
        districtObj?.name === '마포구' || districtObj?.name === '강북구'
          ? '05'
          : '01';
      return `${selectedPeriodYear}-${monthStr}-${startDay}`;
    } else {
      // 마포구/강북구는 20일부터, 일반 구는 16일부터
      const startDay =
        districtObj?.name === '마포구' || districtObj?.name === '강북구'
          ? '20'
          : '16';
      return `${selectedPeriodYear}-${monthStr}-${startDay}`;
    }
  };

  const selectedPeriodStartDate = getSelectedPeriodStartDate();
  const isSelectedPeriodClosed = selectedPeriodStartDate
    ? !isPeriodAvailable(selectedPeriodStartDate)
    : false;

  // 디버그 로그 추가
  console.log('🔍 Period availability check:', {
    selectedPeriodYear,
    selectedPeriodMonth,
    selectedHalfPeriod,
    selectedPeriodStartDate,
    isSelectedPeriodClosed,
    districtName: districtObj?.name,
  });

  // 상하반기에 따른 필터링
  const filteredByHalfPeriod =
    isMapoDistrict && mapoFilter === 'simin'
      ? filteredByDistrict // 시민게시대는 기간/재고 필터링 없이 전체 출력
      : filteredByDistrict.map((item) => {
          // 실시간 재고 정보 기반 남은 수량 계산 (faces는 총 면수 그대로 유지)
          let remainingFaces = item.available_faces ?? item.faces;

          if (item.inventory_info) {
            if (
              selectedHalfPeriod === 'first_half' &&
              item.inventory_info.first_half
            ) {
              remainingFaces = item.inventory_info.first_half.available_slots;
            } else if (
              selectedHalfPeriod === 'second_half' &&
              item.inventory_info.second_half
            ) {
              remainingFaces = item.inventory_info.second_half.available_slots;
            }
          } else {
            // 기존 방식: 선택된 상하반기에 따른 남은 수량 추정
            const totalFaces = item.faces || 1;
            const closed =
              selectedHalfPeriod === 'first_half'
                ? item.first_half_closure_quantity || 0
                : item.second_half_closure_quantity || 0;
            remainingFaces = Math.max(totalFaces - closed, 0);
          }

          return {
            ...item,
            available_faces: remainingFaces,
          };
        });

  // 선택된 기간이 마감이면 빈 배열로 설정 (시민게시대, 상단광고 제외)
  const filteredBillboards =
    isSelectedPeriodClosed &&
    !(isMapoDistrict && mapoFilter === 'simin') &&
    !(isSongpaOrYongsan && currentPanelTypeFilter === 'top_fixed')
      ? []
      : isAllDistrictsView
      ? [...filteredByHalfPeriod].sort((a, b) =>
          a.district.localeCompare(b.district)
        )
      : filteredByHalfPeriod;

  const listViewBillboards = filteredBillboards.map((item) => {
    const closedByStock = isStockDepleted(item);
    return {
      ...item,
      effectiveIsClosed: item.is_closed || closedByStock,
      effectiveStatus: closedByStock ? 'inactive' : item.status,
    };
  });

  if (currentPanelTypeFilter === 'top_fixed') {
    console.log(`🔍 ${district} 최종 렌더링 데이터:`, {
      isAllDistrictsView,
      filteredByHalfPeriodLength: filteredByHalfPeriod.length,
      filteredBillboardsLength: filteredBillboards.length,
      filteredBillboards: filteredBillboards.map((item) => ({
        name: item.name,
        panelCode: item.panel_code,
      })),
    });
  }

  // // 구분 컬럼에 표시할 값 계산 함수 (탭에 따라 다른 로직 적용)
  // const getPanelTypeLabel = (item: DisplayBillboard) => {
  //   // 송파구, 용산구, 서대문구의 경우 탭에 따라 다른 로직 적용
  //   if (isSongpaOrYongsan && item.type === 'banner') {
  //     if (currentPanelTypeFilter === 'top_fixed') {
  //       return '상단광고';
  //     } else if (currentPanelTypeFilter === 'semi_auto') {
  //       return '현수막게시대';
  //     } else {
  //       // 현수막게시대 탭: panel_type에서 값 가져오기
  //       const panelType = item.panel_type;
  //       if (!panelType) return '현수막게시대';

  //       switch (panelType) {
  //         case 'with_lighting':
  //           return '패널형게시대';
  //         case 'no_lighting':
  //           return '현수막게시대';
  //         case 'panel':
  //           // 관악구의 패널형은 현수막게시대로, 나머지는 패널형게시대로
  //           return item.district === '관악구' ? '현수막게시대' : '패널형게시대';
  //         default:
  //           return '현수막게시대';
  //       }
  //     }
  //   }

  //   // 다른 구들은 기존 panel_type 사용
  //   const panelType = item.panel_type;
  //   if (!panelType) return '현수막게시대';

  //   switch (panelType) {
  //     case 'multi_panel':
  //       return '패널형게시대';
  //     case 'lower_panel':
  //       return '현수막게시대';
  //     case 'bulletin_board':
  //       return '시민게시대';
  //     case 'cultural_board':
  //       return '시민/문화게시대';
  //     case 'with_lighting':
  //       return '패널형게시대';
  //     case 'no_lighting':
  //       return '현수막게시대';
  //     case 'semi_auto':
  //       return '현수막게시대';
  //     case 'panel':
  //       // 관악구의 패널형은 현수막게시대로, 나머지는 패널형게시대로
  //       return item.district === '관악구' ? '현수막게시대' : '패널형게시대';
  //     case 'top_fixed':
  //       return '상단광고';
  //     default:
  //       return '현수막게시대';
  //   }
  // };

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

    // 전체보기로 이동
    if (item.option === '전체') {
      router.push('/banner-display/all');
      return;
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
    } else if (!isAllDistrictsView && item.option !== '전체') {
      // 개별 구 페이지에서 다른 구를 선택했을 때 해당 구의 페이지로 이동
      const districtCode = getDistrictCode(item.option);
      // panelTypeFilter를 'panel'로 리셋
      if (currentSetPanelTypeFilter) {
        currentSetPanelTypeFilter('panel');
      }
      router.push(`/banner-display/${districtCode}`);
    }
  };

  // AI 파일 다운로드 함수
  const handleAIFileDownload = async () => {
    setAiDownloadLoading(true);
    try {
      // DB에서 AI 파일 URL 가져오기
      const response = await fetch(
        `/api/get-ai-guideline?district=${encodeURIComponent(
          district
        )}&guideline_type=banner`
      );
      const result = await response.json();

      if (!result.success) {
        alert(result.error || 'AI 파일을 찾을 수 없습니다.');
        return;
      }

      const aiFileUrl = result.data.aiFileUrl;
      const fileName =
        aiFileUrl.split('/').pop()?.split('?')[0] ||
        `${districtObj?.name || '가이드라인'}_AI_파일`;

      // 파일 다운로드
      const link = document.createElement('a');
      link.href = aiFileUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('AI 파일 다운로드 오류:', error);
      alert('AI 파일 다운로드 중 오류가 발생했습니다.');
    } finally {
      setAiDownloadLoading(false);
    }
  };

  const handleItemSelect = async (id: string, checked?: boolean) => {
    console.log('🔍 handleItemSelect called with id:', id, 'checked:', checked);

    // 아이템 찾기 - filteredBillboards에서 찾기
    const item = filteredBillboards.find((item) => item.id === id);
    if (!item) {
      console.log('🔍 Item not found in filteredBillboards:', id);
      // 원본 billboards에서도 찾아보기
      const originalItem = billboards.find((item) => item.id === id);
      if (!originalItem) {
        console.log('🔍 Item not found in original billboards either:', id);
        return;
      }
      console.log('🔍 Found item in original billboards, using it');
    }

    const targetItem = item || billboards.find((item) => item.id === id);
    if (!targetItem) {
      console.log('🔍 Item not found anywhere:', id);
      return;
    }

    // 마포구 시민게시대 탭에서는 클릭해도 장바구니에 추가하지 않음 (방문접수)
    if (isMapoDistrict && mapoFilter === 'simin') {
      console.log(
        '🔍 Mapo simin tab - no cart addition (visit application only)'
      );
      return;
    }

    // 아이템이 선택 가능한지 확인 - 더 자세한 로그 추가
    const isSelectable = isItemSelectable(targetItem);
    console.log('🔍 Item selectability check:', {
      id: targetItem.id,
      name: targetItem.name,
      isSelectable,
      selectedHalfPeriod,
      period,
      firstHalfClosureQuantity: targetItem.first_half_closure_quantity,
      secondHalfClosureQuantity: targetItem.second_half_closure_quantity,
      faces: targetItem.faces,
      is_closed: targetItem.is_closed,
    });

    if (!isSelectable) {
      console.log('🔍 Item is not selectable, returning early');
      return; // 선택 불가능한 경우 선택을 막음
    }

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
    let newSelectedIds: string[];

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
      // 리스트에 표시된 가격 그대로 사용
      const priceForCart = targetItem.total_price || 0;
      let panelSlotSnapshot = null;
      let selectedSlotId: string | null = null;

      console.log('🔍 Item selected:', {
        district: targetItem.district,
        itemId: targetItem.id,
        itemName: targetItem.name,
        itemTotalPrice: targetItem.total_price,
        itemPrice: targetItem.price,
      });

      // banner_slots에서 가격 정보 가져오기 (snapshot용) - BannerBillboard 타입인 경우만
      if (
        targetItem.type === 'banner' &&
        'banner_slots' in targetItem &&
        targetItem.banner_slots &&
        targetItem.banner_slots.length > 0
      ) {
        console.log('🔍 Creating panel_slot_snapshot for item:', {
          itemId: targetItem.id,
          itemName: targetItem.name,
          bannerSlotInfo: targetItem.banner_slots.map((slot) => ({
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

        // 현재 선택된 탭에 따라 적절한 슬롯 찾기
        let slotInfo;

        if (currentPanelTypeFilter === 'top_fixed') {
          // 상단광고 탭: banner_type이 'top_fixed'인 슬롯 찾기
          slotInfo = targetItem.banner_slots.find(
            (slot) => slot.banner_type === 'top_fixed'
          );
          console.log('🔍 Looking for top_fixed slot:', {
            foundTopFixedSlot: !!slotInfo,
            allSlots: targetItem.banner_slots.map((slot) => ({
              banner_type: slot.banner_type,
              slot_number: slot.slot_number,
              hasPricePolicy: !!slot.banner_slot_price_policy?.length,
            })),
          });
        } else if (currentPanelTypeFilter === 'semi_auto') {
          // 반자동 탭: banner_type이 'semi_auto'인 슬롯 찾기
          slotInfo = targetItem.banner_slots.find(
            (slot) => slot.banner_type === 'semi_auto'
          );
          console.log('🔍 Looking for semi_auto slot:', {
            foundSemiAutoSlot: !!slotInfo,
            allSlots: targetItem.banner_slots.map((slot) => ({
              banner_type: slot.banner_type,
              slot_number: slot.slot_number,
              hasPricePolicy: !!slot.banner_slot_price_policy?.length,
            })),
          });
        } else {
          // 현수막게시대 탭: banner_type이 'panel'인 슬롯 찾기
          slotInfo = targetItem.banner_slots.find(
            (slot) => slot.banner_type === 'panel' && slot.slot_number > 0
          );
          console.log('🔍 Looking for panel slot:', {
            foundPanelSlot: !!slotInfo,
            allSlots: targetItem.banner_slots.map((slot) => ({
              banner_type: slot.banner_type,
              slot_number: slot.slot_number,
              hasPricePolicy: !!slot.banner_slot_price_policy?.length,
            })),
          });
        }

        if (!slotInfo) {
          // 적절한 슬롯이 없으면 첫 번째 슬롯 사용
          slotInfo = targetItem.banner_slots[0];
          console.log('🔍 No appropriate slot found, using first slot');
        } else {
          console.log('🔍 Found appropriate slot, using it');
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

        selectedSlotId = slotInfo?.id || null;

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
              panel_id: slotInfo.panel_id,
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
              panel_id: string | null;
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
              panel_id: slotInfo.panel_id,
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
              panel_id: string | null;
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
          // 기존 로직 (banner_slots의 total_price 사용)
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
            panel_id: slotInfo.panel_id,
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
            panel_id: string | null;
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
        console.log('🔍 No banner_slots found for item:', {
          itemId: targetItem.id,
          itemType: targetItem.type,
          hasBannerSlotInfo: 'banner_slots' in targetItem,
          bannerSlotInfoLength:
            'banner_slots' in targetItem
              ? targetItem.banner_slots?.length
              : 'N/A',
        });
      }

      // 상반기/하반기 정보를 포함한 고유한 ID 생성
      const uniqueCartItemId = `${targetItem.id}-${selectedHalfPeriod}`;

      // 상단광고 여부 확인 (panel_slot_snapshot의 banner_type 또는 item.panel_type 사용)
      const isTopFixed =
        panelSlotSnapshot?.banner_type === 'top_fixed' ||
        targetItem.panel_type === 'top_fixed';

      console.log('🔍 상단광고 판별 로직:', {
        itemId: targetItem.id,
        itemName: targetItem.name,
        itemPanelType: targetItem.panel_type,
        panelSlotSnapshotBannerType: panelSlotSnapshot?.banner_type,
        isTopFixed: isTopFixed,
        currentPanelTypeFilter: currentPanelTypeFilter,
      });

      // 선택된 기간의 시작/종료 날짜 계산
      let selectedPeriodFrom: string | undefined;
      let selectedPeriodTo: string | undefined;

      if (period) {
        if (selectedHalfPeriod === 'first_half') {
          selectedPeriodFrom = period.first_half_from;
          selectedPeriodTo = period.first_half_to;
        } else {
          selectedPeriodFrom = period.second_half_from;
          selectedPeriodTo = period.second_half_to;
        }
      }

      // 기본 프로필 정보 가져오기
      // 🔍 [디버깅] 장바구니 추가 시 프로필 확인
      console.log('🔍 [장바구니 추가] displayDetailPage - 프로필 확인:', {
        profilesCount: profiles?.length || 0,
        profiles:
          profiles?.map((p) => ({
            id: p.id,
            is_default: p.is_default,
            profile_title: p.profile_title,
          })) || [],
        hasUser: !!user,
        userId: user?.id,
      });

      // 프로필이 없으면 API를 통해 다시 가져오기 시도
      let profilesToUse = profiles;
      if ((!profiles || profiles.length === 0) && user?.id) {
        console.log('🔍 [장바구니 추가] 프로필이 없어서 API 호출 시도...');
        try {
          const profileResponse = await fetch(
            `/api/user-profiles?userId=${user.id}`
          );
          const profileData = await profileResponse.json();

          console.log('🔍 [장바구니 추가] 프로필 API 응답:', {
            ok: profileResponse.ok,
            status: profileResponse.status,
            success: profileData.success,
            dataLength: profileData.data?.length || 0,
          });

          if (profileData.success && profileData.data?.length > 0) {
            profilesToUse = profileData.data.map(
              (profile: Record<string, unknown>) => ({
                ...profile,
                user_auth_id: (profile.user_auth_id as string) || user.id,
              })
            );
            console.log('🔍 [장바구니 추가] API에서 프로필 가져옴:', {
              count: profilesToUse.length,
              profiles: profilesToUse.map((p) => ({
                id: p.id,
                is_default: p.is_default,
                profile_title: p.profile_title,
              })),
            });
            // ProfileContext에도 업데이트
            setProfiles(profilesToUse);
          }
        } catch (error) {
          console.error('🔍 [장바구니 추가] 프로필 API 호출 실패:', error);
        }
      }

      const defaultProfile = profilesToUse?.find(
        (profile) => profile.is_default
      );

      console.log('🔍 [장바구니 추가] defaultProfile 찾기 결과:', {
        found: !!defaultProfile,
        defaultProfileId: defaultProfile?.id,
        defaultProfileTitle: defaultProfile?.profile_title,
        profilesToUseCount: profilesToUse?.length || 0,
      });

      // 리스트에서 장바구니 추가 시 프로필 정보는 선택사항
      // 장바구니 페이지에서 프로필 설정 가능
      const profileToUse = defaultProfile || profilesToUse?.[0];

      if (!profileToUse?.id) {
        console.log(
          '🔍 [장바구니 추가] 프로필이 없지만 장바구니에 추가 (장바구니 페이지에서 설정 가능):',
          {
            profilesCount: profilesToUse?.length || 0,
            hasUser: !!user,
            userId: user?.id,
            note: '장바구니 페이지에서 프로필을 설정할 수 있습니다.',
          }
        );
        // 프로필이 없어도 장바구니에 추가 가능
      } else {
        console.log('🔍 [장바구니 추가] 사용할 프로필:', {
          id: profileToUse.id,
          title: profileToUse.profile_title,
          is_default: profileToUse.is_default,
        });
      }

      const topFixedIdentifier = selectedSlotId || targetItem.panel_id;

      const cartItem = {
        id: uniqueCartItemId, // 상반기/하반기 정보를 포함한 고유 ID
        type: 'banner-display' as const,
        name: getCartItemName(targetItem),
        district: targetItem.district,
        price: priceForCart,
        halfPeriod: selectedHalfPeriod,
        // 선택된 기간의 년월 정보 사용
        selectedYear: selectedPeriodYear,
        selectedMonth: selectedPeriodMonth,
        // 기간 데이터 추가 (구별 카드에서 전달받은 데이터)
        periodData: period || undefined,
        // 선택된 기간의 시작/종료 날짜
        selectedPeriodFrom,
        selectedPeriodTo,
        panel_type: isTopFixed ? 'top_fixed' : targetItem.panel_type,
        panel_id: targetItem.panel_id, // 원본 UUID
        isTopFixed: isTopFixed, // 상단광고 여부
        ...(panelSlotSnapshot && { panel_slot_snapshot: panelSlotSnapshot }), // 가격 상세 정보 추가
        panel_code: targetItem.panel_code?.toString(),
        photo_url: targetItem.photo_url, // 게시대 사진 URL 추가
        // 상담 중복 방지를 위한 공통 키
        // - 상단광고: panel_id 기준
        // - 일반 현수막게시대: 상반기/하반기까지 포함한 uniqueCartItemId 기준 (이후 확장 가능)
        consultationKey: isTopFixed
          ? topFixedIdentifier
            ? `top_fixed:${topFixedIdentifier}`
            : `top_fixed:${uniqueCartItemId}`
          : `banner:${uniqueCartItemId}`,
        // 사용자 프로필 정보 추가 (프로필이 있으면 사용, 없으면 undefined - 장바구니에서 설정 가능)
        contact_person_name: profileToUse?.contact_person_name,
        phone: profileToUse?.phone,
        company_name: profileToUse?.company_name,
        email: profileToUse?.email,
        user_profile_id: profileToUse?.id || undefined, // 프로필이 없어도 장바구니에 추가 가능
        // user_auth_id: localStorage에서 가져오기 (로그인 시 저장됨)
        user_auth_id: (() => {
          if (typeof window !== 'undefined') {
            const storedAuthId = localStorage.getItem('hansung_user_auth_id');
            if (storedAuthId) {
              console.log(
                '🔍 [장바구니 추가] localStorage에서 user_auth_id 가져옴:',
                storedAuthId
              );
              return storedAuthId;
            }
          }
          // localStorage에 없으면 user.id 또는 profileToUse.user_auth_id 사용 (폴백)
          const fallbackAuthId = user?.id || profileToUse?.user_auth_id;
          if (fallbackAuthId) {
            console.warn(
              '🔍 [장바구니 추가] ⚠️ localStorage에 없어서 폴백 사용:',
              fallbackAuthId
            );
            // 폴백 사용 시 localStorage에 저장 (다음번에는 바로 사용)
            if (typeof window !== 'undefined') {
              localStorage.setItem('hansung_user_auth_id', fallbackAuthId);
            }
            return fallbackAuthId;
          }
          console.error('🔍 [장바구니 추가] ❌ user_auth_id를 찾을 수 없음!', {
            hasLocalStorage: typeof window !== 'undefined',
            storedAuthId:
              typeof window !== 'undefined'
                ? localStorage.getItem('hansung_user_auth_id')
                : null,
            hasUser: !!user,
            userId: user?.id,
            hasProfileToUse: !!profileToUse,
            profileUserAuthId: profileToUse?.user_auth_id,
          });
          return undefined;
        })(),
      };

      // user_auth_id가 없으면 장바구니에 추가하지 않음
      if (!cartItem.user_auth_id) {
        console.error(
          '🔍 [장바구니 추가] ❌ user_auth_id가 없어서 장바구니 추가 중단',
          {
            itemId: cartItem.id,
            itemName: cartItem.name,
            hasUser: !!user,
            userId: user?.id,
            hasProfileToUse: !!profileToUse,
            profileUserAuthId: profileToUse?.user_auth_id,
          }
        );
        setShowLoginModal(true);
        return;
      }

      console.log('🔍 [장바구니 추가] cartItem 생성 결과:', {
        itemId: cartItem.id,
        user_profile_id: cartItem.user_profile_id,
        hasUserProfileId: !!cartItem.user_profile_id,
        user_auth_id: cartItem.user_auth_id,
        hasUserAuthId: !!cartItem.user_auth_id,
      });

      console.log('🔍 Final cart item with snapshot:', {
        itemId: cartItem.id,
        itemName: cartItem.name,
        price: cartItem.price,
        hasSnapshot: !!cartItem.panel_slot_snapshot,
        snapshot: cartItem.panel_slot_snapshot,
        photo_url: cartItem.photo_url,
        hasPhotoUrl: !!cartItem.photo_url,
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
                src={item.photo_url || '/images/no_image.png'}
                alt={item.name}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className={`md:object-cover sm:object-cover `}
              />
            </div>
            <div className="mt-4">
              <div className="text-sm text-gray-500 mb-1">
                No. {item.panel_code || item.id}
              </div>
              <h3 className="text-1 font-medium">
                {item.nickname && <span>{item.nickname} - </span>}
                {item.address ? <span>{item.address}</span> : <></>}
                {item.neighborhood && (
                  <span className="ml-1 text-gray-500">
                    {item.neighborhood}
                  </span>
                )}
                {item.maintenance_notes && (
                  <span className="text-pink-500 text-sm ml-2">
                    ({item.maintenance_notes})
                  </span>
                )}
              </h3>
              <p className="text-0.875 text-gray-600">{item.neighborhood}</p>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderLocationView = () => {
    const selectedItem =
      selectedIds.length > 0
        ? filteredBillboards.find((b) => b.id === selectedIds[0])
        : null;

    const billboardsWithCoords = filteredBillboards.filter(
      (item) => item.lat != null && item.lng != null
    );

    const isBillboardClosed = (item: DisplayBillboard) => {
      const extendedItem = item as DisplayBillboard & {
        panel_slot_status?: string | null;
      };
      return Boolean(
        extendedItem.is_closed ||
          extendedItem.panel_slot_status === 'closed' ||
          extendedItem.panel_slot_status === '마감' ||
          isStockDepleted(item)
      );
    };

    const baseMarkers = billboardsWithCoords.map((item) => ({
      id: item.id,
      title:
        item.nickname ||
        item.name ||
        item.address ||
        item.neighborhood ||
        '게시대',
      lat: item.lat!,
      lng: item.lng!,
      type: item.type,
      number: item.panel_code ? Number(item.panel_code) : undefined,
      isSelected: !showAllPins && selectedIds.includes(item.id),
      district: item.district,
      // 전체보기 모드에서는 위치 정보(subtitle)를 표시하지 않음
      subtitle: showAllPins
        ? undefined
        : item.address || item.neighborhood || undefined,
    }));

    const groupedByDistrict = baseMarkers.reduce<
      Record<string, typeof baseMarkers>
    >((acc, marker) => {
      const groupKey =
        marker.district ||
        districtObj?.name ||
        selectedOption?.option ||
        'district';
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(marker);
      return acc;
    }, {});

    const mapPolygons: MapPolygon[] = Object.entries(groupedByDistrict)
      .map(([districtName, markers], index): MapPolygon | null => {
        if (markers.length === 0) {
          return null;
        }
        // 게시대 좌표들을 Point 배열로 변환
        const points = markers.map((marker) => ({
          lat: marker.lat,
          lng: marker.lng,
        }));

        // Convex Hull 계산 (실제 영역 경계선)
        const hullPath = calculateConvexHull(points, DEFAULT_POLYGON_PADDING);

        const colorKey = districtName || `district-${index}`;
        const color = getPolygonColor(colorKey);
        return {
          id: `polygon-${colorKey.replace(/\s+/g, '-')}-${index}`,
          path: hullPath,
          strokeColor: color,
          strokeOpacity: 0.65,
          strokeWeight: 2,
          // 채우기 색상 제거 - 보더만 표시
          fillColor: color,
          fillOpacity: 0,
        };
      })
      .filter((polygon): polygon is MapPolygon => polygon !== null);

    const selectedMarker =
      !showAllPins &&
      selectedItem &&
      selectedItem.lat != null &&
      selectedItem.lng != null
        ? baseMarkers.find((marker) => marker.id === selectedItem.id)
        : null;

    const mapMarkers = showAllPins
      ? baseMarkers.map((marker) => ({ ...marker, isSelected: false }))
      : selectedMarker
      ? [{ ...selectedMarker, isSelected: true }]
      : baseMarkers;

    const defaultCenter =
      baseMarkers.length > 0
        ? {
            lat:
              baseMarkers.reduce((sum, marker) => sum + marker.lat, 0) /
              baseMarkers.length,
            lng:
              baseMarkers.reduce((sum, marker) => sum + marker.lng, 0) /
              baseMarkers.length,
          }
        : { lat: 37.5665, lng: 126.978 };

    const mapCenter =
      !showAllPins &&
      selectedItem &&
      selectedItem.lat != null &&
      selectedItem.lng != null
        ? { lat: selectedItem.lat, lng: selectedItem.lng }
        : defaultCenter;

    const handleToggleAllPins = () => {
      setShowAllPins((prev) => {
        const next = !prev;
        if (next) {
          setSelectedIds([]);
        }
        return next;
      });
    };

    const handleListItemClick = (itemId: string, isSelected: boolean) => {
      if (isSelected) {
        setSelectedIds([]);
        return;
      }
      if (showAllPins) {
        setShowAllPins(false);
      }
      setSelectedIds([itemId]);
    };

    const handleMarkerClick = (markerId: string) => {
      if (showAllPins) {
        setShowAllPins(false);
        setSelectedIds([markerId]);
        return;
      }
      const alreadySelected = selectedIds.includes(markerId);
      if (alreadySelected) {
        setSelectedIds([]);
      } else {
        setSelectedIds([markerId]);
      }
    };

    console.log('🔍 renderLocationView:', {
      selectedItem,
      showAllPins,
      mapMarkersCount: mapMarkers.length,
      mapCenter,
    });

    return (
      <div className="flex flex-col" style={{ height: '700px' }}>
        <div className="flex justify-end mb-4">
          <button
            className={`px-4 py-2 rounded-lg text-0.875 font-medium border ${
              showAllPins
                ? 'bg-black text-white border-black'
                : 'bg-gray-100 text-gray-700 border-gray-300'
            }`}
            onClick={handleToggleAllPins}
          >
            {showAllPins ? '상세 핀 보기' : '전체 핀 보기'}
          </button>
        </div>
        <div className="flex gap-8 flex-1 min-h-0">
          <div
            className="flex-1 overflow-y-auto pr-2"
            style={{ maxWidth: '40%', maxHeight: '700px' }}
          >
            <div className="flex flex-col gap-6">
              {filteredBillboards.map((item, index) => {
                const isSelected = selectedIds.includes(item.id);
                const uniqueKey = item.id || `banner-location-${index}`; // fallback key
                const isClosed = isBillboardClosed(item);

                return (
                  <div
                    key={uniqueKey}
                    className={`flex flex-col rounded-lg transition-colors p-2 ${
                      isClosed
                        ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed opacity-70'
                        : `cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`
                    }`}
                    onClick={() => {
                      if (isClosed) {
                        return;
                      }
                      handleListItemClick(item.id, isSelected);
                    }}
                  >
                    <div className="relative aspect-[1/1] w-full overflow-hidden rounded-lg">
                      <Image
                        src={
                          item.photo_url || '/images/banner-display/landing.png'
                        }
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <div className="text-sm text-gray-500 mb-1">
                        No. {item.panel_code || item.id}
                      </div>
                      <h3 className="text-1 font-medium">
                        {item.nickname && <span>{item.nickname} - </span>}
                        {item.address ? <span>{item.address}</span> : <></>}
                        {item.neighborhood && (
                          <span className="ml-1 text-gray-500">
                            {item.neighborhood}
                          </span>
                        )}
                        {item.maintenance_notes && (
                          <span className="text-pink-500 text-sm ml-2">
                            ({item.maintenance_notes})
                          </span>
                        )}
                      </h3>
                      <p className="text-0.875 text-gray-600">
                        {item.neighborhood}
                      </p>
                      {/* 지도 뷰에서만 장바구니 담기 버튼 표시 */}
                      <button
                        disabled={isClosed}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isClosed) {
                            return;
                          }
                          handleItemSelect(item.id, true);
                        }}
                        className={`mt-3 w-full py-2 px-4 rounded-lg transition-colors ${
                          isClosed
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        {isClosed ? '마감' : '장바구니 담기'}
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
                  onMarkerClick={handleMarkerClick}
                  displayMode={showAllPins ? 'allMinimal' : 'default'}
                  polygons={mapPolygons}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 상하반기 탭 노출 조건 함수
  const showHalfPeriodTabs =
    // 송파구, 용산구: 상단광고 탭에서는 숨김, 나머지 탭에서는 표시
    ((isSongpaOrYongsan && currentPanelTypeFilter !== 'top_fixed') ||
      // 관악구, 서대문구: 항상
      districtObj?.code === 'gwanak' ||
      districtObj?.code === 'seodaemun' ||
      // 마포구: 모든 탭에서 상하반기 탭 표시
      isMapoDistrict) &&
    // period가 있거나 selectedDistrictPeriod가 있으면 탭 표시
    (period || selectedDistrictPeriod || !isAllDistrictsView);

  // 디버그 로그 추가
  console.log('🔍 showHalfPeriodTabs Debug:', {
    district: districtObj?.code,
    isSongpaOrYongsan,
    currentPanelTypeFilter,
    isMapoDistrict,
    period,
    periodExists: !!period,
    periodFirstHalf: period?.first_half_from,
    periodSecondHalf: period?.second_half_from,
    isAllDistrictsView,
    selectedOption,
    selectedDistrictPeriod,
    showHalfPeriodTabs,
  });

  return (
    <main className="min-h-screen flex flex-col bg-white pb-10">
      <div className="lg:min-w-[70rem] lg:max-w-[1500px]  mx-auto px-4 pt-[7rem]">
        <BackToListButton
          label="구 목록으로 돌아가기"
          onClick={() => router.push('/banner-display')}
        />
        <div className="mb-8">
          <div className="flex gap-2 items-center">
            {(districtObj || districtData) && (
              <Image
                src={
                  selectedOption?.option && selectedOption.option !== '전체'
                    ? districtData?.logo_image_url ||
                      districtObj?.logo ||
                      `/images/district-icon/${getDistrictCode(
                        selectedOption.option
                      )}-gu.png`
                    : districtData?.logo_image_url ||
                      districtObj?.logo ||
                      `/images/district-icon/${district}-gu.png`
                }
                alt={
                  selectedOption?.option ||
                  districtData?.name ||
                  districtObj?.name ||
                  '구 로고'
                }
                width={50}
                height={50}
                className="inline-block align-middle mr-2"
              />
            )}
            <h2 className="text-2.25 font-900 font-gmarket inline-block align-middle">
              {selectedOption?.option || districtObj?.name}
            </h2>
          </div>
          {/* {selectedOption && <div>{selectedOption.option}</div>} */}

          <DistrictInfo
            period={selectedDistrictPeriod || period}
            bankInfo={bankInfo}
            districtName={districtObj?.name}
            flexRow={true}
          />
        </div>
        {/* 마포구 전용 filter */}
        {isMapoDistrict && (
          <div className="mb-8">
            <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
              <button
                onClick={() => setMapoFilter('yeollip')}
                className={`lg:text-1 md:text-0.75 transition-colors duration-100 py-2 px-6 font-medium cursor-pointer ${
                  mapoFilter === 'yeollip'
                    ? 'text-white bg-pink-500 rounded-full '
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                연립형
              </button>
              <button
                onClick={() => setMapoFilter('jeodan')}
                className={`lg:text-1 md:text-0.75 transition-colors duration-100 py-2 px-6 font-medium cursor-pointer ${
                  mapoFilter === 'jeodan'
                    ? 'text-white bg-pink-500 rounded-full '
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                저단형
              </button>
              <button
                onClick={() => setMapoFilter('simin')}
                className={`lg:text-1 md:text-0.75 transition-colors duration-100 py-2 px-6 font-medium cursor-pointer ${
                  mapoFilter === 'simin'
                    ? 'text-white bg-pink-500 rounded-full '
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
              *시민.문화게시대 게첨일은 매월 5일 <br /> *시민게시판은 1개 업체가
              1회당 최대11개소에 신청할수 있습니다. <br /> *포스터 신청은
              게첨일기준 전달인 매월 1일에 선착순 접수이며,방문제출입니다.{' '}
              <br />
              예)3월5일게첨일 신청분은 2월1일에 접수 <br /> *포스터는 신청자가
              제작하여 한성디자인기획에 제출합니다.
              <br /> 포스터 사이즈: 370mm x 500mm
              <br /> 중앙광고: 별도 상담문의 <br />
              중앙광고 사이즈 : 840mm x 1650mm
            </div>
          </div>
        )}

        {/* 송파구, 용산구 전용 filter */}
        {isSongpaOrYongsan && (
          <div className="mb-8">
            <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
              <button
                onClick={() => {
                  console.log(
                    '🔍 현수막게시대 탭 클릭 - 변경 전:',
                    currentPanelTypeFilter
                  );
                  // 단순하게 하나의 상태만 업데이트
                  currentSetPanelTypeFilter('panel');
                  console.log('🔍 현수막게시대 탭 클릭 - 변경 후 요청됨');
                }}
                className={`lg:text-1 md:text-0.75 transition-colors duration-100 py-2 px-6 font-medium cursor-pointer ${
                  currentPanelTypeFilter === 'panel'
                    ? 'text-white bg-black rounded-full '
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                현수막게시대
              </button>
              <button
                onClick={() => {
                  console.log(
                    '🔍 상단광고 탭 클릭 - 변경 전:',
                    currentPanelTypeFilter
                  );
                  // 단순하게 하나의 상태만 업데이트
                  currentSetPanelTypeFilter('top_fixed');
                  console.log('🔍 상단광고 탭 클릭 - 변경 후 요청됨');
                }}
                className={`lg:text-1 md:text-0.75 transition-colors duration-100 py-2 px-6 font-medium cursor-pointer ${
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
        {/* 시민게시대 탭에서는 신청기간 섹션 숨김 */}
        {showHalfPeriodTabs &&
          !(isMapoDistrict && mapoFilter === 'simin') &&
          !(isSongpaOrYongsan && currentPanelTypeFilter === 'top_fixed') && (
            <HalfPeriodTabs
              selectedPeriod={selectedHalfPeriod}
              onPeriodChange={(newPeriod, year, month) => {
                setSelectedHalfPeriod(newPeriod);
                if (year !== undefined) setSelectedPeriodYear(year);
                if (month !== undefined) setSelectedPeriodMonth(month);
                // 선택된 기간이 변경되면 선택 상태 초기화
                setSelectedIdsFirstHalf([]);
                setSelectedIdsSecondHalf([]);
              }}
              districtName={districtObj?.name}
              periodData={selectedDistrictPeriod || period}
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
          {/* 시민게시대 탭에서는 가이드라인보기와 AI파일다운로드 버튼 숨김 */}
          {!(isMapoDistrict && mapoFilter === 'simin') && (
            <>
              <GuidelineButton
                district={district}
                guidelineType="banner"
                className="flex items-center gap-2 px-4 py-2 hover:cursor-pointer text-gray-800 hover:text-black border-b-2 border-transparent "
              >
                <DocumentIcon className="w-7 h-6 text-gray-600" />
                <span className="hidden md:inline text-0.875 text-gray-600 font-500">
                  가이드라인 보기
                </span>
              </GuidelineButton>
              <button
                onClick={handleAIFileDownload}
                disabled={aiDownloadLoading}
                className="flex items-center gap-2 px-4 py-2 hover:cursor-pointer text-gray-800 hover:text-black border-b-2 border-transparent hover:border-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {aiDownloadLoading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
                ) : (
                  <svg
                    className="w-7 h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                )}
                <span className="hidden md:inline text-0.875">
                  {aiDownloadLoading ? '다운로드 중...' : 'ai파일 다운로드'}
                </span>
              </button>
            </>
          )}
          <div className="ml-auto">
            <DropdownMenu
              data={dropdownOptions}
              onChange={handleDropdownChange}
              title={selectedOption?.option || districtObj?.name || ''}
            />
          </div>
        </div>

        {/* Content Section */}
        <motion.div initial="initial" animate="animate" variants={fadeInUp}>
          {billboards.length === 0 ? (
            // 준비 중인 경우 메시지 표시
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-2xl font-bold text-gray-600 mb-4">
                {isSongpaOrYongsan && currentPanelTypeFilter === 'top_fixed'
                  ? '상단광고 상담문의'
                  : '현재 준비 중입니다'}
              </div>
              <div className="text-gray-500 text-center">
                {isSongpaOrYongsan && currentPanelTypeFilter === 'top_fixed' ? (
                  <>
                    상단광고는 별도 상담을 통해 진행됩니다. <br />
                    문의사항이 있으시면 연락주세요.
                  </>
                ) : (
                  <>
                    서비스 준비 중입니다. <br />
                    조금만 기다려 주세요.
                  </>
                )}
              </div>
            </div>
          ) : isSelectedPeriodClosed &&
            !(isMapoDistrict && mapoFilter === 'simin') &&
            !(isSongpaOrYongsan && currentPanelTypeFilter === 'top_fixed') ? (
            // 선택된 기간이 마감된 경우 메시지 표시
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-2xl font-bold text-gray-600 mb-4">
                해당 분기는 신청마감되었습니다
              </div>
              <div className="text-gray-500 text-center">
                선택하신 기간은 신청 마감되었습니다. <br />
                다른 기간을 선택해주세요.
              </div>
            </div>
          ) : filteredBillboards.length === 0 ? (
            // 필터링된 결과가 없는 경우 메시지 표시
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-2xl font-bold text-gray-600 mb-4">
                {isSongpaOrYongsan && currentPanelTypeFilter === 'top_fixed'
                  ? '상단광고 상담문의'
                  : '해당 조건의 게시대가 없습니다'}
              </div>
              <div className="text-gray-500 text-center">
                {isSongpaOrYongsan && currentPanelTypeFilter === 'top_fixed' ? (
                  <>
                    상단광고는 별도 상담을 통해 진행됩니다. <br />
                    문의사항이 있으시면 연락주세요.
                  </>
                ) : (
                  <>
                    선택한 조건에 맞는 게시대가 없습니다. <br />
                    다른 조건을 선택해보세요.
                  </>
                )}
              </div>
            </div>
          ) : viewType === 'location' ? (
            renderLocationView()
          ) : viewType === 'list' ? (
            <>
              <ItemList
                items={listViewBillboards}
                showHeader
                showCheckbox={
                  !isAllDistrictsView ||
                  !!(selectedOption && selectedOption.option !== '전체')
                }
                selectedIds={selectedIds}
                onItemSelect={(id, checked) => handleItemSelect(id, checked)}
                enableRowClick={false}
                hideQuantityColumns={
                  (isSongpaOrYongsan &&
                    currentPanelTypeFilter === 'top_fixed') ||
                  (isMapoDistrict && mapoFilter === 'simin')
                }
                hideStatusColumn={isMapoDistrict && mapoFilter === 'simin'}
                district={districtObj?.name}
                isCitizenBoardTab={isMapoDistrict && mapoFilter === 'simin'}
              />

              {/* 가이드라인 섹션 삭제 */}
            </>
          ) : (
            renderGalleryView()
          )}
        </motion.div>
      </div>
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </main>
  );
}
