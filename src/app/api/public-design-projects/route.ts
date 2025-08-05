import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/app/api/supabase';

export async function GET(request: NextRequest) {
  try {
    // 공공디자인 프로젝트 리스트 가져오기 (design_contents_type이 'list'인 것들)
    const { data: projects, error } = await supabase
      .from('public_design_contents')
      .select('*')
      .eq('design_contents_type', 'list')
      .eq('is_active', true)
      .eq('project_category', 'banner_improvement')
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
      listImage:
        project.image_urls && project.image_urls.length > 0
          ? project.image_urls[0]
          : '/images/public-design-image2.jpeg',
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
