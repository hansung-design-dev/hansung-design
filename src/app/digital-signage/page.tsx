'use client';

import Image from 'next/image';
import DistrictCard from '@/src/components/DistrictCard';
import districts from '@/src/mock/district';

export default function DigitalSignagePage() {
  return (
    <main className="min-h-screen bg-white ">
      {/* Header Section */}
      <section className="container mx-auto px-[8rem] pt-[6rem] pb-[3rem]">
        <h1 className="text-3.75 font-[700] mb-4 font-gmarket">
          디지털사이니지
        </h1>
        <p className="text-1.25 font-[500] text-gray-600">
          광고를 혁신하다, 공간을 스마트하게
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

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-5 md:grid-cols-3 lg:grid-cols-3 gap-[6rem] ">
          {districts.map((district) => (
            <DistrictCard key={district.id} district={district} />
          ))}
        </div>
      </div>
    </main>
  );
}
