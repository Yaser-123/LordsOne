# Razorpay Payment Integration & Testing Guide
## Complete Smart Campus Service Booking and Management System (LordsOne)

LordsOne incorporates an end-to-end payment orchestration architecture using **Razorpay Standard Checkout**, server-side HMAC-SHA256 signature verification, and asynchronous webhook handling.

---

### 1. Generating Test Mode Credentials on Razorpay

1. Log in to your [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Toggle the switch in the top header from **Live Mode** to **Test Mode**.
3. In the left navigation, go to **Settings** ➔ **API Keys**.
4. Click **Generate Test Key**.
5. You will receive:
   - **Key ID:** Starts with `rzp_test_...`
   - **Key Secret:** A secret alpha-numeric string (e.g., `aBcDeFg123456789`)
6. Copy both keys immediately.

---

### 2. Configuring `.env.local`

Update your local `.env.local` file with the keys:

```env
# Razorpay Test Gateway Keys
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_ACTUAL_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_ACTUAL_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET_OPTIONAL
```

> **Important:**
> - `NEXT_PUBLIC_RAZORPAY_KEY_ID` is exposed to the browser to initialize `Razorpay(options)`.
> - `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` are **never** prefixed with `NEXT_PUBLIC_` and remain strictly on the Next.js server runtime.

---

### 3. Testing Client-Side Checkout & Signature Verification

1. Start your local server: `npm run dev`
2. Open `http://localhost:3000/services` and select any paid service (e.g., *Advanced Robotics & Automation Lab* or *Central Seminar Hall*).
3. Choose an available slot and click **Book Facility**.
4. You will be redirected to the booking detail page (`/student/bookings/[id]`), showing the state **Awaiting Payment**.
5. Click **Proceed to Payment**.
6. The Razorpay modal will launch:
   - In **Test Mode**, enter test phone number `9876543210` and test email `student@liet.ac.in`.
   - Select **UPI** or **Card** (Use Razorpay test cards or success simulation buttons).
   - Click **Success**.
7. Razorpay will return `razorpay_payment_id`, `razorpay_order_id`, and `razorpay_signature` to the browser callback.
8. The client POSTs these credentials to `/api/payments/verify`.
9. The server performs cryptographic verification:
   ```typescript
   const expectedSignature = crypto
     .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
     .update(`${razorpay_order_id}|${razorpay_payment_id}`)
     .digest('hex');
   ```
10. If signatures match, the booking status automatically transitions to `confirmed`, the payment record is recorded in `payments`, and the student sees the confirmation screen.

---

### 4. Setting Up Webhook Verification (Production & Local Tunneling)

Webhooks handle cases where a student completes payment on their phone or bank app but closes their browser before the redirect returns.

#### For Local Testing via ngrok or cloudflared:
1. Start an ngrok tunnel on port 3000:
   ```bash
   ngrok http 3000
   ```
2. Copy the forwarding URL (e.g., `https://abcd-1234.ngrok-free.app`).
3. In Razorpay Dashboard ➔ **Settings** ➔ **Webhooks** ➔ **Add New Webhook**:
   - **Webhook URL:** `https://abcd-1234.ngrok-free.app/api/payments/webhook`
   - **Secret:** Enter a secret string (e.g., `liet_webhook_secret_2026`) and add it to `.env.local` as `RAZORPAY_WEBHOOK_SECRET`.
   - **Active Events:** Check `payment.captured` and `payment.failed`.
4. Click **Save Webhook**.

---

### 5. Safe Development & Unconfigured Key Behavior

If Razorpay keys have not yet been provided:
- The backend automatically detects the placeholder configuration (`isRazorpayConfigured() === false`).
- Instead of crashing or faking a fake payment silently, the booking page clearly informs the student:
  > *"Razorpay test keys are pending configuration in .env.local. Follow docs/razorpay-configuration.md to configure your test keys."*
- For zero-cost services (e.g., *Campus AV Equipment Tech Support*), bookings transition directly to `confirmed` without requiring payment gateway interaction.
