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
        const response = await fetch(`/api/public-design-projects/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            console.error('Project not found');
            setProjectData(null);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProjectData(data);
      } catch (error) {
        console.error('Error fetching project detail:', error);
        // 에러 시 기본 데이터 사용
        setProjectData({
          project: {
            id: '1',
            project_id: '1',
            design_contents_type: 'list',
            title: '브랜드 아이템',
            subtitle: '간판개선사업',
            description: '도시의 새로운 경험을 만드는 브랜드',
            image_url: '/images/public-design-image2.jpeg',
            display_order: 1,
            is_active: true,
            created_at: '',
            updated_at: '',
          },
          detailContents: [
            {
              id: '1',
              project_id: '1',
              design_contents_type: 'detail',
              title: '디자인 구성도',
              alt_text: '디자인 구성도',
              image_url: '/images/publicdesign-detailpage-image.png',
              display_order: 1,
              is_active: true,
              created_at: '',
              updated_at: '',
            },
            {
              id: '2',
              project_id: '1',
              design_contents_type: 'detail',
              title: '디자인 상세 이미지1',
              alt_text: '디자인 상세 이미지1',
              image_url: '/images/public-design-image2.jpeg',
              display_order: 2,
              is_active: true,
              created_at: '',
              updated_at: '',
            },
            {
              id: '3',
              project_id: '1',
              design_contents_type: 'detail',
              title: '디자인 상세 이미지2',
              alt_text: '디자인 상세 이미지2',
              image_url: '/images/public-design-image2.jpeg',
              display_order: 3,
              is_active: true,
              created_at: '',
              updated_at: '',
            },
          ],
        });
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

  if (!projectData) {
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
                projectData.project.image_url ||
                '/images/public-design-image2.jpeg'
              }
              title={projectData.project.title || ''}
              subtitle={projectData.project.subtitle || ''}
              description={projectData.project.description || ''}
              isLarge={true}
              className="h-full"
            />
          </div>
          <div className="col-span-1 lg:h-[32rem] sm:h-[23rem]">
            <ProjectCard
              imageSrc={
                projectData.project.image_url ||
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
