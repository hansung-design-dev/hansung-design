import DigitalSignageDetailClient from './DigitalSignageDetailClient';
import { mediaDisplayData } from './data/mediaDisplayData';
import { digitalBillboardData } from './data/digitalBillboardData';
import { digitalSignageData } from './data/digitalSignageData';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 생성 (서버 컴포넌트용)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getSupabaseClient() {
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials not configured');
    return null;
  }
  return createClient(supabaseUrl, supabaseKey);
}

// DB에서 직접 제품 데이터 조회
async function getProductFromDB(productType: string, productCode: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    if (productType === 'digital_media_billboards') {
      // project_code 또는 district_code로 조회
      let { data, error } = await supabase
        .from('digital_media_billboards')
        .select('*')
        .eq('project_code', productCode)
        .eq('is_active', true)
        .maybeSingle();

      if (!data && !error) {
        const retryResult = await supabase
          .from('digital_media_billboards')
          .select('*')
          .eq('district_code', productCode)
          .eq('is_active', true)
          .maybeSingle();
        data = retryResult.data;
        error = retryResult.error;
      }

      if (error) {
        console.error('Error fetching digital_media_billboards:', error);
        return null;
      }
      return data;
    }

    if (productType === 'digital_media_signages') {
      const { data, error } = await supabase
        .from('digital_media_signages')
        .select('*')
        .eq('district_code', productCode)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching digital_media_signages:', error);
        return null;
      }

      // image_urls 정규화
      if (data) {
        const raw = data.image_urls;
        let imageUrls: string[] = [];
        if (Array.isArray(raw)) {
          imageUrls = raw.filter((x: unknown): x is string => typeof x === 'string');
        } else if (typeof raw === 'string') {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              imageUrls = parsed.filter((x: unknown): x is string => typeof x === 'string');
            }
          } catch {
            const trimmed = raw.trim();
            if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
              const inner = trimmed.slice(1, -1);
              imageUrls = inner.split(',').map((s: string) => s.trim()).map((s: string) => s.replace(/^"|"$/g, '')).filter(Boolean);
            } else if (trimmed) {
              imageUrls = [trimmed];
            }
          }
        }
        data.image_urls = imageUrls;
      }
      return data;
    }

    if (productType === 'digital_products') {
      const { data, error } = await supabase
        .from('digital_products')
        .select('*')
        .eq('product_group_code', productCode)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching digital_products:', error);
        return null;
      }
      return data || [];
    }

    // 레거시 타입 지원
    if (productType === 'media-landscape' || productType === 'digital-billboard') {
      const { data, error } = await supabase
        .from('digital_media_billboards')
        .select('*')
        .eq('project_code', productCode)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching media-landscape:', error);
        return null;
      }
      return data;
    }

    return null;
  } catch (error) {
    console.error('Error in getProductFromDB:', error);
    return null;
  }
}

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

  // digital_media_billboards 테이블 아이템 ID 목록 (project_code 사용)
  // 실제 DB에 있는 데이터만 포함
  const digitalBillboardIds: string[] = [
    // digital_media_billboards 테이블에 실제로 있는 project_code들
  ];

  // digital_media_signages 테이블 아이템 ID 목록 (district_code 사용)
  const digitalMediaSignageIds = [
    'guro-rodeo',
    'starlight-proposal',
    'cheorwon-labor',
    'junggu-yaksu',
    'byeongjeom-plaza',
    'janghang-lafesta',
  ];

  // digital_products 테이블 아이템 ID 목록 (product_group_code 사용)
  const digitalProductsIds = [
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
  const isDigitalMediaSignage = digitalMediaSignageIds.includes(district_id);
  const isDigitalProduct = digitalProductsIds.includes(district_id);
  // tab 파라미터도 고려하여 isMediaDisplay 결정
  const isMediaDisplay =
    !isDigitalBillboard &&
    !isDigitalMediaSignage &&
    !isDigitalProduct &&
    tab !== 'digital_media_billboards' &&
    tab !== 'digital_media_signages' &&
    tab !== 'digital_products';

  // 우선순위: district_id 기반 판단 > tab 파라미터
  // 1. digital_media_billboards 테이블 아이템 처리
  if (isDigitalBillboard || tab === 'digital_media_billboards') {
    // digital_media_billboards 처리 - 직접 DB 조회
    console.log('🔍 Fetching product detail (digital_media_billboards):', {
      district_id,
    });

    const dbData = await getProductFromDB('digital_media_billboards', district_id);

    if (dbData) {
      console.log('✅ DB data received (digital_media_billboards):', {
        title: dbData.title,
        main_image_url: dbData.main_image_url,
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
    } else {
      console.error(
        `Failed to fetch product data for ${district_id} (detected as digital_media_billboards)`
      );
    }
  } else if (isDigitalMediaSignage || tab === 'digital_media_signages') {
    // digital_media_signages 테이블 처리 - 직접 DB 조회
    console.log('🔍 Fetching digital_media_signages detail:', { district_id });

    const dbData = await getProductFromDB('digital_media_signages', district_id);

    if (dbData) {
      console.log('✅ DB data received (digital_media_signages):', {
        title: dbData.title,
        district_code: dbData.district_code,
      });

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

      const groupCode = dbData.district_code || district_id;
      const mappedImages = productImageMap[groupCode] || [];

      const allImages = [dbData.main_image_url, ...imageUrls, ...mappedImages];
      const uniqueImages = Array.from(new Set(allImages.filter(Boolean)));

      productData = {
        id: groupCode,
        title: dbData.title || '',
        image: uniqueImages[0] || dbData.main_image_url,
        images: uniqueImages.length > 0 ? uniqueImages : [dbData.main_image_url],
        modelName: dbData.model_name || '',
        description: dbData.description || '',
        type: dbData.product_type || '',
        contactInfo: dbData.contact_info || '',
        bracketNote: dbData.bracket_note || '',
        series: {},
        specifications: {
          operatingLineup: dbData.operating_lineup || '',
          modelName: dbData.model_name || '',
          productSize: dbData.product_size || dbData.physical_size || '',
          resolutionBrightness: `${dbData.resolution || ''} / ${dbData.brightness || ''}`,
          keyFeatures: dbData.key_features || dbData.specifications || '',
          usage: dbData.usage || '',
          installationMethod: dbData.installation_method || '',
          inquiry: dbData.inquiry_phone || dbData.contact_info || '',
        },
      };
    } else {
      console.error('❌ No product data found for:', { district_id });
    }
  } else if (isDigitalProduct || tab === 'digital_products') {
    // digital_products 테이블 처리 (쇼핑몰) - 직접 DB 조회
    console.log('🔍 Fetching digital_products detail:', { district_id });

    const responseData = await getProductFromDB('digital_products', district_id);

    if (responseData && Array.isArray(responseData) && responseData.length > 0) {
      const dbDataArray = responseData;
      const firstProduct = dbDataArray[0];

      console.log('✅ DB data received (digital_products):', {
        count: dbDataArray.length,
        title: firstProduct.title,
      });

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

      const groupCode = firstProduct.product_group_code || firstProduct.district_code || district_id;
      const mappedImages = productImageMap[groupCode] || [];

      const allImages = [firstProduct.main_image_url, ...imageUrls, ...mappedImages];
      const uniqueImages = Array.from(new Set(allImages.filter(Boolean)));

      // digital_products는 배열이므로 series 구조 생성
      const series: Record<string, {
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
      }> = {};

      if (dbDataArray.length > 1) {
        const seriesMap: Record<string, {
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
        }> = {};

        dbDataArray.forEach((product: DBProductItem) => {
          const seriesName = product.series_name || 'Default';
          if (!seriesMap[seriesName]) {
            seriesMap[seriesName] = {
              name: seriesName,
              description: seriesName,
              operatingLineup: product.operating_lineup || '',
              models: [],
            };
          }

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

          if (product.inch_size) {
            const currentLineup = seriesMap[seriesName].operatingLineup;
            if (!currentLineup.includes(product.inch_size)) {
              seriesMap[seriesName].operatingLineup = currentLineup
                ? `${currentLineup}, ${product.inch_size}`
                : product.inch_size;
            }
          }
        });

        Object.keys(seriesMap).forEach((seriesName) => {
          const firstModel = seriesMap[seriesName].models[0];
          if (firstModel) {
            seriesMap[seriesName].description = `${seriesName} (${firstModel.resolution || ''}, ${firstModel.brightness || ''})`;
          }
          series[seriesName] = seriesMap[seriesName];
        });
      }

      productData = {
        id: groupCode,
        title: firstProduct.title || '',
        image: uniqueImages[0] || firstProduct.main_image_url,
        images: uniqueImages.length > 0 ? uniqueImages : [firstProduct.main_image_url],
        modelName: firstProduct.model_name || '',
        description: firstProduct.description || '',
        type: firstProduct.product_type || '',
        contactInfo: firstProduct.contact_info || '',
        bracketNote: firstProduct.bracket_note || '',
        series: series,
        specifications: {
          operatingLineup: firstProduct.operating_lineup || '',
          modelName: firstProduct.model_name || '',
          productSize: firstProduct.product_size || firstProduct.physical_size || '',
          resolutionBrightness: `${firstProduct.resolution || ''} / ${firstProduct.brightness || ''}`,
          keyFeatures: firstProduct.key_features || firstProduct.specifications || '',
          usage: firstProduct.usage || '',
          installationMethod: firstProduct.installation_method || '',
          inquiry: firstProduct.inquiry_phone || firstProduct.contact_info || '',
        },
      };
    } else {
      console.error('❌ No product data found for:', { district_id });
    }
  } else if (isMediaDisplay || tab === 'media-display') {
    // 미디어경관디자인 처리 - 직접 DB 조회
    console.log('🔍 Fetching media-landscape detail:', { district_id });

    const dbData = await getProductFromDB('media-landscape', district_id);

    if (dbData) {
      console.log('✅ DB data received (media-landscape):', {
        title: dbData.title,
        main_image_url: dbData.main_image_url,
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
          if (dbData.image_urls) {
            imageUrls = [dbData.image_urls];
          }
        }
      }

      const allImages = [dbData.main_image_url, ...imageUrls].filter(
        (url): url is string => Boolean(url) && typeof url === 'string'
      );
      const uniqueImages = Array.from(new Set(allImages));

      productData = {
        id: dbData.district_code || dbData.project_code || dbData.product_code || district_id,
        title: dbData.title || '',
        image: dbData.main_image_url || '',
        images: uniqueImages.length > 0 ? uniqueImages : [dbData.main_image_url || ''],
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
    } else {
      console.error(`Failed to fetch product data for ${district_id} (detected as media-display)`);
    }
  }

  if (!productData) {
    return <div>Product not found</div>;
  }

  // digital_media_signages 아이템인지 확인
  const isDigitalSignageItem = isDigitalMediaSignage;

  // digital_media_billboards 아이템인지 확인 (미디어경관디자인과 같은 UI 사용)
  const isDigitalBillboardItem = isDigitalBillboard;

  // 쇼핑몰(digital_products) 탭 여부 확인
  const isShoppingMall = tab === 'digital_products' || isDigitalProduct;

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
