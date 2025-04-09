'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

// 메뉴 아이템 타입 정의
interface MenuItem {
  name: string;
  href: string;
}

interface IconButtonProps {
  onClick?: () => void;
  iconPath: string;
  label: string;
  href: string;
  TextInvert?: boolean;
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
}: IconButtonProps) => (
  <Link href={href}>
    <button
      onClick={onClick}
      className={`border-none p-2 hover:bg-gray-100 rounded-full transition-colors hover:cursor-pointer`}
      aria-label={label}
    >
      <Image
        src={iconPath}
        alt={label}
        width={30}
        height={30}
        className={`w-7 h-7 ${TextInvert && 'invert'}`}
      />
    </button>
  </Link>
);

const IconList = ({ TextInvert }: { TextInvert?: boolean }) => (
  <div className="flex items-center gap-3">
    <IconButton
      iconPath="/svg/shopping-cart.svg"
      label="장바구니"
      href="/card"
      TextInvert={TextInvert}
    />
    <IconButton
      iconPath="/svg/user.svg"
      label="마이페이지"
      href="/mypage"
      TextInvert={TextInvert}
    />
    <IconButton
      iconPath="/svg/headphones.svg"
      label="고객센터"
      href="/support"
      TextInvert={TextInvert}
    />
  </div>
);

const Nav = ({
  className,
  isbg,
  TextInvert,
  variant = 'default',
}: NavProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      // Adjust this value based on when you want the color to change
      setIsScrolled(scrollPosition > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getMenuItemStyles = (isSelected: boolean) => {
    if (isSelected) {
      return 'bg-black text-white rounded-full px-[0.8125rem] py-[0.6875rem]';
    }

    // If scrolled, use black text
    if (isScrolled) {
      return 'text-black';
    }

    // Original styling based on variant when not scrolled
    switch (variant) {
      case 'photo':
        return 'text-white';
      case 'mixed':
        return 'text-white';
      default:
        return 'text-black';
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 border-b border-gray-200 ${className} ${
        isbg || isScrolled ? 'bg-white' : 'bg-none'
      }`}
    >
      <div className="container mx-auto">
        <div className="flex justify-between items-center h-[5.5rem]">
          <Link href="/" className="flex items-center">
            <Image
              src="/svg/logo.svg"
              alt="한성기업 로고"
              width={150}
              height={40}
              className={`w-[9.375rem] h-10 ${
                TextInvert && !isScrolled && 'invert'
              }`}
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-8 gap-[5rem] w-full">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-1 transition-colors duration-300 ${
                    pathname === item.href
                      ? `${getMenuItemStyles(true)} rounded-full`
                      : getMenuItemStyles(false)
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <IconList TextInvert={TextInvert && !isScrolled} />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <IconButton
              onClick={() => setIsOpen(!isOpen)}
              iconPath={isOpen ? '/svg/x-mark.svg' : '/svg/menu.svg'}
              label={isOpen ? 'Close Menu' : 'Open Menu'}
              href="#"
              TextInvert={TextInvert && !isScrolled}
            />
            <IconList TextInvert={TextInvert && !isScrolled} />
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="flex flex-col space-y-4 pb-4">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    pathname === item.href
                      ? `${getMenuItemStyles(true)} rounded-full`
                      : getMenuItemStyles(false)
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Nav;
