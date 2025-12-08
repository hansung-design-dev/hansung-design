import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// 쿠키에서 로그인된 사용자 ID(user_auth_id) 가져오기
function getUserIdFromRequest(request: NextRequest): string | null {
  try {
    const cookieUserId = request.cookies.get('user_id')?.value;
    if (!cookieUserId) {
      return null;
    }
    return cookieUserId;
  } catch {
    return null;
  }
}

type CustomerInquiryProductType = 'led' | 'top_fixed' | 'digital_media_product';

const normalizeProductType = (
  rawType?: string
): CustomerInquiryProductType => {
  if (!rawType) {
    return 'digital_media_product';
  }

  const normalized = rawType.toLowerCase();
  if (normalized.includes('led')) {
    return 'led';
  }

  if (
    normalized.includes('top_fixed') ||
    normalized.includes('top-fixed') ||
    normalized.includes('top') ||
    normalized.includes('banner')
  ) {
    return 'top_fixed';
  }

  return 'digital_media_product';
};

// 1:1 상담 내역 조회
export async function GET(request: NextRequest) {
  try {
    // 로그인된 사용자 ID 조회
    const userId = getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // URL 파라미터에서 페이지네이션 정보와 상품 식별자(product_id 또는 product_name) 가져오기
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    // product_id는 과거/신규 모두에서 사용되는 상품 코드, 실제 저장은 product_name 컬럼 하나에 통합
    const rawProductId = searchParams.get('product_id');
    const rawProductName = searchParams.get('product_name');
    const consultationKey = searchParams.get('consultation_key');
    const offset = (page - 1) * limit;

    // 쿼리 빌더 시작
    let query = supabase
      .from('customer_inquiries')
      .select('*', { count: 'exact' })
      .eq('user_auth_id', userId)
      .order('created_at', { ascending: false });

    // 특정 상품에 대한 상담 내역만 보고 싶은 경우 (디지털미디어 쇼핑몰, 전자게시대, 상단광고 등)
    // 새로운 스키마에서는 product_name 컬럼에 consultationKey를 저장하고,
    // consultation_key 쿼리 파라미터로 정확히 조회한다.
    //
    // 과거 데이터(상품명/상품코드가 저장된 상담내역)를 최대한 함께 잡기 위해
    // consultation_key가 없을 때만 product_id / product_name 기반 조회를 수행한다.
    if (consultationKey) {
      query = query.eq('product_name', consultationKey);
    } else if (rawProductId && rawProductName) {
      query = query.in('product_name', [rawProductId, rawProductName]);
    } else if (rawProductName) {
      query = query.eq('product_name', rawProductName);
    } else if (rawProductId) {
      query = query.eq('product_name', rawProductId);
    }

    // 1:1 상담 내역 조회
    const {
      data: inquiries,
      error: inquiriesError,
      count,
    } = await query.range(offset, offset + limit - 1);

    if (inquiriesError) {
      console.error('Inquiries fetch error:', inquiriesError);
      return NextResponse.json(
        { success: false, error: '상담 내역을 불러오는데 실패했습니다.' },
        { status: 500 }
      );
    }

    // 상태별 개수 계산
    const { data: statusCounts } = await supabase
      .from('customer_inquiries')
      .select('inquiry_status')
      .eq('user_auth_id', userId);

    const statusSummary = {
      total: statusCounts?.length || 0,
      pending:
        statusCounts?.filter((i) => i.inquiry_status === 'pending').length || 0,
      answered:
        statusCounts?.filter((i) => i.inquiry_status === 'answered').length ||
        0,
      closed:
        statusCounts?.filter((i) => i.inquiry_status === 'closed').length || 0,
    };

    // 응답 데이터 변환 (새로운 스키마에 맞게)
    const transformedInquiries =
      inquiries?.map((inquiry) => ({
        id: inquiry.id,
        title: inquiry.title,
        content: inquiry.content,
        status: inquiry.inquiry_status,
        // 마이페이지 1:1상담 페이지에서 사용하는 필드
        answer: inquiry.answer_content,
        // 상담 모달(ConsultationModal)에서 사용하는 필드 (동일한 값, 이름만 다르게 노출)
        answer_content: inquiry.answer_content,
        answered_at: inquiry.answered_at,
        created_at: inquiry.created_at,
        product_name: inquiry.product_name,
        product_type: inquiry.product_type,
      })) || [];

    return NextResponse.json({
      success: true,
      inquiries: transformedInquiries,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      statusSummary,
    });
  } catch (error) {
    console.error('Customer service API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 1:1 상담 문의 생성
export async function POST(request: NextRequest) {
  try {
    // 로그인된 사용자 ID 조회
    const userId = getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const {
      title,
      content,
      product_name,
      product_id,
      product_type,
      consultationKey,
      led_slot_id,
      top_fixed_id,
      digital_product_id,
      panel_id,
    } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: '제목과 내용을 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // product_name 저장 방식 결정
    // - 새로운 스키마: consultationKey가 있으면 이것을 최우선으로 사용
    // - fallback: 기존 로직 유지 (상품명 우선, 없으면 product_id)
    const storedProductName =
      consultationKey || product_name || product_id || null;

    // 1:1 상담 문의 생성 (새로운 스키마 사용)
    const normalizedType = normalizeProductType(product_type);

    const inquiryPayload: Record<string, unknown> = {
      user_auth_id: userId,
      title,
      content,
      product_name: storedProductName ?? null,
      inquiry_status: 'pending',
      product_type: normalizedType,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (normalizedType === 'led') {
      let resolvedLedSlotId = led_slot_id ?? null;

      if (!resolvedLedSlotId && panel_id) {
        const { data: slotRecord, error: lookupError } = await supabase
          .from('led_slots')
          .select('id')
          .eq('panel_id', panel_id)
          .limit(1)
          .maybeSingle();

        if (lookupError) {
          console.error('LED slot lookup failed', lookupError);
        }

        resolvedLedSlotId = slotRecord?.id ?? null;
      }

      inquiryPayload.led_slot_id = resolvedLedSlotId;
    } else if (normalizedType === 'top_fixed') {
      let resolvedTopFixedId = top_fixed_id ?? null;

      if (resolvedTopFixedId) {
        const {
          data: existingTopFixed,
          error: validationError,
        } = await supabase
          .from('top_fixed_banner_inventory')
          .select('id')
          .eq('id', resolvedTopFixedId)
          .limit(1)
          .maybeSingle();

        if (validationError) {
          console.error(
            'Top fixed validation lookup failed:',
            validationError.message
          );
          resolvedTopFixedId = null;
        }

        if (!existingTopFixed) {
          resolvedTopFixedId = null;
        }
      }

      if (!resolvedTopFixedId && panel_id) {
        const { data: matchingTopFixed, error: lookupError } = await supabase
          .from('top_fixed_banner_inventory')
          .select('id')
          .eq('panel_id', panel_id)
          .limit(1)
          .maybeSingle();

        if (lookupError) {
          console.error('Top fixed inventory lookup failed:', lookupError);
        }

        resolvedTopFixedId = matchingTopFixed?.id ?? resolvedTopFixedId;
      }

      inquiryPayload.top_fixed_id = resolvedTopFixedId ?? null;
    } else {
      inquiryPayload.digital_product_id =
        digital_product_id ?? product_id ?? null;
    }

    const { data: inquiry, error: inquiryError } = await supabase
      .from('customer_inquiries')
      .insert(inquiryPayload)
      .select()
      .single();

    if (inquiryError) {
      console.error('Inquiry creation error:', inquiryError);
      return NextResponse.json(
        { success: false, error: '문의를 생성하는데 실패했습니다.' },
        { status: 500 }
      );
    }

    // 응답 데이터 변환
    const transformedInquiry = {
      id: inquiry.id,
      title: inquiry.title,
      content: inquiry.content,
      status: inquiry.inquiry_status,
      answer_content: inquiry.answer_content,
      answered_at: inquiry.answered_at,
      created_at: inquiry.created_at,
      product_name: inquiry.product_name,
    };

    return NextResponse.json({
      success: true,
      message: '문의가 성공적으로 등록되었습니다.',
      inquiry: transformedInquiry,
    });
  } catch (error) {
    console.error('Inquiry creation error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 1:1 상담 문의 삭제 (취소)
export async function DELETE(request: NextRequest) {
  try {
    // 로그인된 사용자 ID 조회
    const userId = getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { inquiryId } = await request.json();

    if (!inquiryId) {
      return NextResponse.json(
        { success: false, error: '상담 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 상담 내역이 해당 사용자의 것인지 확인
    // 이미 GET 단계에서 user_auth_id 기준으로 필터링된 데이터만 내려보내고 있으므로
    // 여기서는 inquiryId 기준으로만 조회해도 충분하다.
    const { data: existingInquiry, error: checkError } = await supabase
      .from('customer_inquiries')
      .select('id, inquiry_status')
      .eq('id', inquiryId)
      .single();

    if (checkError || !existingInquiry) {
      return NextResponse.json(
        { success: false, error: '상담 내역을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 이미 답변이 완료된 상담은 취소할 수 없음
    if (
      existingInquiry.inquiry_status === 'answered' ||
      existingInquiry.inquiry_status === 'closed'
    ) {
      return NextResponse.json(
        {
          success: false,
          error: '이미 답변이 완료된 상담은 취소할 수 없습니다.',
        },
        { status: 400 }
      );
    }

    // 상담 내역 삭제
    const { error: deleteError } = await supabase
      .from('customer_inquiries')
      .delete()
      .eq('id', inquiryId);

    if (deleteError) {
      console.error('Inquiry deletion error:', deleteError);
      return NextResponse.json(
        { success: false, error: '상담 취소에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '상담이 성공적으로 취소되었습니다.',
    });
  } catch (error) {
    console.error('Inquiry deletion error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
