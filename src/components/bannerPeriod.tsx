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
  return (
    <div>
      신청일
      <br />
      1차: {formatDate(first_half_from)} ~ {formatDate(first_half_to)}
      <br />
      2차: {formatDate(second_half_from)} ~ {formatDate(second_half_to)}
    </div>
  );
};

export default BannerPeriod;
