import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const serviceId = searchParams.get('service_id');
    const search = searchParams.get('search');

    let query = supabase
      .from('bookings')
      .select('*, service:services(*), profile:profiles(*), slot:service_slots(*), payment:payments(*)')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (serviceId && serviceId !== 'all') {
      query = query.eq('service_id', serviceId);
    }

    if (search) {
      query = query.or(
        `booking_reference.ilike.%${search}%,purpose.ilike.%${search}%`
      );
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

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, status, reason, admin_notes } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Booking id and status are required' }, { status: 400 });
    }

    const validStatuses = ['confirmed', 'rejected', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Fetch existing booking
    const { data: currentBooking, error: fetchError } = await supabase
      .from('bookings')
      .select('*, service:services(*)')
      .eq('id', id)
      .single();

    if (fetchError || !currentBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // State machine validation
    if (['completed', 'cancelled', 'rejected'].includes(currentBooking.status)) {
      return NextResponse.json(
        { error: `Cannot change status of a booking that is already ${currentBooking.status}` },
        { status: 400 }
      );
    }

    const updatePayload: Record<string, unknown> = {
      status,
      admin_notes: admin_notes || currentBooking.admin_notes,
      updated_at: new Date().toISOString(),
    };

    if (status === 'rejected') {
      updatePayload.rejection_reason = reason || 'Booking request was declined by campus administration';
    } else if (status === 'cancelled') {
      updatePayload.cancellation_reason = reason || 'Cancelled by administrator';
    }

    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // If cancelled or rejected, release slot capacity
    if ((status === 'cancelled' || status === 'rejected') && currentBooking.slot_id) {
      await supabase.rpc('cancel_booking_atomic', {
        p_booking_id: id,
        p_user_id: user.id,
        p_reason: reason || 'Administrative status change',
      });
    }

    // Send notification to the student
    await supabase.from('notifications').insert({
      user_id: currentBooking.user_id,
      title: `Booking Update: ${currentBooking.booking_reference}`,
      message: `Your booking for ${currentBooking.service?.title} has been marked as ${status}.${reason ? ` Note: ${reason}` : ''}`,
      type: status === 'confirmed' || status === 'completed' ? 'success' : 'warning',
      link_url: `/student/bookings/${id}`,
    });

    // Record audit log
    await supabase.from('audit_logs').insert({
      actor_id: user.id,
      action: `booking_status_${status}`,
      entity_type: 'booking',
      entity_id: id,
      details: {
        previous_status: currentBooking.status,
        new_status: status,
        reason,
      },
    });

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
