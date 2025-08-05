import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/app/api/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 프로젝트 기본 정보 가져오기 (list 타입들)
    const { data: projectDataList, error: projectError } = await supabase
      .from('public_design_contents')
      .select('*')
      .eq('project_category', id)
      .eq('design_contents_type', 'list')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (projectError) {
      console.error('Error fetching project:', projectError);
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (!projectDataList || projectDataList.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // 상세 이미지들 가져오기 (detail 타입)
    const { data: detailContents, error: detailError } = await supabase
      .from('public_design_contents')
      .select('*')
      .eq('project_category', id)
      .eq('design_contents_type', 'detail')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (detailError) {
      console.error('Error fetching detail contents:', detailError);
      return NextResponse.json(
        { error: 'Failed to fetch detail contents' },
        { status: 500 }
      );
    }

    // 응답 데이터 구성
    const response = {
      projects: projectDataList.map((projectData) => ({
        id: projectData.id,
        project_id: projectData.project_category,
        design_contents_type: projectData.design_contents_type,
        title: projectData.title || '',
        subtitle: projectData.description || '',
        description: projectData.description || '',
        image_url:
          projectData.image_urls && projectData.image_urls.length > 0
            ? projectData.image_urls[0]
            : '/images/public-design-image2.jpeg',
        display_order: projectData.display_order,
        is_active: projectData.is_active,
        created_at: projectData.created_at,
        updated_at: projectData.updated_at,
      })),
      detailContents: detailContents.map((content) => ({
        id: content.id,
        project_id: content.project_category,
        design_contents_type: content.design_contents_type,
        title: content.title || '',
        alt_text: content.alt_text || '',
        image_url:
          content.image_urls && content.image_urls.length > 0
            ? content.image_urls[0]
            : '/images/public-design-image2.jpeg',
        display_order: content.display_order,
        is_active: content.is_active,
        created_at: content.created_at,
        updated_at: content.updated_at,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in public design project detail API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
