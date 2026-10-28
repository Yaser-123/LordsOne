# Production Deployment Checklist (Vercel & Supabase)
## LordsOne — Smart Campus Service Booking and Management System

Use this checklist before and after deploying **LordsOne** to production.

---

### Phase 1: Pre-Deployment Validation

- [x] **Strict TypeScript Compilation:** Verify `npm run typecheck` succeeds with 0 errors.
- [x] **Production Build Compilation:** Verify `npm run build` generates all static and dynamic routes cleanly.
- [x] **Environment Secrets Audited:** Confirm no API secrets or service role keys exist in public client-side components.
- [x] **Database Schema Migrated:** Confirm `20261028000000_init_lordsone.sql` and `20261028000001_seed_services.sql` are applied on Supabase.
- [x] **Active RLS Verification:** Ensure all 8 tables have active Row Level Security and explicit access policies.

---

### Phase 2: Supabase Dashboard Configuration

1. **Authentication Redirect URLs:**
   - Go to **Supabase Dashboard** ➔ **Authentication** ➔ **URL Configuration**.
   - Set **Site URL** to your production domain: `https://lordsone.vercel.app` (or custom campus domain).
   - Add Redirect URLs:
     - `https://lordsone.vercel.app/auth/callback`
     - `http://localhost:3000/auth/callback` (for local staging)

2. **Email Provider Setup:**
   - In **Authentication** ➔ **Email**, configure SMTP for institutional domain (e.g., SendGrid, Resend, or Google Workspace SMTP for `noreply@liet.ac.in`).
   - For demo environments, enable or disable email confirmation as appropriate.

---

### Phase 3: Vercel Project Setup

1. Push your repository to GitHub / GitLab / Bitbucket.
2. Log in to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import the `LordsOne` repository.
4. Select Framework Preset: **Next.js**.
5. Add the following **Environment Variables** in Vercel Project Settings:

| Key | Value / Source |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ibtwybfznlhsynpksxyf.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(Your Supabase anon key)* |
| `SUPABASE_SERVICE_ROLE_KEY` | *(Your Supabase service role secret)* |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `rzp_test_...` (or live `rzp_live_...`) |
| `RAZORPAY_KEY_SECRET` | *(Razorpay secret key)* |
| `RAZORPAY_WEBHOOK_SECRET` | *(Razorpay webhook secret)* |
| `ADMIN_BOOTSTRAP_SECRET` | *(Random 32-character high-entropy secret)* |

6. Click **Deploy**.

---

### Phase 4: Post-Deployment Smoke Testing

1. **Public Catalog:** Navigate to `https://<your-vercel-domain>/services` and verify all 12 facilities load with live images and category filters.
2. **Student Authentication:** Register a student account and verify session cookies persist across tab refreshes.
3. **Atomic Booking:** Reserve a time slot for any facility. Check database to verify slot `booked_count` incremented accurately.
4. **Admin Promotion:** Use `/api/admin/bootstrap` to promote your administrative email. Access `/admin/dashboard` and verify real-time charts render without errors.
5. **Payment Webhook:** Register production webhook endpoint in Razorpay Dashboard pointing to `https://<your-vercel-domain>/api/payments/webhook`.
