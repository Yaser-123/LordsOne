'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AnalyticsCharts } from '@/components/admin/AnalyticsCharts';
import { Button } from '@/components/ui/Button';
import {
  CalendarCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  IndianRupee,
  Layers,
  Users,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { formatCurrency, formatDate, formatTime, STATUS_META } from '@/lib/utils/utils';

export default function AdminDashboardPage() {
  const [data, setData] = useState<{
    metrics: {
      totalBookings: number;
      pendingRequests: number;
      confirmedBookings: number;
      completedBookings: number;
      cancelledBookings: number;
      totalRevenue: number;
      totalUsers: number;
      activeServices: number;
    };
    categoryDistribution: { category: string; count: number }[];
    bookingTrends: { date: string; bookings: number; revenue: number }[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recentActivity: any[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/analytics');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: newStatus,
          reason: newStatus === 'confirmed' ? 'Approved by campus administrator' : 'Declined per schedule capacity',
        }),
      });

      if (res.ok) {
        fetchAnalytics();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full mx-auto" />
        <p className="text-xs text-slate-500 mt-2">Computing live campus analytics...</p>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalBookings: 0,
    pendingRequests: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    totalUsers: 0,
    activeServices: 0,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block mb-1">
            Executive Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            Campus Operations & Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time reservations, capacity allocation, verified revenue, and service metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/admin/services/new">
            <Button size="sm" className="font-bold text-xs gap-1.5 shadow-sm">
              <span>Add Facility</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-slate-200/90 bg-white shadow-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Bookings
            </span>
            <CalendarCheck2 className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl font-extrabold text-navy-900">
            {metrics.totalBookings}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across all facilities</p>
        </div>

        <div className="p-5 rounded-xl border border-slate-200/90 bg-white shadow-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pending Queue
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-700">
            {metrics.pendingRequests}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting approval</p>
        </div>

        <div className="p-5 rounded-xl border border-slate-200/90 bg-white shadow-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Confirmed / Active
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700">
            {metrics.confirmedBookings}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Ready for campus use</p>
        </div>

        <div className="p-5 rounded-xl border border-slate-200/90 bg-white shadow-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Verified Revenue
            </span>
            <IndianRupee className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-navy-900">
            {formatCurrency(metrics.totalRevenue)}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Captured payments only</p>
        </div>
      </div>

      {/* Visual Recharts Section */}
      <AnalyticsCharts
        bookingTrends={data?.bookingTrends || []}
        categoryDistribution={data?.categoryDistribution || []}
      />

      {/* Recent Bookings Queue with Instant Approval */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-card overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-navy-900 text-sm sm:text-base">
              Recent Reservation Requests
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and act on student and faculty requests
            </p>
          </div>
          <Link
            href="/admin/bookings"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline"
          >
            Manage All
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Reference / Student</th>
                <th className="p-4">Service Facility</th>
                <th className="p-4">Requested Slot</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Administrative Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {(data?.recentActivity || []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No reservations recorded yet.
                  </td>
                </tr>
              ) : (
                data?.recentActivity.map((b) => {
                  const statusMeta = STATUS_META[b.status as keyof typeof STATUS_META] || {
                    label: b.status,
                    badgeClass: 'bg-slate-100 text-slate-700',
                    dotClass: 'bg-slate-400',
                  };

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4">
                        <div className="font-mono font-bold text-navy-900">
                          {b.booking_reference}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {b.profile?.full_name || b.profile?.email || 'Student User'}
                        </div>
                      </td>

                      <td className="p-4 font-semibold text-slate-800">
                        {b.service?.title}
                      </td>

                      <td className="p-4 text-slate-600">
                        <div>{formatDate(b.booking_date)}</div>
                        <div className="text-[10px] text-slate-400">
                          {formatTime(b.start_time)} – {formatTime(b.end_time)}
                        </div>
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
                              disabled={updatingId === b.id}
                              onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                              className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors text-[11px]"
                            >
                              Approve
                            </button>
                            <button
                              disabled={updatingId === b.id}
                              onClick={() => handleUpdateStatus(b.id, 'rejected')}
                              className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors text-[11px]"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <Link
                          href={`/student/bookings/${b.id}`}
                          className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-100 transition-colors text-[11px] font-semibold text-slate-600 inline-block"
                        >
                          Inspect
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
