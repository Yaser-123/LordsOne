'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Notification } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Bell, CheckCheck, Clock, ArrowRight } from 'lucide-react';
import { formatDate } from '@/lib/utils/utils';

export default function StudentNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    // 1. Optimistically clear unread count in header and local UI immediately
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    window.dispatchEvent(
      new CustomEvent('notifications-updated', { detail: { unreadCount: 0 } })
    );

    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
    } catch (err) {
      console.error(err);
      fetchNotifications();
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    const target = notifications.find((n) => n.id === id);
    if (!target || target.is_read) return;

    // Optimistically mark single as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    const remaining = notifications.filter((n) => !n.is_read && n.id !== id).length;
    window.dispatchEvent(
      new CustomEvent('notifications-updated', { detail: { unreadCount: remaining } })
    );

    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
            <Bell className="w-4 h-4" />
            <span>Activity Feed</span>
          </div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">
            Notifications & Alerts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            System updates on slot confirmations, faculty approvals, and payment receipts.
          </p>
        </div>

        {notifications.some((n) => !n.is_read) && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="text-xs font-semibold gap-1.5 shadow-xs"
          >
            <CheckCheck className="w-4 h-4 text-brand-600" />
            <span>Mark All as Read</span>
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-slate-200 bg-white animate-pulse h-16"
            />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-white space-y-3">
          <Bell className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="font-bold text-navy-900 text-sm">No notifications</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You are all caught up! New updates regarding your facility reservations will appear here.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200/90 bg-white shadow-card divide-y divide-slate-100 overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleMarkSingleRead(n.id)}
              className={`p-4 flex items-start justify-between gap-4 transition-colors cursor-pointer ${
                !n.is_read ? 'bg-brand-50/40' : 'hover:bg-slate-50/60'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-navy-900">
                    {n.title}
                  </h4>
                  {!n.is_read && (
                    <span className="w-2 h-2 rounded-full bg-brand-600" />
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {n.message}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(n.created_at)}</span>
                </div>
              </div>

              {n.link_url && (
                <Link
                  href={n.link_url}
                  className="shrink-0 p-2 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
