'use client';

import Image from 'next/image';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ItemCard from '../../components/itemCard';
import DraggableNoticePopup from '@/src/components/DraggableNoticePopup';
import { useAdvancedNoticePopup } from '@/src/components/hooks/useAdvancedNoticePopup';
import { HomepageContent } from '@/src/types/homepage-content';

// 미디어경관디자인 데이터
const mediaDisplayItems = [
  {
    id: 'gansong-art-museum',
    title: '간송미술관',
    src: '/images/digital-media/media_display/간송미술관/2025_간송미술관-무기명_1.jpg',
    images: [
      '/images/digital-media/media_display/간송미술관/2025_간송미술관-무기명_1.jpg',
      '/images/digital-media/media_display/간송미술관/2025_간송미술관-무기명_2.jpg',
      '/images/digital-media/media_display/간송미술관/2025_간송미술관-무기명_3.jpg',
      '/images/digital-media/media_display/간송미술관/2025_간송미술관-무기명_4.jpg',
      '/images/digital-media/media_display/간송미술관/2025_간송미술관-무기명_5.jpg',
    ],
  },
  {
    id: 'red-road',
    title: '레드로드',
    src: '/images/digital-media/media_display/레드로드/홍대 전광판 제안서_1.jpg',
    images: [
      '/images/digital-media/media_display/레드로드/홍대 전광판 제안서_1.jpg',
      '/images/digital-media/media_display/레드로드/홍대 전광판 제안서_3.jpg',
      '/images/digital-media/media_display/레드로드/홍대 전광판 제안서_4.jpg',
      '/images/digital-media/media_display/레드로드/홍대 전광판 제안서_5.jpg',
    ],
  },
  {
    id: 'baengnyeon-market',
    title: '백년시장',
    src: '/images/digital-media/media_display/백년시장/백년시장01.jpg',
    images: [
      '/images/digital-media/media_display/백년시장/백년시장01.jpg',
      '/images/digital-media/media_display/백년시장/백년시장02.jpg',
      '/images/digital-media/media_display/백년시장/백년시장03.jpg',
    ],
  },
  {
    id: 'bulgwangcheon',
    title: '불광천 방송문화거리',
    src: '/images/digital-media/media_display/불광천 방송문화거리/불광천 방송문화거리_가로최종_깬것 [Repaired]_1.jpg',
    images: [
      '/images/digital-media/media_display/불광천 방송문화거리/불광천 방송문화거리_가로최종_깬것 [Repaired]_1.jpg',
      '/images/digital-media/media_display/불광천 방송문화거리/불광천 방송문화거리_가로최종_깬것 [Repaired]_2.jpg',
      '/images/digital-media/media_display/불광천 방송문화거리/불광천 방송문화거리_가로최종_깬것 [Repaired]_3.jpg',
      '/images/digital-media/media_display/불광천 방송문화거리/불광천 방송문화거리_가로최종_깬것 [Repaired]_4.jpg',
    ],
  },
  {
    id: 'seocho-media-pole',
    title: '서초구 미디어폴',
    src: '/images/digital-media/media_display/서초구 미디어폴/서초구 심의도서3_압축_7.jpg',
    images: [
      '/images/digital-media/media_display/서초구 미디어폴/서초구 심의도서3_압축_7.jpg',
      '/images/digital-media/media_display/서초구 미디어폴/서초구 심의도서3_압축_8.jpg',
      '/images/digital-media/media_display/서초구 미디어폴/서초구 심의도서3_압축_9.jpg',
      '/images/digital-media/media_display/서초구 미디어폴/서초구 심의도서3_압축_10.jpg',
    ],
  },
  {
    id: 'seongdong-media-tunnel',
    title: '성동구 미디어터널',
    src: '/images/digital-media/media_display/성동구 미디어터널/성동구 미디어터널01..jpg',
    images: [
      '/images/digital-media/media_display/성동구 미디어터널/성동구 미디어터널01..jpg',
      '/images/digital-media/media_display/성동구 미디어터널/성동구 미디어터널02.jpg',
      '/images/digital-media/media_display/성동구 미디어터널/성동구 미디어터널03.jpg',
      '/images/digital-media/media_display/성동구 미디어터널/성동구 미디어터널04.jpg',
    ],
  },
  {
    id: 'hampyeong-electronic',
    title: '함평전자게시대',
    src: '/images/digital-media/media_display/함평전자게시대/함평01.jpg',
    images: [
      '/images/digital-media/media_display/함평전자게시대/함평01.jpg',
      '/images/digital-media/media_display/함평전자게시대/함평02.jpg',
      '/images/digital-media/media_display/함평전자게시대/함평03.jpg',
      '/images/digital-media/media_display/함평전자게시대/함평04.jpg',
    ],
  },
];

// 디지털전광판 데이터 (기존 데이터 활용)
const digitalBillboardItems = [
  {
    id: 'guro-rodeo',
    title: '구월 로데오광장',
    src: '/images/digital-media/digital_banner/구월로데오광장/구월동01.jpg',
  },
  {
    id: 'starlight-proposal',
    title: '별빛프로포즈 탐방로',
    src: '/images/digital-media/digital_banner/별빛프로포즈탐방로/2025_영천_별빛탐방로-2차-2-복사_1.jpg',
  },
  {
    id: 'byeongjeom-plaza',
    title: '병점광장',
    src: '/images/digital-media/digital_banner/병점광장/야간 미디어.png',
  },
  {
    id: 'janghang-lafesta',
    title: '장항동 라페스타',
    src: '/images/digital-media/digital_banner/장항동_라페스타/페이지 원본 2025_장항동관광특구_1.jpg',
  },
  {
    id: 'junggu-yaksu',
    title: '중구 약수역',
    src: '/images/digital-media/digital_banner/중구_약수역/2025_약수역_옥외광고물_1.jpg',
  },
  {
    id: 'cheorwon-labor',
    title: '철원 노동당사',
    src: '/images/digital-media/digital_banner/철원_노동당사/페이지 원본 2025_철원_미디어아트_1.jpg',
  },
];

// 디지털사이니지 데이터 (실제 제품 정보 포함)
const digitalSignageItems = [
  {
    id: 'samsung-single',
    title: '싱글 사이니지(삼성)',
    src: '/images/digital-media/digital_signage/1_삼성 싱글사이니지.jpg',
  },
  {
    id: 'lg-single',
    title: '싱글 사이니지(LG)',
    src: '/images/digital-media/digital_signage/4_LG사이니지.jpg',
  },
  {
    id: 'samsung-multivision',
    title: '멀티비전',
    src: '/images/digital-media/digital_signage/2_삼성멀티비전.jpg',
  },
  {
    id: 'electronic-whiteboard',
    title: '전자칠판',
    src: '/images/digital-media/digital_signage/3_삼성전지칠판.jpg',
  },
  {
    id: 'stand-signage',
    title: '스탠다드 사이니지',
    src: '/images/digital-media/digital_signage/5_중국산 스탠드.jpg',
  },
  {
    id: 'kiosk',
    title: '결제키오스크(삼성)',
    src: '/images/digital-media/digital_signage/6_삼성전자결제-키오스크.jpg',
  },
  {
    id: 'multivision-videowall',
    title: '멀티비전(비디오월)',
    src: '/images/digital-media/digital_signage/7_멀티비전 이미지1.jpg',
  },
  {
    id: 'aida-digital-frame',
    title: '디지털액자',
    src: '/images/digital-media/digital_signage/8_AIDA 디지털액자.jpg',
  },
  {
    id: 'standard-signage',
    title: '스탠다드 사이니지',
    src: '/images/digital-media/digital_signage/9_스탠드사이니지(피벗타입).jpg',
  },
  {
    id: 'the-gallery',
    title: '더갤러리(삼성)',
    src: '/images/digital-media/digital_signage/10_더갤러리.png',
  },
  {
    id: 'q-series-stand',
    title: '스탠드 사이니지(Q시리즈)',
    src: '/images/digital-media/digital_signage/11_Q시리즈 스탠드사이니지.jpg',
  },
  {
    id: 'q-series-touch',
    title: '터치모니터(Q시리즈)',
    src: '/images/digital-media/digital_signage/12_Q시리즈 터치모니터.jpg',
  },
  {
    id: 'bracket',
    title: '브라켓',
    src: '/images/digital-media/digital_signage/13_브라켓 NSV-01.jpg',
  },
  {
    id: 'outdoor-wall',
    title: '옥외형 벽부타입',
    src: '/images/digital-media/digital_signage/14_옥외형 벽부형.jpg',
  },
  {
    id: 'outdoor-stand',
    title: '옥외형 스탠드타입',
    src: '/images/digital-media/digital_signage/15_옥외형 스탠드형1.jpg',
  },
  {
    id: 'led-display',
    title: 'LED 디스플레이 시리즈',
    src: '/images/digital-media/digital_signage/16_LED디스플레이.jpg',
  },
  {
    id: 'led-controller',
    title: 'LED 디스플레이 컨트롤러',
    src: '/images/digital-media/digital_signage/17_1-컨트롤러-PC형.jpg',
  },
  {
    id: 'led-installation',
    title: 'LED 디스플레이 설치비',
    src: '/images/digital-media/digital_signage/18_LED 디스플레이 설치비.png',
  },
];

type TabType = 'media-display' | 'digital-billboard' | 'digital-signage';

function DigitalSignagePageContent() {
  const [homepageContent, setHomepageContent] =
    useState<HomepageContent | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('media-display');
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
              '/images/digital-sianage/landing.png'
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
            미디어경관디자인
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
            디지털사이니지
          </button>
        </div>
      </section>

      <div className="lg:container lg:mx-auto lg:px-[8rem] sm:px-[1.5rem] py-12">
        <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-8 justify-items-center">
          {getCurrentItems().map((item) => (
            <ItemCard item={item} key={item.id} />
          ))}
        </div>
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
