import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="text-gray py-[10rem] bg-gray-1">
      <div className="container mx-auto px-4 flex flex-col gap-[4.5rem]">
        <div className="flex flex-col items-start gap-[2.5rem] text-1.125 font-weight-700 text-gray lg:flex-row">
          <button className="text-1.125 text-gray font-weight-700 border-none">
            CONTACT US
          </button>
          <button className="text-1.125 text-gray font-weight-700 border-none">
            FAQ
          </button>
          <button className="text-1.125 text-gray font-weight-700 border-none">
            개인정보 처리방침
          </button>
        </div>
        <div className="flex justify-between sm:flex-col sm:flex-col-reverse sm:gap-[3rem] ">
          <div className="lg:text-1.125 font-weight-500 flex flex-col gap-[1rem]">
            <div>
              상호 : (주)한성디자인기획 | 대표자 : 김수엽 | 사업자등록번호 :
              105-86-69782
            </div>
            <div>
              본사 : 서울특별시 마포구 노고산동 120-13 2층(노고산동 120-13) |
              대표전화 : 02) 711-3737 | FAX : 02) 711-3789
            </div>
            <div>
              Copyright 2018 (주)한성디자인기획. All Rights
              Reserved.banner114@hanmail.net
            </div>
          </div>
          <div className="flex gap-[0.94rem]">
            <Image
              src="/svg/mail.svg"
              alt="logo"
              className="lg:w-[1.5rem] lg:h-[1.5rem]"
              width={20}
              height={20}
            />
            <Image
              src="/svg/instagram.svg"
              alt="logo"
              className="lg:w-[1.5rem] lg:h-[1.5rem]"
              width={20}
              height={20}
            />
            <Image
              src="/svg/threads.svg"
              alt="logo"
              className="lg:w-[1.5rem] lg:h-[1.5rem]"
              width={20}
              height={20}
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
