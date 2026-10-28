'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import {
  BarChart3,
  Layers,
  CalendarCheck2,
  Users,
  CreditCard,
  MessageSquare,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils/utils';

export function AdminSidebar() {
  const pathname = usePathname();

  const adminNav = [
    {
      title: 'Analytics & KPIs',
      href: '/admin/dashboard',
      icon: BarChart3,
    },
    {
      title: 'Campus Services',
      href: '/admin/services',
      icon: Layers,
    },
    {
      title: 'Booking Approvals',
      href: '/admin/bookings',
      icon: CalendarCheck2,
    },
    {
      title: 'User Management',
      href: '/admin/users',
      icon: Users,
    },
    {
      title: 'Payment Transactions',
      href: '/admin/payments',
      icon: CreditCard,
    },
    {
      title: 'Feedback Moderation',
      href: '/admin/feedback',
      icon: MessageSquare,
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-slate-800 bg-navy-900 text-slate-300 min-h-screen sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/80">
        <Logo size="md" href="/admin/dashboard" inverted={true} />
        <div className="flex items-center gap-1.5 mt-2.5 px-2 py-0.5 rounded bg-brand-500/10 border border-brand-500/20 text-brand-400 text-[10px] font-bold tracking-wider uppercase w-fit">
          <ShieldCheck className="w-3 h-3 text-brand-400" />
          <span>Admin Workspace</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Management Console
        </div>
        {adminNav.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group',
                isActive
                  ? 'bg-brand-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 transition-colors',
                  isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'
                )}
              />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </div>

      {/* Return to Student Mode */}
      <div className="p-4 border-t border-slate-800/80">
        <Link
          href="/student/dashboard"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700/60 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Student View</span>
        </Link>
      </div>
    </aside>
  );
}
