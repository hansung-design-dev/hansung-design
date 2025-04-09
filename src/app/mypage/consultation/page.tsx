'use client';

import { useState } from 'react';
import Nav from '../../../components/Nav';
import MypageNav from '@/src/components/mypageNav';

export default function ConsultationPage() {
  const [activeTab, setActiveTab] = useState('1:1상담');
  const [inquiry, setInquiry] = useState('');

  const tabs = [
    { name: '마이페이지', href: '/mypage' },
    { name: '주문내역', href: '/mypage/orders' },
    { name: '1:1상담', href: '/mypage/consultation' },
    { name: '간편정보관리', href: '/mypage/info' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Inquiry submitted:', inquiry);
  };

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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  문의 내용
                </label>
                <textarea
                  value={inquiry}
                  onChange={(e) => setInquiry(e.target.value)}
                  rows={6}
                  className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="문의하실 내용을 입력해주세요."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-black text-white py-4 rounded-lg hover:bg-gray-800 transition-colors"
              >
                문의하기
              </button>
            </form>

            {/* 하단 정보 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16">
              {/* 자주 묻는 질문 */}
              <div className="border p-6 rounded-lg">
                <div className="text-lg font-semibold mb-4">자주 묻는 질문</div>
                <ul className="space-y-2 text-sm text-gray-700">
                  {Array.from({ length: 7 }).map((_, idx) => (
                    <li
                      key={idx}
                      className="flex justify-between border-b border-[#E0E0E0] border pb-2 last:border-none last:pb-0"
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
