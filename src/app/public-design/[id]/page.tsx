'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProjectCard from '@/src/components/projectCard';
import { PublicDesignDetailResponse } from '@/src/types/public-design';
import PublicDesignDesktopSkeleton from '@/src/components/skeleton/PublicDesignDesktopSkeleton';

export default function PublicDesignDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [projectData, setProjectData] =
    useState<PublicDesignDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectDetail = async () => {
      try {
        // DB에서 프로젝트 상세 정보 가져오기
        const response = await fetch(`/api/public-design-projects/${id}`);
        if (response.ok) {
          const data = await response.json();
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

    if (id) {
      fetchProjectDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white py-[6rem] lg:px-[8rem] sm:px-2 md:px-2">
        <PublicDesignDesktopSkeleton variant="detail" />
      </main>
    );
  }

  if (
    !projectData ||
    !projectData.projects ||
    projectData.projects.length === 0
  ) {
    return (
      <main className="min-h-screen bg-white py-[6rem] lg:px-[8rem] sm:px-2 md:px-2">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">프로젝트를 찾을 수 없습니다.</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white py-[6rem] lg:px-[8rem] sm:px-2 md:px-2">
      {/* 상단: ProjectCard 사용 */}
      <section className="mx-auto mb-12">
        <div className="grid grid-cols-3 gap-6 lg:h-[32rem] sm:h-[23rem]">
          <div className="col-span-2 lg:h-[32rem] sm:h-[23rem]">
            <ProjectCard
              imageSrc={
                projectData.projects?.[0]?.image_url ||
                '/images/public-design-image2.jpeg'
              }
              title={projectData.projects?.[0]?.title || ''}
              subtitle={projectData.projects?.[0]?.subtitle || ''}
              description={projectData.projects?.[0]?.description || ''}
              isLarge={true}
              className="h-full"
            />
          </div>
          <div className="col-span-1 lg:h-[32rem] sm:h-[23rem]">
            <ProjectCard
              imageSrc={
                projectData.projects?.[0]?.image_url ||
                '/images/public-design-image2.jpeg'
              }
              title=""
              subtitle=""
              description=""
              className="h-full"
            />
          </div>
        </div>
      </section>

      {/* 디자인 구성 이미지 리스트 */}
      <section className="container mx-auto px-4 flex flex-col gap-12">
        {projectData.detailContents.map((content) => (
          <div
            key={content.id}
            className="relative w-full h-auto min-h-[200px]"
          >
            <Image
              src={content.image_url || '/images/public-design-image2.jpeg'}
              alt={content.alt_text || content.title || '디자인 이미지'}
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
