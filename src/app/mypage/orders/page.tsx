'use client';

//import { useState } from 'react';
import Link from 'next/link';
import Nav from '../../../components/Nav';
import { Button } from '@/src/components/ui/button';
//import { Input } from '@/src/components/ui/input';
import FilterableList from '@/src/components/FilterableList';
//import { format } from 'date-fns';
const sampleItems = Array(5)
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
  // const [activeTab, setActiveTab] = useState('주문내역');
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

      <div className="container mx-auto px-4 pt-[7rem] pb-[10rem]">
        <div className="flex gap-8">
          {/* Left Navigation */}
          <div className="w-[16rem] flex-shrink-0">
            <div className="flex flex-col gap-2">
              {tabs.map((tab) => (
                <Link
                  key={tab.name}
                  href={tab.href}
                  // onClick={() => setActiveTab(tab.name)}
                  // className={`px-4 py-3 rounded ${
                  //   activeTab === tab.name
                  //     ? 'bg-black text-white'
                  //     : 'text-gray-600 hover:bg-gray-100'
                  // }`}
                >
                  {tab.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-6">주문내역</h2>

            <p className="text-sm text-gray-500 mb-6">
              *송출이 시작된 주문은 취소/파일 교체가 불가하며, 신청후 3일 이후
              상태에서는 변경이 불가합니다.
            </p>

            {/* Filter Row */}
            <div className="flex gap-2 items-center mb-6">
              <FilterableList items={sampleItems} />
            </div>

            {/* Tag Filters */}
            <div className="flex flex-wrap gap-2 mb-4">
              {['공공디자인', 'LED전자게시대', '현수막', '디지털사이니지'].map(
                (tag) => (
                  <Button variant="outline" size="sm" key={tag}>
                    {tag}
                  </Button>
                )
              )}
              <Button variant="ghost" className="ml-auto">
                전체보기 ▼
              </Button>
            </div>

            {/* Example Order Detail */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-100 p-4 flex justify-between items-center">
                <div className="text-sm">
                  올림픽대교 남단사거리 앞 (남단 유수지앞)
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-sm text-gray-600">방이동</span>
                  <span className="text-sm text-blue-600 font-semibold">
                    진행중
                  </span>
                  <Button size="sm" variant="outline">
                    신청 취소
                  </Button>
                </div>
              </div>

              <div className="p-6 bg-white">
                <div className="text-sm font-medium mb-2">
                  주문번호 01019293485
                </div>
                <div className="text-lg font-bold mb-4">한성 메인 광고</div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <div className="text-gray-500">접수자명</div>
                    <div>홍길동</div>
                  </div>
                  <div>
                    <div className="text-gray-500">연락처</div>
                    <div>010.0000.0000</div>
                  </div>
                  <div>
                    <div className="text-gray-500">품명</div>
                    <div>현수막</div>
                  </div>
                  <div>
                    <div className="text-gray-500">위치</div>
                    <div>올림픽대교 남단사거리 앞 (남단 유수지앞)</div>
                  </div>
                  <div>
                    <div className="text-gray-500">파일</div>
                    <div>이메일로 제출하겠습니다.</div>
                  </div>
                  <div>
                    <div className="text-gray-500">메모</div>
                    <div>메모가 있다면 최대 3줄까지 가능합니다.</div>
                  </div>
                </div>

                <div className="border-t pt-4 text-sm">
                  <div className="flex justify-between mb-1">
                    <span>상품가</span>
                    <span>300,000</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>부가세</span>
                    <span>33,000</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>디자인비</span>
                    <span>120,000</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>추가금</span>
                    <span>0</span>
                  </div>
                  <div className="flex justify-between font-bold mt-2">
                    <span>총액</span>
                    <span>453,000원</span>
                  </div>
                </div>

                <div className="mt-4 text-sm">
                  <div className="text-gray-500">무통장입금</div>
                  <div>입금자명: 홍길동</div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button variant="outline" size="sm">
                    신청 취소
                  </Button>
                  <Button variant="outline" size="sm">
                    파일재전송
                  </Button>
                  <Button variant="outline" size="sm">
                    영수증
                  </Button>
                  <Button variant="outline" size="sm">
                    목록
                  </Button>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              * 신청취소는 신청후 3일이내만 취소 가능합니다. 3일 이후 취소시
              고객센터에 문의 부탁드립니다.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
