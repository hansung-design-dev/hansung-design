import Image from 'next/image';

export default function Statistics() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 grid-rows-2 gap-0">
          {/* 첫 번째 행 */}
          <div className="text-center flex flex-col  bg-white ">
            <div className="flex-1 flex items-center justify-center">
              <Image
                src="/images/company-intro/competence/1.png"
                alt="공공 프로젝트"
                width={200}
                height={200}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="text-start pl-10 pt-[15rem] flex flex-col bg-white ">
            <div className="text-black font-bold text-[4.625rem]">
              10,000명<span className="text-[#5C91FF] text-[6rem]">+</span>
            </div>
            <p className=" text-[2rem]">클라이언트 보유</p>
          </div>

          <div className="text-center flex flex-col bg-white">
            <div className="flex-1 flex items-center justify-center">
              <Image
                src="/images/company-intro/competence/3.png"
                alt="보유매체"
                width={200}
                height={200}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* 두 번째 행 */}
          <div className="text-start pl-10 flex flex-col bg-white">
            <div className="text-black font-bold text-[4.625rem]">
              100<span className="text-[#5C91FF] text-[6rem]">+</span>
            </div>
            <p className=" text-[2rem]">공공 프로젝트 진행</p>
          </div>

          <div className="text-center aspect-square flex flex-col justify-between bg-white">
            <div className="flex-1 flex items-center justify-center">
              <Image
                src="/images/company-intro/competence/2.png"
                alt="빌보드"
                width={200}
                height={200}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="text-start pl-10 flex flex-col bg-white">
            <div className="text-black font-bold text-[4.625rem] mb-2">
              2000개<span className="text-[#5C91FF] text-[6rem]">+</span>
            </div>
            <p className=" text-[2rem]">보유매체</p>
          </div>
        </div>
      </div>
    </section>
  );
}
