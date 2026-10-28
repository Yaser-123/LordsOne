export type UserRole = 'student' | 'faculty' | 'admin' | 'superadmin';
export type AccountStatus = 'active' | 'suspended' | 'deactivated';

export type ServiceCategory =
  | 'laboratories'
  | 'sports'
  | 'seminar_halls'
  | 'event_spaces'
  | 'equipment'
  | 'campus_support';

export type BookingStatus =
  | 'pending_payment'
  | 'pending'
  | 'confirmed'
  | 'rejected'
  | 'cancelled'
  | 'completed';

export type PaymentStatus =
  | 'created'
  | 'authorized'
  | 'captured'
  | 'failed'
  | 'refunded';

export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'booking'
  | 'payment';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  role: UserRole;
  department?: string | null;
  roll_number?: string | null;
  phone?: string | null;
  account_status: AccountStatus;
  created_at: string;
  updated_at: string;
}

export interface BookingRules {
  min_notice_hours: number;
  max_advance_days: number;
  requires_approval: boolean;
  allowed_roles: UserRole[];
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: ServiceCategory;
  location: string;
  price: number;
  capacity: number;
  image_url?: string | null;
  booking_rules: BookingRules;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceSlot {
  id: string;
  service_id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  booked_count: number;
  is_available: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  booking_reference: string;
  user_id: string;
  service_id: string;
  slot_id?: string | null;
  booking_date: string;
  start_time: string;
  end_time: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  purpose?: string | null;
  notes?: string | null;
  status: BookingStatus;
  rejection_reason?: string | null;
  cancellation_reason?: string | null;
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
  service?: Service;
  profile?: Profile;
  slot?: ServiceSlot;
  payment?: Payment;
}

export interface Payment {
  id: string;
  booking_id: string;
  user_id: string;
  provider: string;
  amount: number;
  currency: string;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  razorpay_signature?: string | null;
  status: PaymentStatus;
  payment_method?: string | null;
  verified_at?: string | null;
  error_code?: string | null;
  error_description?: string | null;
  raw_response?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Feedback {
  id: string;
  booking_id: string;
  user_id: string;
  service_id: string;
  rating: number;
  review: string;
  is_moderated: boolean;
  moderation_note?: string | null;
  created_at: string;
  profile?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  link_url?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  details?: Record<string, unknown> | null;
  ip_address?: string | null;
  created_at: string;
}
