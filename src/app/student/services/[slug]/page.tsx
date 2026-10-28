'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/image';
import { SlotPicker } from '@/components/services/SlotPicker';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RazorpayCheckoutModal } from '@/components/payments/RazorpayCheckoutModal';
import { Service, ServiceSlot } from '@/types/database';
import {
  MapPin,
  Users,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { CATEGORY_META, formatCurrency, formatTime, formatDate } from '@/lib/utils/utils';

export default function StudentBookingFlowPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<ServiceSlot | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Razorpay Checkout State for paid services
  const [checkoutBooking, setCheckoutBooking] = useState<{
    id: string;
    reference: string;
    amount: number;
  } | null>(null);

  useEffect(() => {
    async function fetchService() {
      try {
        const res = await fetch(`/api/services`);
        if (!res.ok) throw new Error('Failed to load service');
        const data = await res.json();
        const found = (data.services || []).find((s: Service) => s.slug === slug);
        setService(found || null);
      } catch (err: unknown) {
        const e = err as Error;
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchService();
  }, [slug]);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="animate-spin w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full mx-auto" />
        <p className="text-xs text-slate-500">Loading facility reservation details...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="py-16 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold text-navy-900">Facility Not Found</h2>
        <p className="text-xs text-slate-500">The requested campus service could not be located.</p>
      </div>
    );
  }

  const meta = CATEGORY_META[service.category] || {
    label: service.category,
    badgeClass: 'bg-slate-100 text-slate-700',
  };

  const totalPrice = Number(service.price) * quantity;
  const maxAvailableQuantity = selectedSlot
    ? selectedSlot.capacity - selectedSlot.booked_count
    : service.capacity;

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      setError('Please select an available time slot from the schedule.');
      return;
    }

    if (quantity > maxAvailableQuantity) {
      setError(`Requested quantity exceeds available capacity (${maxAvailableQuantity} available).`);
      return;
    }

    if (!purpose || purpose.trim().length < 5) {
      setError('Please describe the academic or operational purpose (min 5 characters).');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: service.id,
          slot_id: selectedSlot.id,
          booking_date: selectedDate,
          start_time: selectedSlot.start_time,
          end_time: selectedSlot.end_time,
          quantity: Number(quantity),
          purpose: purpose.trim(),
          notes: notes.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      // If pending payment, open checkout modal
      if (data.status === 'pending_payment' && data.total_price > 0) {
        setCheckoutBooking({
          id: data.booking_id,
          reference: data.booking_reference,
          amount: data.total_price,
        });
      } else {
        // Direct redirect to booking detail
        router.push(`/student/bookings/${data.booking_id}`);
      }
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Checkout Modal */}
      {checkoutBooking && (
        <RazorpayCheckoutModal
          bookingId={checkoutBooking.id}
          bookingReference={checkoutBooking.reference}
          amount={checkoutBooking.amount}
          serviceTitle={service.title}
          onSuccess={() => {
            router.push(`/student/bookings/${checkoutBooking.id}`);
          }}
          onClose={() => {
            router.push(`/student/bookings/${checkoutBooking.id}`);
          }}
        />
      )}

      {/* Top Breadcrumb & Header */}
      <div>
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${meta.badgeClass}`}>
          {meta.label}
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight mt-2">
          Reserve {service.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {service.location}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            Capacity: {service.capacity}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Booking Form Layout */}
      <form onSubmit={handleSubmitBooking} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Slot Selection */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card space-y-6">
            <SlotPicker
              serviceId={service.id}
              onSlotSelected={(slot, date) => {
                setSelectedSlot(slot);
                setSelectedDate(date);
              }}
            />
          </div>

          {/* Reservation Details Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900">
              3. Purpose & Attendee Details
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Attendees / Quantity
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={maxAvailableQuantity}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 h-10 px-3 border border-slate-300 rounded-lg text-sm text-navy-900 font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <span className="text-xs text-slate-500">
                    Maximum allowed for this slot: {maxAvailableQuantity}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Academic / Event Purpose <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Capstone project hardware testbed setup, IEEE student seminar, tournament match..."
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs text-navy-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Special Notes or Hardware Requirements (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Need 3-phase power, HDMI adapter, lapel microphones"
                  className="w-full h-10 px-3.5 border border-slate-300 rounded-lg text-xs text-navy-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Concurrency Guarantee */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card space-y-5 sticky top-24">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900">
              Reservation Summary
            </h3>

            {/* Selected Slot Snapshot */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Selected Date</span>
                <span className="font-bold text-navy-900">
                  {selectedDate ? formatDate(selectedDate) : 'Not selected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Time Window</span>
                <span className="font-bold text-navy-900">
                  {selectedSlot
                    ? `${formatTime(selectedSlot.start_time)} – ${formatTime(selectedSlot.end_time)}`
                    : 'Select a slot'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Quantity</span>
                <span className="font-bold text-navy-900">{quantity} attendee(s)</span>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Unit Rate</span>
                <span>{formatCurrency(Number(service.price))}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Quantity</span>
                <span>× {quantity}</span>
              </div>
              <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-sm">
                <span className="font-bold text-navy-900">Grand Total</span>
                <span className="text-xl font-extrabold text-brand-600">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
            </div>

            {/* Concurrency Safe Guarantee Badge */}
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-[11px] text-emerald-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Deterministic Concurrency Locking</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Your slot is reserved atomically on the PostgreSQL engine to guarantee zero double bookings.
              </p>
            </div>

            <Button
              type="submit"
              disabled={!selectedSlot}
              isLoading={submitting}
              className="w-full h-11 text-sm font-bold shadow-md gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>
                {totalPrice > 0 ? `Proceed to Pay ${formatCurrency(totalPrice)}` : 'Confirm Instant Reservation'}
              </span>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
