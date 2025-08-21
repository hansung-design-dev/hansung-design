'use client';

import { useState, useEffect } from 'react';

interface FAQItem {
  category: string;
  questions: {
    question: string;
    answer: string;
  }[];
}

interface FaqDataItem {
  id: string;
  title: string;
  answer: string;
  homepage_menu_types: {
    name: string;
  };
}

const FAQ = () => {
  const [faqData, setFaqData] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<{
    question: string;
    answer: string;
  } | null>(null);

  // 영문 카테고리를 한글로 변환하는 함수
  const translateCategory = (englishName: string): string => {
    const categoryMapping: { [key: string]: string } = {
      digital_signage: '디지털미디어',
      public_design: '공공디자인',
      led_display: 'LED전자게시대',
      banner_display: '현수막게시대',
    };
    return categoryMapping[englishName] || englishName;
  };

  // 마크다운 텍스트를 HTML로 변환하는 함수
  const renderMarkdown = (text: string) => {
    return text
      .replace(/\n\n/g, '</p><p>') // 이중 줄바꿈을 단락으로
      .replace(/\n/g, '<br>') // 단일 줄바꿈을 <br>로
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **텍스트**를 굵게
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // *텍스트*를 기울임
      .replace(/■\s*(.*?)(?=\n|$)/g, '<strong>■ $1</strong>') // ■ 텍스트를 굵게
      .replace(/^<p>/, '') // 첫 번째 <p> 태그 제거
      .replace(/<\/p>$/, ''); // 마지막 </p> 태그 제거
  };

  // FAQ 데이터 가져오기
  useEffect(() => {
    const fetchFaqData = async () => {
      try {
        const response = await fetch('/api/frequent-questions');
        const data = await response.json();

        if (data.faqs) {
          // 카테고리별로 그룹화
          const groupedData = data.faqs.reduce(
            (acc: FAQItem[], faq: any) => {
              const categoryName = translateCategory(
                faq.homepage_menu_types.name
              );
              const existingCategory = acc.find(
                (item) => item.category === categoryName
              );

              if (existingCategory) {
                existingCategory.questions.push({
                  question: faq.title,
                  answer: faq.answer,
                });
              } else {
                acc.push({
                  category: categoryName,
                  questions: [
                    {
                      question: faq.title,
                      answer: faq.answer,
                    },
                  ],
                });
              }

              return acc;
            },
            []
          );

          setFaqData(groupedData);

          // 첫 번째 카테고리와 첫 번째 질문을 기본값으로 설정
          if (groupedData.length > 0) {
            setOpenCategory(groupedData[0].category);
            if (groupedData[0].questions.length > 0) {
              setSelectedQuestion(groupedData[0].questions[0]);
            }
          }
        }
      } catch (error) {
        console.error('FAQ 데이터 조회 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqData();
  }, []);

  return (
    <section className="py-[5rem] md:py-[10rem]  bg-[#F5F5F5] rounded-sm mb-0">
      <div className="lg:px-4 sm:flex sm:flex-col items-center sm:justify-center lg:gap-[3rem] sm:gap-[2rem]">
        <div className=" flex flex-col items-center gap-[1rem] ">
          <div className="text-2.5 sm:text-1.7 font-weight-900">FAQ </div>
          <div className="text-2.5 sm:text-1.7 font-weight-900">
            더 궁금한 점이 있으신가요?
          </div>
        </div>
        {/* FAQ 섹션 */}
        <div className="mb-8 flex flex-col items-center gap-[1rem] text-[#767676]  ">
          <div className="text-1.75 sm:text-1.25 font-weight-700">
            자주 물어보신 질문들만
          </div>
          <div className="text-1.75  sm:text-1.25 font-weight-700">
            모아 둔 FAQ를 참고 해 주세요.
          </div>
        </div>
        <div className="lg:w-[60rem] items-start flex flex-col md:flex-row gap-[2rem] md:gap-[1rem] justify-center min-h-[30rem] md:min-w-[40rem] md:px-[2rem]">
          {/* 질문파트 */}
          <div className="w-[30rem] md:w-[80%] bg-white rounded-lg shadow p-[1.5rem] md:p-[2.5rem] sm:w-[16rem] sm:px-[1rem] ">
            {loading ? (
              <div className="text-center py-8">FAQ를 불러오는 중...</div>
            ) : faqData.length > 0 ? (
              faqData.map((item) => (
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
                          <path
                            d="M346 1L-1.4782e-05 0.99997"
                            stroke="#E0E0E0"
                          />
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
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                FAQ 데이터가 없습니다.
              </div>
            )}
          </div>

          {/*답변섹션 */}
          <div className="lg:w-[35rem] md:w-[80%] bg-white rounded-lg shadow p-[1.5rem] md:p-[2.5rem] sm:w-[16rem] sm:px-[1rem] lg:max-h-[50rem] lg:h-[38.5rem]">
            {loading ? (
              <div className="text-center py-8">답변을 불러오는 중...</div>
            ) : selectedQuestion ? (
              <div>
                <h2 className="text-1.25 md:text-1.125 font-600 mb-[1.5rem]">
                  {selectedQuestion.question}
                </h2>
                <div
                  className="text-1 text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: `<p>${renderMarkdown(selectedQuestion.answer)}</p>`,
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                질문을 선택해주세요.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
