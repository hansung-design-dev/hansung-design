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
  period: 'first_half' | 'second_half'; // 실제 기간 타입 추가
}

const HalfPeriodTabs: React.FC<HalfPeriodTabsProps> = ({
  selectedPeriod,
  onPeriodChange,
  districtName,
  periodData,
}) => {
  // 현재 날짜에 따라 표시할 기간 결정
  // 1일~15일: 현재 달 하반기 + 다음 달 상반기
  // 16일~31일: 다음 달 상하반기
  const getCurrentPeriods = () => {
    let firstPeriod: PeriodInfo | null = null;
    let secondPeriod: PeriodInfo | null = null;

    console.log('🔍 Calculating periods based on current date');

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

    // 다음 달 계산
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

    console.log('🔍 Current date calculation:', {
      currentYear,
      currentMonth,
      currentDay,
      currentHour,
      nextYear,
      nextMonth,
      parts: parts.map((p) => `${p.type}:${p.value}`),
    });

    // 마포구, 강북구: 특별한 기간 (5일-19일 상반기, 20일-다음달 4일 하반기)
    if (districtName === '마포구' || districtName === '강북구') {
      // 5일 9시 이전인지 확인 (5일 9시 0분 0초까지는 9시 이전으로 간주)
      const isBefore9AMOn5th =
        currentDay === 5 &&
        (currentHour < 9 || (currentHour === 9 && currentMinute === 0));

      if (currentDay >= 1 && currentDay <= 4) {
        // 1일~4일: 현재 달 상반기 + 현재 달 하반기
        // 현재 달 상반기 (5일-19일)
        firstPeriod = {
          year: currentYear,
          month: currentMonth,
          startDay: 5,
          endDay: 19,
          from: `${currentYear}-${String(currentMonth).padStart(2, '0')}-05`,
          to: `${currentYear}-${String(currentMonth).padStart(2, '0')}-19`,
          label: `${currentYear}년 ${currentMonth}월 상반기`,
          period: 'first_half',
        };

        // 현재 달 하반기 (20일-다음달 4일)
        secondPeriod = {
          year: currentYear,
          month: currentMonth,
          startDay: 20,
          endDay: 30,
          from: `${currentYear}-${String(currentMonth).padStart(2, '0')}-20`,
          to: `${nextYear}-${String(nextMonth).padStart(2, '0')}-04`,
          label: `${currentYear}년 ${currentMonth}월 하반기`,
          period: 'second_half',
        };
      } else if (currentDay === 5 && isBefore9AMOn5th) {
        // 5일 9시 이전: 현재 달 상반기(비활성화) + 현재 달 하반기(활성화)
        // 현재 달 상반기 (5일-19일)
        firstPeriod = {
          year: currentYear,
          month: currentMonth,
          startDay: 5,
          endDay: 19,
          from: `${currentYear}-${String(currentMonth).padStart(2, '0')}-05`,
          to: `${currentYear}-${String(currentMonth).padStart(2, '0')}-19`,
          label: `${currentYear}년 ${currentMonth}월 상반기`,
          period: 'first_half',
        };

        // 현재 달 하반기 (20일-다음달 4일)
        secondPeriod = {
          year: currentYear,
          month: currentMonth,
          startDay: 20,
          endDay: 30,
          from: `${currentYear}-${String(currentMonth).padStart(2, '0')}-20`,
          to: `${nextYear}-${String(nextMonth).padStart(2, '0')}-04`,
          label: `${currentYear}년 ${currentMonth}월 하반기`,
          period: 'second_half',
        };
      } else if (currentDay >= 5 && currentDay <= 19) {
        // 5일 9시 이후 ~ 19일: 현재 달 하반기 + 다음 달 상반기
        // 현재 달 하반기 (20일-다음달 4일)
        firstPeriod = {
          year: currentYear,
          month: currentMonth,
          startDay: 20,
          endDay: 30,
          from: `${currentYear}-${String(currentMonth).padStart(2, '0')}-20`,
          to: `${nextYear}-${String(nextMonth).padStart(2, '0')}-04`,
          label: `${currentYear}년 ${currentMonth}월 하반기`,
          period: 'second_half',
        };

        // 다음 달 상반기 (5일-19일)
        secondPeriod = {
          year: nextYear,
          month: nextMonth,
          startDay: 5,
          endDay: 19,
          from: `${nextYear}-${String(nextMonth).padStart(2, '0')}-05`,
          to: `${nextYear}-${String(nextMonth).padStart(2, '0')}-19`,
          label: `${nextYear}년 ${nextMonth}월 상반기`,
          period: 'first_half',
        };
      } else {
        // 5일~31일: 다음 달 상하반기
        // 다음 달 상반기 (5일-19일)
        firstPeriod = {
          year: nextYear,
          month: nextMonth,
          startDay: 5,
          endDay: 19,
          from: `${nextYear}-${String(nextMonth).padStart(2, '0')}-05`,
          to: `${nextYear}-${String(nextMonth).padStart(2, '0')}-19`,
          label: `${nextYear}년 ${nextMonth}월 상반기`,
          period: 'first_half',
        };

        // 다음 달 하반기 (20일-다다음달 4일)
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
          period: 'second_half',
        };
      }
    } else {
      // 일반 구: 1일-15일 상반기, 16일-31일 하반기
      // 9시 0분 이전인지 확인 (9시 0분 0초까지는 9시 이전으로 간주)
      const isBefore9AM =
        currentDay === 1 &&
        (currentHour < 9 || (currentHour === 9 && currentMinute === 0));

      console.log('🔍 Period selection logic:', {
        currentDay,
        currentHour,
        currentMinute,
        isBefore9AM,
        condition: currentDay === 1 && isBefore9AM,
      });

      if (currentDay === 1 && isBefore9AM) {
        // 1일 9시 이전: 현재 달 상반기 + 현재 달 하반기
        // 현재 달 상반기 (1일-15일)
        firstPeriod = {
          year: currentYear,
          month: currentMonth,
          startDay: 1,
          endDay: 15,
          from: `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`,
          to: `${currentYear}-${String(currentMonth).padStart(2, '0')}-15`,
          label: `${currentYear}년 ${currentMonth}월 상반기`,
          period: 'first_half',
        };

        // 현재 달 하반기 (16일-31일)
        const lastDay = new Date(currentYear, currentMonth, 0).getDate();
        secondPeriod = {
          year: currentYear,
          month: currentMonth,
          startDay: 16,
          endDay: lastDay,
          from: `${currentYear}-${String(currentMonth).padStart(2, '0')}-16`,
          to: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(
            lastDay
          ).padStart(2, '0')}`,
          label: `${currentYear}년 ${currentMonth}월 하반기`,
          period: 'second_half',
        };
      } else if (currentDay >= 1 && currentDay <= 15) {
        // 1일 9시 이후 ~ 15일: 현재 달 하반기 + 다음 달 상반기
        // 현재 달 하반기 (16일-31일)
        const lastDay = new Date(currentYear, currentMonth, 0).getDate();
        firstPeriod = {
          year: currentYear,
          month: currentMonth,
          startDay: 16,
          endDay: lastDay,
          from: `${currentYear}-${String(currentMonth).padStart(2, '0')}-16`,
          to: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(
            lastDay
          ).padStart(2, '0')}`,
          label: `${currentYear}년 ${currentMonth}월 하반기`,
          period: 'second_half', // 실제로는 하반기
        };

        // 다음 달 상반기 (1일-15일)
        secondPeriod = {
          year: nextYear,
          month: nextMonth,
          startDay: 1,
          endDay: 15,
          from: `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`,
          to: `${nextYear}-${String(nextMonth).padStart(2, '0')}-15`,
          label: `${nextYear}년 ${nextMonth}월 상반기`,
          period: 'first_half', // 실제로는 상반기
        };
      } else {
        // 16일~31일: 다음 달 상하반기
        // 다음 달 상반기 (1일-15일)
        firstPeriod = {
          year: nextYear,
          month: nextMonth,
          startDay: 1,
          endDay: 15,
          from: `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`,
          to: `${nextYear}-${String(nextMonth).padStart(2, '0')}-15`,
          label: `${nextYear}년 ${nextMonth}월 상반기`,
          period: 'first_half',
        };

        // 다음 달 하반기 (16일-31일)
        const lastDay = new Date(nextYear, nextMonth, 0).getDate();
        secondPeriod = {
          year: nextYear,
          month: nextMonth,
          startDay: 16,
          endDay: lastDay,
          from: `${nextYear}-${String(nextMonth).padStart(2, '0')}-16`,
          to: `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(
            lastDay
          ).padStart(2, '0')}`,
          label: `${nextYear}년 ${nextMonth}월 하반기`,
          period: 'second_half',
        };
      }
    }

    return { firstPeriod, secondPeriod };
  };

  const { firstPeriod, secondPeriod } = getCurrentPeriods();

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
    console.log('🔍 isPeriodAvailable Debug:', {
      periodStartDate,
      currentKoreaDate: koreaDate.toISOString(),
      periodStartDateOnly: periodStartDateOnly.toISOString(),
      daysUntilPeriod,
      isAvailable,
    });

    return isAvailable;
  };

  // 각 기간의 신청 가능 여부
  const isFirstPeriodAvailable = firstPeriod
    ? isPeriodAvailable(firstPeriod.from)
    : false;
  const isSecondPeriodAvailable = secondPeriod
    ? isPeriodAvailable(secondPeriod.from)
    : false;

  // 모든 기간 표시 (신청 가능 여부와 관계없이)
  type PeriodTabInfo = {
    period: 'first_half' | 'second_half';
    data: PeriodInfo;
    isAvailable: boolean;
  };
  const allPeriods: PeriodTabInfo[] = [];
  if (firstPeriod) {
    allPeriods.push({
      period: firstPeriod.period, // 실제 기간 타입 사용
      data: firstPeriod,
      isAvailable: isFirstPeriodAvailable,
    });
  }
  if (secondPeriod) {
    allPeriods.push({
      period: secondPeriod.period, // 실제 기간 타입 사용
      data: secondPeriod,
      isAvailable: isSecondPeriodAvailable,
    });
  }

  // 디버그 로그 추가
  console.log('🔍 HalfPeriodTabs Debug:', {
    districtName,
    periodData,
    firstPeriod,
    secondPeriod,
    allPeriods: allPeriods.length,
    isFirstPeriodAvailable,
    isSecondPeriodAvailable,
  });

  const handlePeriodChange = (period: 'first_half' | 'second_half') => {
    // allPeriods에서 해당 period를 찾아서 실제 기간 정보 사용
    const periodInfo = allPeriods.find((p) => p.period === period);
    if (periodInfo) {
      onPeriodChange(
        periodInfo.period,
        periodInfo.data.year,
        periodInfo.data.month
      );
    } else {
      // fallback: 기존 로직 사용
      if (period === 'first_half' && firstPeriod) {
        onPeriodChange(firstPeriod.period, firstPeriod.year, firstPeriod.month);
      } else if (period === 'second_half' && secondPeriod) {
        onPeriodChange(
          secondPeriod.period,
          secondPeriod.year,
          secondPeriod.month
        );
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6 p-4 bg-white rounded-lg border">
        <div className="text-1 font-medium text-gray-800 mr-4">
          신청 기간을 선택해주세요 :
        </div>

        {/* 모든 기간 표시 (신청 가능 여부와 관계없이) */}
        {allPeriods.map((periodInfo) => (
          <button
            key={periodInfo.period}
            onClick={() => handlePeriodChange(periodInfo.period)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === periodInfo.period
                ? periodInfo.isAvailable
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-400 text-white cursor-pointer'
                : periodInfo.isAvailable
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer'
                : 'bg-gray-50 text-gray-400 hover:bg-gray-100 cursor-pointer'
            }`}
          >
            {periodInfo.data.label}
          </button>
        ))}

        {/* 기간이 없을 때 */}
        {allPeriods.length === 0 && (
          <div className="text-sm text-gray-500">
            현재 신청 가능한 기간이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default HalfPeriodTabs;
