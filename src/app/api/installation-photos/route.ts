import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const regionGuId = searchParams.get('region_gu_id');
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const period = searchParams.get('period');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const offset = (page - 1) * limit;

    // Build query for installed_banner_photos
    let query = supabase
      .from('installed_banner_photos')
      .select(
        `
        *,
        region_gu:region_gu_id (
          id,
          name,
          code
        )
      `
      )
      .order('display_order', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by region
    if (regionGuId) {
      query = query.eq('region_gu_id', regionGuId);
    }

    // Filter by year
    if (year) {
      query = query.eq('year', parseInt(year));
    }

    // Filter by month
    if (month) {
      query = query.eq('month', parseInt(month));
    }

    // Filter by period
    if (period) {
      query = query.eq('period', period);
    }

    // Count query
    let countQuery = supabase
      .from('installed_banner_photos')
      .select('*', { count: 'exact', head: true });

    if (regionGuId) {
      countQuery = countQuery.eq('region_gu_id', regionGuId);
    }
    if (year) {
      countQuery = countQuery.eq('year', parseInt(year));
    }
    if (month) {
      countQuery = countQuery.eq('month', parseInt(month));
    }
    if (period) {
      countQuery = countQuery.eq('period', period);
    }

    const { count: totalCount } = await countQuery;

    const { data: photoGroups, error } = await query;

    if (error) {
      console.error('게첨사진 조회 오류:', error);
      return NextResponse.json(
        { error: '게첨사진 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // Fetch images for each group
    const groupIds = (photoGroups || []).map((g) => g.id);

    const imagesData: Record<string, Array<{
      id: string;
      image_url: string;
      file_name: string;
      sort_order: number;
      panel?: {
        panel_code: number;
        panel_type: string;
        nickname: string;
      };
    }>> = {};

    if (groupIds.length > 0) {
      const { data: images } = await supabase
        .from('installed_banner_photo_images')
        .select(
          `
          id,
          photo_group_id,
          image_url,
          file_name,
          sort_order,
          panel:panel_id (
            panel_code,
            panel_type,
            nickname
          )
        `
        )
        .in('photo_group_id', groupIds)
        .order('sort_order', { ascending: true });

      // Group images by photo_group_id
      (images || []).forEach((img) => {
        if (!imagesData[img.photo_group_id]) {
          imagesData[img.photo_group_id] = [];
        }
        // Handle panel data - Supabase returns object for single FK join
        const panelData = img.panel as unknown as {
          panel_code: number;
          panel_type: string;
          nickname: string;
        } | null;

        imagesData[img.photo_group_id].push({
          id: img.id,
          image_url: img.image_url,
          file_name: img.file_name,
          sort_order: img.sort_order,
          panel: panelData || undefined,
        });
      });
    }

    // Enhance banners with images for backward compatibility
    const enhancedBanners = (photoGroups || []).map((group) => {
      const groupImages = imagesData[group.id] || [];

      return {
        id: group.id,
        region_gu_id: group.region_gu_id,
        title: group.title,
        content: group.content,
        year: group.year,
        month: group.month,
        period: group.period,
        display_order: group.display_order,
        created_at: group.created_at,
        updated_at: group.updated_at,
        region_gu: group.region_gu,
        // For backward compatibility with existing UI
        photo_urls: groupImages.map((img) => img.image_url),
        photo_names: groupImages.map((img) => {
          // Extract number from file name for display
          const match = img.file_name.match(/(\d+)/);
          return match ? match[1] : img.file_name.replace(/\.[^/.]+$/, '');
        }),
        total_images: groupImages.length,
        // New structure with full image data
        images: groupImages,
      };
    });

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
