import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BookingStatus, PaymentStatus, ServiceCategory } from '@/types/database';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (amount === 0) return 'Free';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatTime(timeString: string): string {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const formattedH = h % 12 || 12;
  return `${formattedH}:${minutes} ${ampm}`;
}

export const CATEGORY_META: Record<
  ServiceCategory,
  { label: string; description: string; iconName: string; badgeClass: string; dotClass: string }
> = {
  laboratories: {
    label: 'Laboratories & Research',
    description: 'High-tech AI, robotics, electronics, and hardware workstations',
    iconName: 'Cpu',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
    dotClass: 'bg-blue-600',
  },
  sports: {
    label: 'Sports & Athletics',
    description: 'Indoor courts, floodlit arenas, and athletic complexes',
    iconName: 'Trophy',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dotClass: 'bg-emerald-600',
  },
  seminar_halls: {
    label: 'Auditoriums & Halls',
    description: 'Acoustic seminar spaces, smartboards, and tiered seating',
    iconName: 'Presentation',
    badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    dotClass: 'bg-indigo-600',
  },
  event_spaces: {
    label: 'Event & Creative Spaces',
    description: 'Amphitheatre, production studios, and campus open grounds',
    iconName: 'Radio',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
    dotClass: 'bg-purple-600',
  },
  equipment: {
    label: 'Equipment & FabLab',
    description: '3D printers, autonomous drone kits, and high-spec sensors',
    iconName: 'Wrench',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    dotClass: 'bg-amber-600',
  },
  campus_support: {
    label: 'Campus & IT Support',
    description: 'Device diagnostics, lab power, and infrastructure dispatch',
    iconName: 'HelpCircle',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
    dotClass: 'bg-slate-600',
  },
};

export const STATUS_META: Record<
  BookingStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  pending_payment: {
    label: 'Pending Payment',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    dotClass: 'bg-amber-500',
  },
  pending: {
    label: 'Pending Review',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
    dotClass: 'bg-blue-500',
  },
  confirmed: {
    label: 'Confirmed',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  rejected: {
    label: 'Rejected',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
    dotClass: 'bg-rose-500',
  },
  cancelled: {
    label: 'Cancelled',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    dotClass: 'bg-slate-400',
  },
  completed: {
    label: 'Completed',
    badgeClass: 'bg-teal-50 text-teal-800 border-teal-200',
    dotClass: 'bg-teal-500',
  },
};

export const PAYMENT_STATUS_META: Record<
  PaymentStatus,
  { label: string; badgeClass: string }
> = {
  created: {
    label: 'Order Created',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  authorized: {
    label: 'Authorized',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  captured: {
    label: 'Paid (Captured)',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  failed: {
    label: 'Failed',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  refunded: {
    label: 'Refunded',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
  },
};
