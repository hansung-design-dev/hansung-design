'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type NicePopupResultMessage = {
  type: 'NICE_AUTH_RESULT';
  payload: {
    resultcode: string;
    requestno?: string;
    phone?: string;
    phoneVerificationReference?: string;
    error?: string;
  };
};

export default function NiceResultClient() {
  const searchParams = useSearchParams();
  const resultcode = searchParams.get('resultcode') ?? '';
  const requestno = searchParams.get('requestno') ?? '';
  const phone = searchParams.get('phone') ?? '';
  const phoneVerificationReference =
    searchParams.get('phoneVerificationReference') ?? '';
  const error = searchParams.get('error') ?? '';
  const canPostToOpener = typeof window !== 'undefined' && !!window.opener;

  const message: NicePopupResultMessage = useMemo(
    () => ({
      type: 'NICE_AUTH_RESULT',
      payload: {
        resultcode,
        requestno: requestno || undefined,
        phone: phone || undefined,
        phoneVerificationReference: phoneVerificationReference || undefined,
        error: error || undefined,
      },
    }),
    [resultcode, requestno, phone, phoneVerificationReference, error]
  );

  const [sent, setSent] = useState(false);

  useEffect(() => {
    console.log('[Nice result page] loaded', {
      resultcode,
      requestno,
      hasOpener: !!window.opener,
    });
  }, [resultcode, requestno]);

  const handleSendAndClose = () => {
    if (!window.opener) return;
    window.opener.postMessage(message, '*');
    setSent(true);
    setTimeout(() => window.close(), 300);
  };

  // UX: 인증 완료 후 팝업이 자동으로 부모창에 결과 전달 + 닫히도록 처리
  useEffect(() => {
    if (!canPostToOpener) return;
    if (sent) return;
    // 쿼리가 아직 안붙은 상태에서는 대기
    if (!resultcode && !error) return;
    handleSendAndClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canPostToOpener, sent, resultcode, error]);

  return (
    <div style={{ padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
        NICE 본인인증 결과(팝업)
      </h2>

      <div style={{ marginBottom: 12, color: '#444' }}>
        인증 결과를 부모창에 전달한 뒤 자동으로 닫힙니다.
      </div>

      <div
        style={{
          padding: 12,
          border: '1px solid #ddd',
          borderRadius: 8,
          background: '#fafafa',
          marginBottom: 12,
        }}
      >
        <div>
          <b>resultcode</b>: {resultcode || '(없음)'}
        </div>
        <div>
          <b>requestno</b>: {requestno || '(없음)'}
        </div>
        <div>
          <b>phone</b>: {phone || '(없음)'}
        </div>
        <div>
          <b>phoneVerificationReference</b>:{' '}
          {phoneVerificationReference || '(없음)'}
        </div>
        {error && (
          <div style={{ marginTop: 8, color: '#b00020' }}>
            <b>error</b>: {error}
          </div>
        )}
      </div>

      {!canPostToOpener ? (
        <div style={{ color: '#b00020' }}>
          부모창(window.opener)을 찾지 못했습니다. 정상적인 팝업 흐름으로
          들어왔는지 확인하세요.
        </div>
      ) : (
        <button
          type="button"
          onClick={handleSendAndClose}
          style={{
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #111',
            background: sent ? '#eee' : '#111',
            color: sent ? '#111' : '#fff',
            cursor: 'pointer',
          }}
          disabled={sent}
        >
          {sent ? '전송 완료 (곧 닫힙니다...)' : '부모창으로 결과 전달 후 닫기'}
        </button>
      )}
    </div>
  );
}


