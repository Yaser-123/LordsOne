import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { bookingCreateSchema } from '@/lib/utils/validation';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    let query = supabase
      .from('bookings')
      .select('*, service:services(*), slot:service_slots(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: bookings, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ bookings: bookings || [] });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = bookingCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid booking data', details: validation.error.format() },
        { status: 400 }
      );
    }

    const {
      service_id,
      slot_id,
      booking_date,
      start_time,
      end_time,
      quantity,
      purpose,
      notes,
    } = validation.data;

    // Call atomic concurrency-safe stored procedure
    const { data: rpcResult, error: rpcError } = await supabase.rpc('create_booking_atomic', {
      p_user_id: user.id,
      p_service_id: service_id,
      p_slot_id: slot_id || null,
      p_booking_date: booking_date,
      p_start_time: start_time,
      p_end_time: end_time,
      p_quantity: quantity,
      p_purpose: purpose,
      p_notes: notes || '',
    });

    if (rpcError) {
      return NextResponse.json({ error: rpcError.message }, { status: 400 });
    }

    return NextResponse.json(rpcResult, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
