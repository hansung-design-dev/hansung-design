'use client';
import { useRouter } from 'next/navigation';

const Footer = () => {
  const router = useRouter();

  return (
    <footer className="text-gray py-[10rem] bg-gray-1 md:px-[8rem] sm:px-[2rem]">
      <div className="container mx-auto px-4 flex flex-col gap-[4.5rem]">
        <div className="flex flex-col items-start gap-[2.5rem] text-1.125 font-weight-700 text-gray lg:flex-row">
          <button className="text-1.125 text-gray font-weight-700 border-none">
            CONTACT US
          </button>
          <button
            className="text-1.125 text-gray font-weight-700 border-none"
            onClick={() => router.push('/about')}
          >
            회사소개
          </button>
          <button className="text-1.125 text-gray font-weight-700 border-none">
            개인정보 처리방침
          </button>
        </div>
        <div className="flex justify-between  sm:flex-col-reverse sm:gap-[3rem] ">
          <div className="lg:text-1.125 font-weight-500 flex flex-col gap-[1rem]">
            <div>상호 : (주)한성디자인기획 | 대표자 : 김수엽 </div>
            <div>사업자등록번호 : 105-86-69782 | 통신판매번호 : 2005-03093</div>
            <div>
              본사 : 서울특별시 마포구 서강로14길 3 | 대표전화 : 02) 711-3737 |
              FAX : 02) 711-3789
            </div>
            <div>
              Copyright 2018 (주)한성디자인기획. All Rights
              Reserved.banner114@hanmail.net
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
