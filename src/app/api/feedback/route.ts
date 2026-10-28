import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { feedbackSchema } from '@/lib/utils/validation';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const serviceId = searchParams.get('service_id');

    let query = supabase
      .from('feedback')
      .select('*, profile:profiles(full_name, avatar_url, role)')
      .order('created_at', { ascending: false });

    if (serviceId) {
      query = query.eq('service_id', serviceId);
    }

    const { data: feedbackList, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ feedback: feedbackList || [] });
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
    const validation = feedbackSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid feedback data', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { booking_id, service_id, rating, review } = validation.data;

    // Verify booking is completed and belongs to user
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('status, user_id')
      .eq('id', booking_id)
      .eq('user_id', user.id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found or does not belong to you' },
        { status: 404 }
      );
    }

    if (booking.status !== 'completed' && booking.status !== 'confirmed') {
      return NextResponse.json(
        { error: 'Feedback can only be submitted for completed or confirmed bookings' },
        { status: 400 }
      );
    }

    const { data: feedback, error: feedbackError } = await supabase
      .from('feedback')
      .insert({
        booking_id,
        service_id,
        user_id: user.id,
        rating,
        review,
      })
      .select()
      .single();

    if (feedbackError) {
      return NextResponse.json({ error: feedbackError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, feedback }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
