import { NextRequest, NextResponse } from 'next/server';
import { generateCryptoToken } from '@/src/lib/nicepay/phoneVerificationService';

export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}

const handleRequest = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const body =
      request.method === 'POST' ? await request.json().catch(() => ({})) : {};
    const returnUrl =
      searchParams.get('returnUrl') ?? (body as Record<string, string>).returnUrl;
    const cancelUrl =
      searchParams.get('cancelUrl') ?? (body as Record<string, string>).cancelUrl;

    if (!returnUrl) {
      return NextResponse.json(
        { success: false, error: 'returnUrl을 포함하여 호출해주세요.' },
        { status: 400 }
      );
    }

    const tokenPayload = await generateCryptoToken({
      returnUrl,
      cancelUrl: cancelUrl ?? undefined,
    });

    return NextResponse.json({
      success: true,
      data: tokenPayload,
    });
  } catch (error) {
    console.error('Nice crypto token API error:', error);
    const message =
      error instanceof Error ? error.message : '토큰 발급에 실패했습니다.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
};

