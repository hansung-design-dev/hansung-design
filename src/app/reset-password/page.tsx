'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatPhoneInput, isValidPhoneFormatted } from '@/src/lib/utils';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username || !phone || !newPassword || !newPasswordConfirm) {
      setError('모든 필드를 입력해주세요.');
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
        body: JSON.stringify({ username, phone, newPassword }),
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
        <div className="text-1 font-400 mb-8 text-gray-14">
          아이디와 휴대폰 번호를 이용하여 새 비밀번호를 설정합니다.
        </div>

        <form onSubmit={handleSubmit} className="w-full">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
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


