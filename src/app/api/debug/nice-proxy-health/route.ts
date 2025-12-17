import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

function isEnabled() {
  const flag = String(process.env.DEBUG_NICE_PROXY ?? '')
    .trim()
    .toLowerCase();
  if (flag === 'true') return true;
  return process.env.NODE_ENV === 'development';
}

function isAuthorized(request: NextRequest) {
  const token = String(process.env.DEBUG_NICE_PROXY_TOKEN ?? '').trim();
  if (!token) return true;
  const provided = request.nextUrl.searchParams.get('token') ?? '';
  return provided === token;
}

function safeHost(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return 'invalid-url';
  }
}

export async function GET(request: NextRequest) {
  if (!isEnabled()) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const proxyUrl = process.env.NICE_PROXY_URL?.trim() || '';
  const proxyKey = process.env.NICE_PROXY_KEY?.trim() || '';
  const healthUrl = proxyUrl ? `${proxyUrl.replace(/\/+$/, '')}/health` : '';

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/de0826ba-4e91-43eb-b001-5614ace69b75', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'src/app/api/debug/nice-proxy-health/route.ts:GET:entry',
      message: 'Checking NICE proxy /health',
      data: {
        proxyHost: safeHost(proxyUrl),
        healthHost: safeHost(healthUrl),
        isHttps: proxyUrl.startsWith('https://'),
        hasProxyUrl: Boolean(proxyUrl),
        hasProxyKey: Boolean(proxyKey),
        nodeEnv: process.env.NODE_ENV ?? null,
        vercel: Boolean(process.env.VERCEL),
      },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'pre-fix',
      hypothesisId: 'H4',
    }),
  }).catch(() => {});
  // #endregion agent log

  if (!proxyUrl) {
    return NextResponse.json(
      { ok: false, error: 'Missing env: NICE_PROXY_URL' },
      { status: 500 }
    );
  }

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        ...(proxyKey ? { 'x-internal-key': proxyKey } : {}),
      },
      cache: 'no-store',
      signal: controller.signal,
    });
    const text = await res.text().catch(() => '');

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/de0826ba-4e91-43eb-b001-5614ace69b75', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'src/app/api/debug/nice-proxy-health/route.ts:GET:response',
        message: 'NICE proxy /health response',
        data: {
          proxyHost: safeHost(proxyUrl),
          status: res.status,
          ok: res.ok,
          bodySample: text.slice(0, 80),
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'pre-fix',
        hypothesisId: 'H4',
      }),
    }).catch(() => {});
    // #endregion agent log

    return NextResponse.json(
      { ok: res.ok, status: res.status, body: text.slice(0, 500) },
      { status: res.ok ? 200 : 502 }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const err = e as unknown as {
      name?: string;
      message?: string;
      cause?: {
        code?: string;
        errno?: number;
        syscall?: string;
        address?: string;
        port?: number;
      };
    };
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/de0826ba-4e91-43eb-b001-5614ace69b75', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location:
          'src/app/api/debug/nice-proxy-health/route.ts:GET:error-detail',
        message: 'NICE proxy /health error detail',
        data: {
          proxyHost: safeHost(proxyUrl),
          healthHost: safeHost(healthUrl),
          isHttps: proxyUrl.startsWith('https://'),
          errName: err?.name ?? null,
          msg,
          causeCode: err?.cause?.code ?? null,
          causeErrno: err?.cause?.errno ?? null,
          causeSyscall: err?.cause?.syscall ?? null,
          causeAddress: err?.cause?.address ?? null,
          causePort: err?.cause?.port ?? null,
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'pre-fix',
        hypothesisId: 'H4',
      }),
    }).catch(() => {});
    // #endregion agent log
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/de0826ba-4e91-43eb-b001-5614ace69b75', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'src/app/api/debug/nice-proxy-health/route.ts:GET:error',
        message: 'NICE proxy /health error',
        data: { proxyHost: safeHost(proxyUrl), msg },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'pre-fix',
        hypothesisId: 'H4',
      }),
    }).catch(() => {});
    // #endregion agent log
    return NextResponse.json(
      {
        ok: false,
        error: msg,
        detail: {
          errName: err?.name ?? null,
          causeCode: err?.cause?.code ?? null,
          causeSyscall: err?.cause?.syscall ?? null,
          causeAddress: err?.cause?.address ?? null,
          causePort: err?.cause?.port ?? null,
        },
      },
      { status: 502 }
    );
  } finally {
    clearTimeout(t);
  }
}
