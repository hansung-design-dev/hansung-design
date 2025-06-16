'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import ProjectRow, { ProjectItem } from '@/src/components/projectRow';

// 목데이터: 디자인 구성 이미지 리스트
const designImages = [
  {
    id: 0,
    src: '/images/publicdesign-detailpage-image.png',
    alt: '디자인 구성도',
  },
  {
    id: 1,
    src: '/images/public-design-image2.jpeg',
    alt: '디자인 상세 이미지1',
  },
  {
    id: 2,
    src: '/images/public-design-image2.jpeg',
    alt: '디자인 상세 이미지2',
  },
];

// allProjects와 동일한 데이터(타입 포함)
const allProjects: ProjectItem[] = [
  {
    id: 1,
    imageSrc: '/images/public-design-image2.jpeg',
    title: '브랜드 아이템',
    subtitle: '간판개선사업',
    description: '도시의 새로운 경험을 만드는 브랜드',
  },
  {
    id: 2,
    imageSrc: '/images/public-design-image2.jpeg',
    title: '공공디자인',
    subtitle: '서브타이틀',
    description: '도시 경관을 아름답게 만드는 디자인',
  },
  {
    id: 3,
    imageSrc: '/images/public-design-image2.jpeg',
    title: '공공시설물',
    subtitle: '서브타이틀',
    description: '도시의 기능을 높이는 시설물',
  },
  {
    id: 4,
    imageSrc: '/images/public-design-image2.jpeg',
    title: '스마트 시티',
    subtitle: '서브타이틀',
    description: '미래 도시의 새로운 가능성',
  },
  {
    id: 5,
    imageSrc: '/images/public-design-image2.jpeg',
    title: '도시 경관',
    subtitle: '서브타이틀',
    description: '도시 환경을 개선하는 디자인',
  },
];

export default function PublicDesignDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  // allProjects에서 id의 index 찾기
  const idx = allProjects.findIndex((p) => p.id === id);

  // 줄 패턴: 0~1(2개), 2~4(3개), 0~1(2개), 2~4(3개) 반복
  let rowProjects: ProjectItem[] = [];
  let largeCardFirst = true;
  let splitSmallSection = false;
  if (idx < 2) {
    rowProjects = allProjects.slice(0, 2);
    largeCardFirst = true;
    splitSmallSection = false;
  } else if (idx >= 2 && idx < 5) {
    rowProjects = allProjects.slice(2, 5);
    largeCardFirst = false;
    splitSmallSection = true;
  }
  // (더 많은 데이터가 있다면 패턴 반복)

  return (
    <main className="min-h-screen bg-white py-[6rem] px-[8rem] ">
      {/* 상단: ProjectRow 그대로 사용 */}
      <section className=" mx-auto mb-12">
        <ProjectRow
          projects={rowProjects}
          largeCardFirst={largeCardFirst}
          splitSmallSection={splitSmallSection}
          showTitleOnLargeOnly={true}
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
