import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';
import { PublicDesignItem } from '@/src/types/schema';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get('category');
    const year = searchParams.get('year');
    const location = searchParams.get('location');

    let query = supabase
      .from('public_design_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    if (year) {
      query = query.eq('year', parseInt(year));
    }

    if (location) {
      query = query.eq('location', location);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching public design items:', error);
      return NextResponse.json(
        { error: 'Failed to fetch public design items' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/public-design-items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: Omit<PublicDesignItem, 'id' | 'created_at' | 'updated_at'> =
      await request.json();

    // Validate required fields
    if (!body.category || !body.location) {
      return NextResponse.json(
        { error: 'Category and location are required' },
        { status: 400 }
      );
    }

    // Ensure image_urls is an array
    if (!Array.isArray(body.image_urls)) {
      body.image_urls = [];
    }

    // Validate category
    const validCategories = ['간판개선', '공공디자인', '환경개선'];
    if (!validCategories.includes(body.category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    // Validate year for 간판개선 category
    if (body.category === '간판개선' && !body.year) {
      return NextResponse.json(
        { error: 'Year is required for 간판개선 category' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('public_design_items')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('Error creating public design item:', error);
      return NextResponse.json(
        { error: 'Failed to create public design item' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/public-design-items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
