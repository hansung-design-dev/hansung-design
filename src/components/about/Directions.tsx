import Image from 'next/image';
import SectionTitle from './SectionTitle';

// 카카오맵 장소 ID (한성디자인)
const KAKAO_PLACE_ID = '15626403';

function KakaoMapSection() {
  const mapEmbedUrl = `https://map.kakao.com/?itemId=${KAKAO_PLACE_ID}`;

  return (
    <div className="mb-12">
      <a
        href={mapEmbedUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden group"
      >
        {/* 왼쪽 사이드바 숨기기 */}
        <iframe
          src={`https://map.kakao.com/?itemId=${KAKAO_PLACE_ID}&output=embeded`}
          className="absolute top-0 h-full border-0"
          style={{
            width: 'calc(100% + 400px)',
            left: '-400px',
          }}
          allowFullScreen
          loading="lazy"
          title="한성디자인 위치"
        />
        <div className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow-md text-sm text-gray-700 opacity-90 group-hover:opacity-100 transition-opacity z-10">
          클릭하여 카카오맵에서 보기
        </div>
      </a>
    </div>
  );
}

export default function Directions() {
  return (
    <section id="directions" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 제목 */}
        <SectionTitle title="찾아오시는 길" />

        {/* 카카오맵 */}
        <KakaoMapSection />

        {/* 연락처 정보 */}
        <div className="flex flex-col gap-4 pl-10 ">
          <div className="flex items-center space-x-3 text-[#848484]">
            <Image
              src="/images/company-intro/location/map.png"
              alt="위치 아이콘"
              width={24}
              height={24}
              className="w-6 h-6"
            />
            <span className="text-gray-700">
              (04094) 서울특별시 마포구 서강로14길 3
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[#848484]">
            <Image
              src="/images/company-intro/location/phone.png"
              alt="전화 아이콘"
              width={24}
              height={24}
              className="w-6 h-6"
            />
            <span className="text-gray-700">(대) 02-711-3737</span>
          </div>

          <div className="flex items-center space-x-3 text-[#848484]">
            <Image
              src="/images/company-intro/location/email.png"
              alt="이메일 아이콘"
              width={24}
              height={24}
              className="w-6 h-6"
            />
            <span className="text-gray-700">banner114@daum.net</span>
          </div>

          <div className="flex items-center space-x-3 text-[#848484]">
            <Image
              src="/images/company-intro/location/fax.png"
              alt="팩스 아이콘"
              width={24}
              height={24}
              className="w-6 h-6"
            />
            <span className="text-gray-700">(대) 02-711-3789</span>
          </div>
        </div>
      </div>
    </section>
  );
}
