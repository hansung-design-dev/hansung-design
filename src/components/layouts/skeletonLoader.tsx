import React from 'react';

interface SkeletonItemProps {
  showCheckbox?: boolean;
}

const SkeletonItem: React.FC<SkeletonItemProps> = ({ showCheckbox }) => (
  <div className="flex items-center p-4 border-b border-gray-100 animate-pulse">
    {showCheckbox && <div className="w-4 h-4 bg-gray-200 rounded mr-4"></div>}
    <div className="flex-1">
      <div className="h-4 bg-gray-200 rounded mb-2 w-3/4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
      </div>
      <div className="h-3 bg-gray-200 rounded mb-1 w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
      </div>
    </div>
    <div className="flex items-center space-x-4">
      <div className="h-3 bg-gray-200 rounded w-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
      </div>
    </div>
  </div>
);

interface SkeletonLoaderProps {
  itemCount?: number;
  showHeader?: boolean;
  showCheckbox?: boolean;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  itemCount = 10,
  showHeader = false,
  showCheckbox = false,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      {showHeader && (
        <div className="flex items-center p-4 border-b border-gray-200 bg-gray-50">
          {showCheckbox && (
            <div className="w-4 h-4 bg-gray-200 rounded mr-4"></div>
          )}
          <div className="flex-1 grid grid-cols-4 gap-4">
            <div className="h-4 bg-gray-200 rounded w-20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-24 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-16 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
            </div>
          </div>
        </div>
      )}
      <div>
        {Array.from({ length: itemCount }).map((_, index) => (
          <SkeletonItem key={index} showCheckbox={showCheckbox} />
        ))}
      </div>
    </div>
  );
};

export default SkeletonLoader;
