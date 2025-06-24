'use client';

import Image from 'next/image';
import DistrictCard from '@/src/components/districtCard';
import ledDistricts from '@/src/mock/led-district';
import { useEffect, useState } from 'react';
import { getLEDDisplayCountsByDistrict } from '@/lib/api/led-display';

export default function LEDDisplayPage() {
  const [districtCounts, setDistrictCounts] = useState<Record<string, number>>(
    {}
  );

  useEffect(() => {
    async function fetchDistrictCounts() {
      try {
        console.log('🔍 Fetching LED district counts...');
        const counts = await getLEDDisplayCountsByDistrict();
        console.log('🔍 LED district counts:', counts);
        setDistrictCounts(counts);
      } catch (error) {
        console.error('Error fetching LED district counts:', error);
      }
    }

    fetchDistrictCounts();
  }, []);

  // 구별 개수를 업데이트한 districts 배열 생성
  const updatedDistricts = ledDistricts.map((district) => ({
    ...district,
    count:
      district.code === 'all'
        ? Object.values(districtCounts).reduce((sum, count) => sum + count, 0)
        : districtCounts[district.name] || 0,
  }));

  return (
    <main className="min-h-screen bg-white ">
      {/* Header Section */}
      <section className="lg:container lg:mx-auto lg:px-[8rem] sm:px-[1.5rem] pt-[6rem] pb-[3rem]">
        <h1 className="text-3.75 sm:text-2.5 font-[700] mb-4 font-gmarket">
          LED 전자게시대
        </h1>
        <p className="text-1.25 font-[500] sm:text-1 text-gray-600">
          한 번의 광고, 수천 번의 노출
        </p>
      </section>

      <section className=" mx-auto  mb-12">
        <div className="relative w-full h-[320px] md:h-[400px]  overflow-hidden">
          <Image
            src="/images/led/landing.png"
            alt="공공디자인 메인 이미지"
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>

      <div className="flex items-center justify-center mx-[4rem] px-4 py-8 sm:mx-[0.5rem] md:mx-[2rem]">
        <div className="container grid lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-1 lg:gap-4 md:gap-[2rem] sm:gap-[2rem] ">
          {updatedDistricts.map((district) => (
            <DistrictCard key={district.id} district={district} />
          ))}
        </div>
      </div>
    </main>
  );
}
