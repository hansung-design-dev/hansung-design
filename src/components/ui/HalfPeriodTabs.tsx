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
        label: `${firstFrom.getFullYear()}년 ${
          firstFrom.getMonth() + 1
        }월 상반기`,
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
        label: `${secondFrom.getFullYear()}년 ${
          secondFrom.getMonth() + 1
        }월 하반기`,
      };

      return { firstPeriod, secondPeriod };
    }

    // API 데이터가 없을 때만 현재 날짜 기준으로 계산 (fallback)
    console.log('🔍 No API data, using fallback calculation');

    const now = new Date();
    const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000); // UTC+9 (한국시간)

    const currentYear = koreaTime.getFullYear();
    const currentMonth = koreaTime.getMonth() + 1;

    // 마포구, 강북구: 특별한 기간 (5일-19일 상반기, 20일-다음달 4일 하반기)
    if (districtName === '마포구' || districtName === '강북구') {
      const currentDay = koreaTime.getDate();

      if (currentDay <= 12) {
        // 12일까지는 이번달 상반기 신청 가능
        firstPeriod = {
          year: currentYear,
          month: currentMonth,
          startDay: 5,
          endDay: 19,
          from: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-05`,
          to: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-19`,
          label: `${currentYear}년 ${currentMonth}월 상반기`,
        };
        secondPeriod = {
          year: currentYear,
          month: currentMonth,
          startDay: 20,
          endDay: 31, // 다음달 마지막날까지
          from: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-20`,
          to: `${currentYear}-${(currentMonth + 1)
            .toString()
            .padStart(2, '0')}-04`,
          label: `${currentYear}년 ${currentMonth}월 하반기`,
        };
      } else if (currentDay <= 27) {
        // 13일-27일까지는 이번달 하반기와 다음달 상반기 신청 가능
        firstPeriod = {
          year: currentYear,
          month: currentMonth,
          startDay: 20,
          endDay: 31,
          from: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-20`,
          to: `${currentYear}-${(currentMonth + 1)
            .toString()
            .padStart(2, '0')}-04`,
          label: `${currentYear}년 ${currentMonth}월 하반기`,
        };

        // 다음달 상반기도 표시
        const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
        const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

        secondPeriod = {
          year: nextYear,
          month: nextMonth,
          startDay: 5,
          endDay: 19,
          from: `${nextYear}-${nextMonth.toString().padStart(2, '0')}-05`,
          to: `${nextYear}-${nextMonth.toString().padStart(2, '0')}-19`,
          label: `${nextYear}년 ${nextMonth}월 상반기`,
        };
      } else {
        // 27일 이후면 다음달 상반기 신청 가능
        const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
        const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

        firstPeriod = {
          year: nextYear,
          month: nextMonth,
          startDay: 5,
          endDay: 19,
          from: `${nextYear}-${nextMonth.toString().padStart(2, '0')}-05`,
          to: `${nextYear}-${nextMonth.toString().padStart(2, '0')}-19`,
          label: `${nextYear}년 ${nextMonth}월 상반기`,
        };

        const nextNextMonth = nextMonth === 12 ? 1 : nextMonth + 1;
        const nextNextYear = nextMonth === 12 ? nextYear + 1 : nextYear;

        secondPeriod = {
          year: nextYear,
          month: nextMonth,
          startDay: 20,
          endDay: 31, // 다음달 마지막날까지
          from: `${nextYear}-${nextMonth.toString().padStart(2, '0')}-20`,
          to: `${nextNextYear}-${nextNextMonth.toString().padStart(2, '0')}-04`,
          label: `${nextYear}년 ${nextMonth}월 하반기`,
        };
      }
    } else {
      // 송파, 관악, 용산, 서대문: 일반적인 1일-15일 상반기, 16일-31일 하반기
      // 각 기간 시작 7일 전부터는 다음 기간 신청 가능

      const currentDay = koreaTime.getDate();

      // 디버그 로그 추가
      console.log('🔍 Current day calculation:', {
        currentDay,
        currentYear,
        currentMonth,
        koreaTime: koreaTime.toISOString(),
      });

      // 8월 6일이면 8월 하반기(16일-31일) 신청 가능
      // 8월 15일 이후면 9월 상반기(1일-15일) 신청 가능

      if (currentDay <= 8) {
        // 8일까지는 이번달 상반기 신청 가능
        firstPeriod = {
          year: currentYear,
          month: currentMonth,
          startDay: 1,
          endDay: 15,
          from: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`,
          to: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-15`,
          label: `${currentYear}년 ${currentMonth}월 상반기`,
        };
        secondPeriod = {
          year: currentYear,
          month: currentMonth,
          startDay: 16,
          endDay: new Date(currentYear, currentMonth, 0).getDate(), // 해당 월의 마지막 날
          from: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-16`,
          to: `${currentYear}-${currentMonth
            .toString()
            .padStart(2, '0')}-${new Date(
            currentYear,
            currentMonth,
            0
          ).getDate()}`,
          label: `${currentYear}년 ${currentMonth}월 하반기`,
        };
      } else if (currentDay <= 22) {
        // 9일-22일까지는 이번달 하반기와 다음달 상반기 신청 가능
        firstPeriod = {
          year: currentYear,
          month: currentMonth,
          startDay: 16,
          endDay: new Date(currentYear, currentMonth, 0).getDate(),
          from: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-16`,
          to: `${currentYear}-${currentMonth
            .toString()
            .padStart(2, '0')}-${new Date(
            currentYear,
            currentMonth,
            0
          ).getDate()}`,
          label: `${currentYear}년 ${currentMonth}월 하반기`,
        };

        // 다음달 상반기도 표시
        const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
        const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

        secondPeriod = {
          year: nextYear,
          month: nextMonth,
          startDay: 1,
          endDay: 15,
          from: `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`,
          to: `${nextYear}-${nextMonth.toString().padStart(2, '0')}-15`,
          label: `${nextYear}년 ${nextMonth}월 상반기`,
        };
      } else {
        // 23일 이후면 다음달 상반기 신청 가능
        const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
        const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

        firstPeriod = {
          year: nextYear,
          month: nextMonth,
          startDay: 1,
          endDay: 15,
          from: `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`,
          to: `${nextYear}-${nextMonth.toString().padStart(2, '0')}-15`,
          label: `${nextYear}년 ${nextMonth}월 상반기`,
        };

        secondPeriod = {
          year: nextYear,
          month: nextMonth,
          startDay: 16,
          endDay: new Date(nextYear, nextMonth, 0).getDate(),
          from: `${nextYear}-${nextMonth.toString().padStart(2, '0')}-16`,
          to: `${nextYear}-${nextMonth.toString().padStart(2, '0')}-${new Date(
            nextYear,
            nextMonth,
            0
          ).getDate()}`,
          label: `${nextYear}년 ${nextMonth}월 하반기`,
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
  const isFirstPeriodAvailable = isPeriodAvailable(firstPeriod.from);
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
