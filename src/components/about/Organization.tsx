import Image from 'next/image';
import SectionTitle from './SectionTitle';

export default function Organization() {
  return (
    <section id="organization" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 제목 */}
        <SectionTitle title="조직도" />

        {/* 조직도 이미지 */}
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            <Image
              src="/images/company-intro/organization-chart.png"
              alt="한성도시환경디자인 조직도"
              width={1000}
              height={800}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
