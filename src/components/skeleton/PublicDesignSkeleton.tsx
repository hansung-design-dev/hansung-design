export default function PublicDesignSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      {/* 프로젝트 카드 스켈레톤 */}
      {[1, 2, 3, 4, 5].map((index) => (
        <div
          key={index}
          className="w-full h-[400px] bg-gray-200 rounded-[1rem]"
        >
          <div className="relative w-full h-full">
            {/* 이미지 스켈레톤 */}
            <div className="w-full h-full bg-gray-300 rounded-[1rem] relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
            </div>
            {/* 텍스트 오버레이 스켈레톤 */}
            <div className="absolute bottom-8 left-8 space-y-3">
              <div className="h-6 bg-gray-400 rounded w-32 relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
              </div>
              <div className="h-5 bg-gray-400 rounded w-24 relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
              </div>
              <div className="h-4 bg-gray-400 rounded w-48 relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
