# LordsOne Setup & Installation Guide
## Complete Smart Campus Service Booking and Management System
### Lords Institute of Engineering and Technology (LIET)

This guide walks through initial setup, environment configuration, database seeding, local execution, and administrative bootstrapping for the **LordsOne** platform.

---

### 1. Prerequisites
- **Node.js:** v18.17.0+ or v20.0.0+ (Tested on Node v20 LTS / v22)
- **Package Manager:** `npm` (included with Node.js)
- **Supabase Account:** Access to a Supabase project (PostgreSQL 15+)
- **Operating System:** Windows, macOS, or Linux

---

### 2. Repository Clone & Dependency Installation

1. Open your terminal in the target directory:
   ```bash
   git clone <repository_url> LordsOne
   cd LordsOne
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
   *Note: If building on Windows PowerShell with execution restrictions, `.npmrc` is configured with `ignore-scripts=true` to ensure clean, error-free installs.*

---

### 3. Environment Variable Configuration

Copy the template `.env.example` into `.env.local`:
```bash
cp .env.example .env.local
```

Populate the required keys in `.env.local`:

```env
# Supabase Configuration (Connected to Project: ibtwybfznlhsynpksxyf)
NEXT_PUBLIC_SUPABASE_URL=https://ibtwybfznlhsynpksxyf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_public_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_secret_key_here

# Razorpay Test Configuration (Standard Test Gateway)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_placeholder_key
RAZORPAY_KEY_SECRET=rzp_test_placeholder_secret
RAZORPAY_WEBHOOK_SECRET=rzp_test_placeholder_webhook_secret

# Security Secrets
ADMIN_BOOTSTRAP_SECRET=lordsone_super_admin_secret_2026
```

> **Security Note:** Never commit `.env.local` to Git. It is automatically ignored by `.gitignore`.

---

### 4. Database Setup & Migrations

The project includes pre-configured SQL migrations in the `supabase/migrations/` directory:

1. **Schema Migration:** [`supabase/migrations/20261028000000_init_lordsone.sql`](file:///c:/Users/home/Downloads/LordsOne/supabase/migrations/20261028000000_init_lordsone.sql)
   - Creates the 8 normalized tables (`profiles`, `services`, `service_slots`, `bookings`, `payments`, `feedback`, `notifications`, `audit_logs`).
   - Configures active Row Level Security (RLS) on all tables.
   - Installs the user creation trigger (`handle_new_user`).
   - Installs atomic concurrency stored procedures (`create_booking_atomic` and `cancel_booking_atomic`).

2. **Catalog Seed Migration:** [`supabase/migrations/20261028000001_seed_services.sql`](file:///c:/Users/home/Downloads/LordsOne/supabase/migrations/20261028000001_seed_services.sql)
   - Seeds 12 campus facilities across 6 categories (Robotics Lab, IoT Research Center, Cricket Pavilion, Indoor Sports Arena, Main Auditorium, Central Seminar Hall, Open Amphitheater, Executive Boardroom, Sony A7IV Camera Kit, DJI Drone Kit, 3D Printer Fleet, AV Tech Support).
   - Seeds 384 time slots (4 daily slots for next 7 days for every facility).

If connecting a fresh Supabase instance, run these migrations through the Supabase Dashboard SQL Editor or via the Supabase CLI:
```bash
npx supabase db push
```

---

### 5. Running the Application Locally

1. Start the Next.js development server:
   ```bash
   npm run dev
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

### 6. Initial Administrator Bootstrap

By default, new signups receive the `student` role to prevent unauthorized privilege escalation. To elevate an authorized user to `admin`:

1. Sign up a new user via the registration page at `http://localhost:3000/auth/register` (e.g., `admin@liet.ac.in`).
2. Promote the user using the secure one-time bootstrap API endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/admin/bootstrap \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@liet.ac.in",
       "secret": "lordsone_super_admin_secret_2026"
     }'
   ```
3. The response will return:
   ```json
   {
     "success": true,
     "message": "User admin@liet.ac.in successfully promoted to admin"
   }
   ```
4. Sign out and sign back in with this account. You will now have access to the full Administrative Operations Center at `http://localhost:3000/admin/dashboard`.

---

### 7. Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts local Next.js development server with Turbopack |
| `npm run build` | Builds optimized production bundle |
| `npm run start` | Starts production server locally after build |
| `npm run typecheck` | Runs TypeScript compiler checks in strict mode |
