import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LordsOne — Smart Campus Service Booking and Management Platform',
  description:
    'One Campus. Everything Connected. The centralized smart facility reservation, lab scheduling, sports complex booking, and campus services platform for Lords Institute of Engineering and Technology (LIET), Hyderabad.',
  keywords: [
    'LIET',
    'Lords Institute of Engineering and Technology',
    'LordsOne',
    'Campus Services',
    'Lab Booking',
    'Auditorium Reservation',
    'Hyderabad',
    'Smart Campus',
  ],
  authors: [{ name: 'LIET Campus Systems Group' }],
  creator: 'Lords Institute of Engineering and Technology',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'LordsOne — One Campus. Everything Connected.',
    description:
      'Seamless reservation of campus laboratories, sports facilities, auditoriums, and media equipment at LIET Hyderabad.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'LordsOne',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="min-h-screen bg-slate-50 font-sans text-navy-900 antialiased">
        {children}
      </body>
    </html>
  );
}
