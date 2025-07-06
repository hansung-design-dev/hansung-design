'use client';
import React from 'react';

const faqCategories = [
  '디지털사이니지',
  '공공디자인',
  'LED전자게시대',
  '현수막게시대',
];

const tableData = [
  { no: '공지', title: '6월 휴무 안내', date: '2025-05-30', id: 1, bold: true },
  { no: '공지', title: '6월 휴무 안내', date: '2025-05-30', id: 2, bold: true },
  { no: '08', title: '일반 안내', date: '2025-05-30', id: 3 },
  { no: '07', title: '일반 안내', date: '2025-05-30', id: 4 },
  { no: '06', title: '일반 안내', date: '2025-05-30', id: 5 },
  { no: '05', title: '일반 안내', date: '2025-05-30', id: 6 },
  { no: '04', title: '일반 안내', date: '2025-05-30', id: 7 },
  { no: '03', title: '일반 안내', date: '2025-05-30', id: 8 },
  { no: '02', title: '일반 안내', date: '2025-05-30', id: 9 },
  { no: '01', title: '일반 안내', date: '2025-05-30', id: 10 },
];

export default function CustomerPage() {
  const [activeTab, setActiveTab] = React.useState<
    '공지사항' | '자주 묻는 질문'
  >('공지사항');
  const [activeFaq, setActiveFaq] = React.useState(faqCategories[0]);

  return (
    <div className="py-12 mx-[10rem] min-h-[80vh]">
      {/* 상단 고객지원 제목 */}
      <section className="font-gmarket text-2.5 font-700 mb-12 lg:container lg:mx-auto lg:px-[8rem] sm:px-[1.5rem] pt-[6rem] pb-[3rem]">
        고객지원
      </section>
      <section className="flex gap-24 ">
        {/* Left Nav */}
        <div className="w-72 flex-shrink-0">
          <div className="mb-10">
            {/* 공지사항 탭 */}
            <div
              className={`text-1.25 font-700 mb-6 border-b-1 border-b-solid pb-4 border-gray-1 cursor-pointer ${
                activeTab === '공지사항' ? 'text-black' : 'text-gray-5'
              }`}
              onClick={() => setActiveTab('공지사항')}
            >
              공지사항
            </div>
            {/* 자주 묻는 질문 탭 */}
            <div
              className={`text-1.25 font-600 mb-3 cursor-pointer ${
                activeTab === '자주 묻는 질문' ? 'text-black' : 'text-gray-5'
              }`}
              onClick={() => setActiveTab('자주 묻는 질문')}
            >
              자주 묻는 질문
            </div>
            {/* 하위 FAQ 카테고리 */}
            {activeTab === '자주 묻는 질문' && (
              <ul className="pl-5 space-y-3 text-lg">
                {faqCategories.map((cat) => (
                  <li
                    key={cat}
                    className={`list-disc ml-2 cursor-pointer ${
                      activeFaq === cat ? 'text-black font-600' : 'text-gray-5'
                    }`}
                    onClick={() => setActiveFaq(cat)}
                  >
                    {cat}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {/* Main Content */}
        <main className="flex-1 w-1/3">
          <div className="text-2.5 font-500 mb-6 border-b-solid border-b-1 border-gray-1 pb-4">
            {activeTab === '공지사항'
              ? '공지사항'
              : `자주 묻는 질문 - ${activeFaq}`}
          </div>
          <table className="w-full border-collapse text-lg">
            <thead>
              <tr className="bg-gray-1 text-gray-400 text-1.25 font-500">
                <th className="py-5 px-5 text-left ">no</th>
                <th className="py-5 px-5 text-left">공지안내</th>
                <th className="py-5 px-5 text-left ">등록일</th>
              </tr>
            </thead>
            <tbody className="py-4">
              {tableData.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-b-solid border-b-gray-1 hover:bg-gray-50 cursor-pointer"
                  onClick={() => (window.location.href = `/customer/${row.id}`)}
                >
                  <td className="py-3 px-5">{row.no}</td>
                  <td className={`py-3 px-5${row.bold ? ' font-bold' : ''}`}>
                    {row.title}
                  </td>
                  <td className="py-3 px-5">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination (예시) */}
          <div className="flex justify-center mt-8 gap-3 text-gray-500 text-lg">
            <span className="font-bold text-black">1</span>
            <span>2</span>
            <span>&gt;</span>
          </div>
        </main>
      </section>
    </div>
  );
}
