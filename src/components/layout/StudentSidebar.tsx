'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import {
  LayoutDashboard,
  Compass,
  CalendarCheck,
  CreditCard,
  Bell,
  User,
  HelpCircle,
  PhoneCall,
} from 'lucide-react';
import { cn } from '@/lib/utils/utils';

export function StudentSidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      title: 'Overview',
      href: '/student/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Campus Services',
      href: '/student/services',
      icon: Compass,
    },
    {
      title: 'My Bookings',
      href: '/student/bookings',
      icon: CalendarCheck,
    },
    {
      title: 'Payments',
      href: '/student/payments',
      icon: CreditCard,
    },
    {
      title: 'Notifications',
      href: '/student/notifications',
      icon: Bell,
    },
    {
      title: 'Profile Settings',
      href: '/student/profile',
      icon: User,
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200/90 bg-white min-h-screen sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100">
        <Logo size="md" href="/student/dashboard" />
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Campus Portal
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/student/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all group',
                isActive
                  ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200/60 shadow-xs'
                  : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 transition-colors',
                  isActive
                    ? 'text-brand-600'
                    : 'text-slate-400 group-hover:text-slate-600'
                )}
              />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </div>

      {/* Campus Help & Emergency Info Card */}
      <div className="p-4 m-4 rounded-xl bg-slate-50 border border-slate-200/80">
        <div className="flex items-center gap-2 text-xs font-bold text-navy-900 mb-1">
          <HelpCircle className="w-4 h-4 text-brand-600" />
          <span>Need Assistance?</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
          Campus facilities helpdesk is active 8:30 AM to 6:00 PM.
        </p>
        <div className="flex items-center gap-2 text-[11px] font-semibold text-brand-700 bg-white border border-brand-200/80 px-2.5 py-1.5 rounded-lg">
          <PhoneCall className="w-3.5 h-3.5 text-brand-600" />
          <span>LIET Ext: 4120 / 4122</span>
        </div>
      </div>
    </aside>
  );
}
