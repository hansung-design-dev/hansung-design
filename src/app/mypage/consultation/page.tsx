'use client';

import { useState } from 'react';
import Nav from '../../../components/Nav';
import MypageNav from '@/src/components/mypageNav';

export default function ConsultationPage() {
  const [activeTab, setActiveTab] = useState('1:1상담');
  // const [inquiry, setInquiry] = useState('');

  const tabs = [
    { name: '마이페이지', href: '/mypage' },
    { name: '주문내역', href: '/mypage/orders' },
    { name: '1:1상담', href: '/mypage/consultation' },
    { name: '간편정보관리', href: '/mypage/info' },
  ];

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Nav variant="default" />

      <div className="container mx-auto px-4 pt-[7rem] pb-[10rem]">
        <div className="flex gap-8">
          <MypageNav
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between gap-8">
              <div className="text-2.25 font-500">1:1 상담</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full" />
                  <div className="flex flex-col p-6 rounded">
                    <div className="text-lg font-medium mb-4">주문내역</div>
                    <div className="text-3xl font-bold">3건</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full" />
                  <div className="flex flex-col p-6 rounded">
                    <div className="text-lg font-medium mb-4">송출중 광고</div>
                    <div className="text-3xl font-bold">2건</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 유저 질문 리스트 */}
            <div className="mt-12 p-2">
              <table className="w-full table-fixed text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="w-10 px-2 py-2">번호</th>
                    <th className="px-2 py-2">내용</th>
                    <th className="w-32 px-2 py-2">날짜</th>
                    <th className="w-24 px-2 py-2">답변 상태</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      id: 1,
                      text: '올림픽대교 남단사거리 앞 (남단 유수지앞)',
                      date: '2025-03-01',
                      status: '답변완료',
                    },
                    {
                      id: 2,
                      text: '올림픽대교 남단사거리 앞 (남단 유수지앞)',
                      date: '2025-03-01',
                      status: '답변준비중',
                    },
                    {
                      id: 3,
                      text: '올림픽대교 남단사거리 앞 (남단 유수지앞)',
                      date: '2025-03-01',
                      status: '답변준비중',
                    },
                  ].map((item) => (
                    <tr key={item.id} className="border-b last:border-none">
                      <td className="px-2 py-4 text-center">{item.id}</td>
                      <td className="px-2 py-4">{item.text}</td>
                      <td className="px-2 py-4 text-center">{item.date}</td>
                      <td className="px-2 py-4 text-center font-semibold">
                        {item.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* 페이지네이션 */}
              <div className="flex justify-center mt-4 gap-2 text-sm">
                <button className="px-2 py-1 border  text-black">1</button>
                <button className="px-2 py-1 text-gray-400 cursor-not-allowed">
                  2
                </button>
                <span className="text-gray-400">▶</span>
              </div>
            </div>

            {/* 하단 정보 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16">
              {/* 자주 묻는 질문 */}
              <div className="border p-6 rounded-lg">
                <div className="text-lg font-semibold mb-4">자주 묻는 질문</div>
                <ul className="space-y-2 text-sm text-gray-700">
                  {Array.from({ length: 7 }).map((_, idx) => (
                    <li
                      key={idx}
                      className="flex justify-between border border-b-solid border-[#E0E0E0] pb-2 last:border-none last:pb-0"
                    >
                      <span>게시글</span>
                      <span className="text-gray-400">2024-01-01</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-8">
                {/* 전화번호 */}
                <div className="border p-6 rounded-lg">
                  <div className="text-lg font-semibold mb-4">전화번호</div>
                  <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="border p-4 rounded-md text-sm text-gray-700"
                      >
                        <div className="font-medium mb-1">관악구</div>
                        <div>우리 1005-103-367439</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 계좌번호 */}
                <div className="border p-6 rounded-lg">
                  <div className="text-lg font-semibold mb-4">계좌번호</div>
                  <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="border p-4 rounded-md text-sm text-gray-700"
                      >
                        <div className="font-medium mb-1">관악구</div>
                        <div>우리 1005-103-367439</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
