import Image from 'next/image';
import SectionTitle from './SectionTitle';

export default function Strengths() {
  return (
    <section id="strengths" className="py-10 md:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 제목 */}
        <SectionTitle title="업무강점" />

        {/* 원형 카드들 */}
        <div className="flex justify-center items-center ">
          <Image
            src="/images/about/strength.png"
            alt="업무강점"
            width={2000}
            height={2000}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
