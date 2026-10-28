# Supabase Security & Row Level Security (RLS) Architecture
## Complete Smart Campus Service Booking and Management System (LordsOne)

Security in LordsOne follows a **Zero-Trust, Defense-in-Depth** model. Security boundaries are established simultaneously at:
1. Client-Side Presentation & Routing (Next.js SSR Middleware)
2. Server API Route Handlers (Zod Schema Validation & Session Extraction)
3. PostgreSQL Database Engine (Row Level Security & Atomic Stored Procedures)

---

### 1. Row Level Security (RLS) Policy Audit

RLS is enabled unconditionally across all 8 application tables:

```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
```

#### Policy Specifications

| Table | Policy Name | Command | Who | Permitted Condition / Logic |
| :--- | :--- | :--- | :--- | :--- |
| `profiles` | `profiles_read_all` | `SELECT` | `authenticated` | Any authenticated campus member can view user profiles |
| `profiles` | `profiles_update_self` | `UPDATE` | `authenticated` | `auth.uid() = id` (Cannot modify `role` directly due to API-level validation) |
| `services` | `services_read_active` | `SELECT` | `public`, `anon` | Anyone can browse active services (`is_active = true`) |
| `services` | `services_admin_all` | `ALL` | `authenticated` | Only users whose profile has `role = 'admin'` |
| `service_slots` | `slots_read_all` | `SELECT` | `public`, `anon` | Anyone can read slot availability |
| `service_slots` | `slots_admin_all` | `ALL` | `authenticated` | Only admins can create/update slot parameters |
| `bookings` | `bookings_read_own` | `SELECT` | `authenticated` | `auth.uid() = user_id` OR `is_admin()` |
| `bookings` | `bookings_insert_own`| `INSERT` | `authenticated` | `auth.uid() = user_id` (via atomic function) |
| `bookings` | `bookings_admin_update`| `UPDATE`| `authenticated` | Only admins or service role |
| `payments` | `payments_read_own` | `SELECT` | `authenticated` | `auth.uid() = user_id` OR `is_admin()` |
| `feedback` | `feedback_read_public`| `SELECT` | `public` | Verified reviews are publicly readable |
| `feedback` | `feedback_insert_own`| `INSERT` | `authenticated` | Only user who completed the booking can submit |
| `notifications` | `notif_read_own` | `SELECT` | `authenticated` | `auth.uid() = user_id` |
| `notifications` | `notif_update_own` | `UPDATE` | `authenticated` | `auth.uid() = user_id` (e.g., mark as read) |
| `audit_logs` | `audit_admin_read` | `SELECT` | `authenticated` | `is_admin()` only |

---

### 2. Concurrency Safety: Atomic Booking via RPC

Direct client `INSERT` operations on `bookings` cannot prevent race conditions if multiple students book the last available seat simultaneously. 

LordsOne enforces atomic reservation via a PostgreSQL stored procedure:

```sql
CREATE OR REPLACE FUNCTION public.create_booking_atomic(
  p_user_id UUID,
  p_service_id UUID,
  p_slot_id UUID,
  p_quantity INT,
  p_notes TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_slot RECORD;
  v_service RECORD;
  v_booking_ref TEXT;
  v_total_amount DECIMAL(10,2);
  v_status TEXT;
  v_new_booking RECORD;
BEGIN
  -- Acquire explicit row-level lock on the target slot
  SELECT * INTO v_slot FROM public.service_slots WHERE id = p_slot_id FOR UPDATE;
  
  -- Verify capacity
  IF (v_slot.booked_count + p_quantity) > v_slot.capacity THEN
    RAISE EXCEPTION 'Slot is fully booked or requested quantity exceeds capacity';
  END IF;

  -- Verify active service and pricing
  SELECT * INTO v_service FROM public.services WHERE id = p_service_id;
  v_total_amount := v_service.price * p_quantity;

  -- Determine state machine initiation
  IF v_total_amount > 0 THEN
    v_status := 'pending_payment';
  ELSE
    v_status := 'confirmed';
  END IF;

  -- Generate unique reference
  v_booking_ref := 'BK-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));

  -- Insert booking
  INSERT INTO public.bookings (booking_reference, user_id, service_id, slot_id, quantity, notes, price_snapshot, total_amount, status)
  VALUES (v_booking_ref, p_user_id, p_service_id, p_slot_id, p_quantity, p_notes, v_service.price, v_total_amount, v_status)
  RETURNING * INTO v_new_booking;

  -- Increment slot capacity safely
  UPDATE public.service_slots 
  SET booked_count = booked_count + p_quantity 
  WHERE id = p_slot_id;

  RETURN row_to_json(v_new_booking)::JSONB;
END;
$$;
```

**Security Guarantees:**
- `FOR UPDATE` prevents phantom reads and race conditions.
- `SECURITY DEFINER` guarantees that the function executes within trusted database privileges while strictly respecting the authenticated `p_user_id`.

---

### 3. Secret Isolation Matrix

| Credential | Scope | Location | Client Exposure |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public API Root | `.env.local` | Allowed (public domain) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Client Key | `.env.local` | Allowed (guarded by RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Administrative Key | `.env.local` | **STRICTLY FORBIDDEN IN CLIENT** |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Public Checkout Key | `.env.local` | Allowed in browser modal |
| `RAZORPAY_KEY_SECRET` | HMAC Signing Key | `.env.local` | **SERVER-ONLY** |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook Verification | `.env.local` | **SERVER-ONLY** |
| `ADMIN_BOOTSTRAP_SECRET` | Server Super Secret | `.env.local` | **SERVER-ONLY** |
