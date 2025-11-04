'use client';

import Image from 'next/image';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ItemCard from '../../components/itemCard';
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
}

// API 응답 타입
interface DigitalProductItem {
  id?: string;
  product_code?: string;
  product_group_code?: string;
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

type TabType = 'media-display' | 'digital-billboard' | 'digital-signage';

// 제품별 이미지 매핑 (같은 번호로 시작하는 이미지들)
const productImageMap: Record<string, string[]> = {
  'samsung-single': [
    '/images/digital-media/digital_signage/1_samsung_singleSignage.jpg',
  ],
  'samsung-multivision': [
    '/images/digital-media/digital_signage/2_samsung_multiVision.jpg',
  ],
  'samsung-electronic-board': [
    '/images/digital-media/digital_signage/3_samsung_digitalBoard.jpg',
  ],
  'lg-single': ['/images/digital-media/digital_signage/4_LG_signage.jpg'],
  'stand-signage': [
    '/images/digital-media/digital_signage/5_chinese_standard.jpg',
  ],
  kiosk: ['/images/digital-media/digital_signage/6_samsung_paymentKiosk.jpg'],
  'multivision-cismate': [
    '/images/digital-media/digital_signage/7_multiVision_1.jpg',
    '/images/digital-media/digital_signage/7_multiVision_2.jpg',
    '/images/digital-media/digital_signage/7_multiVision_3.jpg',
  ],
  'digital-frame': [
    '/images/digital-media/digital_signage/8_AIDA_digitalFrame.jpg',
  ],
  'the-gallery': ['/images/digital-media/digital_signage/10_theGallery.png'],
  'q-series-stand': [
    '/images/digital-media/digital_signage/11_Qseries_standardSignage.jpg',
  ],
  'q-series-touch': [
    '/images/digital-media/digital_signage/12_Qseries_touchMonitor.jpg',
  ],
  bracket: [
    '/images/digital-media/digital_signage/13_bracket_NSV-01.jpg',
    '/images/digital-media/digital_signage/13_bracket_PV-70.jpg',
  ],
  'outdoor-wall': [
    '/images/digital-media/digital_signage/14_outdoor_wallType.jpg',
  ],
  'outdoor-stand': [
    '/images/digital-media/digital_signage/15_outdoor_standard2.jpg',
  ],
  'led-display': ['/images/digital-media/digital_signage/16_LEDdisplay.jpg'],
  'led-controller': [
    '/images/digital-media/digital_signage/17-1-controller_PC.jpg',
    '/images/digital-media/digital_signage/17-2_controller_HD.jpg',
    '/images/digital-media/digital_signage/17-3-controller_FHD.jpg',
    '/images/digital-media/digital_signage/17-4_controller_FHD.jpg',
  ],
  'led-installation': [
    '/images/digital-media/digital_signage/18_LEDdisplay_installation.png',
  ],
};

function DigitalSignagePageContent() {
  const [homepageContent, setHomepageContent] =
    useState<HomepageContent | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('media-display');
  const [mediaDisplayItems, setMediaDisplayItems] = useState<
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
        // 미디어 경관 디스플레이 조회
        const mediaResponse = await fetch(
          '/api/digital-media?action=getMediaLandscape'
        );
        if (mediaResponse.ok) {
          const mediaData =
            (await mediaResponse.json()) as DigitalProductItem[];
          const formattedMedia = mediaData.map((item) => {
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

            return {
              id: item.project_code || item.id || '',
              title: item.title,
              src: item.main_image_url,
              images: imageUrls.length > 0 ? imageUrls : [item.main_image_url],
            };
          });
          setMediaDisplayItems(formattedMedia);
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

        // 디지털 사이니지 제품 조회 - 데이터베이스에서 가져오기 (쇼핑몰)
        const signageResponse = await fetch(
          '/api/digital-media?action=getDigitalSignage'
        );
        if (signageResponse.ok) {
          const signageData =
            (await signageResponse.json()) as DigitalProductItem[];
          const formattedSignage = signageData.map((item) => {
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

            // product_group_code가 있으면 해당 그룹의 이미지 맵에서 가져오기
            const groupCode = item.product_group_code || '';
            const mappedImages = groupCode
              ? productImageMap[groupCode] || []
              : [];

            // 이미지 배열 합치기 (중복 제거)
            const allImages = [
              item.main_image_url,
              ...imageUrls,
              ...mappedImages,
            ];
            const uniqueImages = Array.from(new Set(allImages.filter(Boolean)));

            return {
              id: item.product_group_code || item.product_code || item.id || '', // product_group_code를 id로 사용
              title: item.title,
              src: uniqueImages[0] || item.main_image_url, // 첫 번째 이미지를 메인 이미지로
              images:
                uniqueImages.length > 0 ? uniqueImages : [item.main_image_url],
            };
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
    const initialTab = searchParams.get('tab') as TabType;
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [searchParams]);

  const getCurrentItems = () => {
    switch (activeTab) {
      case 'media-display':
        return mediaDisplayItems;
      case 'digital-billboard':
        return digitalBillboardItems;
      case 'digital-signage':
        return digitalSignageItems;
      default:
        return mediaDisplayItems;
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

      <section className=" mx-auto mb-12">
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
      </section>

      {/* Tab Navigation */}
      <section className="lg:container lg:mx-auto lg:px-[8rem] sm:px-[1.5rem] mb-8">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => {
              setActiveTab('media-display');
              router.push(`/digital-media?tab=media-display`);
            }}
            className={`px-6 py-3 text-lg font-medium transition-colors ${
              activeTab === 'media-display'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            디지털전광판
          </button>
          <button
            onClick={() => {
              setActiveTab('digital-billboard');
              router.push(`/digital-media?tab=digital-billboard`);
            }}
            className={`px-6 py-3 text-lg font-medium transition-colors ${
              activeTab === 'digital-billboard'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            디지털사이니지
          </button>
          <button
            onClick={() => {
              setActiveTab('digital-signage');
              router.push(`/digital-media?tab=digital-signage`);
            }}
            className={`px-6 py-3 text-lg font-medium transition-colors ${
              activeTab === 'digital-signage'
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
              <ItemCard item={item} key={item.id} />
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
