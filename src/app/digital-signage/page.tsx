'use client';

import Image from 'next/image';
import ItemCard from '@/src/components/ItemCard';

const items = [
  {
    id: 1,
    title: '상품타이틀_1',
    tags: ['#디지털사이니지', '#디지털사이니지'],
    src: '/images/digital-signage-grid-example.jpeg',
  },
  {
    id: 2,
    title: '상품타이틀_2',
    tags: ['#카테고리', '#설명'],
    src: '/images/digital-signage-grid-example.jpeg',
  },
  {
    id: 3,
    title: '상품타이틀_3',
    tags: ['#카테고리', '#설명'],
    src: '/images/digital-signage-grid-example.jpeg',
  },
  {
    id: 4,
    title: '상품타이틀_4',
    tags: ['#카테고리', '#설명'],
    src: '/images/digital-signage-grid-example.jpeg',
  },
  {
    id: 5,
    title: '상품타이틀_5',
    tags: ['#카테고리', '#설명'],
    src: '/images/digital-signage-grid-example.jpeg',
  },
  {
    id: 6,
    title: '상품타이틀_6',
    tags: ['#카테고리', '#설명'],
    src: '/images/digital-signage-grid-example.jpeg',
  },
  {
    id: 7,
    title: '상품타이틀_7',
    tags: ['#카테고리', '#설명'],
    src: '/images/digital-signage-grid-example.jpeg',
  },
  {
    id: 8,
    title: '상품타이틀_8',
    tags: ['#카테고리', '#설명'],
    src: '/images/digital-signage-grid-example.jpeg',
  },
  {
    id: 9,
    title: '상품타이틀_9',
    tags: ['#카테고리', '#설명'],
    src: '/images/digital-signage-grid-example.jpeg',
  },
];

export default function DigitalSignagePage() {
  return (
    <main className="min-h-screen bg-white ">
      {/* Header Section */}
      <section className="lg:container lg:mx-auto lg:px-[8rem] sm:px-[1.5rem] pt-[6rem] pb-[3rem]">
        <h1 className="text-3.75 sm:text-2.5 font-[700] mb-4 font-gmarket">
          디지털사이니지
        </h1>
        <p className="text-1.25 font-[500] text-gray-600">
          광고를 혁신하다, 공간을 스마트하게
        </p>
      </section>

      <section className=" mx-auto mb-12">
        <div className="relative w-full h-[320px] md:h-[400px] overflow-hidden">
          <Image
            src="/images/digital-sianage/landing.png"
            alt="공공디자인 메인 이미지"
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>

      <div className="lg:mx-[2rem] px-[8rem] py-12 md:px-2 sm:mx-[0.5rem] md:mx-[2rem]">
        <div className="grid lg:grid-cols-3 sm:grid-cols-1 lg:gap-[2rem] sm:gap-[2rem] md:gap-[6rem] ">
          {items.map((item) => (
            <ItemCard item={item} key={item.id} />
          ))}
        </div>
      </div>
    </main>
  );
}
