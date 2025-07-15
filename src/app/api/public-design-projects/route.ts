import { supabase } from '@/src/app/api/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { data: projects, error } = await supabase
      .from('public_design_contents')
      .select('*')
      .eq('design_contents_type', 'list')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching public design projects:', error);
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
