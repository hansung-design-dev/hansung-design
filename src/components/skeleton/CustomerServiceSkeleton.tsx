export default function CustomerServiceSkeleton() {
  return (
    <div className="w-full animate-pulse">
      {/* 테이블 헤더 스켈레톤 */}
      <div className="bg-gray-100 rounded-t-lg p-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="h-6 bg-gray-300 rounded w-16"></div>
          <div className="h-6 bg-gray-300 rounded w-24"></div>
          <div className="h-6 bg-gray-300 rounded w-20"></div>
          <div className="h-6 bg-gray-300 rounded w-16"></div>
        </div>
      </div>

      {/* 테이블 행 스켈레톤 */}
      {[...Array(3)].map((_, index) => (
        <div key={index} className="border-b border-gray-200">
          <div className="p-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="h-5 bg-gray-200 rounded w-12"></div>
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              <div className="h-5 bg-gray-200 rounded w-20"></div>
              <div className="h-5 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
          {/* 아코디언 내용 스켈레톤 */}
          <div className="bg-gray-50 p-6">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
