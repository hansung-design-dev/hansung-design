'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type NiceEncodeType = {
  enc_data: string;
  token_version_id: string;
  integrity_value: string;
};

type NiceForm = HTMLFormElement & {
  enc_data: HTMLInputElement;
  token_version_id: HTMLInputElement;
  integrity_value: HTMLInputElement;
};

type DocumentWithForm = Document & {
  form?: NiceForm;
};

const api = {
  get: async <T,>(url: string, params: Record<string, string>) => {
    const sp = new URLSearchParams(params);
    const res = await fetch(`${url}?${sp.toString()}`, { method: 'GET' });
    const data = (await res.json()) as T;
    return { data };
  },
};

export default function NiceBlogCertifyTestClient() {
  const [debug, setDebug] = useState('');
  const route = useSearchParams();
  const reqNo = useMemo(() => route.get('reqNo') ?? '', [route]);
  const isCompleted = Boolean(reqNo);

  // 휴대폰 인증 버튼 클릭시 실행되는 함수, NICE 표준창 호출
  const onClickCertify = useCallback(async () => {
    try {
      setDebug('');

      // 블로그 예제: const { form } = document;
      const form = (document as DocumentWithForm).form;
      if (!form) throw new Error('form을 찾을 수 없습니다.');

      const left = window.screen.width / 2 - 500 / 2;
      const top = window.screen.height / 2 - 800 / 2;
      const option = `status=no, menubar=no, toolbar=no, resizable=no, width=500, height=600, left=${left}, top=${top}`;

      const returnUrl = `${window.location.origin}/api/nice-blog-test/callback`; // 본인인증 결과를 전달받을 api url

      // token api가 요청 데이터를 암호화한 후 표준창 호출에 필요한 데이터를 응답해준다.
      const res = await api.get<NiceEncodeType>('/api/nice-blog-test/token', {
        returnUrl,
      });

      if (form && res.data) {
        const { enc_data, integrity_value, token_version_id } = res.data;

        window.open('', 'nicePopup', option);
        form.target = 'nicePopup';

        // 블로그 예제: form.enc_data.value = enc_data; 형태 유지
        form.enc_data.value = enc_data;
        form.token_version_id.value = token_version_id;
        form.integrity_value.value = integrity_value;

        form.submit();
        setDebug(
          [
            'NICE 표준창 호출 완료',
            `returnUrl: ${returnUrl}`,
            `token_version_id: ${token_version_id}`,
          ].join('\n')
        );
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : '알 수 없는 오류';
      setDebug(msg);
    }
  }, []);

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-2xl font-semibold">
        NICE 본인인증 (블로그 예제 테스트)
      </h1>

      {/* 표준창 호출시 필요한 데이터 전송을 위한 form (블로그 예제와 명칭 동일) */}
      <form
        name="form"
        id="form"
        action="https://nice.checkplus.co.kr/CheckPlusSafeModel/service.cb"
        method="post"
        className="mt-8"
      >
        <input type="hidden" id="m" name="m" value="service" />
        <input
          type="hidden"
          id="token_version_id"
          name="token_version_id"
          value=""
        />
        <input type="hidden" id="enc_data" name="enc_data" value="" />
        <input
          type="hidden"
          id="integrity_value"
          name="integrity_value"
          value=""
        />
      </form>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onClickCertify}
          className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
        >
          휴대폰 인증
        </button>
        {isCompleted ? (
          <span className="rounded-md bg-green-600 px-2 py-1 text-xs font-semibold text-white">
            완료
          </span>
        ) : null}
      </div>

      <div className="mt-6 rounded-lg border bg-gray-50 p-4">
        <div className="text-sm font-medium">디버그 로그</div>
        <pre className="mt-2 whitespace-pre-wrap text-xs text-gray-700">
          {debug || '—'}
        </pre>
      </div>
    </div>
  );
}


