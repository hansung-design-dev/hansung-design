/**
 * Base URL을 동적으로 가져오는 헬퍼 함수
 * - NEXT_PUBLIC_BASE_URL이 설정되어 있으면 우선 사용
 * - Vercel 배포 환경에서는 VERCEL_URL 사용
 * - 클라이언트 사이드에서는 window.location 사용
 * - 그 외에는 localhost로 폴백
 */

export function getBaseUrl(): string {
  // 1. 명시적으로 설정된 NEXT_PUBLIC_BASE_URL이 있으면 사용
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    // 마지막 슬래시 제거
    return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, '');
  }

  // 2. Vercel 배포 환경 (자동으로 VERCEL_URL이 설정됨)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // 3. 클라이언트 사이드에서는 window.location 사용
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // 4. 기본값: localhost
  return 'http://localhost:3000';
}

/**
 * 서버 사이드에서 요청 객체로부터 Base URL을 가져오는 함수
 * API 라우트에서 사용
 */
export function getBaseUrlFromRequest(request?: Request): string {
  // 1. 명시적으로 설정된 NEXT_PUBLIC_BASE_URL이 있으면 사용
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, '');
  }

  // 2. Vercel 배포 환경
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // 3. 요청 객체가 있으면 요청의 origin 사용
  if (request) {
    try {
      const url = new URL(request.url);
      return url.origin;
    } catch (error) {
      console.warn('Could not get base URL from request:', error);
    }
  }

  // 4. 기본값: localhost
  return 'http://localhost:3000';
}
