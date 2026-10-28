'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Booking, BookingStatus } from '@/types/database';
import { Button } from '@/components/ui/Button';
import {
  CalendarCheck2,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Check,
  Ban,
  ArrowRight,
} from 'lucide-react';
import { formatDate, formatTime, formatCurrency, STATUS_META } from '@/lib/utils/utils';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Rejection modal
  const [rejectingBooking, setRejectingBooking] = useState<Booking | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const url = statusFilter === 'all' ? '/api/admin/bookings' : `/api/admin/bookings?status=${statusFilter}`;
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
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleUpdateStatus = async (id: string, newStatus: string, reason?: string) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: newStatus,
          reason: reason || (newStatus === 'confirmed' ? 'Approved by campus administrator' : undefined),
        }),
      });

      if (res.ok) {
        setRejectingBooking(null);
        setRejectReason('');
        fetchBookings();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update booking status');
      }
    } catch (err: unknown) {
      const e = err as Error;
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = bookings.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.booking_reference.toLowerCase().includes(q) ||
      b.service?.title.toLowerCase().includes(q) ||
      (b.profile?.full_name && b.profile.full_name.toLowerCase().includes(q)) ||
      (b.profile?.email && b.profile.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Rejection Modal */}
      {rejectingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in-50">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-rose-600">
              <Ban className="w-5 h-5" />
              <h3 className="font-bold text-navy-900 text-base">
                Decline Reservation Request
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              Booking <strong>{rejectingBooking.booking_reference}</strong> for {rejectingBooking.service?.title} will be marked as rejected and slot capacity will be freed.
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Reason for Rejection <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Facility undergoing scheduled maintenance, exam period blackout..."
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRejectingBooking(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                isLoading={actionLoading}
                onClick={() => handleUpdateStatus(rejectingBooking.id, 'rejected', rejectReason)}
                className="text-xs font-bold"
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
            <CalendarCheck2 className="w-4 h-4" />
            <span>Administrative Governance</span>
          </div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">
            Booking Requests & Approvals
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Authorize faculty reservations, decline conflicting slots, and record institutional logs.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {['all', 'pending', 'pending_payment', 'confirmed', 'completed', 'cancelled', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === status
                  ? 'bg-navy-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student or ref..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-white space-y-2">
          <CalendarCheck2 className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="font-bold text-navy-900 text-sm">No reservations found</h3>
          <p className="text-xs text-slate-500">There are no records matching the selected status or query.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200/90 bg-white shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Reference & Student</th>
                  <th className="p-4">Facility Requested</th>
                  <th className="p-4">Scheduled Slot</th>
                  <th className="p-4">Fee</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((b) => {
                  const statusMeta = STATUS_META[b.status] || {
                    label: b.status,
                    badgeClass: 'bg-slate-100 text-slate-700',
                    dotClass: 'bg-slate-400',
                  };

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4">
                        <div className="font-mono font-bold text-navy-900">{b.booking_reference}</div>
                        <div className="text-[11px] text-slate-500">
                          {b.profile?.full_name || b.profile?.email} ({b.profile?.department || 'LIET'})
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{b.service?.title}</div>
                        <div className="text-[10px] text-slate-400">{b.service?.location}</div>
                      </td>

                      <td className="p-4 text-slate-600">
                        <div>{formatDate(b.booking_date)}</div>
                        <div className="text-[10px] text-slate-400">
                          {formatTime(b.start_time)} – {formatTime(b.end_time)}
                        </div>
                      </td>

                      <td className="p-4 font-bold text-navy-900">
                        {formatCurrency(Number(b.total_price))}
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusMeta.badgeClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`} />
                          {statusMeta.label}
                        </span>
                      </td>

                      <td className="p-4 text-right space-x-2">
                        {b.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                              className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-700 text-[11px]"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectingBooking(b)}
                              className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-[11px] font-bold"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {b.status === 'confirmed' && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'completed', 'Service session successfully fulfilled')}
                            className="px-2.5 py-1 rounded bg-teal-600 text-white font-bold hover:bg-teal-700 text-[11px]"
                          >
                            Mark Completed
                          </button>
                        )}

                        <Link
                          href={`/student/bookings/${b.id}`}
                          className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 inline-block"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
