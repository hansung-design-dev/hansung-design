'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/src/contexts/authContext';
import { useRouter } from 'next/navigation';

interface MenuItem {
  name: string;
  href: string;
  mypage?: boolean;
}

interface IconButtonProps {
  onClick?: () => void;
  iconPath: string;
  label: string;
  href?: string;
  TextInvert?: boolean;
  className?: string;
  showDropdown?: boolean;
  onToggleDropdown?: () => void;
}

interface NavProps {
  className?: string;
  isbg?: boolean;
  TextInvert?: boolean;
  variant?: 'default' | 'photo' | 'mixed';
}

const menuItems: MenuItem[] = [
  { name: '회사소개', href: '/about' },
  { name: '공공디자인', href: '/public-design' },
  { name: 'LED전자게시대', href: '/led-display' },
  { name: '현수막게시대', href: '/banner-display' },
  { name: '디지털미디어', href: '/digital-media' },
];

const IconButton = ({
  onClick,
  iconPath,
  label,
  href,
  TextInvert,
  className,
  showDropdown,
  onToggleDropdown,
}: IconButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { signOut, user } = useAuth();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onToggleDropdown?.();
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown, onToggleDropdown]);

  const handleLogout = async () => {
    try {
      const result = await signOut();
      if (result.success) {
        router.push('/');
      } else {
        console.error('로그아웃 실패:', result.error);
      }
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
    }
  };

  if (label === '마이페이지') {
    if (!user) {
      return (
        <Link href="/signin" className="relative z-50">
          <button
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="border-none p-2 rounded-full transition-colors hover:cursor-pointer relative"
            aria-label={label}
          >
            <Image
              src={iconPath}
              alt={label}
              width={30}
              height={30}
              className={`w-7 h-7 ${TextInvert ? 'invert' : ''} ${className}`}
            />
            {isHovered && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap z-50">
                {label}
              </div>
            )}
          </button>
        </Link>
      );
    }

    return (
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => onToggleDropdown?.()}
          className="border-none p-2 rounded-full transition-colors hover:cursor-pointer relative"
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

        {showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
          >
            <Link
              href="/mypage/orders"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => {
                onToggleDropdown?.();
              }}
            >
              마이페이지
            </Link>
            <button
              onClick={() => {
                handleLogout();
                onToggleDropdown?.();
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              로그아웃
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Link href={href || '#'} className="relative z-50">
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="border-none p-2 rounded-full transition-colors hover:cursor-pointer relative"
        aria-label={label}
      >
        <Image
          src={iconPath}
          alt={label}
          width={30}
          height={30}
          className={`w-7 h-7 ${TextInvert ? 'invert' : ''} ${className}`}
        />
        {isHovered && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap z-50">
            {label}
          </div>
        )}
      </button>
    </Link>
  );
};

const IconList = ({ TextInvert }: { TextInvert?: boolean }) => {
  const [showMyPageDropdown, setShowMyPageDropdown] = useState(false);

  return (
    <div className="flex items-center gap-3 sm:gap-2">
      <IconButton
        iconPath="/svg/shopping-cart.svg"
        label="장바구니"
        href="/cart"
        TextInvert={TextInvert}
      />
      <IconButton
        iconPath="/svg/headphones.svg"
        label="고객지원"
        href="/customer"
        TextInvert={TextInvert}
      />
      <IconButton
        iconPath="/svg/user.svg"
        label="마이페이지"
        TextInvert={TextInvert}
        showDropdown={showMyPageDropdown}
        onToggleDropdown={() => setShowMyPageDropdown(!showMyPageDropdown)}
      />
    </div>
  );
};

const Nav = ({ className = 'sm:px-[1.5rem]', isbg, TextInvert }: NavProps) => {
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
              src="/svg/main-logo.svg"
              alt="로고"
              width={150}
              height={150}
              className={`lg:w-[12.375rem] lg:h-10 md:w-[5rem] md:h-8 ${
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
