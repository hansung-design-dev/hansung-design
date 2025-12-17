import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

function isEnabled() {
  const flag = String(process.env.DEBUG_EGRESS_IP ?? '')
    .trim()
    .toLowerCase();
  if (flag === 'true') return true;
  // Convenience: allow in local dev without exposing in prod by default.
  return process.env.NODE_ENV === 'development';
}

function isAuthorized(request: NextRequest) {
  const token = String(process.env.DEBUG_EGRESS_IP_TOKEN ?? '').trim();
  if (!token) return true; // allow if no token is configured
  const provided = request.nextUrl.searchParams.get('token') ?? '';
  return provided === token;
}

export async function GET(request: NextRequest) {
  if (!isEnabled()) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/de0826ba-4e91-43eb-b001-5614ace69b75', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'src/app/api/debug/egress-ip/route.ts:GET:entry',
      message: 'debug egress-ip invoked',
      data: {
        nodeEnv: process.env.NODE_ENV ?? null,
        vercel: Boolean(process.env.VERCEL),
        vercelRegion: process.env.VERCEL_REGION ?? null,
      },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'pre-fix',
      hypothesisId: 'H6',
    }),
  }).catch(() => {});
  // #endregion agent log

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch('https://api.ipify.org?format=json', {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
    });
    const data = (await res.json().catch(() => null)) as { ip?: string } | null;

    const ip = typeof data?.ip === 'string' ? data.ip : null;
    console.log('[debug/egress-ip] resolved', {
      ip,
      ok: res.ok,
      status: res.status,
    });

    if (!res.ok || !ip) {
      // #region agent log
      fetch(
        'http://127.0.0.1:7242/ingest/de0826ba-4e91-43eb-b001-5614ace69b75',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'src/app/api/debug/egress-ip/route.ts:GET:bad-response',
            message: 'Failed to resolve egress ip',
            data: { ok: res.ok, status: res.status, hasIp: Boolean(ip) },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'pre-fix',
            hypothesisId: 'H6',
          }),
        }
      ).catch(() => {});
      // #endregion agent log
      return NextResponse.json(
        { error: 'Failed to resolve egress ip', status: res.status },
        { status: 502 }
      );
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/de0826ba-4e91-43eb-b001-5614ace69b75', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'src/app/api/debug/egress-ip/route.ts:GET:ok',
        message: 'Resolved server egress IP',
        data: {
          ip,
          status: res.status,
          vercel: Boolean(process.env.VERCEL),
          vercelRegion: process.env.VERCEL_REGION ?? null,
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'pre-fix',
        hypothesisId: 'H6',
      }),
    }).catch(() => {});
    // #endregion agent log

    // Note: this is the server's outbound (egress) IP at call time.
    return NextResponse.json(
      {
        ip,
        vercel: Boolean(process.env.VERCEL),
        vercelRegion: process.env.VERCEL_REGION ?? null,
        note: 'This is the server egress IP at call time (may change on serverless).',
      },
      { status: 200 }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[debug/egress-ip] error', msg);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/de0826ba-4e91-43eb-b001-5614ace69b75', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'src/app/api/debug/egress-ip/route.ts:GET:error',
        message: 'debug egress-ip errored',
        data: { msg },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'pre-fix',
        hypothesisId: 'H6',
      }),
    }).catch(() => {});
    // #endregion agent log
    return NextResponse.json({ error: msg }, { status: 502 });
  } finally {
    clearTimeout(t);
  }
}
