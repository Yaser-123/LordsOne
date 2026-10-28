'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Layers, ChevronLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ServiceCategory } from '@/types/database';

const CATEGORIES: { key: ServiceCategory; label: string }[] = [
  { key: 'laboratories', label: 'Laboratories & Research' },
  { key: 'seminar_halls', label: 'Auditoriums & Seminar Halls' },
  { key: 'sports', label: 'Sports & Athletics' },
  { key: 'event_spaces', label: 'Event & Creative Spaces' },
  { key: 'equipment', label: 'Equipment & FabLab' },
  { key: 'campus_support', label: 'Campus & IT Support' },
];

export default function NewServicePage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('laboratories');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState(0);
  const [capacity, setCapacity] = useState(30);
  const [imageUrl, setImageUrl] = useState('');
  const [minNoticeHours, setMinNoticeHours] = useState(2);
  const [maxAdvanceDays, setMaxAdvanceDays] = useState(14);
  const [requiresApproval, setRequiresApproval] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    // Auto generate clean slug
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          description,
          category,
          location,
          price: Number(price),
          capacity: Number(capacity),
          image_url: imageUrl.trim() || undefined,
          is_active: true,
          booking_rules: {
            min_notice_hours: Number(minNoticeHours),
            max_advance_days: Number(maxAdvanceDays),
            requires_approval: requiresApproval,
            allowed_roles: ['student', 'faculty', 'admin'],
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create facility service');
      }

      router.push('/admin/services');
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Link
        href="/admin/services"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-900 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Facilities List</span>
      </Link>

      <div>
        <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">
          Register New Campus Facility
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Add a new laboratory, sports court, seminar hall, or rental equipment. Default time slots will be automatically provisioned for the next 7 days.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-card space-y-6"
      >
        <div className="space-y-4">
          <Input
            label="Facility Title"
            required
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="e.g. Embedded IoT Systems Lab"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="URL Slug (Permanent)"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="embedded-iot-systems-lab"
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Service Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Campus Location"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Mechanical Block, Ground Floor, Room 102"
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Detailed Facility Description
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe available equipment, rules, and student capabilities..."
              className="w-full p-3 border border-slate-300 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Reservation Rate (₹ INR)"
              type="number"
              min={0}
              required
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              helperText="Set to 0 for free institutional facilities"
            />

            <Input
              label="Seat / Unit Capacity"
              type="number"
              min={1}
              required
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
              helperText="Maximum concurrent occupants per slot"
            />
          </div>

          <Input
            label="Cover Image URL (Unsplash or CDN)"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
          />

          {/* Booking Rules */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900">
              Booking Policy & Restrictions
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Minimum Notice (Hours)"
                type="number"
                min={0}
                value={minNoticeHours}
                onChange={(e) => setMinNoticeHours(parseInt(e.target.value) || 0)}
              />

              <Input
                label="Max Advance Booking (Days)"
                type="number"
                min={1}
                value={maxAdvanceDays}
                onChange={(e) => setMaxAdvanceDays(parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="reqApproval"
                checked={requiresApproval}
                onChange={(e) => setRequiresApproval(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
              />
              <label htmlFor="reqApproval" className="text-xs font-semibold text-navy-900 cursor-pointer">
                Require manual faculty / administrator approval for every booking request
              </label>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link href="/admin/services">
            <Button variant="ghost" size="sm" className="text-xs">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            isLoading={submitting}
            className="font-bold text-xs shadow-sm px-6"
          >
            Create Facility & Generate Slots
          </Button>
        </div>
      </form>
    </div>
  );
}
