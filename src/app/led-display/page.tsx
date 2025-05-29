'use client';

import Image from 'next/image';
import DistrictCard from '../../components/DistrictCard';

interface District {
  id: number;
  name: string;
  description: string;
  count: number;
  icon: string;
  size: string;
  sizeOfPeople: string;
  src: string;
}

const districts: District[] = [
  {
    id: 1,
    name: '전체',
    description: '울림픽대교 남단사거리 앞 외 3건',
    count: 4,
    icon: '/images/district-icon/1.all.svg',
    size: '1000x1000',
    sizeOfPeople: '10000',
    src: '/images/led/landing.png',
  },
  {
    id: 2,
    name: '강동구',
    description: '울림픽대교 남단사거리 앞 외 3건',
    count: 4,
    icon: '/images/district-icon/2.gangdong-gu.png',
    size: '1000x1000',
    sizeOfPeople: '10000',
    src: '/images/led/landing.png',
  },
  {
    id: 3,
    name: '관악구',
    description: '서울대입구역 앞 외 3건',
    count: 4,
    icon: '/images/district-icon/3.gwanak-gu.png',
    size: '1000x1000',
    sizeOfPeople: '10000',
    src: '/images/led/landing.png',
  },
  {
    id: 4,
    name: '마포구',
    description: '홍대입구역 앞 외 5건',
    count: 6,
    icon: '/images/district-icon/4.mapo-gu.png',
    size: '1000x1000',
    sizeOfPeople: '10000',
    src: '/images/led/landing.png',
  },
  {
    id: 5,
    name: '서대문구',
    description: '울림픽대교 남단사거리 앞 외 3건',
    count: 4,
    icon: '/images/district-icon/5.seodaemun-gu.png',
    size: '1000x1000',
    sizeOfPeople: '10000',
    src: '/images/led/landing.png',
  },

  {
    id: 6,
    name: '송파구',
    description: '잠실종합운동장 앞 외 5건',
    count: 6,
    icon: '/images/district-icon/6.songpa-gu.png',
    size: '1000x1000',
    sizeOfPeople: '10000',
    src: '/images/led/landing.png',
  },
  {
    id: 7,
    name: '용산구',
    description: '여의도공원 앞 외 6건',
    count: 7,
    icon: '/images/district-icon/7.yongsan-gu.png',
    size: '1000x1000',
    sizeOfPeople: '10000',
    src: '/images/led/landing.png',
  },
];

export default function LEDDisplayPage() {
  return (
    <main className="min-h-screen bg-white pt-[10rem]">
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
