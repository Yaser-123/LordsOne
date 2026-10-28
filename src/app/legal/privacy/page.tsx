import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="max-w-4xl mx-auto px-4 lg:px-8 py-14 flex-1 w-full space-y-6">
        <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-500">
          Last Updated: October 2026 • Lords Institute of Engineering and Technology (LIET), Hyderabad
        </p>

        <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 space-y-4 leading-relaxed border-t border-slate-100 pt-6">
          <p>
            This Privacy Policy describes how <strong>LordsOne</strong>, the centralized campus service booking and management platform for Lords Institute of Engineering and Technology (LIET), collects, uses, and safeguards information when authorized students, faculty, and administrative staff use the portal.
          </p>

          <h3 className="text-base font-bold text-navy-900 pt-2">1. Information We Collect</h3>
          <p>
            When registering and using the platform, we collect your official college email address, full name, student roll/hall ticket number, academic department, and phone number. When reservations are made, transaction logs, booking references, and slot reservation timestamps are securely recorded.
          </p>

          <h3 className="text-base font-bold text-navy-900 pt-2">2. How Information is Used</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>To verify campus affiliation and authenticate access to engineering workshops and facilities.</li>
            <li>To enforce capacity constraints and prevent duplicate bookings across lab benches and auditoriums.</li>
            <li>To process and cryptographically verify service fees through Razorpay.</li>
            <li>To notify you regarding approval clearances, schedule modifications, or emergency campus closures.</li>
          </ul>

          <h3 className="text-base font-bold text-navy-900 pt-2">3. Data Security & Storage</h3>
          <p>
            User credentials and personal records are stored in PostgreSQL on Supabase with Row Level Security (RLS) active. Passwords are cryptographically hashed using industry-standard bcrypt protocols. Payment card and banking data are processed directly by PCI-DSS compliant Razorpay and are never stored on LordsOne servers.
          </p>

          <h3 className="text-base font-bold text-navy-900 pt-2">4. Inquiries & Contact</h3>
          <p>
            For privacy inquiries or account data modifications, contact the IT Infrastructure & Facilities Desk at <code>facilities@lordsone.edu.in</code> or visit the Administrative Block at LIET, Hyderabad.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
