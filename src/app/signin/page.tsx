'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/src/contexts/authContext';
import { useRouter } from 'next/navigation';
// import KakaoLoginButton from '@/src/components/auth/KakaoLoginButton';

export default function Signin() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(''); // 입력 시 에러 메시지 초기화
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('=== 로그인 폼 제출 ===');
    console.log('입력된 username:', formData.username);
    console.log('입력된 password:', formData.password);

    if (!formData.username || !formData.password) {
      setError('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('signIn 함수 호출 전:', {
        username: formData.username,
        password: formData.password,
      });
      const result = await signIn(formData.username, formData.password);

      if (result.success) {
        // 로그인 성공 시 메인 페이지로 이동
        router.push('/');
      } else {
        setError(result.error || '로그인에 실패했습니다.');
      }
    } catch {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] pt-[5.5rem]">
      <div className="w-[27rem] flex flex-col items-center">
        <div className="text-2.265 font-600 mt-12 mb-2">로그인</div>
        <div className="text-1 font-400 mb-8 text-gray-14">
          한성에 방문해주셔서 감사합니다.
        </div>

        <form onSubmit={handleSubmit} className="w-full">
          {/* 에러 메시지 */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
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
              type="email"
              placeholder="  이메일을 입력해주세요."
              className="flex-1 outline-none border-none font-200"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              disabled={loading}
            />
          </div>

          {/* 비밀번호 인풋 */}
          <div className="flex items-center w-full h-[4rem] bg-white rounded mb-6 border border-gray-200">
            <Image
              src="/svg/login-password.svg"
              alt="비밀번호"
              width={20}
              height={20}
              className="h-[1.25rem] w-[1.25rem] pl-2"
            />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="  비밀번호를 입력해주세요."
              className="flex-1 outline-none border-none font-200"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="px-3"
            >
              <Image
                src={showPassword ? '/svg/eye_off.svg' : '/svg/eye_on.svg'}
                alt={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                width={20}
                height={20}
                className="h-[1.25rem] w-[1.25rem]"
              />
            </button>
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            className="w-full h-[4rem] bg-black text-white text-1.25 font-500 rounded mb-3 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {/* 카카오 로그인 버튼 */}
        {/* <KakaoLoginButton className="w-full h-[4rem] text-1.25 font-500 rounded mb-3">
          <Image
            src="/svg/kakao-icon.svg"
            alt="카카오"
            width={28}
            height={26}
            className="h-[1.625rem] w-[1.76rem] mr-2"
          />
          카카오로 로그인
        </KakaoLoginButton> */}

        {/* 회원가입 버튼 */}
        <Link
          href="/signup"
          className="w-full flex items-center justify-center h-[4rem] bg-white text-black text-1.25 font-500 rounded border border-gray-200"
        >
          회원가입
        </Link>
      </div>
    </div>
  );
}
