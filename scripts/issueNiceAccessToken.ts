import axios from 'axios';
import fs from 'fs';
import path from 'path';

function loadEnvLocalIfExists() {
  // Next.js는 dev 서버에서 .env.local을 자동 로드하지만,
  // 이 스크립트(ts-node/node)는 자동 로드가 안 될 수 있어서 직접 읽어준다.
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, 'utf8');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function issueNiceAccessToken() {
  loadEnvLocalIfExists();

  const clientId = process.env.NICE_CLIENT_ID;
  const clientSecret = process.env.NICE_CLIENT_SECRET;

  console.log('[issueNiceAccessToken] env loaded', {
    clientId: clientId ? `${clientId.slice(0, 6)}...` : null,
    clientSecret: clientSecret ? '(set)' : null,
  });
  if (!clientId || !clientSecret) {
    console.error('NICE_CLIENT_ID / NICE_CLIENT_SECRET을 먼저 설정하세요.');
    process.exit(1);
  }

  const authorization = Buffer.from(`${clientId}:${clientSecret}`).toString(
    'base64'
  );
  const dataBody = new URLSearchParams({
    scope: 'default',
    grant_type: 'client_credentials',
  }).toString();

  try {
    const response = await axios({
      method: 'POST',
      url: 'https://svc.niceapi.co.kr:22001/digital/niceid/oauth/oauth/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${authorization}`,
      },
      data: dataBody,
    });

    console.log('전체 응답:', JSON.stringify(response.data, null, 2));
    const token = response.data?.dataBody?.access_token;
    if (!token) {
      console.error(
        'access_token을 못 찾았습니다. 응답 구조를 다시 확인하세요.'
      );
      process.exit(1);
    }

    console.log('\n==============================');
    console.log('발급된 NICE_ACCESS_TOKEN 값:');
    console.log(token);
    console.log('==============================\n');
  } catch (err: unknown) {
    console.error('토큰 발급 실패:');
    if (typeof err === 'object' && err && 'response' in err) {
      const e = err as {
        response?: { status?: number; statusText?: string; data?: unknown };
        message?: string;
      };
      console.error(e?.response?.status, e?.response?.statusText);
      console.error(e?.response?.data || e?.message);
    } else if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error(String(err));
    }
    process.exit(1);
  }
}

issueNiceAccessToken();
