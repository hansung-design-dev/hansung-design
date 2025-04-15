import type { Metadata } from 'next';
import './globals.css';
// import Nav from '../components/Nav';
import Footer from '../components/Footer';

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
      <body>
        {/* <Nav /> */}
        {children}
        <Footer />
      </body>
    </html>
  );
}
