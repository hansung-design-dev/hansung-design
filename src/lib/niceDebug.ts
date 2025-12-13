type NiceEnvDebugInput = {
  clientId?: string | null;
  clientSecret?: string | null;
  productId?: string | null;
  accessToken?: string | null;
  /** Optional: reason why accessToken could not be resolved/issued. */
  accessTokenError?: string | null;
  /** The returnUrl you are about to send to NICE (computed final value). */
  returnUrl?: string | null;
  /** The exact returnUrl registered in NICE console, if you keep it in env for verification. */
  registeredReturnUrl?: string | null;
  /** Optional context label to make logs searchable. */
  scope?: string;
};

function maskTokenPrefix(token: string | null | undefined, prefixLen = 6) {
  const t = typeof token === 'string' ? token : '';
  if (!t) return { exists: false, prefix: null as string | null, length: 0 };
  return {
    exists: true,
    prefix: t.slice(0, prefixLen),
    length: t.length,
  };
}

function safeLen(value: string | null | undefined) {
  return typeof value === 'string' ? value.length : 0;
}

function diffStringsLiteral(a: string, b: string, limit = 12) {
  const diffs: Array<{
    index: number;
    aChar: string;
    bChar: string;
    aCode: number;
    bCode: number;
  }> = [];

  const maxLen = Math.max(a.length, b.length);
  for (let i = 0; i < maxLen; i++) {
    const aChar = a[i] ?? '';
    const bChar = b[i] ?? '';
    if (aChar !== bChar) {
      diffs.push({
        index: i,
        aChar,
        bChar,
        aCode: aChar ? aChar.codePointAt(0) ?? -1 : -1,
        bCode: bChar ? bChar.codePointAt(0) ?? -1 : -1,
      });
      if (diffs.length >= limit) break;
    }
  }

  return {
    equal: a === b,
    aLen: a.length,
    bLen: b.length,
    firstDiffIndex: diffs[0]?.index ?? null,
    diffs,
  };
}

/**
 * Server-side ONLY: masked logging for NICE envs and returnUrl exact-match diagnostics.
 * Do NOT call this from client code.
 */
export function logNiceEnvDebug(input: NiceEnvDebugInput) {
  const scope = input.scope?.trim() ? input.scope.trim() : 'unknown-scope';

  const clientId = input.clientId ?? null;
  const clientSecret = input.clientSecret ?? null;
  const productId = input.productId ?? null;
  const accessToken = input.accessToken ?? null;
  const accessTokenError = input.accessTokenError ?? null;
  const returnUrl = input.returnUrl ?? null;
  const registeredReturnUrl = input.registeredReturnUrl ?? null;

  const tokenInfo = maskTokenPrefix(accessToken, 6);

  console.log(`[NICE env-check:${scope}] env summary`, {
    clientId: {
      exists: Boolean(clientId && String(clientId).trim()),
      length: safeLen(clientId ? String(clientId) : ''),
    },
    clientSecret: {
      exists: Boolean(clientSecret && String(clientSecret).trim()),
      length: safeLen(clientSecret ? String(clientSecret) : ''),
    },
    productId: {
      exists: Boolean(productId && String(productId).trim()),
    },
    accessToken: {
      exists: tokenInfo.exists,
      prefix6: tokenInfo.prefix,
      length: tokenInfo.length,
    },
    accessTokenError: accessTokenError ? String(accessTokenError).slice(0, 300) : null,
  });

  if (returnUrl != null) {
    console.log(`[NICE env-check:${scope}] returnUrl to NICE`, {
      returnUrl,
      length: returnUrl.length,
      json: JSON.stringify(returnUrl), // helps spot trailing spaces / invisible chars
      startsWithHttps: returnUrl.startsWith('https://'),
    });
  }

  if (registeredReturnUrl != null) {
    console.log(`[NICE env-check:${scope}] registeredReturnUrl (NICE console)`, {
      registeredReturnUrl,
      length: registeredReturnUrl.length,
      json: JSON.stringify(registeredReturnUrl),
    });
  }

  if (returnUrl != null && registeredReturnUrl != null) {
    const diff = diffStringsLiteral(returnUrl, registeredReturnUrl, 12);
    console.log(`[NICE env-check:${scope}] returnUrl exact match`, {
      equal: diff.equal,
      firstDiffIndex: diff.firstDiffIndex,
      aLen: diff.aLen,
      bLen: diff.bLen,
      diffs: diff.diffs,
    });
  } else {
    console.log(`[NICE env-check:${scope}] returnUrl comparison skipped`, {
      hasReturnUrl: returnUrl != null,
      hasRegisteredReturnUrl: registeredReturnUrl != null,
      hint:
        'Set NICE_CONSOLE_RETURN_URL env to enable exact-match comparison (recommended for debugging).',
    });
  }
}


