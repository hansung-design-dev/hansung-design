import DateLocationFilter from '@/src/components/ui/datelocationfilter';
import React from 'react';

interface StatusSummary {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
}

interface OrderHeaderSectionProps {
  title?: string;
  statusSummary: StatusSummary;
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  searchLocation: string;
  setSearchLocation: (loc: string) => void;
}

const orderHeaderSection: React.FC<OrderHeaderSectionProps> = ({
  title = '주문내역',
  statusSummary,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  searchLocation,
  setSearchLocation,
}) => {
  return (
    <div className="sm:flex sm:flex-col sm:gap-2 sm:px-0">
      <h2 className="lg:text-2.25 md:text-1.75 font-500 mb-3 sm:text-2">
        {title}
      </h2>
      <div className="lg:text-sm md:text-0.75 text-gray-500 mb-6 ">
        *송출이 시작된 주문은 취소/파일 교체가 불가하며,{' '}
        <br className="lg:hidden md:hidden sm:block" /> 신청후 3일 이후
        상태에서는 변경이 불가합니다.
      </div>
      {/* 주문 요약 정보 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg text-center">
          <div className="text-lg font-bold">{statusSummary.total}</div>
          <div className="text-sm text-gray-600">전체</div>
        </div>
        <div className="bg-white p-4 rounded-lg text-center">
          <div className="text-lg font-bold text-blue-600">
            {statusSummary.pending}
          </div>
          <div className="text-sm text-gray-600">결제대기</div>
        </div>
        <div className="bg-white p-4 rounded-lg text-center">
          <div className="text-lg font-bold text-green-600">
            {statusSummary.confirmed}
          </div>
          <div className="text-sm text-gray-600">결제완료</div>
        </div>
        <div className="bg-white p-4 rounded-lg text-center">
          <div className="text-lg font-bold text-orange-600">
            {statusSummary.completed}
          </div>
          <div className="text-sm text-gray-600">완료</div>
        </div>
      </div>
      {/* 날짜/행정동 필터 */}
      <div className="flex flex-col gap-2 items-center mb-6">
        <DateLocationFilter
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          searchLocation={searchLocation}
          setSearchLocation={setSearchLocation}
          showStartCalendar={false}
          setShowStartCalendar={() => {}}
          showEndCalendar={false}
          setShowEndCalendar={() => {}}
        />
      </div>
    </div>
  );
};

export default orderHeaderSection;
