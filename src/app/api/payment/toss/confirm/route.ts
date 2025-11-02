import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';
import { CartItem } from '@/src/contexts/cartContext';

// 주문 아이템 타입 (CartItem에 quantity 추가)
interface OrderItem extends CartItem {
  quantity: number;
}

// 주문 생성 로직 (결제 확인 API에서 직접 사용)
async function createOrderAfterPayment(
  orderData: {
    items: OrderItem[];
    userAuthId: string;
    userProfileId?: string;
    draftDeliveryMethod: string;
    projectName: string;
  },
  paymentMethodId: string
) {
  const { items, userAuthId, userProfileId, draftDeliveryMethod, projectName } =
    orderData;

  console.log('🔍 [주문 생성] 시작...', {
    itemsCount: items.length,
    userAuthId,
    userProfileId,
    projectName,
  });

  // 사용자 프로필 조회
  let userProfile = null;
  if (userProfileId) {
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userProfileId)
      .single();

    if (!profileError && profile) {
      userProfile = profile;
    }
  }

  // 주문 번호 생성
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  const orderNumber = `${dateStr}-${randomStr}`;

  // 총 가격 계산
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // 1. orders 테이블에 주문 생성 (결제 완료 상태)
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      user_auth_id: userAuthId,
      user_profile_id: userProfileId || null,
      payment_status: 'completed', // 결제 완료 상태
      order_status: 'pending',
      draft_delivery_method: draftDeliveryMethod || 'upload',
    })
    .select('id, order_number, payment_status')
    .single();

  if (orderError || !order) {
    console.error('🔍 [주문 생성] ❌ orders 생성 실패:', orderError);
    throw new Error('주문 생성에 실패했습니다.');
  }

  console.log('🔍 [주문 생성] ✅ orders 생성 성공:', order.id);

  // 2. payments 테이블에 결제 정보 생성
  const { error: paymentError } = await supabase.from('payments').insert({
    order_id: order.id,
    payment_method_id: paymentMethodId,
    amount: totalPrice,
    payment_status: 'completed',
    payment_date: new Date().toISOString(),
    admin_approval_status: 'approved',
  });

  if (paymentError) {
    console.error('🔍 [주문 생성] ⚠️ payments 생성 실패:', paymentError);
  }

  // 3. order_details 및 panel_slot_usage 생성
  const orderDetails = [];

  for (const item of items) {
    // 기간 설정
    let displayStartDate: string;
    let displayEndDate: string;

    if (item.selectedPeriodFrom && item.selectedPeriodTo) {
      displayStartDate = item.selectedPeriodFrom;
      displayEndDate = item.selectedPeriodTo;
    } else if (item.halfPeriod && item.selectedYear && item.selectedMonth) {
      const year = item.selectedYear;
      const month = item.selectedMonth;

      if (item.halfPeriod === 'first_half') {
        displayStartDate = `${year}-${String(month).padStart(2, '0')}-01`;
        displayEndDate = `${year}-${String(month).padStart(2, '0')}-15`;
      } else {
        const lastDay = new Date(year, month, 0).getDate();
        displayStartDate = `${year}-${String(month).padStart(2, '0')}-16`;
        displayEndDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
      }
    } else {
      const priceUnit = item.panel_slot_snapshot?.price_unit || '15 days';
      const startDate = new Date();
      const endDate = new Date(startDate);

      if (priceUnit === '15 days') {
        endDate.setDate(startDate.getDate() + 15);
      } else if (priceUnit === '30 days') {
        endDate.setDate(startDate.getDate() + 30);
      } else if (priceUnit === '7 days') {
        endDate.setDate(startDate.getDate() + 7);
      } else {
        endDate.setDate(startDate.getDate() + 15);
      }

      displayStartDate = startDate.toISOString().split('T')[0];
      displayEndDate = endDate.toISOString().split('T')[0];
    }

    // panel_slot_usage 레코드 생성
    let panelSlotUsageId = item.panel_slot_usage_id;

    if (!panelSlotUsageId && item.panel_slot_snapshot) {
      const { data: bannerSlotData } = await supabase
        .from('banner_slots')
        .select('id')
        .eq('panel_id', item.panel_id)
        .eq('slot_number', item.panel_slot_snapshot.slot_number)
        .single();

      if (bannerSlotData) {
        const { data: panelData } = await supabase
          .from('panels')
          .select('display_type_id')
          .eq('id', item.panel_id)
          .single();

        if (panelData) {
          const { data: newPanelSlotUsage } = await supabase
            .from('panel_slot_usage')
            .insert({
              display_type_id: panelData.display_type_id,
              panel_id: item.panel_id,
              slot_number: item.panel_slot_snapshot.slot_number,
              banner_slot_id: bannerSlotData.id,
              usage_type: 'banner_display',
              attach_date_from: displayStartDate,
              is_active: true,
              is_closed: false,
              banner_type: item.panel_slot_snapshot.banner_type || 'panel',
            })
            .select('id')
            .single();

          if (newPanelSlotUsage) {
            panelSlotUsageId = newPanelSlotUsage.id;
          }
        }
      }
    }

    // order_details 생성
    orderDetails.push({
      order_id: order.id,
      panel_id: item.panel_id,
      panel_slot_usage_id: panelSlotUsageId,
      slot_order_quantity: item.quantity,
      display_start_date: displayStartDate,
      display_end_date: displayEndDate,
    });
  }

  // order_details 일괄 생성 (재고 차감 트리거 자동 실행)
  const { data: orderDetailsResult, error: orderDetailsError } = await supabase
    .from('order_details')
    .insert(orderDetails)
    .select('id, panel_slot_usage_id, panel_id');

  if (orderDetailsError) {
    console.error(
      '🔍 [주문 생성] ❌ order_details 생성 실패:',
      orderDetailsError
    );
    throw new Error('주문 상세 정보 생성에 실패했습니다.');
  }

  console.log(
    '🔍 [주문 생성] ✅ order_details 생성 성공:',
    orderDetailsResult?.length
  );

  // 4. design_drafts 생성
  if (userProfile?.id) {
    const { data: draft, error: draftError } = await supabase
      .from('design_drafts')
      .insert({
        user_profile_id: userProfile.id,
        draft_category: 'initial',
        project_name: projectName,
        notes: `주문 생성 시 자동 생성 (전송방식: ${
          draftDeliveryMethod || 'upload'
        })`,
      })
      .select('id, project_name')
      .single();

    if (!draftError && draft) {
      // orders 테이블의 design_drafts_id 업데이트
      await supabase
        .from('orders')
        .update({
          design_drafts_id: draft.id,
          draft_delivery_method: draftDeliveryMethod || 'upload',
        })
        .eq('id', order.id);
    }
  }

  return {
    orderId: order.id,
    orderNumber: order.order_number,
    totalPrice,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { paymentKey, orderId, amount, orderData } = await request.json();

    console.log(
      '🔍 [결제 확인 API] 시작 =========================================='
    );
    console.log('🔍 [결제 확인 API] 입력 파라미터:', {
      paymentKey: paymentKey ? `${paymentKey.substring(0, 20)}...` : '없음',
      orderId,
      amount,
      hasOrderData: !!orderData,
    });

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const secretKey = process.env.TOSS_PAYMENTS_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { error: '서버 시크릿 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    // 토스페이먼츠 결제 확인
    const basicToken = Buffer.from(`${secretKey}:`).toString('base64');
    const confirmResponse = await fetch(
      'https://api.tosspayments.com/v1/payments/confirm',
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount,
        }),
      }
    );

    const confirmData = await confirmResponse.json();

    if (!confirmResponse.ok) {
      console.error(
        '🔍 [결제 확인 API] ❌ 토스페이먼츠 결제 승인 실패:',
        confirmData
      );
      return NextResponse.json(
        { success: false, error: confirmData?.message || '결제 승인 실패' },
        { status: 400 }
      );
    }

    console.log('🔍 [결제 확인 API] ✅ 토스페이먼츠 결제 승인 성공');

    // payment_methods 테이블에서 카드 결제 수단 ID 찾기
    const { error: paymentMethodError, data: paymentMethodData } =
      await supabase
        .from('payment_methods')
        .select('id, method_code, name')
        .eq('method_code', 'card')
        .single();

    if (paymentMethodError || !paymentMethodData) {
      console.error(
        '🔍 [결제 확인 API] ❌ payment_methods 조회 실패:',
        paymentMethodError
      );
      return NextResponse.json(
        { success: false, error: '결제 수단을 찾을 수 없습니다.' },
        { status: 500 }
      );
    }

    // ⚠️ 중요: 임시 orderId인 경우 실제 주문 생성 (결제 완료 후!)
    if (orderId.startsWith('temp_')) {
      console.log(
        '🔍 [결제 확인 API] 임시 orderId 감지 - 결제 완료 후 주문 생성 시작...'
      );

      if (!orderData) {
        console.error(
          '🔍 [결제 확인 API] ❌ 주문 생성에 필요한 데이터가 없습니다.'
        );
        return NextResponse.json(
          {
            success: false,
            error: '주문 생성에 필요한 정보가 없습니다.',
            requiresOrderData: true,
          },
          { status: 400 }
        );
      }

      // 실제 주문 생성 (orders, order_details, design_drafts, panel_slot_usage)
      try {
        const orderResult = await createOrderAfterPayment(
          orderData,
          paymentMethodData.id
        );

        console.log('🔍 [결제 확인 API] ✅ 주문 생성 성공:', orderResult);

        // payments 테이블에 결제 정보 저장
        await supabase.from('payments').insert({
          order_id: orderResult.orderId,
          payment_method_id: paymentMethodData.id,
          amount: amount,
          payment_status: 'completed',
          transaction_id: paymentKey,
          payment_provider: 'toss',
          payment_date: new Date().toISOString(),
          admin_approval_status: 'approved',
        });

        return NextResponse.json({
          success: true,
          data: {
            ...confirmData,
            orderId: orderResult.orderId,
            orderNumber: orderResult.orderNumber,
          },
        });
      } catch (error) {
        console.error('🔍 [결제 확인 API] ❌ 주문 생성 중 에러:', error);
        return NextResponse.json(
          {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : '주문 생성에 실패했습니다.',
          },
          { status: 500 }
        );
      }
    }

    // 기존 주문이 있는 경우 (임시 orderId가 아닌 경우)
    let actualOrderId = orderId;
    let orderNumber = orderId;

    // orderId가 UUID가 아닌 경우 order_number로 조회
    if (
      !orderId.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      )
    ) {
      const { data: orderByNumber } = await supabase
        .from('orders')
        .select('id, order_number')
        .eq('order_number', orderId)
        .single();

      if (orderByNumber) {
        actualOrderId = orderByNumber.id;
        orderNumber = orderByNumber.order_number;
      } else {
        return NextResponse.json(
          {
            success: false,
            error: '주문을 찾을 수 없습니다.',
          },
          { status: 404 }
        );
      }
    }

    // payments 테이블에 결제 정보 저장/업데이트
    await supabase.from('payments').upsert(
      {
        order_id: actualOrderId,
        payment_method_id: paymentMethodData.id,
        amount: amount,
        payment_status: 'completed',
        transaction_id: paymentKey,
        payment_provider: 'toss',
        payment_date: new Date().toISOString(),
        admin_approval_status: 'approved',
      },
      { onConflict: 'order_id' }
    );

    // orders 테이블의 payment_status 업데이트
    await supabase
      .from('orders')
      .update({
        payment_status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', actualOrderId);

    return NextResponse.json({
      success: true,
      data: {
        ...confirmData,
        orderId: actualOrderId,
        orderNumber: orderNumber,
      },
    });
  } catch (error) {
    console.error('🔍 [결제 확인 API] ❌ 예외 발생:', error);
    return NextResponse.json(
      { success: false, error: '결제 승인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
