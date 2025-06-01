import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const KAKAO_API_KEY = process.env.KAKAO_REST_API_KEY!;

async function getCoords(address: string) {
  const url = 'https://dapi.kakao.com/v2/local/search/address.json';
  console.log(`[KakaoAPI] 요청: ${address}`);
  const res = await fetch(`${url}?query=${encodeURIComponent(address)}`, {
    headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` },
    cache: 'no-store',
  });
  const data = await res.json();
  console.log(`[KakaoAPI] 응답:`, JSON.stringify(data));
  const doc = data.documents?.[0];
  if (doc) {
    return { lat: Number(doc.y), lng: Number(doc.x) };
  }
  return { lat: null, lng: null };
}

export async function GET() {
  console.log('[API] Supabase에서 주소 데이터 불러오기 시작');
  const { data, error } = await supabase
    .from('billboards')
    .select('id, address');
  if (error) {
    console.error('[API] Supabase 에러:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  console.log(`[API] Supabase에서 불러온 데이터:`, data);

  // 2. 각 주소에 대해 좌표 변환 (병렬 처리)
  const results = await Promise.all(
    data
      .filter((row) => !!row.address)
      .map(async (row) => {
        console.log(`[API] 주소 변환 처리:`, row.address);
        const coords = await getCoords(row.address);
        return { id: row.id, address: row.address, ...coords };
      })
  );

  console.log('[API] 최종 변환 결과:', results);
  // 3. 결과 반환
  return NextResponse.json(results);
}

export {};
