'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DraggableNoticePopup from '@/src/components/DraggableNoticePopup';
import { useAdvancedNoticePopup } from '@/src/components/hooks/useAdvancedNoticePopup';
import { HomepageContent } from '@/src/types/homepage-content';
// 로컬 데이터는 fallback으로만 사용 (필요시)
// import { digitalSignageData } from './[district_id]/data/digitalSignageData';

// 디지털 미디어 아이템 타입
interface DigitalMediaItem {
  id: string;
  title: string;
  src: string;
  images?: string[];
  productUuid?: string;
}

// 공공디자인 스타일 그리드 카드 컴포넌트
function DigitalMediaGridCard({
  item,
  currentTab,
  showCheckbox = false,
}: {
  item: DigitalMediaItem;
  currentTab: string;
  showCheckbox?: boolean;
}) {
  const fallbackSrc = '/images/digital-media/landing.png';
  const [imgSrc, setImgSrc] = useState<string>(item.src || fallbackSrc);

  // 쇼핑몰 탭용 체크박스 기능
  const { cart, dispatch } = showCheckbox
    ? // eslint-disable-next-line react-hooks/rules-of-hooks
      require('@/src/contexts/cartContext').useCart()
    : { cart: [], dispatch: () => {} };
  const { user } = showCheckbox
    ? // eslint-disable-next-line react-hooks/rules-of-hooks
      require('@/src/contexts/authContext').useAuth()
    : { user: null };
  const { profiles } = showCheckbox
    ? // eslint-disable-next-line react-hooks/rules-of-hooks
      require('@/src/contexts/profileContext').useProfile()
    : { profiles: [] };

  const isSelected = cart.some(
    (cartItem: { id: string }) => cartItem.id === item.id
  );

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSelected) {
      dispatch({ type: 'REMOVE_ITEM', id: item.id });
    } else {
      const defaultProfile = profiles.find(
        (profile: { is_default: boolean }) => profile.is_default
      );

      const cartItem = {
        id: item.id,
        type: 'digital-product' as const,
        name: item.title,
        district: '',
        price: 0,
        consultationKey: `digital_product:${item.id}`,
        contact_person_name: defaultProfile?.contact_person_name,
        phone: defaultProfile?.phone,
        company_name: defaultProfile?.company_name,
        email: defaultProfile?.email,
        user_profile_id: defaultProfile?.id,
        user_auth_id: defaultProfile?.user_auth_id || user?.id,
        digitalProductUuid: item.productUuid,
      };

      dispatch({ type: 'ADD_ITEM', item: cartItem });
    }
  };

  return (
    <Link
      href={`/digital-media/${item.id}?tab=${currentTab}`}
      className="w-full max-w-[23rem] group"
    >
      <div
        className={`relative w-full aspect-square overflow-hidden rounded-2xl bg-gray-100 ${
          isSelected && showCheckbox ? 'ring-[3px] ring-[#238CFA]' : ''
        }`}
      >
        <Image
          src={imgSrc}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 33vw"
          className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          quality={85}
          onError={() => setImgSrc(fallbackSrc)}
        />
        {/* 체크박스 (쇼핑몰 탭일 때만 표시) */}
        {showCheckbox && (
          <div
            className="absolute top-3 right-3 z-10 cursor-pointer"
            onClick={handleCheckboxClick}
          >
            <div
              className={`flex items-center justify-center w-7 h-7 rounded-md border transition-colors duration-150 shadow-md backdrop-blur-md ${
                isSelected
                  ? 'border-[#238CFA] bg-[rgba(35,140,250,0.08)]'
                  : 'border-gray-600 border-[0.1rem]'
              }`}
            >
              {isSelected ? (
                <Image
                  src="/images/blue-check.png"
                  alt="선택됨"
                  width={16}
                  height={16}
                  className="w-4 h-4"
                />
              ) : (
                <div className="w-3.5 h-3.5 rounded-[0.25rem] border border-gray-300 bg-white"></div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="pt-4">
        <div className="text-1.25 font-[700] text-black font-gmarket line-clamp-1">
          {item.title}
        </div>
      </div>
    </Link>
  );
}

// API 응답 타입
interface DigitalProductItem {
  id?: string;
  product_code?: string;
  product_group_code?: string;
  product_uuid?: string;
  title: string;
  main_image_url: string;
  image_urls?: string[] | string;
  product_type?: string;
  series_name?: string;
  model_name?: string;
  description?: string;
  contact_info?: string;
  bracket_note?: string;
  display_order?: number;
  project_code?: string;
  district_code?: string;
}

type TabType =
  | 'digital_media_billboards'
  | 'digital_media_signages'
  | 'digital_products';

// (unused) product image map removed to satisfy linter

function DigitalSignagePageContent() {
  const [homepageContent, setHomepageContent] =
    useState<HomepageContent | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>(
    'digital_media_billboards'
  );
  const [digitalProductsItems, setDigitalProductsItems] = useState<
    DigitalMediaItem[]
  >([]);
  const [digitalBillboardItems, setDigitalBillboardItems] = useState<
    DigitalMediaItem[]
  >([]);
  const [digitalSignageItems, setDigitalSignageItems] = useState<
    DigitalMediaItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  // 팝업 공지사항 훅 사용 (고급 팝업 시스템)
  const { popupNotice, closePopup } = useAdvancedNoticePopup('digital_signage');

  useEffect(() => {
    const fetchHomepageContent = async () => {
      try {
        const response = await fetch(
          '/api/homepage-contents?page=digital_signage&section=digital_signage'
        );
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setHomepageContent(data[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching homepage content:', error);
      }
    };

    fetchHomepageContent();
  }, []);

  useEffect(() => {
    const fetchDigitalMediaData = async () => {
      setLoading(true);
      try {
        // 디지털 제품(상품) 조회
        const productsResponse = await fetch(
          '/api/digital-media?action=getDigitalProducts'
        );
        if (productsResponse.ok) {
          const productsData =
            (await productsResponse.json()) as DigitalProductItem[];
          const formattedProducts = productsData.map((item) => {
            let imageUrls: string[] = [];
            if (Array.isArray(item.image_urls)) imageUrls = item.image_urls;
            else if (typeof item.image_urls === 'string') {
              try {
                imageUrls = JSON.parse(item.image_urls);
              } catch {
                imageUrls = [item.image_urls];
              }
            }
            const allImages = [item.main_image_url, ...imageUrls];
            const uniqueImages = Array.from(new Set(allImages.filter(Boolean)));
            return {
              id: item.product_group_code || item.product_code || item.id || '',
              productUuid: item.product_uuid || item.id || '',
              title: item.title,
              src: uniqueImages[0] || item.main_image_url,
              images:
                uniqueImages.length > 0 ? uniqueImages : [item.main_image_url],
            };
          });
          setDigitalProductsItems(formattedProducts);
        }

        // 디지털 전광판 조회
        const billboardResponse = await fetch(
          '/api/digital-media?action=getDigitalBillboards'
        );
        if (billboardResponse.ok) {
          const billboardData =
            (await billboardResponse.json()) as DigitalProductItem[];
          const formattedBillboard = billboardData.map((item) => {
            // image_urls 파싱 처리 (배열이면 그대로, 문자열이면 JSON 파싱)
            let imageUrls: string[] = [];
            if (Array.isArray(item.image_urls)) {
              imageUrls = item.image_urls;
            } else if (typeof item.image_urls === 'string') {
              try {
                imageUrls = JSON.parse(item.image_urls);
              } catch {
                imageUrls = [item.image_urls];
              }
            }

            // main_image_url과 image_urls 배열을 합쳐서 images 배열 생성 (중복 제거)
            const allImages = [item.main_image_url, ...imageUrls];
            const uniqueImages = Array.from(new Set(allImages.filter(Boolean)));

            return {
              id: item.district_code || item.project_code || item.id || '',
              title: item.title,
              src: item.main_image_url,
              images:
                uniqueImages.length > 0 ? uniqueImages : [item.main_image_url],
            };
          });
          setDigitalBillboardItems(formattedBillboard);
        }

        // 디지털 사이니지 제품 조회 - digital_media_signages 테이블에서 가져오기
        const signageResponse = await fetch(
          '/api/digital-media?action=getDigitalSignage'
        );
        if (signageResponse.ok) {
          const signageData = await signageResponse.json();
          const formattedSignage = (
            signageData as {
              image_urls?: string[] | string;
              main_image_url: string;
              district_code?: string;
              id?: string;
              title: string;
            }[]
          ).map((item) => {
            const imageUrls: string[] = Array.isArray(item.image_urls)
              ? item.image_urls
              : typeof item.image_urls === 'string'
              ? (() => {
                  try {
                    return JSON.parse(item.image_urls);
                  } catch {
                    return item.image_urls ? [item.image_urls] : [];
                  }
                })()
              : [];

            const allImages = [item.main_image_url, ...imageUrls];
            const uniqueImages = Array.from(new Set(allImages.filter(Boolean)));

            return {
              id: item.district_code || item.id || '',
              title: item.title,
              src: uniqueImages[0] || item.main_image_url,
              images:
                uniqueImages.length > 0 ? uniqueImages : [item.main_image_url],
            } as DigitalMediaItem;
          });
          setDigitalSignageItems(formattedSignage);
        }
      } catch (error) {
        console.error('Error fetching digital media data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDigitalMediaData();
  }, []);

  useEffect(() => {
    const initialTab = searchParams.get('tab') as TabType | null;
    if (
      initialTab === 'digital_media_billboards' ||
      initialTab === 'digital_media_signages' ||
      initialTab === 'digital_products'
    ) {
      setActiveTab(initialTab);
    } else {
      // 기본 탭을 디지털전광판으로 강제 세팅하고 URL도 동기화
      setActiveTab('digital_media_billboards');
      router.replace(`/digital-media?tab=digital_media_billboards`, {
        scroll: false,
      });
    }
  }, [searchParams, router]);

  const getCurrentItems = () => {
    switch (activeTab) {
      case 'digital_media_billboards':
        return digitalBillboardItems;
      case 'digital_media_signages':
        return digitalSignageItems;
      case 'digital_products':
        return digitalProductsItems;
      default:
        return digitalBillboardItems;
    }
  };

  return (
    <main className="min-h-screen bg-white ">
      {/* Header Section */}
      <section className="lg:container lg:mx-auto lg:px-[8rem] sm:px-[1.5rem] pt-[6rem] pb-[3rem]">
        <h1 className="text-3.75 sm:text-2.5 font-[700] mb-4 font-gmarket">
          {homepageContent?.title || '디지털미디어'}
        </h1>
        <p className="text-1.25 font-[500] text-gray-600 sm:text-1">
          {homepageContent?.subtitle || '광고를 혁신하다, 공간을 스마트하게'}
        </p>
      </section>

      {/* <section className=" mx-auto mb-12">
        <div className="relative w-full h-[320px] md:h-[400px] overflow-hidden">
          <Image
            src={
              homepageContent?.main_image_url ||
              '/images/digital-media/landing.png'
            }
            alt={homepageContent?.title || '디지털 사이니지 메인 이미지'}
            fill
            className="object-cover"
            priority
          />
        </div>
      </section> */}

      {/* Tab Navigation */}
      <section className="lg:container lg:mx-auto lg:px-[8rem] sm:px-[1.5rem] mb-8">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => {
              setActiveTab('digital_media_billboards');
              router.push(`/digital-media?tab=digital_media_billboards`, {
                scroll: false,
              });
            }}
            className={`px-6 py-3 text-lg font-medium transition-colors ${
              activeTab === 'digital_media_billboards'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            디지털전광판
          </button>
          <button
            onClick={() => {
              setActiveTab('digital_media_signages');
              router.push(`/digital-media?tab=digital_media_signages`, {
                scroll: false,
              });
            }}
            className={`px-6 py-3 text-lg font-medium transition-colors ${
              activeTab === 'digital_media_signages'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            디지털사이니지
          </button>
          <button
            onClick={() => {
              setActiveTab('digital_products');
              router.push(`/digital-media?tab=digital_products`, {
                scroll: false,
              });
            }}
            className={`px-6 py-3 text-lg font-medium transition-colors ${
              activeTab === 'digital_products'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            쇼핑몰
          </button>
        </div>
      </section>

      <div className="lg:container lg:mx-auto lg:px-[8rem] sm:px-[1.5rem] py-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-lg text-gray-500">데이터를 불러오는 중...</div>
          </div>
        ) : getCurrentItems().length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-lg text-gray-500">표시할 항목이 없습니다.</div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-1 gap-8 justify-items-center">
            {getCurrentItems().map((item) => (
              <DigitalMediaGridCard
                item={item}
                currentTab={activeTab}
                showCheckbox={activeTab === 'digital_products'}
                key={item.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* 팝업 공지사항 */}
      {popupNotice && (
        <DraggableNoticePopup notice={popupNotice} onClose={closePopup} />
      )}
    </main>
  );
}

export default function DigitalSignagePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DigitalSignagePageContent />
    </Suspense>
  );
}
