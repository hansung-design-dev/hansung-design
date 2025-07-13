import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/app/api/supabase';

// 결제수단 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'getPaymentMethods':
        const { data: paymentMethods, error } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (error) throw error;

        return NextResponse.json({
          success: true,
          data: paymentMethods,
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Payment API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 결제 처리
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      action,
      orderId,
      paymentMethodId,
      amount,
      userAuthId,
      userProfileId,
    } = body;

    switch (action) {
      case 'processPayment':
        // 1. 결제수단 정보 조회
        const { data: paymentMethod, error: methodError } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('id', paymentMethodId)
          .single();

        if (methodError || !paymentMethod) {
          throw new Error('Invalid payment method');
        }

        // 2. 결제 정보 생성
        const { data: payment, error: paymentError } = await supabase
          .from('payments')
          .insert({
            order_id: orderId,
            payment_method_id: paymentMethodId,
            amount: amount,
            payment_status: paymentMethod.requires_admin_approval
              ? 'pending'
              : 'completed',
            payment_date: paymentMethod.requires_admin_approval
              ? null
              : new Date().toISOString(),
            admin_approval_status: paymentMethod.requires_admin_approval
              ? 'pending'
              : 'approved',
          })
          .select()
          .single();

        if (paymentError) throw paymentError;

        // 3. 주문 상태 업데이트
        let orderStatus = 'pending';
        let adminApprovalStatus = 'pending';

        if (paymentMethod.requires_admin_approval) {
          orderStatus = 'waiting_admin_approval';
        } else {
          orderStatus = 'completed';
          adminApprovalStatus = 'approved';
        }

        const { error: orderError } = await supabase
          .from('orders')
          .update({
            payment_method_id: paymentMethodId,
            payment_status: orderStatus,
            admin_approval_status: adminApprovalStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId);

        if (orderError) throw orderError;

        // 4. 시안 업로드 준비 (결제 완료 시)
        if (orderStatus === 'completed' && userProfileId) {
          const { data: draft, error: draftError } = await supabase
            .from('design_drafts')
            .insert({
              order_id: orderId,
              user_profile_id: userProfileId,
              draft_category: 'initial',
              notes: '결제 완료 후 초기 시안 업로드 대기',
            })
            .select()
            .single();

          if (draftError) {
            console.warn('Failed to create draft record:', draftError);
          } else {
            // orders 테이블의 design_drafts_id 업데이트
            await supabase
              .from('orders')
              .update({ design_drafts_id: draft.id })
              .eq('id', orderId);
          }
        }

        return NextResponse.json({
          success: true,
          data: {
            payment,
            orderStatus,
            paymentMethod,
            redirectUrl:
              orderStatus === 'completed' ? '/mypage/design' : '/mypage/orders',
          },
        });

      case 'requestAdminApproval':
        // 공공기관/기관용 사용자의 어드민 승인 요청
        const { error: approvalError } = await supabase
          .from('orders')
          .update({
            payment_status: 'waiting_admin_approval',
            admin_approval_status: 'pending',
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId);

        if (approvalError) throw approvalError;

        return NextResponse.json({
          success: true,
          data: { redirectUrl: '/mypage/orders' },
        });

      case 'approvePayment':
        // 어드민이 결제 승인
        const { adminProfileId, adminNotes } = body;

        // 결제 정보 업데이트
        const { error: paymentUpdateError } = await supabase
          .from('payments')
          .update({
            payment_status: 'completed',
            payment_date: new Date().toISOString(),
            admin_approval_status: 'approved',
            admin_notes: adminNotes,
          })
          .eq('order_id', orderId);

        if (paymentUpdateError) throw paymentUpdateError;

        // 주문 상태 업데이트
        const { error: orderUpdateError } = await supabase
          .from('orders')
          .update({
            payment_status: 'completed',
            admin_approval_status: 'approved',
            admin_notes: adminNotes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId);

        if (orderUpdateError) throw orderUpdateError;

        // 시안 업로드 준비
        if (userProfileId) {
          const { data: draft, error: draftError } = await supabase
            .from('design_drafts')
            .insert({
              order_id: orderId,
              user_profile_id: userProfileId,
              draft_category: 'initial',
              notes: '어드민 승인 후 초기 시안 업로드 대기',
            })
            .select()
            .single();

          if (draftError) {
            console.warn('Failed to create draft record:', draftError);
          } else {
            // orders 테이블의 design_drafts_id 업데이트
            await supabase
              .from('orders')
              .update({ design_drafts_id: draft.id })
              .eq('id', orderId);
          }
        }

        return NextResponse.json({
          success: true,
          data: { redirectUrl: '/mypage/design' },
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Payment API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
