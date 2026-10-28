import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/server';
import {
  MapPin,
  Users,
  Clock,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { ServiceCategory } from '@/types/database';
import { CATEGORY_META, formatCurrency } from '@/lib/utils/utils';

export const revalidate = 60;

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: service, error } = await supabase
    .from('services')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !service) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  const meta = CATEGORY_META[service.category as ServiceCategory] || {
    label: service.category,
    badgeClass: 'bg-slate-100 text-slate-700',
  };

  const bookingUrl = user
    ? `/student/services/${service.slug}`
    : `/auth/login?redirect=/student/services/${service.slug}`;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header profile={profile} />

      {/* Breadcrumb Navigation */}
      <div className="border-b border-slate-100 bg-slate-50/60 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-navy-900 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/services" className="hover:text-navy-900 transition-colors">
            Services
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-navy-900 truncate">
            {service.title}
          </span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-10 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Visual & Details */}
          <div className="lg:col-span-8 space-y-8">
            {/* Visual Hero */}
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/90 shadow-md">
              {service.image_url ? (
                <Image
                  src={service.image_url}
                  alt={service.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 800px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                  No image available
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-xs ${meta.badgeClass}`}>
                  {meta.label}
                </span>
              </div>
            </div>

            {/* Title & Core Location */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight">
                {service.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600">
                <div className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>{service.location}</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Users className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Max Capacity: {service.capacity}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="border-t border-slate-100 pt-6 space-y-3">
              <h2 className="text-base font-bold text-navy-900 uppercase tracking-wider text-xs">
                About this Campus Facility
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {service.description}
              </p>
            </div>

            {/* Booking Policies and Operating Rules */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-600" />
                <span>Reservation Guidelines & Policies</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                  <span className="text-slate-400 block mb-1">Advance Notice</span>
                  <span className="font-bold text-navy-900">
                    {service.booking_rules?.min_notice_hours || 2} Hours Prior
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                  <span className="text-slate-400 block mb-1">Booking Window</span>
                  <span className="font-bold text-navy-900">
                    Up to {service.booking_rules?.max_advance_days || 14} Days
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                  <span className="text-slate-400 block mb-1">Approval Protocol</span>
                  <span className="font-bold text-navy-900">
                    {service.booking_rules?.requires_approval
                      ? 'Requires Faculty Approval'
                      : 'Instant Concurrency Lock'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Reservation Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card space-y-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Standard Rate
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-navy-900">
                    {formatCurrency(Number(service.price))}
                  </span>
                  {service.price > 0 && (
                    <span className="text-xs text-slate-500">/ reservation session</span>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-brand-50/70 border border-brand-200/80 text-xs text-brand-900 space-y-1.5">
                <div className="flex items-center gap-2 font-bold">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  <span>Interactive Real-Time Booking</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Log in to access live 7-day slot availability, choose preferred time blocks, and secure reservations immediately.
                </p>
              </div>

              <div className="space-y-3">
                <Link href={bookingUrl}>
                  <Button size="lg" className="w-full font-bold text-sm shadow-md gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{user ? 'Proceed to Slot Booking' : 'Sign In to Book'}</span>
                  </Button>
                </Link>

                <p className="text-[11px] text-center text-slate-400">
                  Restricted to verified LIET students, faculty, and administrative staff.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
