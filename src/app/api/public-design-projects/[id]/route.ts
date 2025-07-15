import { supabase } from '@/src/app/api/supabase';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 숫자 ID를 display_order로 변환하여 조회
    const displayOrder = parseInt(id);

    // 프로젝트 정보 조회 (list 타입)
    const { data: project, error: projectError } = await supabase
      .from('public_design_contents')
      .select('*')
      .eq('display_order', displayOrder)
      .eq('design_contents_type', 'list')
      .eq('is_active', true)
      .single();

    if (projectError) {
      console.error('Error fetching project:', projectError);
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // 프로젝트의 상세 이미지들 조회 (같은 project_id의 detail 타입들)
    const { data: detailContents, error: detailError } = await supabase
      .from('public_design_contents')
      .select('*')
      .eq('project_id', project.project_id)
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

    return NextResponse.json({
      project,
      detailContents: detailContents || [],
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
