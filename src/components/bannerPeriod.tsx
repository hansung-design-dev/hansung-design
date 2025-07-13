import React from 'react';

interface BannerPeriodProps {
  first_half_from: string; // ISO date string
  first_half_to: string;
  second_half_from: string;
  second_half_to: string;
}

function formatDate(dateStr: string) {
  // YYYY-MM-DD → MM.DD
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

const BannerPeriod: React.FC<BannerPeriodProps> = ({
  first_half_from,
  first_half_to,
  second_half_from,
  second_half_to,
}) => {
  // 디버깅용 로그
  console.log('🔍 BannerPeriod props:', {
    first_half_from,
    first_half_to,
    second_half_from,
    second_half_to,
  });

  // 날짜 유효성 검사
  const isValidDate = (dateStr: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return !isNaN(d.getTime());
  };

  // 모든 날짜가 유효한지 확인
  const allDatesValid = [
    first_half_from,
    first_half_to,
    second_half_from,
    second_half_to,
  ].every(isValidDate);

  if (!allDatesValid) {
    console.warn('⚠️ BannerPeriod: 일부 날짜가 유효하지 않습니다:', {
      first_half_from: isValidDate(first_half_from),
      first_half_to: isValidDate(first_half_to),
      second_half_from: isValidDate(second_half_from),
      second_half_to: isValidDate(second_half_to),
    });
  }

  return (
    <div className="flex gap-3 text-1 font-500 text-gray-600">
      <div>신청일</div>
      <div className="flex flex-col gap-1">
        <span>
          1차: {formatDate(first_half_from)} ~ {formatDate(first_half_to)}
        </span>
        <span>
          2차: {formatDate(second_half_from)} ~ {formatDate(second_half_to)}
        </span>
      </div>
    </div>
  );
};

export default BannerPeriod;
