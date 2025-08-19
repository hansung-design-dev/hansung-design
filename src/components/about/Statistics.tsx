import Image from 'next/image';

export default function Statistics() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 grid-rows-2 gap-0 -space-x-px -space-y-px">
          {/* 첫 번째 행 */}
          <div className="text-center flex flex-col  bg-white ">
            <div className="flex-1 flex items-center justify-center">
              <Image
                src="/images/company-intro/competence/1.png"
                alt="공공 프로젝트"
                width={200}
                height={200}
                className="w-[80%] h-[80%] md:w-[90%] md:h-[90%] lg:w-full lg:h-full object-cover"
              />
            </div>
          </div>

          <div className="text-start pl-4 md:pl-6 lg:pl-10 sm:pt-[8rem] md:pt-[12rem] lg:pt-[13rem] flex flex-col bg-white ">
            <div className="text-black font-bold sm:text-[1.8rem] md:text-[3rem] lg:text-[4.625rem]">
              10,000명
              <span className="text-[#5C91FF] sm:text-[2.2rem] md:text-[4.5rem] lg:text-[6rem]">
                +
              </span>
            </div>
            <div className="sm:text-[0.9rem] md:text-[1.6rem] lg:text-[2rem]">
              클라이언트 보유
            </div>
          </div>

          <div className="text-center flex flex-col bg-white">
            <div className="flex-1 flex items-center justify-center">
              <Image
                src="/images/company-intro/competence/3.png"
                alt="보유매체"
                width={200}
                height={200}
                className="w-[80%] h-[80%] md:w-[90%] md:h-[90%] lg:w-full lg:h-full object-cover"
              />
            </div>
          </div>

          {/* 두 번째 행 */}
          <div className="text-start pl-4 md:pl-6 lg:pl-10 flex flex-col bg-white">
            <div className="text-black font-bold sm:text-[1.8rem] md:text-[3rem] lg:text-[4.625rem]">
              100
              <span className="text-[#5C91FF] sm:text-[2.2rem] md:text-[4.5rem] lg:text-[6rem]">
                +
              </span>
            </div>
            <div className="sm:text-[0.9rem] md:text-[1.6rem] lg:text-[2rem]">
              공공 프로젝트 진행
            </div>
          </div>

          <div className="text-center aspect-square flex flex-col justify-between bg-white">
            <div className="flex-1 flex items-center justify-center">
              <Image
                src="/images/company-intro/competence/2.png"
                alt="빌보드"
                width={200}
                height={200}
                className="w-[80%] h-[80%] md:w-[90%] md:h-[90%] lg:w-full lg:h-full object-cover"
              />
            </div>
          </div>

          <div className="text-start pl-4 md:pl-6 lg:pl-10 flex flex-col bg-white">
            <div className="text-black font-bold sm:text-[1.8rem] md:text-[3rem] lg:text-[4.625rem] mb-2">
              2000개
              <span className="text-[#5C91FF] sm:text-[2.2rem] md:text-[4.5rem] lg:text-[6rem]">
                +
              </span>
            </div>
            <div className="sm:text-[0.9rem] md:text-[1.6rem] lg:text-[2rem]">
              보유매체
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
