import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/app/api/supabase';

// 시안 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const orderId = searchParams.get('orderId');
    const userAuthId = searchParams.get('userAuthId');

    switch (action) {
      case 'getDrafts':
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

      case 'getUserDrafts':
        if (!userAuthId) {
          return NextResponse.json(
            { success: false, error: 'User Auth ID is required' },
            { status: 400 }
          );
        }

        const { data: userDrafts, error: userError } = await supabase
          .from('design_drafts')
          .select(
            `
            *,
            orders (
              id,
              order_number,
              total_amount,
              payment_status
            )
          `
          )
          .eq('user_auth_id', userAuthId)
          .order('created_at', { ascending: false });

        if (userError) throw userError;

        return NextResponse.json({
          success: true,
          data: userDrafts,
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Drafts API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 시안 생성/업데이트
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, draftData } = body;

    switch (action) {
      case 'createDraft':
        const { data: newDraft, error: createError } = await supabase
          .from('design_drafts')
          .insert(draftData)
          .select()
          .single();

        if (createError) throw createError;

        return NextResponse.json({
          success: true,
          data: newDraft,
        });

      case 'updateDraft':
        const { id, ...updateData } = draftData;
        const { data: updatedDraft, error: updateError } = await supabase
          .from('design_drafts')
          .update({
            ...updateData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();

        if (updateError) throw updateError;

        return NextResponse.json({
          success: true,
          data: updatedDraft,
        });

      case 'approveDraft':
        const { draftId, adminId, adminNotes } = draftData;
        const { data: approvedDraft, error: approveError } = await supabase
          .from('design_drafts')
          .update({
            upload_status: 'approved',
            admin_id: adminId,
            admin_notes: adminNotes,
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

      case 'rejectDraft':
        const {
          draftId: rejectDraftId,
          adminId: rejectAdminId,
          adminNotes: rejectNotes,
        } = draftData;
        const { data: rejectedDraft, error: rejectError } = await supabase
          .from('design_drafts')
          .update({
            upload_status: 'rejected',
            admin_id: rejectAdminId,
            admin_notes: rejectNotes,
            is_approved: false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', rejectDraftId)
          .select()
          .single();

        if (rejectError) throw rejectError;

        return NextResponse.json({
          success: true,
          data: rejectedDraft,
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Drafts API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
