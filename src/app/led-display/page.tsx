'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Nav from '../../components/Nav';
import RollingBanner from '../../components/RollingBanner';

interface District {
  id: number;
  name: string;
  description: string;
  count: number;
}

const districts: District[] = [
  {
    id: 1,
    name: '강동구',
    description: '울림픽대교 남단사거리 앞 외 3건',
    count: 4,
  },
  { id: 2, name: '송파구', description: '잠실종합운동장 앞 외 5건', count: 6 },
  { id: 3, name: '강남구', description: '강남역 사거리 외 7건', count: 8 },
  { id: 4, name: '서초구', description: '교대역 앞 외 4건', count: 5 },
  { id: 5, name: '관악구', description: '서울대입구역 앞 외 3건', count: 4 },
  { id: 6, name: '동작구', description: '노량진역 앞 외 2건', count: 3 },
  { id: 7, name: '영등포구', description: '여의도공원 앞 외 6건', count: 7 },
  { id: 8, name: '마포구', description: '홍대입구역 앞 외 5건', count: 6 },
  { id: 9, name: '성동구', description: '왕십리역 앞 외 4건', count: 5 },
];

export default function LEDDisplayPage() {
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowBanner(scrollY < 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-white pt-[10rem]">
      <Nav variant="default" TextInvert={showBanner} />

      <div className="bg-black ">
        <div className="container mx-auto px-4 py-12 text-white items-center flex flex-col gap-4">
          <div className="text-1.5">MOVE ON THE SCREEN</div>
          <div className="text-2.5 font-700">LED 전자게시대</div>
        </div>
        <div
          className={`transition-all duration-500 ${
            showBanner ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <RollingBanner />
        </div>
      </div>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
          {districts.map((district, index) => (
            <Link
              key={district.id}
              href={`/led-display/${encodeURIComponent(district.name)}`}
              className={`group block p-6 border-16 border-gray-200 rounded-32 hover:border-gray-400 transition-all duration-300 ${
                index % 2 === 0 ? 'md:translate-y-8' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-medium">{district.name}</h3>
                <svg
                  className="w-6 h-6 text-gray-400 group-hover:text-black transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
              <p className="text-gray-600 mb-2">{district.description}</p>
              <p className="text-sm text-gray-400">전체 {district.count}건</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
