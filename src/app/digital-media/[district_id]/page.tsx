import DigitalSignageDetailClient from './DigitalSignageDetailClient';
import { mediaDisplayData } from './data/mediaDisplayData';
import { digitalBillboardData } from './data/digitalBillboardData';
import { digitalSignageData } from './data/digitalSignageData';

// DB 제품 데이터 타입
interface DBProductItem {
  id?: string;
  product_code?: string;
  product_group_code?: string;
  title: string;
  main_image_url: string;
  image_urls?: string[] | string;
  product_type?: string;
  series_name?: string;
  model_name?: string;
  brand?: string;
  inch_size?: string;
  physical_size?: string;
  product_size?: string;
  resolution?: string;
  brightness?: string;
  specifications?: string;
  usage?: string;
  installation_method?: string;
  vesa_hole?: string;
  price?: string;
  special_features?: string;
  description?: string;
  bracket_note?: string;
  contact_info?: string;
  operating_lineup?: string;
  key_features?: string;
  inquiry_phone?: string;
  display_order?: number;
}

// 제품 데이터 타입 정의
interface ProductData {
  id: string;
  title: string;
  image: string;
  images?: string[];
  modelName?: string;
  pixelPitchOptions?: string[];
  contactInfo?: string;
  bracketNote?: string;
  series?: {
    [key: string]: {
      name: string;
      description: string;
      operatingLineup: string;
      models: Array<{
        modelName: string;
        brand: string;
        inch: string;
        size: string;
        specifications: string;
        resolution: string;
        brightness: string;
        usage: string;
        installation: string;
        vesaHole: string;
        price: string;
        specialFeatures?: string;
      }>;
    };
  };
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
      resolution?: string;
      brightness?: string;
      size?: string;
      vesaHole?: string;
      price?: string;
      stock?: string;
      brand?: string;
      inch?: string;
      specifications?: string;
      usage?: string;
      installation?: string;
      specialFeatures?: string;
    }>;
  };
}

// 제품 데이터 매핑
const productDataMap: Record<string, ProductData> = {
  ...mediaDisplayData,
  ...digitalBillboardData,
  ...digitalSignageData,
};

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

export default async function DigitalSignageDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ district_id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { district_id } = await params;
  const { tab } = await searchParams;

  let productData: ProductData | null = null;

  // 쇼핑몰(digital-signage) 탭인 경우 데이터베이스에서 가져오기
  if (tab === 'digital-signage') {
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const response = await fetch(
        `${baseUrl}/api/digital-media?action=getProductDetail&productType=digital-signage&productCode=${district_id}`,
        { cache: 'no-store' }
      );

      if (response.ok) {
        const dbDataArray = (await response.json()) as DBProductItem[];

        // 배열로 받은 데이터 처리 (product_group_code로 필터링된 모든 모델)
        if (Array.isArray(dbDataArray) && dbDataArray.length > 0) {
          // 첫 번째 제품의 그룹 정보를 사용
          const firstProduct = dbDataArray[0];

          // image_urls 파싱 처리
          let imageUrls: string[] = [];
          if (Array.isArray(firstProduct.image_urls)) {
            imageUrls = firstProduct.image_urls;
          } else if (typeof firstProduct.image_urls === 'string') {
            try {
              imageUrls = JSON.parse(firstProduct.image_urls);
            } catch {
              imageUrls = [firstProduct.image_urls];
            }
          }

          // product_group_code에 해당하는 이미지 맵에서 가져오기
          const groupCode = firstProduct.product_group_code || district_id;
          const mappedImages = productImageMap[groupCode] || [];

          // 이미지 배열 합치기 (중복 제거)
          const allImages = [
            firstProduct.main_image_url,
            ...imageUrls,
            ...mappedImages,
          ];
          const uniqueImages = Array.from(new Set(allImages.filter(Boolean)));

          // series별로 모델 그룹화 (series 구조로 변환)
          const seriesMap: Record<
            string,
            {
              name: string;
              description: string;
              operatingLineup: string;
              models: Array<{
                modelName: string;
                brand: string;
                inch: string;
                size: string;
                specifications: string;
                resolution: string;
                brightness: string;
                usage: string;
                installation: string;
                vesaHole: string;
                price: string;
                specialFeatures?: string;
              }>;
            }
          > = {};

          dbDataArray.forEach((product: DBProductItem) => {
            const seriesName = product.series_name || 'Default';
            if (!seriesMap[seriesName]) {
              // series 정보 초기화 (첫 번째 모델의 정보 사용)
              seriesMap[seriesName] = {
                name: seriesName,
                description: seriesName, // 기본값, 나중에 업데이트 가능
                operatingLineup: product.operating_lineup || '',
                models: [],
              };
            }

            // 모델 추가 (필수 필드가 비어있으면 기본값 설정)
            seriesMap[seriesName].models.push({
              modelName: product.model_name || '',
              brand: product.brand || '',
              inch: product.inch_size || '',
              size: product.physical_size || '',
              specifications: product.specifications || '',
              resolution: product.resolution || '',
              brightness: product.brightness || '',
              usage: product.usage || '',
              installation: product.installation_method || '',
              vesaHole: product.vesa_hole || '',
              price: product.price || '',
              specialFeatures: product.special_features || undefined,
            });

            // operatingLineup 업데이트 (inch_size들을 모아서)
            if (product.inch_size) {
              const currentLineup = seriesMap[seriesName].operatingLineup;
              if (!currentLineup.includes(product.inch_size)) {
                seriesMap[seriesName].operatingLineup = currentLineup
                  ? `${currentLineup}, ${product.inch_size}`
                  : product.inch_size;
              }
            }
          });

          // series 구조 생성
          const series: Record<
            string,
            {
              name: string;
              description: string;
              operatingLineup: string;
              models: Array<{
                modelName: string;
                brand: string;
                inch: string;
                size: string;
                specifications: string;
                resolution: string;
                brightness: string;
                usage: string;
                installation: string;
                vesaHole: string;
                price: string;
                specialFeatures?: string;
              }>;
            }
          > = {};
          Object.keys(seriesMap).forEach((seriesName) => {
            // series description 업데이트 (첫 번째 모델의 정보 사용)
            const firstModel = seriesMap[seriesName].models[0];
            if (firstModel) {
              seriesMap[seriesName].description = `${seriesName} (${
                firstModel.resolution || ''
              }, ${firstModel.brightness || ''})`;
            }
            series[seriesName] = seriesMap[seriesName];
          });

          // ProductData 형식으로 변환 (series 구조 사용)
          productData = {
            id: groupCode,
            title: firstProduct.title || '',
            image: uniqueImages[0] || firstProduct.main_image_url,
            images:
              uniqueImages.length > 0
                ? uniqueImages
                : [firstProduct.main_image_url],
            modelName: firstProduct.model_name || '',
            description: firstProduct.description || '',
            type: firstProduct.product_type || '',
            contactInfo: firstProduct.contact_info || '',
            bracketNote: firstProduct.bracket_note || '',
            series: series, // series 구조 사용
            specifications: {
              operatingLineup: firstProduct.operating_lineup || '',
              modelName: firstProduct.model_name || '',
              productSize:
                firstProduct.product_size || firstProduct.physical_size || '',
              resolutionBrightness: `${firstProduct.resolution || ''} / ${
                firstProduct.brightness || ''
              }`,
              keyFeatures:
                firstProduct.key_features || firstProduct.specifications || '',
              usage: firstProduct.usage || '',
              installationMethod: firstProduct.installation_method || '',
              inquiry:
                firstProduct.inquiry_phone || firstProduct.contact_info || '',
            },
          };
        }
      }
    } catch (error) {
      console.error('Error fetching product data from API:', error);
      // 에러 발생 시 로컬 데이터로 fallback
      const localData =
        digitalSignageData[district_id as keyof typeof digitalSignageData];
      if (localData) {
        const images = productImageMap[district_id] || [localData.image];
        productData = {
          ...localData,
          images: images,
        };
      }
    }
  } else {
    // 다른 탭인 경우 기존 로직 유지
    const productType =
      tab === 'media-display'
        ? 'media-landscape'
        : tab === 'digital-billboard'
        ? 'digital-billboard'
        : '';

    if (productType) {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const response = await fetch(
          `${baseUrl}/api/digital-media?action=getProductDetail&productType=${productType}&productCode=${district_id}`,
          { cache: 'no-store' }
        );

        if (response.ok) {
          const dbData = await response.json();

          // image_urls 파싱 처리
          let imageUrls: string[] = [];
          if (Array.isArray(dbData.image_urls)) {
            imageUrls = dbData.image_urls;
          } else if (typeof dbData.image_urls === 'string') {
            try {
              imageUrls = JSON.parse(dbData.image_urls);
            } catch {
              imageUrls = [dbData.image_urls];
            }
          }

          // main_image_url과 image_urls 배열을 합쳐서 images 배열 생성 (중복 제거)
          const allImages = [dbData.main_image_url, ...imageUrls];
          const uniqueImages = Array.from(new Set(allImages.filter(Boolean)));

          // DB 데이터를 productData 형식으로 변환
          productData = {
            id:
              dbData.district_code ||
              dbData.project_code ||
              dbData.product_code ||
              district_id,
            title: dbData.title,
            image: dbData.main_image_url,
            images:
              uniqueImages.length > 0 ? uniqueImages : [dbData.main_image_url],
            specifications: {
              operatingLineup: dbData.operating_lineup || '',
              modelName: dbData.model_name || '',
              productSize: dbData.product_size || '',
              resolutionBrightness: dbData.resolution_brightness || '',
              keyFeatures: dbData.key_features || '',
              usage: dbData.usage || '',
              installationMethod: dbData.installation_method || '',
              inquiry: dbData.inquiry_phone || '',
            },
            description: dbData.description || '',
          };
        }
      } catch (error) {
        console.error('Error fetching product data from API:', error);
      }
    }

    // API에서 데이터를 가져오지 못한 경우 로컬 데이터 사용 (fallback)
    if (!productData) {
      productData = productDataMap[district_id as keyof typeof productDataMap];
    }
  }

  if (!productData) {
    return <div>Product not found</div>;
  }

  // 디지털사이니지 아이템인지 확인
  const isDigitalSignageItem = [
    'samsung-single',
    'lg-single',
    'samsung-multivision',
    'samsung-electronic-board',
    'samsung-electronic-board-tray',
    'samsung-electronic-board-bracket',
    'kiosk',
    'multivision-cismate',
    'digital-frame',
    'stand-signage',
    'the-gallery',
    'q-series-stand',
    'q-series-touch',
    'bracket',
    'outdoor-wall',
    'outdoor-stand',
    'led-display',
    'led-controller',
    'led-installation',
  ].includes(district_id);

  // 디지털전광판 아이템인지 확인 (미디어경관디자인과 같은 UI 사용)
  const isDigitalBillboardItem =
    [
      'guro-rodeo',
      'starlight-proposal',
      'byeongjeom-plaza',
      'janghang-lafesta',
      'junggu-yaksu',
      'cheorwon-labor',
    ].includes(district_id) || tab === 'digital-billboard';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const typedProductData = productData as any;

  return (
    <DigitalSignageDetailClient
      productData={typedProductData}
      isDigitalSignage={isDigitalSignageItem}
      isDigitalBillboard={isDigitalBillboardItem}
    />
  );
}
