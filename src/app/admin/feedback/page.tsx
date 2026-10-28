import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { MessageSquare, Star, CheckCircle2, User } from 'lucide-react';
import { formatDate } from '@/lib/utils/utils';

export const revalidate = 0;

export default async function AdminFeedbackPage() {
  const supabase = await createClient();

  const { data: feedbackList, error } = await supabase
    .from('feedback')
    .select('*, service:services(title), user:profiles(full_name, email, department)')
    .order('created_at', { ascending: false });

  const list = feedbackList || [];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
          <MessageSquare className="w-4 h-4" />
          <span>Quality Assurance</span>
        </div>
        <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">
          Facility Feedback & Ratings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Student reviews on laboratory equipment condition, auditorium acoustics, and staff support.
        </p>
      </div>

      {list.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-white space-y-2">
          <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="font-bold text-navy-900 text-sm">No reviews submitted yet</h3>
          <p className="text-xs text-slate-500">Student reviews for completed reservations will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map((f) => (
            <div
              key={f.id}
              className="p-5 rounded-xl border border-slate-200/90 bg-white shadow-card space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-navy-900 text-sm">
                    {f.service?.title || 'Campus Facility'}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{f.user?.full_name || f.user?.email || 'Student'}</span>
                    <span>•</span>
                    <span>{f.user?.department || 'LIET'}</span>
                  </div>
                </div>

                <div className="flex items-center text-amber-500 shrink-0">
                  {Array.from({ length: f.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                &quot;{f.review}&quot;
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Submitted on {formatDate(f.created_at)}</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified Reservation
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
