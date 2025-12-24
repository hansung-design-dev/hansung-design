import type { Metadata } from 'next';
import './globals.css';
import Nav from '../components/layouts/nav';
import Footer from '../components/layouts/footer';
import ScrollToTopButton from '../components/scrollToTopButton';
import { CartProvider } from '../contexts/cartContext';
import { AuthProvider } from '../contexts/authContext';
import { ProfileProvider } from '../contexts/profileContext';
import LiveCartConditional from '../components/livecart/LiveCartConditional';
import EgressIpConsoleDebug from '../components/EgressIpConsoleDebug';

// export const API = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_KEY}&autoload=false`;

export const metadata: Metadata = {
  title: '한성디자인',
  description: 'Handung-design admin',
  icons: {
    icon: '/svg/hansung-logo-b.svg',
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" jd-enabled="false">
      <body className="relative">
        <AuthProvider>
          <ProfileProvider>
            <CartProvider>
              <Nav />
              {children}
              <EgressIpConsoleDebug />
              <LiveCartConditional />
              <ScrollToTopButton />
              <Footer />
            </CartProvider>
          </ProfileProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
