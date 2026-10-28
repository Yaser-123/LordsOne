'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Users, ArrowRight, Sparkles } from 'lucide-react';
import { Service } from '@/types/database';
import { CATEGORY_META, formatCurrency, cn } from '@/lib/utils/utils';

interface ServiceCardProps {
  service: Service;
  hrefPrefix?: string;
}

export function ServiceCard({
  service,
  hrefPrefix = '/services',
}: ServiceCardProps) {
  const [imageError, setImageError] = useState(false);

  const meta = CATEGORY_META[service.category] || {
    label: service.category,
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
    dotClass: 'bg-slate-600',
  };

  const detailUrl = `${hrefPrefix}/${service.slug}`;
  const hasValidImage = !!service.image_url && !imageError;

  return (
    <div className="group rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-card hover:shadow-md hover:border-slate-300 transition-all flex flex-col h-full">
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        {hasValidImage ? (
          <Image
            src={service.image_url!}
            alt={service.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/50 p-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-brand-600 mb-2">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-navy-900 line-clamp-1">{service.title}</span>
            <span className="text-[10px] text-slate-500 mt-0.5">{meta.label}</span>
          </div>
        )}

        {/* High-Contrast Category Badge overlay (100% visible on any background) */}
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-white/95 text-navy-950 border border-slate-200/90 shadow-md backdrop-blur-md">
            <span className={cn('w-2 h-2 rounded-full shrink-0', meta.dotClass)} />
            <span>{meta.label}</span>
          </span>
        </div>

        {/* Price Tag with dark high-contrast pill */}
        <div className="absolute bottom-3 right-3 z-10">
          <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-navy-950/95 text-white border border-white/20 backdrop-blur-sm shadow-md">
            {formatCurrency(Number(service.price))}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-navy-900 text-base line-clamp-1 group-hover:text-brand-600 transition-colors">
            {service.title}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{service.location}</span>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 mt-2.5 leading-relaxed">
            {service.description}
          </p>
        </div>

        {/* Footer Meta */}
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>Cap: {service.capacity}</span>
          </div>

          <Link
            href={detailUrl}
            className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 group-hover:text-brand-700 transition-colors"
          >
            <span>Book Slot</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
