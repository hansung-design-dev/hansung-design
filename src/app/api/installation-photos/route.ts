import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';
import { getImagesFromFolder } from '@/src/lib/storage-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const regionGuId = searchParams.get('region_gu_id');
    const limit = searchParams.get('limit') || '20';

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
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    // 특정 구로 필터링
    if (regionGuId) {
      query = query.eq('region_gu_id', regionGuId);
    }

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

    return NextResponse.json({ installation_banners: enhancedBanners });
  } catch (error) {
    console.error('게첨사진 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
