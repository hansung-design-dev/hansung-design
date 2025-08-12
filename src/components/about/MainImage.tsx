import Image from 'next/image';

export default function MainImage() {
  return (
    <section className="relative h-[60vh]">
      <Image
        src="/images/company-intro/main-image.png"
        alt="한성디자인 메인 이미지"
        fill
        className="object-cover object-center pt-24"
        priority
      />
      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            도시와 브랜드를 잇는 30년 파트너!
          </h1>
          <p className="text-xl md:text-2xl">
            30년간 도시를 바꾸고, 브랜드를 연결해온 디자인 파트너
          </p>
        </div>
      </div>
    </section>
  );
}
