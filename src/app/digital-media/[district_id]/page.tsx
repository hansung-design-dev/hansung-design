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

// 제품 데이터 매핑 (digital-signage 탭의 fallback에서 사용)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // 디지털 전광판 아이템 ID 목록 (digital_media_billboards 테이블의 district_code 또는 project_code)
  const digitalBillboardIds = [
    'starlight-proposal',
    'byeongjeom-plaza',
    'janghang-lafesta',
    'junggu-yaksu',
    'cheorwon-labor',
  ];

  // 디지털 사이니지 아이템 ID 목록
  // - digital_products 테이블의 product_group_code
  // - digital_media_signages 테이블의 district_code
  const digitalSignageIds = [
    'guro-rodeo', // digital_media_signages 테이블에 있음
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
  ];

  // district_id를 기반으로 자동 판단 (우선순위가 가장 높음)
  const isDigitalBillboard = digitalBillboardIds.includes(district_id);
  const isDigitalSignage = digitalSignageIds.includes(district_id);
  const isMediaDisplay = !isDigitalBillboard && !isDigitalSignage;

  // 우선순위: district_id 기반 판단 > tab 파라미터
  // 1. 디지털 전광판 아이템이면 무조건 전광판 처리
  if (isDigitalBillboard) {
    // 디지털 전광판 처리
    const productType = 'digital-billboard';
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const apiUrl = `${baseUrl}/api/digital-media?action=getProductDetail&productType=${productType}&productCode=${district_id}`;
      console.log('🔍 Fetching product detail (digital-billboard):', {
        productType,
        district_id,
        apiUrl,
      });
      const response = await fetch(apiUrl, { cache: 'no-store' });

      if (response.ok) {
        const responseData = await response.json();

        // API 응답이 배열인 경우 첫 번째 요소 사용, 단일 객체인 경우 그대로 사용
        const dbData = Array.isArray(responseData)
          ? responseData[0]
          : responseData;

        if (!dbData) {
          console.error('❌ No data returned from API for:', {
            productType,
            district_id,
          });
          return;
        }

        console.log('✅ API response received (digital-billboard):', {
          title: dbData.title,
          main_image_url: dbData.main_image_url,
          image_urls_type: typeof dbData.image_urls,
          image_urls: dbData.image_urls,
        });

        // image_urls 파싱 처리 (JSON 문자열 또는 배열)
        let imageUrls: string[] = [];
        if (Array.isArray(dbData.image_urls)) {
          imageUrls = dbData.image_urls;
        } else if (typeof dbData.image_urls === 'string') {
          try {
            const parsed = JSON.parse(dbData.image_urls);
            imageUrls = Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            // JSON 파싱 실패 시 단일 문자열로 처리
            if (dbData.image_urls) {
              imageUrls = [dbData.image_urls];
            }
          }
        }

        // main_image_url과 image_urls 배열을 합쳐서 images 배열 생성 (중복 제거)
        const allImages = [dbData.main_image_url, ...imageUrls].filter(
          (url): url is string => Boolean(url) && typeof url === 'string'
        );
        const uniqueImages = Array.from(new Set(allImages));

        // DB 데이터를 productData 형식으로 변환
        productData = {
          id:
            dbData.district_code ||
            dbData.project_code ||
            dbData.product_code ||
            district_id,
          title: dbData.title || '',
          image: dbData.main_image_url || '',
          images:
            uniqueImages.length > 0
              ? uniqueImages
              : [dbData.main_image_url || ''],
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
      console.error(
        'Error fetching product data from API (digital-billboard):',
        error
      );
    }

    if (!productData) {
      console.error(
        `Failed to fetch product data for ${district_id} (detected as digital-billboard)`
      );
    }
  } else if (
    isDigitalSignage ||
    tab === 'digital-signage' ||
    tab === 'digital_media_signages'
  ) {
    // 디지털 사이니지 처리
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const response = await fetch(
        `${baseUrl}/api/digital-media?action=getProductDetail&productType=digital-signage&productCode=${district_id}`,
        { cache: 'no-store' }
      );

      if (response.ok) {
        const responseData = await response.json();

        // digital_media_signages는 단일 객체, digital_products는 배열 반환 가능
        const dbDataArray = Array.isArray(responseData)
          ? responseData
          : [responseData];
        const firstProduct = dbDataArray[0];

        // 배열 또는 단일 객체로 받은 데이터 처리
        if (firstProduct) {
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

          // product_group_code 또는 district_code에 해당하는 이미지 맵에서 가져오기
          const groupCode =
            firstProduct.product_group_code ||
            firstProduct.district_code ||
            district_id;
          const mappedImages = productImageMap[groupCode] || [];

          // 이미지 배열 합치기 (중복 제거)
          const allImages = [
            firstProduct.main_image_url,
            ...imageUrls,
            ...mappedImages,
          ];
          const uniqueImages = Array.from(new Set(allImages.filter(Boolean)));

          // digital_media_signages는 단일 객체이므로 series 구조가 없음
          // digital_products는 배열이므로 series 구조 생성
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

          // digital_products인 경우에만 series 구조 생성 (배열일 때)
          if (Array.isArray(responseData) && responseData.length > 1) {
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
          }

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
      console.error(
        'Error fetching product data from API (digital-signage):',
        error
      );
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
  } else if (isMediaDisplay || tab === 'media-display') {
    // 미디어경관디자인 처리
    const productType = 'media-landscape';

    if (productType) {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const apiUrl = `${baseUrl}/api/digital-media?action=getProductDetail&productType=${productType}&productCode=${district_id}`;
        console.log('🔍 Fetching product detail:', {
          productType,
          district_id,
          apiUrl,
        });
        const response = await fetch(apiUrl, { cache: 'no-store' });

        if (response.ok) {
          const responseData = await response.json();

          // API 응답이 배열인 경우 첫 번째 요소 사용, 단일 객체인 경우 그대로 사용
          const dbData = Array.isArray(responseData)
            ? responseData[0]
            : responseData;

          if (!dbData) {
            console.error('❌ No data returned from API for:', {
              productType,
              district_id,
            });
            return;
          }

          console.log('✅ API response received:', {
            title: dbData.title,
            main_image_url: dbData.main_image_url,
            image_urls_type: typeof dbData.image_urls,
            image_urls: dbData.image_urls,
          });

          // image_urls 파싱 처리 (JSON 문자열 또는 배열)
          let imageUrls: string[] = [];
          if (Array.isArray(dbData.image_urls)) {
            imageUrls = dbData.image_urls;
          } else if (typeof dbData.image_urls === 'string') {
            try {
              const parsed = JSON.parse(dbData.image_urls);
              imageUrls = Array.isArray(parsed) ? parsed : [parsed];
            } catch {
              // JSON 파싱 실패 시 단일 문자열로 처리
              if (dbData.image_urls) {
                imageUrls = [dbData.image_urls];
              }
            }
          }

          // main_image_url과 image_urls 배열을 합쳐서 images 배열 생성 (중복 제거)
          const allImages = [dbData.main_image_url, ...imageUrls].filter(
            (url): url is string => Boolean(url) && typeof url === 'string'
          );
          const uniqueImages = Array.from(new Set(allImages));

          // DB 데이터를 productData 형식으로 변환
          productData = {
            id:
              dbData.district_code ||
              dbData.project_code ||
              dbData.product_code ||
              district_id,
            title: dbData.title || '',
            image: dbData.main_image_url || '',
            images:
              uniqueImages.length > 0
                ? uniqueImages
                : [dbData.main_image_url || ''],
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

    // API에서 데이터를 가져오지 못한 경우 에러 로그만 남김
    // DB 데이터를 우선 사용하므로 로컬 데이터 fallback 제거
    if (!productData) {
      console.error(
        `Failed to fetch product data for ${district_id} with tab ${tab} (detected as digital-billboard)`
      );
    }
  } else if (isMediaDisplay || tab === 'media-display') {
    // 미디어경관디자인 처리
    const productType = 'media-landscape';

    if (productType) {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const apiUrl = `${baseUrl}/api/digital-media?action=getProductDetail&productType=${productType}&productCode=${district_id}`;
        console.log('🔍 Fetching product detail:', {
          productType,
          district_id,
          apiUrl,
        });
        const response = await fetch(apiUrl, { cache: 'no-store' });

        if (response.ok) {
          const responseData = await response.json();

          // API 응답이 배열인 경우 첫 번째 요소 사용, 단일 객체인 경우 그대로 사용
          const dbData = Array.isArray(responseData)
            ? responseData[0]
            : responseData;

          if (!dbData) {
            console.error('❌ No data returned from API for:', {
              productType,
              district_id,
            });
            return;
          }

          console.log('✅ API response received:', {
            title: dbData.title,
            main_image_url: dbData.main_image_url,
            image_urls_type: typeof dbData.image_urls,
            image_urls: dbData.image_urls,
          });

          // image_urls 파싱 처리 (JSON 문자열 또는 배열)
          let imageUrls: string[] = [];
          if (Array.isArray(dbData.image_urls)) {
            imageUrls = dbData.image_urls;
          } else if (typeof dbData.image_urls === 'string') {
            try {
              const parsed = JSON.parse(dbData.image_urls);
              imageUrls = Array.isArray(parsed) ? parsed : [parsed];
            } catch {
              // JSON 파싱 실패 시 단일 문자열로 처리
              if (dbData.image_urls) {
                imageUrls = [dbData.image_urls];
              }
            }
          }

          // main_image_url과 image_urls 배열을 합쳐서 images 배열 생성 (중복 제거)
          const allImages = [dbData.main_image_url, ...imageUrls].filter(
            (url): url is string => Boolean(url) && typeof url === 'string'
          );
          const uniqueImages = Array.from(new Set(allImages));

          // DB 데이터를 productData 형식으로 변환
          productData = {
            id:
              dbData.district_code ||
              dbData.project_code ||
              dbData.product_code ||
              district_id,
            title: dbData.title || '',
            image: dbData.main_image_url || '',
            images:
              uniqueImages.length > 0
                ? uniqueImages
                : [dbData.main_image_url || ''],
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

    if (!productData) {
      console.error(
        `Failed to fetch product data for ${district_id} with tab ${tab} (detected as media-display)`
      );
    }
  }

  if (!productData) {
    return <div>Product not found</div>;
  }

  // 디지털사이니지 아이템인지 확인
  const isDigitalSignageItem = isDigitalSignage;

  // 디지털전광판 아이템인지 확인 (미디어경관디자인과 같은 UI 사용)
  const isDigitalBillboardItem = isDigitalBillboard;

  // 쇼핑몰(digital_products) 탭 여부 확인
  const isShoppingMall =
    tab === 'digital_products' || tab === 'digital-products';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const typedProductData = productData as any;

  return (
    <DigitalSignageDetailClient
      productData={typedProductData}
      isDigitalSignage={isDigitalSignageItem}
      isDigitalBillboard={isDigitalBillboardItem}
      isShoppingMall={isShoppingMall}
    />
  );
}
