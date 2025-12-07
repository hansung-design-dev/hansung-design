'use client';
import { useState, useEffect, useRef } from 'react';
import { Button } from './button/button';

interface PeriodSelectorProps {
  halfPeriod?: 'first_half' | 'second_half';
  selectedYear?: number;
  selectedMonth?: number;
  onPeriodChange: (
    year: number,
    month: number,
    halfPeriod: 'first_half' | 'second_half'
  ) => void;
  disabled?: boolean;
  districtName?: string; // 구 이름 추가
}

interface PeriodInfo {
  year: number;
  month: number;
  startDay: number;
  endDay: number;
  from: string;
  to: string;
  label: string;
  period: 'first_half' | 'second_half';
}

export default function PeriodSelector({
  halfPeriod,
  selectedYear,
  selectedMonth,
  onPeriodChange,
  disabled = false,
  districtName,
}: PeriodSelectorProps) {
  // HalfPeriodTabs와 동일한 로직: 현재 날짜에 따라 표시할 기간 결정
  const getCurrentPeriods = (): {
    firstPeriod: PeriodInfo | null;
    secondPeriod: PeriodInfo | null;
  } => {
    let firstPeriod: PeriodInfo | null = null;
    let secondPeriod: PeriodInfo | null = null;

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
        // 20일~31일: 다음 달 상하반기
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

  // 기간 시작일 2일 전까지 신청 가능 여부 확인
  const isPeriodAvailable = (periodStartDate: string): boolean => {
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

    return isAvailable;
  };

  // 현재 날짜에 따라 표시할 기간 가져오기
  const { firstPeriod, secondPeriod } = getCurrentPeriods();

  // 신청 가능한 기간만 표시 (비활성화된 기간은 제외)
  type PeriodTabInfo = {
    period: 'first_half' | 'second_half';
    data: PeriodInfo;
    isAvailable: boolean;
  };
  const allPeriods: PeriodTabInfo[] = [];
  if (firstPeriod) {
    const isAvailable = isPeriodAvailable(firstPeriod.from);
    // 신청 가능한 기간만 표시 (2일 전까지)
    if (isAvailable) {
      allPeriods.push({
        period: firstPeriod.period,
        data: firstPeriod,
        isAvailable,
      });
    }
  }
  if (secondPeriod) {
    const isAvailable = isPeriodAvailable(secondPeriod.from);
    // 신청 가능한 기간만 표시 (2일 전까지)
    if (isAvailable) {
      allPeriods.push({
        period: secondPeriod.period,
        data: secondPeriod,
        isAvailable,
      });
    }
  }

  // 선택된 기간 찾기 (props로 전달된 값이 있으면 우선 사용)
  const findSelectedPeriod = (): PeriodTabInfo | null => {
    if (selectedYear && selectedMonth && halfPeriod) {
      // props로 전달된 값이 있으면 해당 기간 찾기
      const found = allPeriods.find(
        (p) =>
          p.data.year === selectedYear &&
          p.data.month === selectedMonth &&
          p.period === halfPeriod
      );
      if (found) return found;
    }
    // 없으면 첫 번째 활성화된 기간 또는 첫 번째 기간
    return (
      allPeriods.find((p) => p.isAvailable) || allPeriods[0] || null
    );
  };

  const selectedPeriodInfo = findSelectedPeriod();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodTabInfo | null>(
    selectedPeriodInfo
  );

  const isInitialMount = useRef(true);

  // districtName이나 props가 변경되면 선택된 기간 업데이트
  useEffect(() => {
    const newSelectedPeriod = findSelectedPeriod();
    if (newSelectedPeriod) {
      setSelectedPeriod(newSelectedPeriod);
      // 초기 마운트 시에만 onPeriodChange 호출 (무한루프 방지)
      if (isInitialMount.current) {
        isInitialMount.current = false;
        onPeriodChange(
          newSelectedPeriod.data.year,
          newSelectedPeriod.data.month,
          newSelectedPeriod.period
        );
      }
    }
  }, [districtName, selectedYear, selectedMonth, halfPeriod]);

  // 기간 텍스트 생성 (마포구/강북구와 일반 구 구분)
  const getPeriodDisplayText = (periodInfo: PeriodInfo): string => {
    if (districtName === '마포구' || districtName === '강북구') {
      if (periodInfo.period === 'first_half') {
        return `${periodInfo.year}년 ${periodInfo.month}월 상반기(${periodInfo.startDay}일-${periodInfo.endDay}일)`;
      } else {
        // 하반기는 다음달까지 포함
        const nextMonth = periodInfo.month === 12 ? 1 : periodInfo.month + 1;
        const nextYear = periodInfo.month === 12 ? periodInfo.year + 1 : periodInfo.year;
        return `${periodInfo.year}년 ${periodInfo.month}월 하반기(${periodInfo.startDay}일-${nextYear}년 ${nextMonth}월 4일)`;
      }
    } else {
      if (periodInfo.period === 'first_half') {
        return `${periodInfo.year}년 ${periodInfo.month}월 상반기(${periodInfo.startDay}일-${periodInfo.endDay}일)`;
      } else {
        const lastDay = new Date(periodInfo.year, periodInfo.month, 0).getDate();
        return `${periodInfo.year}년 ${periodInfo.month}월 하반기(${periodInfo.startDay}일-${lastDay}일)`;
      }
    }
  };

  // 첫 번째 기간과 두 번째 기간 찾기
  const firstPeriodInfo = allPeriods[0] || null;
  const secondPeriodInfo = allPeriods[1] || null;

  // 상반기 버튼 클릭 시: 두 번째 기간 선택 (일반적으로 다음 달 상반기)
  // 하반기 버튼 클릭 시: 첫 번째 기간 선택 (일반적으로 현재 달 하반기)
  const handleFirstHalfClick = () => {
    if (secondPeriodInfo && !disabled) {
      setSelectedPeriod(secondPeriodInfo);
      onPeriodChange(
        secondPeriodInfo.data.year,
        secondPeriodInfo.data.month,
        secondPeriodInfo.period
      );
    }
  };

  const handleSecondHalfClick = () => {
    if (firstPeriodInfo && !disabled) {
      setSelectedPeriod(firstPeriodInfo);
      onPeriodChange(
        firstPeriodInfo.data.year,
        firstPeriodInfo.data.month,
        firstPeriodInfo.period
      );
    }
  };

  // 선택된 기간이 첫 번째인지 두 번째인지 확인
  const isFirstPeriodSelected =
    selectedPeriod &&
    firstPeriodInfo &&
    selectedPeriod.data.year === firstPeriodInfo.data.year &&
    selectedPeriod.data.month === firstPeriodInfo.data.month &&
    selectedPeriod.period === firstPeriodInfo.period;

  const isSecondPeriodSelected =
    selectedPeriod &&
    secondPeriodInfo &&
    selectedPeriod.data.year === secondPeriodInfo.data.year &&
    selectedPeriod.data.month === secondPeriodInfo.data.month &&
    selectedPeriod.period === secondPeriodInfo.period;

  // 디버깅 로그
  console.log('🔍 PeriodSelector Debug:', {
    districtName,
    firstPeriodInfo: firstPeriodInfo
      ? {
          period: firstPeriodInfo.period,
          label: firstPeriodInfo.data.label,
          isAvailable: firstPeriodInfo.isAvailable,
          from: firstPeriodInfo.data.from,
        }
      : null,
    secondPeriodInfo: secondPeriodInfo
      ? {
          period: secondPeriodInfo.period,
          label: secondPeriodInfo.data.label,
          isAvailable: secondPeriodInfo.isAvailable,
          from: secondPeriodInfo.data.from,
        }
      : null,
    selectedPeriod: selectedPeriod
      ? {
          period: selectedPeriod.period,
          label: selectedPeriod.data.label,
          isAvailable: selectedPeriod.isAvailable,
        }
      : null,
  });

  return (
    <div className="flex flex-col gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div className="text-sm font-semibold text-gray-700">게시 기간 선택</div>

      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-600 min-w-[3rem]">기간:</label>
        <div className="flex gap-2">
          {/* 상반기 버튼: 두 번째 기간 선택 (있을 때만 표시) */}
          {secondPeriodInfo && (
            <Button
              size="xs"
              variant={isSecondPeriodSelected ? 'filledBlack' : 'outlinedBlack'}
              onClick={handleFirstHalfClick}
              disabled={disabled}
              className="text-xs"
            >
              상반기
            </Button>
          )}
          {/* 하반기 버튼: 첫 번째 기간 선택 (있을 때만 표시) */}
          {firstPeriodInfo && (
            <Button
              size="xs"
              variant={isFirstPeriodSelected ? 'filledBlack' : 'outlinedBlack'}
              onClick={handleSecondHalfClick}
              disabled={disabled}
              className="text-xs"
            >
              하반기
            </Button>
          )}
        </div>
      </div>

      {selectedPeriod && (
        <div className="text-xs text-gray-500 mt-2">
          선택된 기간: {getPeriodDisplayText(selectedPeriod.data)}
        </div>
      )}
    </div>
  );
}
