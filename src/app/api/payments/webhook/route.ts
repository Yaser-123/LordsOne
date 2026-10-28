import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyWebhookSignature } from '@/lib/payments/razorpay';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const webhookSignature = request.headers.get('x-razorpay-signature');

    if (!webhookSignature) {
      return NextResponse.json({ error: 'Missing webhook signature header' }, { status: 400 });
    }

    // Verify webhook signature against raw body
    const isValid = verifyWebhookSignature(rawBody, webhookSignature);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;

    if (!paymentEntity) {
      return NextResponse.json({ message: 'No payment entity in webhook event' });
    }

    const orderId = paymentEntity.order_id;
    const paymentId = paymentEntity.id;
    const status = paymentEntity.status; // 'captured', 'failed', etc.

    const supabase = await createClient();

    // 1. Find payment record by razorpay_order_id
    const { data: paymentRecord, error: findError } = await supabase
      .from('payments')
      .select('*, booking:bookings(*)')
      .eq('razorpay_order_id', orderId)
      .single();

    if (findError || !paymentRecord) {
      return NextResponse.json({ message: 'No matching payment order found', orderId });
    }

    // 2. Handle events idempotently via atomic stored procedure
    if (event === 'payment.captured' || status === 'captured') {
      const currentBooking = paymentRecord.booking;
      if (currentBooking) {
        await supabase.rpc('confirm_booking_payment', {
          p_booking_id: currentBooking.id,
          p_user_id: currentBooking.user_id,
          p_payment_id: paymentId,
          p_order_id: orderId,
          p_signature: webhookSignature,
        });

        // Record raw payload
        await supabase
          .from('payments')
          .update({
            raw_response: payload,
            updated_at: new Date().toISOString(),
          })
          .eq('id', paymentRecord.id);
      }
    } else if (event === 'payment.failed') {
      await supabase
        .from('payments')
        .update({
          status: 'failed',
          error_code: paymentEntity.error_code,
          error_description: paymentEntity.error_description,
          raw_response: payload,
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentRecord.id);
    }

    return NextResponse.json({ received: true, event });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Webhook processing error' }, { status: 500 });
  }
}
