'use client';

import ProjectRow from '../../components/ProjectRow';
import { ProjectItem as BaseProjectItem } from '../../components/ProjectRow';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ProjectItem extends BaseProjectItem {
  id: number;
}

// 통합된 project 배열
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

export default function PublicDesignPage() {
  const router = useRouter();

  // 줄마다 필요한 개수만큼 slice
  const rows = [
    allProjects.slice(0, 2), // 2개: 큰+작은
    allProjects.slice(2, 5), // 3개: 작은2+큰
    allProjects.slice(0, 2), // 반복
    allProjects.slice(2, 5), // 반복
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="lg:container lg:mx-auto lg:px-[8rem] sm:px-[1.5rem] pt-[6rem] pb-[3rem]">
        <h1 className="text-3.75 sm:text-2.5 font-[700] mb-4 font-gmarket">
          공공디자인
        </h1>
        <p className="text-1.25 font-[500] text-gray-600">
          도시의 일상에서 만나는 시간과 공간의 경험 디자인
        </p>
      </section>

      {/* Main Visual Image */}
      <section className=" mx-auto  mb-12">
        <div className="relative w-full h-[320px] md:h-[400px]  overflow-hidden">
          <Image
            src="/images/public-degin-page-main.png"
            alt="공공디자인 메인 이미지"
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>

      {/* Projects Grid Section for lg/md */}
      <section className="mx-auto px-10 pb-[12rem] sm:hidden lg:block md:block">
        <div className="flex flex-col gap-[12rem]">
          {rows.map((rowProjects, idx) => (
            <div key={idx} className="h-[400px] cursor-pointer relative">
              <Link href={`/public-design/${rowProjects[0].id}`}>
                <ProjectRow
                  projects={rowProjects}
                  largeCardFirst={idx % 2 === 0}
                  splitSmallSection={idx % 2 !== 0}
                  showTitleOnLargeOnly={true}
                />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Mobile Version */}
      <section className="px-4 pb-[12rem] lg:hidden md:hidden">
        <div className="flex flex-col gap-8">
          {allProjects.map((project, index) => (
            <div
              className="w-full h-[400px] cursor-pointer"
              key={index}
              onClick={() => router.push(`/public-design/${index}`)}
            >
              <div className="relative w-full h-full">
                <Image
                  src={project.imageSrc}
                  alt={project.title}
                  fill
                  className="object-cover rounded-[1rem]"
                />
                <div className="absolute bottom-8 left-8 text-white">
                  <div className="text-1.5 font-500 pb-2">{project.title}</div>
                  <span className="text-1.25 mb-2 block">
                    {project.subtitle}
                  </span>
                  <p className="text-1 font-normal mt-1">
                    {project.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
