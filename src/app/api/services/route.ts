import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const isFree = searchParams.get('free');
    const sort = searchParams.get('sort') || 'title_asc';

    let query = supabase
      .from('services')
      .select('*')
      .eq('is_active', true);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`);
    }

    if (isFree === 'true') {
      query = query.eq('price', 0);
    }

    // Sorting
    if (sort === 'price_asc') {
      query = query.order('price', { ascending: true });
    } else if (sort === 'price_desc') {
      query = query.order('price', { ascending: false });
    } else if (sort === 'capacity_desc') {
      query = query.order('capacity', { ascending: false });
    } else {
      query = query.order('title', { ascending: true });
    }

    const { data: services, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ services: services || [] });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
