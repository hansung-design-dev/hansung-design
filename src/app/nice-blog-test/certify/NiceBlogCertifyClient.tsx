'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function NiceBlogCertifyClient() {
  const route = useSearchParams();
  const [error, setError] = useState<string>('');

  const reqNo = useMemo(() => route.get('reqNo') ?? '', [route]);

  const handleLoad = useCallback(() => {
    try {
      if (!reqNo) {
        throw new Error('reqNo가 없습니다.');
      }

      // ...기타 필요 작업
      // 블로그 예제 스타일: opener 이동 + 팝업 닫기
      (window.opener as Window | null)?.document.location?.assign(
        `${window.location.origin}/nice-blog-test?reqNo=${encodeURIComponent(reqNo)}`
      );
      window.close();
    } catch (e) {
      const msg = e instanceof Error ? e.message : '알 수 없는 오류';
      setError(msg);
    }
  }, [reqNo]);

  useEffect(() => {
    if (!window.opener) {
      setError('비정상적인 접근입니다. (window.opener가 없습니다)');
      return;
    }
    handleLoad(); // 정상적인 루트로 진입한 경우 실행된다.
  }, [handleLoad]);

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-lg font-semibold">certify</h1>
      <div className="mt-2 text-sm text-gray-700">
        {error ? `오류: ${error}` : '인증 처리 중...'}
      </div>
    </div>
  );
}


