'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function CertifyContent() {
  const route = useSearchParams();
  const [error, setError] = useState<string>('');

  const reqNo = useMemo(() => route.get('reqNo') ?? '', [route]);
  const phone = useMemo(() => route.get('phone') ?? '', [route]);
  const phoneVerificationReference = useMemo(
    () => route.get('phoneVerificationReference') ?? '',
    [route]
  );
  const callbackError = useMemo(() => route.get('error') ?? '', [route]);

  const handleLoad = useCallback(() => {
    try {
      if (!reqNo) {
        throw new Error('reqNo가 없습니다.');
      }

      // 인증 완료 후: 부모창 이동 + 팝업 닫기
      const target = new URL('/reset-password', window.location.origin);
      target.searchParams.set('reqNo', reqNo);
      if (phone) target.searchParams.set('phone', phone);
      if (phoneVerificationReference)
        target.searchParams.set(
          'phoneVerificationReference',
          phoneVerificationReference
        );
      if (callbackError) target.searchParams.set('error', callbackError);
      (window.opener as Window | null)?.location?.assign(target.toString());
      window.close();
    } catch (e) {
      const msg = e instanceof Error ? e.message : '알 수 없는 오류';
      setError(msg);
    }
  }, [reqNo, phone, phoneVerificationReference, callbackError]);

  useEffect(() => {
    if (!window.opener) {
      setError('비정상적인 접근입니다. (window.opener가 없습니다)');
      return;
    }
    handleLoad();
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

export default function Certify() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-xl px-4 py-10">Loading…</div>}>
      <CertifyContent />
    </Suspense>
  );
}


