'use client';

import React from 'react';

interface HalfPeriodTabsProps {
  selectedPeriod: 'first_half' | 'second_half';
  onPeriodChange: (
    period: 'first_half' | 'second_half',
    year?: number,
    month?: number
  ) => void;
  districtName?: string; // 구 이름 추가
  periodData?: {
    first_half_from: string;
    first_half_to: string;
    second_half_from: string;
    second_half_to: string;
    available_periods?: Array<{
      period_from: string;
      period_to: string;
      period: string;
      year_month: string;
    }>;
  } | null;
}

interface PeriodInfo {
  year: number;
  month: number;
  startDay: number;
  endDay: number;
  from: string;
  to: string;
  label: string;
}

const HalfPeriodTabs: React.FC<HalfPeriodTabsProps> = ({
  selectedPeriod,
  onPeriodChange,
  districtName,
  periodData,
}) => {
  // 항상 현재 날짜 기준으로 계산 (API 데이터는 참고용으로만 사용)
  const getCurrentPeriods = () => {
    let firstPeriod: PeriodInfo | null = null;
    let secondPeriod: PeriodInfo | null = null;

    console.log('🔍 Calculating periods based on current date');

    const now = new Date();
    const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000); // UTC+9 (한국시간)

    const currentYear = koreaTime.getFullYear();
    const currentMonth = koreaTime.getMonth() + 1;
    const currentDay = koreaTime.getDate();

    // 오늘 날짜 기준으로 다음 달의 상반기/하반기 자동 계산
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

    console.log('🔍 Current date calculation:', {
      currentYear,
      currentMonth,
      currentDay,
      koreaTime: koreaTime.toISOString(),
      nextYear,
      nextMonth,
    });

    // 마포구, 강북구: 특별한 기간 (5일-19일 상반기, 20일-다음달 4일 하반기)
    if (districtName === '마포구' || districtName === '강북구') {
      firstPeriod = {
        year: nextYear,
        month: nextMonth,
        startDay: 5,
        endDay: 19,
        from: `${nextYear}-${String(nextMonth).padStart(2, '0')}-05`,
        to: `${nextYear}-${String(nextMonth).padStart(2, '0')}-19`,
        label: `${nextYear}년 ${nextMonth}월 상반기`,
      };

      // 하반기는 다음달 4일까지
      const nextNextMonth = nextMonth === 12 ? 1 : nextMonth + 1;
      const nextNextYear = nextMonth === 12 ? nextYear + 1 : nextYear;

      secondPeriod = {
        year: nextYear,
        month: nextMonth,
        startDay: 20,
        endDay: 30,
        from: `${nextYear}-${String(nextMonth).padStart(2, '0')}-20`,
        to: `${nextNextYear}-${String(nextNextMonth).padStart(2, '0')}-04`,
        label: `${nextYear}년 ${nextMonth}월 하반기`,
      };
    } else {
      // 송파, 관악, 용산, 서대문: 일반적인 1일-15일 상반기, 16일-31일 하반기
      firstPeriod = {
        year: nextYear,
        month: nextMonth,
        startDay: 1,
        endDay: 15,
        from: `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`,
        to: `${nextYear}-${String(nextMonth).padStart(2, '0')}-15`,
        label: `${nextYear}년 ${nextMonth}월 상반기`,
      };

      secondPeriod = {
        year: nextYear,
        month: nextMonth,
        startDay: 16,
        endDay: 31,
        from: `${nextYear}-${String(nextMonth).padStart(2, '0')}-16`,
        to: `${nextYear}-${String(nextMonth).padStart(2, '0')}-31`,
        label: `${nextYear}년 ${nextMonth}월 하반기`,
      };
    }

    return { firstPeriod, secondPeriod };
  };

  const { firstPeriod, secondPeriod } = getCurrentPeriods();

  // 게시일 7일 전까지 신청 가능 여부 확인 (한국시간 기준)
  const isPeriodAvailable = (periodStartDate: string) => {
    const now = new Date();
    const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000); // UTC+9 (한국시간)

    const periodStart = new Date(periodStartDate);
    const daysUntilPeriod = Math.ceil(
      (periodStart.getTime() - koreaTime.getTime()) / (1000 * 60 * 60 * 24)
    );

    // 디버그 로그 추가
    console.log('🔍 isPeriodAvailable Debug:', {
      periodStartDate,
      daysUntilPeriod,
      isAvailable: daysUntilPeriod >= 7,
    });

    // 임시로 모든 기간을 신청 가능하도록 설정 (테스트용)
    return true; // daysUntilPeriod >= 7; // 7일 이상 남았으면 신청 가능
  };

  // 각 기간의 신청 가능 여부
  const isFirstPeriodAvailable = firstPeriod
    ? isPeriodAvailable(firstPeriod.from)
    : false;
  const isSecondPeriodAvailable = secondPeriod
    ? isPeriodAvailable(secondPeriod.from)
    : false;

  // 신청 가능한 기간만 필터링
  const availablePeriods = [];
  if (isFirstPeriodAvailable && firstPeriod) {
    availablePeriods.push({ period: 'first_half', data: firstPeriod });
  }
  if (isSecondPeriodAvailable && secondPeriod) {
    availablePeriods.push({ period: 'second_half', data: secondPeriod });
  }

  // 디버그 로그 추가
  console.log('🔍 HalfPeriodTabs Debug:', {
    districtName,
    periodData,
    firstPeriod,
    secondPeriod,
    availablePeriods: availablePeriods.length,
    isFirstPeriodAvailable,
    isSecondPeriodAvailable,
  });

  const handlePeriodChange = (period: 'first_half' | 'second_half') => {
    if (period === 'first_half' && isFirstPeriodAvailable && firstPeriod) {
      onPeriodChange('first_half', firstPeriod.year, firstPeriod.month);
    } else if (
      period === 'second_half' &&
      isSecondPeriodAvailable &&
      secondPeriod
    ) {
      onPeriodChange('second_half', secondPeriod.year, secondPeriod.month);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6 p-4 bg-white rounded-lg border">
        <div className="text-1 font-medium text-gray-800 mr-4">
          신청 기간을 선택해주세요 :
        </div>

        {/* 신청 가능한 기간만 표시 */}
        {availablePeriods.map((periodInfo) => (
          <button
            key={periodInfo.period}
            onClick={() =>
              handlePeriodChange(
                periodInfo.period as 'first_half' | 'second_half'
              )
            }
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === periodInfo.period
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer'
            }`}
          >
            {periodInfo.data.label}
          </button>
        ))}

        {/* 신청 가능한 기간이 없을 때 */}
        {availablePeriods.length === 0 && (
          <div className="text-sm text-gray-500">
            현재 신청 가능한 기간이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default HalfPeriodTabs;
