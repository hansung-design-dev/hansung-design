import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';
import { getImagesFromFolder } from '@/src/lib/storage-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const regionGuId = searchParams.get('region_gu_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('installed_banner')
      .select(
        `
               *,
               region_gu (
                 name
               )
             `
      )
      .order('display_order', { ascending: false }) // display_order로 정렬 (6, 5, 4... 순, 최신순)
      .range(offset, offset + limit - 1);

    // 특정 구로 필터링
    if (regionGuId) {
      query = query.eq('region_gu_id', regionGuId);
    }

    // 전체 개수를 가져오는 쿼리
    const countQuery = supabase
      .from('installed_banner')
      .select('*', { count: 'exact', head: true });

    if (regionGuId) {
      countQuery.eq('region_gu_id', regionGuId);
    }

    const { count: totalCount } = await countQuery;

    const { data: installation_banners, error } = await query;

    if (error) {
      console.error('게첨사진 조회 오류:', error);
      return NextResponse.json(
        { error: '게첨사진 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // 폴더에서 이미지를 자동으로 가져와서 응답에 포함
    const enhancedBanners = await Promise.all(
      (installation_banners || []).map(async (banner) => {
        try {
          // 폴더에서 이미지 가져오기
          const images = await getImagesFromFolder(banner.folder_path);

          return {
            ...banner,
            photo_urls: images.map((img) => img.url), // 프론트엔드 호환성을 위해 photo_urls 포함
            photo_names: images.map((img) => img.displayName), // 표시용 이름 (번호만)
            total_images: images.length,
          };
        } catch (error) {
          console.error(`Error loading images for banner ${banner.id}:`, error);
          return {
            ...banner,
            photo_urls: [], // 에러 시 빈 배열
            total_images: 0,
          };
        }
      })
    );

    return NextResponse.json({
      installation_banners: enhancedBanners,
      pagination: {
        current_page: page,
        total_pages: Math.ceil((totalCount || 0) / limit),
        total_count: totalCount || 0,
        limit: limit,
        has_next: page < Math.ceil((totalCount || 0) / limit),
        has_prev: page > 1,
      },
    });
  } catch (error) {
    console.error('게첨사진 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
