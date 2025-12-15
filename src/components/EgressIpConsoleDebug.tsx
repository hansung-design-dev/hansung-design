'use client';

import { useEffect } from 'react';

type EgressIpResponse = {
  ip: string;
  vercel: boolean;
  vercelRegion: string | null;
  note: string;
};

type EgressIpErrorResponse = {
  error: string;
  status?: number;
};

export default function EgressIpConsoleDebug() {
  useEffect(() => {
    // Enable only when explicitly requested via query param.
    // Example (prod): /?debugEgress=1&token=YOUR_DEBUG_TOKEN
    const params = new URLSearchParams(window.location.search);
    if (params.get('debugEgress') !== '1') return;

    const token = params.get('token');
    const url = token
      ? `/api/debug/egress-ip?token=${encodeURIComponent(token)}`
      : '/api/debug/egress-ip';

    (async () => {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        const text = await res.text();

        if (!res.ok) {
          console.warn('[debugEgress] failed', {
            url,
            status: res.status,
            body: text,
          });
          return;
        }

        const data = JSON.parse(text) as
          | EgressIpResponse
          | EgressIpErrorResponse;
        console.log('[debugEgress] server egress ip', data);
      } catch (e) {
        console.warn('[debugEgress] error', e);
      }
    })();
  }, []);

  return null;
}
