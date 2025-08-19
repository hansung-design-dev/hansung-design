import Image from 'next/image';
import SectionTitle from './SectionTitle';

export default function Strengths() {
  return (
    <section id="strengths" className="py-10 md:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 제목 */}
        <SectionTitle title="업무강점" />

        {/* 원형 카드들 */}
        <div className="flex justify-center items-center space-x-[-1rem] sm:space-x-[-1.5rem] md:space-x-[-2rem] lg:space-x-[-2.5rem] ">
          {/* 원1: 설계 */}
          <div className="relative z-40">
            <div className="w-[12rem] h-[12rem] sm:w-[14rem] sm:h-[14rem] md:w-[18rem] md:h-[18rem] lg:w-[22rem] lg:h-[22rem] xl:w-[24rem] xl:h-[24rem] rounded-full bg-[rgba(0,0,0,0.90)] flex flex-col items-center justify-between p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8 text-center">
              <div className="flex-1 flex flex-col justify-center items-center">
                <Image
                  src="/images/company-intro/icons/contsruction.png"
                  alt="설계 아이콘"
                  width={60}
                  height={60}
                  className="sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-14 lg:h-14 invert"
                />
                <h3 className="text-[1.2rem] sm:text-[1.4rem] md:text-[1.6rem] lg:text-[1.8rem] xl:text-[2.2rem] text-white font-bold mb-2 sm:mb-3 md:mb-4 lg:mb-5 xl:mb-6">
                  설계
                </h3>
              </div>
              <div className="flex-1 flex items-center">
                <p className="text-[0.9rem] sm:text-[1rem] md:text-[1.2rem] lg:text-[1.4rem]  text-white text-center leading-relaxed">
                  도시계획, 조경, 건축, 환경디자인 등 다양한 분야를
                  <br className="hidden sm:block" />
                  융합한 종합적인 디자인 솔루션 제공
                  <br className="hidden sm:block" />-{' '}
                  <br className="hidden sm:block" />
                  공공성 · 미관 · 기능
                </p>
              </div>
            </div>
          </div>

          {/* 원2: 프로젝트 */}
          <div className="relative z-30">
            <div className="w-[12rem] h-[12rem] sm:w-[14rem] sm:h-[14rem] md:w-[18rem] md:h-[18rem] lg:w-[22rem] lg:h-[22rem] xl:w-[24rem] xl:h-[24rem] rounded-full bg-[rgba(0,0,0,0.80)] flex flex-col items-center justify-between p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8 text-center">
              <div className="flex-1 flex flex-col justify-center items-center">
                <Image
                  src="/images/company-intro/icons/project.png"
                  alt="프로젝트 아이콘"
                  width={60}
                  height={60}
                  className="sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-14 lg:h-14"
                />
                <h3 className="text-[1.2rem] sm:text-[1.4rem] md:text-[1.6rem] lg:text-[1.8rem] xl:text-[2.2rem] text-white font-bold mb-2 sm:mb-3 md:mb-4 lg:mb-5 xl:mb-6">
                  프로젝트
                </h3>
              </div>
              <div className="flex-1 flex items-center">
                <p className="text-[0.9rem] sm:text-[1rem] md:text-[1.2rem] lg:text-[1.4rem]  text-white text-center leading-relaxed">
                  다양한 규모의 프로젝트
                  <br className="hidden sm:block" />
                  (공공기관·상업지구 외)
                  <br className="hidden sm:block" />
                  다양한 수행경험
                  <br className="hidden sm:block" />-
                  <br className="hidden sm:block" />
                  검증된 신뢰 · 실행력
                </p>
              </div>
            </div>
          </div>

          {/* 원3: 디자인 */}
          <div className="relative z-20">
            <div className="w-[12rem] h-[12rem] sm:w-[14rem] sm:h-[14rem] md:w-[18rem] md:h-[18rem] lg:w-[22rem] lg:h-[22rem] xl:w-[24rem] xl:h-[24rem] rounded-full bg-[rgba(0,0,0,0.70)] flex flex-col items-center justify-between p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8 text-center">
              <div className="flex-1 flex flex-col justify-center items-center">
                <Image
                  src="/images/company-intro/icons/design.png"
                  alt="디자인 아이콘"
                  width={60}
                  height={60}
                  className="sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-14 lg:h-14"
                />
                <h3 className="text-[1.2rem] sm:text-[1.4rem] md:text-[1.6rem] lg:text-[1.8rem] xl:text-[2.2rem] text-white font-bold mb-2 sm:mb-3 md:mb-4 lg:mb-5 xl:mb-6">
                  디자인
                </h3>
              </div>
              <div className="flex-1 flex items-center">
                <p className="text-[0.9rem] sm:text-[1rem] md:text-[1.2rem] lg:text-[1.4rem] text-white text-center leading-relaxed">
                  지역 문화를 고려한
                  <br className="hidden sm:block" />
                  차별화된 디자인
                  <br className="hidden sm:block" />
                  혁신적 도시공간 창출
                  <br className="hidden sm:block" />
                  -<br className="hidden sm:block" /> 최신 디자인 트렌드
                  <br className="hidden sm:block" />
                  창의적인 아이디어
                </p>
              </div>
            </div>
          </div>

          {/* 원4: ESG */}
          <div className="relative z-10">
            <div className="w-[12rem] h-[12rem] sm:w-[14rem] sm:h-[14rem] md:w-[18rem] md:h-[18rem] lg:w-[22rem] lg:h-[22rem] xl:w-[24rem] xl:h-[24rem] rounded-full bg-[rgba(0,0,0,0.60)] flex flex-col items-center justify-between p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8 text-center">
              <div className="flex-1 flex flex-col justify-center items-center">
                <Image
                  src="/images/company-intro/icons/ESG.png"
                  alt="ESG 아이콘"
                  width={60}
                  height={60}
                  className="sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-14 lg:h-14"
                />
                <h3 className="text-[1.2rem] sm:text-[1.4rem] md:text-[1.6rem] lg:text-[1.8rem] xl:text-[2.2rem] text-white font-bold mb-2 sm:mb-3 md:mb-4 lg:mb-5 xl:mb-6">
                  ESG
                </h3>
              </div>
              <div className="flex-1 flex items-center">
                <p className="text-[0.9rem] sm:text-[1rem] md:text-[1.2rem] lg:text-[1.4rem]  text-white text-center leading-relaxed">
                  ESG경영으로
                  <br className="hidden sm:block" />
                  지속가능한 도시경관조성
                  <br className="hidden sm:block" />
                  및 운영
                  <br className="hidden sm:block" />-{' '}
                  <br className="hidden sm:block" />
                  지속성 · 친환경
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
