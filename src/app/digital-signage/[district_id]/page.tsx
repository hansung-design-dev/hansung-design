import DigitalSignageDetailClient from './DigitalSignageDetailClient';

// 제품 데이터 매핑
const productDataMap = {
  // 미디어경관디자인
  'gansong-art-museum': {
    id: 'gansong-art-museum',
    title: '간송미술관',
    image:
      '/images/digital-sianage/media_display/간송미술관/2025_간송미술관-무기명_1.jpg',
    images: [
      '/images/digital-sianage/media_display/간송미술관/2025_간송미술관-무기명_1.jpg',
      '/images/digital-sianage/media_display/간송미술관/2025_간송미술관-무기명_2.jpg',
      '/images/digital-sianage/media_display/간송미술관/2025_간송미술관-무기명_3.jpg',
      '/images/digital-sianage/media_display/간송미술관/2025_간송미술관-무기명_4.jpg',
      '/images/digital-sianage/media_display/간송미술관/2025_간송미술관-무기명_5.jpg',
    ],
    specifications: {
      operatingLineup: '문화시설 전용 디스플레이',
      modelName: '간송미술관 미디어 디스플레이',
      productSize: '상세페이지 참조',
      resolutionBrightness: '고해상도 디스플레이 / 최적화된 밝기',
      keyFeatures: '문화시설 맞춤형 디스플레이 / 예술작품 전시 최적화',
      usage: '미술관 전시, 문화 콘텐츠 송출, 관람객 안내',
      installationMethod: '전시공간 맞춤 설치, 조명 연동',
      inquiry: '1833-9009',
    },
  },
  'red-road': {
    id: 'red-road',
    title: '레드로드',
    image:
      '/images/digital-sianage/media_display/레드로드/홍대 전광판 제안서_1.jpg',
    images: [
      '/images/digital-sianage/media_display/레드로드/홍대 전광판 제안서_1.jpg',
      '/images/digital-sianage/media_display/레드로드/홍대 전광판 제안서_3.jpg',
      '/images/digital-sianage/media_display/레드로드/홍대 전광판 제안서_4.jpg',
      '/images/digital-sianage/media_display/레드로드/홍대 전광판 제안서_5.jpg',
    ],
    specifications: {
      operatingLineup: '홍대 지역 전용 전광판',
      modelName: '홍대 레드로드 전광판',
      productSize: '상세페이지 참조',
      resolutionBrightness: '고휘도 디스플레이 / 야외 환경 최적화',
      keyFeatures: '홍대 지역 특화 디스플레이 / 젊은 문화 콘텐츠',
      usage: '홍대 지역 광고, 문화 이벤트, 지역 정보 안내',
      installationMethod: '야외 전광판 설치, 방수/방진 처리',
      inquiry: '1833-9009',
    },
  },
  'baengnyeon-market': {
    id: 'baengnyeon-market',
    title: '백년시장',
    image: '/images/digital-sianage/media_display/백년시장/백년시장01.jpg',
    images: [
      '/images/digital-sianage/media_display/백년시장/백년시장01.jpg',
      '/images/digital-sianage/media_display/백년시장/백년시장02.jpg',
      '/images/digital-sianage/media_display/백년시장/백년시장03.jpg',
    ],
    specifications: {
      operatingLineup: '전통시장 맞춤형 디스플레이',
      modelName: '백년시장 미디어 디스플레이',
      productSize: '상세페이지 참조',
      resolutionBrightness: '전통시장 환경 최적화 / 적절한 밝기',
      keyFeatures: '전통시장 특화 디스플레이 / 상인과 고객 소통',
      usage: '시장 정보 안내, 상품 홍보, 이벤트 알림',
      installationMethod: '시장 내부 설치, 상인 접근성 고려',
      inquiry: '1833-9009',
    },
  },
  bulgwangcheon: {
    id: 'bulgwangcheon',
    title: '불광천 방송문화거리',
    image:
      '/images/digital-sianage/media_display/불광천 방송문화거리/불광천 방송문화거리_가로최종_깬것 [Repaired]_1.jpg',
    images: [
      '/images/digital-sianage/media_display/불광천 방송문화거리/불광천 방송문화거리_가로최종_깬것 [Repaired]_1.jpg',
      '/images/digital-sianage/media_display/불광천 방송문화거리/불광천 방송문화거리_가로최종_깬것 [Repaired]_2.jpg',
      '/images/digital-sianage/media_display/불광천 방송문화거리/불광천 방송문화거리_가로최종_깬것 [Repaired]_3.jpg',
      '/images/digital-sianage/media_display/불광천 방송문화거리/불광천 방송문화거리_가로최종_깬것 [Repaired]_4.jpg',
    ],
    specifications: {
      operatingLineup: '방송문화거리 전용 디스플레이',
      modelName: '불광천 방송문화거리 미디어 디스플레이',
      productSize: '상세페이지 참조',
      resolutionBrightness: '문화거리 환경 최적화 / 방송 콘텐츠 전용',
      keyFeatures: '방송문화거리 특화 디스플레이 / 문화 콘텐츠 송출',
      usage: '문화 이벤트, 방송 콘텐츠, 지역 문화 홍보',
      installationMethod: '문화거리 설치, 방송 연동 시스템',
      inquiry: '1833-9009',
    },
  },
  'seocho-media-pole': {
    id: 'seocho-media-pole',
    title: '서초구 미디어폴',
    image:
      '/images/digital-sianage/media_display/서초구 미디어폴/서초구 심의도서3_압축_7.jpg',
    images: [
      '/images/digital-sianage/media_display/서초구 미디어폴/서초구 심의도서3_압축_7.jpg',
      '/images/digital-sianage/media_display/서초구 미디어폴/서초구 심의도서3_압축_8.jpg',
      '/images/digital-sianage/media_display/서초구 미디어폴/서초구 심의도서3_압축_9.jpg',
      '/images/digital-sianage/media_display/서초구 미디어폴/서초구 심의도서3_압축_10.jpg',
    ],
    specifications: {
      operatingLineup: '서초구 미디어폴 시스템',
      modelName: '서초구 미디어폴 디스플레이',
      productSize: '상세페이지 참조',
      resolutionBrightness: '미디어폴 전용 디스플레이 / 도시 환경 최적화',
      keyFeatures: '서초구 특화 미디어폴 / 스마트시티 연동',
      usage: '도시 정보 안내, 공공 서비스, 스마트시티 콘텐츠',
      installationMethod: '미디어폴 설치, 스마트시티 인프라 연동',
      inquiry: '1833-9009',
    },
  },
  'seongdong-media-tunnel': {
    id: 'seongdong-media-tunnel',
    title: '성동구 미디어터널',
    image:
      '/images/digital-sianage/media_display/성동구 미디어터널/성동구 미디어터널01..jpg',
    images: [
      '/images/digital-sianage/media_display/성동구 미디어터널/성동구 미디어터널01..jpg',
      '/images/digital-sianage/media_display/성동구 미디어터널/성동구 미디어터널02.jpg',
      '/images/digital-sianage/media_display/성동구 미디어터널/성동구 미디어터널03.jpg',
      '/images/digital-sianage/media_display/성동구 미디어터널/성동구 미디어터널04.jpg',
    ],
    specifications: {
      operatingLineup: '성동구 미디어터널 시스템',
      modelName: '성동구 미디어터널 디스플레이',
      productSize: '상세페이지 참조',
      resolutionBrightness: '터널 환경 최적화 / 연속 디스플레이',
      keyFeatures: '성동구 특화 미디어터널 / 통행자 경험 향상',
      usage: '터널 내 정보 안내, 광고, 통행자 안전 정보',
      installationMethod: '터널 내 연속 설치, 안전 시스템 연동',
      inquiry: '1833-9009',
    },
  },
  'hampyeong-electronic': {
    id: 'hampyeong-electronic',
    title: '함평전자게시대',
    image: '/images/digital-sianage/media_display/함평전자게시대/함평01.jpg',
    images: [
      '/images/digital-sianage/media_display/함평전자게시대/함평01.jpg',
      '/images/digital-sianage/media_display/함평전자게시대/함평02.jpg',
      '/images/digital-sianage/media_display/함평전자게시대/함평03.jpg',
      '/images/digital-sianage/media_display/함평전자게시대/함평04.jpg',
    ],
    specifications: {
      operatingLineup: '함평 전자게시대 시스템',
      modelName: '함평전자게시대 디스플레이',
      productSize: '상세페이지 참조',
      resolutionBrightness: '전자게시대 전용 / 고휘도 디스플레이',
      keyFeatures: '함평 지역 특화 전자게시대 / 지역 정보 전용',
      usage: '지역 정보 안내, 공공 서비스, 지역 홍보',
      installationMethod: '전자게시대 설치, 지역 시스템 연동',
      inquiry: '1833-9009',
    },
  },
  // 디지털전광판
  'digital-billboard-1': {
    id: 'digital-billboard-1',
    title: 'SAMSUNG QB Series',
    image: '/images/digital-signage-example.jpeg',
    specifications: {
      operatingLineup: '43인치, 50인치, 55인치, 65인치, 75인치, 85인치',
      modelName: 'QB Series (상세페이지 참조)',
      productSize: '상세페이지 참조',
      resolutionBrightness: '3,840 x 2160 (4K UHD) / 350nit',
      keyFeatures: 'USB INPUT 제어 / 매직인포 네트워크 솔루션',
      usage: '광고, 홍보, 메뉴보드, 캠페인 등의 미디어 콘텐츠 송출',
      installationMethod: '벽면설치, 매립설치, 천정설치 등',
      inquiry: '1833-9009',
    },
  },
  'digital-billboard-2': {
    id: 'digital-billboard-2',
    title: 'LG LED Display',
    image: '/images/digital-signage-example.jpeg',
    specifications: {
      operatingLineup: '32인치, 43인치, 49인치, 55인치, 65인치',
      modelName: 'LG LED Series (상세페이지 참조)',
      productSize: '상세페이지 참조',
      resolutionBrightness: '1920 x 1080 (Full HD) / 400nit',
      keyFeatures: '웹OS / 스마트 디스플레이 솔루션',
      usage: '매장 디스플레이, 정보 안내, 광고 송출',
      installationMethod: '벽면설치, 스탠드설치, 천정설치 등',
      inquiry: '1833-9009',
    },
  },
  'digital-billboard-3': {
    id: 'digital-billboard-3',
    title: 'Philips Digital Signage',
    image: '/images/digital-signage-example.jpeg',
    specifications: {
      operatingLineup: '40인치, 50인치, 55인치, 65인치, 75인치',
      modelName: 'Philips BDL Series (상세페이지 참조)',
      productSize: '상세페이지 참조',
      resolutionBrightness: '3840 x 2160 (4K UHD) / 450nit',
      keyFeatures: '스마트 디스플레이 / IoT 연동',
      usage: '스마트 오피스, 디지털 사이니지, 정보 디스플레이',
      installationMethod: '벽면설치, 매립설치, 이동식 스탠드 등',
      inquiry: '1833-9009',
    },
  },
  // 디지털사이니지
  'digital-signage-1': {
    id: 'digital-signage-1',
    title: 'Sony Professional Display',
    image: '/images/digital-signage-example.jpeg',
    specifications: {
      operatingLineup: '43인치, 49인치, 55인치, 65인치, 75인치, 85인치',
      modelName: 'Sony BZ Series (상세페이지 참조)',
      productSize: '상세페이지 참조',
      resolutionBrightness: '3840 x 2160 (4K UHD) / 500nit',
      keyFeatures: '프로페셔널 디스플레이 / 24/7 운영',
      usage: '방송국, 제어실, 전문 디스플레이 환경',
      installationMethod: '벽면설치, 매립설치, 전문 마운트 등',
      inquiry: '1833-9009',
    },
  },
  'digital-signage-2': {
    id: 'digital-signage-2',
    title: 'Panasonic Digital Signage',
    image: '/images/digital-signage-example.jpeg',
    specifications: {
      operatingLineup: '40인치, 50인치, 55인치, 65인치, 75인치',
      modelName: 'Panasonic TH Series (상세페이지 참조)',
      productSize: '상세페이지 참조',
      resolutionBrightness: '1920 x 1080 (Full HD) / 350nit',
      keyFeatures: '상업용 디스플레이 / 내구성',
      usage: '상업시설, 호텔, 레스토랑 디스플레이',
      installationMethod: '벽면설치, 매립설치, 스탠드 등',
      inquiry: '1833-9009',
    },
  },
  'digital-signage-3': {
    id: 'digital-signage-3',
    title: 'Sharp Digital Display',
    image: '/images/digital-signage-example.jpeg',
    specifications: {
      operatingLineup: '40인치, 50인치, 55인치, 65인치, 70인치',
      modelName: 'Sharp PN Series (상세페이지 참조)',
      productSize: '상세페이지 참조',
      resolutionBrightness: '3840 x 2160 (4K UHD) / 400nit',
      keyFeatures: '터치스크린 / 인터랙티브 디스플레이',
      usage: '교육기관, 전시관, 인터랙티브 정보 안내',
      installationMethod: '벽면설치, 터치스크린 마운트 등',
      inquiry: '1833-9009',
    },
  },
  'digital-signage-4': {
    id: 'digital-signage-4',
    title: 'Toshiba Digital Signage',
    image: '/images/digital-signage-example.jpeg',
    specifications: {
      operatingLineup: '43인치, 50인치, 55인치, 65인치, 75인치',
      modelName: 'Toshiba L Series (상세페이지 참조)',
      productSize: '상세페이지 참조',
      resolutionBrightness: '1920 x 1080 (Full HD) / 500nit',
      keyFeatures: '고휘도 디스플레이 / 야외 사용',
      usage: '야외 광고, 고휘도 환경 디스플레이',
      installationMethod: '야외 마운트, 방수 케이싱 등',
      inquiry: '1833-9009',
    },
  },
  'digital-signage-5': {
    id: 'digital-signage-5',
    title: 'NEC Digital Display',
    image: '/images/digital-signage-example.jpeg',
    specifications: {
      operatingLineup: '40인치, 46인치, 55인치, 65인치, 75인치',
      modelName: 'NEC V Series (상세페이지 참조)',
      productSize: '상세페이지 참조',
      resolutionBrightness: '1920 x 1080 (Full HD) / 350nit',
      keyFeatures: '고신뢰성 / 24/7 운영',
      usage: '금융기관, 공공기관, 안정성 중시 환경',
      installationMethod: '벽면설치, 매립설치, 보안 마운트 등',
      inquiry: '1833-9009',
    },
  },
  'digital-signage-6': {
    id: 'digital-signage-6',
    title: 'BenQ Digital Signage',
    image: '/images/digital-signage-example.jpeg',
    specifications: {
      operatingLineup: '32인치, 43인치, 50인치, 55인치, 65인치',
      modelName: 'BenQ RP Series (상세페이지 참조)',
      productSize: '상세페이지 참조',
      resolutionBrightness: '1920 x 1080 (Full HD) / 300nit',
      keyFeatures: '에너지 효율 / 친환경 디스플레이',
      usage: '친환경 건물, 에너지 절약 중시 환경',
      installationMethod: '벽면설치, 스탠드, 이동식 등',
      inquiry: '1833-9009',
    },
  },
};

export default async function DigitalSignageDetailPage({
  params,
}: {
  params: Promise<{ district_id: string }>;
}) {
  // URL 파라미터로 제품 데이터 가져오기
  const resolvedParams = await params;
  const productData =
    productDataMap[resolvedParams.district_id as keyof typeof productDataMap];

  // 제품이 존재하지 않으면 404 처리
  if (!productData) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">제품을 찾을 수 없습니다</h1>
          <p className="text-gray-600">요청하신 제품이 존재하지 않습니다.</p>
        </div>
      </main>
    );
  }

  return <DigitalSignageDetailClient productData={productData} />;
}
