import Image from 'next/image';
import SectionTitle from './SectionTitle';

export default function Greetings() {
  return (
    <section id="greetings" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 제목 */}
        <SectionTitle title="인사말" />

        {/* 로고 */}
        <div className="flex justify-center mb-20">
          <Image
            src="/images/company-intro/logo/logo.png"
            alt="한성도시환경디자인 로고"
            width={60}
            height={60}
            className="sm:w-[3rem] sm:h-[5rem] md:w-[5rem] md:h-[7rem] lg:w-[5rem] lg:h-[7rem]"
          />
        </div>

        <div className="flex flex-col items-center justify-center gap-0">
          <div className="text-center">
            <h2 className="lg:text-[1.7rem] md:text-[1.5rem] sm:text-[1rem] text-black font-300 mb-2 lg:mb-0">
              안녕하십니까, 도시의 미래를 디자인하는 기업
            </h2>
          </div>

          {/* 부제목 */}
          <div className="text-center mb-15">
            <div className="lg:text-[2rem] md:text-[1.5rem] sm:text-[1rem]  text-black font-700">
              도시환경디자인 한성
              <span className="lg:text-[1.5rem] md:text-[1rem] sm:text-[0.8rem] text-black font-500">
                입니다.
              </span>
            </div>
          </div>
        </div>
        {/* 내용 박스 */}
        <div className="lg:max-w-4xl md:max-w-2xl sm:max-w-xl mx-auto mb-12">
          <div className="bg-[#F8F8F8] rounded-[1.25rem] p-14">
            <div className="text-black lg:text-lg md:text-base sm:text-sm leading-relaxed text-center space-y-6">
              <p>
                도시환경디자인 분야에서{' '}
                <br className="sm:inline lg:hidden md:hidden" />
                수많은 프로젝트를 성공적으로 수행하며, <br />
                업계 내에서 최고 수준의 전문성과 기술력을
                <br className="sm:inline lg:hidden md:hidden" /> 인정받아온
                도시환경디자인 전문기업입니다.
              </p>
              <p>
                우리는 단순한 외형의 디자인을 넘어,{' '}
                <br className="sm:inline lg:hidden md:hidden" />
                도시 공간이 지닌 맥락과 사람들의 삶을 이해하고, <br />그 안에
                조화로운 아름다움과 기능을 더하는 것을{' '}
                <br className="sm:inline lg:hidden md:hidden" />
                사명으로 삼고 있습니다.
              </p>
              <p>
                특히, 도시계획, 공공디자인, 조경 및 환경디자인에{' '}
                <br className="sm:inline lg:hidden md:hidden" />
                이르기까지 전 분야에 걸쳐 <br />
                다양한 접근과 체계적인 설계 프로세스를
                <br className="sm:inline lg:hidden md:hidden" /> 적용하고
                있으며,
                <br />
                지속가능하고 품격 있는 도시공간 창출을 위해
                <br className="sm:inline lg:hidden md:hidden" /> 끊임없이
                연구하고 도전하고 있습니다.
              </p>
              <p>
                도시의 가치와 품격을 높이는 디자인 파트너로서,
                <br /> 고객과 사회로부터 신뢰받는 기업이 되겠습니다.
              </p>
              <p>
                앞으로도 사람 중심의 도시, 창의적인 공간 전략, <br />
                탁월한 실행력으로 도시의 커뮤니케이션을
                <br className="sm:inline lg:hidden md:hidden" /> 디자인
                하겠습니다.
              </p>
            </div>
            {/* 서명 */}
            <div className="text-center pt-4">
              <p className="text-[1.2rem] font-700 text-black">임직원 일동</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
