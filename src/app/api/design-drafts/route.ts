import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/app/api/supabase';

// 시안 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const orderId = searchParams.get('orderId');

    switch (action) {
      case 'getByOrder':
        if (!orderId) {
          return NextResponse.json(
            { success: false, error: 'Order ID is required' },
            { status: 400 }
          );
        }

        const { data: drafts, error } = await supabase
          .from('design_drafts')
          .select('*')
          .eq('order_id', orderId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({
          success: true,
          data: drafts,
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Design drafts API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 시안 생성/수정
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, orderId, userProfileId, adminProfileId, draftId, ...data } =
      body;

    switch (action) {
      case 'createDraft':
        // 새로운 시안 생성
        const { data: newDraft, error: createError } = await supabase
          .from('design_drafts')
          .insert({
            order_id: orderId,
            user_profile_id: userProfileId,
            admin_profile_id: adminProfileId,
            draft_category: 'initial',
            notes: '시안 업로드 대기',
          })
          .select()
          .single();

        if (createError) throw createError;

        // orders 테이블의 design_drafts_id 업데이트
        await supabase
          .from('orders')
          .update({ design_drafts_id: newDraft.id })
          .eq('id', orderId);

        return NextResponse.json({
          success: true,
          data: newDraft,
        });

      case 'updateDraft':
        // 기존 시안 수정
        const { data: updatedDraft, error: updateError } = await supabase
          .from('design_drafts')
          .update({
            file_name: data.file_name,
            file_url: data.file_url,
            file_extension: data.file_extension,
            file_size: data.file_size,
            notes: data.notes,
            draft_category: 'revision',
            updated_at: new Date().toISOString(),
          })
          .eq('id', draftId)
          .select()
          .single();

        if (updateError) throw updateError;

        return NextResponse.json({
          success: true,
          data: updatedDraft,
        });

      case 'approveDraft':
        // 시안 승인
        const { data: approvedDraft, error: approveError } = await supabase
          .from('design_drafts')
          .update({
            is_approved: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', draftId)
          .select()
          .single();

        if (approveError) throw approveError;

        return NextResponse.json({
          success: true,
          data: approvedDraft,
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Design drafts API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
