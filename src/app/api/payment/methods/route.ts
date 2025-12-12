import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'code 쿼리 파라미터가 필요합니다.' },
        { status: 400 }
      );
    }

    // payment_methods 조회
    const { data: found, error } = await supabase
      .from('payment_methods')
      .select('id, method_code, name, method_type, is_online, requires_admin_approval')
      .eq('method_code', code)
      .single();

    if (found && !error) {
      return NextResponse.json({ success: true, data: found });
    }

    // 없으면 기본 값으로 자동 생성 (특히 bank_transfer 용)
    const methodMapping: Record<
      string,
      { name: string; method_type: string; is_online: boolean }
    > = {
      card: { name: '카드결제', method_type: 'online', is_online: true },
      credit_card: { name: '신용카드', method_type: 'online', is_online: true },
      kakao: { name: '카카오페이', method_type: 'online', is_online: true },
      naver: { name: '네이버페이', method_type: 'online', is_online: true },
      bank_transfer: {
        name: '계좌이체',
        method_type: 'offline',
        is_online: false,
      },
      free: { name: '무료결제', method_type: 'online', is_online: true },
    };

    const methodInfo =
      methodMapping[code] || methodMapping['card'] || {
        name: '카드결제',
        method_type: 'online',
        is_online: true,
      };

    const { data: created, error: createError } = await supabase
      .from('payment_methods')
      .insert({
        method_code: code,
        name: methodInfo.name,
        method_type: methodInfo.method_type,
        is_active: true,
        is_online: methodInfo.is_online,
        requires_admin_approval: false,
      })
      .select('id, method_code, name, method_type, is_online, requires_admin_approval')
      .single();

    if (createError || !created) {
      console.error('[payment/methods] payment_methods 자동 생성 실패:', {
        code,
        error: createError,
      });
      return NextResponse.json(
        {
          success: false,
          error: '결제 수단을 찾을 수 없고 생성에도 실패했습니다.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: created });
  } catch (error) {
    console.error('[payment/methods] 예외 발생:', error);
    return NextResponse.json(
      { success: false, error: '결제 수단 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}




