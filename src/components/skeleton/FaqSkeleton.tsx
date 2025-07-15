export default function FaqSkeleton() {
  return (
    <div className="w-full animate-pulse">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="border-b border-gray-200">
          {/* FAQ 질문 스켈레톤 */}
          <div className="p-4 cursor-pointer ">
            <div className="flex items-center justify-between bg-gray-50 py-4">
              <div className="flex items-center gap-3 flex-1 ">
                {/* 아이콘 스켈레톤 */}
                <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                {/* 질문 텍스트 스켈레톤 */}
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
