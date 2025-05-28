'use client';

import Image from 'next/image';

// 목데이터: 디자인 구성 이미지 리스트
const designImages = [
  {
    id: 0,
    src: '/images/publicdesign-detailpage-image.png',
    alt: '디자인 구성도',
  },
  {
    id: 1,
    src: '/images/publicdesign-detailpage-image1.png',
    alt: '디자인 상세 이미지1',
  },
  {
    id: 2,
    src: '/images/publicdesign-detailpage-image1.png',
    alt: '디자인 상세 이미지2',
  },
];

export default function PublicDesignDetailPage() {
  // TODO: 실제로는 useParams 등으로 projectId를 받아서 대표이미지/정보를 불러오세요.
  const mainImage = '/images/public-design-image2.jpeg'; // 임시 대표 이미지

  return (
    <main className="min-h-screen bg-white">
      {/* 상단 대표 이미지 */}
      <section className="w-full h-[400px] relative mb-12">
        <Image
          src={mainImage}
          alt="대표 이미지"
          fill
          className="object-cover rounded-2xl"
          priority
        />
      </section>

      {/* 디자인 구성 이미지 리스트 */}
      <section className="container mx-auto px-4 flex flex-col gap-12">
        {designImages.map((img) => (
          <div key={img.id} className="relative w-full h-auto min-h-[200px]">
            <Image
              src={img.src}
              alt={img.alt}
              width={1200}
              height={600}
              className="w-full h-auto rounded-2xl object-contain"
            />
          </div>
        ))}
      </section>
    </main>
  );
}
