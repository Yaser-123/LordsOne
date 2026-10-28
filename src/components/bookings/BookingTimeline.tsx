import React from 'react';
import { BookingStatus } from '@/types/database';
import { Check, Clock, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils/utils';

interface BookingTimelineProps {
  status: BookingStatus;
  isPaid: boolean;
  price: number;
}

export function BookingTimeline({
  status,
  isPaid,
  price,
}: BookingTimelineProps) {
  const isCancelled = status === 'cancelled';
  const isRejected = status === 'rejected';

  const steps = [
    {
      id: 'submitted',
      label: 'Request Submitted',
      description: 'Reservation requested in campus system',
      isCompleted: true,
      isActive: false,
    },
    {
      id: 'payment',
      label: price > 0 ? 'Payment Verified' : 'Fee Waiver (Free)',
      description: price > 0 ? (isPaid ? 'Razorpay transaction confirmed' : 'Awaiting payment') : 'Complimentary institutional facility',
      isCompleted: price === 0 || isPaid || status === 'confirmed' || status === 'completed',
      isActive: status === 'pending_payment',
    },
    {
      id: 'confirmed',
      label: 'Slot Confirmed',
      description: 'Capacity locked and faculty clearance active',
      isCompleted: status === 'confirmed' || status === 'completed',
      isActive: status === 'pending',
    },
    {
      id: 'completed',
      label: 'Service Fulfilled',
      description: 'Facility utilized and session closed',
      isCompleted: status === 'completed',
      isActive: status === 'confirmed',
    },
  ];

  if (isCancelled || isRejected) {
    return (
      <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/70 text-rose-800 space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-sm">
          {isCancelled ? (
            <XCircle className="w-4 h-4 text-rose-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          )}
          <span>
            {isCancelled ? 'Booking Cancelled' : 'Booking Request Declined'}
          </span>
        </div>
        <p className="text-xs text-rose-700 leading-relaxed">
          {isCancelled
            ? 'This reservation was formally cancelled. Released slot capacity has been restored to the campus availability pool.'
            : 'The facility coordinator or administrator could not approve this booking request.'}
        </p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {steps.map((step) => {
        return (
          <div key={step.id} className="relative flex items-start gap-3.5">
            {/* Step Icon Node */}
            <div
              className={cn(
                'absolute -left-6 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ring-4 ring-white transition-all',
                step.isCompleted
                  ? 'bg-emerald-600 text-white'
                  : step.isActive
                  ? 'bg-brand-600 text-white animate-pulse'
                  : 'bg-slate-200 text-slate-400'
              )}
            >
              {step.isCompleted ? (
                <Check className="w-3 h-3 stroke-[3]" />
              ) : step.isActive ? (
                <Clock className="w-3 h-3" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              )}
            </div>

            <div>
              <h4
                className={cn(
                  'text-xs font-bold',
                  step.isCompleted
                    ? 'text-navy-900'
                    : step.isActive
                    ? 'text-brand-600'
                    : 'text-slate-400'
                )}
              >
                {step.label}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
