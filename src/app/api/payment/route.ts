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
      draftDeliveryMethod,
      cardData, // 카드 정보 추가
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

        // 2. 카드 결제 검증 (모의)
        if (paymentMethod.method_type === 'card' && cardData) {
          // 실제로는 PG사 API 호출
          const isValidCard = validateCardData(cardData);
          if (!isValidCard) {
            return NextResponse.json(
              {
                success: false,
                error: '카드 정보가 올바르지 않습니다.',
              },
              { status: 400 }
            );
          }
        }

        // 3. 결제 정보 생성
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
            transaction_id: generateTransactionId(), // 트랜잭션 ID 생성
          })
          .select()
          .single();

        if (paymentError) throw paymentError;

        // 4. 주문 상태 업데이트
        let orderStatus = 'pending';

        if (paymentMethod.requires_admin_approval) {
          orderStatus = 'waiting_admin_approval';
        } else {
          orderStatus = 'completed';
        }

        const { error: orderError } = await supabase
          .from('orders')
          .update({
            payment_method_id: paymentMethodId,
            payment_status: orderStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId);

        if (orderError) throw orderError;

        // 5. 결제 완료 시 기존 design_drafts 업데이트 (주문 생성 시 이미 생성됨)
        // 모든 결제수단에 대해 design_drafts 업데이트 수행
        {
          console.log('🔍 결제 완료 - design_drafts 업데이트 시작:', orderId);

          // orders 테이블에서 design_drafts_id 조회
          const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('design_drafts_id')
            .eq('id', orderId)
            .single();

          if (orderError) {
            console.error('🔍 orders 조회 실패:', orderError);
          } else if (order?.design_drafts_id) {
            console.log('🔍 design_drafts_id 발견:', order.design_drafts_id);

            // 기존 시안 업데이트
            const { error: updateError } = await supabase
              .from('design_drafts')
              .update({
                notes: `결제 완료 후 초기 시안 업로드 대기 (전송방식: ${
                  draftDeliveryMethod || 'upload'
                })`,
                updated_at: new Date().toISOString(),
              })
              .eq('id', order.design_drafts_id);

            if (updateError) {
              console.error('🔍 design_drafts 업데이트 실패:', updateError);
            } else {
              console.log('🔍 design_drafts 업데이트 성공');
            }
          } else {
            console.warn('🔍 design_drafts_id를 찾을 수 없음:', orderId);
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

      case 'processApprovedOrderPayment':
        // 승인된 주문의 결제 처리
        // 1. 결제수단 정보 조회
        const { data: approvedPaymentMethod, error: approvedMethodError } =
          await supabase
            .from('payment_methods')
            .select('*')
            .eq('id', paymentMethodId)
            .single();

        if (approvedMethodError || !approvedPaymentMethod) {
          throw new Error('Invalid payment method');
        }

        // 2. 결제 정보 생성
        const { data: approvedPayment, error: approvedPaymentError } =
          await supabase
            .from('payments')
            .insert({
              order_id: orderId,
              payment_method_id: paymentMethodId,
              amount: amount,
              payment_status: 'completed',
              payment_date: new Date().toISOString(),
              admin_approval_status: 'approved',
              transaction_id: generateTransactionId(),
            })
            .select()
            .single();

        if (approvedPaymentError) throw approvedPaymentError;

        // 3. 주문 상태 업데이트 (승인된 주문이므로 바로 완료로 변경)
        const { error: approvedOrderError } = await supabase
          .from('orders')
          .update({
            payment_method_id: paymentMethodId,
            payment_status: 'completed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId);

        if (approvedOrderError) throw approvedOrderError;

        // 4. 승인된 주문 결제 완료 시 기존 design_drafts 업데이트
        const { data: approvedOrderData, error: approvedOrderDataError } =
          await supabase
            .from('orders')
            .select('design_drafts_id')
            .eq('id', orderId)
            .single();

        if (!approvedOrderDataError && approvedOrderData?.design_drafts_id) {
          // 기존 시안 업데이트
          await supabase
            .from('design_drafts')
            .update({
              notes: `승인된 주문 결제 완료 후 초기 시안 업로드 대기 (전송방식: ${
                draftDeliveryMethod || 'upload'
              })`,
              updated_at: new Date().toISOString(),
            })
            .eq('id', approvedOrderData.design_drafts_id);
        }

        return NextResponse.json({
          success: true,
          data: {
            payment: approvedPayment,
            orderStatus: 'completed',
            paymentMethod: approvedPaymentMethod,
            redirectUrl: '/mypage/design',
          },
        });

      case 'requestAdminApproval':
        // 어드민 승인 요청 처리
        const { error: approvalError } = await supabase
          .from('orders')
          .update({
            payment_status: 'waiting_admin_approval',
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId);

        if (approvalError) throw approvalError;

        return NextResponse.json({
          success: true,
          data: {
            message: '어드민 승인 요청이 완료되었습니다.',
            redirectUrl: '/mypage/orders',
          },
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { success: false, error: '결제 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 카드 정보 검증 함수 (모의)
function validateCardData(cardData: {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}): boolean {
  // 실제로는 더 정교한 검증 필요
  return !!(
    cardData &&
    cardData.cardNumber &&
    cardData.cardNumber.length >= 13 &&
    cardData.expiryMonth &&
    cardData.expiryYear &&
    cardData.cvv &&
    cardData.cvv.length >= 3
  );
}

// 트랜잭션 ID 생성 함수
function generateTransactionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `TXN_${timestamp}_${random}`.toUpperCase();
}
