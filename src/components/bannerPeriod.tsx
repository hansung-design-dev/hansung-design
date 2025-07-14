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

  // 현재 날짜 (한국 시간)
  const now = new Date();
  const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000); // UTC+9

  // 기간 슬라이딩 로직
  const getCurrentPeriods = () => {
    const firstHalfStart = new Date(first_half_from);
    const firstHalfEnd = new Date(first_half_to);
    const secondHalfStart = new Date(second_half_from);
    const secondHalfEnd = new Date(second_half_to);

    // 현재 날짜가 첫 번째 반기 시작일 이전인 경우
    if (koreaTime < firstHalfStart) {
      return {
        firstPeriod: { from: first_half_from, to: first_half_to, label: '1차' },
        secondPeriod: {
          from: second_half_from,
          to: second_half_to,
          label: '2차',
        },
      };
    }

    // 현재 날짜가 첫 번째 반기 기간 내인 경우
    if (koreaTime >= firstHalfStart && koreaTime <= firstHalfEnd) {
      return {
        firstPeriod: { from: first_half_from, to: first_half_to, label: '1차' },
        secondPeriod: {
          from: second_half_from,
          to: second_half_to,
          label: '2차',
        },
      };
    }

    // 현재 날짜가 첫 번째 반기 종료일 이후이고 두 번째 반기 시작일 이전인 경우
    if (koreaTime > firstHalfEnd && koreaTime < secondHalfStart) {
      return {
        firstPeriod: {
          from: second_half_from,
          to: second_half_to,
          label: '1차',
        },
        secondPeriod: null,
      };
    }

    // 현재 날짜가 두 번째 반기 기간 내인 경우
    if (koreaTime >= secondHalfStart && koreaTime <= secondHalfEnd) {
      return {
        firstPeriod: {
          from: second_half_from,
          to: second_half_to,
          label: '1차',
        },
        secondPeriod: null,
      };
    }

    // 현재 날짜가 모든 기간을 지난 경우
    return {
      firstPeriod: null,
      secondPeriod: null,
    };
  };

  const currentPeriods = getCurrentPeriods();

  // 표시할 기간이 없는 경우
  if (!currentPeriods.firstPeriod && !currentPeriods.secondPeriod) {
    return (
      <div className="flex gap-3 text-1 font-500 text-gray-600">
        <div>신청일</div>
        <div className="flex flex-col gap-1">
          <span className="text-red-500">신청 기간이 종료되었습니다.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 text-1 font-500 text-gray-600">
      <div>신청일</div>
      <div className="flex flex-col gap-1">
        {currentPeriods.firstPeriod && (
          <span>
            {currentPeriods.firstPeriod.label}:{' '}
            {formatDate(currentPeriods.firstPeriod.from)} ~{' '}
            {formatDate(currentPeriods.firstPeriod.to)}
          </span>
        )}
        {currentPeriods.secondPeriod && (
          <span>
            {currentPeriods.secondPeriod.label}:{' '}
            {formatDate(currentPeriods.secondPeriod.from)} ~{' '}
            {formatDate(currentPeriods.secondPeriod.to)}
          </span>
        )}
      </div>
    </div>
  );
};

export default BannerPeriod;
