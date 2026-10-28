import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Header } from '@/components/layout/Header';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirect=/admin/dashboard');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Strict role check
  if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
    redirect('/student/dashboard?error=unauthorized_admin');
  }

  return (
    <div className="min-h-screen flex bg-slate-100/70">
      {/* Admin Dark Sidebar */}
      <AdminSidebar />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header profile={profile} />
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
