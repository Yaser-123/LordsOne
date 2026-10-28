'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AlertCircle, Lock, Mail, ArrowRight } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/student/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      if (data.user) {
        // Fetch role to decide destination if default
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profile?.role === 'admin' || profile?.role === 'superadmin') {
          router.push(redirectPath.startsWith('/admin') ? redirectPath : '/admin/dashboard');
        } else {
          router.push(redirectPath);
        }
        router.refresh();
      }
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Invalid email or password.');
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

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="relative">
          <Input
            label="College Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="rollnumber@lords.ac.in or personal email"
            className="pl-10"
          />
          <Mail className="absolute left-3 top-8 w-4 h-4 text-slate-400" />
        </div>

        <div className="relative">
          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="pl-10"
          />
          <Lock className="absolute left-3 top-8 w-4 h-4 text-slate-400" />
        </div>

        <Button
          type="submit"
          isLoading={loading}
          className="w-full h-11 font-bold text-sm shadow-sm gap-2 mt-2"
        >
          <span>Sign In to LordsOne</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      <div className="pt-4 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-500">
          Don&apos;t have an account yet?{' '}
          <Link
            href={`/auth/register?redirect=${encodeURIComponent(redirectPath)}`}
            className="font-bold text-brand-600 hover:text-brand-700 hover:underline"
          >
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
          Welcome to Campus Portal
        </h2>
        <p className="text-xs text-slate-500">
          Sign in to access facility bookings, equipment loans, and service requests.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense fallback={<div className="h-64 bg-white rounded-2xl animate-pulse" />}>
          <LoginForm />
        </Suspense>

        <p className="text-[11px] text-center text-slate-400 mt-6">
          Lords Institute of Engineering and Technology (LIET), Hyderabad
        </p>
      </div>
    </div>
  );
}
