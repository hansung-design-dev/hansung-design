export default function DistrictCardSkeleton() {
  return (
    <div className="flex items-center justify-center lg:pb-4">
      <div className="w-[25rem] lg:h-[29.5625rem] md:h-[20rem] bg-gray-4 rounded-[1.25rem] flex flex-col overflow-hidden animate-pulse">
        <div className="flex-1 flex flex-col lg:gap-[3rem] md:gap-[2rem] p-8">
          <div className="flex flex-col gap-4">
            <div className="flex gap-[1rem]">
              {/* 아이콘 스켈레톤 */}
              <div className="w-[2.375rem] h-[2.375rem] bg-gray-300 rounded-md"></div>
              {/* 제목 스켈레톤 */}
              <div className="h-6 bg-gray-300 rounded w-24"></div>
            </div>
            {/* 설명 스켈레톤 */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          </div>
          {/* 정보 스켈레톤 */}
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>
        {/* 이미지 스켈레톤 */}
        <div className="relative w-full h-[12rem] bg-gray-300"></div>
      </div>
    </div>
  );
}
