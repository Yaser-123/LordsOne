import crypto from 'crypto';
import Razorpay from 'razorpay';

export interface CreateOrderParams {
  bookingId: string;
  amount: number; // in INR
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface VerificationParams {
  orderId: string;
  paymentId: string;
  signature: string;
}

// Check if Razorpay credentials are real test/live keys or unconfigured placeholders
export function isRazorpayConfigured(): boolean {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  return !!(
    keyId &&
    keySecret &&
    !keyId.includes('placeholder') &&
    !keySecret.includes('placeholder') &&
    keyId.startsWith('rzp_')
  );
}

export function getRazorpayClient(): Razorpay | null {
  if (!isRazorpayConfigured()) {
    return null;
  }

  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  return new Razorpay({
    key_id: keyId!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

/**
 * Creates a Razorpay Order server-side.
 * Amounts in Razorpay are in paise (1 INR = 100 paise).
 */
export async function createRazorpayOrder({
  bookingId,
  amount,
  currency = 'INR',
  receipt,
  notes = {},
}: CreateOrderParams) {
  const client = getRazorpayClient();

  if (!client) {
    // Return structured unconfigured status
    return {
      success: false,
      isConfigured: false,
      message: 'Razorpay keys are currently in placeholder mode. Real credentials must be supplied in .env.local to charge live payments.',
      order: {
        id: `order_mock_${Date.now()}`,
        amount: Math.round(amount * 100),
        currency,
        receipt,
      },
    };
  }

  try {
    const order = await client.orders.create({
      amount: Math.round(amount * 100), // convert to paise
      currency,
      receipt,
      notes: {
        bookingId,
        ...notes,
      },
    });

    return {
      success: true,
      isConfigured: true,
      order,
    };
  } catch (error: unknown) {
    const err = error as Error;
    return {
      success: false,
      isConfigured: true,
      error: err.message || 'Failed to create Razorpay order',
    };
  }
}

/**
 * Server-side payment signature verification using HMAC-SHA256
 * Follows official Razorpay verification protocol:
 * expected_signature = HMAC_SHA256(order_id + "|" + payment_id, secret)
 */
export function verifyRazorpaySignature({
  orderId,
  paymentId,
  signature,
}: VerificationParams): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!secret || !isRazorpayConfigured()) {
    // If credentials are placeholder, fail signature verification safely
    return false;
  }

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  // Use timingSafeEqual to prevent timing attacks
  try {
    const a = Buffer.from(generatedSignature);
    const b = Buffer.from(signature);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Verifies Razorpay Webhook signature against raw request body
 */
export function verifyWebhookSignature(
  rawBody: string,
  webhookSignature: string
): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret || webhookSecret.includes('placeholder')) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  try {
    const a = Buffer.from(expectedSignature);
    const b = Buffer.from(webhookSignature);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
