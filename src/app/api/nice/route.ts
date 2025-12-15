// app/api/nice/route.ts
import { NextRequest, NextResponse } from 'next/server';

type JsonRecord = Record<string, unknown>;

interface NiceProxySuccess<T = unknown> extends JsonRecord {
  data?: T;
}

interface NiceProxyError extends JsonRecord {
  message: string;
  status?: number;
  detail?: string;
}

/**
 * Why this exists:
 * - NICE 서버는 보통 "허용 IP(화이트리스트)" 기반으로 접근을 제한합니다.
 * - Vercel의 아웃바운드 IP는 고정이 아니므로, Vercel에서 NICE를 직접 호출하면
 *   IP 변경으로 인해 차단/실패가 발생할 수 있습니다.
 * - 고정 IP를 가진 Lightsail 프록시를 통해 호출하면 NICE 측에서 안정적으로 허용 처리 가능합니다.
 */

export const runtime = 'nodejs';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const NICE_PROXY_URL = process.env.NICE_PROXY_URL;

  if (!NICE_PROXY_URL) {
    return NextResponse.json<NiceProxyError>(
      { message: 'Missing env: NICE_PROXY_URL' },
      { status: 500 }
    );
  }

  // 클라이언트가 보낸 JSON payload를 그대로 전달
  let payload: JsonRecord;
  try {
    payload = (await req.json()) as JsonRecord;
  } catch {
    return NextResponse.json<NiceProxyError>(
      { message: 'Invalid JSON payload' },
      { status: 400 }
    );
  }

  const res = await fetch(`${NICE_PROXY_URL}/nice/auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 필요하면 추적용 헤더를 추가할 수 있습니다.
      // "X-Request-Id": req.headers.get("x-request-id") ?? crypto.randomUUID(),
    },
    body: JSON.stringify(payload),
    cache: 'no-store', // 중요: 인증/세션성 요청은 캐시되면 안 됨
  });

  if (!res.ok) {
    // 가능하면 프록시 에러 바디를 함께 반환
    const text = await res.text().catch(() => '');
    return NextResponse.json<NiceProxyError>(
      {
        message: 'NICE proxy request failed',
        status: res.status,
        ...(text ? { detail: text } : {}),
      },
      { status: 502 }
    );
  }

  const data = (await res.json()) as NiceProxySuccess;

  // 그대로 클라이언트에 반환
  return NextResponse.json(data, { status: 200 });
}
