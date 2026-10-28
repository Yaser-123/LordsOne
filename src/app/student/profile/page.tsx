'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Profile } from '@/types/database';
import { User, CheckCircle2, AlertCircle, Shield, GraduationCap, Phone } from 'lucide-react';

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Artificial Intelligence & Data Science',
  'Electronics & Communication Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Information Technology',
  'Electrical & Electronics Engineering',
  'Basic Sciences & Humanities',
];

export default function StudentProfilePage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (data) {
            setProfile(data);
            setFullName(data.full_name || '');
            setRollNumber(data.roll_number || '');
            setDepartment(data.department || DEPARTMENTS[0]);
            setPhone(data.phone || '');
          }
        }
      } catch (err: unknown) {
        const e = err as Error;
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [supabase]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          roll_number: rollNumber || null,
          department,
          phone: phone || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
          <User className="w-4 h-4" />
          <span>Account Settings</span>
        </div>
        <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">
          Student Profile
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your personal details, college affiliation, and contact information.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form
        onSubmit={handleSaveProfile}
        className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-card space-y-6"
      >
        {/* User Identity Snapshot */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xl uppercase shadow-sm">
            {profile?.full_name ? profile.full_name.charAt(0) : 'U'}
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-navy-900">
              {profile?.full_name || 'Campus Student'}
            </h2>
            <p className="text-xs text-slate-500 font-mono">{profile?.email}</p>
            <div className="flex items-center gap-2 pt-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-50 text-brand-700 border border-brand-200">
                Role: {profile?.role}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                Status: {profile?.account_status}
              </span>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label="Full Name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <Input
            label="Roll / Hall Ticket No."
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            placeholder="1609-..."
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full h-10 px-3 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Phone Number"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="10-digit mobile number"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <Button
            type="submit"
            isLoading={saving}
            className="font-bold text-xs shadow-sm px-6"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
