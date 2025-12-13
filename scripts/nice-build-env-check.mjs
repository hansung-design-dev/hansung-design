/**
 * Vercel/CI build-time NICE env check (masked).
 *
 * This script runs during `prebuild`, so the output goes to the *build logs*.
 * It must NOT print secrets. Only prints existence/length/prefix.
 */

function safeTrim(v) {
  return typeof v === 'string' ? v.trim() : '';
}

function maskPrefix(token, n = 6) {
  const t = safeTrim(token);
  return {
    exists: Boolean(t),
    length: t.length,
    prefix: t ? t.slice(0, n) : null,
  };
}

function diffStrings(a, b, limit = 12) {
  const A = String(a);
  const B = String(b);
  const diffs = [];
  const max = Math.max(A.length, B.length);
  for (let i = 0; i < max; i++) {
    const ac = A[i] ?? '';
    const bc = B[i] ?? '';
    if (ac !== bc) {
      diffs.push({
        index: i,
        aChar: ac,
        bChar: bc,
        aCode: ac ? ac.codePointAt(0) ?? -1 : -1,
        bCode: bc ? bc.codePointAt(0) ?? -1 : -1,
      });
      if (diffs.length >= limit) break;
    }
  }
  return {
    equal: A === B,
    aLen: A.length,
    bLen: B.length,
    firstDiffIndex: diffs[0]?.index ?? null,
    diffs,
  };
}

function resolveBaseUrl() {
  // Vercel gives VERCEL_URL without protocol (e.g. "myapp.vercel.app")
  const vercelUrl = safeTrim(process.env.VERCEL_URL);
  if (vercelUrl) return `https://${vercelUrl}`;

  // fallback for local/other CI setups
  const baseUrl = safeTrim(process.env.NEXT_PUBLIC_BASE_URL);
  if (baseUrl) return baseUrl;

  return '';
}

function resolveAbsoluteReturnUrl(returnUrl, baseUrl) {
  const ru = safeTrim(returnUrl);
  if (!ru) return '';
  if (ru.startsWith('http://') || ru.startsWith('https://')) return ru;
  if (ru.startsWith('/')) {
    if (!baseUrl) return ru; // cannot absolutize without base
    try {
      return new URL(ru, baseUrl).toString();
    } catch {
      return ru;
    }
  }
  return ru;
}

const scope = 'build';
const clientId = process.env.NICE_CLIENT_ID;
const productId = process.env.NICE_PRODUCT_ID;
const accessToken = process.env.NICE_ACCESS_TOKEN;
const returnUrl = process.env.NICE_RETURN_URL;
const registeredReturnUrl = process.env.NICE_CONSOLE_RETURN_URL;

const baseUrl = resolveBaseUrl();
const absoluteReturnUrl = resolveAbsoluteReturnUrl(returnUrl, baseUrl);

console.log(`[NICE env-check:${scope}] env summary`, {
  vercelEnv: safeTrim(process.env.VERCEL_ENV) || null,
  hasVercelUrl: Boolean(safeTrim(process.env.VERCEL_URL)),
  baseUrlUsedForReturnUrl: baseUrl || null,
  clientId: {
    exists: Boolean(safeTrim(clientId)),
    length: safeTrim(clientId).length,
  },
  productId: {
    exists: Boolean(safeTrim(productId)),
  },
  accessToken: maskPrefix(accessToken, 6),
});

console.log(`[NICE env-check:${scope}] returnUrl to NICE (build-time)`, {
  returnUrlRaw: safeTrim(returnUrl) || null,
  returnUrlAbsolute: absoluteReturnUrl || null,
  jsonRaw: returnUrl != null ? JSON.stringify(returnUrl) : null,
  jsonAbsolute: absoluteReturnUrl ? JSON.stringify(absoluteReturnUrl) : null,
});

if (registeredReturnUrl != null && absoluteReturnUrl) {
  const reg = safeTrim(registeredReturnUrl);
  const diff = diffStrings(absoluteReturnUrl, reg, 12);
  console.log(`[NICE env-check:${scope}] returnUrl exact match (build-time)`, {
    equal: diff.equal,
    firstDiffIndex: diff.firstDiffIndex,
    aLen: diff.aLen,
    bLen: diff.bLen,
    diffs: diff.diffs,
  });
} else {
  console.log(`[NICE env-check:${scope}] returnUrl comparison skipped (build-time)`, {
    hasReturnUrlAbsolute: Boolean(absoluteReturnUrl),
    hasRegisteredReturnUrl: Boolean(safeTrim(registeredReturnUrl)),
    hint:
      'Set NICE_CONSOLE_RETURN_URL to enable exact-match comparison in build logs.',
  });
}


