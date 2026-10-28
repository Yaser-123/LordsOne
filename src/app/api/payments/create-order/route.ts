import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createRazorpayOrder, isRazorpayConfigured } from '@/lib/payments/razorpay';

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

    const { booking_id } = await request.json();

    if (!booking_id) {
      return NextResponse.json({ error: 'booking_id is required' }, { status: 400 });
    }

    // 1. Fetch booking and verify ownership and amount
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, service:services(*)')
      .eq('id', booking_id)
      .eq('user_id', user.id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found or does not belong to you' },
        { status: 404 }
      );
    }

    if (booking.status !== 'pending_payment') {
      return NextResponse.json(
        { error: `Booking is not awaiting payment (Current status: ${booking.status})` },
        { status: 400 }
      );
    }

    if (booking.total_price <= 0) {
      return NextResponse.json(
        { error: 'This booking is free and does not require payment' },
        { status: 400 }
      );
    }

    // 2. Create Razorpay order on server
    const orderResult = await createRazorpayOrder({
      bookingId: booking.id,
      amount: Number(booking.total_price),
      currency: 'INR',
      receipt: booking.booking_reference,
      notes: {
        service_title: booking.service?.title || 'Campus Service',
        user_id: user.id,
      },
    });

    if (!orderResult.success && orderResult.isConfigured) {
      return NextResponse.json(
        { error: orderResult.error || 'Failed to create Razorpay order' },
        { status: 500 }
      );
    }

    const orderId = orderResult.order?.id || `mock_${Date.now()}`;

    // 3. Persist payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .upsert(
        {
          booking_id: booking.id,
          user_id: user.id,
          provider: 'razorpay',
          amount: booking.total_price,
          currency: 'INR',
          razorpay_order_id: orderId,
          status: 'created',
        },
        { onConflict: 'booking_id' }
      )
      .select()
      .single();

    if (paymentError) {
      return NextResponse.json({ error: paymentError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      order: orderResult.order,
      paymentId: payment?.id,
      bookingReference: booking.booking_reference,
      amount: booking.total_price,
      currency: 'INR',
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      isConfigured: isRazorpayConfigured(),
      notice: !isRazorpayConfigured()
        ? 'Razorpay keys are currently in test-ready placeholder mode. Once you add valid test keys in .env.local, real Razorpay checkout modal will load.'
        : undefined,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
