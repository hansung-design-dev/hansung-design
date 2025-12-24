'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import PublicDesignDesktopSkeleton from '@/src/components/skeleton/PublicDesignDesktopSkeleton';
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

function PublicDesignGridCard({
  project,
  index,
}: {
  project: ProjectItem;
  index: number;
}) {
  const fallbackSrc = '/images/public-design/landing.png';
  const [imgSrc, setImgSrc] = useState<string>(
    project.listImages?.[0] || fallbackSrc
  );

  return (
    <Link
      data-project-index={index}
      href={`/public-design/${project.categoryId}/${
        project.displayOrder || 1
      }?data=${encodeURIComponent(
        JSON.stringify({
          name: project.name,
          description: project.description,
          location: project.location,
          images: project.listImages,
          // 상세 상단 레이아웃은 기존 로직 유지 (리스트는 단조롭게)
          layout: index % 2 === 0 ? 'largeFirst' : 'smallFirst',
          imageCount: project.listImages.length,
          listIndex: index,
        })
      )}`}
      className="w-full max-w-[23rem] group"
    >
      <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-gray-100">
        <Image
          src={imgSrc}
          alt={project.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 33vw"
          className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          quality={85}
          onError={() => setImgSrc(fallbackSrc)}
        />
      </div>

      <div className="pt-4">
        <div className="text-1.25 font-[700] text-black font-gmarket line-clamp-1">
          {project.name}
        </div>
        {project.location && (
          <div className="mt-1 text-0.875 text-gray-600 line-clamp-1">
            {project.location}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function PublicDesignPage() {
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
            sizes="100vw"
            className="object-cover sm:object-left-top"
            priority
          />
        </div>
      </section>
      {/* Projects Grid Section for lg/md */}
      <section className="lg:container lg:mx-auto lg:px-[8rem] sm:px-[1.5rem] lg:pb-[12rem] md:pb-[12rem] sm:pb-[1rem]">
        {loading ? (
          <PublicDesignDesktopSkeleton />
        ) : (
          <div className="grid lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-1 gap-8 justify-items-center">
            {visibleProjects.map((project, idx) => (
              <PublicDesignGridCard
                key={project.id}
                project={project}
                index={idx}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
