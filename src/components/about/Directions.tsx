import Image from 'next/image';

export default function Directions() {
  return (
    <section id="directions" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 제목 */}
        <div className="flex justify-center mb-16">
          <div className="text-[#7D7D7D] text-[1.5rem] font-500 w-[11.125rem] rounded-full border-solid border-[0.1rem] border-[#D9D9D9] text-center py-2">
            찾아오시는 길
          </div>
        </div>

        {/* 지도 */}
        <div className="mb-12">
          <Image
            src="/images/company-intro/location/location.png"
            alt="한성디자인 위치 지도"
            width={1200}
            height={600}
            className="w-full h-auto "
          />
        </div>

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
