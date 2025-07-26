import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const section = searchParams.get('section');

    let query = supabase.from('homepage_contents').select(`
        id,
        page,
        homepage_menu_types,
        title,
        subtitle,
        description,
        main_image_url,
        description_list,
        created_at,
        updated_at,
        homepage_menu_types!homepage_menu_types (
          id,
          name,
          description
        )
      `);

    // 특정 페이지로 필터링
    if (page) {
      query = query.eq('page', page);
    }

    // 특정 섹션으로 필터링 (name으로)
    if (section) {
      query = query.eq('homepage_menu_types.name', section);
    }

    const { data, error } = await query.order('created_at', {
      ascending: true,
    });

    if (error) {
      console.error('Error fetching homepage contents:', error);
      return NextResponse.json(
        { error: 'Failed to fetch homepage contents' },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
