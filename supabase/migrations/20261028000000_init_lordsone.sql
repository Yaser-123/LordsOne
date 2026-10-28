-- ====================================================================
-- LordsOne Database Schema & Initial Migration
-- Smart Campus Service Booking and Management System
-- Lords Institute of Engineering and Technology (LIET), Hyderabad
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. Profiles Table
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL DEFAULT '',
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'faculty', 'admin', 'superadmin')),
    department TEXT DEFAULT 'Computer Science & Engineering',
    roll_number TEXT,
    phone TEXT,
    account_status TEXT NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'deactivated')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for role and email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- --------------------------------------------------------------------
-- 2. Services Table
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'laboratories',
        'sports',
        'seminar_halls',
        'event_spaces',
        'equipment',
        'campus_support'
    )),
    location TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
    capacity INTEGER NOT NULL DEFAULT 1 CHECK (capacity >= 1),
    image_url TEXT,
    booking_rules JSONB NOT NULL DEFAULT '{
        "min_notice_hours": 2,
        "max_advance_days": 14,
        "requires_approval": false,
        "allowed_roles": ["student", "faculty", "admin"]
    }'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON public.services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_slug ON public.services(slug);

-- --------------------------------------------------------------------
-- 3. Service Slots (Availability Grid)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.service_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 1 CHECK (capacity >= 1),
    booked_count INTEGER NOT NULL DEFAULT 0 CHECK (booked_count >= 0),
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_slot_time CHECK (end_time > start_time),
    CONSTRAINT chk_slot_capacity CHECK (booked_count <= capacity),
    CONSTRAINT uq_service_slot UNIQUE (service_id, slot_date, start_time, end_time)
);

CREATE INDEX IF NOT EXISTS idx_service_slots_service_date ON public.service_slots(service_id, slot_date);
CREATE INDEX IF NOT EXISTS idx_service_slots_availability ON public.service_slots(slot_date, is_available);

-- --------------------------------------------------------------------
-- 4. Bookings Table
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_reference TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    slot_id UUID REFERENCES public.service_slots(id) ON DELETE SET NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (unit_price >= 0),
    total_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (total_price >= 0),
    purpose TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending_payment',
        'pending',
        'confirmed',
        'rejected',
        'cancelled',
        'completed'
    )),
    rejection_reason TEXT,
    cancellation_reason TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON public.bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON public.bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON public.bookings(booking_reference);

-- --------------------------------------------------------------------
-- 5. Payments Table (Razorpay Integrated)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'razorpay',
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    razorpay_order_id TEXT UNIQUE,
    razorpay_payment_id TEXT UNIQUE,
    razorpay_signature TEXT,
    status TEXT NOT NULL DEFAULT 'created' CHECK (status IN (
        'created',
        'authorized',
        'captured',
        'failed',
        'refunded'
    )),
    payment_method TEXT,
    verified_at TIMESTAMPTZ,
    error_code TEXT,
    error_description TEXT,
    raw_response JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order ON public.payments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- --------------------------------------------------------------------
-- 6. Feedback Table
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT NOT NULL,
    is_moderated BOOLEAN NOT NULL DEFAULT false,
    moderation_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_feedback_service_id ON public.feedback(service_id);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON public.feedback(rating);

-- --------------------------------------------------------------------
-- 7. Notifications Table
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN (
        'info',
        'success',
        'warning',
        'error',
        'booking',
        'payment'
    )),
    link_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);

-- --------------------------------------------------------------------
-- 8. Audit Logs Table
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);

-- --------------------------------------------------------------------
-- 9. Automatic Profile Creation on Signup Trigger
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student')
    )
    ON CONFLICT (id) DO UPDATE
    SET
        email = EXCLUDED.email,
        full_name = CASE WHEN profiles.full_name = '' THEN EXCLUDED.full_name ELSE profiles.full_name END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- --------------------------------------------------------------------
-- 10. Concurrency-Safe Atomic Booking RPC
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_booking_atomic(
    p_user_id UUID,
    p_service_id UUID,
    p_slot_id UUID,
    p_booking_date DATE,
    p_start_time TIME,
    p_end_time TIME,
    p_quantity INTEGER,
    p_purpose TEXT,
    p_notes TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_service RECORD;
    v_slot RECORD;
    v_unit_price NUMERIC(10, 2);
    v_total_price NUMERIC(10, 2);
    v_initial_status TEXT;
    v_reference TEXT;
    v_booking_id UUID;
    v_requires_approval BOOLEAN;
BEGIN
    -- 1. Lock and validate service
    SELECT * INTO v_service
    FROM public.services
    WHERE id = p_service_id AND is_active = true
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Service not found or is currently inactive.';
    END IF;

    v_requires_approval := COALESCE((v_service.booking_rules->>'requires_approval')::boolean, false);
    v_unit_price := v_service.price;
    v_total_price := v_unit_price * p_quantity;

    -- 2. Determine initial status
    IF v_total_price > 0 THEN
        v_initial_status := 'pending_payment';
    ELSIF v_requires_approval THEN
        v_initial_status := 'pending';
    ELSE
        v_initial_status := 'confirmed';
    END IF;

    -- 3. Lock and validate slot if slot_id is provided
    IF p_slot_id IS NOT NULL THEN
        SELECT * INTO v_slot
        FROM public.service_slots
        WHERE id = p_slot_id AND service_id = p_service_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Selected service slot does not exist.';
        END IF;

        IF NOT v_slot.is_available THEN
            RAISE EXCEPTION 'Selected slot is marked unavailable.';
        END IF;

        IF (v_slot.booked_count + p_quantity) > v_slot.capacity THEN
            RAISE EXCEPTION 'Requested quantity exceeds available slot capacity (Remaining: %)', (v_slot.capacity - v_slot.booked_count);
        END IF;

        -- Update slot booked count
        UPDATE public.service_slots
        SET booked_count = booked_count + p_quantity,
            is_available = CASE WHEN (booked_count + p_quantity) >= capacity THEN false ELSE true END
        WHERE id = p_slot_id;
    END IF;

    -- 4. Generate unique reference code: L1-BK-YYYYMMDD-XXXX
    v_reference := 'L1-BK-' || to_char(CURRENT_DATE, 'YYYYMMDD') || '-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));

    -- 5. Insert booking
    INSERT INTO public.bookings (
        booking_reference,
        user_id,
        service_id,
        slot_id,
        booking_date,
        start_time,
        end_time,
        quantity,
        unit_price,
        total_price,
        purpose,
        notes,
        status
    ) VALUES (
        v_reference,
        p_user_id,
        p_service_id,
        p_slot_id,
        p_booking_date,
        p_start_time,
        p_end_time,
        p_quantity,
        v_unit_price,
        v_total_price,
        p_purpose,
        p_notes,
        v_initial_status
    )
    RETURNING id INTO v_booking_id;

    -- 6. Insert notification for user
    INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        link_url
    ) VALUES (
        p_user_id,
        'Booking Created: ' || v_service.title,
        'Your booking request (' || v_reference || ') is ' || REPLACE(v_initial_status, '_', ' ') || '.',
        'booking',
        '/student/bookings/' || v_booking_id
    );

    RETURN jsonb_build_object(
        'success', true,
        'booking_id', v_booking_id,
        'booking_reference', v_reference,
        'status', v_initial_status,
        'total_price', v_total_price
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --------------------------------------------------------------------
-- 11. Concurrency-Safe Booking Cancellation RPC
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cancel_booking_atomic(
    p_booking_id UUID,
    p_user_id UUID,
    p_reason TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_booking RECORD;
BEGIN
    SELECT * INTO v_booking
    FROM public.bookings
    WHERE id = p_booking_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Booking not found.';
    END IF;

    -- Verify ownership or admin permission
    IF v_booking.user_id <> p_user_id THEN
        -- Check if user is admin
        IF NOT EXISTS (
            SELECT 1 FROM public.profiles WHERE id = p_user_id AND role IN ('admin', 'superadmin')
        ) THEN
            RAISE EXCEPTION 'Unauthorized to cancel this booking.';
        END IF;
    END IF;

    IF v_booking.status IN ('cancelled', 'completed', 'rejected') THEN
        RAISE EXCEPTION 'Cannot cancel a booking that is already %', v_booking.status;
    END IF;

    -- Update booking status
    UPDATE public.bookings
    SET status = 'cancelled',
        cancellation_reason = p_reason,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_booking_id;

    -- Release slot capacity if slot was associated
    IF v_booking.slot_id IS NOT NULL THEN
        UPDATE public.service_slots
        SET booked_count = GREATEST(0, booked_count - v_booking.quantity),
            is_available = true
        WHERE id = v_booking.slot_id;
    END IF;

    -- Notify user
    INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        link_url
    ) VALUES (
        v_booking.user_id,
        'Booking Cancelled: ' || v_booking.booking_reference,
        'Your booking has been cancelled. Reason: ' || COALESCE(p_reason, 'User request'),
        'warning',
        '/student/bookings/' || p_booking_id
    );

    RETURN jsonb_build_object('success', true, 'booking_id', p_booking_id, 'status', 'cancelled');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --------------------------------------------------------------------
-- 12. Row Level Security (RLS) Configuration
-- --------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Profiles Policies
DROP POLICY IF EXISTS "Profiles are readable by owner and admins" ON public.profiles;
CREATE POLICY "Profiles are readable by owner and admins" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update their own non-role profile fields" ON public.profiles;
CREATE POLICY "Users can update their own non-role profile fields" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND
        role = (SELECT role FROM public.profiles WHERE id = auth.uid()) AND
        account_status = (SELECT account_status FROM public.profiles WHERE id = auth.uid())
    );

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles
    FOR ALL USING (public.is_admin());

-- Services Policies
DROP POLICY IF EXISTS "Services are viewable by everyone" ON public.services;
CREATE POLICY "Services are viewable by everyone" ON public.services
    FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Services are editable only by admins" ON public.services;
CREATE POLICY "Services are editable only by admins" ON public.services
    FOR ALL USING (public.is_admin());

-- Service Slots Policies
DROP POLICY IF EXISTS "Slots are viewable by everyone" ON public.service_slots;
CREATE POLICY "Slots are viewable by everyone" ON public.service_slots
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Slots are manageable by admins" ON public.service_slots;
CREATE POLICY "Slots are manageable by admins" ON public.service_slots
    FOR ALL USING (public.is_admin());

-- Bookings Policies
DROP POLICY IF EXISTS "Users can view their own bookings, admins see all" ON public.bookings;
CREATE POLICY "Users can view their own bookings, admins see all" ON public.bookings
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert their own bookings" ON public.bookings;
CREATE POLICY "Users can insert their own bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update any booking" ON public.bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
CREATE POLICY "Users can update their own bookings" ON public.bookings
    FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

-- --------------------------------------------------------------------
-- 12. Payment Confirmation RPC (Atomic Stored Procedure)
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.confirm_booking_payment(
    p_booking_id UUID,
    p_user_id UUID,
    p_payment_id TEXT,
    p_order_id TEXT,
    p_signature TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_booking RECORD;
BEGIN
    SELECT * INTO v_booking
    FROM public.bookings
    WHERE id = p_booking_id AND user_id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Booking not found or unauthorized.';
    END IF;

    -- Update payment table
    UPDATE public.payments
    SET status = 'captured',
        razorpay_payment_id = p_payment_id,
        razorpay_order_id = p_order_id,
        razorpay_signature = p_signature,
        verified_at = timezone('utc'::text, now()),
        updated_at = timezone('utc'::text, now())
    WHERE booking_id = p_booking_id;

    -- Update booking table to confirmed
    UPDATE public.bookings
    SET status = 'confirmed',
        updated_at = timezone('utc'::text, now())
    WHERE id = p_booking_id;

    -- Send notification
    INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        link_url
    ) VALUES (
        p_user_id,
        'Booking Confirmed: ' || v_booking.booking_reference,
        'Your payment of ₹' || v_booking.total_price || ' has been received. Your facility reservation is now confirmed.',
        'payment',
        '/student/bookings/' || p_booking_id
    );

    RETURN jsonb_build_object(
        'success', true,
        'booking_id', p_booking_id,
        'status', 'confirmed',
        'message', 'Payment verified and booking confirmed successfully'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Payments Policies
DROP POLICY IF EXISTS "Users can view their own payments, admins see all" ON public.payments;
CREATE POLICY "Users can view their own payments, admins see all" ON public.payments
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "System and admins can manage payments" ON public.payments;
CREATE POLICY "System and admins can manage payments" ON public.payments
    FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- Feedback Policies
DROP POLICY IF EXISTS "Feedback is readable by all" ON public.feedback;
CREATE POLICY "Feedback is readable by all" ON public.feedback
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert feedback for their own bookings" ON public.feedback;
CREATE POLICY "Users can insert feedback for their own bookings" ON public.feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can moderate feedback" ON public.feedback;
CREATE POLICY "Admins can moderate feedback" ON public.feedback
    FOR UPDATE USING (public.is_admin());

-- Notifications Policies
DROP POLICY IF EXISTS "Users can view and manage their own notifications" ON public.notifications;
CREATE POLICY "Users can view and manage their own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

-- Audit Logs Policies
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (public.is_admin());
