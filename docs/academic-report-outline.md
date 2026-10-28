# Academic Report Outline: LordsOne
## Complete Smart Campus Service Booking and Management System
### Lords Institute of Engineering and Technology (LIET), Hyderabad
**Curriculum Alignment:** Term Work 2 Submission Index (Items 1 – 20)

---

### Executive Summary & Technical Disclosure
This document maps each chapter and section of the official academic Term Work 2 index to the concrete implementation artifacts, source code files, database schemas, cryptographic security models, and verification evidence built in the **LordsOne** platform.

> **Architectural Substitution Disclosure:** In accordance with modern enterprise full-stack standards and high-concurrency production requirements, the system leverages **Next.js (App Router, React 19, TypeScript strict mode)** with server-side Route Handlers alongside **Supabase PostgreSQL 17** (with atomic Row Level Security and PostgreSQL RPC concurrency functions), rather than an Express.js monolith with MongoDB. This architectural upgrade guarantees strict relational consistency, ACID guarantees on slot bookings, and server-side zero-trust authorization.

---

### Term Work 2 Index Mapping

#### 1. Introduction and Problem Statement
- **Context:** Higher education institutions such as Lords Institute of Engineering and Technology (LIET) manage distributed campus physical infrastructure across departments—advanced robotics laboratories, seminar halls, sports complexes, campus audio-visual equipment, and fleet mobility services.
- **Problem Statement:** Existing campus booking systems rely on fragmented physical logbooks, uncoordinated departmental emails, or manual forms. This leads to double-bookings, untracked asset degradation, lack of payment transparency, zero auditability, and poor student experience.
- **Proposed Solution:** **LordsOne** ("*One Campus. Everything Connected.*") — a unified, high-availability, role-based digital campus platform providing instant service discovery, atomic slot reservations, secure fee handling, real-time administrative moderation, and actionable campus analytics.
- **Reference Files:**
  - Project Vision & Identity: [`BRAND.md`](file:///c:/Users/home/Downloads/LordsOne/BRAND.md)
  - Public Landing Page: [`src/app/page.tsx`](file:///c:/Users/home/Downloads/LordsOne/src/app/page.tsx)

#### 2. Objectives and Scope
- **Primary Objectives:**
  1. Centralize 100% of campus service discovery into a searchable catalog with real-time availability.
  2. Implement mathematical concurrency control preventing overlapping or over-capacity reservations.
  3. Provide dual-role operational portals: student self-service and administrative management.
  4. Integrate end-to-end payment orchestration with cryptographic HMAC verification.
  5. Provide data-driven executive analytics reflecting actual database ledger entries.
- **Scope:**
  - **In Scope:** Student registration, profile lifecycle, 6 campus categories (Labs, Sports, Auditoriums, Events, Equipment, Campus Maintenance), time-slot reservation, Razorpay payments, cancellation state machine, feedback submission, notification feed, admin moderation, and real-time KPI metrics.
  - **Out of Scope (Future Milestones):** Physical RFID gate turnstile hardware integration, automated biometric scanner syncing.

#### 3. Functional and Non-Functional Requirements
- **Functional Requirements (FR):**
  - **FR-1:** Role-Based Access Control (`student`, `admin`) enforced at middleware, API, and database layers.
  - **FR-2:** Dynamic slot generation and capacity tracking per service.
  - **FR-3:** Atomic booking creation using PostgreSQL row-level locks (`SELECT ... FOR UPDATE`).
  - **FR-4:** Razorpay payment order initiation, client-side modal checkout, server-side HMAC-SHA256 signature verification, and idempotent webhook handling.
  - **FR-5:** Administrative audit logging for every status override or role change.
- **Non-Functional Requirements (NFR):**
  - **NFR-1 (Security):** Zero-trust architecture, Supabase Row Level Security (RLS) on all 8 tables, HTTP-only cookie session persistence.
  - **NFR-2 (Performance):** Sub-100ms API response time, server components for minimal client bundle size, optimized database indices.
  - **NFR-3 (Reliability):** Idempotent webhook processing, transaction rollback on booking failures.
  - **NFR-4 (Accessibility & UX):** WCAG 2.1 AA compliance, mobile-first responsive layout, dark navy editorial aesthetic conforming to [`DESIGN.md`](file:///c:/Users/home/Downloads/LordsOne/DESIGN.md).

#### 4. System Architecture and Technology Stack
- **Architecture Diagram:**
  ```text
  [ Client Browser: Desktop / Tablet / Mobile ]
                         │
                 HTTPS (Port 3000 / 443)
                         ▼
        ┌──────────────────────────────────┐
        │       Next.js 16 (App Router)     │
        │  ├── Server Components (SSR)     │
        │  ├── Client Components (React 19)│
        │  ├── Route Handlers (/api/*)     │
        │  └── SSR Middleware (Auth/Role)  │
        └──────────────┬───────────────────┘
                       │
        ┌──────────────┴───────────────────┐
        ▼                                  ▼
  ┌───────────────┐              ┌────────────────────────┐
  │ Razorpay API  │              │  Supabase Cloud (PaaS) │
  │ - Order Gen   │              │  ├── Auth Service      │
  │ - HMAC Verif  │              │  ├── PostgreSQL 17 DB  │
  │ - Webhooks    │              │  ├── Row Level Security│
  └───────────────┘              │  └── PL/pgSQL Atomic   │
                                 │      Stored Procedures │
                                 └────────────────────────┘
  ```
- **Technology Stack Justification:**
  - **Next.js 16 (App Router) + TypeScript Strict:** Unified type safety across frontend and API layers, zero runtime server mismatch, SEO optimization for public catalog.
  - **Tailwind CSS + Lucide Icons:** Lightweight utility-first styling with zero runtime CSS overhead.
  - **Supabase PostgreSQL 17 (ap-south-1):** Production-grade relational database with built-in connection pooling, JSONB support, and ACID transactions.
  - **Recharts:** Composable SVG charting for live administrative trends.
- **Reference Files:**
  - App Configuration: [`next.config.mjs`](file:///c:/Users/home/Downloads/LordsOne/next.config.mjs)
  - Styling System: [`tailwind.config.ts`](file:///c:/Users/home/Downloads/LordsOne/tailwind.config.ts)

#### 5. UI/UX Design and Responsive Layout
- **Design Specifications:**
  - Adheres strictly to [`DESIGN.md`](file:///c:/Users/home/Downloads/LordsOne/DESIGN.md) authored via the `google/design.md` spec.
  - **Color Palette:** Navy Canvas (`#0F172A`), Electric Sapphire (`#2563EB`), Emerald Green (`#059669`), Surface Slate (`#F8FAFC`).
  - **Typography:** Outfit / Inter with geometric high-legibility hierarchy.
  - **Layout Patterns:** Collapsible desktop sidebar, dynamic mobile top-nav with slide-out sheet, responsive grid cards, and tabular data layouts.
- **Reference Files:**
  - Design Tokens: [`DESIGN.md`](file:///c:/Users/home/Downloads/LordsOne/DESIGN.md)
  - Global CSS: [`src/app/globals.css`](file:///c:/Users/home/Downloads/LordsOne/src/app/globals.css)
  - Header & Navigation: [`src/components/layout/Header.tsx`](file:///c:/Users/home/Downloads/LordsOne/src/components/layout/Header.tsx), [`src/components/layout/StudentSidebar.tsx`](file:///c:/Users/home/Downloads/LordsOne/src/components/layout/StudentSidebar.tsx)

#### 6. Frontend Development
- **Core Components & Architecture:**
  - UI Library: Atomic components in [`src/components/ui/`](file:///c:/Users/home/Downloads/LordsOne/src/components/ui/) including `Button`, `Badge`, `Card`, `Input`, `Skeleton`, `Logo`.
  - Service Components: [`ServiceCard`](file:///c:/Users/home/Downloads/LordsOne/src/components/services/ServiceCard.tsx), [`SlotPicker`](file:///c:/Users/home/Downloads/LordsOne/src/components/services/SlotPicker.tsx), [`CategoryFilter`](file:///c:/Users/home/Downloads/LordsOne/src/components/services/CategoryFilter.tsx).
  - Booking & Timeline: [`BookingTimeline`](file:///c:/Users/home/Downloads/LordsOne/src/components/bookings/BookingTimeline.tsx).
  - Interactive Modals: [`RazorpayCheckoutModal`](file:///c:/Users/home/Downloads/LordsOne/src/components/payments/RazorpayCheckoutModal.tsx).

#### 7. Backend Development
- **Next.js Server Capabilities:**
  - Modular API handlers in `src/app/api/` validating JSON payloads with Zod schemas.
  - Server-side cookie management and session extraction via `@supabase/ssr`.
  - Secure API route protection blocking unauthenticated or unauthorized role access.
- **Reference Files:**
  - Validation Engine: [`src/lib/utils/validation.ts`](file:///c:/Users/home/Downloads/LordsOne/src/lib/utils/validation.ts)
  - Supabase Server Client: [`src/lib/supabase/server.ts`](file:///c:/Users/home/Downloads/LordsOne/src/lib/supabase/server.ts)

#### 8. Database Design and Integration
- **Relational Schema:**
  - 8 normalized tables:
    1. `profiles`: Extended user accounts with role (`student`, `admin`) and account status.
    2. `services`: Catalog items with pricing, category, location, capacity, and active flags.
    3. `service_slots`: Discrete availability intervals (e.g., 09:00–11:00) with capacity counters.
    4. `bookings`: Master reservation records with unique reference IDs (e.g., `BK-XXXXXX`) and state machine.
    5. `payments`: Financial ledger with Razorpay transaction and signature references.
    6. `feedback`: Post-service satisfaction ratings (1–5 stars) and qualitative feedback.
    7. `notifications`: In-app user notifications for confirmations, cancellations, and announcements.
    8. `audit_logs`: Immutable security log tracking admin role changes and manual overrides.
- **Database Functions & Triggers:**
  - `handle_new_user()`: Automatically provisions profile records on auth signup.
  - `create_booking_atomic()`: Stored procedure locking the target slot with `FOR UPDATE`, validating available capacity, calculating price snapshots, and writing the booking atomically.
  - `cancel_booking_atomic()`: Reverts booked capacity safely and updates user notifications.
- **Reference Files:**
  - Primary Schema Migration: [`supabase/migrations/20261028000000_init_lordsone.sql`](file:///c:/Users/home/Downloads/LordsOne/supabase/migrations/20261028000000_init_lordsone.sql)
  - Seed Migration: [`supabase/migrations/20261028000001_seed_services.sql`](file:///c:/Users/home/Downloads/LordsOne/supabase/migrations/20261028000001_seed_services.sql)

#### 9. Authentication, Authorization, and Role-Based Access
- **Mechanism:** Supabase Auth utilizing JWTs stored in secure, encrypted HTTP cookies.
- **Route Protection:** SSR Proxy/Middleware intercepting incoming requests to `/student/*` and `/admin/*`, redirecting unauthenticated traffic to `/auth/login` and non-admins away from `/admin/*`.
- **Row Level Security (RLS):** Every database table possesses active RLS policies ensuring students can only view or mutate their personal records, while admins possess scoped oversight privileges.
- **Bootstrap Security:** [`/api/admin/bootstrap`](file:///c:/Users/home/Downloads/LordsOne/src/app/api/admin/bootstrap/route.ts) provides a guarded one-time promotion path requiring a server-side `ADMIN_BOOTSTRAP_SECRET`.

#### 10. Service Listing, Search, Filtering, and Booking
- **Discovery Flow:**
  - Real-time catalog filtering across 6 campus categories.
  - Debounced search matching service title, description, and physical campus location.
  - Interactive date selection fetching available time-slots dynamically with live remaining seat counts.
- **Atomic Booking Pipeline:**
  - Client validates input with Zod -> Submits to `/api/bookings` -> Invokes `create_booking_atomic` RPC -> Stored procedure validates capacity and locks row -> Booking created in `pending_payment` (paid) or `confirmed` (free).
- **Reference Files:**
  - Catalog Page: [`src/app/services/page.tsx`](file:///c:/Users/home/Downloads/LordsOne/src/app/services/page.tsx)
  - Student Booking View: [`src/app/student/bookings/[id]/page.tsx`](file:///c:/Users/home/Downloads/LordsOne/src/app/student/bookings/[id]/page.tsx)

#### 11. Payment Integration and Booking Status Tracking
- **Payment Architecture:**
  - Powered by **Razorpay Payment Gateway** (standard Indian higher education payment infrastructure).
  - Server-side order creation (`/api/payments/create-order`) deriving exact amount from database records.
  - Client-side checkout via Razorpay Checkout Modal SDK.
  - Cryptographic verification (`/api/payments/verify`) using `crypto.createHmac('sha256', secret)`.
  - Idempotent webhook handler (`/api/payments/webhook`) validating raw request signatures.
- **Status State Machine:**
  - `pending_payment` -> `pending` -> `confirmed` -> `completed`
  - Rejection / Cancellation: `cancelled`, `rejected`
  - Cancellation releases locked slot capacity instantly back into the student availability pool.
- **Reference Files:**
  - Payment Service: [`src/lib/payments/razorpay.ts`](file:///c:/Users/home/Downloads/LordsOne/src/lib/payments/razorpay.ts)
  - Verification Route: [`src/app/api/payments/verify/route.ts`](file:///c:/Users/home/Downloads/LordsOne/src/app/api/payments/verify/route.ts)

#### 12. API Design and Integration
- **RESTful Endpoints Summary:**
  - `GET /api/services` — Public catalog with search & category filters.
  - `GET /api/slots?service_id=...&date=...` — Real-time slot availability lookup.
  - `POST /api/bookings` — Atomic reservation engine.
  - `POST /api/bookings/[id]/cancel` — Atomic cancellation handler.
  - `POST /api/payments/create-order` — Razorpay server order generator.
  - `POST /api/payments/verify` — HMAC signature verification & booking status updater.
  - `POST /api/payments/webhook` — Asynchronous payment event consumer.
  - `GET /api/admin/analytics` — Executive KPI & revenue aggregator.
  - `GET /api/admin/bookings` & `PATCH /api/admin/bookings` — Status moderation with audit logging.
  - `GET /api/admin/users` & `PATCH /api/admin/users` — Role & account status management.
- **Documentation Reference:** [`docs/api-documentation.md`](file:///c:/Users/home/Downloads/LordsOne/docs/api-documentation.md)

#### 13. Validation, Error Handling, and Security
- **Defense in Depth:**
  - Input Validation: Zod schemas on all form and JSON API submissions.
  - SQL Injection Prevention: Parameterized queries and Supabase RPC functions.
  - XSS Protection: React 19 automatic JSX string escaping; no `dangerouslySetInnerHTML`.
  - Timing-Safe Comparison: `crypto.timingSafeEqual` for cryptographic HMAC comparisons.
  - Self-Lockout Prevention: Admin APIs reject self-demotions to maintain administrative continuity.
- **Reference Files:**
  - Security Architecture Guide: [`docs/supabase-security.md`](file:///c:/Users/home/Downloads/LordsOne/docs/supabase-security.md)

#### 14. Admin Dashboard and Analytics
- **Executive Oversight Tools:**
  - Real-time KPI summary: Total Bookings, Pending Requests, Confirmed Bookings, and Verified Revenue.
  - Analytical Visualizations: 7-day booking volume area chart and category breakdown bar chart.
  - Moderation Tables: Direct status transitions (`confirmed`, `rejected`, `completed`) with required administrative justification recorded to audit trail.
- **Reference Files:**
  - Admin Overview: [`src/app/admin/dashboard/page.tsx`](file:///c:/Users/home/Downloads/LordsOne/src/app/admin/dashboard/page.tsx)
  - Admin Chart Visualizations: [`src/components/admin/AnalyticsCharts.tsx`](file:///c:/Users/home/Downloads/LordsOne/src/components/admin/AnalyticsCharts.tsx)

#### 15. Testing and Validation
- **Quality Assurance Suite:**
  - Static Type Analysis: `npm run typecheck` passing with zero errors across strict TypeScript.
  - Build Validation: `npm run build` validating all 31 routes across SSR, API, and static generation.
  - Runtime Endpoint Validation: HTTP 200 checks across root, `/api/services`, and `/api/slots`.
  - Concurrency & Capacity Test Cases: Covered in [`docs/testing-report.md`](file:///c:/Users/home/Downloads/LordsOne/docs/testing-report.md).

#### 16. Deployment and Hosting
- **Target Platform:** Vercel (Frontend & Serverless Edge) + Supabase Cloud (PostgreSQL & Auth).
- **Environment Isolation:** Zero credentials in source control; standard `.env.example` template provided.
- **Production Build:** Fully tree-shaken and minified production bundle ready for zero-downtime deployment.
- **Reference Files:**
  - Deployment Guide: [`docs/deployment-checklist.md`](file:///c:/Users/home/Downloads/LordsOne/docs/deployment-checklist.md)

#### 17. Results, Screenshots, and Demonstration
- **Functional Demonstrations Captured:**
  1. *Public Landing & Discovery*: High-impact modern hero, responsive service search, and category filtering.
  2. *Student Booking Flow*: Slot availability selector, attendee quantity calculation, and payment checkout modal.
  3. *Student Timeline*: Visual status stepper tracking requests from pending to completion.
  4. *Admin Management*: Live analytics graphs, booking moderation dialogs, and user role management.
- **Screen Inventory:**
  - `/` (Landing Page)
  - `/services` (Public Discovery Catalog)
  - `/services/[slug]` (Detailed Facility Profile)
  - `/auth/login` & `/auth/register` (Campus SSO / Credentials)
  - `/student/dashboard` (Student Portal Overview)
  - `/student/bookings` (Booking History)
  - `/admin/dashboard` (Administrative Operations Center)
  - `/admin/services` (Facility Catalog Administration)
  - `/admin/bookings` (Reservation Approval Ledger)

#### 18. Challenges and Solutions
- **Challenge 1: Race Conditions in Concurrent Slot Booking**
  - *Symptom:* Two students booking the last seat of a high-demand seminar simultaneously could both receive confirmations.
  - *Solution:* Implemented `public.create_booking_atomic` with `SELECT ... FOR UPDATE` row locks, guaranteeing serialized capacity decrements inside an ACID transaction.
- **Challenge 2: NPM Execution Policy on Windows Host Environments**
  - *Symptom:* Post-install scripts failing with `EALLOWSCRIPTS` under Windows PowerShell.
  - *Solution:* Configured `.npmrc` with `ignore-scripts=true` and utilized native Node.js and TypeScript build pipelines.
- **Challenge 3: Suspense Boundaries in Next.js Turbopack Prerendering**
  - *Symptom:* `useSearchParams()` during static compilation failed for `/auth/login`.
  - *Solution:* Decoupled form components into client-side Suspense containers, maintaining optimal static generation.

#### 19. Future Enhancements
- **Roadmap Items:**
  1. **QR Code Attendance Verification:** Dynamically generate cryptographic QR passes on confirmed bookings for rapid turnstile check-in via campus security mobile scanners.
  2. **WhatsApp / SMS Gateway Integration:** Push automated SMS reminders 1 hour before scheduled laboratory and seminar bookings.
  3. **IoT Smart Energy Integration:** Connect facility booking schedules with LIET building automation systems to automatically activate lighting and HVAC 10 minutes prior to reservation start time.

#### 20. Conclusion and References
- **Conclusion:**
  LordsOne successfully delivers a production-grade, secure, and user-centric Smart Campus Service Booking and Management System for Lords Institute of Engineering and Technology. By pairing Next.js with Supabase PostgreSQL and Razorpay, the system bridges students and campus administrators with unprecedented operational transparency, atomic booking reliability, and modern aesthetic elegance.
- **References:**
  1. Next.js Documentation (App Router Architecture), Vercel Inc., 2026.
  2. PostgreSQL 17 Manual: Concurrency Control and Explicit Locking, The PostgreSQL Global Development Group.
  3. Supabase SSR & Row Level Security Architecture Guide, Supabase Inc., 2026.
  4. Razorpay Payments API Reference: Standard Checkout & Webhook Signature Verification, Razorpay Software Private Ltd.
  5. Lords Institute of Engineering and Technology (LIET) Campus Infrastructure Guidelines, Hyderabad.
