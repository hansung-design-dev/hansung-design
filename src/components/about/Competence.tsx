import Image from 'next/image';

export default function Competence() {
  return (
    <section className="py-10 md:py-16 lg:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 grid-rows-2 gap-2 md:gap-4 lg:gap-0">
          {/* 첫 번째 카드 - 이미지 */}
          <div className="aspect-square flex flex-col justify-between p-3 md:p-4 lg:p-6 bg-white rounded-lg shadow">
            <Image
              src="/images/competence/1.png"
              alt="클라이언트 보유"
              width={200}
              height={200}
              className="w-full h-auto"
            />
            <div className="text-center">
              <div className="text-[1rem] sm:text-[1.5rem] md:text-[2.5rem] lg:text-[4.625rem] font-700 text-black">
                10,000명
              </div>
              <div className="text-[#5C91FF] text-[2rem] md:text-[3.5rem] lg:text-[6rem] font-700">
                +
              </div>
              <div className="sm:text-[0.75rem] md:text-[1.25rem] lg:text-[2rem] text-black">
                클라이언트 보유
              </div>
            </div>
          </div>

          {/* 두 번째 카드 - 이미지 */}
          <div className="aspect-square flex flex-col justify-between p-3 md:p-4 lg:p-6 bg-white rounded-lg shadow">
            <Image
              src="/images/competence/2.png"
              alt="공공 프로젝트 진행"
              width={200}
              height={200}
              className="w-full h-auto"
            />
            <div className="text-center">
              <div className="text-[1.5rem] md:text-[2.5rem] lg:text-[4.625rem] font-700 text-black">
                100
              </div>
              <div className="text-[#5C91FF] text-[2rem] md:text-[3.5rem] lg:text-[6rem] font-700">
                +
              </div>
              <div className="text-[0.75rem] md:text-[1.25rem] lg:text-[2rem] text-black">
                공공 프로젝트 진행
              </div>
            </div>
          </div>

          {/* 세 번째 카드 - 이미지 */}
          <div className="aspect-square flex flex-col justify-between p-3 md:p-4 lg:p-6 bg-white rounded-lg shadow">
            <Image
              src="/images/competence/3.png"
              alt="보유매체"
              width={200}
              height={200}
              className="w-full h-auto"
            />
            <div className="text-center">
              <div className="text-[1.5rem] md:text-[2.5rem] lg:text-[4.625rem] font-700 text-black">
                2000개
              </div>
              <div className="text-[#5C91FF] text-[2rem] md:text-[3.5rem] lg:text-[6rem] font-700">
                +
              </div>
              <div className="text-[0.75rem] md:text-[1.25rem] lg:text-[2rem] text-black">
                보유매체
              </div>
            </div>
          </div>

          {/* 네 번째 카드 - 텍스트 */}
          <div className="aspect-square flex flex-col justify-center p-3 md:p-4 lg:p-6 bg-white rounded-lg shadow">
            <div className="text-center pl-2 md:pl-6 lg:pl-10 pt-[3rem] md:pt-[8rem] lg:pt-[15rem]">
              <div className="text-[1.5rem] md:text-[2.5rem] lg:text-[4.625rem] font-700 text-black">
                30년
              </div>
              <div className="text-[0.75rem] md:text-[1.25rem] lg:text-[2rem] text-black">
                전문성
              </div>
            </div>
          </div>

          {/* 다섯 번째 카드 - 빈 공간 */}
          <div className="aspect-square bg-white rounded-lg shadow"></div>

          {/* 여섯 번째 카드 - 텍스트 */}
          <div className="aspect-square flex flex-col justify-center p-3 md:p-4 lg:p-6 bg-white rounded-lg shadow">
            <div className="text-center pl-2 md:pl-6 lg:pl-10 pt-[3rem] md:pt-[8rem] lg:pt-[15rem]">
              <div className="text-[1.5rem] md:text-[2.5rem] lg:text-[4.625rem] font-700 text-black">
                100%
              </div>
              <div className="text-[0.75rem] md:text-[1.25rem] lg:text-[2rem] text-black">
                고객 만족도
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
