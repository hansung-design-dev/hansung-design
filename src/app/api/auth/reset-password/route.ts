import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase';
import { normalizePhone } from '@/src/lib/utils';
import { assertValidPhoneVerificationReference } from '@/src/lib/phoneVerification';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, phone, newPassword, phoneVerificationReference } = body as {
      username?: string;
      phone?: string;
      newPassword?: string;
      phoneVerificationReference?: string;
    };

    if (!username || !phone || !newPassword) {
      return NextResponse.json(
        { success: false, error: '아이디, 휴대폰 번호, 새 비밀번호를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    if (!phoneVerificationReference) {
      return NextResponse.json(
        { success: false, error: '휴대폰 인증을 완료해주세요.' },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhone(phone);

    // 휴대폰 인증 reference 검증 (유효기간/번호/목적)
    try {
      await assertValidPhoneVerificationReference({
        reference: phoneVerificationReference,
        phone: normalizedPhone,
        purpose: 'reset_password',
      });
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : '휴대폰 인증 검증에 실패했습니다.';
      return NextResponse.json({ success: false, error: msg }, { status: 400 });
    }

    // username + phone 이 모두 일치하는 유저 찾기
    const { data: user, error: fetchError } = await supabaseAdmin
      .from('user_auth')
      .select('id')
      .eq('username', username)
      .eq('phone', normalizedPhone)
      .single();

    if (fetchError || !user) {
      return NextResponse.json(
        { success: false, error: '일치하는 회원 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 현재 스키마에서는 비밀번호를 평문으로 저장 중이므로 그대로 업데이트
    const { error: updateError } = await supabaseAdmin
      .from('user_auth')
      .update({
        password: newPassword,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('비밀번호 업데이트 에러:', updateError);
      return NextResponse.json(
        { success: false, error: '비밀번호 변경에 실패했습니다.' },
        { status: 500 }
      );
    }

    // phone_verifications 레코드에 user_auth_id 연결 (테이블 확인/추적용)
    try {
      await supabaseAdmin
        .from('phone_verifications')
        .update({ user_auth_id: user.id })
        .eq('id', phoneVerificationReference);
    } catch (e) {
      console.warn(
        '[reset-password] failed to link phone_verification to user_auth',
        e
      );
    }

    return NextResponse.json({
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다.',
    });
  } catch (error) {
    console.error('비밀번호 재설정 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}




