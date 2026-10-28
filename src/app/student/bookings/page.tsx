'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Booking, BookingStatus } from '@/types/database';
import { Button } from '@/components/ui/Button';
import {
  CalendarCheck,
  Search,
  ArrowRight,
  Clock,
  MapPin,
  AlertCircle,
  CreditCard,
} from 'lucide-react';
import { formatDate, formatTime, formatCurrency, STATUS_META } from '@/lib/utils/utils';

export default function StudentBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchBookings() {
      setLoading(true);
      try {
        const url = activeTab === 'all' ? '/api/bookings' : `/api/bookings?status=${activeTab}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setBookings(data.bookings || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, [activeTab]);

  const filteredBookings = bookings.filter((b) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      b.booking_reference.toLowerCase().includes(query) ||
      b.service?.title.toLowerCase().includes(query) ||
      (b.purpose && b.purpose.toLowerCase().includes(query))
    );
  });

  const tabs = [
    { key: 'all', label: 'All Bookings' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'pending', label: 'Pending Review' },
    { key: 'pending_payment', label: 'Pending Payment' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
            <CalendarCheck className="w-4 h-4" />
            <span>Reservation History</span>
          </div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">
            My Campus Bookings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track reservation status, download passes, execute payments, and submit reviews.
          </p>
        </div>

        <Link href="/student/services">
          <Button size="sm" className="font-bold text-xs gap-1.5 shadow-sm">
            <span>New Reservation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-3">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === t.key
                  ? 'bg-navy-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reference or facility..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-navy-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-5 rounded-xl border border-slate-200 bg-white animate-pulse h-24"
            />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-white space-y-3">
          <CalendarCheck className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="font-bold text-navy-900 text-sm">No reservations found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeTab === 'all'
              ? 'You have not booked any campus facilities yet.'
              : `No bookings found with status '${activeTab}'.`}
          </p>
          <Link href="/student/services" className="inline-block pt-1">
            <Button size="sm" variant="outline" className="text-xs font-bold">
              Explore Facilities Directory
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((b) => {
            const statusMeta = STATUS_META[b.status] || {
              label: b.status,
              badgeClass: 'bg-slate-100 text-slate-700',
              dotClass: 'bg-slate-400',
            };

            return (
              <div
                key={b.id}
                className="p-5 rounded-xl border border-slate-200/90 bg-white shadow-card hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Info */}
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xs font-extrabold text-navy-900 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                      {b.booking_reference}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusMeta.badgeClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`} />
                      {statusMeta.label}
                    </span>
                    {b.total_price > 0 && (
                      <span className="text-xs font-bold text-slate-600">
                        {formatCurrency(Number(b.total_price))}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-navy-900 text-sm sm:text-base truncate">
                    {b.service?.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-brand-700">
                      <Clock className="w-3.5 h-3.5 text-brand-600" />
                      {formatDate(b.booking_date)} ({formatTime(b.start_time)} – {formatTime(b.end_time)})
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <MapPin className="w-3.5 h-3.5" />
                      {b.service?.location}
                    </span>
                  </div>

                  {b.purpose && (
                    <p className="text-xs text-slate-600 line-clamp-1 italic">
                      &quot;{b.purpose}&quot;
                    </p>
                  )}
                </div>

                {/* Action button */}
                <div className="flex items-center gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {b.status === 'pending_payment' && (
                    <Link href={`/student/bookings/${b.id}`}>
                      <Button size="sm" className="bg-amber-600 hover:bg-amber-700 font-bold text-xs gap-1.5">
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pay Now</span>
                      </Button>
                    </Link>
                  )}

                  <Link href={`/student/bookings/${b.id}`}>
                    <Button variant="outline" size="sm" className="font-bold text-xs gap-1">
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
