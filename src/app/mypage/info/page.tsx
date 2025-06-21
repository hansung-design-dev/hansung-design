'use client';

import { useState } from 'react';
import Nav from '../../../components/layouts/nav';
import { Button } from '@/src/components/button/button';
import Image from 'next/image';
import Link from 'next/link';
import MypageContainer from '@/src/components/mypageContainer';
export default function UserInfoPage() {
  const [activeTab, setActiveTab] = useState('간편정보관리');

  const tabs = [
    { name: '마이페이지', href: '/mypage' },
    { name: '주문내역', href: '/mypage/orders' },
    { name: '1:1상담', href: '/mypage/customer-service' },
    { name: '간편정보관리', href: '/mypage/info' },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // 예시 데이터
  const simpleInfos = [
    {
      title: '타이틀1',
      name: '고객A',
      phone: '010-1234-5678',
      email: 'a@example.com',
    },
    {
      title: '타이틀2',
      name: '고객B',
      phone: '010-2345-6789',
      email: 'b@example.com',
    },
    {
      title: '타이틀3',
      name: '고객C',
      phone: '010-3456-7890',
      email: 'c@example.com',
    },
    {
      title: '타이틀4',
      name: '고객D',
      phone: '010-4567-8901',
      email: 'd@example.com',
    },
    // ...더 추가 가능
  ];

  const totalPages = Math.ceil(simpleInfos.length / itemsPerPage);
  const currentItems = simpleInfos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <main className="min-h-screen flex flex-col bg-[#F1F1F1]">
      <Nav variant="default" className="bg-white sm:px-0" />
      <MypageContainer
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      >
        <div className="flex flex-col sm:items-start">
          <Link href="/mypage" className="md:hidden lg:hidden sm:inline">
            <Image
              src="/svg/arrow-left.svg"
              alt="orders"
              width={20}
              height={20}
              className="w-[1.5rem] h-[1.5rem]"
            />
          </Link>
          <h2 className="text-1.5 md:text-2.25 font-500 mb-4 md:mb-8 border-b-solid border-gray-3 pb-4 md:pb-8 w-full">
            간편정보관리
          </h2>
          <div className="space-y-4 md:space-y-6 max-w-2xl w-full">
            <div className="flex flex-col gap-3 md:gap-[1.25rem] bg-white p-4 md:p-6 rounded-lg">
              <div className="">
                <div className="text-0.875 text-gray-500 mb-2 border border-b-solid border-gray-3 pb-2">
                  닉네임
                </div>
                <div className="flex items-center sm:justify-between">
                  <p className="text-0.875 md:text-1 font-500 w-full md:w-[16rem]">
                    닉네임
                  </p>
                  <Button variant="ghost" size="sm" className="bg-gray-4">
                    수정
                  </Button>
                </div>
              </div>
              <div className="">
                <div className="text-0.875 text-gray-500 mb-2 border border-b-solid border-gray-3 pb-2">
                  이메일정보
                </div>
                <p className="text-0.875 md:text-1 font-500">00@naver.com</p>
              </div>
              <div>
                <p className="text-0.875 text-gray-500 mb-2 border border-b-solid border-gray-3 pb-2">
                  사업자정보
                </p>
                <div className="flex items-center sm:justify-between">
                  <div className="text-0.875 md:text-1 font-500 text-[#636363] underline underline-offset-4 cursor-pointer">
                    <div className="w-full md:w-[16rem]">첨부파일이름</div>
                  </div>
                  <Button variant="ghost" size="sm" className="bg-gray-4">
                    수정
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-lg">
              <button
                className="flex flex-col gap-2 items-center justify-center w-full mb-4 md:mb-6 text-0.875 md:text-1 font-500 text-black py-3 border border-solid border-gray-3 rounded-lg"
                onClick={() => console.log('간편정보추가')}
              >
                <div>+</div>
                <div>간편정보 추가하기</div>
              </button>
              {currentItems.map((item, idx) => (
                <div
                  key={idx}
                  className="border border-solid border-gray-3 rounded-lg px-3 md:px-4 py-4 md:py-8 mb-3 md:mb-4 flex flex-col md:flex-row justify-between items-start gap-3 md:gap-0"
                >
                  <div className="font-500 text-gray-2 flex flex-col gap-1 md:gap-2">
                    <div className="text-1 md:text-1.25 mb-1">{item.title}</div>
                    <div className="text-0.875 md:text-1">{item.name}</div>
                    <div className="text-0.875 md:text-1">{item.phone}</div>
                    <div className="text-0.875 md:text-1">{item.email}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-gray-4 mt-2 md:mt-0"
                  >
                    수정
                  </Button>
                </div>
              ))}

              <div className="flex justify-center items-center gap-2 md:gap-4 text-gray-500 mt-4">
                <div className="flex gap-2 md:gap-4 text-1 md:text-1.25 items-center justify-center">
                  {Array.from({ length: totalPages }, (_, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePageChange(idx + 1)}
                      className={`border-none text-1 md:text-1.25 font-500 ${
                        currentPage === idx + 1 ? 'text-black' : 'text-gray-5'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
                {currentPage < totalPages && (
                  <Image
                    src="/svg/arrow-right.svg"
                    alt="arrow-right"
                    width={13}
                    height={13}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="cursor-pointer"
                  />
                )}
              </div>
            </div>

            <div className="flex   md:flex-row gap-3 md:gap-4 justify-center ">
              <Button
                variant="outlineGray"
                size="md"
                className="w-[10rem]"
                onClick={() => console.log('비번변경')}
              >
                비밀번호 변경하기
              </Button>
              <Button
                variant="outlineGray"
                size="md"
                className="w-[10rem]"
                onClick={() => console.log('로그아웃')}
              >
                로그아웃
              </Button>
            </div>

            <div className="text-center mt-4 md:mt-6">
              <button className="text-0.875 md:text-1 text-gray-500 border-none">
                탈퇴하기
              </button>
            </div>
          </div>
        </div>
      </MypageContainer>
    </main>
  );
}
