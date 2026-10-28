import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { CreditCard, IndianRupee, ShieldCheck, ArrowRight } from 'lucide-react';
import { PaymentStatus } from '@/types/database';
import { formatCurrency, formatDate, PAYMENT_STATUS_META } from '@/lib/utils/utils';

export const revalidate = 0;

export default async function AdminPaymentsPage() {
  const supabase = await createClient();

  const { data: payments, error } = await supabase
    .from('payments')
    .select('*, booking:bookings(booking_reference, service:services(title)), user:profiles(full_name, email)')
    .order('created_at', { ascending: false });

  const list = payments || [];
  const totalVerified = list
    .filter((p) => p.status === 'captured')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
            <CreditCard className="w-4 h-4" />
            <span>Financial Governance</span>
          </div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">
            Razorpay Transaction Logs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Full ledger of campus service booking fees, Razorpay order IDs, and cryptographic verification statuses.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Captured Revenue
            </span>
            <div className="text-xl font-extrabold text-navy-900">
              {formatCurrency(totalVerified)}
            </div>
          </div>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-white space-y-2">
          <CreditCard className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="font-bold text-navy-900 text-sm">No transaction records</h3>
          <p className="text-xs text-slate-500">
            Payment transactions initiated through the Razorpay checkout portal will appear here.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200/90 bg-white shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Booking Ref & Student</th>
                  <th className="p-4">Service Facility</th>
                  <th className="p-4">Razorpay Order / Payment ID</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Verification Status</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 text-right">Pass Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {list.map((p) => {
                  const meta = PAYMENT_STATUS_META[p.status as PaymentStatus] || {
                    label: p.status,
                    badgeClass: 'bg-slate-100 text-slate-700',
                  };

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4">
                        <div className="font-mono font-bold text-navy-900">
                          {p.booking?.booking_reference || 'Ref N/A'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {p.user?.full_name || p.user?.email || 'Student'}
                        </div>
                      </td>

                      <td className="p-4 font-semibold text-slate-800">
                        {p.booking?.service?.title || 'Campus Facility'}
                      </td>

                      <td className="p-4 font-mono text-[11px] text-slate-500">
                        <div>Order: {p.razorpay_order_id || 'Mock'}</div>
                        {p.razorpay_payment_id && (
                          <div className="text-[10px] text-slate-400">
                            Pay: {p.razorpay_payment_id}
                          </div>
                        )}
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

                      <td className="p-4 text-slate-400">
                        {formatDate(p.created_at)}
                      </td>

                      <td className="p-4 text-right">
                        <Link
                          href={`/student/bookings/${p.booking_id}`}
                          className="inline-flex items-center gap-1 font-bold text-brand-600 hover:text-brand-700 hover:underline"
                        >
                          <span>Pass</span>
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
