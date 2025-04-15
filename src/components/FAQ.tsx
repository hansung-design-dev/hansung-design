'use client';

import { useState } from 'react';

interface FAQItem {
  category: string;
  questions: {
    question: string;
    answer: string;
  }[];
}

const faqData: FAQItem[] = [
  {
    category: '공공디자인',
    questions: [
      {
        question: '견적은 어떻게 받나요?',
        answer: '견적 요청 양식을 작성해주세요.',
      },
    ],
  },
  {
    category: 'LED전자게시대',
    questions: [
      {
        question: '신청은 어떻게 하나요?',
        answer: '신청 페이지에서 신청 가능합니다.',
      },
      {
        question: '결제가 되지 않아요.',
        answer: '결제 방법을 다시 확인해주세요.',
      },
      {
        question: '게시 일자 확인은 어디서 하나요?',
        answer: '마이페이지에서 확인 가능합니다.',
      },
      {
        question: '광고 이미지를 변경하고 싶어요.',
        answer: '고객센터로 문의해주세요.',
      },
    ],
  },
  {
    category: '현수막게시대',
    questions: [
      {
        question: '설치 기간은 얼마나 걸리나요?',
        answer: '보통 2~3일 소요됩니다.',
      },
    ],
  },
  {
    category: '디지털사이니지',
    questions: [
      {
        question: '유지보수는 어떻게 하나요?',
        answer: '정기 점검이 제공됩니다.',
      },
    ],
  },
];

const FAQ = () => {
  const [openCategory, setOpenCategory] = useState<string | null>(
    'LED전자게시대'
  );
  const [selectedQuestion, setSelectedQuestion] = useState<{
    question: string;
    answer: string;
  } | null>(faqData[1].questions[0]);

  return (
    <section className="py-[5rem] md:py-[10rem] sm:mb-[2rem] bg-[#F5F5F5] rounded-sm ">
      <div className="lg:px-4 sm:flex sm:flex-col sm:items-center sm:justify-center">
        <h1 className="text-2.25 font-bold mb-8 sm:text-1.7 lg:text-center md:text-left sm:text-center ">
          자주 묻는 질문
        </h1>
        <div className="w-[60rem] md:w-[40rem] sm:w-full sm:items-center flex flex-col md:flex-row gap-[2rem] md:gap-[5rem]">
          {/* Categories and Questions - Full width on mobile, 1/3 on desktop */}
          <div className="w-full md:w-full sm:w-[18rem]">
            {faqData.map((item) => (
              <div
                key={item.category}
                className={`mb-[1rem] md:mb-[2rem] ${
                  openCategory === item.category && 'shadow'
                }`}
              >
                <button
                  onClick={() =>
                    setOpenCategory(
                      openCategory === item.category ? null : item.category
                    )
                  }
                  className={`w-full text-left p-[1rem] md:p-[1.5rem] flex justify-between items-center border-none rounded-lg shadow bg-white ${
                    openCategory === item.category &&
                    'shadow-none rounded-b-none'
                  } flex flex-col`}
                >
                  <div className="flex items-center justify-between text-1 md:text-1.25 font-medium w-full">
                    <span>{item.category}</span>
                    <span>
                      {openCategory === item.category ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M18 15L12 9L6 15"
                            stroke="black"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M6 9L12 15L18 9"
                            stroke="black"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                  </div>

                  {openCategory === item.category && (
                    <div className="w-full flex justify-center mt-[1rem] ">
                      <svg
                        className="w-5/6"
                        xmlns="http://www.w3.org/2000/svg"
                        height="2"
                        viewBox="0 0 346 2"
                        fill="none"
                      >
                        <path d="M346 1L-1.4782e-05 0.99997" stroke="#E0E0E0" />
                      </svg>
                    </div>
                  )}
                </button>

                {openCategory === item.category && (
                  <div className="pl-[1rem] md:pl-[1.5rem] py-[1rem] bg-white rounded-b-lg">
                    {item.questions.map((q) => (
                      <button
                        key={q.question}
                        onClick={() => setSelectedQuestion(q)}
                        className={`block w-full text-left p-[0.75rem] md:p-[1rem] text-0.875  border-none ${
                          selectedQuestion?.question === q.question
                            ? 'font-bold text-black'
                            : 'text-gray-600'
                        }`}
                      >
                        {q.question}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Answer Section - Full width on mobile, 2/3 on desktop */}
          <div className="w-full md:w-full bg-white rounded-lg shadow p-[1.5rem] md:p-[2.5rem] sm:w-[16rem] sm:px-[1rem] min-h-[250px]">
            {selectedQuestion && (
              <div>
                <h2 className="text-1.25 md:text-1.125 font-600 mb-[1.5rem]">
                  {selectedQuestion.question}
                </h2>
                <p className="text-1 text-gray-700 ">
                  {selectedQuestion.answer}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
