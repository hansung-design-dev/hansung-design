'use client';

import { useState } from 'react';
import Calendar from './Calendar';
import Image from 'next/image';
interface ListItem {
  id: number;
  title: string;
  subtitle?: string;
  location?: string;
  status: string;
  date?: string;
  category?: string;
  price?: number;
}

interface FilterableListProps {
  items: ListItem[];
  onItemSelect?: (selectedItems: number[]) => void;
  // showDateFilter?: boolean;
  // showLocationFilter?: boolean;
  showCategoryFilter?: boolean;
}

const FilterableList = ({
  items,
  onItemSelect,
  // showDateFilter = true,
  // showLocationFilter = true,
  showCategoryFilter = true,
}: FilterableListProps) => {
  const [startDate, setStartDate] = useState('2025.02.06');
  const [endDate, setEndDate] = useState('2025.03.06');
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  const categories = [
    '전체',
    '공공디자인',
    'LED전자게시대',
    '현수막',
    '디지털사이니지',
  ];

  // const handleSelectAll = (checked: boolean) => {
  //   if (checked) {
  //     setSelectedItems(items.map((item) => item.id));
  //   } else {
  //     setSelectedItems([]);
  //   }
  // };

  const handleSelectItem = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
    }
  };

  if (onItemSelect) {
    onItemSelect(selectedItems);
  }

  return (
    <div className="w-full rounded-lg flex flex-col px-[3rem]">
      <div>
        <h2 className="text-1.25 font-500 mb-2">주문내역</h2>
        <p className="text-gray-600 text-1.125 font-300 mb-6">
          *생산이 시작된 주문은 취소/파일 교체가 불가하며, 제품 발송 - 출고완료
          상태에서는 배송 방법 변경이 불가합니다.
        </p>
      </div>

      {/* Date and Location Filters */}
      <div className="bg-[#F5F5F5] p-8 rounded-lg mb-6 w-[65.5rem] h-[6rem]">
        <div className="flex flex-wrap gap-16 justify-between">
          <div className="">
            <div className="text-gray-600 mb-2">주문일</div>
            <div className="flex items-center justify-around gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={startDate}
                  onClick={() => {
                    setShowStartCalendar(true);
                    setShowEndCalendar(false);
                  }}
                  readOnly
                  className="lg:w-[6rem]  border border-gray-200 rounded-lg px-[1.5rem] py-[1.1rem] pr-10 cursor-pointer"
                  placeholder="YYYY.MM.DD"
                />
                <button
                  onClick={() => {
                    setShowStartCalendar(true);
                    setShowEndCalendar(false);
                  }}
                  className="absolute right-5 top-1/2 -translate-y-1/2"
                >
                  <Image
                    src="/svg/calendar.svg"
                    width={20}
                    height={20}
                    alt="calender"
                  />
                </button>
                {showStartCalendar && (
                  <Calendar
                    selectedDate={startDate}
                    onDateSelect={(date) => setStartDate(date)}
                    onClose={() => setShowStartCalendar(false)}
                  />
                )}
              </div>
              <div className="text-1.25 font-500 px-[2rem]">~</div>
              <div className="relative ">
                <input
                  type="text"
                  value={endDate}
                  onClick={() => {
                    setShowEndCalendar(true);
                    setShowStartCalendar(false);
                  }}
                  readOnly
                  className="lg:w-[6rem] border border-gray-200 rounded-lg px-[1.5rem] py-[1.1rem] pr-10 cursor-pointer placeholder:text-1.25 placeholder:text-gray-400"
                  placeholder="YYYY.MM.DD"
                />
                <button
                  onClick={() => {
                    setShowEndCalendar(true);
                    setShowStartCalendar(false);
                  }}
                  className="absolute right-6 top-1/2 -translate-y-1/2"
                >
                  <Image
                    src="/svg/calendar.svg"
                    width={20}
                    height={20}
                    alt="calender"
                  />
                </button>
                {showEndCalendar && (
                  <Calendar
                    selectedDate={endDate}
                    onDateSelect={(date) => setEndDate(date)}
                    onClose={() => setShowEndCalendar(false)}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="">
            <div className="text-gray-600 mb-2">광고위치</div>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="border border-gray-200 rounded-lg w-[16rem] px-[1.5rem] py-[1.1rem]"
                placeholder="위치를 입력해보세요. ex.송파구"
              />
              <button className="w-[5.75rem] px-[1.5rem] py-[1rem] bg-black text-white rounded-lg hover:bg-gray-800">
                조회
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Buttons */}
      {showCategoryFilter && (
        <div className="flex flex-wrap gap-2 mb-6 text-1 font-500 border-1 border-gray-200 rounded-lg">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full border ${
                selectedCategory === category
                  ? 'bg-black text-white border-black w-[7.5rem] py-[1rem]'
                  : 'border-gray-200 text-gray-600 hover:border-gray-400 w-[7.5rem] py-[1rem] border-[0.1rem]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      <div className="border-t border-gray-200">
        {items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-10 py-4 px-6 border-b border-gray-200 items-center"
          >
            <div className="col-span-4">
              <div className="flex gap-3 font-500 text-1.25 text-black">
                <div className="">{item.title}</div>
                {item.subtitle && <div>{item.subtitle}</div>}
              </div>
            </div>
            <div className="col-span-2 text-center font-500 text-1.25 text-black">
              {item.location}
            </div>
            <div className="col-span-2 text-center font-500 text-1.25 text-black">
              {item.status}
            </div>
            <div className="col-span-2 text-center">
              <button className="border border-solid border-black w-[7.5rem] py-2 text-sm font-medium text-black rounded-full">
                신청 취소
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterableList;
