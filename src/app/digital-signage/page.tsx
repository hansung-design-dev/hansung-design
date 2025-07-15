'use client';

import Image from 'next/image';
import ItemCard from '../../components/itemCard';

const items = [
  {
    id: 'digital-signage-1',
    title: 'SAMSUNG QB Series',
    tags: ['#디지털사이니지', '#4K UHD'],
    src: '/images/digital-signage-grid-example.jpeg',
  },
  {
    id: 'digital-signage-2',
    title: 'LG LED Display',
    tags: ['#디지털사이니지', '#Full HD'],
    src: '/images/digital-signage-grid-example.jpeg',
  },
  {
    id: 'digital-signage-3',
    title: 'Philips Digital Signage',
    tags: ['#디지털사이니지', '#Smart Display'],
    src: '/images/digital-signage-grid-example.jpeg',
  },
  {
    id: 'digital-signage-4',
    title: 'Sony Professional Display',
    tags: ['#디지털사이니지', '#Professional'],
    src: '/images/digital-signage-grid-example.jpeg',
  },
  {
    id: 'digital-signage-5',
    title: 'Panasonic Digital Signage',
    tags: ['#디지털사이니지', '#Commercial'],
    src: '/images/digital-signage-grid-example.jpeg',
  },
  {
    id: 'digital-signage-6',
    title: 'Sharp Digital Display',
    tags: ['#디지털사이니지', '#Interactive'],
    src: '/images/digital-signage-grid-example.jpeg',
  },
  {
    id: 'digital-signage-7',
    title: 'Toshiba Digital Signage',
    tags: ['#디지털사이니지', '#High Brightness'],
    src: '/images/digital-signage-grid-example.jpeg',
  },
  {
    id: 'digital-signage-8',
    title: 'NEC Digital Display',
    tags: ['#디지털사이니지', '#Reliability'],
    src: '/images/digital-signage-grid-example.jpeg',
  },
  {
    id: 'digital-signage-9',
    title: 'BenQ Digital Signage',
    tags: ['#디지털사이니지', '#Energy Efficient'],
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
        <p className="text-1.25 font-[500] text-gray-600 sm:text-1">
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
