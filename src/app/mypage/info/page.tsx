'use client';

import { useState } from 'react';
import Link from 'next/link';
import Nav from '../../../components/Nav';

export default function UserInfoPage() {
  const [activeTab, setActiveTab] = useState('간편정보관리');
  const [userInfo, setUserInfo] = useState({
    name: '홍길동',
    email: 'user@example.com',
    phone: '010-1234-5678',
    company: '한성기업',
  });

  const tabs = [
    { name: '마이페이지', href: '/mypage' },
    { name: '주문내역', href: '/mypage/orders' },
    { name: '1:1상담', href: '/mypage/customer-service' },
    { name: '간편정보관리', href: '/mypage/info' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('User info updated:', userInfo);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Nav variant="default" />

      <div className="container mx-auto px-4 pt-[7rem] pb-[10rem]">
        <div className="flex gap-8">
          {/* Left Navigation */}
          <div className="w-[16rem] flex-shrink-0">
            <div className="flex flex-col gap-2">
              {tabs.map((tab) => (
                <Link
                  key={tab.name}
                  href={tab.href}
                  onClick={() => setActiveTab(tab.name)}
                  className={`px-4 py-3 rounded ${
                    activeTab === tab.name
                      ? 'bg-black text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-8">간편정보관리</h2>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름
                </label>
                <input
                  type="text"
                  name="name"
                  value={userInfo.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  name="email"
                  value={userInfo.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  전화번호
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={userInfo.phone}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  회사명
                </label>
                <input
                  type="text"
                  name="company"
                  value={userInfo.company}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-black text-white py-4 rounded-lg hover:bg-gray-800 transition-colors"
              >
                정보 수정
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
