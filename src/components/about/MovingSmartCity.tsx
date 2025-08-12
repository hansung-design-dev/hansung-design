import Image from 'next/image';

export default function MovingSmartCity() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center mb-8">
          <Image
            src="/images/company-intro/logo/logo-icon.svg"
            alt="한성디자인 로고"
            width={60}
            height={60}
            className="w-15 h-15"
          />
        </div>
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Moving Smart City
          </h2>
          <p className="text-xl text-gray-600">
            30년간 도시를 바꾸고, 브랜드를 연결해온 디자인 파트너
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="">
            <p className="text-lg text-gray-700 leading-relaxed text-center">
              공간이 메시지가 되는 순간, 그 중심엔 한성이 있습니다.
              <br />
              전자게시대부터 공공디자인, AI기반 광고솔루션까지 도시의
              커뮤니케이션을 디자인합니다.
              <br />
              30년간 100개 이상의 공공 프로젝트와 2000여 매체를 운영하며
              <br />
              도시의 커뮤니케이션을 디자인해왔습니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
