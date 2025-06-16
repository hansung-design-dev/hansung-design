// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import Nav from '../components/layouts/nav';
import Footer from '../components/layouts/footer';
import ScrollToTopButton from '../components/scrollToTopButton';

// export const API = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_KEY}&autoload=false`;

export const metadata: Metadata = {
  title: '한성기업',
  description: '한성기업 공식 웹사이트',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" jd-enabled="true">
      <body className="relative">
        <Nav />
        {children}
        <ScrollToTopButton />
        <Footer />
      </body>
    </html>
  );
}
