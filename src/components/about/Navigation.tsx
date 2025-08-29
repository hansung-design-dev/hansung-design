import Image from 'next/image';

interface NavigationProps {
  activeSection: string;
  scrollToSection: (sectionId: string) => void;
}

export default function Navigation({
  activeSection,
  scrollToSection,
}: NavigationProps) {
  const navItems = [
    { id: 'greetings', label: '인사말' },
    { id: 'strengths', label: '업무강점' },
    { id: 'patents', label: '특허·인증·허가' },
    { id: 'performance', label: '실적내역' },
    { id: 'organization', label: '조직도' },
    { id: 'directions', label: '찾아오시는 길' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#302625] shadow-lg mt-10">
      <div className="px-2 sm:px-4 md:px-6 lg:px-8">
        {/* 데스크톱 레이아웃 */}
        <div className="hidden  lg:flex  h-16  lg:gap-[10rem] xl:gap-[12rem] 2xl:gap-[15rem]">
          {/* 로고와 회사명 */}
          <div className="flex items-center space-x-2 xl:space-x-3 flex-shrink-0">
            <Image
              src="/images/company-intro/logo/nav-logo.png"
              alt="한성디자인 로고"
              width={400}
              height={400}
              className="w-12 h-12 xl:w-14 xl:h-14 2xl:w-16 2xl:h-16"
            />
            <span className="text-white text-[1rem] xl:text-[1.2rem] 2xl:text-[1.5rem] font-500">
              HANSUNG DESIGN
            </span>
          </div>

          {/* 네비게이션 메뉴 */}
          <div className="flex items-center lg:gap-[6rem] xl:gap-[10rem] 2xl:gap-[12rem]">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`text-white px-2 lg:px-4 xl:px-6 2xl:px-8 py-2 rounded-md text-[0.8rem] xl:text-[0.9rem] 2xl:text-[1rem] font-500 transition-colors duration-200 hover:text-blue-300 whitespace-nowrap ${
                  activeSection === item.id
                    ? 'text-blue-300 border-b-2 border-blue-300'
                    : ''
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 모바일/태블릿 레이아웃 */}
        <div className="lg:hidden">
          {/* 상단: 로고와 회사명 */}
          <div className="flex items-center justify-center py-3">
            <div className="flex items-center space-x-2">
              <Image
                src="/images/company-intro/logo/nav-logo.png"
                alt="한성디자인 로고"
                width={400}
                height={400}
                className="w-12 h-12 sm:w-14 sm:h-14"
              />
              <span className="text-white text-[1rem] sm:text-[1.1rem] font-500">
                HANSUNG DESIGN
              </span>
            </div>
          </div>

          {/* 하단: 네비게이션 메뉴 */}
          <div className="flex items-center justify-center pb-3">
            <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-white px-2 sm:px-3 py-1 sm:py-2 rounded-md text-[0.7rem] sm:text-[0.8rem] font-500 transition-colors duration-200 hover:text-blue-300 whitespace-nowrap ${
                    activeSection === item.id
                      ? 'text-blue-300 border-b-2 border-blue-300'
                      : ''
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
