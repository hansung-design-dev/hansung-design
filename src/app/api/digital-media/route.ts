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

// 디지털 사이니지 제품 조회 (digital_products 테이블에서 product_group_code별로 그룹화)
async function getDigitalSignageProducts() {
  try {
    const { data, error } = await supabase
      .from('digital_products')
      .select('*')
      .eq('is_active', true)
      .not('product_group_code', 'is', null)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching digital signage products:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    // product_group_code별로 그룹화
    const groupedProducts: Record<string, any> = {};

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
    console.error('Error in getDigitalSignageProducts:', error);
    throw error;
  }
}

// 특정 제품 상세 정보 조회
async function getProductByCode(productType: string, productCode: string) {
  try {
    let tableName = '';

    switch (productType) {
      case 'media-landscape':
        // media_landscape_displays 테이블이 없으므로 digital_media_billboards 사용
        tableName = 'digital_media_billboards';
        break;
      case 'digital-billboard':
        // 실제 디지털 전광판 데이터는 digital_media_billboards 테이블에 있음
        tableName = 'digital_media_billboards';
        break;
      case 'digital-signage':
        tableName = 'digital_products';
        break;
      default:
        throw new Error('Invalid product type');
    }

    let codeColumn = '';
    switch (productType) {
      case 'media-landscape':
        codeColumn = 'project_code';
        break;
      case 'digital-billboard':
        // digital_media_billboards 테이블은 project_code 또는 district_code를 사용할 수 있음
        // 먼저 project_code로 시도하고, 없으면 district_code로 시도
        codeColumn = 'project_code';
        break;
      case 'digital-signage':
        // digital_products 테이블은 product_group_code를 사용
        codeColumn = 'product_group_code';
        break;
    }

    // digital-billboard 타입의 경우 project_code 또는 district_code로 조회 시도
    if (productType === 'digital-billboard') {
      // 먼저 project_code로 시도
      let { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('project_code', productCode)
        .eq('is_active', true)
        .maybeSingle();

      // project_code로 찾지 못한 경우 district_code로 시도
      if (error || !data) {
        const { data: districtData, error: districtError } = await supabase
          .from(tableName)
          .select('*')
          .eq('district_code', productCode)
          .eq('is_active', true)
          .maybeSingle();

        if (districtError) {
          console.error(`Error fetching ${productType}:`, districtError);
          throw districtError;
        }

        if (districtData) {
          return districtData;
        }
      }

      if (error) {
        console.error(`Error fetching ${productType}:`, error);
        throw error;
      }

      return data;
    }

    // digital-signage 타입인 경우 product_group_code로 필터링
    if (productType === 'digital-signage') {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq(codeColumn, productCode)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error(`Error fetching ${productType}:`, error);
        throw error;
      }

      // product_group_code로 그룹화된 모든 제품 반환
      return data || [];
    }

    // 다른 타입의 경우 기존 로직 유지
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq(codeColumn, productCode)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error(`Error fetching ${productType}:`, error);
      throw error;
    }

    return data;
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
        const signageData = await getDigitalSignageProducts();
        return NextResponse.json(signageData);

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
