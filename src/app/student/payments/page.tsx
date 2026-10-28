import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { CreditCard, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { PaymentStatus } from '@/types/database';
import { formatDate, formatCurrency, PAYMENT_STATUS_META } from '@/lib/utils/utils';

export const revalidate = 0;

export default async function StudentPaymentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: payments, error } = await supabase
    .from('payments')
    .select('*, booking:bookings(booking_reference, service:services(title))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const paymentList = payments || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
          <CreditCard className="w-4 h-4" />
          <span>Financial Records</span>
        </div>
        <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">
          Payment & Transaction History
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Cryptographically verified transactions processed through Razorpay for campus reservations.
        </p>
      </div>

      {paymentList.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-white space-y-3">
          <CreditCard className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="font-bold text-navy-900 text-sm">No transaction records found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You have not executed any paid reservations yet. Free campus services do not generate payment records.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200/90 bg-white shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Transaction / Booking Ref</th>
                  <th className="p-4">Service Facility</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Gateway Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {paymentList.map((p) => {
                  const meta = PAYMENT_STATUS_META[p.status as PaymentStatus] || {
                    label: p.status,
                    badgeClass: 'bg-slate-100 text-slate-700',
                  };

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4">
                        <div className="font-mono font-bold text-navy-900">
                          {p.booking?.booking_reference || 'N/A'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Order: {p.razorpay_order_id || 'Mock'}
                        </div>
                      </td>

                      <td className="p-4 text-slate-700 font-semibold truncate max-w-[180px]">
                        {p.booking?.service?.title || 'Campus Facility'}
                      </td>

                      <td className="p-4 text-slate-500">
                        {formatDate(p.created_at)}
                      </td>

                      <td className="p-4 font-extrabold text-navy-900">
                        {formatCurrency(Number(p.amount))}
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${meta.badgeClass}`}
                        >
                          {meta.label}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <Link
                          href={`/student/bookings/${p.booking_id}`}
                          className="inline-flex items-center gap-1 font-bold text-brand-600 hover:text-brand-700 hover:underline"
                        >
                          <span>View Pass</span>
                          <ArrowRight className="w-3.5 h-3.5" />
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
