import DigitalSignageDetailClient from './DigitalSignageDetailClient';

// 제품 데이터 매핑
const productDataMap = {
  'digital-signage-1': {
    id: 'digital-signage-1',
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
  'digital-signage-2': {
    id: 'digital-signage-2',
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
  'digital-signage-3': {
    id: 'digital-signage-3',
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
  'digital-signage-4': {
    id: 'digital-signage-4',
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
  'digital-signage-5': {
    id: 'digital-signage-5',
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
  'digital-signage-6': {
    id: 'digital-signage-6',
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
  'digital-signage-7': {
    id: 'digital-signage-7',
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
  'digital-signage-8': {
    id: 'digital-signage-8',
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
  'digital-signage-9': {
    id: 'digital-signage-9',
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
