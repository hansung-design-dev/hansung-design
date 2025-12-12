'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type NicePopupResultMessage = {
  type: 'NICE_AUTH_RESULT';
  payload: { resultcode: string; requestno?: string };
};

export default function NiceResultClient() {
  const searchParams = useSearchParams();
  const resultcode = searchParams.get('resultcode') ?? '';
  const requestno = searchParams.get('requestno') ?? '';
  const canPostToOpener = typeof window !== 'undefined' && !!window.opener;

  const message: NicePopupResultMessage = useMemo(
    () => ({
      type: 'NICE_AUTH_RESULT',
      payload: { resultcode, requestno: requestno || undefined },
    }),
    [resultcode, requestno]
  );

  const [sent, setSent] = useState(false);

  useEffect(() => {
    // 디버깅 편의를 위해 자동 close는 하지 않음.
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
    // 디버깅할 때 너무 빨리 닫히지 않도록 약간 지연
    setTimeout(() => window.close(), 300);
  };

  return (
    <div style={{ padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
        NICE 본인인증 결과(팝업)
      </h2>

      <div style={{ marginBottom: 12, color: '#444' }}>
        이 페이지는 NICE 표준창이 인증 완료 후 이동하는 결과 페이지입니다.
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
          {sent ? '전송 완료' : '부모창으로 결과 전달 후 닫기'}
        </button>
      )}
    </div>
  );
}


