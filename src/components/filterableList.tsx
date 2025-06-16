'use client';

import { useState } from 'react';
import DateLocationFilter from './ui/datelocationfilter';
import CategoryFilter from './ui/categoryFilter';
import ItemList from './ui/itemlist';

type Category =
  | '전체'
  | '공공디자인'
  | 'LED전자게시대'
  | '현수막'
  | '디지털사이니지';

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
  showCategoryFilter = true,
}: FilterableListProps) => {
  const [startDate, setStartDate] = useState('2025.02.06');
  const [endDate, setEndDate] = useState('2025.03.06');
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  return (
    <div className="w-full rounded-lg flex flex-col px-4 md:px-6">
      <div>
        <h2 className="lg:text-1.25 lg:font-500 mb-2">주문내역</h2>
        <p className="text-gray-600 lg:text-1.125 lg:font-300 mb-6">
          *생산이 시작된 주문은 취소/파일 교체가 불가하며, 제품 발송 - 출고완료
          상태에서는 배송 방법 변경이 불가합니다.
        </p>
      </div>

      <DateLocationFilter
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        searchLocation={searchLocation}
        setSearchLocation={setSearchLocation}
        showStartCalendar={showStartCalendar}
        setShowStartCalendar={setShowStartCalendar}
        showEndCalendar={showEndCalendar}
        setShowEndCalendar={setShowEndCalendar}
      />

      {showCategoryFilter && (
        <CategoryFilter
          selectedCategory={selectedCategory as Category}
          onCategoryChange={setSelectedCategory}
        />
      )}

      <ItemList items={items} />
    </div>
  );
};

export default FilterableList;
