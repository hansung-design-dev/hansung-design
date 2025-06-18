'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface MenuItem {
  name: string;
  href: string;
  mypage?: boolean;
}

interface IconButtonProps {
  onClick?: () => void;
  iconPath: string;
  label: string;
  href: string;
  TextInvert?: boolean;
  className?: string;
}

interface NavProps {
  className?: string;
  isbg?: boolean;
  TextInvert?: boolean;
  variant?: 'default' | 'photo' | 'mixed';
}

const menuItems: MenuItem[] = [
  { name: '공공디자인', href: '/public-design' },
  { name: 'LED전자게시대', href: '/led-display' },
  { name: '현수막게시대', href: '/banner-display' },
  { name: '디지털사이니지', href: '/digital-signage' },
];

const IconButton = ({
  onClick,
  iconPath,
  label,
  href,
  TextInvert,
  className,
}: IconButtonProps) => (
  <Link href={href} className="relative z-50">
    <button
      onClick={onClick}
      className="border-none p-2 rounded-full transition-colors hover:cursor-pointer"
      aria-label={label}
    >
      <Image
        src={iconPath}
        alt={label}
        width={30}
        height={30}
        className={`w-7 h-7 ${TextInvert ? 'invert' : ''} ${className}`}
      />
    </button>
  </Link>
);

const IconList = ({ TextInvert }: { TextInvert?: boolean }) => (
  <div className="flex items-center gap-3 sm:gap-2">
    <IconButton
      iconPath="/svg/shopping-cart.svg"
      label="장바구니"
      href="/cart"
      TextInvert={TextInvert}
    />
    <IconButton
      iconPath="/svg/user.svg"
      label="마이페이지"
      href="/mypage"
      TextInvert={TextInvert}
    />
  </div>
);

const Nav = ({ className, isbg, TextInvert }: NavProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const [mypage, setMypage] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getMenuItemStyles = (isSelected: boolean) => {
    if (isSelected) return 'bg-black text-white rounded-full px-4 py-2';
    return 'bg-white text-black rounded-full px-4 py-2';
  };

  useEffect(() => {
    setMypage(mypage);
  }, [mypage]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 border-b border-gray-200 lg:py-[1.5rem] sm:px-[1.5rem] bg-white ${
        isbg || isScrolled ? 'bg-white' : 'bg-transparent'
      } ${className}`}
    >
      <div className="lg:container md:container mx-auto ">
        <div className="flex justify-between items-center h-[5.5rem]w-full">
          {/* 로고 */}
          <Link
            href="/"
            className="flex items-center sm:hidden lg:inline md:inline"
          >
            <Image
              src="/svg/logo.svg"
              alt="로고"
              width={150}
              height={40}
              className={`lg:w-[9.375rem] lg:h-10 md:w-[5rem] md:h-8 ${
                TextInvert && !isScrolled ? 'invert' : ''
              }`}
            />
          </Link>

          {/* ✅ 데스크탑/태블릿 메뉴 (md 이상부터) */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center lg:gap-[4rem] md:gap-[2rem] ">
              {menuItems.map((item) => {
                const isSelected =
                  pathname === item.href ||
                  pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`lg:text-1 md:text-0.75  transition-colors duration-100  ${getMenuItemStyles(
                      isSelected
                    )}`}
                  >
                    {item.name}
                  </Link>
                );
              })}
              <IconList TextInvert={TextInvert && !isScrolled} />
            </div>
          </div>

          {/* ✅ 모바일 전용 햄버거 메뉴 (sm 이하) */}
          <div className="md:hidden flex items-center gap-4 justify-around w-full">
            <IconButton
              onClick={() => setIsOpen(!isOpen)}
              iconPath={'/svg/menu.svg'}
              label={isOpen ? '메뉴 닫기' : '메뉴 열기'}
              href="#"
              TextInvert={TextInvert && !isScrolled}
              className="w-[4.5rem] h-[4.5rem] flex items-center justify-center"
            />
            <div>{mypage ? '마이페이지' : ''}</div>
            <IconList TextInvert={TextInvert && !isScrolled} />
          </div>
        </div>

        {/* ✅ 모바일 드로어 메뉴 (sm에서만) */}
        {isOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            {/* 왼쪽 2/3 메뉴 */}
            <div className="w-2/3 max-w-[320px] bg-white h-full flex flex-col p-6 animate-slide-in-left ">
              {/* 로고 */}
              <Link href="/" className="mb-8">
                <Image src="/svg/logo.svg" alt="로고" width={120} height={32} />
              </Link>
              {/* 메뉴 리스트 */}
              <nav className="flex flex-col sm:gap-12">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-1.25  ${
                      pathname === item.href
                        ? 'font-bold text-black'
                        : 'text-gray-600'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <Link
                  href="/about"
                  className="text-1.25 text-gray-600"
                  onClick={() => setIsOpen(false)}
                >
                  회사소개
                </Link>
                <Link
                  href="/support"
                  className="text-1.25 text-gray-600"
                  onClick={() => setIsOpen(false)}
                >
                  고객지원
                </Link>
              </nav>
            </div>
            {/* 오른쪽 1/3 오버레이 + X버튼 */}
            <div
              className="flex-1 bg-black/60 h-full relative"
              onClick={() => setIsOpen(false)}
            >
              <button
                className="absolute top-6 right-6"
                onClick={() => setIsOpen(false)}
                aria-label="메뉴 닫기"
              >
                <Image src="/svg/x.svg" alt="닫기" width={36} height={36} />
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Nav;
