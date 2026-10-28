import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    const serviceId = searchParams.get('service_id');
    const date = searchParams.get('date');

    if (!serviceId || !date) {
      return NextResponse.json(
        { error: 'service_id and date query parameters are required' },
        { status: 400 }
      );
    }

    const { data: slots, error } = await supabase
      .from('service_slots')
      .select('*')
      .eq('service_id', serviceId)
      .eq('slot_date', date)
      .order('start_time', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ slots: slots || [] });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
