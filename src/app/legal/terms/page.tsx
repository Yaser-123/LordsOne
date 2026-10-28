import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="max-w-4xl mx-auto px-4 lg:px-8 py-14 flex-1 w-full space-y-6">
        <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">
          Terms of Service & Facility Usage Code
        </h1>
        <p className="text-xs text-slate-500">
          Lords Institute of Engineering and Technology (LIET), Hyderabad
        </p>

        <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 space-y-4 leading-relaxed border-t border-slate-100 pt-6">
          <p>
            By accessing and booking campus facilities through <strong>LordsOne</strong>, you agree to comply with the institutional guidelines and operating regulations established by Lords Institute of Engineering and Technology.
          </p>

          <h3 className="text-base font-bold text-navy-900 pt-2">1. Eligibility & User Responsibilities</h3>
          <p>
            Only enrolled LIET students, recognized research scholars, faculty members, and authorized campus staff may book facilities. Booking passes are non-transferable. The individual whose name appears on the reservation pass is accountable for the facility and equipment during the scheduled time window.
          </p>

          <h3 className="text-base font-bold text-navy-900 pt-2">2. Cancellation & Slot Releases</h3>
          <p>
            Reservations may be cancelled in advance through the student portal. When a booking is cancelled, the corresponding seat or bench capacity is released immediately back into the availability pool. Repeated no-shows may lead to temporary suspension of booking privileges.
          </p>

          <h3 className="text-base font-bold text-navy-900 pt-2">3. Fees & Payment Reconciliation</h3>
          <p>
            Where nominal fees apply (e.g. auditorium digital sound drops, rapid prototyping 3D printing filaments, or sports lighting), payments are executed through Razorpay. Transactions are considered confirmed upon cryptographic verification of payment signatures.
          </p>

          <h3 className="text-base font-bold text-navy-900 pt-2">4. Disciplinary Compliance</h3>
          <p>
            Users must treat laboratory equipment, robotic arms, and audio-visual setups with care. Any damage caused by willful negligence will be subject to departmental review in accordance with the LIET Code of Student Conduct.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
