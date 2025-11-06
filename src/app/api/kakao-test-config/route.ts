import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const appKey = process.env.NEXT_PUBLIC_KAKAO_KEY || '';
    const center = {
      lat: 37.5665, // 서울시청 좌표
      lng: 126.978,
    };

    return NextResponse.json({
      appKey,
      center,
    });
  } catch (error) {
    console.error('Error in kakao-test-config API:', error);
    return NextResponse.json(
      {
        error: 'Failed to load Kakao Map configuration',
        appKey: '',
        center: { lat: 37.5665, lng: 126.978 },
      },
      { status: 500 }
    );
  }
}
