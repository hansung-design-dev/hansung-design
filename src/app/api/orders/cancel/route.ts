import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/app/api/supabase';

export async function POST(request: NextRequest) {
  try {
    const { orderNumber } = await request.json();

    const normalizeOrderNumber = (value: unknown) => {
      if (typeof value === 'string') {
        return value.trim();
      }
      if (value === undefined || value === null) {
        return '';
      }
      return String(value).trim();
    };

    const normalizedOrderNumber = normalizeOrderNumber(orderNumber);

    if (!normalizedOrderNumber) {
      return NextResponse.json(
        { success: false, error: '주문번호가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('🔍 [주문 취소] 요청 받은 주문번호:', {
      rawOrderNumber: orderNumber,
      normalizedOrderNumber,
      requestId: request.headers.get('x-request-id') || null,
    });

    // 주문 정보 조회 (취소 가능 기간 검증을 위해 created_at 포함)
    const selectFields =
      'id, design_drafts_id, created_at, order_number, payment_status';

    const fetchOrder = async (useIlike = false) => {
      const query = supabase
        .from('orders')
        .select(selectFields, { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(1);

      if (useIlike) {
        return await query.ilike('order_number', normalizedOrderNumber);
      }
      return await query.eq('order_number', normalizedOrderNumber);
    };

    const eqResult = await fetchOrder();
    let order = eqResult.data?.[0] ?? null;
    let totalMatches = eqResult.count ?? 0;
    let orderError = eqResult.error ?? null;

    if (totalMatches > 1) {
      console.warn('🔍 [주문 취소] 주문번호 중복:', {
        normalizedOrderNumber,
        count: totalMatches,
      });
    }

    if (!order) {
      const ilikeResult = await fetchOrder(true);
      order = ilikeResult.data?.[0] ?? null;
      totalMatches = ilikeResult.count ?? totalMatches;
      orderError = ilikeResult.error ?? orderError;

      if (order) {
        console.info(
          '🔍 [주문 취소] 대소문자 구분 없이 주문을 찾았습니다:',
          order.order_number
        );
      }

      if ((ilikeResult.count ?? 0) > 1) {
        console.warn('🔍 [주문 취소] ilike 검색에서 많은 결과:', {
          normalizedOrderNumber,
          count: ilikeResult.count,
        });
      }
    }

    if (orderError || !order) {
      console.warn('🔍 [주문 취소] 주문 조회 실패:', {
        normalizedOrderNumber,
        orderError,
      });

      return NextResponse.json(
        {
          success: false,
          error: '주문을 찾을 수 없습니다.',
          details: { orderNumber: normalizedOrderNumber },
        },
        { status: 404 }
      );
    }

    // ✅ 주문일 기준 2일 경과 여부 검증 (서버 사이드 방어 로직)
    if (order.created_at) {
      const createdAt = new Date(order.created_at);
      const now = new Date();
      const diffMs = now.getTime() - createdAt.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays >= 2) {
        return NextResponse.json(
          {
            success: false,
            error:
              '구매 후 2일이 지난 주문은 온라인에서 취소가 불가합니다. 고객센터로 문의해주세요.',
            code: 'CANCEL_PERIOD_EXPIRED',
          },
          { status: 400 }
        );
      }
    }

    // ✅ 결제 정보 조회 (토스 결제 취소용)
    const { data: paymentRecords, error: paymentFetchError } = await supabase
      .from('payments')
      .select(
        'id, order_id, amount, payment_status, transaction_id, payment_provider'
      )
      .eq('order_id', order.id);

    if (paymentFetchError) {
      console.error('🔍 [주문 취소] 결제 정보 조회 실패:', paymentFetchError);
      return NextResponse.json(
        {
          success: false,
          error: '결제 정보 조회에 실패했습니다.',
        },
        { status: 500 }
      );
    }

    const payment =
      paymentRecords && paymentRecords.length > 0 ? paymentRecords[0] : null;

    // ✅ 테스트/0원 결제 여부 판별 (ENABLE_TEST_FREE_PAYMENT === 'true' 일 때만 동작)
    const isTestFreePaymentEnabled =
      process.env.ENABLE_TEST_FREE_PAYMENT === 'true';

    const isTestFreePayment =
      isTestFreePaymentEnabled &&
      payment &&
      (payment.amount === 0 ||
        (typeof payment.transaction_id === 'string' &&
          payment.transaction_id.startsWith('test_free_')) ||
        payment.payment_provider === 'FREE');

    // ✅ 토스 결제 취소 처리 (결제가 완료된 카드/간편결제 건으로 가정)
    // - 테스트/0원 결제(isTestFreePayment)는 토스 API를 호출하지 않고 내부 데이터만 취소
    if (
      payment &&
      payment.transaction_id &&
      payment.payment_status === 'completed' &&
      !isTestFreePayment
    ) {
      const secretKey = process.env.TOSS_PAYMENTS_SECRET_KEY;

      if (!secretKey) {
        console.error(
          '🔍 [주문 취소] ❌ TOSS_PAYMENTS_SECRET_KEY 미설정 - 결제 취소 불가'
        );
        return NextResponse.json(
          {
            success: false,
            error:
              '결제 취소 설정이 완료되지 않았습니다. 고객센터로 문의해주세요.',
          },
          { status: 500 }
        );
      }

      const basicToken = Buffer.from(`${secretKey}:`).toString('base64');

      console.log('🔍 [주문 취소] 토스 결제 취소 API 호출 시작:', {
        transactionId: payment.transaction_id.substring(0, 20) + '...',
        amount: payment.amount,
        orderNumber: order.order_number,
      });

      const tossCancelResponse = await fetch(
        `https://api.tosspayments.com/v1/payments/${payment.transaction_id}/cancel`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${basicToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cancelReason: '고객 주문 취소',
            // 전체 취소 기준: cancelAmount를 생략하면 전체 금액 취소로 처리됨
          }),
        }
      );

      const tossCancelData = await tossCancelResponse.json();

      console.log('🔍 [주문 취소] 토스 결제 취소 응답:', {
        ok: tossCancelResponse.ok,
        status: tossCancelResponse.status,
        statusText: tossCancelResponse.statusText,
        dataSummary: tossCancelData
          ? {
              status: tossCancelData.status,
              cancels: tossCancelData.cancels,
              code: tossCancelData.code,
              message: tossCancelData.message,
            }
          : null,
      });

      if (!tossCancelResponse.ok) {
        // ✅ 보완용: 토스에서 결제 정보를 찾을 수 없고(NOT_FOUND_PAYMENT),
        //    로컬 payment.amount가 0인 경우에는 내부 데이터만 취소하고 계속 진행
        if (
          isTestFreePaymentEnabled &&
          payment.amount === 0 &&
          tossCancelData?.code === 'NOT_FOUND_PAYMENT'
        ) {
          console.warn(
            '🔍 [주문 취소] ⚠️ 토스 결제 정보 없음(NOT_FOUND_PAYMENT) + 0원 결제 - 토스 취소는 건너뛰고 내부 주문만 취소 처리:',
            {
              orderNumber: order.order_number,
              transactionId: payment.transaction_id,
              amount: payment.amount,
              tossCode: tossCancelData?.code,
              tossMessage: tossCancelData?.message,
            }
          );
          // 토스 취소 실패지만 내부 취소는 계속 진행
        } else {
          console.error(
            '🔍 [주문 취소] ❌ 토스 결제 취소 실패:',
            tossCancelData || tossCancelResponse.statusText
          );
          return NextResponse.json(
            {
              success: false,
              error:
                '결제 취소에 실패했습니다. 잠시 후 다시 시도하거나 고객센터로 문의해주세요.',
              code: tossCancelData?.code,
              toss: tossCancelData,
            },
            { status: 400 }
          );
        }
      }
    }

    // 순차적으로 관련 데이터 삭제
    try {
      // 1. payments 삭제
      const { error: paymentsError } = await supabase
        .from('payments')
        .delete()
        .eq('order_id', order.id);

      if (paymentsError) {
        console.error('Payments deletion error:', paymentsError);
        return NextResponse.json(
          { success: false, error: '결제 정보 삭제에 실패했습니다.' },
          { status: 500 }
        );
      }

      // 2. order_details 삭제 (재고 복구는 트리거가 자동 처리)
      const { error: detailsError } = await supabase
        .from('order_details')
        .delete()
        .eq('order_id', order.id);

      if (detailsError) {
        console.error('Order details deletion error:', detailsError);
        return NextResponse.json(
          { success: false, error: '주문 상세 정보 삭제에 실패했습니다.' },
          { status: 500 }
        );
      }

      // 3. orders 삭제
      const { error: orderDeleteError } = await supabase
        .from('orders')
        .delete()
        .eq('id', order.id);

      if (orderDeleteError) {
        console.error('Order deletion error:', orderDeleteError);
        return NextResponse.json(
          { success: false, error: '주문 삭제에 실패했습니다.' },
          { status: 500 }
        );
      }

      // 4. design_drafts 삭제 (orders.design_drafts_id를 통해 연결된 것만)
      // 먼저 업로드된 파일이 있으면 Storage에서도 삭제
      if (order.design_drafts_id) {
        // design_drafts 정보 조회 (file_url 포함)
        const { data: draft, error: draftFetchError } = await supabase
          .from('design_drafts')
          .select('id, file_url')
          .eq('id', order.design_drafts_id)
          .single();

        if (draftFetchError) {
          console.warn(
            '🔍 [주문 취소] ⚠️ design_drafts 조회 실패 (레코드는 삭제):',
            draftFetchError
          );
        }

        if (draft && draft.file_url) {
          // 공개 URL에서 파일 경로 추출
          // URL 형식: https://...supabase.co/storage/v1/object/public/design-drafts/drafts/filename
          const bucketName = 'design-drafts';
          let filePath = '';

          try {
            // URL에서 파일 경로 추출
            // URL 형식: https://...supabase.co/storage/v1/object/public/design-drafts/drafts/filename
            // 필요한 부분: drafts/filename
            const url = new URL(draft.file_url);

            // 방법 1: bucket name 이후의 경로를 직접 추출
            const segments = url.pathname.split('/').filter((s) => s);
            const bucketIndex = segments.findIndex((s) => s === bucketName);

            if (bucketIndex !== -1 && bucketIndex < segments.length - 1) {
              // bucket name 이후의 모든 세그먼트를 경로로 사용
              filePath = segments.slice(bucketIndex + 1).join('/');
            } else {
              // 방법 2: 정규식으로 추출 시도
              const pathMatch = url.pathname.match(
                /\/storage\/v1\/object\/public\/[^/]+\/(.+)$/
              );
              if (pathMatch && pathMatch[1]) {
                filePath = pathMatch[1];
              }
            }

            // Storage에서 파일 삭제
            if (filePath) {
              console.log('🔍 [주문 취소] Storage 파일 삭제 시도:', {
                bucketName,
                filePath,
                originalUrl: draft.file_url,
              });

              const { error: storageDeleteError } = await supabase.storage
                .from(bucketName)
                .remove([filePath]);

              if (storageDeleteError) {
                // 파일 삭제 실패는 경고만 표시하고 계속 진행 (레코드는 삭제)
                console.warn(
                  '🔍 [주문 취소] ⚠️ Storage 파일 삭제 실패 (레코드는 삭제):',
                  {
                    error: storageDeleteError,
                    filePath,
                  }
                );
              } else {
                console.log(
                  '🔍 [주문 취소] ✅ Storage 파일 삭제 성공:',
                  filePath
                );
              }
            } else {
              console.warn(
                '🔍 [주문 취소] ⚠️ 파일 경로를 추출할 수 없음:',
                draft.file_url
              );
            }
          } catch (urlError) {
            console.warn('🔍 [주문 취소] ⚠️ URL 파싱 실패 (레코드는 삭제):', {
              error: urlError,
              fileUrl: draft.file_url,
            });
          }
        }

        // design_drafts 레코드 삭제
        const { error: draftsError } = await supabase
          .from('design_drafts')
          .delete()
          .eq('id', order.design_drafts_id);

        // ✅ 디자인 드래프트 삭제 실패는 치명적인 오류가 아니므로
        // 주문 취소 자체는 성공으로 처리하고 경고만 남깁니다.
        if (draftsError) {
          console.warn(
            '🔍 [주문 취소] ⚠️ design_drafts 삭제 실패 (주문 취소는 성공 처리):',
            draftsError
          );
        }
      }

      return NextResponse.json({
        success: true,
        message: '주문이 성공적으로 취소되었습니다.',
      });
    } catch (error) {
      console.error('Deletion process error:', error);
      return NextResponse.json(
        { success: false, error: '주문 삭제 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Order cancellation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
