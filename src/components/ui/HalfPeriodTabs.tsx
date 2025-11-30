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
  // 현재 날짜에 따라 표시할 기간 결정
  // 1일~15일: 현재 달 하반기 + 다음 달 상반기
  // 16일~31일: 다음 달 상하반기
  const getCurrentPeriods = () => {
    let firstPeriod: PeriodInfo | null = null;
    let secondPeriod: PeriodInfo | null = null;

    console.log('🔍 Calculating periods based on current date');

    const now = new Date();
    const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000); // UTC+9 (한국시간)

    const currentYear = koreaTime.getFullYear();
    const currentMonth = koreaTime.getMonth() + 1;
    const currentDay = koreaTime.getDate();

    // 다음 달 계산
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

    console.log('🔍 Current date calculation:', {
      currentYear,
      currentMonth,
      currentDay,
      nextYear,
      nextMonth,
      koreaTime: koreaTime.toISOString(),
    });

    // 마포구, 강북구: 특별한 기간 (5일-19일 상반기, 20일-다음달 4일 하반기)
    if (districtName === '마포구' || districtName === '강북구') {
      if (currentDay >= 1 && currentDay <= 4) {
        // 1일~4일: 현재 달 하반기 + 다음 달 상반기
        // 현재 달 하반기 (20일-다음달 4일)
        firstPeriod = {
          year: currentYear,
          month: currentMonth,
          startDay: 20,
          endDay: 30,
          from: `${currentYear}-${String(currentMonth).padStart(2, '0')}-20`,
          to: `${nextYear}-${String(nextMonth).padStart(2, '0')}-04`,
          label: `${currentYear}년 ${currentMonth}월 하반기`,
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
        };
      }
    } else {
      // 일반 구: 1일-15일 상반기, 16일-31일 하반기
      const currentHour = koreaTime.getHours();
      const isBefore9AM = currentDay === 1 && currentHour < 9;
      
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
        };

        // 현재 달 하반기 (16일-31일)
        const lastDay = new Date(currentYear, currentMonth, 0).getDate();
        secondPeriod = {
          year: currentYear,
          month: currentMonth,
          startDay: 16,
          endDay: lastDay,
          from: `${currentYear}-${String(currentMonth).padStart(2, '0')}-16`,
          to: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
          label: `${currentYear}년 ${currentMonth}월 하반기`,
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
          to: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
          label: `${currentYear}년 ${currentMonth}월 하반기`,
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
        };

        // 다음 달 하반기 (16일-31일)
        const lastDay = new Date(nextYear, nextMonth, 0).getDate();
        secondPeriod = {
          year: nextYear,
          month: nextMonth,
          startDay: 16,
          endDay: lastDay,
          from: `${nextYear}-${String(nextMonth).padStart(2, '0')}-16`,
          to: `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
          label: `${nextYear}년 ${nextMonth}월 하반기`,
        };
      }
    }

    return { firstPeriod, secondPeriod };
  };

  const { firstPeriod, secondPeriod } = getCurrentPeriods();

  // 기간 시작일 2일 전까지 신청 가능 여부 확인
  const isPeriodAvailable = (periodStartDate: string) => {
    const now = new Date();
    
    // 기간 시작일 설정
    // periodStartDate는 "YYYY-MM-DD" 형식
    const periodStart = new Date(`${periodStartDate}T00:00:00+09:00`);
    
    // 현재 시간을 한국시간으로 변환
    const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const koreaDate = new Date(koreaTime.getFullYear(), koreaTime.getMonth(), koreaTime.getDate());
    const periodStartDateOnly = new Date(periodStart.getFullYear(), periodStart.getMonth(), periodStart.getDate());
    
    // 날짜 차이 계산 (일 단위)
    const daysUntilPeriod = Math.ceil(
      (periodStartDateOnly.getTime() - koreaDate.getTime()) / (1000 * 60 * 60 * 24)
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
  const allPeriods = [];
  if (firstPeriod) {
    allPeriods.push({ 
      period: 'first_half' as const, 
      data: firstPeriod, 
      isAvailable: isFirstPeriodAvailable 
    });
  }
  if (secondPeriod) {
    allPeriods.push({ 
      period: 'second_half' as const, 
      data: secondPeriod, 
      isAvailable: isSecondPeriodAvailable 
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
    if (period === 'first_half' && firstPeriod) {
      onPeriodChange('first_half', firstPeriod.year, firstPeriod.month);
    } else if (period === 'second_half' && secondPeriod) {
      onPeriodChange('second_half', secondPeriod.year, secondPeriod.month);
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
