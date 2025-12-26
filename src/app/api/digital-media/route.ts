import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

// 미디어 경관 디스플레이 조회
async function getMediaLandscapeDisplays() {
  try {
    // media_landscape_displays 테이블이 없으므로 digital_media_billboards 테이블 사용
    const { data, error } = await supabase
      .from('digital_media_billboards')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching media landscape displays:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getMediaLandscapeDisplays:', error);
    throw error;
  }
}

// 디지털 전광판 조회
async function getDigitalBillboards() {
  try {
    // digital_media_billboards 테이블 사용 (실제 디지털 전광판 데이터)
    const { data, error } = await supabase
      .from('digital_media_billboards')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching digital billboards:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getDigitalBillboards:', error);
    throw error;
  }
}

// 디지털 제품 목록 조회 (digital_products 테이블에서 product_group_code별로 그룹화)
async function getDigitalProducts() {
  try {
    const { data, error } = await supabase
      .from('digital_products')
      .select('*')
      .eq('is_active', true)
      .not('product_group_code', 'is', null)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching digital products:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    // product_group_code별로 그룹화
interface ProductItem {
  id?: string;
  product_group_code: string | null;
  display_order: number | null;
      product_code?: string;
      title?: string;
      main_image_url?: string;
      image_urls?: string[] | string;
      product_type?: string;
      series_name?: string;
      model_name?: string;
      description?: string;
      contact_info?: string;
      bracket_note?: string;
    }
    const groupedProducts: Record<string, ProductItem> = {};

    data.forEach((product) => {
      const groupCode = product.product_group_code;
      if (!groupCode) return;

      // 각 그룹의 첫 번째 제품 정보를 사용 (display_order가 가장 낮은 것)
      if (!groupedProducts[groupCode]) {
        groupedProducts[groupCode] = product;
      } else {
        // display_order가 더 낮은 제품이 있으면 교체
        if (
          (product.display_order || 0) <
          (groupedProducts[groupCode].display_order || 0)
        ) {
          groupedProducts[groupCode] = product;
        }
      }
    });

    // 그룹화된 제품들을 배열로 변환
    const result = Object.values(groupedProducts).map((product) => {
      // image_urls 파싱 처리
      let imageUrls: string[] = [];
      if (Array.isArray(product.image_urls)) {
        imageUrls = product.image_urls;
      } else if (typeof product.image_urls === 'string') {
        try {
          imageUrls = JSON.parse(product.image_urls);
        } catch {
          if (product.image_urls) {
            imageUrls = [product.image_urls];
          }
        }
      }

    return {
      id: product.product_group_code, // 그룹 코드를 id로 사용
      product_uuid: product.id,
        product_code: product.product_code,
        product_group_code: product.product_group_code,
        title: product.title,
        main_image_url: product.main_image_url,
        image_urls: imageUrls,
        product_type: product.product_type,
        series_name: product.series_name,
        model_name: product.model_name,
        description: product.description,
        contact_info: product.contact_info,
        bracket_note: product.bracket_note,
        display_order: product.display_order,
      };
    });

    // display_order로 정렬
    result.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

    return result;
  } catch (error) {
    console.error('Error in getDigitalProducts:', error);
    throw error;
  }
}

// 디지털 사이니지 목록 조회 (digital_media_signages 테이블)
async function getDigitalSignages() {
  try {
    const { data, error } = await supabase
      .from('digital_media_signages')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching digital media signages:', error);
      throw error;
    }

    interface DigitalMediaSignageRow {
      id?: string;
      district_code?: string;
      title?: string;
      main_image_url?: string;
      image_urls?: string[] | string;
      display_order?: number;
      [key: string]: unknown;
    }

    const result = ((data || []) as DigitalMediaSignageRow[]).map(
      (row: DigitalMediaSignageRow) => {
        let imageUrls: string[] = [];
        if (Array.isArray(row.image_urls)) imageUrls = row.image_urls;
        else if (typeof row.image_urls === 'string') {
          try {
            imageUrls = JSON.parse(row.image_urls);
          } catch {
            imageUrls = row.image_urls ? [row.image_urls] : [];
          }
        }
        return { ...row, image_urls: imageUrls };
      }
    );

    return result;
  } catch (error) {
    console.error('Error in getDigitalSignages:', error);
    throw error;
  }
}

// 특정 제품 상세 정보 조회
async function getProductByCode(productType: string, productCode: string) {
  try {
    // productType을 테이블 이름 기반으로 처리
    // digital_media_billboards, digital_media_signages, digital_products
    if (productType === 'digital_media_billboards') {
      // digital_media_billboards 테이블에서 project_code 또는 district_code로 조회
      let { data, error } = await supabase
        .from('digital_media_billboards')
        .select('*')
        .eq('project_code', productCode)
        .eq('is_active', true)
        .maybeSingle();

      // project_code로 못 찾으면 district_code로 재시도
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
        console.error(`Error fetching ${productType}:`, error);
        throw error;
      }

      if (!data) {
        console.log(
          `No data found for ${productType} with project_code or district_code:`,
          productCode
        );
      }

      return data;
    }

    if (productType === 'digital_media_signages') {
      // digital_media_signages 테이블에서 district_code로 조회
      console.log(
        '🔍 Searching digital_media_signages with district_code:',
        productCode
      );
      const { data: signageData, error: signageError } = await supabase
        .from('digital_media_signages')
        .select('*')
        .eq('district_code', productCode)
        .eq('is_active', true)
        .maybeSingle();

      console.log('📊 digital_media_signages result:', {
        found: !!signageData,
        error: signageError?.message,
        data: signageData
          ? {
              id: signageData.id,
              district_code: signageData.district_code,
              title: signageData.title,
            }
          : null,
      });

      if (signageError) {
        console.error(`Error fetching ${productType}:`, signageError);
        throw signageError;
      }

      // Normalize image_urls to string[]
      if (signageData) {
        const raw = (signageData as unknown as { image_urls?: unknown })
          .image_urls;
        let imageUrls: string[] = [];
        if (Array.isArray(raw)) {
          // Already an array
          imageUrls = raw.filter((x): x is string => typeof x === 'string');
        } else if (typeof raw === 'string') {
          // Try JSON parse first
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              imageUrls = parsed.filter(
                (x): x is string => typeof x === 'string'
              );
            }
          } catch {
            // Fallback for Postgres array literal format: {"a","b"}
            const trimmed = raw.trim();
            if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
              const inner = trimmed.slice(1, -1);
              imageUrls = inner
                .split(',')
                .map((s) => s.trim())
                .map((s) => s.replace(/^"|"$/g, ''))
                .filter(Boolean);
            } else if (trimmed) {
              imageUrls = [trimmed];
            }
          }
        }

        (signageData as unknown as { image_urls?: string[] }).image_urls =
          imageUrls;
      }

      return signageData;
    }

    if (productType === 'digital_products') {
      // digital_products 테이블에서 product_group_code로 조회
      const { data, error } = await supabase
        .from('digital_products')
        .select('*')
        .eq('product_group_code', productCode)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error(`Error fetching ${productType}:`, error);
        throw error;
      }

      // product_group_code로 그룹화된 모든 제품 반환
      return data || [];
    }

    // 하위 호환성을 위한 레거시 타입 처리
    if (
      productType === 'media-landscape' ||
      productType === 'digital-billboard'
    ) {
      // digital_media_billboards 테이블에서 project_code로 조회
      const { data, error } = await supabase
        .from('digital_media_billboards')
        .select('*')
        .eq('project_code', productCode)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error(`Error fetching ${productType}:`, error);
        throw error;
      }

      return data;
    }

    if (productType === 'digital-signage') {
      // 레거시 지원: digital-signage는 digital_media_signages에서 조회
      const { data: signageData, error: signageError } = await supabase
        .from('digital_media_signages')
        .select('*')
        .eq('district_code', productCode)
        .eq('is_active', true)
        .maybeSingle();

      if (!signageError && signageData) {
        return signageData;
      }

      // digital_media_signages에서 찾지 못한 경우 digital_products에서 조회
      const { data, error } = await supabase
        .from('digital_products')
        .select('*')
        .eq('product_group_code', productCode)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error(`Error fetching ${productType}:`, error);
        throw error;
      }

      return data || [];
    }

    // 위에서 처리되지 않은 타입은 에러
    throw new Error(`Invalid product type: ${productType}`);
  } catch (error) {
    console.error(`Error in getProductByCode for ${productType}:`, error);
    throw error;
  }
}

// GET 요청 처리
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const productType = searchParams.get('productType');
  const productCode = searchParams.get('productCode');

  console.log('🔍 Digital Media API called with action:', action);

  try {
    switch (action) {
      case 'getMediaLandscape':
        const mediaLandscapeData = await getMediaLandscapeDisplays();
        return NextResponse.json(mediaLandscapeData);

      case 'getDigitalBillboards':
        const billboardData = await getDigitalBillboards();
        return NextResponse.json(billboardData);

      case 'getDigitalSignage':
        // 디지털사이니지 = digital_media_signages
        const signageData = await getDigitalSignages();
        return NextResponse.json(signageData);
      case 'getDigitalProducts':
        // 상품 = digital_products (grouped)
        const products = await getDigitalProducts();
        return NextResponse.json(products);

      case 'getProductDetail':
        if (!productType || !productCode) {
          return NextResponse.json(
            { success: false, error: 'Missing productType or productCode' },
            { status: 400 }
          );
        }
        const productData = await getProductByCode(productType, productCode);
        return NextResponse.json(productData);

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ Digital Media API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
