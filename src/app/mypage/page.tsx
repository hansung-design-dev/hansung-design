'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Nav from '../../components/Nav';
import FilterableList from '../../components/FilterableList';

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
    title: '청심환운동장 앞',
    subtitle: '(청심환운동장 앞)',
    image: '/images/public-design.jpeg',
    price: 140800,
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
            <div className="w-[16rem] flex-shrink-0">
              <div className="flex flex-col gap-2">
                {tabs.map((tab) => (
                  <Link
                    key={tab.name}
                    href={tab.href}
                    onClick={() => setActiveTab(tab.name)}
                    className={`px-4 py-3 rounded text-sm font-medium ${
                      activeTab === tab.name
                        ? 'bg-black text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tab.name}
                  </Link>
                ))}
              </div>
            </div>

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
                <div className="mb-6 flex flex-col items-end">
                  <div className="w-full">
                    <h3 className="text-xl font-semibold mb-2">추천상품</h3>
                    <hr className="border-gray-200" />
                  </div>
                  <button className="flex gap-2 text-sm text-gray-600 hover:text-black mt-6 mb-10">
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
                    <button
                      key={product.id}
                      className="flex flex-col group text-left"
                    >
                      <div className="relative aspect-[1/1] w-full overflow-hidden rounded-lg">
                        <Image
                          src={product.image}
                          alt={product.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="mt-4">
                        <h4 className="font-medium text-base">
                          {product.title}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          {product.subtitle}
                        </p>
                        <p className="mt-2 font-bold">
                          {product.price.toLocaleString()}원
                        </p>
                      </div>
                    </button>
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
