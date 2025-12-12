import { Suspense } from 'react';
import NiceBlogCertifyTestClient from './NiceBlogCertifyTestClient';

/**
 * NICE 표준창 호출 페이지 (블로그 예제 흐름 그대로)
 *
 * 참고 블로그: https://rick-ford.tistory.com/entry/Nextjs-Nice-API-%EB%B3%B8%EC%9D%B8%EC%9D%B8%EC%A6%9D-%EA%B5%AC%ED%98%84%ED%95%98%EA%B8%B0
 *
 * - token api: /api/nice-blog-test/token (returnUrl 받아 enc_data/token_version_id/integrity_value 리턴)
 * - returnUrl 콜백: /api/nice-blog-test/callback
 */
export default function NiceBlogCertifyTestPage() {
  return (
    <Suspense
      fallback={<div className="mx-auto max-w-xl px-4 py-10">Loading…</div>}
    >
      <NiceBlogCertifyTestClient />
    </Suspense>
  );
}
