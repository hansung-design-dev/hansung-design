'use client';

import ProjectRow, {
  ProjectItem as BaseProjectItem,
} from '@/src/components/projectRow';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, useCallback, useRef } from 'react';
import PublicDesignDesktopSkeleton from '@/src/components/skeleton/PublicDesignDesktopSkeleton';
import PublicDesignSkeleton from '@/src/components/skeleton/PublicDesignSkeleton';
import { useAdvancedNoticePopup } from '@/src/components/hooks/useAdvancedNoticePopup';
import { HomepageContent } from '@/src/types/homepage-content';

interface ProjectItem {
  id: string;
  name: string;
  description: string;
  location: string;
  listImages: string[];
  categoryId: string;
}

export default function PublicDesignPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [homepageContent, setHomepageContent] =
    useState<HomepageContent | null>(null);
  const [visibleCount, setVisibleCount] = useState(5);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 팝업 공지사항 훅 사용 (고급 팝업 시스템)
  const { popupNotice } = useAdvancedNoticePopup('public_design');

  // 팝업이 있을 때만 렌더링 (사용하지 않는 변수 경고 해결)
  if (popupNotice) {
    // 팝업이 있으면 처리할 로직을 여기에 추가할 수 있습니다
  }

  // 무한스크롤 콜백
  const loadMore = useCallback(() => {
    console.log('=== loadMore called ===');
    console.log('Current state:', {
      visibleCount,
      projectsLength: projects.length,
      hasMore,
    });

    if (visibleCount < projects.length) {
      const newCount = Math.min(visibleCount + 5, projects.length);
      console.log('Setting visibleCount to:', newCount);
      setVisibleCount(newCount);
      if (newCount >= projects.length) {
        console.log('Setting hasMore to false - all projects loaded');
        setHasMore(false);
      }
    } else {
      console.log('No more projects to load');
      setHasMore(false);
    }
  }, [visibleCount, projects.length]);

  // Intersection Observer 설정
  const lastElementRef = useCallback(
    (node: HTMLDivElement) => {
      console.log('lastElementRef called:', { node, loading, hasMore });
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        console.log(
          'Intersection Observer triggered:',
          entries[0].isIntersecting
        );
        if (entries[0].isIntersecting && hasMore) {
          console.log('Calling loadMore from Intersection Observer');
          loadMore();
        }
      });

      if (node) {
        console.log('Observing node:', node);
        observerRef.current.observe(node);
      }
    },
    [loading, hasMore, loadMore]
  );

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
          // hasMore 상태 업데이트
          setHasMore(projectsData.length > 5);
        } else {
          console.error('Failed to fetch projects from API');
          // 에러 시 기본 데이터 사용
          setProjects([
            {
              id: '1',
              name: '간판개선사업',
              description: '도시 경관을 아름답게 만드는 간판 개선 프로젝트',
              location: '서울시',
              listImages: [
                '/images/public-design/banner_improvment/2018/당진/list/02.jpg',
              ],
              categoryId: '1',
            },
            {
              id: '2',
              name: '환경개선사업',
              description: '도시 환경을 개선하는 공공디자인 프로젝트',
              location: '서울시',
              listImages: [
                '/images/public-design/env_improvememt/사당4동 가로환경개선/03.jpg',
              ],
              categoryId: '2',
            },
          ]);
          setHasMore(false); // 기본 데이터는 2개뿐이므로 더 이상 없음
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
            listImages: [
              '/images/public-design/banner_improvment/2018/당진/list/02.jpg',
            ],
            categoryId: '1',
          },
          {
            id: '2',
            name: '환경개선사업',
            description: '도시 환경을 개선하는 공공디자인 프로젝트',
            location: '서울시',
            listImages: [
              '/images/public-design/env_improvememt/사당4동 가로환경개선/03.jpg',
            ],
            categoryId: '2',
          },
        ]);
        setHasMore(false); // 기본 데이터는 2개뿐이므로 더 이상 없음
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // ProjectRow용 데이터로 변환하는 함수
  const convertToProjectRowData = (project: ProjectItem): BaseProjectItem[] => {
    return project.listImages.map((imageSrc) => ({
      id: parseInt(project.id) || 0,
      imageSrc: imageSrc,
      title: project.name,
      subtitle: project.location, // location을 subtitle로 전달
      description: project.description,
    }));
  };

  // 표시할 프로젝트들 (무한스크롤용)
  const visibleProjects = projects.slice(0, visibleCount);
  console.log('Current state:', {
    projectsLength: projects.length,
    visibleCount,
    visibleProjectsLength: visibleProjects.length,
    hasMore,
  });

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
            {visibleProjects.map((project, idx) => (
              <div
                key={project.id}
                className="h-[400px] cursor-pointer relative"
                ref={
                  idx === visibleProjects.length - 1 && hasMore
                    ? lastElementRef
                    : undefined
                }
              >
                <Link
                  href={`/public-design/${project.categoryId || project.id}`}
                >
                  <ProjectRow
                    projects={convertToProjectRowData(project)}
                    splitSmallSection={project.listImages.length >= 3}
                    showTitleOnLargeOnly={true}
                    rowIndex={idx}
                  />
                </Link>
              </div>
            ))}
            {hasMore && (
              <div className="flex justify-center items-center py-8">
                <button
                  onClick={() => {
                    console.log('Manual loadMore button clicked');
                    loadMore();
                  }}
                  className="ml-4 px-4 py-2 bg-blue-500 text-white rounded"
                >
                  프로젝트 더보기
                </button>
              </div>
            )}
          </div>
        )}
      </section>
      {/* Mobile Version */}
      <section className="px-4 pb-[12rem] lg:hidden md:hidden sm:hidden">
        {loading ? (
          <PublicDesignSkeleton />
        ) : (
          <div className="flex flex-col gap-8">
            {visibleProjects.map((project, idx) => (
              <div
                className="w-full h-[400px] cursor-pointer"
                key={project.id}
                ref={
                  idx === visibleProjects.length - 1
                    ? lastElementRef
                    : undefined
                }
                onClick={() =>
                  router.push(
                    `/public-design/${project.categoryId || project.id}`
                  )
                }
              >
                <div className="relative w-full h-full">
                  <Image
                    src={project.listImages[0]}
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
            {hasMore && (
              <div className="flex justify-center py-8">
                <div className="text-gray-500">
                  더 많은 프로젝트를 불러오는 중...
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
