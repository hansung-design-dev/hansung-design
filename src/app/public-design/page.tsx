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
  listImages: string[];
  categoryId: string;
  displayOrder: number;
  uniqueId: string;
}

export default function PublicDesignPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [homepageContent, setHomepageContent] =
    useState<HomepageContent | null>(null);
  const [visibleCount, setVisibleCount] = useState(5); // 초기 5개만 보여주기
  const [hasMore, setHasMore] = useState(true);
  const [scrollToIndex, setScrollToIndex] = useState<number | null>(null);

  // 팝업 공지사항 훅 사용 (고급 팝업 시스템)
  const { popupNotice } = useAdvancedNoticePopup('public_design');

  // 팝업이 있을 때만 렌더링 (사용하지 않는 변수 경고 해결)
  if (popupNotice) {
    // 팝업이 있으면 처리할 로직을 여기에 추가할 수 있습니다
  }

  // 디버깅을 위한 상태 변화 추적
  useEffect(() => {
    console.log('🔄 State changed:', {
      visibleCount,
      hasMore,
      projectsLength: projects.length,
      loading,
    });
  }, [visibleCount, hasMore, projects.length, loading]);

  // 스크롤 위치 감지 (최적화된 버전)
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop =
            window.pageYOffset || document.documentElement.scrollTop;
          const windowHeight = window.innerHeight;
          const documentHeight = document.documentElement.scrollHeight;
          const scrollPercentage = (scrollTop + windowHeight) / documentHeight;

          // 스크롤이 하단 80% 지점에 도달하면 더 많은 아이템 로드
          if (scrollPercentage > 0.8 && hasMore && !loading) {
            console.log('🚀 Loading more items from scroll...');
            setVisibleCount((prevCount) => {
              const newCount = Math.min(prevCount + 5, projects.length);

              if (newCount >= projects.length) {
                setHasMore(false);
              }

              return newCount;
            });
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading, projects.length]);

  useEffect(() => {
    // URL 파라미터에서 스크롤할 인덱스 확인 - 즉시 실행
    const urlParams = new URLSearchParams(window.location.search);
    const scrollToParam = urlParams.get('scrollTo');
    if (scrollToParam) {
      const index = parseInt(scrollToParam);
      if (!isNaN(index)) {
        setScrollToIndex(index);
        // URL에서 파라미터 제거
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }

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
          console.log('Fetched projects:', projectsData);
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
              displayOrder: 1,
              uniqueId: '1-1',
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
              displayOrder: 2,
              uniqueId: '2-2',
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
            displayOrder: 1,
            uniqueId: '1-1',
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
            displayOrder: 2,
            uniqueId: '2-2',
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
    loading,
    lastVisibleIndex: visibleProjects.length - 1,
  });

  // 스크롤할 인덱스가 있으면 해당 위치로 스크롤 - 최적화된 버전
  useEffect(() => {
    if (scrollToIndex !== null && !loading) {
      // 필요한 경우 더 많은 아이템을 로드
      if (scrollToIndex >= visibleCount) {
        const requiredCount = Math.min(scrollToIndex + 5, projects.length);
        setVisibleCount(requiredCount);
        return; // 다음 렌더링에서 스크롤 실행
      }

      // 즉시 스크롤 실행
      const targetElement = document.querySelector(
        `[data-project-index="${scrollToIndex}"]`
      );
      if (targetElement) {
        // 스크롤 위치를 미리 계산하여 더 빠른 스크롤
        const elementRect = targetElement.getBoundingClientRect();
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
        const targetScrollTop =
          scrollTop + elementRect.top - window.innerHeight / 2;

        window.scrollTo({
          top: targetScrollTop,
          behavior: 'instant',
        });

        setScrollToIndex(null);
      }
    }
  }, [scrollToIndex, loading, visibleCount, projects.length]);

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
                data-project-index={idx}
              >
                <Link
                  href={`/public-design/${project.categoryId}/${
                    project.displayOrder || 1
                  }?data=${encodeURIComponent(
                    JSON.stringify({
                      name: project.name,
                      description: project.description,
                      location: project.location,
                      images: project.listImages,
                      layout: idx % 2 === 0 ? 'largeFirst' : 'smallFirst',
                      imageCount: project.listImages.length,
                      listIndex: idx,
                    })
                  )}`}
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
                data-project-index={idx}
                onClick={() =>
                  router.push(
                    `/public-design/${project.categoryId}/${
                      project.displayOrder || 1
                    }?data=${encodeURIComponent(
                      JSON.stringify({
                        name: project.name,
                        description: project.description,
                        location: project.location,
                        images: project.listImages,
                        layout: idx % 2 === 0 ? 'largeFirst' : 'smallFirst',
                        imageCount: project.listImages.length,
                        listIndex: idx,
                      })
                    )}`
                  )
                }
              >
                <div className="relative w-full h-full">
                  <Image
                    src={project.listImages[0]}
                    alt={project.name}
                    fill
                    className="object-cover rounded-[1rem]"
                    quality={85}
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
