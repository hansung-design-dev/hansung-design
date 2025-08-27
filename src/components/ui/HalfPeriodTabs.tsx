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
  // API에서 받은 데이터를 사용하거나, 없으면 동적으로 계산
  const getCurrentPeriods = () => {
    let firstPeriod: PeriodInfo | null = null;
    let secondPeriod: PeriodInfo | null = null;

    // API에서 받은 데이터가 있으면 우선 사용
    if (
      periodData &&
      periodData.first_half_from &&
      periodData.second_half_from
    ) {
      console.log('🔍 Using API period data:', periodData);

      // 첫 번째 기간 (first_half)
      const firstFrom = new Date(periodData.first_half_from);
      const firstTo = new Date(periodData.first_half_to);

      firstPeriod = {
        year: firstFrom.getFullYear(),
        month: firstFrom.getMonth() + 1,
        startDay: firstFrom.getDate(),
        endDay: firstTo.getDate(),
        from: periodData.first_half_from,
        to: periodData.first_half_to,
        label: `${firstFrom.getFullYear()}년 ${firstFrom.getMonth() + 1}월 ${
          periodData.available_periods?.[0]?.period === 'first_half'
            ? '상반기'
            : '하반기'
        }`,
      };

      // 두 번째 기간 (second_half)
      const secondFrom = new Date(periodData.second_half_from);
      const secondTo = new Date(periodData.second_half_to);

      secondPeriod = {
        year: secondFrom.getFullYear(),
        month: secondFrom.getMonth() + 1,
        startDay: secondFrom.getDate(),
        endDay: secondTo.getDate(),
        from: periodData.second_half_from,
        to: periodData.second_half_to,
        label: `${secondFrom.getFullYear()}년 ${secondFrom.getMonth() + 1}월 ${
          periodData.available_periods?.[1]?.period === 'second_half'
            ? '하반기'
            : '상반기'
        }`,
      };

      console.log('🔍 Processed API periods:', { firstPeriod, secondPeriod });
      return { firstPeriod, secondPeriod };
    }

    // API 데이터가 없을 때만 현재 날짜 기준으로 계산 (fallback)
    console.log('🔍 No API data, using fallback calculation');

    const now = new Date();
    const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000); // UTC+9 (한국시간)

    const currentYear = koreaTime.getFullYear();
    const currentMonth = koreaTime.getMonth() + 1;
    const currentDay = koreaTime.getDate();

    console.log('🔍 Fallback calculation:', {
      currentYear,
      currentMonth,
      currentDay,
      koreaTime: koreaTime.toISOString(),
    });

    // 마포구, 강북구: 특별한 기간 (5일-19일 상반기, 20일-다음달 4일 하반기)
    if (districtName === '마포구' || districtName === '강북구') {
      // 현재 날짜가 8월 27일이므로 9월 하반기와 10월 상반기가 신청 가능해야 함
      if (currentMonth === 8 && currentDay >= 20) {
        // 8월 20일 이후면 9월 하반기와 10월 상반기 신청 가능
        firstPeriod = {
          year: currentYear,
          month: 9,
          startDay: 20,
          endDay: 30,
          from: `${currentYear}-09-20`,
          to: `${currentYear}-10-04`,
          label: `${currentYear}년 9월 하반기`,
        };
        secondPeriod = {
          year: currentYear,
          month: 10,
          startDay: 5,
          endDay: 19,
          from: `${currentYear}-10-05`,
          to: `${currentYear}-10-19`,
          label: `${currentYear}년 10월 상반기`,
        };
      } else if (currentMonth === 9 && currentDay <= 12) {
        // 9월 12일까지는 9월 하반기와 10월 상반기 신청 가능
        firstPeriod = {
          year: currentYear,
          month: 9,
          startDay: 20,
          endDay: 30,
          from: `${currentYear}-09-20`,
          to: `${currentYear}-10-04`,
          label: `${currentYear}년 9월 하반기`,
        };
        secondPeriod = {
          year: currentYear,
          month: 10,
          startDay: 5,
          endDay: 19,
          from: `${currentYear}-10-05`,
          to: `${currentYear}-10-19`,
          label: `${currentYear}년 10월 상반기`,
        };
      } else if (currentMonth === 9 && currentDay >= 13) {
        // 9월 13일 이후면 10월 상반기와 하반기 신청 가능
        firstPeriod = {
          year: currentYear,
          month: 10,
          startDay: 5,
          endDay: 19,
          from: `${currentYear}-10-05`,
          to: `${currentYear}-10-19`,
          label: `${currentYear}년 10월 상반기`,
        };
        secondPeriod = {
          year: currentYear,
          month: 10,
          startDay: 20,
          endDay: 31,
          from: `${currentYear}-10-20`,
          to: `${currentYear}-11-04`,
          label: `${currentYear}년 10월 하반기`,
        };
      }
    } else {
      // 송파, 관악, 용산, 서대문: 일반적인 1일-15일 상반기, 16일-31일 하반기
      // 현재 날짜가 8월 27일이므로 9월 하반기와 10월 상반기가 신청 가능해야 함

      if (currentMonth === 8 && currentDay >= 23) {
        // 8월 23일 이후면 9월 하반기와 10월 상반기 신청 가능
        firstPeriod = {
          year: currentYear,
          month: 9,
          startDay: 16,
          endDay: 30,
          from: `${currentYear}-09-16`,
          to: `${currentYear}-09-30`,
          label: `${currentYear}년 9월 하반기`,
        };
        secondPeriod = {
          year: currentYear,
          month: 10,
          startDay: 1,
          endDay: 15,
          from: `${currentYear}-10-01`,
          to: `${currentYear}-10-15`,
          label: `${currentYear}년 10월 상반기`,
        };
      } else if (currentMonth === 9 && currentDay <= 8) {
        // 9월 8일까지는 9월 하반기와 10월 상반기 신청 가능
        firstPeriod = {
          year: currentYear,
          month: 9,
          startDay: 16,
          endDay: 30,
          from: `${currentYear}-09-16`,
          to: `${currentYear}-09-30`,
          label: `${currentYear}년 9월 하반기`,
        };
        secondPeriod = {
          year: currentYear,
          month: 10,
          startDay: 1,
          endDay: 15,
          from: `${currentYear}-10-01`,
          to: `${currentYear}-10-15`,
          label: `${currentYear}년 10월 상반기`,
        };
      } else if (currentMonth === 9 && currentDay >= 9) {
        // 9월 9일 이후면 10월 상반기와 하반기 신청 가능
        firstPeriod = {
          year: currentYear,
          month: 10,
          startDay: 1,
          endDay: 15,
          from: `${currentYear}-10-01`,
          to: `${currentYear}-10-15`,
          label: `${currentYear}년 10월 상반기`,
        };
        secondPeriod = {
          year: currentYear,
          month: 10,
          startDay: 16,
          endDay: 31,
          from: `${currentYear}-10-16`,
          to: `${currentYear}-10-31`,
          label: `${currentYear}년 10월 하반기`,
        };
      }
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

    return daysUntilPeriod >= 7; // 7일 이상 남았으면 신청 가능
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
