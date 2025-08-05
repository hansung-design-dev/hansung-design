'use client';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProjectCard from '@/src/components/projectCard';

import { PublicDesignDetailResponse } from '@/src/types/public-design';
import PublicDesignDesktopSkeleton from '@/src/components/skeleton/PublicDesignDesktopSkeleton';

interface ProjectItem {
  id: string;
  name: string;
  description: string;
  location: string;
  listImages: string[];
  categoryId: string;
  displayOrder: number;
  layout?: 'largeFirst' | 'smallFirst';
  imageCount?: number;
}

export default function PublicDesignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectCategory = params.project_category as string;
  const displayOrder = params.display_order as string;

  const [projectData, setProjectData] =
    useState<PublicDesignDetailResponse | null>(null);
  const [listProjectData, setListProjectData] = useState<ProjectItem | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectDetail = async () => {
      try {
        // 1. URL 파라미터에서 리스트 데이터 가져오기
        const urlParams = new URLSearchParams(window.location.search);
        const dataParam = urlParams.get('data');

        if (dataParam) {
          try {
            const listData = JSON.parse(decodeURIComponent(dataParam));
            const projectItem: ProjectItem = {
              id: `${projectCategory}-${displayOrder}`,
              name: listData.name,
              description: listData.description,
              location: listData.location,
              listImages: listData.images,
              categoryId: projectCategory,
              displayOrder: parseInt(displayOrder),
              layout: listData.layout || 'largeFirst',
              imageCount: listData.imageCount || listData.images.length,
            };
            console.log('Setting list data from URL:', projectItem);
            setListProjectData(projectItem);
          } catch (parseError) {
            console.error('Error parsing URL data:', parseError);
          }
        }

        // 2. 상세 데이터 가져오기
        const response = await fetch(
          `/api/public-design-projects/${projectCategory}/${displayOrder}`
        );
        if (response.ok) {
          const data = await response.json();
          console.log('Detail page data:', data);
          setProjectData(data);
        } else {
          console.error('Failed to fetch project detail');
          setProjectData(null);
        }
      } catch (error) {
        console.error('Error fetching project detail:', error);
        setProjectData(null);
      } finally {
        setLoading(false);
      }
    };

    if (projectCategory && displayOrder) {
      fetchProjectDetail();
    }
  }, [projectCategory, displayOrder]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white py-[6rem] lg:px-[8rem] sm:px-2 md:px-2">
        <PublicDesignDesktopSkeleton variant="detail" />
      </main>
    );
  }

  if (!projectData || !listProjectData) {
    return (
      <main className="min-h-screen bg-white py-[6rem] lg:px-[8rem] sm:px-2 md:px-2">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">프로젝트를 찾을 수 없습니다.</div>
        </div>
      </main>
    );
  }

  // 리스트 페이지의 이미지 구성과 동일하게 상단 구성
  const listImages = listProjectData.listImages;
  const layout = listProjectData.layout || 'largeFirst';
  const imageCount = listProjectData.imageCount || listImages.length;

  // 이미지 구성을 동적으로 생성
  const renderImageLayout = () => {
    if (imageCount === 1) {
      return (
        <div className="col-span-3 lg:h-[32rem] sm:h-[23rem]">
          <ProjectCard
            imageSrc={listImages[0] || '/images/public-design-image2.jpeg'}
            title={listProjectData.name}
            subtitle={listProjectData.location}
            description={listProjectData.description}
            isLarge={true}
            className="h-full"
          />
        </div>
      );
    }

    if (imageCount === 2) {
      if (layout === 'largeFirst') {
        return (
          <>
            <div className="col-span-2 lg:h-[32rem] sm:h-[23rem]">
              <ProjectCard
                imageSrc={listImages[0]}
                title={listProjectData.name}
                subtitle={listProjectData.location}
                description={listProjectData.description}
                isLarge={true}
                className="h-full"
              />
            </div>
            <div className="col-span-1 lg:h-[32rem] sm:h-[23rem]">
              <ProjectCard
                imageSrc={listImages[1]}
                title=""
                subtitle=""
                description=""
                className="h-full"
              />
            </div>
          </>
        );
      } else {
        return (
          <>
            <div className="col-span-1 lg:h-[32rem] sm:h-[23rem]">
              <ProjectCard
                imageSrc={listImages[0]}
                title=""
                subtitle=""
                description=""
                className="h-full"
              />
            </div>
            <div className="col-span-2 lg:h-[32rem] sm:h-[23rem]">
              <ProjectCard
                imageSrc={listImages[1]}
                title={listProjectData.name}
                subtitle={listProjectData.location}
                description={listProjectData.description}
                isLarge={true}
                className="h-full"
              />
            </div>
          </>
        );
      }
    }

    if (imageCount >= 3) {
      if (layout === 'largeFirst') {
        return (
          <>
            <div className="col-span-2 lg:h-[32rem] sm:h-[23rem]">
              <ProjectCard
                imageSrc={listImages[0]}
                title={listProjectData.name}
                subtitle={listProjectData.location}
                description={listProjectData.description}
                isLarge={true}
                className="h-full"
              />
            </div>
            <div className="col-span-1 lg:h-[32rem] sm:h-[23rem]">
              <div className="grid grid-rows-2 gap-6 h-full">
                <ProjectCard
                  imageSrc={listImages[1]}
                  title=""
                  subtitle=""
                  description=""
                  className="h-full"
                />
                <ProjectCard
                  imageSrc={listImages[2]}
                  title=""
                  subtitle=""
                  description=""
                  className="h-full"
                />
              </div>
            </div>
          </>
        );
      } else {
        return (
          <>
            <div className="col-span-1 lg:h-[32rem] sm:h-[23rem]">
              <div className="grid grid-rows-2 gap-6 h-full">
                <ProjectCard
                  imageSrc={listImages[0]}
                  title=""
                  subtitle=""
                  description=""
                  className="h-full"
                />
                <ProjectCard
                  imageSrc={listImages[1]}
                  title=""
                  subtitle=""
                  description=""
                  className="h-full"
                />
              </div>
            </div>
            <div className="col-span-2 lg:h-[32rem] sm:h-[23rem]">
              <ProjectCard
                imageSrc={listImages[2]}
                title={listProjectData.name}
                subtitle={listProjectData.location}
                description={listProjectData.description}
                isLarge={true}
                className="h-full"
              />
            </div>
          </>
        );
      }
    }

    return null;
  };

  return (
    <main className="min-h-screen bg-white py-[6rem] lg:px-[8rem] sm:px-2 md:px-2">
      {/* 뒤로가기 버튼 */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 12H5M12 19L5 12L12 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          뒤로가기
        </button>
      </div>

      {/* 상단: 리스트 페이지와 동일한 이미지 구성 */}
      <section className="mx-auto mb-12">
        <div className="grid grid-cols-3 gap-6 lg:h-[32rem] sm:h-[23rem]">
          {renderImageLayout()}
        </div>
      </section>

      {/* 디자인 구성 이미지 리스트 */}
      <section className="container mx-auto px-4 flex flex-col gap-12">
        {projectData.detailContents.map((content) => (
          <div key={content.id} className="flex flex-col gap-6">
            {content.image_urls &&
              content.image_urls.map((imageUrl, index) => (
                <div
                  key={`${content.id}-${index}`}
                  className="relative w-full h-auto min-h-[200px]"
                >
                  <Image
                    src={imageUrl}
                    alt={`${
                      content.alt_text || content.title || '디자인 이미지'
                    } ${index + 1}`}
                    width={1200}
                    height={600}
                    className="w-full h-auto rounded-2xl object-contain"
                    quality={90}
                  />
                </div>
              ))}
          </div>
        ))}
      </section>
    </main>
  );
}
