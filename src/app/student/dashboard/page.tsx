import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ServiceCard } from '@/components/services/ServiceCard';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Compass,
  ArrowRight,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { BookingStatus } from '@/types/database';
import { formatDate, formatTime, STATUS_META } from '@/lib/utils/utils';

export const revalidate = 0;

export default async function StudentDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Fetch Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // 2. Fetch User Bookings
  const { data: userBookings } = await supabase
    .from('bookings')
    .select('*, service:services(*), slot:service_slots(*)')
    .eq('user_id', user.id)
    .order('booking_date', { ascending: true })
    .order('start_time', { ascending: true });

  const bookings = userBookings || [];

  // Metrics
  const activeBookings = bookings.filter((b) =>
    ['confirmed', 'pending', 'pending_payment'].includes(b.status)
  );
  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
  const pendingCount = bookings.filter((b) =>
    ['pending', 'pending_payment'].includes(b.status)
  ).length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;

  // Next Upcoming Booking
  const upcomingBooking = activeBookings.find(
    (b) => b.status === 'confirmed' || b.status === 'pending'
  );

  // 3. Recommended / Popular Services
  const { data: popularServices } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .limit(3);

  const services = popularServices || [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy-900 via-navy-800 to-brand-900 text-white p-6 sm:p-8 shadow-card">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-300 border border-white/10 text-xs font-semibold backdrop-blur">
            <Sparkles className="w-3.5 h-3.5" />
            <span>LIET Smart Campus Portal</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {profile?.full_name || 'Student'}!
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {profile?.department || 'Engineering Department'} • Roll No:{' '}
            {profile?.roll_number || 'Registered'}
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link href="/student/services">
              <Button size="sm" className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs gap-1.5 shadow-sm">
                <Compass className="w-4 h-4" />
                <span>Reserve Facility</span>
              </Button>
            </Link>
            <Link href="/student/bookings">
              <Button variant="secondary" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-semibold text-xs">
                View My Bookings
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-slate-200/90 bg-white shadow-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Requests
            </span>
            <Clock className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl font-extrabold text-navy-900">
            {activeBookings.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Pending & confirmed</p>
        </div>

        <div className="p-5 rounded-xl border border-slate-200/90 bg-white shadow-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Confirmed
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700">
            {confirmedCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Ready for campus use</p>
        </div>

        <div className="p-5 rounded-xl border border-slate-200/90 bg-white shadow-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Awaiting Action
            </span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-700">
            {pendingCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Payment or review</p>
        </div>

        <div className="p-5 rounded-xl border border-slate-200/90 bg-white shadow-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Completed
            </span>
            <CalendarCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-extrabold text-navy-900">
            {completedCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Past reservations</p>
        </div>
      </div>

      {/* Next Upcoming Reservation Banner (if exists) */}
      {upcomingBooking && (
        <div className="p-5 rounded-xl border border-brand-200 bg-brand-50/50 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700">
                  Upcoming Session
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-mono text-xs text-slate-500 font-semibold">
                  {upcomingBooking.booking_reference}
                </span>
              </div>
              <h3 className="font-bold text-navy-900 text-sm mt-0.5">
                {upcomingBooking.service?.title}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1">
                <span className="font-semibold text-brand-700">
                  {formatDate(upcomingBooking.booking_date)}
                </span>
                <span>•</span>
                <span>
                  {formatTime(upcomingBooking.start_time)} – {formatTime(upcomingBooking.end_time)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-500">
                  <MapPin className="w-3 h-3" />
                  {upcomingBooking.service?.location}
                </span>
              </div>
            </div>
          </div>

          <Link href={`/student/bookings/${upcomingBooking.id}`}>
            <Button size="sm" className="font-bold text-xs gap-1.5 whitespace-nowrap">
              <span>View Pass Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* Two Column Layout: Recent Bookings & Recommended Facilities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Recent Bookings Table / List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-navy-900 tracking-tight">
              Recent Reservations
            </h2>
            <Link
              href="/student/bookings"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline"
            >
              See all ({bookings.length})
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 bg-white space-y-3">
              <CalendarCheck className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-navy-900">No bookings created yet</p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Explore campus laboratories, sports arenas, and equipment to make your first reservation.
              </p>
              <Link href="/student/services" className="inline-block pt-1">
                <Button size="sm" className="text-xs font-bold">
                  Browse Campus Facilities
                </Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200/90 bg-white shadow-card divide-y divide-slate-100 overflow-hidden">
              {bookings.slice(0, 5).map((b) => {
                const statusMeta = STATUS_META[b.status as BookingStatus] || {
                  label: b.status,
                  badgeClass: 'bg-slate-100 text-slate-700',
                  dotClass: 'bg-slate-400',
                };

                return (
                  <Link
                    key={b.id}
                    href={`/student/bookings/${b.id}`}
                    className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors group"
                  >
                    <div className="space-y-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-navy-900 truncate group-hover:text-brand-600 transition-colors">
                          {b.service?.title}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {b.booking_reference}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span>{formatDate(b.booking_date)}</span>
                        <span>•</span>
                        <span>{formatTime(b.start_time)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusMeta.badgeClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`} />
                        {statusMeta.label}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Quick Facility Discovery */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-navy-900 tracking-tight">
              Featured Campus Services
            </h2>
            <Link
              href="/student/services"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline"
            >
              Browse Directory
            </Link>
          </div>

          <div className="space-y-3">
            {services.map((svc) => (
              <ServiceCard
                key={svc.id}
                service={svc}
                hrefPrefix="/student/services"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
