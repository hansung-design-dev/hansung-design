import Image from 'next/image';

// 특허 데이터
const patentData = [
  {
    src: '/images/company-intro/특허/1_디자인등록증.jpg',
    alt: '디자인등록증',
  },
  {
    src: '/images/company-intro/특허/2_특허증1.jpg',
    alt: '특허증1',
  },
  {
    src: '/images/company-intro/특허/3_특허증2.jpg',
    alt: '특허증2',
  },
  {
    src: '/images/company-intro/특허/4_특허증3.jpg',
    alt: '특허증3',
  },
];

// 기업인증 및 허가서 데이터
const certificationData = [
  {
    src: '/images/company-intro/기업인증_및_허가서/1_사업자등록증.jpg',
    alt: '사업자등록증',
  },
  {
    src: '/images/company-intro/기업인증_및_허가서/2_옥외광고사업-등록증.jpg',
    alt: '옥외광고사업등록증',
  },
  {
    src: '/images/company-intro/기업인증_및_허가서/3_공공디자인전문회사-신고증.jpg',
    alt: '공공디자인전문회사신고증',
  },
  {
    src: '/images/company-intro/기업인증_및_허가서/4_산업디자인전문회사-신고확인증.jpg',
    alt: '산업디자인전문회사신고확인증',
  },
  {
    src: '/images/company-intro/기업인증_및_허가서/5_직생1-디자인서비스.jpg',
    alt: '직생1-디자인서비스',
  },
  {
    src: '/images/company-intro/기업인증_및_허가서/6_직생2_라벨.jpg',
    alt: '직생2_라벨',
  },
  {
    src: '/images/company-intro/기업인증_및_허가서/7_직생3_간판외.jpg',
    alt: '직생3_간판외',
  },
  {
    src: '/images/company-intro/기업인증_및_허가서/8_직생4_현수막외.jpg',
    alt: '직생4_현수막외',
  },
  {
    src: '/images/company-intro/기업인증_및_허가서/9_직생5_조형물.jpg',
    alt: '직생5_조형물',
  },
  {
    src: '/images/company-intro/기업인증_및_허가서/10_등록원부.jpg',
    alt: '등록원부',
  },
  {
    src: '/images/company-intro/기업인증_및_허가서/11_중소기업-확인서.jpg',
    alt: '중소기업확인서',
  },
  {
    src: '/images/company-intro/기업인증_및_허가서/12_한성디자인-정보통신공사업등록증.jpg',
    alt: '정보통신공사업등록증',
  },
  {
    src: '/images/company-intro/기업인증_및_허가서/13_공장등록증명서.jpg',
    alt: '공장등록증명서',
  },
  {
    src: '/images/company-intro/기업인증_및_허가서/14_소프트웨어사업자-일반-현황-관리확인서.jpg',
    alt: '소프트웨어사업자확인서',
  },
  {
    src: '/images/company-intro/기업인증_및_허가서/15_위험성평가-인정서.jpg',
    alt: '위험성평가인정서',
  },
  {
    src: '/images/company-intro/기업인증_및_허가서/16_장애인기업-확인서.jpg',
    alt: '장애인기업확인서',
  },
];

export default function Patents() {
  return (
    <section id="patents" className="py-20 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* 섹션 제목 */}
        <div className="flex justify-center mb-8">
          <div className="text-[#7D7D7D] text-[1.5rem] font-500 w-[15.125rem] rounded-full border-solid border-[0.1rem] border-[#D9D9D9] text-center py-2">
            특허·기업인증·허가증
          </div>
        </div>

        {/* 부제목 */}
        <div className="text-center mb-12">
          <h3 className="text-[3.125rem]  text-black">업계 내 최고의 전문성</h3>
        </div>

        {/* 이미지 스크롤 영역 */}
        <div className="w-full">
          <div className="flex pb-4 gap-4 overflow-x-auto px-4">
            {/* 기업인증 및 허가서 이미지들 */}
            {certificationData.map((item, index) => (
              <Image
                key={index}
                src={item.src}
                alt={item.alt}
                width={262}
                height={368}
                className="w-[15rem] h-[20rem] object-cover rounded-lg"
              />
            ))}

            {/* 특허 이미지들 */}
            {patentData.map((item, index) => (
              <Image
                key={index}
                src={item.src}
                alt={item.alt}
                width={262}
                height={368}
                className="w-[15rem] h-[20rem] object-cover rounded-lg"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
