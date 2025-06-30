import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// 1:1 상담 내역 조회
export async function GET(request: NextRequest) {
  try {
    // 임시 사용자 ID 사용 (실제로는 인증된 사용자 ID를 사용해야 함)
    // UUID 형식으로 변경
    const userId = '00000000-0000-0000-0000-000000000000';

    // URL 파라미터에서 페이지네이션 정보와 product_id 가져오기
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const productId = searchParams.get('product_id');
    const offset = (page - 1) * limit;

    // 쿼리 빌더 시작
    let query = supabase
      .from('customer_inquiries')
      .select('*', { count: 'exact' })
      .eq('user_auth_id', userId)
      .order('created_at', { ascending: false });

    // product_id가 있으면 필터링 추가
    if (productId) {
      query = query.eq('product_name', productId);
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
        answer: inquiry.answer_content,
        answered_at: inquiry.answered_at,
        created_at: inquiry.created_at,
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
    // 임시 사용자 ID 사용 (실제로는 인증된 사용자 ID를 사용해야 함)
    // UUID 형식으로 변경
    const userId = '00000000-0000-0000-0000-000000000000';

    const { title, content, product_name, product_id } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: '제목과 내용을 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // 1:1 상담 문의 생성 (새로운 스키마 사용)
    const { data: inquiry, error: inquiryError } = await supabase
      .from('customer_inquiries')
      .insert({
        user_auth_id: userId,
        title,
        content,
        product_name: product_name || product_id, // product_id를 product_name으로 저장
        inquiry_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
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
