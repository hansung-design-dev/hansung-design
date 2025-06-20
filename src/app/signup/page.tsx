import Image from 'next/image';
import { Button } from '@/src/components/button/button';

export default function Signup() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
      <div className="w-[27rem] flex flex-col items-center">
        <div className="text-2.265 font-600 mt-12 mb-2">회원가입</div>
        <div className="text-1-400 mb-8">
          회원가입에 필요한 정보를 입력해주세요.
        </div>

        {/* 닉네임/성함 인풋 */}
        <div className="flex items-center w-full h-[4rem] bg-white rounded mb-6">
          <Image
            src="/svg/login-password.svg"
            alt="이름"
            width={20}
            height={20}
            className="h-[1.25rem] w-[1.25rem] pl-2"
          />
          <input
            type="text"
            placeholder="  이름을 입력해주세요."
            className="flex-1 outline-none border-none font-200"
          />
        </div>

        {/* 아이디 인풋 */}
        <div className="flex w-full items-center gap-2 mb-6">
          <div className="flex flex-1 items-center h-[4rem] bg-white rounded">
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
          <Button size="sm" className="text-0-75-500 h-[4rem]">
            중복확인
          </Button>
        </div>

        {/* 이메일 인풋 */}
        <div className="flex items-center w-full h-[4rem] bg-white rounded mb-6">
          <Image
            src="/svg/login-password.svg"
            alt="이메일"
            width={20}
            height={20}
            className="h-[1.25rem] w-[1.25rem] pl-2"
          />
          <input
            type="email"
            placeholder="  이메일을 적어주세요."
            className="flex-1 outline-none border-none font-200"
          />
        </div>

        {/* 비번 인풋 */}
        <div className="flex items-center w-full h-[4rem] bg-white rounded mb-6">
          <Image
            src="/svg/login-password.svg"
            alt="비밀번호"
            width={20}
            height={20}
            className="h-[1.25rem] w-[1.25rem] pl-2"
          />
          <input
            type="password"
            placeholder="  비밀번호를 적어주세요."
            className="flex-1 outline-none border-none font-200"
          />
        </div>

        {/* 비번확인 인풋 */}
        <div className="flex items-center w-full h-[4rem] bg-white rounded mb-6 ">
          <Image
            src="/svg/login-password.svg"
            alt="비밀번호"
            width={20}
            height={20}
            className="h-[1.25rem] w-[1.25rem] pl-2"
          />
          <input
            type="password"
            placeholder="  비밀번호를 한 번 더 입력해주세요."
            className="flex-1 outline-none border-none font-200"
          />
        </div>

        {/* 회원가입 버튼 */}
        <button className="w-full h-[4rem] bg-black text-white text-1.25 fonr-500 rounded">
          회원가입
        </button>
      </div>
    </div>
  );
}
