'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CATEGORY_META } from '@/lib/utils/utils';
import { ServiceCategory } from '@/types/database';

interface AnalyticsChartsProps {
  bookingTrends: { date: string; bookings: number; revenue: number }[];
  categoryDistribution: { category: string; count: number }[];
}

export function AnalyticsCharts({
  bookingTrends,
  categoryDistribution,
}: AnalyticsChartsProps) {
  // Format category labels
  const formattedCategories = categoryDistribution.map((item) => {
    const meta = CATEGORY_META[item.category as ServiceCategory];
    return {
      name: meta ? meta.label.split(' ')[0] : item.category,
      fullName: meta ? meta.label : item.category,
      count: item.count,
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Booking Trends Area Chart */}
      <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-card space-y-4">
        <div>
          <h3 className="text-sm font-bold text-navy-900 tracking-tight">
            Booking Demand Over Time
          </h3>
          <p className="text-xs text-slate-500">
            Daily reservation volume across all campus facilities
          </p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={bookingTrends}>
              <defs>
                <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  fontSize: '12px',
                  border: 'none',
                }}
              />
              <Area
                type="monotone"
                dataKey="bookings"
                stroke="#2563EB"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorBookings)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Category Distribution Bar Chart */}
      <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-card space-y-4">
        <div>
          <h3 className="text-sm font-bold text-navy-900 tracking-tight">
            Reservations by Category
          </h3>
          <p className="text-xs text-slate-500">
            Service distribution across engineering labs, halls, and sports
          </p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedCategories}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  fontSize: '12px',
                  border: 'none',
                }}
              />
              <Bar
                dataKey="count"
                fill="#4F46E5"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
