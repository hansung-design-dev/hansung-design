import { NextResponse } from 'next/server';

export async function GET() {
  // Read from env without hardcoding values
  const appKey =
    process.env.KAKAO_MAP_JS_KEY || process.env.NEXT_PUBLIC_KAKAO_KEY || '';
  const defaultCenterRaw = process.env.KAKAO_TEST_DEFAULT_CENTER || '';

  let center = { lat: 37.5665, lng: 126.978 }; // fallback: Seoul City Hall
  if (defaultCenterRaw) {
    const parts = defaultCenterRaw.split(',').map((v) => v.trim());
    if (parts.length === 2) {
      const lat = Number(parts[0]);
      const lng = Number(parts[1]);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        center = { lat, lng };
      }
    }
  }

  return NextResponse.json({ appKey, center });
}
