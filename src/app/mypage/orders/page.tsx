'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Nav from '../../../components/Nav';
import CategoryFilter from '@/src/components/ui/categoryFilter';
import DateLocationFilter from '@/src/components/ui/datelocationfilter';
import MypageNav from '@/src/components/mypageNav';
import ItemList from '@/src/components/ui/itemlist';

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
  const [isMobile, setIsMobile] = useState(false);

  // const [startDate, setStartDate] = useState(new Date());
  // const [endDate, setEndDate] = useState(new Date());
  // const [location, setLocation] = useState('');

  const tabs = [
    { name: '마이페이지', href: '/mypage' },
    { name: '주문내역', href: '/mypage/orders' },
    { name: '1:1상담', href: '/mypage/customer-service' },
    { name: '간편정보관리', href: '/mypage/info' },
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 767);
      // console.log(window.innerWidth);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Nav variant="default" className="bg-white" />

      <div className="flex justify-center bg-[#F1F1F1] ">
        <div className="container px-4 pt-[7rem] pb-[10rem] max-w-[1200px]">
          <div className="flex gap-8">
            {/* Left Navigation */}
            {isMobile ? (
              <></>
            ) : (
              <MypageNav
                tabs={tabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            )}

            {/* Main Content */}
            <div className="flex-1 bg-white lg:p-8 rounded-lg sm:p-4 ">
              <div className="flex flex-col gap-2 sm:pl-[4rem]">
                {isMobile && (
                  <Link href="/mypage" className="border-none">
                    <Image
                      src="/svg/arrow-left.svg"
                      alt="mypage-nav"
                      width={40}
                      height={40}
                    />
                  </Link>
                )}
                <div className="flex flex-col gap-2 items-start mb-6">
                  <div className="text-2.25 font-500 pt-3">주문내역</div>

                  <div className="text-sm text-gray-500 mb-6">
                    *송출이 시작된 주문은 취소/파일 교체가 불가하며, 신청후 3일
                    이후 상태에서는 변경이 불가합니다.
                  </div>
                </div>
              </div>

              {/* Filter Row */}
              <div className="flex flex-col gap-2 items-center mb-6 ">
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
                <CategoryFilter
                  selectedCategory="전체"
                  setSelectedCategory={() => {}}
                />
              </div>

              <ItemList items={mockOrders} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
