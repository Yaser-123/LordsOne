import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  href?: string;
}

export function Logo({
  className = '',
  size = 'md',
  showSubtitle = true,
  href = '/',
}: LogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const content = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* LordsOne Geometric L-1 Mark */}
      <div
        className={`${iconSizes[size]} bg-gradient-to-br from-brand-600 to-navy-900 rounded-xl flex items-center justify-center shadow-sm text-white shrink-0 relative overflow-hidden`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 drop-shadow"
        >
          {/* L Base */}
          <path
            d="M7 8V24H23V19H12V8H7Z"
            fill="currentColor"
            fillOpacity="0.95"
          />
          {/* 1 Ascending Pillar */}
          <path
            d="M17 8H22V24H17V8Z"
            fill="#60A5FA"
          />
          <path
            d="M14 11L18 8V12H14V11Z"
            fill="#93C5FD"
          />
        </svg>
      </div>

      <div className="flex flex-col leading-none">
        <div className="flex items-center tracking-tight">
          <span className={`font-bold text-navy-900 ${textSizes[size]}`}>
            Lords
          </span>
          <span className={`font-extrabold text-brand-600 ${textSizes[size]}`}>
            One
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mt-0.5">
            Campus Services
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}
