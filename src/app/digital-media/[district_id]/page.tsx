import DigitalSignageDetailClient from './DigitalSignageDetailClient';
import { mediaDisplayData } from './data/mediaDisplayData';
import { digitalBillboardData } from './data/digitalBillboardData';
import { digitalSignageData } from './data/digitalSignageData';

// 제품 데이터 타입 정의
interface ProductData {
  id: string;
  title: string;
  image: string;
  images?: string[];
  modelName?: string;
  pixelPitchOptions?: string[];
  specifications?: {
    operatingLineup?: string;
    modelName?: string;
    productSize?: string;
    resolutionBrightness?: string;
    keyFeatures?: string;
    usage?: string;
    installationMethod?: string;
    inquiry?: string;
    moduleSize?: string;
    moduleResolution?: string;
    pixelDensity?: string;
    optimalViewingDistance?: string;
    screenBrightness?: string;
    pixelConfiguration?: string;
    refreshRate?: string;
    viewingAngle?: string;
    flatness?: string;
    operatingTemperature?: string;
    operatingHumidity?: string;
    ratedInput?: string;
    maintenance?: string;
  };
  description?: string;
  type?: string;
  models?: {
    [key: string]: Array<{
      modelName: string;
      resolution: string;
      brightness: string;
      size: string;
      vesaHole: string;
      price: string;
      stock?: string;
      brand?: string;
      inch?: string;
    }>;
  };
}

// 제품 데이터 매핑
const productDataMap: Record<string, ProductData> = {
  ...mediaDisplayData,
  ...digitalBillboardData,
  ...digitalSignageData,
};

export default async function DigitalSignageDetailPage({
  params,
}: {
  params: Promise<{ district_id: string }>;
}) {
  const { district_id } = await params;
  const productData =
    productDataMap[district_id as keyof typeof productDataMap];

  if (!productData) {
    return <div>Product not found</div>;
  }

  // 디지털사이니지 아이템인지 확인
  const isDigitalSignageItem = [
    'samsung-single',
    'lg-single',
    'samsung-multivision',
    'samsung-chalkboard',
    'samsung-kiosk',
    'multivision-videowall',
    'aida-digital-frame',
    'stand-signage',
    'the-gallery',
    'q-series-stand',
    'q-series-touch',
    'outdoor-wall',
    'outdoor-stand',
    'led-display',
    'led-controller',
    'led-installation',
    'bracket',
    'electronic-whiteboard',
    'kiosk',
  ].includes(district_id);

  // 디지털전광판 아이템인지 확인 (미디어경관디자인과 같은 UI 사용)
  const isDigitalBillboardItem = [
    'guro-rodeo',
    'starlight-proposal',
    'byeongjeom-plaza',
    'janghang-lafesta',
    'junggu-yaksu',
    'cheorwon-labor',
  ].includes(district_id);

  return (
    <DigitalSignageDetailClient
      productData={productData}
      isDigitalSignage={isDigitalSignageItem}
      isDigitalBillboard={isDigitalBillboardItem}
    />
  );
}
