import Nav from '../components/Nav';
import Section from '../components/Section';
import FAQ from '../components/FAQ';
//import Footer from '../components/Footer';

export default function Home() {
  return (
    <main className="w-full overflow-x-hidden">
      <Nav />
      <div className="pt-[2rem] sm:pt-[3rem]">
        <Section
          title={
            <div text="display" className="text-center sm:text-left">
              MOVE ON <br /> THE SCREEN
            </div>
          }
          subtitle="전자게시대"
          description="한 번의 광고, 수천 번의 노출"
          imageSrc="/images/landing-1.jpeg"
          imageAlt="Screen section image"
          buttonText="더 알아보기"
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
        imageSrc="/images/landing-2.jpeg"
        imageAlt="Banner section image"
        reverse={true}
        buttonText="더 알아보기"
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
        imageSrc="/images/landing-3.jpeg"
        imageAlt="City section image"
        buttonText="더 알아보기"
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
        imageSrc="/images/landing-4.jpeg"
        imageAlt="Future section image"
        reverse={true}
        buttonText="더 알아보기"
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
