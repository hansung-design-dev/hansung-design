'use client';

import { useState } from 'react';

import Nav from '../../../components/layouts/nav';
import CategoryFilter from '@/src/components/ui/categoryFilter';
import DateLocationFilter from '@/src/components/ui/datelocationfilter';
import MypageNav from '@/src/components/mypageNav';
import ItemList from '@/src/components/ui/itemlist';
import Image from 'next/image';
import Link from 'next/link';
const mockOrders = [
  {
    id: 1,
    title: '올림픽대교 남단사거리 앞 (남단 유수지앞)',
    location: '방이동 ',
    status: '진행중',
  },
  {
    id: 2,
    title: '올림픽대교 남단사거리 앞 (남단 유수지앞)',
    location: '방이동',
    status: '송출중',
  },
  {
    id: 3,
    title: '올림픽대교 남단사거리 앞 (남단 유수지앞)',
    location: '방이동',
    status: '파일오류',
  },
  {
    id: 4,
    title: '올림픽대교 남단사거리 앞 (남단 유수지앞)',
    location: '온라인',
    status: '추가결제',
  },
  {
    id: 5,
    title: '올림픽대교 남단사거리 앞 (남단 유수지앞)',
    location: '방이동',
    status: '진행중',
  },
  {
    id: 6,
    title: '올림픽대교 남단사거리 앞 (남단 유수지앞)',
    location: '방이동 ',
    status: '진행중',
  },
  {
    id: 7,
    title: '올림픽대교 남단사거리 앞 (남단 유수지앞)',
    location: '방이동 ',
    status: '진행중',
  },
  {
    id: 8,
    title: '올림픽대교 남단사거리 앞 (남단 유수지앞)',
    location: '방이동 ',
    status: '진행중',
  },
  {
    id: 9,
    title: '올림픽대교 남단사거리 앞 (남단 유수지앞)',
    location: '방이동',
    status: '마감',
  },
  {
    id: 10,
    title: '올림픽대교 남단사거리 앞 (남단 유수지앞)',
    location: '방이동',
    status: '마감',
  },
  {
    id: 11,
    title: '올림픽대교 남단사거리 앞 (남단 유수지앞)',
    location: '방이동',
    status: '마감',
  },
];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('주문내역');

  const tabs = [
    { name: '마이페이지', href: '/mypage' },
    { name: '주문내역', href: '/mypage/orders' },
    { name: '1:1상담', href: '/mypage/customer-service' },
    { name: '간편정보관리', href: '/mypage/info' },
  ];

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Nav variant="default" className="bg-white" />

      <div className="flex justify-center bg-[#F1F1F1] md:bg-[#F1F1F1] sm:bg-white">
        <div className="container px-4 pt-[7rem] pb-[10rem] max-w-[1200px]">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            {/* Left Navigation */}
            <MypageNav
              tabs={tabs}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

            {/* Main Content */}
            <div className="flex-1 bg-white lg:p-8 md:p-8 sm:p-0 rounded-lg w-full">
              <Link href="/mypage" className="md:hidden lg:hidden sm:inline">
                <Image
                  src="/svg/arrow-left.svg"
                  alt="orders"
                  width={20}
                  height={20}
                  className="w-[1.5rem] h-[1.5rem]"
                />
              </Link>
              <h2 className="text-2.25 font-500 mb-3">주문내역</h2>

              <div className="text-sm text-gray-500 mb-6">
                *송출이 시작된 주문은 취소/파일 교체가 불가하며, 신청후 3일 이후
                상태에서는 변경이 불가합니다.
              </div>

              {/* Filter Row */}
              <div className="flex flex-col gap-2 items-center mb-6">
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
              <CategoryFilter
                selectedCategory="전체"
                onCategoryChange={() => {}}
              />

              <ItemList items={mockOrders} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
