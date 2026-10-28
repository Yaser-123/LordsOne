'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AlertCircle, User, Mail, Lock, Phone, GraduationCap, ArrowRight } from 'lucide-react';

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

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/student/dashboard';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            department,
            roll_number: rollNumber || null,
            phone: phone || null,
            role: 'student',
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email,
          full_name: fullName,
          department,
          roll_number: rollNumber || null,
          phone: phone || null,
          role: 'student',
          account_status: 'active',
        });

        router.push(redirectPath);
        router.refresh();
      }
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-slate-200/90 shadow-card space-y-6">
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="relative">
          <Input
            label="Full Name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Mohammed Yaser"
            className="pl-10"
          />
          <User className="absolute left-3 top-8 w-4 h-4 text-slate-400" />
        </div>

        <div className="relative">
          <Input
            label="College or Personal Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@lords.ac.in"
            className="pl-10"
          />
          <Mail className="absolute left-3 top-8 w-4 h-4 text-slate-400" />
        </div>

        <div className="relative">
          <Input
            label="Create Password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 6 characters"
            className="pl-10"
          />
          <Lock className="absolute left-3 top-8 w-4 h-4 text-slate-400" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Input
              label="Roll / Hall Ticket No."
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              placeholder="1609-22-733-..."
            />
          </div>

          <div className="relative">
            <Input
              label="Phone Number"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543210"
              className="pl-9"
            />
            <Phone className="absolute left-3 top-8 w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Academic Department
          </label>
          <div className="relative">
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full h-10 pl-9 pr-4 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            <GraduationCap className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          </div>
        </div>

        <Button
          type="submit"
          isLoading={loading}
          className="w-full h-11 font-bold text-sm shadow-sm gap-2 mt-4"
        >
          <span>Create LordsOne Account</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      <div className="pt-4 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-500">
          Already have an account?{' '}
          <Link
            href={`/auth/login?redirect=${encodeURIComponent(redirectPath)}`}
            className="font-bold text-brand-600 hover:text-brand-700 hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
          Create Student Account
        </h2>
        <p className="text-xs text-slate-500">
          Join LordsOne to access campus laboratories, sports arenas, and seminar auditoriums.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense fallback={<div className="h-96 bg-white rounded-2xl animate-pulse" />}>
          <RegisterForm />
        </Suspense>

        <p className="text-[11px] text-center text-slate-400 mt-6">
          Lords Institute of Engineering and Technology (LIET), Hyderabad
        </p>
      </div>
    </div>
  );
}
