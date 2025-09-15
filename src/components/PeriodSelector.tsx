'use client';
import { useState, useEffect, useCallback } from 'react';
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
}

export default function PeriodSelector({
  halfPeriod,
  selectedYear,
  selectedMonth,
  onPeriodChange,
  disabled = false,
}: PeriodSelectorProps) {
  // 카트 아이템에 저장된 년월이 있으면 사용, 없으면 현재 날짜 기준으로 계산
  const now = new Date();
  const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000); // UTC+9 (한국시간)
  const currentYear = koreaTime.getFullYear();
  const currentMonth = koreaTime.getMonth() + 1;
  const currentDay = koreaTime.getDate();

  // 카트 아이템에 저장된 년월이 있으면 사용
  let displayYear = selectedYear;
  let displayMonth = selectedMonth;

  // 저장된 년월이 없으면 현재 날짜에 따라 올바른 년월 설정
  if (!displayYear || !displayMonth) {
    if (currentDay <= 12) {
      // 현재가 12일 이전이면 이번달 상반기 신청 가능
      displayYear = currentYear;
      displayMonth = currentMonth;
    } else {
      // 현재가 13일 이후면 다음달로 설정
      const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      displayYear = currentMonth === 12 ? currentYear + 1 : currentYear;
      displayMonth = nextMonth;
    }
  }

  // 디버깅 로그 추가
  console.log('🔍 PeriodSelector Debug:', {
    selectedYear,
    selectedMonth,
    halfPeriod,
    displayYear,
    displayMonth,
    currentYear,
    currentMonth,
    currentDay,
  });

  const [period, setPeriod] = useState<'first_half' | 'second_half'>(
    halfPeriod || 'first_half'
  );

  // onPeriodChange를 useCallback으로 메모이제이션 (무한루프 방지)
  const memoizedOnPeriodChange = useCallback(
    (year: number, month: number, halfPeriod: 'first_half' | 'second_half') => {
      onPeriodChange(year, month, halfPeriod);
    },
    [] // 빈 의존성 배열로 변경 - 무한루프 방지
  );

  // 초기 로드 시에만 호출 (무한루프 방지)
  useEffect(() => {
    memoizedOnPeriodChange(displayYear, displayMonth, period);
  }, []); // 빈 의존성 배열로 변경 - 컴포넌트 마운트 시에만 실행

  const getPeriodText = (period: 'first_half' | 'second_half') => {
    return period === 'first_half' ? '상반기 (1-15일)' : '하반기 (16-31일)';
  };

  return (
    <div className="flex flex-col gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div className="text-sm font-semibold text-gray-700">게시 기간 선택</div>

      <div className="text-sm text-gray-600">
        <span className="font-semibold">
          {displayYear}년 {displayMonth}월
        </span>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-600 min-w-[3rem]">기간:</label>
        <div className="flex gap-2">
          <Button
            size="xs"
            variant={period === 'first_half' ? 'filledBlack' : 'outlinedBlack'}
            onClick={() => {
              setPeriod('first_half');
              memoizedOnPeriodChange(displayYear, displayMonth, 'first_half');
            }}
            disabled={disabled}
            className="text-xs"
          >
            상반기
          </Button>
          <Button
            size="xs"
            variant={period === 'second_half' ? 'filledBlack' : 'outlinedBlack'}
            onClick={() => {
              setPeriod('second_half');
              memoizedOnPeriodChange(displayYear, displayMonth, 'second_half');
            }}
            disabled={disabled}
            className="text-xs"
          >
            하반기
          </Button>
        </div>
      </div>

      <div className="text-xs text-gray-500 mt-2">
        선택된 기간: {displayYear}년 {displayMonth}월 {getPeriodText(period)}
      </div>
    </div>
  );
}
