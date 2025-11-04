import Image from 'next/image';

export default function MainHero() {
  return (
    <section className="relative h-[60vh]">
      <Image
        src="/images/company-intro/main-image.png"
        alt="한성디자인 메인 이미지"
        fill
        sizes="100vw"
        className="object-cover object-center pt-24 "
        priority
      />
      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
        <div className="absolute text-center text-white bottom-10">
          <div className="lg:text-[3.1rem] md:text-[2rem] sm:text-[1.5rem] font-bold mb-4 font-gmarket">
            도시와 브랜드를 잇는 30년 파트너
          </div>
          <div className="lg:text-[2rem] md:text-[1.2rem] sm:text-[1rem]">
            30년간 도시를 바꾸고, 브랜드를 연결해온 디자인 파트너
          </div>
        </div>
      </div>
    </section>
  );
}
