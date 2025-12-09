import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/app/api/supabase';

export async function GET(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ project_category: string; display_order: string }> }
) {
  try {
    const { project_category, display_order } = await params;
    const displayOrderNum = parseInt(display_order);

    console.log('API params:', {
      project_category,
      display_order,
      displayOrderNum,
    });

    // 프로젝트 기본 정보 가져오기 (list 타입들)
    const { data: projectDataList, error: projectError } = await supabase
      .from('public_design_contents')
      .select('*')
      .eq('project_category', project_category)
      .eq('design_contents_type', 'list')
      .eq('display_order', displayOrderNum)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    console.log('Project data found:', projectDataList);

    if (projectError) {
      console.error('Error fetching project:', projectError);
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (!projectDataList || projectDataList.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // 상세 이미지들 가져오기 (detail 타입) - parent_id 기반으로 우선 조회 후 fallback
    const buildDetailQuery = (
      filters: Record<string, string | number>
    ) => {
      let query = supabase
        .from('public_design_contents')
        .select('*')
        .eq('project_category', project_category)
        .eq('design_contents_type', 'detail')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      for (const [column, value] of Object.entries(filters)) {
        query = query.eq(column, value);
      }

      return query;
    };

    type DetailQueryResult = Awaited<ReturnType<typeof buildDetailQuery>>;
    let detailQueryResult: DetailQueryResult | null = null;

    const listProject = projectDataList[0];

    if (listProject?.id) {
      detailQueryResult = await buildDetailQuery({ parent_id: listProject.id });
    }

    if (
      !detailQueryResult ||
      detailQueryResult.data?.length === 0
    ) {
      detailQueryResult = await buildDetailQuery({ display_order: displayOrderNum });
    }

    if (detailQueryResult.error) {
      console.error('Error fetching detail contents:', detailQueryResult.error);
      return NextResponse.json(
        { error: 'Failed to fetch detail contents' },
        { status: 500 }
      );
    }

    const detailContents = detailQueryResult.data || [];

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
        image_urls: content.image_urls || ['/images/public-design-image2.jpeg'],
        display_order: content.display_order,
        is_active: content.is_active,
        created_at: content.created_at,
        updated_at: content.updated_at,
        parent_id: content.parent_id,
      })),
      listData: {
        id: projectDataList[0]?.id || '',
        name: projectDataList[0]?.title || '',
        description: projectDataList[0]?.description || '',
        location: projectDataList[0]?.location || '',
        listImages: (
          projectDataList[0]?.image_urls || [
            '/images/public-design-image2.jpeg',
          ]
        ).map((url: string) => {
          // 상대 경로를 Supabase Storage URL로 변환
          if (url.startsWith('/images/')) {
            const storagePath = url.replace('/images/', '');
            return `https://eklijrstdcgsxtbjxjra.supabase.co/storage/v1/object/public/public-design-items/${storagePath}`;
          }
          return url;
        }),
        categoryId: projectDataList[0]?.project_category || '',
        displayOrder: projectDataList[0]?.display_order || 1,
      },
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
