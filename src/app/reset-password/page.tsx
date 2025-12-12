'use client';

import { Suspense, useMemo, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { formatPhoneInput, isValidPhoneFormatted } from '@/src/lib/utils';

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

type DocumentWithNiceForm = Document & {
  niceResetPasswordForm?: NiceForm;
};

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verifiedPhoneFromNice = useMemo(
    () => searchParams.get('phone') ?? '',
    [searchParams]
  );
  const phoneVerificationReference = useMemo(
    () => searchParams.get('phoneVerificationReference') ?? '',
    [searchParams]
  );
  const callbackError = useMemo(
    () => searchParams.get('error') ?? '',
    [searchParams]
  );
  const isPhoneVerified = Boolean(phoneVerificationReference);

  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username || !phone || !newPassword || !newPasswordConfirm) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    if (!isPhoneVerified) {
      setError('휴대폰 인증을 완료해주세요.');
      return;
    }

    if (!isValidPhoneFormatted(phone)) {
      setError('휴대폰 번호를 010-1234-5678 형식으로 입력해주세요.');
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setError('새 비밀번호가 서로 일치하지 않습니다.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          phone,
          newPassword,
          phoneVerificationReference,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('비밀번호가 성공적으로 변경되었습니다. 로그인 해주세요.');
        setTimeout(() => {
          router.push('/signin');
        }, 1500);
      } else {
        setError(data.error || '비밀번호를 변경할 수 없습니다.');
      }
    } catch {
      setError('비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] pt-[5.5rem]">
      <div className="w-[27rem] flex flex-col items-center">
        <div className="text-2.265 font-600 mt-12 mb-2">비밀번호 찾기</div>

        <form onSubmit={handleSubmit} className="w-full">
          {/* NICE 표준창 호출시 필요한 데이터 전송을 위한 form (중첩 form 방지를 위해 hidden form으로 별도 둠) */}
          <form
            name="niceResetPasswordForm"
            id="niceResetPasswordForm"
            action="https://nice.checkplus.co.kr/CheckPlusSafeModel/service.cb"
            method="post"
            className="hidden"
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

          {(callbackError || error) && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {callbackError || error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
              {success}
            </div>
          )}

          {/* 아이디 인풋 */}
          <div className="flex items-center w-full h-[4rem] bg-white rounded mb-3 border border-gray-200">
            <Image
              src="/svg/login-user.svg"
              alt="아이디"
              width={20}
              height={20}
              className="h-[1.25rem] w-[1.25rem] pl-2"
            />
            <input
              type="text"
              placeholder="  아이디를 입력해주세요."
              className="flex-1 outline-none border-none font-200"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              disabled={loading}
            />
          </div>

          {/* 휴대폰 번호 인풋 */}
          <div className="flex items-center w-full h-[4rem] bg-white rounded mb-3 border border-gray-200">
            <Image
              src="/svg/login-password.svg"
              alt="휴대폰 번호"
              width={20}
              height={20}
              className="h-[1.25rem] w-[1.25rem] pl-2"
            />
            <input
              type="tel"
              placeholder="  010-1234-5678"
              className="flex-1 outline-none border-none font-200"
              value={phone}
              onChange={(e) => {
                setPhone(formatPhoneInput(e.target.value));
                setError('');
              }}
              maxLength={13}
              inputMode="numeric"
              autoComplete="tel"
              disabled={loading}
            />
          </div>

          {verifiedPhoneFromNice && (
            <div className="mb-3 text-xs text-gray-600">
              NICE 인증된 번호: <b>{verifiedPhoneFromNice}</b>
            </div>
          )}

          {/* 새 비밀번호 인풋 */}
          <div className="flex items-center w-full h-[4rem] bg-white rounded mb-3 border border-gray-200">
            <Image
              src="/svg/login-password.svg"
              alt="새 비밀번호"
              width={20}
              height={20}
              className="h-[1.25rem] w-[1.25rem] pl-2"
            />
            <input
              type="password"
              placeholder="  새 비밀번호를 입력해주세요."
              className="flex-1 outline-none border-none font-200"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setError('');
              }}
              disabled={loading}
            />
          </div>

          {/* 새 비밀번호 확인 인풋 */}
          <div className="flex items-center w-full h-[4rem] bg-white rounded mb-6 border border-gray-200">
            <Image
              src="/svg/login-password.svg"
              alt="새 비밀번호 확인"
              width={20}
              height={20}
              className="h-[1.25rem] w-[1.25rem] pl-2"
            />
            <input
              type="password"
              placeholder="  새 비밀번호를 한 번 더 입력해주세요."
              className="flex-1 outline-none border-none font-200"
              value={newPasswordConfirm}
              onChange={(e) => {
                setNewPasswordConfirm(e.target.value);
                setError('');
              }}
              disabled={loading}
            />
          </div>

          {/* 휴대폰 본인인증 버튼 (비밀번호 변경 버튼 위) */}
          <button
            type="button"
            onClick={async () => {
              try {
                setError('');
                setSuccess('');

                const niceForm = (document as DocumentWithNiceForm)
                  .niceResetPasswordForm;
                if (!niceForm) {
                  throw new Error('NICE form을 찾을 수 없습니다.');
                }

                const left = window.screen.width / 2 - 500 / 2;
                const top = window.screen.height / 2 - 800 / 2;
                const option = `status=no, menubar=no, toolbar=no, resizable=no, width=500, height=600, left=${left}, top=${top}`;

                const returnUrl = `${window.location.origin}/api/auth/reset-password/nice/callback`;
                const res = await fetch(
                  `/api/auth/reset-password/nice/token?${new URLSearchParams({
                    returnUrl,
                  }).toString()}`,
                  { method: 'GET' }
                );

                if (!res.ok) {
                  const text = await res.text().catch(() => '');
                  throw new Error(`token api 실패 (${res.status}) ${text}`);
                }

                const data = (await res.json()) as NiceEncodeType;
                if (
                  !data?.enc_data ||
                  !data?.token_version_id ||
                  !data?.integrity_value
                ) {
                  throw new Error('token api 응답 필드가 부족합니다.');
                }

                window.open('', 'nicePopup', option);
                niceForm.target = 'nicePopup';
                niceForm.enc_data.value = data.enc_data;
                niceForm.token_version_id.value = data.token_version_id;
                niceForm.integrity_value.value = data.integrity_value;
                niceForm.submit();
              } catch (e) {
                const msg = e instanceof Error ? e.message : '알 수 없는 오류';
                setError(msg);
              }
            }}
            disabled={loading || isPhoneVerified}
            className={[
              'w-full h-[4rem] text-white text-1.25 font-500 rounded mb-3',
              isPhoneVerified
                ? 'bg-[#b8d6bf] text-[#1f3a2a] cursor-not-allowed'
                : 'bg-[#2f7a45] hover:bg-[#256337]',
              loading ? 'opacity-70 cursor-not-allowed' : '',
            ].join(' ')}
          >
            {isPhoneVerified ? '휴대폰인증완료' : '휴대폰인증'}
          </button>

          <button
            type="submit"
            className="w-full h-[4rem] bg-black text-white text-1.25 font-500 rounded mb-3 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? '변경 중...' : '비밀번호 변경'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => router.push('/signin')}
          className="mt-6 text-sm text-gray-600 underline"
        >
          로그인 페이지로 돌아가기
        </button>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] pt-[5.5rem]">
          Loading…
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
