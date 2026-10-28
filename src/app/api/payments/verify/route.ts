import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isRazorpayConfigured, verifyRazorpaySignature } from '@/lib/payments/razorpay';
import { paymentVerifySchema } from '@/lib/utils/validation';

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
    const validation = paymentVerifySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid payment verification payload', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { booking_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      validation.data;

    // Check if Razorpay keys are configured
    if (!isRazorpayConfigured()) {
      return NextResponse.json(
        {
          error: 'Razorpay credentials are in test placeholder mode. Please provide valid test API credentials in .env.local to cryptographically verify live payment signatures.',
          isConfigured: false,
        },
        { status: 422 }
      );
    }

    // 1. Cryptographic HMAC-SHA256 signature verification
    const isValid = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      // Record failed payment attempt
      await supabase
        .from('payments')
        .update({
          status: 'failed',
          razorpay_payment_id,
          razorpay_signature,
          error_code: 'SIGNATURE_VERIFICATION_FAILED',
          error_description: 'Cryptographic signature mismatch against server secret',
          updated_at: new Date().toISOString(),
        })
        .eq('booking_id', booking_id);

      return NextResponse.json(
        { error: 'Payment verification failed: Invalid cryptographic signature' },
        { status: 400 }
      );
    }

    // 2. Fetch booking and check current status (idempotency check)
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, service:services(*)')
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden: Booking does not belong to you' }, { status: 403 });
    }

    if (booking.status === 'confirmed' || booking.status === 'completed') {
      return NextResponse.json({
        success: true,
        message: 'Payment already processed and verified',
        booking_id,
        status: booking.status,
      });
    }

    // 3. Atomically confirm booking and persist captured payment via stored procedure
    const { data: confirmResult, error: confirmError } = await supabase.rpc(
      'confirm_booking_payment',
      {
        p_booking_id: booking_id,
        p_user_id: user.id,
        p_payment_id: razorpay_payment_id,
        p_order_id: razorpay_order_id,
        p_signature: razorpay_signature,
      }
    );

    if (confirmError) {
      return NextResponse.json({ error: confirmError.message }, { status: 500 });
    }

    return NextResponse.json(confirmResult);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
