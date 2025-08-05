import { NextResponse } from 'next/server';
import { supabase } from '@/src/app/api/supabase';

export async function GET() {
  try {
    // 공공디자인 프로젝트 리스트 가져오기 (design_contents_type이 'list'인 것들)
    const { data: projects, error } = await supabase
      .from('public_design_contents')
      .select('*')
      .eq('design_contents_type', 'list')
      .eq('is_active', true)
      .in('project_category', ['banner_improvement', 'env_improvement'])
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching public design projects:', error);
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }

    // 데이터 변환
    const transformedProjects = projects.map((project) => ({
      id: project.id,
      name: project.title || '',
      description: project.description || '',
      location: project.location || '',
      listImages: (
        project.image_urls || ['/images/public-design-image2.jpeg']
      ).map((url: string) => {
        // 상대 경로를 Supabase Storage URL로 변환
        if (url.startsWith('/images/')) {
          const storagePath = url.replace('/images/', '');
          return `https://eklijrstdcgsxtbjxjra.supabase.co/storage/v1/object/public/public-design-items/${storagePath}`;
        }
        return url;
      }),
      categoryId: project.project_category,
    }));

    return NextResponse.json(transformedProjects);
  } catch (error) {
    console.error('Error in public design projects API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
