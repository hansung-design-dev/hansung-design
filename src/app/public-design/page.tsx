'use client';

//import Image from 'next/image';
import Nav from '../../components/Nav';
import ProjectRow from '../../components/ProjectRow';
import { ProjectItem } from '../../components/ProjectRow';

// Define the project items for the first row
const firstRowProjects: ProjectItem[] = [
  {
    imageSrc: '/images/public-design-image2.jpeg',
    title: '브랜드 아이템',
    subtitle: '간판개선사업',
    description: '도시의 새로운 경험을 만드는 브랜드',
  },
  {
    imageSrc: '/images/public-design-image2.jpeg',
    title: '공공디자인',
    subtitle: '서브타이틀',
    description: '도시 경관을 아름답게 만드는 디자인',
  },
];

// Define the project items for the second row
const secondRowProjects: ProjectItem[] = [
  {
    imageSrc: '/images/public-design-image2.jpeg',
    title: '공공시설물',
    subtitle: '서브타이틀',
    description: '도시의 기능을 높이는 시설물',
  },
  {
    imageSrc: '/images/public-design-image2.jpeg',
    title: '스마트 시티',
    subtitle: '서브타이틀',
    description: '미래 도시의 새로운 가능성',
  },
  {
    imageSrc: '/images/public-design-image2.jpeg',
    title: '도시 경관',
    subtitle: '서브타이틀',
    description: '도시 환경을 개선하는 디자인',
  },
];

export default function PublicDesignPage() {
  return (
    <main className="min-h-screen bg-white ">
      <Nav variant="default" />

      {/* Header Section */}
      <section className="container mx-auto px-4 pt-[6rem] pb-[3rem]">
        <h1 className="text-3.75 font-[700] mb-4 ">공공디자인</h1>
        <p className="text-1.25 font-[500] text-gray-600">
          도시의 일상에서 만나는 시간과 공간의 경험 디자인
        </p>
      </section>

      {/* Main Photos Section - Zigzag Layout */}

      {/* Projects Grid Section */}
      <section className="container mx-auto px-4 pb-[12rem] ">
        <div className="flex flex-col gap-[12rem] ">
          <div className="h-[400px]">
            <ProjectRow
              projects={firstRowProjects}
              largeCardFirst={true}
              splitSmallSection={false}
            />
          </div>

          {/* Second row - Small section first (split into two cards), then large card */}
          <div className="h-[400px]">
            <ProjectRow
              projects={secondRowProjects}
              largeCardFirst={false}
              splitSmallSection={true}
            />
          </div>

          <div className="h-[400px]">
            <ProjectRow
              projects={firstRowProjects}
              largeCardFirst={true}
              splitSmallSection={false}
            />
          </div>

          {/* Second row - Small section first (split into two cards), then large card */}
          <div className="h-[400px]">
            <ProjectRow
              projects={secondRowProjects}
              largeCardFirst={false}
              splitSmallSection={true}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
