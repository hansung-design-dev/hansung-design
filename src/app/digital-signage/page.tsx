'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import ItemCard from '../../components/itemCard';
import DraggableNoticePopup from '@/src/components/DraggableNoticePopup';
import { useAdvancedNoticePopup } from '@/src/components/hooks/useAdvancedNoticePopup';
import { HomepageContent } from '@/src/types/homepage-content';

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
  const [homepageContent, setHomepageContent] =
    useState<HomepageContent | null>(null);

  // 팝업 공지사항 훅 사용 (고급 팝업 시스템)
  const { popupNotice, closePopup } = useAdvancedNoticePopup('digital_signage');

  useEffect(() => {
    const fetchHomepageContent = async () => {
      try {
        const response = await fetch(
          '/api/homepage-contents?page=digital_signage&section=digital_signage'
        );
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setHomepageContent(data[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching homepage content:', error);
      }
    };

    fetchHomepageContent();
  }, []);

  return (
    <main className="min-h-screen bg-white ">
      {/* Header Section */}
      <section className="lg:container lg:mx-auto lg:px-[8rem] sm:px-[1.5rem] pt-[6rem] pb-[3rem]">
        <h1 className="text-3.75 sm:text-2.5 font-[700] mb-4 font-gmarket">
          {homepageContent?.title || '디지털사이니지'}
        </h1>
        <p className="text-1.25 font-[500] text-gray-600 sm:text-1">
          {homepageContent?.subtitle || '광고를 혁신하다, 공간을 스마트하게'}
        </p>
      </section>

      <section className=" mx-auto mb-12">
        <div className="relative w-full h-[320px] md:h-[400px] overflow-hidden">
          <Image
            src={
              homepageContent?.main_image_url ||
              '/images/digital-sianage/landing.png'
            }
            alt={homepageContent?.title || '디지털 사이니지 메인 이미지'}
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

      {/* 팝업 공지사항 */}
      {popupNotice && (
        <DraggableNoticePopup notice={popupNotice} onClose={closePopup} />
      )}
    </main>
  );
}
