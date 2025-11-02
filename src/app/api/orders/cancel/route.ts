import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/app/api/supabase';

export async function POST(request: NextRequest) {
  try {
    const { orderNumber } = await request.json();

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, error: '주문번호가 필요합니다.' },
        { status: 400 }
      );
    }

    // 주문 정보 조회
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, design_drafts_id')
      .eq('order_number', orderNumber)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: '주문을 찾을 수 없습니다.' },
        { status: 404 }
      );
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
          console.warn('🔍 [주문 취소] ⚠️ design_drafts 조회 실패 (레코드는 삭제):', draftFetchError);
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
              const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
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
                console.warn('🔍 [주문 취소] ⚠️ Storage 파일 삭제 실패 (레코드는 삭제):', {
                  error: storageDeleteError,
                  filePath,
                });
              } else {
                console.log('🔍 [주문 취소] ✅ Storage 파일 삭제 성공:', filePath);
              }
            } else {
              console.warn('🔍 [주문 취소] ⚠️ 파일 경로를 추출할 수 없음:', draft.file_url);
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

        if (draftsError) {
          console.error('Design drafts deletion error:', draftsError);
          return NextResponse.json(
            { success: false, error: '디자인 드래프트 삭제에 실패했습니다.' },
            { status: 500 }
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
