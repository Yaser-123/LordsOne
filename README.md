# LordsOne — Smart Campus Service Booking and Management System
> **"One Campus. Everything Connected."**  
> *A unified digital services and facility reservation platform designed for Lords Institute of Engineering and Technology (LIET), Hyderabad.*

[![Next.js](https://img.shields.io/badge/Next.js-16.4.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%2017-3ECF8E?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%203.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Standard%20Checkout-02042B?logo=razorpay)](https://razorpay.com/)

---

## 🏛️ Executive Overview

**LordsOne** is a high-concurrency, enterprise-grade digital campus platform that unifies all physical campus infrastructure and services into a single real-time interface. It replaces disjointed paper logbooks, unmonitored email threads, and manual cash handoffs with atomic slot reservations, transparent digital payments, role-based oversight, and operational analytics.

Built specifically for the student and faculty body of **Lords Institute of Engineering and Technology (LIET)**, the platform manages facilities across 6 core campus domains:
1. 🔬 **Laboratories & Research Centers** (Advanced Robotics & Automation Lab, IoT Research Center)
2. 🏏 **Sports Infrastructure** (Main Cricket Pavilion & Turf, Indoor Sports Arena)
3. 🎭 **Auditoriums & Seminar Halls** (Lords Central Auditorium, Seminar Hall Block B)
4. 🎪 **Event Spaces** (Open Amphitheater, Executive Boardroom)
5. 🎥 **Equipment Rental** (Sony A7IV 4K Media Kit, DJI Drone Kit, 3D Printer Fleet)
6. 🛠️ **Campus Support & Maintenance** (AV Tech Support, Campus Electric Vehicle Mobility)

---

## 🚀 Key Architectural Features

- **⚡ Modern Full-Stack Engine:** Next.js 16 with App Router, Turbopack, React 19 Server Components, and strict TypeScript.
- **🛡️ Concurrency-Safe Booking Engine:** Concurrency-safe slot reservations powered by PostgreSQL stored procedures (`create_booking_atomic`) using `SELECT ... FOR UPDATE` row locks to eliminate double-bookings and phantom seats.
- **🔐 Zero-Trust Security & RLS:** Active Supabase Row Level Security (RLS) across all 8 relational tables. Route guards intercepting unauthenticated or unauthorized role access at the SSR boundary.
- **💳 End-to-End Razorpay Gateway:** Server-side order generation, client-side modal checkout, timing-safe cryptographic HMAC-SHA256 signature verification, and idempotent webhook event handling.
- **📊 Real-Time Operations Analytics:** Administrative dashboard visualizing actual database ledger metrics: real-time booking volume trends, revenue metrics, category breakdowns via Recharts, and audit logs.
- **🎨 Polished Editorial Design System:** Authoritative design tokens specified in [`DESIGN.md`](file:///c:/Users/home/Downloads/LordsOne/DESIGN.md) and [`BRAND.md`](file:///c:/Users/home/Downloads/LordsOne/BRAND.md)—Deep Navy canvas, electric sapphire accents, accessible contrast, and mobile-first responsive navigation.

---

## 📁 Repository Structure

```text
LordsOne/
├── docs/                               # Comprehensive Technical & Academic Documentation
│   ├── academic-report-outline.md      # Full 20-item Term Work 2 Index Mapping
│   ├── api-documentation.md            # Complete REST Route Handler Reference
│   ├── deployment-checklist.md         # Production Vercel & Supabase Deployment Checklist
│   ├── razorpay-configuration.md       # Razorpay Test Key Setup & Webhook Guide
│   ├── setup-guide.md                  # Detailed Local Development Installation Guide
│   ├── supabase-security.md            # RLS Policies, Secrets Matrix, & Concurrency Lock
│   └── testing-report.md               # QA Analysis, Build Stats, & Concurrency Scenarios
├── src/
│   ├── app/                            # Next.js App Router (31 Production Routes)
│   │   ├── (auth)/auth/                # Login, Register, & Auth Callback Handlers
│   │   ├── admin/                      # Admin Operations Portal (Dashboard, Services, Bookings, Users)
│   │   ├── api/                        # Documented REST API Endpoints & Webhooks
│   │   ├── legal/                      # Campus Terms of Service & Privacy Policy
│   │   ├── services/                   # Public Facility Discovery & Dynamic Slug Details
│   │   ├── student/                    # Student Self-Service Portal (Bookings, Payments, Notifications)
│   │   ├── globals.css                 # Design Tokens & Tailwind Base Styles
│   │   ├── layout.tsx                  # Root Layout with Font & Metadata Configuration
│   │   ├── page.tsx                    # Public Modern Landing Page
│   │   └── proxy.ts                    # SSR Route Interceptor & Role-Based Middleware
│   ├── components/                     # Modular Reusable React Components
│   │   ├── admin/                      # Analytics Charts & Admin Data Tables
│   │   ├── bookings/                   # Booking Timeline & Status Indicators
│   │   ├── layout/                     # Headers, Sidebars, Mobile Navigation, Footers
│   │   ├── payments/                   # Razorpay Checkout Modal SDK Wrapper
│   │   ├── services/                   # Service Cards, Category Filters, Slot Pickers
│   │   └── ui/                         # Atomic Design Primitives (Buttons, Badges, Cards, etc.)
│   ├── lib/                            # Business Logic & Infrastructure Utilities
│   │   ├── payments/                   # Razorpay Server SDK & HMAC Verification Engine
│   │   ├── supabase/                   # Supabase SSR Clients (Browser, Server, Middleware)
│   │   └── utils/                      # Validation Zod Schemas & Helper Functions
│   └── types/                          # TypeScript Domain & Database Entity Models
├── supabase/
│   └── migrations/                     # Versioned PostgreSQL Migrations
│       ├── 20261028000000_init_lordsone.sql  # 8 Relational Tables, Triggers, RLS, & Atomic RPC
│       └── 20261028000001_seed_services.sql  # 12 Campus Services & 384 Seed Time Slots
├── BRAND.md                            # Brand Strategy, Voice & Typography
├── DESIGN.md                           # Canonical Design System Tokens (google/design.md spec)
└── package.json                        # Project Metadata & Dependency Definitions
```

---

## 🛠️ Quickstart Guide

### 1. Prerequisites
- Node.js v18.17+ or v20+
- npm v9+

### 2. Clone & Install Dependencies
```bash
git clone <repository_url> LordsOne
cd LordsOne
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
The connected Supabase instance is already provisioned (`ibtwybfznlhsynpksxyf` in `ap-south-1`). Add your credentials or configure Razorpay test keys:
```env
NEXT_PUBLIC_SUPABASE_URL=https://ibtwybfznlhsynpksxyf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_placeholder_key
RAZORPAY_KEY_SECRET=rzp_test_placeholder_secret
RAZORPAY_WEBHOOK_SECRET=rzp_test_placeholder_webhook_secret

ADMIN_BOOTSTRAP_SECRET=lordsone_super_admin_secret_2026
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎓 Academic Term Work 2 Alignment

This codebase is directly structured to fulfill the academic Term Work 2 index (Items 1–20):
- Complete mapping available in [`docs/academic-report-outline.md`](file:///c:/Users/home/Downloads/LordsOne/docs/academic-report-outline.md).
- Architectural substitution of Next.js + Supabase PostgreSQL in place of Express + MongoDB is documented transparently in Section 4.

---

## 🛡️ License & Institutional Attribution
Built as an autonomous engineering deliverable for **Lords Institute of Engineering and Technology (LIET)**, Hyderabad.  
Internal campus software — All rights reserved.
