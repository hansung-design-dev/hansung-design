'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProjectCard from '@/src/components/projectCard';
import { PublicDesignDetailResponse } from '@/src/types/public-design';
import PublicDesignDesktopSkeleton from '@/src/components/skeleton/PublicDesignDesktopSkeleton';
import { getCategoryById } from '@/src/mock/public-design';

export default function PublicDesignDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [projectData, setProjectData] =
    useState<PublicDesignDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectDetail = async () => {
      try {
        // 로컬 데이터에서 카테고리 정보 가져오기
        const category = getCategoryById(id);
        if (!category) {
          console.error('Category not found');
          setProjectData(null);
          return;
        }

        // PublicDesignDetailResponse 형식으로 변환
        const transformedData: PublicDesignDetailResponse = {
          project: {
            id: category.id.toString(),
            project_id: category.id.toString(),
            design_contents_type: 'list',
            title: category.name,
            subtitle: category.description,
            description: category.description,
            image_url: category.listImage[0], // 첫 번째 이미지 사용
            display_order: 1,
            is_active: true,
            created_at: '',
            updated_at: '',
          },
          detailContents: category.detailImages.map((imageUrl, index) => ({
            id: `${category.id}-${index + 1}`,
            project_id: category.id.toString(),
            design_contents_type: 'detail',
            title: `${category.name} 상세 이미지 ${index + 1}`,
            alt_text: `${category.name} 상세 이미지 ${index + 1}`,
            image_url: imageUrl,
            display_order: index + 1,
            is_active: true,
            created_at: '',
            updated_at: '',
          })),
        };

        setProjectData(transformedData);
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
