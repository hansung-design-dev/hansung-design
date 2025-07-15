interface PublicDesignDesktopSkeletonProps {
  variant?: 'list' | 'detail';
}

export default function PublicDesignDesktopSkeleton({
  variant = 'list',
}: PublicDesignDesktopSkeletonProps) {
  if (variant === 'detail') {
    return (
      <div className="space-y-12 container mx-auto px-4">
        {/* 상단 ProjectRow 스켈레톤 */}
        <div className="relative overflow-hidden">
          <div className="grid grid-cols-3 gap-6 lg:h-[32rem] sm:h-[23rem]">
            {/* 큰 카드 스켈레톤 */}
            <div className="col-span-2 lg:h-[32rem] sm:h-[23rem] bg-gray-300 rounded-[1rem] relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
            </div>
            {/* 작은 카드 스켈레톤 */}
            <div className="col-span-1 lg:h-[32rem] sm:h-[23rem] bg-gray-300 rounded-[1rem] relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
            </div>
          </div>
        </div>

        {/* 상세 이미지들 스켈레톤 */}
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            className="relative w-full h-auto min-h-[200px] overflow-hidden"
          >
            <div className="w-full h-[400px] bg-gray-300 rounded-2xl relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 기본 리스트 페이지 스켈레톤
  return (
    <div className="flex flex-col lg:gap-[12rem] md:gap-[12rem] sm:gap-[1rem]">
      {/* 첫 번째 행: 큰 카드 + 작은 카드 */}
      <div className="h-[400px]">
        <div className="grid grid-cols-3 gap-6 lg:h-[32rem] sm:h-[23rem]">
          {/* 큰 카드 스켈레톤 */}
          <div className="col-span-2 lg:h-[32rem] sm:h-[23rem] bg-gray-300 rounded-[1rem] relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
          </div>
          {/* 작은 카드 스켈레톤 */}
          <div className="col-span-1 lg:h-[32rem] sm:h-[23rem] bg-gray-300 rounded-[1rem] relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* 두 번째 행: 작은 카드 2개 + 큰 카드 */}
      <div className="h-[400px]">
        <div className="grid grid-cols-3 gap-6 lg:h-[32rem] sm:h-[23rem]">
          {/* 작은 카드들 스켈레톤 */}
          <div className="col-span-1 grid grid-rows-2 gap-6 lg:h-[32rem] sm:h-[23rem]">
            <div className="bg-gray-300 rounded-[1rem] relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
            </div>
            <div className="bg-gray-300 rounded-[1rem] relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
            </div>
          </div>
          {/* 큰 카드 스켈레톤 */}
          <div className="col-span-2 lg:h-[32rem] sm:h-[23rem] bg-gray-300 rounded-[1rem] relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* 세 번째 행: 큰 카드 + 작은 카드 */}
      <div className="h-[400px]">
        <div className="grid grid-cols-3 gap-6 lg:h-[32rem] sm:h-[23rem]">
          {/* 큰 카드 스켈레톤 */}
          <div className="col-span-2 lg:h-[32rem] sm:h-[23rem] bg-gray-300 rounded-[1rem] relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
          </div>
          {/* 작은 카드 스켈레톤 */}
          <div className="col-span-1 lg:h-[32rem] sm:h-[23rem] bg-gray-300 rounded-[1rem] relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* 네 번째 행: 작은 카드 2개 + 큰 카드 */}
      <div className="h-[400px]">
        <div className="grid grid-cols-3 gap-6 lg:h-[32rem] sm:h-[23rem]">
          {/* 작은 카드들 스켈레톤 */}
          <div className="col-span-1 grid grid-rows-2 gap-6 lg:h-[32rem] sm:h-[23rem]">
            <div className="bg-gray-300 rounded-[1rem] relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
            </div>
            <div className="bg-gray-300 rounded-[1rem] relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
            </div>
          </div>
          {/* 큰 카드 스켈레톤 */}
          <div className="col-span-2 lg:h-[32rem] sm:h-[23rem] bg-gray-300 rounded-[1rem] relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
