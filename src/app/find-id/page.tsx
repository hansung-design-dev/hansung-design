'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatPhoneInput, isValidPhoneFormatted } from '@/src/lib/utils';

export default function FindIdPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [resultUsername, setResultUsername] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResultUsername(null);

    if (!name || !phone) {
      setError('이름과 휴대폰 번호를 모두 입력해주세요.');
      return;
    }

    if (!isValidPhoneFormatted(phone)) {
      setError('휴대폰 번호를 010-1234-5678 형식으로 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/find-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResultUsername(data.usernameMasked ?? null);
      } else {
        setError(data.error || '아이디를 찾을 수 없습니다.');
      }
    } catch {
      setError('아이디 찾기 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] pt-[5.5rem]">
      <div className="w-[27rem] flex flex-col items-center">
        <div className="text-2.265 font-600 mt-12 mb-2">아이디 찾기</div>
        <div className="text-1 font-400 mb-8 text-gray-14">
          가입 시 입력한 이름과 휴대폰 번호로 아이디를 찾습니다.
        </div>

        <form onSubmit={handleSubmit} className="w-full">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          {/* 이름 인풋 */}
          <div className="flex items-center w-full h-[4rem] bg-white rounded mb-3 border border-gray-200">
            <Image
              src="/svg/login-user.svg"
              alt="이름"
              width={20}
              height={20}
              className="h-[1.25rem] w-[1.25rem] pl-2"
            />
            <input
              type="text"
              placeholder="  이름을 입력해주세요."
              className="flex-1 outline-none border-none font-200"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              disabled={loading}
            />
          </div>

          {/* 휴대폰 번호 인풋 */}
          <div className="flex items-center w-full h-[4rem] bg-white rounded mb-6 border border-gray-200">
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

          <button
            type="submit"
            className="w-full h-[4rem] bg-black text-white text-1.25 font-500 rounded mb-3 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? '조회 중...' : '아이디 찾기'}
          </button>
        </form>

        {resultUsername && (
          <div className="w-full mt-4 p-4 bg-white border border-gray-200 rounded text-sm">
            <div className="mb-2 text-gray-700">가입된 아이디</div>
            <div className="text-lg font-semibold">{resultUsername}</div>
          </div>
        )}

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


