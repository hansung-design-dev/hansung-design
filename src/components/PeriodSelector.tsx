'use client';
import { useState, useEffect } from 'react';
import { Button } from './button/button';

interface PeriodSelectorProps {
  halfPeriod?: 'first_half' | 'second_half';
  onPeriodChange: (
    year: number,
    month: number,
    halfPeriod: 'first_half' | 'second_half'
  ) => void;
  disabled?: boolean;
}

export default function PeriodSelector({
  halfPeriod,
  onPeriodChange,
  disabled = false,
}: PeriodSelectorProps) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // 다음달 계산
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

  const [period, setPeriod] = useState<'first_half' | 'second_half'>(
    halfPeriod || 'first_half'
  );

  useEffect(() => {
    onPeriodChange(nextYear, nextMonth, period);
  }, [nextYear, nextMonth, period, onPeriodChange]);

  const getPeriodText = (period: 'first_half' | 'second_half') => {
    return period === 'first_half' ? '상반기 (1-15일)' : '하반기 (16-31일)';
  };

  return (
    <div className="flex flex-col gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div className="text-sm font-semibold text-gray-700">게시 기간 선택</div>

      <div className="text-sm text-gray-600">
        선택 가능한 기간:{' '}
        <span className="font-semibold">
          {nextYear}년 {nextMonth}월
        </span>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-600 min-w-[3rem]">기간:</label>
        <div className="flex gap-2">
          <Button
            size="xs"
            variant={period === 'first_half' ? 'filledBlack' : 'outlinedBlack'}
            onClick={() => setPeriod('first_half')}
            disabled={disabled}
            className="text-xs"
          >
            상반기
          </Button>
          <Button
            size="xs"
            variant={period === 'second_half' ? 'filledBlack' : 'outlinedBlack'}
            onClick={() => setPeriod('second_half')}
            disabled={disabled}
            className="text-xs"
          >
            하반기
          </Button>
        </div>
      </div>

      <div className="text-xs text-gray-500 mt-2">
        선택된 기간: {nextYear}년 {nextMonth}월 {getPeriodText(period)}
      </div>
    </div>
  );
}
