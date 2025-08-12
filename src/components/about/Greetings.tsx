import Image from 'next/image';

export default function Greetings() {
  return (
    <section id="greetings" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 제목 */}
        <div className="flex justify-center mb-12">
          <div className="text-[#7D7D7D] text-[1.5rem] font-500 w-[11.125rem] rounded-full border-solid border-[0.1rem] border-[#D9D9D9] text-center py-2">
            인사말
          </div>
        </div>

        {/* 로고 */}
        <div className="flex justify-center mb-20">
          <Image
            src="/images/company-intro/logo/logo.png"
            alt="한성도시환경디자인 로고"
            width={200}
            height={100}
            className="w-auto h-auto"
          />
        </div>

        {/* 제목 */}
        <div className="text-center">
          <h2 className="text-[2rem] text-black">
            안녕하십니까, 도시의 미래를 디자인하는 기업
          </h2>
        </div>

        {/* 부제목 */}
        <div className="text-center mb-20">
          <h3 className="text-[3.125rem] font-gmarket text-black">
            한성도시환경디자인
          </h3>
        </div>

        {/* 내용 박스 */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-[#F8F8F8] rounded-[1.25rem] p-14">
            <div className="text-black text-lg leading-relaxed text-center space-y-6">
              <p>
                도시경관디자인 분야에서 수많은 프로젝트를 성공적으로 수행하며,{' '}
                <br />
                업계 내에서 최고 수준의 전문성과 기술력을 인정받아온
                도시경관디자인 전문기업입니다.
              </p>
              <p>
                우리는 단순한 외형의 디자인을 넘어, 도시 공간이 지닌 맥락과
                사람들의 삶을 이해하고, <br />그 안에 조화로운 아름다움과 기능을
                더하는 것을 사명으로 삼고 있습니다.
              </p>
              <p>
                특히, 도시계획, 공공디자인, 조경 및 환경디자인에 이르기까지 전
                분야에 걸쳐 <br />
                다양한 접근과 체계적인 설계 프로세스를 적용하고 있으며,
                <br />
                지속가능하고 품격 있는 도시공간 창출을 위해 끊임없이 연구하고
                도전하고 있습니다.
              </p>
              <p>
                도시의 가치와 품격을 높이는 디자인 파트너로서,
                <br /> 고객과 사회로부터 신뢰받는 기업이 되겠습니다.
              </p>
              <p>
                앞으로도 사람 중심의 도시, 창의적인 공간 전략, <br />
                탁월한 실행력으로 도시의 커뮤니케이션을 디자인 하겠습니다.
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
