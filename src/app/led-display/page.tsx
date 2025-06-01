'use client';

import Image from 'next/image';
import DistrictCard from '../../components/DistrictCard';
import districts from '@/src/mock/district';

export default function LEDDisplayPage() {
  return (
    <main className="min-h-screen bg-white ">
      {/* Header Section */}
      <section className="container mx-auto px-[8rem] pt-[6rem] pb-[3rem]">
        <h1 className="text-3.75 font-[700] mb-4 font-gmarket">
          LED 전자게시대
        </h1>
        <p className="text-1.25 font-[500] text-gray-600">
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

      <div className=" mx-auto px-4 py-12 flex items-center justify-center ">
        <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-[2rem] w-[80rem] ">
          {districts.map((district) => (
            <DistrictCard key={district.id} district={district} />
          ))}
        </div>
      </div>
    </main>
  );
}
