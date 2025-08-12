import Image from 'next/image';

export default function Strengths() {
  return (
    <section id="strengths" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 제목 */}
        <div className="flex justify-center mb-16">
          <div className="text-[#7D7D7D] text-[1.5rem] font-500 w-[11.125rem] rounded-full border-solid border-[0.1rem] border-[#D9D9D9] text-center py-2">
            업무강점
          </div>
        </div>

        {/* 원형 카드들 */}
        <div className="flex justify-center items-center space-x-[-3.5rem]">
          {/* 원1: 설계 */}
          <div className="relative z-40">
            <div className="w-[24rem] h-[24rem] rounded-full bg-[rgba(0,0,0,0.90)] flex flex-col items-center justify-center p-6 text-center">
              <Image
                src="/images/company-intro/icons/construction.png"
                alt="설계 아이콘"
                width={60}
                height={60}
                className="w-15 h-15 mb-4"
              />
              <h3 className="text-[2rem] text-white font-bold mb-4">설계</h3>
              <p className="text-[1.5rem] text-white text-center leading-relaxed">
                도시계획, 조경, 건축, 환경디자인 등 다양한 분야를
                <br />
                융합한 종합적인 디자인 솔루션 제공
                <br />- <br />
                공공성 · 미관 · 기능
              </p>
            </div>
          </div>

          {/* 원2: 프로젝트 */}
          <div className="relative z-30">
            <div className="w-[24rem] h-[24rem] rounded-full bg-[rgba(0,0,0,0.80)] flex flex-col items-center justify-center p-6 text-center">
              <Image
                src="/images/company-intro/icons/project.png"
                alt="프로젝트 아이콘"
                width={60}
                height={60}
                className="w-15 h-15 mb-4"
              />
              <h3 className="text-[2rem] text-white font-bold mb-2">
                프로젝트
              </h3>
              <p className="text-[1.5rem] text-white text-center leading-relaxed">
                다양한 규모의 프로젝트
                <br />
                (공공기관·상업지구 외)
                <br />
                다양한 수행경험
                <br />-<br />
                검증된 신뢰 · 실행력
              </p>
            </div>
          </div>

          {/* 원3: 디자인 */}
          <div className="relative z-20">
            <div className="w-[24rem] h-[24rem] rounded-full bg-[rgba(0,0,0,0.70)] flex flex-col items-center justify-center p-6 text-center">
              <Image
                src="/images/company-intro/icons/design.png"
                alt="디자인 아이콘"
                width={60}
                height={60}
                className="w-15 h-15 mb-4"
              />
              <h3 className="text-[2rem] text-white font-bold mb-4">디자인</h3>
              <p className="text-[1.5rem] text-white text-center leading-relaxed">
                지역 문화를 고려한
                <br />
                차별화된 디자인
                <br />
                혁신적 도시공간 창출
                <br />
                -<br /> 최신 디자인 트렌드
                <br />
                창의적인 아이디어
              </p>
            </div>
          </div>

          {/* 원4: ESG */}
          <div className="relative z-10">
            <div className="w-[24rem] h-[24rem] rounded-full bg-[rgba(0,0,0,0.60)] flex flex-col items-center justify-center p-6 text-center">
              <Image
                src="/images/company-intro/icons/ESG.png"
                alt="ESG 아이콘"
                width={60}
                height={60}
                className="w-15 h-15 mb-4"
              />
              <h3 className="text-[2rem] text-white font-bold mb-4">ESG</h3>
              <p className="text-[1.5rem] text-white text-center leading-relaxed">
                ESG경영으로
                <br />
                지속가능한 도시경관조성
                <br />
                및 운영
                <br />- <br />
                지속성 · 친환경
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
