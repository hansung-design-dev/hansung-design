'use client';

import { useState } from 'react';
//import Link from 'next/link';
import Nav from '../../../components/Nav';
import { Button } from '@/src/components/ui/button';
//import { Input } from '@/src/components/ui/input';
//import FilterableList from '@/src/components/FilterableList';
//import { format } from 'date-fns';
import CategoryFilter from '@/src/components/ui/categoryFilter';
import DateLocationFilter from '@/src/components/ui/datelocationfilter';
import MypageNav from '@/src/components/mypageNav';
import ItemList from '@/src/components/ui/itemlist';

const sampleItems = Array(10)
  .fill(null)
  .map((_, index) => ({
    id: index + 1,
    title: '울림픽대교 남단사거리 앞',
    subtitle: '(남단 유수지앞)',
    location: '방이동',
    status: index < 3 ? '진행중' : '완료',
    date: '2024.03.06',
  }));

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('주문내역');
  // const [startDate, setStartDate] = useState(new Date());
  // const [endDate, setEndDate] = useState(new Date());
  // const [location, setLocation] = useState('');

  const tabs = [
    { name: '마이페이지', href: '/mypage' },
    { name: '주문내역', href: '/mypage/orders' },
    { name: '1:1상담', href: '/mypage/consultation' },
    { name: '간편정보관리', href: '/mypage/info' },
  ];

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Nav variant="default" />

      <div className="bg-[#F1F1F1]">
        <div className="container px-4 pt-[7rem] pb-[10rem] max-w-[1200px]">
          <div className="flex gap-8">
            {/* Left Navigation */}
            <MypageNav
              tabs={tabs}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

            {/* Main Content */}
            <div className="flex-1 bg-white p-8">
              <h2 className="text-2xl font-bold mb-3">주문내역</h2>

              <div className="text-sm text-gray-500 mb-6">
                *송출이 시작된 주문은 취소/파일 교체가 불가하며, 신청후 3일 이후
                상태에서는 변경이 불가합니다.
              </div>

              {/* Filter Row */}
              <div className="flex flex-col gap-2 items-center mb-6">
                <CategoryFilter
                  selectedCategory="전체"
                  setSelectedCategory={() => {}}
                />
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
              </div>

              {/* Tag Filters */}
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  '공공디자인',
                  'LED전자게시대',
                  '현수막',
                  '디지털사이니지',
                ].map((tag) => (
                  <Button variant="outlineGray" size="sm" key={tag}>
                    {tag}
                  </Button>
                ))}
                <Button variant="ghost" className="ml-auto">
                  전체보기 ▼
                </Button>
              </div>

              <ItemList items={sampleItems} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
