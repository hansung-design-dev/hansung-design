'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
//import Link from 'next/link';
import Nav from '../../../../../components/layouts/nav';
import { Button } from '@/src/components/button/button';
//import { Input } from '@/src/components/ui/input';
//import FilterableList from '@/src/components/FilterableList';
//import { format } from 'date-fns';
import CategoryFilter from '@/src/components/ui/categoryFilter';
import DateLocationFilter from '@/src/components/ui/datelocationfilter';
import MypageNav from '@/src/components/mypageNav';
import OrderItemCard from '@/src/components/orderItemCard';

// Mock order data - 실제로는 API에서 가져올 데이터
const mockOrderDetails = {
  1: {
    id: 1,
    title: '올림픽대교 남단사거리 앞 (남단 유수지앞)',
    location: '방이동',
    status: '진행중',
    category: '공공디자인',
    orderNumber: '01019293485',
    fileName: '한성 메인 광고',
    customerName: '홍길동',
    phone: '010.0000.0000',
    productName: '현수막',
    fileSubmission: '이메일로 제출하겠습니다.',
    memo: '메모가 있다면\n최대\n3줄까지 가능합니다.',
    price: 300000,
    vat: 33000,
    designFee: 120000,
    additionalFee: 0,
    totalAmount: 453000,
    paymentMethod: '무통장입금',
    depositorName: '홍길동',
  },
  2: {
    id: 2,
    title: '올림픽대교 남단사거리 앞 (남단 유수지앞)',
    location: '방이동',
    status: '송출중',
    category: 'LED전자게시대',
    orderNumber: '01019293486',
    fileName: 'LED 디스플레이 광고',
    customerName: '김철수',
    phone: '010.1111.1111',
    productName: 'LED전자게시대',
    fileSubmission: '이메일로 제출하겠습니다.',
    memo: '밝기 조절 부탁드립니다.',
    price: 500000,
    vat: 55000,
    designFee: 150000,
    additionalFee: 0,
    totalAmount: 705000,
    paymentMethod: '무통장입금',
    depositorName: '김철수',
  },
  // 더 많은 주문 데이터 추가 가능
};

export default function OrdersItemPage() {
  const [activeTab, setActiveTab] = useState('주문내역');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const params = useParams();
  const orderId = Number(params.id);
  const orderDetail =
    mockOrderDetails[orderId as keyof typeof mockOrderDetails];

  const tabs = [
    { name: '마이페이지', href: '/mypage' },
    { name: '주문내역', href: '/mypage/orders' },
    { name: '1:1상담', href: '/mypage/customer-service' },
    { name: '간편정보관리', href: '/mypage/info' },
  ];

  if (!orderDetail) {
    return (
      <main className="min-h-screen flex flex-col bg-white">
        <Nav variant="default" />
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">주문을 찾을 수 없습니다</h2>
            <Button onClick={() => window.history.back()}>뒤로 가기</Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Nav variant="default" className="sm:px-0" />

      <div className="flex justify-center bg-[#F1F1F1] md:bg-[#F1F1F1] sm:bg-white">
        <div className="container px-4 pt-[7rem] pb-[10rem] sm:max-w-none md:max-w-[1200px]">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            {/* Left Navigation */}
            <MypageNav
              tabs={tabs}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

            {/* Main Content */}
            <div className="flex-1 bg-white lg:p-8 md:p-8 sm:p-0 rounded-lg w-full">
              <div className="sm:flex sm:flex-col sm:gap-2 sm:px-8">
                <h2 className="text-2.25 font-500 mb-3 sm:text-2">주문내역</h2>

                <div className="text-sm text-gray-500 mb-6">
                  *송출이 시작된 주문은 취소/파일 교체가 불가하며,
                  <br className="lg:hidden md:hidden sm:block" /> 신청후 3일
                  이후 상태에서는 변경이 불가합니다.
                </div>
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

              <div>
                {/* Tag Filters */}
                <div className="flex flex-wrap gap-2 mb-4 sm:px-2">
                  <CategoryFilter
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                  />
                  {/* <Button variant="ghost" className="ml-auto" Isborder={true}>
                    전체보기 ▼
                  </Button> */}
                </div>

                {/* Example Order Detail */}
                <OrderItemCard orderDetail={orderDetail} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
