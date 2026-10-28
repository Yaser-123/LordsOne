'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/ui/Logo';
import {
  Bell,
  Search,
  User,
  LogOut,
  Shield,
  Calendar,
  CreditCard,
  ChevronDown,
} from 'lucide-react';
import { Profile } from '@/types/database';

interface HeaderProps {
  profile?: Profile | null;
  onSearch?: (query: string) => void;
  showSidebarToggle?: boolean;
}

export function Header({ profile, onSearch }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  useEffect(() => {
    if (!profile) return;

    async function fetchUnread() {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (err) {
        console.error('Failed to fetch unread count:', err);
      }
    }

    fetchUnread();

    // 1. Instant optimistic event listener (0ms latency across app)
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ unreadCount?: number }>;
      if (customEvent.detail && typeof customEvent.detail.unreadCount === 'number') {
        setUnreadCount(customEvent.detail.unreadCount);
      } else {
        fetchUnread();
      }
    };
    window.addEventListener('notifications-updated', handleUpdate);

    // 2. Supabase Realtime subscription for server pushes and multi-tabs
    const channel = supabase
      .channel(`realtime-notifications-${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${profile.id}`,
        },
        () => {
          fetchUnread();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('notifications-updated', handleUpdate);
      supabase.removeChannel(channel);
    };
  }, [profile, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchVal);
    } else {
      router.push(`/student/services?search=${encodeURIComponent(searchVal)}`);
    }
  };

  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur border-b border-slate-200/80 px-4 lg:px-8 py-2.5">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: Mobile Logo */}
        <div className="flex items-center gap-3">
          <div className="lg:hidden">
            <Logo size="sm" showSubtitle={false} />
          </div>

          {/* Unified search bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden sm:flex items-center relative w-64 lg:w-96"
          >
            <Search className="absolute left-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search labs, sports courts, auditoriums..."
              className="w-full pl-9 pr-4 py-1.5 text-xs lg:text-sm bg-slate-50 border border-slate-200 rounded-lg text-navy-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
            />
          </form>
        </div>

        {/* Right side navigation & user drawer */}
        <div className="flex items-center gap-3">
          {profile ? (
            <>
              {/* Notification Bell */}
              <Link
                href="/student/notifications"
                className="relative p-2 text-slate-600 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 border border-brand-200 flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
                    {profile.full_name ? profile.full_name.charAt(0) : 'U'}
                  </div>
                  <div className="hidden md:flex flex-col text-left leading-tight">
                    <span className="text-xs font-semibold text-navy-900 truncate max-w-[120px]">
                      {profile.full_name || 'Campus Student'}
                    </span>
                    <span className="text-[10px] text-slate-500 capitalize">
                      {profile.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-dropdown z-20 py-1 divide-y divide-slate-100 animate-in fade-in-50 zoom-in-95">
                      <div className="px-4 py-2.5">
                        <p className="text-xs font-semibold text-navy-900 truncate">
                          {profile.full_name}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {profile.email}
                        </p>
                        <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-brand-50 text-brand-700 border border-brand-200">
                          {profile.role}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/student/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          Account Settings
                        </Link>
                        <Link
                          href="/student/bookings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Calendar className="w-4 h-4 text-slate-400" />
                          My Bookings
                        </Link>
                        <Link
                          href="/student/payments"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <CreditCard className="w-4 h-4 text-slate-400" />
                          Payment History
                        </Link>
                      </div>

                      {isAdmin && (
                        <div className="py-1 bg-amber-50/50">
                          <Link
                            href="/admin/dashboard"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100/50 transition-colors"
                          >
                            <Shield className="w-4 h-4 text-amber-600" />
                            Admin Console
                          </Link>
                        </div>
                      )}

                      <div className="py-1">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-2.5 w-full px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="text-xs font-semibold text-slate-700 hover:text-navy-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 px-3.5 py-1.5 rounded-lg shadow-sm transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
