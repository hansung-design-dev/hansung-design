'use client';

import React from 'react';
import Image from 'next/image';
import { InstallationBanner } from '@/src/types/installation-photo';

export default function InstallationPhotosPage() {
  const [installationBanners, setInstallationBanners] = React.useState<
    InstallationBanner[]
  >([]);
  const [photoLoading, setPhotoLoading] = React.useState(false);
  const [expandedItemId, setExpandedItemId] = React.useState<string | null>(
    null
  );
  const [pagination, setPagination] = React.useState({
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    limit: 15,
    has_next: false,
    has_prev: false,
  });

  React.useEffect(() => {
    const fetchInstallationPhotos = async () => {
      setPhotoLoading(true);
      try {
        const response = await fetch(
          `/api/installation-photos?page=${pagination.current_page}&limit=15`
        );
        const data = await response.json();
        if (data.installation_banners) {
          setInstallationBanners(data.installation_banners);
        }
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } catch (error) {
        console.error('게첨사진 조회 오류:', error);
      } finally {
        setPhotoLoading(false);
      }
    };

    fetchInstallationPhotos();
  }, [pagination.current_page]);

  const handleItemClick = (itemId: string) => {
    setExpandedItemId(expandedItemId === itemId ? null : itemId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="py-12 flex items-start justify-center pt-[10rem] gap-[18rem]">
      <section className="font-gmarket text-2.5 font-700 mb-12">
        게첨사진
      </section>

      <main className="w-[40rem] ">
        <div>
          {photoLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-48 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : installationBanners.length > 0 ? (
            <div className="space-y-6">
              {installationBanners.map((banner) => (
                <div
                  key={banner.id}
                  className="border border-solid border-gray-200 rounded-lg overflow-hidden"
                >
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleItemClick(banner.id)}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">
                        {banner.title}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {banner.region_gu?.name}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {formatDate(banner.created_at)}
                    </div>
                  </div>
                  {expandedItemId === banner.id && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      <div className="bg-white rounded-lg p-4">
                        <div className="mb-4">
                          <div className="flex flex-col space-y-4 items-center">
                            {banner.photo_urls?.map(
                              (photoUrl: string, index: number) => (
                                <div key={index} className="relative">
                                  <Image
                                    src={photoUrl}
                                    alt={`${banner.title} - 사진 ${
                                      banner.photo_names?.[index] || index + 1
                                    }`}
                                    width={400}
                                    height={300}
                                    className="w-[30rem] h-auto rounded-lg shadow-sm"
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.src = '/images/no_image.png';
                                    }}
                                  />
                                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                    {banner.photo_names?.[index] || index + 1} /{' '}
                                    {banner.photo_urls?.length || 0}
                                  </div>
                                  <div className="mt-2 text-center text-sm text-gray-600 font-medium">
                                    {banner.photo_names?.[index] ||
                                      `${index + 1}`}
                                    번 게시대
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                        {banner.content && (
                          <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                            {banner.content}
                          </div>
                        )}
                        <div className="mt-4 text-sm text-gray-500">
                          등록일: {formatDate(banner.created_at)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              게첨사진이 없습니다.
            </div>
          )}
        </div>

        {installationBanners.length > 0 && (
          <div className="mt-8 flex justify-center items-center space-x-2">
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  current_page: prev.current_page - 1,
                }))
              }
              disabled={!pagination.has_prev}
              className={`px-4 py-2 rounded-lg border ${
                pagination.has_prev
                  ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  : 'border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              이전
            </button>

            <div className="flex items-center space-x-1">
              {Array.from(
                { length: Math.min(5, pagination.total_pages) },
                (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          current_page: pageNum,
                        }))
                      }
                      className={`px-3 py-2 rounded-lg border ${
                        pagination.current_page === pageNum
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
              )}
            </div>

            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  current_page: prev.current_page + 1,
                }))
              }
              disabled={!pagination.has_next}
              className={`px-4 py-2 rounded-lg border ${
                pagination.has_next
                  ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  : 'border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              다음
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
