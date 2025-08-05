'use client';

import ProjectRow, {
  ProjectItem as BaseProjectItem,
} from '@/src/components/projectRow';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import PublicDesignDesktopSkeleton from '@/src/components/skeleton/PublicDesignDesktopSkeleton';
import PublicDesignSkeleton from '@/src/components/skeleton/PublicDesignSkeleton';
import { useAdvancedNoticePopup } from '@/src/components/hooks/useAdvancedNoticePopup';
import { HomepageContent } from '@/src/types/homepage-content';

interface ProjectItem {
  id: string;
  name: string;
  description: string;
  location: string;
  listImage: string;
  categoryId: string;
}

export default function PublicDesignPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [homepageContent, setHomepageContent] =
    useState<HomepageContent | null>(null);

  // 팝업 공지사항 훅 사용 (고급 팝업 시스템)
  const { popupNotice } = useAdvancedNoticePopup('public_design');

  // 팝업이 있을 때만 렌더링 (사용하지 않는 변수 경고 해결)
  if (popupNotice) {
    // 팝업이 있으면 처리할 로직을 여기에 추가할 수 있습니다
  }

  // ProjectRow용 데이터로 변환하는 함수
  const convertToProjectRowData = (
    projects: ProjectItem[]
  ): BaseProjectItem[] => {
    return projects.map((project) => ({
      id: project.id,
      imageSrc: project.listImage,
      title: project.name,
      subtitle: project.description,
      description: project.description,
    }));
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // 홈페이지 컨텐츠 가져오기
        const homepageResponse = await fetch(
          '/api/homepage-contents?page=public_design&section=public_design'
        );
        if (homepageResponse.ok) {
          const homepageData = await homepageResponse.json();
          if (homepageData && homepageData.length > 0) {
            setHomepageContent(homepageData[0]);
          }
        }

        // DB에서 공공디자인 프로젝트 가져오기
        const projectsResponse = await fetch('/api/public-design-projects');
        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          setProjects(projectsData);
        } else {
          console.error('Failed to fetch projects from API');
          // 에러 시 기본 데이터 사용
          setProjects([
            {
              id: '1',
              name: '간판개선사업',
              description: '도시 경관을 아름답게 만드는 간판 개선 프로젝트',
              location: '서울시',
              listImage:
                '/images/public-design/banner_improvment/2018/당진/list/02.jpg',
              categoryId: '1',
            },
            {
              id: '2',
              name: '환경개선사업',
              description: '도시 환경을 개선하는 공공디자인 프로젝트',
              location: '서울시',
              listImage:
                '/images/public-design/env_improvememt/사당4동 가로환경개선/03.jpg',
              categoryId: '2',
            },
          ]);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        // 에러 시 기본 데이터 사용
        setProjects([
          {
            id: '1',
            name: '간판개선사업',
            description: '도시 경관을 아름답게 만드는 간판 개선 프로젝트',
            location: '서울시',
            listImage:
              '/images/public-design/banner_improvment/2018/당진/list/02.jpg',
            categoryId: '1',
          },
          {
            id: '2',
            name: '환경개선사업',
            description: '도시 환경을 개선하는 공공디자인 프로젝트',
            location: '서울시',
            listImage:
              '/images/public-design/env_improvememt/사당4동 가로환경개선/03.jpg',
            categoryId: '2',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // 줄마다 필요한 개수만큼 slice (각 줄에 2개씩, 2개 카테고리로 2줄 구성)
  const rows = [
    [projects[0], projects[0]], // 첫 번째 프로젝트를 2개로 복제
    [projects[1], projects[1]], // 두 번째 프로젝트를 2개로 복제
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="lg:container lg:mx-auto lg:px-[8rem] sm:px-[1.5rem] pt-[6rem] pb-[3rem]">
        <h1 className="text-3.75 sm:text-2.5 font-[700] mb-4 font-gmarket">
          공공디자인
        </h1>
        <p className="lg:text-1.25 font-[500] text-gray-600 sm:text-1">
          도시의 일상에서 만나는 시간과 공간의 경험 디자인
        </p>
      </section>
      {/* Main Visual Image */}
      <section className=" mx-auto  mb-12">
        <div className="relative w-full h-[320px] md:h-[400px]  overflow-hidden">
          <Image
            src={
              homepageContent?.main_image_url ||
              '/images/public-design/landing.png'
            }
            alt="공공디자인 메인 이미지"
            fill
            className="object-cover sm:object-left-top"
            priority
          />
        </div>
      </section>
      {/* Projects Grid Section for lg/md */}
      <section className="mx-auto lg:px-10 md:px-10 sm:px-4 lg:pb-[12rem] md:pb-[12rem] sm:pb-[1rem]">
        {loading ? (
          <PublicDesignDesktopSkeleton />
        ) : (
          <div className="flex flex-col lg:gap-[12rem] md:gap-[12rem] sm:gap-[1rem] ">
            {rows.map((rowProjects, idx) => (
              <div key={idx} className="h-[400px] cursor-pointer relative">
                <Link
                  href={`/public-design/${
                    rowProjects[0].categoryId || rowProjects[0].id
                  }`}
                >
                  <ProjectRow
                    projects={convertToProjectRowData(rowProjects)}
                    largeCardFirst={idx === 0}
                    splitSmallSection={false}
                    showTitleOnLargeOnly={true}
                  />
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
      {/* Mobile Version */}
      <section className="px-4 pb-[12rem] lg:hidden md:hidden sm:hidden">
        {loading ? (
          <PublicDesignSkeleton />
        ) : (
          <div className="flex flex-col gap-8">
            {projects.map((project) => (
              <div
                className="w-full h-[400px] cursor-pointer"
                key={project.id}
                onClick={() =>
                  router.push(
                    `/public-design/${project.categoryId || project.id}`
                  )
                }
              >
                <div className="relative w-full h-full">
                  <Image
                    src={project.listImage}
                    alt={project.name}
                    fill
                    className="object-cover rounded-[1rem]"
                  />
                  <div className="absolute bottom-8 left-8 text-white">
                    <div className="text-1.5 font-500 pb-2">{project.name}</div>
                    <p className="text-1 font-normal mt-1">
                      {project.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
