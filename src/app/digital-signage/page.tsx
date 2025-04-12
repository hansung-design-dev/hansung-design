'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Nav from '../../components/Nav';
import RollingGallery from '../../components/RollingGallery';

// Define the gallery images for digital signage
const galleryImages = [
  {
    id: 1,
    src: '/images/landing-1.jpeg',
    mainKeyword: '메인키워드',
    title: '상품이름1',
    subtitle: '서브타이틀',
  },
  {
    id: 2,
    src: '/images/landing-2.jpeg',
    mainKeyword: '메인키워드',
    title: '상품이름2',
    subtitle: '서브타이틀',
  },
  {
    id: 3,
    src: '/images/landing-1.jpeg',
    mainKeyword: '메인키워드',
    title: '상품이름3',
    subtitle: '서브타이틀',
  },
  {
    id: 4,
    src: '/images/landing-2.jpeg',
    mainKeyword: '메인키워드',
    title: '상품이름4',
    subtitle: '서브타이틀',
  },
  {
    id: 5,
    src: '/images/landing-1.jpeg',
    mainKeyword: '메인키워드',
    title: '상품이름5',
    subtitle: '서브타이틀',
  },
];
const fadeInUp = {
  initial: { y: 60, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const signageItems = Array(12).fill({
  title: '상품 타이틀',
  category: '카테고리',
  description: '설명',
  image: '/images/digital-signage-grid-example.jpeg',
});

export default function DigitalSignagePage() {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Nav variant="default" />

      {/* Title Section */}
      <section className="container mx-auto px-4 pt-[6rem] pb-[1rem] sm:pt-[6rem] sm:pb-[3rem] md:pt-[5rem]">
        <div className="text-2.5 sm:text-2 md:text-2.25 font-700 mb-4 gmarket">
          디지털사이니지
        </div>
        <div className="text-1.25 sm:text-1 md:text-1.125 text-gray-600">
          광고를 혁신하다, 공간을 스마트하게
        </div>
      </section>

      {/* Header Section with Rolling Gallery */}
      <section className="w-full">
        <RollingGallery images={galleryImages} />
      </section>

      {/* Content Section */}
      <div className="flex-grow bg-white">
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="container mx-auto px-4 py-20 sm:py-12 md:py-16"
        >
          {/* Signage Grid */}
          <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:gap-6 sm:gap-4 md:gap-5">
            {signageItems.map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center"
              >
                <div className="relative lg:aspect-[3/4] lg:w-[25rem] sm:w-[18rem] md:w-[22rem] lg:h-[25rem] sm:h-[16rem] md:h-[22rem] overflow-hidden rounded-lg">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="mt-4 flex flex-col gap-2 items-start w-full pl-8">
                  <div className="flex gap-2 justify-center">
                    <div className="text-0.75 sm:text-0.625 md:text-0.75 font-700 text-white bg-black px-3 py-2 rounded-full flex items-center justify-center">
                      {item.category}
                    </div>
                    <div className="text-0.75 sm:text-0.625 md:text-0.75 font-700 text-white bg-black px-3 py-2 rounded-full flex items-center justify-center">
                      {item.description}
                    </div>
                  </div>
                  <div className="text-1.5 sm:text-1.25 md:text-1.375 font-400 text-center">
                    {item.title}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
