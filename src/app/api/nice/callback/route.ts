import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return respond(request);
}

export async function POST(request: NextRequest) {
  return respond(request);
}

const respond = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const payload = {
    enc_data: searchParams.get('enc_data'),
    token_version_id: searchParams.get('token_version_id'),
    integrity_value: searchParams.get('integrity_value'),
    reqNo: searchParams.get('reqNo'),
  };
  console.log('[Nice callback]', payload);

  return NextResponse.json({
    success: true,
    message: 'Nice 인증 결과를 받았으며, 클라이언트 측에서 추가 처리를 진행하세요.',
    payload,
  });
};

