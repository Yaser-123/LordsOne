'use client';

import React, { useState, useEffect } from 'react';
import { ServiceSlot } from '@/types/database';
import { formatTime, cn } from '@/lib/utils/utils';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface SlotPickerProps {
  serviceId: string;
  onSlotSelected: (slot: ServiceSlot | null, date: string) => void;
}

export function SlotPicker({ serviceId, onSlotSelected }: SlotPickerProps) {
  // Generate next 7 dates
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      iso: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      isToday: i === 0,
    };
  });

  const [selectedDate, setSelectedDate] = useState(dates[0].iso);
  const [slots, setSlots] = useState<ServiceSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSlots() {
      setLoading(true);
      setError(null);
      setSelectedSlotId(null);
      onSlotSelected(null, selectedDate);

      try {
        const res = await fetch(`/api/slots?service_id=${serviceId}&date=${selectedDate}`);
        if (!res.ok) throw new Error('Failed to load slots');
        const data = await res.json();
        setSlots(data.slots || []);
      } catch (err: unknown) {
        const e = err as Error;
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSlots();
  }, [serviceId, selectedDate]);

  const handleSelectSlot = (slot: ServiceSlot) => {
    if (!slot.is_available || slot.booked_count >= slot.capacity) return;
    setSelectedSlotId(slot.id);
    onSlotSelected(slot, selectedDate);
  };

  return (
    <div className="space-y-6">
      {/* 1. Date Selector */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-navy-900 mb-2.5">
          1. Select Reservation Date
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {dates.map((d) => {
            const isSelected = selectedDate === d.iso;
            return (
              <button
                key={d.iso}
                type="button"
                onClick={() => setSelectedDate(d.iso)}
                className={cn(
                  'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all',
                  isSelected
                    ? 'border-brand-600 bg-brand-50/80 text-brand-700 font-bold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                )}
              >
                <span className="text-[10px] uppercase font-semibold text-slate-400">
                  {d.isToday ? 'Today' : d.dayName}
                </span>
                <span className="text-base font-extrabold text-navy-900 my-0.5">
                  {d.dayNumber}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {d.month}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Time Slots Grid */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-navy-900">
            2. Available Time Slots
          </label>
          <span className="text-[11px] text-slate-500">
            {slots.length} time slots configured
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-16 rounded-xl bg-slate-100 animate-pulse border border-slate-200"
              />
            ))}
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : slots.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
            No active time slots found for this date.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {slots.map((slot) => {
              const remaining = slot.capacity - slot.booked_count;
              const isFull = remaining <= 0 || !slot.is_available;
              const isSelected = selectedSlotId === slot.id;

              return (
                <button
                  key={slot.id}
                  type="button"
                  disabled={isFull}
                  onClick={() => handleSelectSlot(slot)}
                  className={cn(
                    'flex items-center justify-between p-3.5 rounded-xl border text-left transition-all relative overflow-hidden',
                    isFull
                      ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed text-slate-400'
                      : isSelected
                      ? 'bg-brand-50/70 border-brand-600 text-brand-900 shadow-sm ring-1 ring-brand-500'
                      : 'bg-white border-slate-200/90 text-navy-900 hover:border-slate-300 hover:shadow-xs'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Clock
                      className={cn(
                        'w-4 h-4',
                        isSelected ? 'text-brand-600' : 'text-slate-400'
                      )}
                    />
                    <div>
                      <div className="text-xs font-bold text-navy-900">
                        {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {isFull ? (
                          <span className="text-rose-600 font-semibold">Fully Booked</span>
                        ) : (
                          <span className="text-emerald-700 font-medium">
                            {remaining} of {slot.capacity} seats open
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
