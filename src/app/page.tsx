import Nav from '../components/layouts/nav';
import Section from '../components/section';
import FAQ from '../components/layouts/faq';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="w-full overflow-x-hidden">
      <Nav />
      <div className="pt-[2rem] sm:pt-[3rem]">
        <div className="relative pt-[3rem]">
          <Image
            src="/images/landing/main-part.png"
            alt="Screen section image"
            width={1000}
            height={1000}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-10 left-[5rem] text-white">
            <h1 className="text-3 font-700">Moving Smart City</h1>
            <h2 className="lg:text-1.5 sm:text-1.25 md:text-1.5 font-weight-500 ">
              한성디자인은 사람을 위한 편리하고 안전한 공간, <br /> 도시를
              혁신하는 기술, 환경을 고려한 지속 가능한 디자인을 제공합니다.
            </h2>
            <p className="text-1 font-weight-400 line-height-5">
              디지털 광고와 공공디자인이 결합된 혁신적인 솔루션을 통해 공간을
              효율적으로 활용하고,
              <br /> 브랜드 가치를 높이며, 도시를 더욱 스마트하게 변화시킵니다.
              <br />
              사람과 공간, 도시와 환경이 조화를 이루는 미래형 디자인,
              한성디자인이 만들어갑니다.
              <br /> 공간을 효울적으로, 도시를 스마트하게, 브랜드의 가치를
              높이다
            </p>
          </div>
        </div>
        <Section
          title={
            <div text="display" className="text-center sm:text-left">
              MOVE ON <br /> THE SCREEN
            </div>
          }
          subtitle="전자게시대"
          description="한 번의 광고, 수천 번의 노출"
          imageSrc="/images/landing/led-display-part.png"
          imageAlt="Screen section image"
          buttonText="더 알아보기"
          href="/led-display"
          list={[
            '-도심속 핵심위치의 중소기업, 소상공인을 위한  유일한 공식 광고매체',
            '-15초영상이미지 하루 180회 이상 노출로 비용 대비 월등한 광고효과',
            '-다양한 영상디자인으로 풍부한 가치 창출',
            '-전국 6개 지자체 25기 이상 운영',
          ]}
        />
      </div>
      <Section
        title={
          <div text="display" className="text-center sm:text-left">
            MOVE ON <br /> THE BANNER
          </div>
        }
        subtitle="현수막게시대"
        description="지역상권 활성화, 합리적인 광고"
        imageSrc="/images/landing/banner-part.png"
        imageAlt="Banner section image"
        reverse={true}
        buttonText="더 알아보기"
        href="/banner-display"
        list={[
          '-자영업, 소상공인을 위한 대표 지역광고 매체',
          '-최소 비용으로 지역민들에게 일정기간 상시 노출',
          '-다채로운 그래픽디자인으로 홍보효과 증대',
          '-전국 6개 지자체 169기 1200면 이상 운영',
        ]}
      />
      <Section
        title={
          <div text="display" className="text-center sm:text-left">
            MOVE ON <br /> THE CITY
          </div>
        }
        subtitle="공공디자인"
        description="도시의 일상에서 만나는 시간과 공간의 경험 디자인"
        imageSrc="/images/landing/public-part.png"
        imageAlt="City section image"
        buttonText="더 알아보기"
        href="/public-design"
        list={[
          '-사람을 위한 공간, 환경을 생각하는 디자인',
          '-공공의 유익을 위한 유니버설 디자인 실현',
          '-사람, 환경, 공간 그리고 디지털의 융합적 조화 구현',
          '-전국 30개 지자체 50개 이상 용역사업 수행',
        ]}
      />
      <Section
        title={
          <div text="display" className="text-center sm:text-left">
            MOVE ON <br /> THE FUTURE
          </div>
        }
        subtitle="디지털사이니지"
        description="광고를 혁신하다, 공간을 스마트하게"
        imageSrc="/images/landing/digital-part.png"
        imageAlt="Future section image"
        reverse={true}
        buttonText="더 알아보기"
        href="/digital-signage"
        list={[
          '-시공간의 한계를 넘는 혁신적 솔루션 구축',
          '-AI 기반의 데이타 분석과 결과도출 알고리즘 개발',
          '-디지털광고의 새로운 패러다임 제시',
          '-기업, 공공, 상업시설의  디지털 Ai광고시스템 제공',
        ]}
      />
      <div className="px-4 sm:px-6 md:px-8">
        <FAQ />
      </div>
    </main>
  );
}
