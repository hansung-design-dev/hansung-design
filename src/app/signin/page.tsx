import Image from 'next/image';
import Link from 'next/link';
export default function Signin() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] pt-[5.5rem]">
      <div className="w-[27rem] flex flex-col items-center">
        <div className="text-2.265 font-600 mt-12 mb-2">로그인</div>
        <div className="text-1 font-400 mb-8 text-gray-14">
          한성에 방문해주셔서 감사합니다.
        </div>
        {/* 아이디 인풋 */}

        <div className="flex items-center w-full h-[4rem] bg-white rounded mb-3  border border-gray-200">
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
          />
        </div>
        {/* 비밀번호 인풋 */}
        <div className="flex items-center w-full h-[4rem] bg-white rounded mb-6  border border-gray-200">
          <Image
            src="/svg/login-password.svg"
            alt="비밀번호"
            width={20}
            height={20}
            className="h-[1.25rem] w-[1.25rem] pl-2"
          />
          <input
            type="password"
            placeholder="  비밀번호를 입력해주세요."
            className="flex-1 outline-none border-none font-200"
          />
        </div>
        {/* 로그인 버튼 */}
        <button className="w-full h-[4rem] bg-black text-white text-1.25 font-500 rounded mb-3">
          로그인
        </button>
        {/* 카카오 로그인 버튼 */}
        <button className="relative w-full h-[4rem] flex items-center justify-center bg-[#FEE500] text-1.25 font-500 rounded mb-3">
          <Image
            src="/svg/kakao-icon.svg"
            alt="카카오"
            width={28}
            height={26}
            className="h-[1.625rem] w-[1.76rem] mr-2 absolute left-10"
          />
          카카오로 로그인
        </button>
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
