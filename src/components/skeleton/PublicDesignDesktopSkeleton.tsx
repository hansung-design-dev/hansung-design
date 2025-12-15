interface PublicDesignDesktopSkeletonProps {
  variant?: 'list' | 'detail';
}

function ShimmerBlock({ className }: { className: string }) {
  return (
    <div className={`bg-gray-300 relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
    </div>
  );
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
            <ShimmerBlock className="col-span-2 lg:h-[32rem] sm:h-[23rem] rounded-[1rem]" />
            {/* 작은 카드 스켈레톤 */}
            <ShimmerBlock className="col-span-1 lg:h-[32rem] sm:h-[23rem] rounded-[1rem]" />
          </div>
        </div>

        {/* 상세 이미지들 스켈레톤 */}
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            className="relative w-full h-auto min-h-[200px] overflow-hidden"
          >
            <ShimmerBlock className="w-full h-[400px] rounded-2xl" />
          </div>
        ))}
      </div>
    );
  }

  // 기본 리스트 페이지 스켈레톤
  return (
    <div className="grid lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-1 gap-8 justify-items-center">
      {Array.from({ length: 9 }).map((_, idx) => (
        <div key={idx} className="w-full max-w-[23rem]">
          <ShimmerBlock className="w-full aspect-square rounded-2xl" />
          <div className="pt-4 space-y-2">
            <ShimmerBlock className="h-6 rounded w-2/3" />
            <ShimmerBlock className="h-4 rounded w-1/3 bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
