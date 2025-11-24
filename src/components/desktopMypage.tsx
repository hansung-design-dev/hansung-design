import React from 'react';
import MypageContainer from './mypageContainer';
import DateLocationFilter from '@/src/components/ui/datelocationfilter';

interface Props {
  activeTab: string;
  userName: string;
}

// const sampleItems = Array(5)
//   .fill(null)
//   .map((_, index) => ({
//     id: index + 1,
//     title: '울림픽대교 남단사거리 앞',
//     subtitle: '(남단 유수지앞)',
//     location: '방이동',
//     status: index < 3 ? '진행중' : '완료',
//     date: '2024.03.06',
//   }));

export default function DesktopMyPage({ activeTab, userName }: Props) {
  return (
    <MypageContainer activeTab={activeTab}>
      {/* 사용자 정보 */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row lg:items-start md:items-center lg:justify-between lg:gap-6 md:gap-2">
          <h2 className="md:text-1 lg:text-1 font-500">{userName}님</h2>
          <div className="grid grid-cols-2 gap-4">
            {/* 주문내역 카드 */}
            <div className="flex items-center rounded-lg p-4 md:p-6 hover:bg-transparent">
              <div className="w-12 h-12 md:w-10 md:h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <img
                  src="/svg/document.svg"
                  alt="주문내역"
                  className="w-6 h-6 object-contain"
                />
              </div>
              <div className="flex flex-col pl-4 md:pl-6">
                <div className="lg:text-1 md:text-1 font-medium mb-2">
                  주문내역
                </div>
                <div className="lg:text-1.5 md:text-1.6 font-bold">3건</div>
              </div>
            </div>
            {/* 상담내역 카드 */}
            <div className="flex items-center rounded-lg p-4 md:p-6 hover:bg-transparent">
              <div className="w-12 h-12 md:w-10 md:h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <img
                  src="/svg/headphones.svg"
                  alt="상담내역"
                  className="w-6 h-6 object-contain"
                />
              </div>
              <div className="flex flex-col pl-4 md:pl-6">
                <div className="lg:text-1 md:text-1 font-medium mb-2">
                  상담내역
                </div>
                <div className="lg:text-1.5 md:text-1.6 font-bold">1건</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 필터 리스트 */}
      <div className="">
        <h2 className="lg:text-2 md:text-1.75 font-500 pt-3">주문내역</h2>

        <div className="lg:text-sm md:text-0.75 text-gray-500 mb-6">
          *송출이 시작된 주문은 취소/파일 교체가 불가하며, 신청후 3일 이후
          상태에서는 변경이 불가합니다.
        </div>

        {/* Filter Row */}
        <div className="flex flex-col gap-2 lg:items-start md:items-start mb-6 px-0 ">
          <DateLocationFilter
            startDate="2025.02.06"
            endDate="2025.03.06"
            setStartDate={() => {}}
            setEndDate={() => {}}
            searchLocation="방이동"
            setSearchLocation={() => {}}
            showStartCalendar={false}
            setShowStartCalendar={() => {}}
            showEndCalendar={false}
            setShowEndCalendar={() => {}}
          />
          {/* <CategoryFilter selectedCategory="전체" onCategoryChange={() => {}} /> */}
        </div>
      </div>
    </MypageContainer>
  );
}
