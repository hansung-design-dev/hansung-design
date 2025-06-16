'use client';

import { useState } from 'react';

interface CalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  onClose: () => void;
}

export default function Calendar({
  selectedDate,
  onDateSelect,
  onClose,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    const date = selectedDate
      ? new Date(selectedDate.replace(/\./g, '-'))
      : new Date();
    return date;
  });

  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  const generateCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];
    const startPadding = firstDay.getDay();

    // Add padding days from previous month
    for (let i = 0; i < startPadding; i++) {
      const prevDate = new Date(year, month, -startPadding + i + 1);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
      });
    }

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Add padding days from next month if needed
    const remainingDays = 42 - days.length; // 6 rows * 7 days = 42
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const handleDateClick = (date: Date) => {
    onDateSelect(formatDate(date));
    onClose();
  };

  const calendarDays = generateCalendarDays(currentDate);

  const getButtonStyles = (dayInfo: {
    date: Date;
    isCurrentMonth: boolean;
  }) => {
    if (!dayInfo.isCurrentMonth) return 'text-gray-400';

    const currentDateStr = formatDate(dayInfo.date);
    if (selectedDate === currentDateStr) {
      return 'bg-black text-white hover:bg-gray-800';
    }

    return 'hover:bg-gray-100';
  };

  return (
    <div className="absolute top-full left-0 z-10 mt-2 bg-white rounded-lg shadow-lg p-4 w-[19.25rem]">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="text-gray-600 hover:text-black"
        >
          ←
        </button>
        <span className="font-medium">
          {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
        </span>
        <button
          onClick={handleNextMonth}
          className="text-gray-600 hover:text-black"
        >
          →
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekdays.map((day, index) => (
          <div key={index} className="text-center text-gray-600 text-sm">
            {day}
          </div>
        ))}
      </div>

      {/* Date Grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((dayInfo, index) => (
          <button
            key={index}
            onClick={() => handleDateClick(dayInfo.date)}
            className={`
              aspect-square flex items-center justify-center rounded text-sm
              transition-colors duration-200
              ${getButtonStyles(dayInfo)}
            `}
          >
            {dayInfo.date.getDate()}
          </button>
        ))}
      </div>
    </div>
  );
}
