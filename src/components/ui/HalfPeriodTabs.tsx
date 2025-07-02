'use client';

import React from 'react';

interface HalfPeriodTabsProps {
  selectedPeriod: 'first_half' | 'second_half';
  onPeriodChange: (period: 'first_half' | 'second_half') => void;
  firstHalfFrom: string;
  firstHalfTo: string;
  secondHalfFrom: string;
  secondHalfTo: string;
  year?: number;
}

const HalfPeriodTabs: React.FC<HalfPeriodTabsProps> = ({
  selectedPeriod,
  onPeriodChange,
  firstHalfFrom,
  firstHalfTo,
  secondHalfFrom,
  secondHalfTo,
  year = 2025,
}) => {
  // 날짜에서 월 추출
  const getMonthFromDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.getMonth() + 1; // getMonth()는 0부터 시작하므로 +1
  };

  // 날짜에서 일 추출
  const getDayFromDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.getDate();
  };

  // 월의 마지막 날 계산
  const getLastDayOfMonth = (dateString: string) => {
    const date = new Date(dateString);
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstHalfMonth = getMonthFromDate(firstHalfFrom);
  const secondHalfMonth = getMonthFromDate(secondHalfFrom);

  const firstHalfStartDay = getDayFromDate(firstHalfFrom);
  const firstHalfEndDay = getDayFromDate(firstHalfTo);
  const secondHalfStartDay = getDayFromDate(secondHalfFrom);
  const secondHalfEndDay = getLastDayOfMonth(secondHalfTo);

  return (
    <div className="flex items-center gap-2 mb-6 p-4 bg-white rounded-lg border">
      <div className="text-sm font-medium text-gray-700 mr-4">신청기간:</div>

      {/* 상반기 탭 */}
      <button
        onClick={() => onPeriodChange('first_half')}
        className={`hover:cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          selectedPeriod === 'first_half'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {year}년 {firstHalfMonth}월 상반기 (0{firstHalfMonth}.
        {firstHalfStartDay}-{firstHalfEndDay})
      </button>

      {/* 하반기 탭 */}
      <button
        onClick={() => onPeriodChange('second_half')}
        className={`hover:cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          selectedPeriod === 'second_half'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {year}년 {secondHalfMonth}월 하반기 (0{secondHalfMonth}.
        {secondHalfStartDay}-{secondHalfEndDay})
      </button>
    </div>
  );
};

export default HalfPeriodTabs;
