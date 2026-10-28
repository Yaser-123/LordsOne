'use client';

import React, { useState, useEffect } from 'react';
import { Profile } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Users, Search, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatDate } from '@/lib/utils/utils';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (roleFilter !== 'all') params.set('role', roleFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, roleFilter]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_user_id: userId,
          role: newRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update user role');
      }

      setMessage(`User role updated to ${newRole}`);
      fetchUsers();
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    setUpdatingId(userId);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_user_id: userId,
          account_status: newStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update user status');
      }

      setMessage(`User account status updated to ${newStatus}`);
      fetchUsers();
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Identity Directory</span>
          </div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">
            Campus User Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit registered student and faculty profiles, grant role privileges, and enforce account statuses.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, roll number, or department..."
            className="w-full pl-10 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg text-navy-900 focus:outline-none cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="faculty">Faculty</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : users.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-white">
          <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500">No user accounts matched the filter query.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200/90 bg-white shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">User & Email</th>
                  <th className="p-4">Academic Dept / Roll</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Assigned Role</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-navy-900">{u.full_name || 'Anonymous User'}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                    </td>

                    <td className="p-4">
                      <div className="text-slate-700">{u.department || 'General'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{u.roll_number || 'N/A'}</div>
                    </td>

                    <td className="p-4 text-slate-600 font-mono">
                      {u.phone || 'N/A'}
                    </td>

                    <td className="p-4">
                      <select
                        disabled={updatingId === u.id}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="h-8 px-2 rounded border border-slate-200 text-xs font-semibold bg-white text-navy-900 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
                      >
                        <option value="student">Student</option>
                        <option value="faculty">Faculty</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </td>

                    <td className="p-4">
                      <select
                        disabled={updatingId === u.id}
                        value={u.account_status}
                        onChange={(e) => handleStatusChange(u.id, e.target.value)}
                        className={`h-8 px-2 rounded border text-xs font-semibold bg-white focus:outline-none cursor-pointer ${
                          u.account_status === 'active'
                            ? 'text-emerald-700 border-emerald-200'
                            : 'text-rose-700 border-rose-200'
                        }`}
                      >
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="deactivated">Deactivated</option>
                      </select>
                    </td>

                    <td className="p-4 text-slate-400">
                      {formatDate(u.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
