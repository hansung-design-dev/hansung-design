'use client';

import { useState } from 'react';
import Image from 'next/image';
//import Link from 'next/link';
import Nav from '../../components/Nav';
import FilterableList from '../../components/FilterableList';
import MypageNav from '@/src/components/mypageNav';

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

const recommendedProducts = Array(4)
  .fill(null)
  .map((_, index) => ({
    id: index + 1,
    title: '잠실종합운동장 사거리앞',
    subtitle: '(실내체육관 방향)',
    image: '/images/public-design.jpeg',
    price: 140800,
    tagType: '현수막',
    tagDistrict: '용산구',
  }));

export default function MyPage() {
  const [activeTab, setActiveTab] = useState('마이페이지');

  const tabs = [
    { name: '마이페이지', href: '/mypage' },
    { name: '주문내역', href: '/mypage/orders' },
    { name: '1:1상담', href: '/mypage/consultation' },
    { name: '간편정보관리', href: '/mypage/info' },
  ];

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Nav variant="default" className="bg-white" />
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
            <div className="flex-1 bg-white rounded-lg">
              {/* User Info */}
              <div className="p-8 rounded-lg mb-12">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <h2 className="text-2xl font-semibold mb-2">사용자님</h2>
                  <div className="flex gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-full" />
                        <div className="flex flex-col p-6 rounded">
                          <div className="text-lg font-medium mb-4">
                            주문내역
                          </div>
                          <div className="text-3xl font-bold">3건</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-full" />
                        <div className="flex flex-col p-6 rounded">
                          <div className="text-lg font-medium mb-4">
                            송출중 광고
                          </div>
                          <div className="text-3xl font-bold">2건</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filterable List Section */}
              <div className="mb-12">
                <FilterableList items={sampleItems} />
              </div>

              {/* Recommended Products */}
              <div className="rounded-lg bg-gray-50 p-8">
                <div className="mb-6 flex flex-col items-end px-[2rem]">
                  <div className="w-full">
                    <h3 className="text-xl font-semibold mb-2">추천상품</h3>
                    <div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="1090"
                        height="2"
                        viewBox="0 0 1088 2"
                        fill="none"
                      >
                        <path d="M1088 1L1.33514e-05 1" stroke="#E0E0E0" />
                      </svg>
                    </div>
                  </div>
                  <button className="flex gap-2 text-sm text-gray-600 hover:text-black mt-6 mb-10 ">
                    <span>더보기</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="8"
                      height="14"
                      viewBox="0 0 8 14"
                      fill="none"
                    >
                      <path
                        d="M1 13L7 7L1 1"
                        stroke="black"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recommendedProducts.map((product) => (
                    <div key={product.id}>
                      <button className="flex flex-col group text-left">
                        <div className="relative aspect-[1/1] w-full overflow-hidden rounded-lg">
                          <Image
                            src={product.image}
                            alt={product.title}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <div className="text-0.75 font-400 bg-black text-white rounded-full px-2 py-1 w-[2.5rem] text-center">
                            {product.tagType}
                          </div>
                          <div className="text-0.75 font-400 bg-black text-white rounded-full px-2 py-1 w-[2.5rem] text-center">
                            {product.tagDistrict}
                          </div>
                        </div>
                        <div className="mt-4 text-[#181717] flex flex-col gap-[1.12rem] ">
                          <div className="flex flex-col gap-2">
                            <div className="text-1.5 font-400">
                              {product.title}
                            </div>
                            <div className="text-1.5 font-400">
                              {product.subtitle}
                            </div>
                          </div>
                          <div className="mt-2 font-700 text-2.375 font-pretendard flex flex-col items-end">
                            <div>
                              {product.price.toLocaleString()}
                              <span className="text-1.5 font-400">원</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
