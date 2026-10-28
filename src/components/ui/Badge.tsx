import React from 'react';
import { cn } from '@/lib/utils/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'neutral';
  dot?: boolean;
}

export function Badge({
  className = '',
  variant = 'default',
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-brand-50 text-brand-700 border-brand-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    destructive: 'bg-rose-50 text-rose-800 border-rose-200',
    outline: 'border-slate-300 text-slate-700 bg-white',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const dotColors = {
    default: 'bg-brand-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    destructive: 'bg-rose-500',
    outline: 'bg-slate-400',
    neutral: 'bg-slate-400',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])}
        />
      )}
      {children}
    </div>
  );
}
