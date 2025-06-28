import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// 1:1 상담 내역 조회
export async function GET(request: NextRequest) {
  try {
    // 임시 사용자 ID 사용
    const userId = 'temp-user-id';

    // URL 파라미터에서 페이지네이션 정보 가져오기
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // 1:1 상담 내역 조회
    const {
      data: inquiries,
      error: inquiriesError,
      count,
    } = await supabase
      .from('customer_service')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (inquiriesError) {
      console.error('Inquiries fetch error:', inquiriesError);
      return NextResponse.json(
        { success: false, error: '상담 내역을 불러오는데 실패했습니다.' },
        { status: 500 }
      );
    }

    // 상태별 개수 계산
    const { data: statusCounts } = await supabase
      .from('customer_service')
      .select('status')
      .eq('user_id', userId);

    const statusSummary = {
      total: statusCounts?.length || 0,
      pending: statusCounts?.filter((i) => i.status === 'pending').length || 0,
      answered:
        statusCounts?.filter((i) => i.status === 'answered').length || 0,
      closed: statusCounts?.filter((i) => i.status === 'closed').length || 0,
    };

    return NextResponse.json({
      success: true,
      inquiries: inquiries || [],
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
    // 임시 사용자 ID 사용
    const userId = 'temp-user-id';

    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: '제목과 내용을 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // 1:1 상담 문의 생성
    const { data: inquiry, error: inquiryError } = await supabase
      .from('customer_service')
      .insert({
        user_id: userId,
        title,
        content,
        status: 'pending',
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

    return NextResponse.json({
      success: true,
      message: '문의가 성공적으로 등록되었습니다.',
      inquiry,
    });
  } catch (error) {
    console.error('Inquiry creation error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
