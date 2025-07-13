import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/app/api/supabase';

// 주문 검증 정보 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const orderId = searchParams.get('orderId');

    switch (action) {
      case 'getVerification':
        if (!orderId) {
          return NextResponse.json(
            { success: false, error: 'Order ID is required' },
            { status: 400 }
          );
        }

        const { data: verification, error } = await supabase
          .from('order_verifications')
          .select('*')
          .eq('order_id', orderId)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        return NextResponse.json({
          success: true,
          data: verification,
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Order verification API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 주문 검증 정보 생성/업데이트
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, verificationData } = body;

    switch (action) {
      case 'createVerification':
        const { data: newVerification, error: createError } = await supabase
          .from('order_verifications')
          .insert(verificationData)
          .select()
          .single();

        if (createError) throw createError;

        return NextResponse.json({
          success: true,
          data: newVerification,
        });

      case 'updateVerification':
        const { id, ...updateData } = verificationData;
        const { data: updatedVerification, error: updateError } = await supabase
          .from('order_verifications')
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
          data: updatedVerification,
        });

      case 'markAsPaid':
        const { orderId: paidOrderId, verifiedBy } = verificationData;

        // 기존 검증 정보가 있는지 확인
        const { data: existingVerification } = await supabase
          .from('order_verifications')
          .select('*')
          .eq('order_id', paidOrderId)
          .single();

        if (existingVerification) {
          // 기존 검증 정보 업데이트
          const { data: updatedVerification, error: updateError } =
            await supabase
              .from('order_verifications')
              .update({
                is_paid: true,
                received_payment_at: new Date().toISOString(),
                verified_by: verifiedBy,
                updated_at: new Date().toISOString(),
              })
              .eq('order_id', paidOrderId)
              .select()
              .single();

          if (updateError) throw updateError;

          return NextResponse.json({
            success: true,
            data: updatedVerification,
          });
        } else {
          // 새로운 검증 정보 생성
          const { data: newVerification, error: createError } = await supabase
            .from('order_verifications')
            .insert({
              order_id: paidOrderId,
              is_paid: true,
              received_payment_at: new Date().toISOString(),
              verified_by: verifiedBy,
            })
            .select()
            .single();

          if (createError) throw createError;

          return NextResponse.json({
            success: true,
            data: newVerification,
          });
        }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Order verification API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
