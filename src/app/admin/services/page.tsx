'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Service } from '@/types/database';
import { Button } from '@/components/ui/Button';
import {
  Layers,
  Plus,
  MapPin,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { formatCurrency, CATEGORY_META } from '@/lib/utils/utils';

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/admin/services');
      if (res.ok) {
        const data = await res.json();
        setServices(data.services || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleToggleActive = async (service: Service) => {
    setTogglingId(service.id);
    try {
      const res = await fetch('/api/admin/services', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: service.id,
          is_active: !service.is_active,
        }),
      });

      if (res.ok) {
        fetchServices();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingId(null);
    }
  };

  const filtered = services.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.title.toLowerCase().includes(q) || s.location.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Infrastructure Catalog</span>
          </div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">
            Manage Campus Services
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure lab workstations, sports arenas, auditoriums, capacities, and booking rules.
          </p>
        </div>

        <Link href="/admin/services/new">
          <Button size="sm" className="font-bold text-xs gap-1.5 shadow-sm">
            <Plus className="w-4 h-4" />
            <span>Add New Facility</span>
          </Button>
        </Link>
      </div>

      {/* Filter and Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search facility name or block..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <span className="text-xs text-slate-500 font-medium">
          {filtered.length} total registered services
        </span>
      </div>

      {/* Services Table */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200/90 bg-white shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Facility Name & Category</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Rate</th>
                  <th className="p-4">Capacity</th>
                  <th className="p-4">Approval Rule</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((s) => {
                  const meta = CATEGORY_META[s.category] || {
                    label: s.category,
                    badgeClass: 'bg-slate-100 text-slate-700',
                  };

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-navy-900 text-sm">{s.title}</div>
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold border ${meta.badgeClass}`}
                        >
                          {meta.label}
                        </span>
                      </td>

                      <td className="p-4 text-slate-600 truncate max-w-[200px]">
                        {s.location}
                      </td>

                      <td className="p-4 font-bold text-navy-900">
                        {formatCurrency(Number(s.price))}
                      </td>

                      <td className="p-4 text-slate-700">
                        {s.capacity} seats / units
                      </td>

                      <td className="p-4 text-slate-600">
                        {s.booking_rules?.requires_approval ? (
                          <span className="text-amber-700 font-bold">Faculty Review</span>
                        ) : (
                          <span className="text-emerald-700 font-bold">Instant Lock</span>
                        )}
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            s.is_active
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              s.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {s.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="p-4 text-right space-x-2">
                        <button
                          disabled={togglingId === s.id}
                          onClick={() => handleToggleActive(s)}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-colors ${
                            s.is_active
                              ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {s.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <Link
                          href={`/services/${s.slug}`}
                          className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 inline-block"
                        >
                          Preview
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
