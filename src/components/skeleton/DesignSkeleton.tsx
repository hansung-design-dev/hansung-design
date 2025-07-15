export default function DesignSkeleton() {
  return (
    <div className="w-full animate-pulse">
      {/* 테이블 헤더 스켈레톤 */}
      <div className="bg-gray-100 rounded-t-lg p-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="h-6 bg-gray-300 rounded w-16"></div>
          <div className="h-6 bg-gray-300 rounded w-24"></div>
          <div className="h-6 bg-gray-300 rounded w-20"></div>
        </div>
      </div>

      {/* 테이블 행 스켈레톤 */}
      {[...Array(3)].map((_, index) => (
        <div key={index} className="border-b border-gray-200 p-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="h-5 bg-gray-200 rounded w-12"></div>
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            <div className="h-5 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
