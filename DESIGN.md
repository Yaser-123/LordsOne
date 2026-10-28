---
name: LordsOne Campus System
colors:
  primary: "#0F172A"
  secondary: "#475569"
  accent: "#2563EB"
  accent-hover: "#1D4ED8"
  background: "#FFFFFF"
  surface: "#F8FAFC"
  surface-hover: "#F1F5F9"
  border: "#E2E8F0"
  border-subtle: "#F1F5F9"
  text-primary: "#0F172A"
  text-secondary: "#475569"
  text-muted: "#94A3B8"
  success: "#10B981"
  success-bg: "#ECFDF5"
  warning: "#F59E0B"
  warning-bg: "#FFFBEB"
  error: "#EF4444"
  error-bg: "#FEF2F2"
  info: "#0284C7"
  info-bg: "#F0F9FF"
typography:
  font-family-body: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  font-family-heading: "Outfit, Inter, sans-serif"
  font-family-mono: "JetBrains Mono, monospace"
  heading-xl:
    fontSize: "32px"
    fontWeight: 700
    lineHeight: "1.2"
    letterSpacing: "-0.025em"
  heading-lg:
    fontSize: "24px"
    fontWeight: 600
    lineHeight: "1.3"
    letterSpacing: "-0.02em"
  heading-md:
    fontSize: "20px"
    fontWeight: 600
    lineHeight: "1.4"
    letterSpacing: "-0.015em"
  body-md:
    fontSize: "15px"
    fontWeight: 400
    lineHeight: "1.5"
  body-sm:
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "1.4"
  label-caps:
    fontSize: "11px"
    fontWeight: 600
    lineHeight: "1.2"
    letterSpacing: "0.05em"
    textTransform: "uppercase"
shapes:
  rounded-sm: "6px"
  rounded-md: "10px"
  rounded-lg: "14px"
  rounded-xl: "20px"
  rounded-full: "9999px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#FFFFFF"
    rounded: "{shapes.rounded-md}"
    padding: "10px 18px"
    fontSize: "14px"
    fontWeight: 500
  button-secondary:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.primary}"
    borderColor: "{colors.border}"
    rounded: "{shapes.rounded-md}"
    padding: "10px 18px"
  card:
    backgroundColor: "#FFFFFF"
    borderColor: "{colors.border}"
    rounded: "{shapes.rounded-lg}"
    shadow: "0 1px 3px rgba(15, 23, 42, 0.05)"
---

## Overview
LordsOne is designed with a clean, light, editorial SaaS aesthetic. It merges high-density academic administrative capabilities with a friendly, consumer-grade student booking experience. The interface prioritizes typographic hierarchy, disciplined layout rhythm, crystal-clear status cues, and zero visual clutter.

## Colors
- **Deep Navy (`#0F172A`):** Anchors primary headings, core shell chrome, and high-emphasis textual markers.
- **Electric Sapphire (`#2563EB`):** The functional accent color, directing focus to actionable items, booking steps, and active tabs.
- **Slate Secondary (`#475569`):** Provides soft contrast for descriptive text, secondary navigation, and metadata labels.
- **Subtle Surfaces (`#F8FAFC`, `#F1F5F9`):** Neutral canvas layers separating headers, sidebars, and interactive cards.
- **Semantic Badges:**
  - *Confirmed / Completed:* Emerald `#10B981` on `#ECFDF5`
  - *Pending Action / Approval:* Amber `#F59E0B` on `#FFFBEB`
  - *Cancelled / Rejected:* Rose `#EF4444` on `#FEF2F2`
  - *Capacity / Slot Indicator:* Sky `#0284C7` on `#F0F9FF`

## Typography
- **Headings & Numbers:** `Outfit` (Geometric, contemporary confidence with slight negative tracking).
- **Body & Controls:** `Inter` (Optimized for micro-reading, dense data grids, form labels, and timestamps).
- **Codes & References:** `JetBrains Mono` (Used for Booking Reference `L1-BK-XXXX` and transaction IDs).

## Layout
- **8pt Modular System:** Spacing scales strictly in 4px/8px increments (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`).
- **Responsive Application Shell:**
  - Collapsible desktop sidebar (260px expanded, 72px icon mode).
  - Compact sticky top navigation (60px height) featuring unified search, notification counter, and role-aware profile drawer.
  - Dedicated mobile bottom sheet and drawer navigation for on-campus smartphone booking.
  - Max content container: `1400px` for high-density administrative tables and analytics dashboards.

## Elevation & Depth
- **Soft Layered Shadows:**
  - Cards: `0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.04)`
  - Elevated Popovers & Modals: `0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.06)`
- **Clean Borders:** 1px hairline `#E2E8F0` defines cards, inputs, and tab navigation rather than heavy drop-shadows.

## Shapes
- **Corner Radii:**
  - Micro tags, status chips: `6px` (`rounded-sm`)
  - Buttons, inputs, dropdown menus: `10px` (`rounded-md`)
  - Service cards, modal containers: `14px` (`rounded-lg`)
  - Avatars, pill badges: `9999px` (`rounded-full`)

## Components
- **Service Discovery Card:** High-contrast facility visual, category badge, real-time slot availability counter, location pill, and pricing snapshot.
- **Interactive Slot Selector:** Visual time-grid displaying capacity states (Available, Limited, Full, Past) with instant duration computation.
- **Booking Status Timeline:** 5-stage sequential tracker from `Pending Verification` through `Confirmed`, `In Service`, and `Completed`.
- **Admin Metric KPI Card:** Delta comparison indicators, sparkline trends, and grounded database aggregations.

## Do's and Don'ts
- ✅ **DO** ensure high contrast (WCAG 2.1 AA/AAA compliance) between text and background surfaces.
- ✅ **DO** display real-time slot capacities to prevent double bookings.
- ❌ **DON'T** use generic lorem ipsum copy or fake metrics in analytics dashboards.
- ❌ **DON'T** rely on bright neon gradients or blurry glassmorphism that degrades accessibility.
