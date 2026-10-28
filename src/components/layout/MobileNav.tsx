'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Compass, CalendarCheck, CreditCard, User } from 'lucide-react';
import { cn } from '@/lib/utils/utils';

export function MobileNav() {
  const pathname = usePathname();

  const navs = [
    { title: 'Home', href: '/student/dashboard', icon: LayoutDashboard },
    { title: 'Explore', href: '/student/services', icon: Compass },
    { title: 'Bookings', href: '/student/bookings', icon: CalendarCheck },
    { title: 'Payments', href: '/student/payments', icon: CreditCard },
    { title: 'Profile', href: '/student/profile', icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-slate-200 px-2 py-1.5 shadow-lg flex items-center justify-around">
      {navs.map((n) => {
        const Icon = n.icon;
        const isActive =
          pathname === n.href ||
          (n.href !== '/student/dashboard' && pathname.startsWith(n.href));

        return (
          <Link
            key={n.href}
            href={n.href}
            className={cn(
              'flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors',
              isActive
                ? 'text-brand-600 font-bold'
                : 'text-slate-500 hover:text-navy-900'
            )}
          >
            <Icon className={cn('w-5 h-5', isActive && 'text-brand-600')} />
            <span>{n.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
