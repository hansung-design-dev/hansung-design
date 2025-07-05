import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('homepage_contents')
      .select(
        `
        id,
        homepage_menu_type,
        title,
        subtitle,
        description,
        main_image_url,
        description_list,
        homepage_menu_types (
          name
        )
      `
      )
      .order('created_at', { ascending: true });

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
