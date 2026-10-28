'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Booking } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { BookingTimeline } from '@/components/bookings/BookingTimeline';
import { RazorpayCheckoutModal } from '@/components/payments/RazorpayCheckoutModal';
import {
  CalendarCheck,
  MapPin,
  Clock,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Printer,
  ChevronLeft,
  Star,
  MessageSquare,
} from 'lucide-react';
import { formatDate, formatTime, formatCurrency, STATUS_META } from '@/lib/utils/utils';

export default function StudentBookingDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals & Forms
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Feedback State
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const fetchBooking = async () => {
    try {
      const res = await fetch(`/api/bookings/${id}`);
      if (!res.ok) throw new Error('Failed to load booking details');
      const data = await res.json();
      setBooking(data.booking || null);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const handleCancelBooking = async () => {
    setCancelling(true);
    try {
      const res = await fetch(`/api/bookings/${id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Cancellation failed');
      }

      setShowCancelModal(false);
      fetchBooking();
    } catch (err: unknown) {
      const e = err as Error;
      alert(`Error cancelling: ${e.message}`);
    } finally {
      setCancelling(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    setSubmittingFeedback(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: booking.id,
          service_id: booking.service_id,
          rating,
          review,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit feedback');
      }

      setFeedbackSuccess(true);
    } catch (err: unknown) {
      const e = err as Error;
      alert(`Feedback error: ${e.message}`);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="animate-spin w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full mx-auto" />
        <p className="text-xs text-slate-500">Loading reservation pass...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="py-16 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold text-navy-900">Booking Not Found</h2>
        <p className="text-xs text-slate-500">This reservation does not exist or you lack authorization to inspect it.</p>
        <Link href="/student/bookings">
          <Button variant="outline" size="sm" className="text-xs mt-2">
            Return to Bookings
          </Button>
        </Link>
      </div>
    );
  }

  const statusMeta = STATUS_META[booking.status] || {
    label: booking.status,
    badgeClass: 'bg-slate-100 text-slate-700',
    dotClass: 'bg-slate-400',
  };

  const isEligibleForPayment = booking.status === 'pending_payment' && booking.total_price > 0;
  const isEligibleForCancellation = ['pending', 'pending_payment', 'confirmed'].includes(booking.status);
  const isEligibleForFeedback = ['confirmed', 'completed'].includes(booking.status);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Razorpay Modal */}
      {showCheckout && (
        <RazorpayCheckoutModal
          bookingId={booking.id}
          bookingReference={booking.booking_reference}
          amount={Number(booking.total_price)}
          serviceTitle={booking.service?.title || 'Campus Facility'}
          onSuccess={() => {
            setShowCheckout(false);
            fetchBooking();
          }}
          onClose={() => setShowCheckout(false)}
        />
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in-50">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-rose-600">
              <XCircle className="w-6 h-6" />
              <h3 className="font-bold text-navy-900 text-base">
                Cancel Reservation?
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to cancel booking <strong>{booking.booking_reference}</strong>? Your slot will be released back to the campus availability pool immediately.
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Reason for Cancellation
              </label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Schedule conflict, project postponed..."
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCancelModal(false)}
                className="text-xs"
              >
                Keep Booking
              </Button>
              <Button
                variant="destructive"
                size="sm"
                isLoading={cancelling}
                onClick={handleCancelBooking}
                className="text-xs font-bold"
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/student/bookings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Bookings</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Pass</span>
          </button>
        </div>
      </div>

      {/* Pass Card Container */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-card overflow-hidden">
        {/* Pass Top Banner */}
        <div className="p-6 bg-gradient-to-r from-navy-900 via-navy-800 to-brand-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-300">
              Campus Service Pass
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {booking.service?.title}
            </h1>
            <p className="text-xs text-slate-300 font-mono">
              Ref ID: {booking.booking_reference}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur ${statusMeta.badgeClass}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`} />
              {statusMeta.label}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Key Information Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Reservation Date</span>
              <span className="font-bold text-navy-900">
                {formatDate(booking.booking_date)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Time Window</span>
              <span className="font-bold text-navy-900">
                {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Location</span>
              <span className="font-bold text-navy-900 truncate block">
                {booking.service?.location}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Total Amount</span>
              <span className="font-extrabold text-brand-600">
                {formatCurrency(Number(booking.total_price))}
              </span>
            </div>
          </div>

          {/* Pending Payment Alert & CTA */}
          {isEligibleForPayment && (
            <div className="p-5 rounded-xl border border-amber-300 bg-amber-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                  <CreditCard className="w-4 h-4 text-amber-600" />
                  <span>Action Required: Complete Fee Payment</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed max-w-lg">
                  Please complete the payment of <strong>{formatCurrency(Number(booking.total_price))}</strong> via Razorpay to lock and confirm your reservation slot.
                </p>
              </div>

              <Button
                onClick={() => setShowCheckout(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-1.5 shrink-0 shadow-sm"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay with Razorpay</span>
              </Button>
            </div>
          )}

          {/* Status Timeline */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900">
              Booking Progress Timeline
            </h3>
            <div className="p-5 rounded-xl border border-slate-200/80 bg-white">
              <BookingTimeline
                status={booking.status}
                isPaid={!!booking.payment && booking.payment.status === 'captured'}
                price={Number(booking.total_price)}
              />
            </div>
          </div>

          {/* Purpose and Special Notes */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900">
              Booking Statement
            </h3>
            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Stated Purpose: </span>
                <span className="text-navy-900 font-semibold">{booking.purpose || 'None'}</span>
              </div>
              {booking.notes && (
                <div>
                  <span className="text-slate-400 font-medium">Special Notes: </span>
                  <span className="text-slate-700">{booking.notes}</span>
                </div>
              )}
              {booking.rejection_reason && (
                <div className="text-rose-700 font-semibold pt-1">
                  Reason for rejection: {booking.rejection_reason}
                </div>
              )}
              {booking.cancellation_reason && (
                <div className="text-slate-600 italic pt-1">
                  Cancellation rationale: {booking.cancellation_reason}
                </div>
              )}
            </div>
          </div>

          {/* Actions & Cancellation */}
          {isEligibleForCancellation && (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                No longer need this reservation?
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelModal(true)}
                className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs font-bold"
              >
                Cancel Reservation
              </Button>
            </div>
          )}

          {/* Feedback Form for completed or confirmed bookings */}
          {isEligibleForFeedback && (
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900">
                  Rate Facility Experience
                </h3>
              </div>

              {feedbackSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Thank you! Your feedback has been recorded for the campus administration.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmitFeedback} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Rating (1 to 5 Stars)
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`p-1 transition-transform ${star <= rating ? 'text-amber-500 scale-110' : 'text-slate-300'}`}
                        >
                          <Star className="w-5 h-5 fill-current" />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-navy-900 ml-2">
                        {rating} / 5 Stars
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your Comments or Suggestions
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      placeholder="How was the equipment condition, room cleanliness, or support staff assistance?"
                      className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="sm"
                    isLoading={submittingFeedback}
                    className="font-bold text-xs"
                  >
                    Submit Review
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
