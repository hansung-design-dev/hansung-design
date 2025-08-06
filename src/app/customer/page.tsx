'use client';
import React from 'react';
import Image from 'next/image';
import FaqSkeleton from '../../components/skeleton/FaqSkeleton';
import NoticeSkeleton from '../../components/skeleton/NoticeSkeleton';
import { InstallationBanner } from '../../types/installation-photo';

const faqCategories = [
  '디지털미디어',
  '공공디자인',
  'LED전자게시대',
  '현수막게시대',
];

// 공지사항 데이터 타입 정의
interface NoticeItem {
  id: string;
  title: string;
  content: string;
  priority: 'normal' | 'high' | 'urgent' | 'important';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// FAQ 데이터 타입 정의
interface FaqItem {
  id: string;
  title: string;
  content: string;
  status: string;
  answer: string;
  answered_at: string;
  created_at: string;
  homepage_menu_types: {
    name: string;
  };
}

export default function CustomerPage() {
  const [activeTab, setActiveTab] = React.useState<
    '게첨사진' | '공지사항' | '자주 묻는 질문'
  >('게첨사진');
  const [activeFaq, setActiveFaq] = React.useState(faqCategories[0]);
  const [expandedItemId, setExpandedItemId] = React.useState<string | null>(
    null
  );
  const [notices, setNotices] = React.useState<NoticeItem[]>([]);
  const [faqs, setFaqs] = React.useState<FaqItem[]>([]);
  const [installationBanners, setInstallationBanners] = React.useState<
    InstallationBanner[]
  >([]);
  const [pagination, setPagination] = React.useState({
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    limit: 15,
    has_next: false,
    has_prev: false,
  });
  const [loading, setLoading] = React.useState(true);
  const [faqLoading, setFaqLoading] = React.useState(false);
  const [photoLoading, setPhotoLoading] = React.useState(false);

  // 공지사항 데이터 가져오기
  React.useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await fetch('/api/notices');
        const data = await response.json();
        console.log('공지사항 데이터:', data); // 디버깅용
        if (data.notices) {
          setNotices(data.notices);
        }
      } catch (error) {
        console.error('공지사항 조회 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  // 게첨사진 데이터 가져오기
  React.useEffect(() => {
    const fetchInstallationPhotos = async () => {
      if (activeTab !== '게첨사진') return;

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
  }, [activeTab, pagination.current_page]);

  // FAQ 데이터 가져오기
  React.useEffect(() => {
    const fetchFaqs = async () => {
      if (activeTab !== '자주 묻는 질문') return;

      setFaqLoading(true);
      try {
        const response = await fetch(
          `/api/customer-service/faq?category=${encodeURIComponent(activeFaq)}`
        );
        const data = await response.json();
        if (data.faqs) {
          setFaqs(data.faqs);
        }
      } catch (error) {
        console.error('FAQ 조회 오류:', error);
      } finally {
        setFaqLoading(false);
      }
    };

    fetchFaqs();
  }, [activeTab, activeFaq]);

  const handleItemClick = (itemId: string) => {
    setExpandedItemId(expandedItemId === itemId ? null : itemId);
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // 우선순위에 따른 번호 표시
  const getNoticeNumber = (notice: NoticeItem) => {
    if (notice.priority === 'important') return ''; // important는 번호 없음
    if (notice.priority === 'urgent') return '긴급';
    if (notice.priority === 'high') return '공지';

    // important가 아닌 공지사항들만 카운트하여 번호 매기기
    const normalNotices = notices.filter((n) => n.priority !== 'important');
    const normalIndex = normalNotices.findIndex((n) => n.id === notice.id);
    return String(normalIndex + 1).padStart(2, '0');
  };

  if (loading) {
    return (
      <div className="py-12 mx-[10rem] min-h-[80vh]">
        <section className="font-gmarket text-2.5 font-700 mb-12 lg:container lg:mx-auto lg:px-[8rem] sm:px-[1.5rem] pt-[6rem] pb-[3rem]">
          고객지원
        </section>
        <section className="flex gap-24">
          {/* Left Nav 스켈레톤 */}
          <div className="w-72 flex-shrink-0">
            <div className="mb-10">
              <div className="h-8 bg-gray-200 rounded w-24 mb-6"></div>
              <div className="h-6 bg-gray-200 rounded w-32 mb-3"></div>
            </div>
          </div>
          {/* Main Content 스켈레톤 */}
          <main className="flex-1 w-1/3">
            <div className="h-8 bg-gray-200 rounded w-32 mb-6"></div>
            <NoticeSkeleton />
          </main>
        </section>
      </div>
    );
  }

  return (
    <div className="py-12 mx-[10rem] min-h-[80vh]">
      {/* 상단 고객지원 제목 */}
      <section className="font-gmarket text-2.5 font-700 mb-12 lg:container lg:mx-auto lg:px-[8rem] sm:px-[1.5rem] pt-[6rem] pb-[3rem]">
        고객지원
      </section>
      <section className="flex gap-24 ">
        {/* Left Nav */}
        <div className="w-72 flex-shrink-0">
          <div className="mb-10">
            {/* 게첨사진 탭 */}
            <div
              className={`text-1.25 font-700 mb-6 border-b-1 border-b-solid pb-4 border-gray-1 cursor-pointer ${
                activeTab === '게첨사진' ? 'text-black' : 'text-gray-5'
              }`}
              onClick={() => setActiveTab('게첨사진')}
            >
              게첨사진
            </div>
            {/* 공지사항 탭 */}
            <div
              className={`text-1.25 font-600 mb-6 border-b-1 border-b-solid pb-4 border-gray-1 cursor-pointer ${
                activeTab === '공지사항' ? 'text-black' : 'text-gray-5'
              }`}
              onClick={() => setActiveTab('공지사항')}
            >
              공지사항
            </div>
            {/* 자주 묻는 질문 탭 */}
            <div
              className={`text-1.25 font-600 mb-3 cursor-pointer ${
                activeTab === '자주 묻는 질문' ? 'text-black' : 'text-gray-5'
              }`}
              onClick={() => setActiveTab('자주 묻는 질문')}
            >
              자주 묻는 질문
            </div>
            {/* 하위 FAQ 카테고리 */}
            {activeTab === '자주 묻는 질문' && (
              <ul className="pl-5 space-y-3 text-lg">
                {faqCategories.map((cat) => (
                  <li
                    key={cat}
                    className={`list-disc ml-2 cursor-pointer ${
                      activeFaq === cat ? 'text-black font-600' : 'text-gray-5'
                    }`}
                    onClick={() => setActiveFaq(cat)}
                  >
                    {cat}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {/* Main Content */}
        <main className="flex-1 w-1/3">
          <div className="text-2.5 font-500 mb-6 border-b-solid border-b-1 border-gray-1 pb-4">
            {activeTab === '게첨사진'
              ? '게첨사진'
              : activeTab === '공지사항'
              ? '공지사항'
              : `자주 묻는 질문 - ${activeFaq}`}
          </div>

          {activeTab === '게첨사진' ? (
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
                      {/* 아코디언 상세 내용 */}
                      {expandedItemId === banner.id && (
                        <div className="border-t border-gray-200 p-4 bg-gray-50">
                          <div className="bg-white rounded-lg p-4">
                            <div className="mb-4">
                              {/* 여러 사진 표시 - 일렬로 */}
                              <div className="flex flex-col space-y-4">
                                {banner.photo_urls?.map(
                                  (photoUrl: string, index: number) => (
                                    <div key={index} className="relative">
                                      <Image
                                        src={photoUrl}
                                        alt={`${banner.title} - 사진 ${
                                          banner.photo_names?.[index] ||
                                          index + 1
                                        }`}
                                        width={400}
                                        height={300}
                                        className="w-full h-auto rounded-lg shadow-sm"
                                        onError={(e) => {
                                          const target =
                                            e.target as HTMLImageElement;
                                          target.src = '/images/no_image.png';
                                        }}
                                      />
                                      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                        {banner.photo_names?.[index] ||
                                          index + 1}{' '}
                                        / {banner.photo_urls?.length || 0}
                                      </div>
                                      {/* 사진 아래에 파일명 표시 */}
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

              {/* 페이지네이션 */}
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
            </div>
          ) : activeTab === '공지사항' ? (
            <table className="w-full border-collapse text-lg">
              <thead>
                <tr className="border-b-solid border-b-1 border-gray-1 text-gray-400 text-1.25 font-500">
                  <th className="py-5 px-5 text-left ">no</th>
                  <th className="py-5 px-5 text-left">공지안내</th>
                  <th className="py-5 px-5 text-left ">등록일</th>
                </tr>
              </thead>
              <tbody className="py-4">
                {notices.map((notice) => (
                  <React.Fragment key={notice.id}>
                    <tr
                      className={`border-b border-b-solid border-b-gray-1 hover:bg-gray-50 cursor-pointer ${
                        notice.priority === 'important' ? 'bg-gray-50' : ''
                      }`}
                      onClick={() => handleItemClick(notice.id)}
                    >
                      <td className="py-3 px-5">
                        <span
                          className={
                            notice.priority === 'important'
                              ? 'text-red font-bold'
                              : ''
                          }
                        >
                          {getNoticeNumber(notice)}
                        </span>
                      </td>
                      <td
                        className={`py-3 px-5${
                          notice.priority === 'important' ||
                          notice.priority === 'normal'
                            ? ' font-bold'
                            : ''
                        }`}
                      >
                        {notice.title}
                      </td>
                      <td className="py-3 px-5">
                        {formatDate(notice.created_at)}
                      </td>
                    </tr>
                    {/* 아코디언 상세 내용 */}
                    {expandedItemId === notice.id && (
                      <tr>
                        <td colSpan={3} className="p-0">
                          <div className="bg-gray-50 p-6 border-b border-gray-200">
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                              <h3 className="text-xl font-bold mb-4">
                                {notice.title}
                              </h3>
                              <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                                {notice.content}
                              </div>
                              <div className="mt-4 text-sm text-gray-500">
                                등록일: {formatDate(notice.created_at)}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          ) : (
            <div>
              {faqLoading ? (
                <FaqSkeleton />
              ) : faqs.length > 0 ? (
                <div className="space-y-4">
                  {faqs.map((faq) => (
                    <div
                      key={faq.id}
                      className="border border-gray-200 rounded-lg"
                    >
                      <div
                        className="p-4 cursor-pointer hover:bg-gray-50"
                        onClick={() => handleItemClick(faq.id)}
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium text-gray-900">
                            Q. {faq.title}
                          </h3>
                        </div>
                      </div>
                      {/* 아코디언 답변 */}
                      {expandedItemId === faq.id && (
                        <div className="border-t border-gray-200 p-4 bg-gray-50">
                          <div className="bg-white rounded-lg p-4">
                            <h4 className="text-md font-medium text-gray-900 mb-3">
                              A. 답변
                            </h4>
                            <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                              {faq.answer}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  해당 카테고리의 FAQ가 없습니다.
                </div>
              )}
            </div>
          )}
        </main>
      </section>
    </div>
  );
}
