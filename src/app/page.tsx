import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ServiceCard } from '@/components/services/ServiceCard';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/server';
import {
  Compass,
  CalendarCheck,
  ShieldCheck,
  Zap,
  ArrowRight,
  Layers,
  Sparkles,
  Award,
} from 'lucide-react';
import { CATEGORY_META } from '@/lib/utils/utils';
import { ServiceCategory } from '@/types/database';

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch current user if logged in
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

  // Fetch featured services
  const { data: featuredServices } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .limit(6);

  const services = featuredServices || [];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header profile={profile} />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-100 bg-gradient-to-b from-white via-slate-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading & Value Prop */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-bold tracking-wide uppercase shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>LIET Hyderabad Smart Campus Gateway</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-900 tracking-tight leading-[1.15]">
                One Campus. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">
                  Everything Connected.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                Reserve advanced robotics laboratories, acoustic auditoriums, floodlit sports courts, and campus media studios in seconds. Transparent schedules, atomic slot locking, and seamless digital accountability.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link href={profile ? '/student/dashboard' : '/auth/register'}>
                  <Button size="lg" className="w-full sm:w-auto font-bold gap-2 text-sm shadow-md">
                    <span>{profile ? 'Go to My Dashboard' : 'Get Started with LIET ID'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>

                <Link href="/services">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto font-semibold text-sm">
                    <Compass className="w-4 h-4 mr-2 text-slate-500" />
                    Browse All Facilities
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-200/70 grid grid-cols-3 gap-4 max-w-lg">
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-navy-900">
                    12+
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Campus Facilities
                  </div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-navy-900">
                    380+
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Weekly Time Slots
                  </div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-navy-900">
                    100%
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Paperless Booking
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto rounded-2xl border border-slate-200/90 bg-white p-3 shadow-2xl overflow-hidden group">
                <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-900">
                  <Image
                    src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1000&q=80"
                    alt="Sir CV Raman Central Auditorium"
                    fill
                    sizes="(max-width: 768px) 100vw, 500px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent" />

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/90 text-white backdrop-blur uppercase tracking-wider mb-2 inline-block">
                      Featured Facility
                    </span>
                    <h3 className="text-lg font-bold">Sir CV Raman Central Auditorium</h3>
                    <p className="text-xs text-slate-300 mt-0.5">450-seat Dolby acoustic presentation space</p>
                  </div>
                </div>

                {/* Floating Real-time Slot Card */}
                <div className="absolute -bottom-4 -left-4 sm:bottom-6 sm:-left-6 bg-white/95 backdrop-blur border border-slate-200/90 rounded-xl p-3.5 shadow-xl max-w-[220px]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      Live Availability
                    </span>
                  </div>
                  <p className="text-xs font-bold text-navy-900">Today: 14:00 - 16:00</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Instant booking confirmation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Campus Categories Section */}
      <section className="py-16 bg-slate-50/60 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2 block">
              Campus Infrastructure
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
              Categorized for Instant Campus Access
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Explore specialized engineering workshops, competitive athletic courts, and student utility hubs across the LIET campus.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(CATEGORY_META).map(([key, item]) => (
              <Link
                key={key}
                href={`/services?category=${key}`}
                className="group p-5 rounded-xl border border-slate-200/80 bg-white hover:border-brand-500 hover:shadow-md transition-all text-center flex flex-col items-center justify-between"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-brand-50 border border-slate-100 group-hover:border-brand-200 flex items-center justify-center text-slate-700 group-hover:text-brand-600 transition-colors mb-3">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-navy-900 group-hover:text-brand-600 transition-colors">
                  {item.label}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  Browse slots
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services Showcase */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-1.5 block">
                Top Booked Facilities
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
                Featured Campus Services
              </h2>
            </div>
            <Link href="/services">
              <Button variant="outline" size="sm" className="font-semibold text-xs gap-1.5">
                <span>View All 12 Services</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc) => (
              <ServiceCard key={svc.id} service={svc} hrefPrefix="/services" />
            ))}
          </div>
        </div>
      </section>

      {/* Key Architectural Pillars */}
      <section className="py-16 bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400 mb-2 block">
              Built for Reliability
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Engineered for Enterprise Campus Operations
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              LordsOne is built with strict database isolation, concurrency locking, and audited financial logs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                Atomic Concurrency Protection
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                PostgreSQL row-level locking ensures two students cannot reserve the same equipment or seat simultaneously. Capacity is guaranteed.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                Role-Based Security & RLS
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Supabase Row Level Security ensures students can only view their own records, while administrators review approvals with tamper-proof audit trails.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                Cryptographic Payment Verification
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Razorpay Checkout integration verifies HMAC signatures on the server before updating booking status. Revenue metrics reflect verified captured funds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-brand-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Reserve Your Campus Facility?
          </h2>
          <p className="text-sm sm:text-base text-brand-100 max-w-xl mx-auto leading-relaxed">
            Sign in with your student credentials to reserve slots, track your requests, and unlock seamless campus access today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-brand-700 hover:bg-slate-100 font-bold px-8 shadow-lg">
                Create Account
              </Button>
            </Link>
            <Link href="/services">
              <Button variant="outline" size="lg" className="border-white/40 text-white hover:bg-brand-700 font-semibold px-6">
                Browse Campus Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
