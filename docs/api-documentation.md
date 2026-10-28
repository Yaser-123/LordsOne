# LordsOne REST API Reference
## Complete Smart Campus Service Booking and Management System

All API endpoints are housed under `/api/*` and implemented as Next.js Route Handlers with runtime Zod validation, Supabase SSR authentication, and role authorization.

---

### Global Conventions & Response Formats

- **Standard Success Response (200 / 201):**
  ```json
  {
    "success": true,
    "data": { ... }
  }
  ```
- **Standard Error Response (400 / 401 / 403 / 404 / 500):**
  ```json
  {
    "error": "Human-readable error explanation",
    "details": [ ... ]
  }
  ```

---

### Public & Discovery Endpoints

#### 1. List Services Catalog
- **Endpoint:** `GET /api/services`
- **Access:** Public
- **Query Parameters:**
  - `category` (optional): Filter by category (`laboratories`, `sports`, `auditoriums`, `events`, `equipment`, `maintenance`)
  - `search` (optional): Case-insensitive keyword search against title, description, or location
  - `sort` (optional): `featured`, `price_asc`, `price_desc`, `name`
- **Example Response:**
  ```json
  {
    "services": [
      {
        "id": "e2e8e918-090c-4fa2-bf66-bfe428bda6eb",
        "title": "Advanced Robotics & Automation Lab",
        "slug": "robotics-automation-lab",
        "category": "laboratories",
        "location": "Mechanical Block, Lab M-204",
        "price": 250,
        "capacity": 25,
        "is_active": true
      }
    ]
  }
  ```

#### 2. Query Real-Time Time Slots
- **Endpoint:** `GET /api/slots`
- **Access:** Public
- **Query Parameters:**
  - `service_id` (required, UUID): ID of target facility
  - `date` (required, `YYYY-MM-DD`): Target reservation date
- **Example Response:**
  ```json
  {
    "slots": [
      {
        "id": "787bb7b6-e2bf-4f27-b6bb-f8db4da6eb3e",
        "service_id": "e2e8e918-090c-4fa2-bf66-bfe428bda6eb",
        "date": "2026-10-28",
        "start_time": "09:00:00",
        "end_time": "11:00:00",
        "capacity": 25,
        "booked_count": 0,
        "is_available": true
      }
    ]
  }
  ```

---

### Student Reservation & Account Endpoints

#### 3. Atomic Booking Creation
- **Endpoint:** `POST /api/bookings`
- **Access:** Authenticated (`student` or `admin`)
- **Request Body (JSON):**
  ```json
  {
    "service_id": "e2e8e918-090c-4fa2-bf66-bfe428bda6eb",
    "slot_id": "787bb7b6-e2bf-4f27-b6bb-f8db4da6eb3e",
    "quantity": 2,
    "notes": "Project work on inverse kinematics"
  }
  ```
- **Processing Details:** Invokes PostgreSQL stored procedure `create_booking_atomic` with `SELECT ... FOR UPDATE` row locking.
- **Example Response (201 Created):**
  ```json
  {
    "booking": {
      "id": "a001a111-b222-4c33-8d44-e55555555555",
      "booking_reference": "BK-A9F4B2",
      "status": "pending_payment",
      "total_amount": 500,
      "quantity": 2
    }
  }
  ```

#### 4. Fetch User Bookings
- **Endpoint:** `GET /api/bookings`
- **Access:** Authenticated
- **Description:** Returns bookings belonging to the requesting authenticated user.

#### 5. Cancel Booking
- **Endpoint:** `POST /api/bookings/[id]/cancel`
- **Access:** Authenticated (Owner of booking or Admin)
- **Request Body (JSON):**
  ```json
  {
    "reason": "Rescheduled team presentation"
  }
  ```
- **Processing Details:** Invokes stored procedure `cancel_booking_atomic`, sets status to `cancelled`, and decrements booked capacity in `service_slots`.

---

### Payment & Verification Endpoints (Razorpay)

#### 6. Create Razorpay Payment Order
- **Endpoint:** `POST /api/payments/create-order`
- **Access:** Authenticated
- **Request Body (JSON):**
  ```json
  {
    "booking_id": "a001a111-b222-4c33-8d44-e55555555555"
  }
  ```
- **Security Check:** Server fetches the booking from the database, derives the exact amount, and ensures the requesting user is the rightful booking owner.
- **Response:**
  ```json
  {
    "order_id": "order_MockRazorpay12345",
    "amount": 50000,
    "currency": "INR",
    "key_id": "rzp_test_placeholder_key"
  }
  ```

#### 7. Verify Client Payment Signature
- **Endpoint:** `POST /api/payments/verify`
- **Access:** Authenticated
- **Request Body (JSON):**
  ```json
  {
    "booking_id": "a001a111-b222-4c33-8d44-e55555555555",
    "razorpay_order_id": "order_MockRazorpay12345",
    "razorpay_payment_id": "pay_MockPay67890",
    "razorpay_signature": "cryptographic_hmac_hash"
  }
  ```
- **Security Check:** Calculates `crypto.createHmac('sha256', secret).update(order_id + '|' + payment_id).digest('hex')` and validates with timing-safe comparison. Transitions booking status to `confirmed` and updates payment ledger.

#### 8. Payment Webhook Receiver
- **Endpoint:** `POST /api/payments/webhook`
- **Access:** Razorpay Server Webhooks
- **Security Check:** Validates `x-razorpay-signature` against raw request body using `RAZORPAY_WEBHOOK_SECRET`. Handles `payment.captured` and `payment.failed` idempotently.

---

### Administrative Management Endpoints

#### 9. Live Analytics & KPIs
- **Endpoint:** `GET /api/admin/analytics`
- **Access:** Admin only (`role = 'admin'`)
- **Response:**
  ```json
  {
    "kpis": {
      "total_bookings": 42,
      "pending_bookings": 3,
      "confirmed_bookings": 35,
      "completed_bookings": 4,
      "total_revenue": 12500,
      "active_services": 12,
      "total_users": 150
    },
    "booking_trends": [ ... ],
    "category_breakdown": [ ... ]
  }
  ```

#### 10. Admin Booking Moderation
- **Endpoint:** `PATCH /api/admin/bookings`
- **Access:** Admin only
- **Request Body (JSON):**
  ```json
  {
    "booking_id": "a001a111-b222-4c33-8d44-e55555555555",
    "status": "confirmed",
    "admin_notes": "Facility verified and approved for academic hackathon"
  }
  ```
- **Audit Logging:** Inserts record into `audit_logs` capturing admin user ID, previous status, and updated status.

#### 11. Admin User Management
- **Endpoint:** `PATCH /api/admin/users`
- **Access:** Admin only
- **Request Body (JSON):**
  ```json
  {
    "user_id": "b002b222-c333-4d44-9e55-f66666666666",
    "role": "admin",
    "account_status": "active"
  }
  ```
- **Safeguard:** Automatically blocks admins from demoting their own account to prevent accidental lockout.

#### 12. Secure One-Time Bootstrap
- **Endpoint:** `POST /api/admin/bootstrap`
- **Access:** Internal / Server Secret
- **Request Body (JSON):**
  ```json
  {
    "email": "admin@liet.ac.in",
    "secret": "lordsone_super_admin_secret_2026"
  }
  ```
