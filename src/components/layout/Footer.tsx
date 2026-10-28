import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { MapPin, Phone, Mail, Globe } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-slate-900 text-slate-300 border-t border-slate-800 pt-14 pb-12 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
        {/* Brand Info */}
        <div className="space-y-4">
          <Logo size="md" href="/" inverted={true} />
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            Centralized digital booking and operational platform for Lords Institute of Engineering and Technology (LIET), Hyderabad. Designed for students, faculty, and administrative staff.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
            <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
            <span>Himayat Sagar, Hyderabad, Telangana 500091</span>
          </div>
        </div>

        {/* Campus Facilities */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
            Campus Facilities
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li>
              <Link href="/services?category=laboratories" className="hover:text-white transition-colors">
                Advanced AI & Robotics Labs
              </Link>
            </li>
            <li>
              <Link href="/services?category=seminar_halls" className="hover:text-white transition-colors">
                Sir CV Raman Auditorium
              </Link>
            </li>
            <li>
              <Link href="/services?category=sports" className="hover:text-white transition-colors">
                Indoor Badminton & Basketball
              </Link>
            </li>
            <li>
              <Link href="/services?category=equipment" className="hover:text-white transition-colors">
                FabLab 3D Printing & Drone Kits
              </Link>
            </li>
            <li>
              <Link href="/services?category=event_spaces" className="hover:text-white transition-colors">
                Amphitheatre & Media Studios
              </Link>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
            Quick Links
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li>
              <Link href="/student/dashboard" className="hover:text-white transition-colors">
                Student Dashboard
              </Link>
            </li>
            <li>
              <Link href="/student/bookings" className="hover:text-white transition-colors">
                Booking History
              </Link>
            </li>
            <li>
              <Link href="/student/payments" className="hover:text-white transition-colors">
                Verified Transactions
              </Link>
            </li>
            <li>
              <Link href="/auth/login" className="hover:text-white transition-colors">
                Account Sign In
              </Link>
            </li>
            <li>
              <Link href="/admin/dashboard" className="hover:text-white transition-colors">
                Administrator Portal
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact & Support */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
            Helpdesk & Inquiries
          </h4>
          <ul className="space-y-3 text-xs text-slate-400">
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-brand-400 shrink-0" />
              <span>+91 40 6625 3641 (LIET Desk)</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-brand-400 shrink-0" />
              <span>facilities@lordsone.edu.in</span>
            </li>
            <li className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-brand-400 shrink-0" />
              <span>Official LIET Portal Link</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© {new Date().getFullYear()} LordsOne Campus Platform. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <Link href="/legal/privacy" className="hover:text-slate-300 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/legal/terms" className="hover:text-slate-300 transition-colors">
            Terms of Service
          </Link>
          <span>One Campus. Everything Connected.</span>
        </div>
      </div>
    </footer>
  );
}
