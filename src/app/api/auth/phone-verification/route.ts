import { NextRequest, NextResponse } from 'next/server';
import {
  confirmPhoneVerification,
  requestPhoneVerification,
} from '@/src/lib/nicepay/phoneVerificationService';

interface RequestBody {
  action: 'request' | 'confirm';
  phone: string;
  code?: string;
  requestId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    if (!body.action) {
      return NextResponse.json(
        { success: false, error: 'action 정보를 포함해주세요.' },
        { status: 400 }
      );
    }

    if (!body.phone) {
      return NextResponse.json(
        { success: false, error: '휴대폰 번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    if (body.action === 'request') {
      const result = await requestPhoneVerification(body.phone);
      return NextResponse.json({
        success: true,
        requestId: result.requestId,
        expiresAt: result.expiresAt,
      });
    }

    if (body.action === 'confirm') {
      if (!body.requestId) {
        return NextResponse.json(
          { success: false, error: '인증 요청 ID가 필요합니다.' },
          { status: 400 }
        );
      }

      if (!body.code) {
        return NextResponse.json(
          { success: false, error: '인증번호를 입력해주세요.' },
          { status: 400 }
        );
      }

      const result = await confirmPhoneVerification({
        phone: body.phone,
        requestId: body.requestId,
        code: body.code,
      });
      return NextResponse.json({
        success: true,
        verificationId: result.verificationId,
        verifiedAt: result.verifiedAt,
      });
    }

    return NextResponse.json(
      { success: false, error: '알 수 없는 액션입니다.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Phone verification API error:', error);
    const message =
      error instanceof Error ? error.message : '휴대폰 인증 처리 중 오류가 발생했습니다.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

