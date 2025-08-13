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
    { id: 'patents', label: '특허' },
    { id: 'certifications', label: '기업인증 및 허가증' },
    { id: 'performance', label: '실적내역' },
    { id: 'organization', label: '조직도' },
    { id: 'directions', label: '찾아오시는 길' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#302625] shadow-lg mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 로고와 회사명 */}
          <div className="flex items-center space-x-3">
            <Image
              src="/images/company-intro/logo/nav-logo.png"
              alt="한성디자인 로고"
              width={400}
              height={400}
              className="w-16 h-16"
            />
            <span className="text-white text-[1.5rem] font-500">
              HANSUNG DESIGN
            </span>
          </div>

          {/* 네비게이션 메뉴 */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`text-white px-6 py-2 rounded-md text-[1rem] font-500 transition-colors duration-200 hover:text-blue-300 ${
                  activeSection === item.id
                    ? 'text-blue-300 border-b-2 border-blue-300'
                    : ''
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="md:hidden">
            <button className="text-white hover:text-gray-300">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
