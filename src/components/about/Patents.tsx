import Image from 'next/image';
import SectionTitle from './SectionTitle';

// 통합된 인증, 허가서, 특허 데이터 (번호 순서대로)
const allDocumentsData = [
  {
    src: '/images/company-intro/인증,허가서,특허/1_사업자등록증.jpg',
    alt: '사업자등록증',
  },
  {
    src: '/images/company-intro/인증,허가서,특허/2_옥외광고사업-등록증.jpg',
    alt: '옥외광고사업등록증',
  },
  {
    src: '/images/company-intro/인증,허가서,특허/3_공공디자인전문회사-신고증.jpg',
    alt: '공공디자인전문회사신고증',
  },
  {
    src: '/images/company-intro/인증,허가서,특허/4_산업디자인전문회사-신고확인증.jpg',
    alt: '산업디자인전문회사신고확인증',
  },
  {
    src: '/images/company-intro/인증,허가서,특허/5_디자인등록증.jpg',
    alt: '디자인등록증',
  },
  {
    src: '/images/company-intro/인증,허가서,특허/6_특허증1(발광다이오드).jpg',
    alt: '특허증1(발광다이오드)',
  },
  {
    src: '/images/company-intro/인증,허가서,특허/7_특허증2(블라인드 전광판).jpg',
    alt: '특허증2(블라인드 전광판)',
  },
  {
    src: '/images/company-intro/인증,허가서,특허/8_특허증3(에너지절감형LED).jpg',
    alt: '특허증3(에너지절감형LED)',
  },
  {
    src: '/images/company-intro/인증,허가서,특허/9_직생1-디자인서비스.jpg',
    alt: '직생1-디자인서비스',
  },
  {
    src: '/images/company-intro/인증,허가서,특허/10_직생2_라벨.jpg',
    alt: '직생2_라벨',
  },
  {
    src: '/images/company-intro/인증,허가서,특허/11_직생3_간판외.jpg',
    alt: '직생3_간판외',
  },
  {
    src: '/images/company-intro/인증,허가서,특허/12_직생4_현수막외.jpg',
    alt: '직생4_현수막외',
  },
  {
    src: '/images/company-intro/인증,허가서,특허/13_직생5_조형물.jpg',
    alt: '직생5_조형물',
  },
  {
    src: '/images/company-intro/인증,허가서,특허/14_등록원부.jpg',
    alt: '등록원부',
  },
  {
    src: '/images/company-intro/인증,허가서,특허/15_중소기업-확인서.jpg',
    alt: '중소기업확인서',
  },
  {
    src: '/images/company-intro/인증,허가서,특허/16_정보통신공사업등록증.jpg',
    alt: '정보통신공사업등록증',
  },
  {
    src: '/images/company-intro/인증,허가서,특허/17_공장등록증명서.jpg',
    alt: '공장등록증명서',
  },
  {
    src: '/images/company-intro/인증,허가서,특허/18_소프트웨어사업자-일반-현황-관리확인서.jpg',
    alt: '소프트웨어사업자확인서',
  },
  {
    src: '/images/company-intro/인증,허가서,특허/19_위험성평가-인정서.jpg',
    alt: '위험성평가인정서',
  },
  {
    src: '/images/company-intro/인증,허가서,특허/20_장애인기업-확인서.jpg',
    alt: '장애인기업확인서',
  },
];

export default function Patents() {
  return (
    <section id="patents" className="py-20 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* 섹션 제목 */}
        <SectionTitle title="특허·인증·허가" />

        {/* 이미지 스크롤 영역 */}
        <div className="w-full">
          <div className="flex pb-4 gap-4 overflow-x-auto px-4">
            {/* 통합된 인증, 허가서, 특허 이미지들 */}
            {allDocumentsData.map((item, index) => (
              <Image
                key={index}
                src={item.src}
                alt={item.alt}
                width={262}
                height={368}
                className="w-[20rem] h-[25rem] object-cover rounded-lg"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
